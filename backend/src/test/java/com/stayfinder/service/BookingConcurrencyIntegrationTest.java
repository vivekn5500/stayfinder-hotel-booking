package com.stayfinder.service;

import com.stayfinder.dto.BookingRequestDto;
import com.stayfinder.dto.BookingResponseDto;
import com.stayfinder.dto.RoomAvailabilityDto;
import com.stayfinder.entity.Booking;
import com.stayfinder.exception.RoomUnavailableException;
import com.stayfinder.repository.BookingRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:mysql://${DB_HOST:localhost}:${DB_PORT:3306}/${DB_NAME:stayfinder_db}?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC",
        "spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver",
        "spring.datasource.username=${DB_USERNAME:stayfinder_app}",
        "spring.datasource.password=${DB_PASSWORD:}",
        "spring.flyway.enabled=true",
        "spring.flyway.url=jdbc:mysql://${DB_HOST:localhost}:${DB_PORT:3306}/${DB_NAME:stayfinder_db}?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC",
        "spring.flyway.user=${DB_MIGRATION_USERNAME:${DB_USERNAME:stayfinder_app}}",
        "spring.flyway.password=${DB_MIGRATION_PASSWORD:${DB_PASSWORD:}}",
        "spring.jpa.hibernate.ddl-auto=validate",
        "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect"
})
class BookingConcurrencyIntegrationTest {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private BookingRepository bookingRepository;

    @Test
    @DisplayName("Concurrency: Simultaneous booking attempts for same room (V-01, roomId=4) and overlapping dates result in exactly 1 active confirmed booking")
    void testConcurrentBookingPrevention() throws Exception {
        Long targetRoomId = 4L; // Room V-01 (Azure Presidential Villa, Hotel ID: 1)
        LocalDate checkIn = LocalDate.of(2026, 11, 15);
        LocalDate checkOut = LocalDate.of(2026, 11, 18);

        int numberOfThreads = 2;
        ExecutorService executor = Executors.newFixedThreadPool(numberOfThreads);
        CountDownLatch readyLatch = new CountDownLatch(numberOfThreads);
        CountDownLatch startLatch = new CountDownLatch(1);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failureCount = new AtomicInteger(0);
        List<String> confirmedReferences = Collections.synchronizedList(new ArrayList<>());
        List<Throwable> unexpectedErrors = Collections.synchronizedList(new ArrayList<>());

        List<Future<?>> futures = new ArrayList<>();

        // Create two distinct booking requests for the same physical room and dates
        BookingRequestDto request1 = new BookingRequestDto(
                targetRoomId,
                "Concurrent Guest Alpha",
                "concurrent.alpha@example.com",
                "+91-9988776601",
                checkIn,
                checkOut
        );

        BookingRequestDto request2 = new BookingRequestDto(
                targetRoomId,
                "Concurrent Guest Beta",
                "concurrent.beta@example.com",
                "+91-9988776602",
                checkIn,
                checkOut
        );

        List<BookingRequestDto> requests = List.of(request1, request2);

        try {
            for (int i = 0; i < numberOfThreads; i++) {
                final BookingRequestDto currentRequest = requests.get(i);

                futures.add(executor.submit(() -> {
                    readyLatch.countDown();
                    try {
                        startLatch.await(); // Synchronize thread release for concurrent execution
                        BookingResponseDto response = bookingService.createBooking(currentRequest);
                        successCount.incrementAndGet();
                        confirmedReferences.add(response.getBookingReference());
                    } catch (RoomUnavailableException e) {
                        failureCount.incrementAndGet();
                    } catch (Exception e) {
                        if (e.getCause() instanceof RoomUnavailableException) {
                            failureCount.incrementAndGet();
                        } else {
                            unexpectedErrors.add(e);
                        }
                    }
                }));
            }

            // Wait until both threads are queued and ready
            readyLatch.await(5, TimeUnit.SECONDS);
            // Release both threads simultaneously
            startLatch.countDown();

            for (Future<?> f : futures) {
                f.get(10, TimeUnit.SECONDS);
            }

            // 1. Verify no unexpected errors occurred
            assertThat(unexpectedErrors).as("Unexpected errors during concurrent booking execution").isEmpty();

            // 2. Exactly one booking succeeds and one is rejected as unavailable
            assertThat(successCount.get()).as("Successful booking count").isEqualTo(1);
            assertThat(failureCount.get()).as("Rejected booking count").isEqualTo(1);
            assertThat(confirmedReferences).as("Confirmed booking references count").hasSize(1);

            // 3. Verify the database contains exactly ONE active CONFIRMED booking for that room and date range
            List<Booking> activeBookings = bookingRepository.findOverlappingBookings(targetRoomId, checkIn, checkOut);
            assertThat(activeBookings).as("Active bookings in database for room and dates").hasSize(1);

            Booking activeBooking = activeBookings.get(0);
            assertThat(activeBooking.getStatus()).isEqualTo("CONFIRMED");
            assertThat(activeBooking.getBookingReference()).isEqualTo(confirmedReferences.get(0));
            assertThat(activeBooking.getRoom().getId()).isEqualTo(targetRoomId);
            assertThat(activeBooking.getCheckInDate()).isEqualTo(checkIn);
            assertThat(activeBooking.getCheckOutDate()).isEqualTo(checkOut);

            // 4. Verify room availability via service reports room as unavailable during stay
            List<RoomAvailabilityDto> availabilityDuringStay = bookingService.checkRoomAvailability(1L, checkIn, checkOut);
            RoomAvailabilityDto bookedRoomDto = availabilityDuringStay.stream()
                    .filter(r -> r.getRoomId().equals(targetRoomId))
                    .findFirst()
                    .orElseThrow();
            assertThat(bookedRoomDto.isAvailable()).isFalse();

        } finally {
            executor.shutdown();

            // 5. Clean up test data: delete test-generated booking(s) only
            for (String ref : confirmedReferences) {
                bookingRepository.findByBookingReference(ref).ifPresent(bookingRepository::delete);
            }
        }

        // 6. Verify post-cleanup state: room 4 is available again and no active bookings remain for those dates
        List<Booking> postCleanupBookings = bookingRepository.findOverlappingBookings(targetRoomId, checkIn, checkOut);
        assertThat(postCleanupBookings).as("Active bookings after cleanup").isEmpty();

        List<RoomAvailabilityDto> postCleanupAvailability = bookingService.checkRoomAvailability(1L, checkIn, checkOut);
        RoomAvailabilityDto postCleanupRoomDto = postCleanupAvailability.stream()
                .filter(r -> r.getRoomId().equals(targetRoomId))
                .findFirst()
                .orElseThrow();
        assertThat(postCleanupRoomDto.isAvailable()).isTrue();

        // 7. Verify seeded reservations and user reservations remain completely intact
        assertThat(bookingRepository.findByBookingReference("SF-202611-1001")).isPresent();
        assertThat(bookingRepository.findByBookingReference("SF-202611-1002")).isPresent();
        assertThat(bookingRepository.findByBookingReference("SF-202611-1003")).isPresent();
        assertThat(bookingRepository.findByBookingReference("SF-202611-BCKB7N")).isPresent();
    }
}
