package com.stayfinder.service;

import com.stayfinder.dto.BookingRequestDto;
import com.stayfinder.dto.BookingResponseDto;
import com.stayfinder.dto.PriceCalculationDto;
import com.stayfinder.entity.Booking;
import com.stayfinder.entity.Hotel;
import com.stayfinder.entity.Room;
import com.stayfinder.entity.RoomType;
import com.stayfinder.exception.BookingCancellationException;
import com.stayfinder.exception.InvalidBookingDatesException;
import com.stayfinder.exception.ResourceNotFoundException;
import com.stayfinder.exception.RoomUnavailableException;
import com.stayfinder.repository.BookingRepository;
import com.stayfinder.repository.HotelRepository;
import com.stayfinder.repository.RoomRepository;
import com.stayfinder.repository.RoomTypeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private RoomTypeRepository roomTypeRepository;

    @Mock
    private HotelRepository hotelRepository;

    @InjectMocks
    private BookingServiceImpl bookingService;

    private Hotel hotel;
    private RoomType roomType;
    private Room room;

    @BeforeEach
    void setUp() {
        hotel = new Hotel("The Grand Azure", "Goa, India", "Beach Road", "Luxury resort");
        hotel.setId(1L);

        roomType = new RoomType(hotel, "Deluxe Ocean View", "Sea view", BigDecimal.valueOf(10000), 2);
        roomType.setId(10L);

        room = new Room(hotel, roomType, "101", 1, "AVAILABLE");
        room.setId(100L);
    }

    @Test
    @DisplayName("calculatePrice should accurately multiply price per night by number of nights")
    void calculatePrice_shouldCalculateCorrectly() {
        LocalDate checkIn = LocalDate.now().plusDays(10);
        LocalDate checkOut = LocalDate.now().plusDays(13); // 3 nights

        when(roomTypeRepository.findById(10L)).thenReturn(Optional.of(roomType));

        PriceCalculationDto priceDto = bookingService.calculatePrice(10L, checkIn, checkOut);

        assertThat(priceDto.getNumberOfNights()).isEqualTo(3);
        assertThat(priceDto.getPricePerNight()).isEqualByComparingTo("10000");
        assertThat(priceDto.getTotalAmount()).isEqualByComparingTo("30000");
    }

    @Test
    @DisplayName("calculatePrice should throw InvalidBookingDatesException when checkout is not after checkin")
    void calculatePrice_shouldThrowWhenDatesInvalid() {
        LocalDate checkIn = LocalDate.now().plusDays(10);
        LocalDate checkOut = LocalDate.now().plusDays(10); // 0 nights

        assertThatThrownBy(() -> bookingService.calculatePrice(10L, checkIn, checkOut))
                .isInstanceOf(InvalidBookingDatesException.class)
                .hasMessageContaining("must be strictly after check-in date");
    }

    @Test
    @DisplayName("calculatePrice should throw InvalidBookingDatesException when checkin is in the past")
    void calculatePrice_shouldThrowWhenCheckInInPast() {
        LocalDate checkIn = LocalDate.now().minusDays(1);
        LocalDate checkOut = LocalDate.now().plusDays(2);

        assertThatThrownBy(() -> bookingService.calculatePrice(10L, checkIn, checkOut))
                .isInstanceOf(InvalidBookingDatesException.class)
                .hasMessageContaining("cannot be in the past");
    }

    @Test
    @DisplayName("calculatePriceByRoom should calculate total and report available true when no overlapping bookings")
    void calculatePriceByRoom_shouldReturnCorrectPriceAndAvailableTrue() {
        LocalDate checkIn = LocalDate.now().plusDays(2);
        LocalDate checkOut = LocalDate.now().plusDays(5); // 3 nights

        when(roomRepository.findById(100L)).thenReturn(Optional.of(room));
        when(bookingRepository.findOverlappingBookings(100L, checkIn, checkOut)).thenReturn(Collections.emptyList());

        PriceCalculationDto dto = bookingService.calculatePriceByRoom(100L, checkIn, checkOut);

        assertThat(dto.getRoomId()).isEqualTo(100L);
        assertThat(dto.getRoomNumber()).isEqualTo("101");
        assertThat(dto.getNumberOfNights()).isEqualTo(3);
        assertThat(dto.getPricePerNight()).isEqualByComparingTo("10000");
        assertThat(dto.getTotalAmount()).isEqualByComparingTo("30000");
        assertThat(dto.getTotalPrice()).isEqualByComparingTo("30000");
        assertThat(dto.isAvailable()).isTrue();
    }

    @Test
    @DisplayName("calculatePriceByRoom should report available false when an overlapping booking exists")
    void calculatePriceByRoom_shouldReturnAvailableFalse_whenOverlapExists() {
        LocalDate checkIn = LocalDate.now().plusDays(2);
        LocalDate checkOut = LocalDate.now().plusDays(5);

        Booking existing = new Booking();
        existing.setStatus("CONFIRMED");

        when(roomRepository.findById(100L)).thenReturn(Optional.of(room));
        when(bookingRepository.findOverlappingBookings(100L, checkIn, checkOut)).thenReturn(List.of(existing));

        PriceCalculationDto dto = bookingService.calculatePriceByRoom(100L, checkIn, checkOut);

        assertThat(dto.getNumberOfNights()).isEqualTo(3);
        assertThat(dto.getTotalAmount()).isEqualByComparingTo("30000");
        assertThat(dto.isAvailable()).isFalse();
    }

    @Test
    @DisplayName("calculatePriceByRoom should report available false when room status is not AVAILABLE")
    void calculatePriceByRoom_shouldReturnAvailableFalse_whenRoomUnderMaintenance() {
        LocalDate checkIn = LocalDate.now().plusDays(2);
        LocalDate checkOut = LocalDate.now().plusDays(5);

        Room maintenanceRoom = new Room(hotel, roomType, "101", 1, "MAINTENANCE");
        maintenanceRoom.setId(100L);

        when(roomRepository.findById(100L)).thenReturn(Optional.of(maintenanceRoom));
        when(bookingRepository.findOverlappingBookings(100L, checkIn, checkOut)).thenReturn(Collections.emptyList());

        PriceCalculationDto dto = bookingService.calculatePriceByRoom(100L, checkIn, checkOut);

        assertThat(dto.isAvailable()).isFalse();
    }

    @Test
    @DisplayName("createBooking should succeed and allocate room when no overlap exists")
    void createBooking_shouldSucceedWhenAvailable() {
        LocalDate checkIn = LocalDate.now().plusDays(5);
        LocalDate checkOut = LocalDate.now().plusDays(8); // 3 nights

        BookingRequestDto request = new BookingRequestDto(
                100L,
                "Aditi Roy",
                "aditi.roy@example.com",
                "+91-9988776655",
                checkIn,
                checkOut
        );

        when(roomRepository.findByIdWithLock(100L)).thenReturn(Optional.of(room));
        when(bookingRepository.findOverlappingBookings(100L, checkIn, checkOut)).thenReturn(Collections.emptyList());
        when(bookingRepository.existsByBookingReference(anyString())).thenReturn(false);
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> {
            Booking b = invocation.getArgument(0);
            b.setId(500L);
            return b;
        });

        BookingResponseDto response = bookingService.createBooking(request);

        assertThat(response).isNotNull();
        assertThat(response.getBookingId()).isEqualTo(500L);
        assertThat(response.getGuestName()).isEqualTo("Aditi Roy");
        assertThat(response.getRoomNumber()).isEqualTo("101");
        assertThat(response.getNumberOfNights()).isEqualTo(3);
        assertThat(response.getTotalAmount()).isEqualByComparingTo("30000");
        assertThat(response.getStatus()).isEqualTo("CONFIRMED");
        assertThat(response.getBookingReference()).startsWith("SF-");

        verify(roomRepository).findByIdWithLock(100L);
        verify(bookingRepository).findOverlappingBookings(100L, checkIn, checkOut);
        verify(bookingRepository).save(any(Booking.class));
    }

    @Test
    @DisplayName("createBooking should reject and throw RoomUnavailableException when room has overlapping booking")
    void createBooking_shouldThrowWhenOverlapping() {
        LocalDate checkIn = LocalDate.now().plusDays(5);
        LocalDate checkOut = LocalDate.now().plusDays(8);

        Booking existing = new Booking("SF-EXISTING", "Other Guest", "other@example.com",
                room, checkIn, checkOut, BigDecimal.valueOf(30000), "CONFIRMED");

        BookingRequestDto request = new BookingRequestDto(
                100L,
                "Aditi Roy",
                "aditi.roy@example.com",
                null,
                checkIn,
                checkOut
        );

        when(roomRepository.findByIdWithLock(100L)).thenReturn(Optional.of(room));
        when(bookingRepository.findOverlappingBookings(100L, checkIn, checkOut)).thenReturn(List.of(existing));

        assertThatThrownBy(() -> bookingService.createBooking(request))
                .isInstanceOf(RoomUnavailableException.class)
                .hasMessageContaining("already booked for the requested dates");
    }

    @Test
    @DisplayName("createBooking should reject when room status is MAINTENANCE")
    void createBooking_shouldThrowWhenRoomNotAvailableStatus() {
        room.setStatus("MAINTENANCE");

        BookingRequestDto request = new BookingRequestDto(
                100L,
                "Aditi Roy",
                "aditi.roy@example.com",
                null,
                LocalDate.now().plusDays(2),
                LocalDate.now().plusDays(4)
        );

        when(roomRepository.findByIdWithLock(100L)).thenReturn(Optional.of(room));

        assertThatThrownBy(() -> bookingService.createBooking(request))
                .isInstanceOf(RoomUnavailableException.class)
                .hasMessageContaining("currently MAINTENANCE");
    }

    @Test
    @DisplayName("cancelBooking should set status to CANCELLED and return updated DTO")
    void cancelBooking_shouldSucceed() {
        Booking booking = new Booking("SF-CANCEL-TEST", "Guest", "guest@example.com",
                room, LocalDate.now().plusDays(5), LocalDate.now().plusDays(7),
                BigDecimal.valueOf(20000), "CONFIRMED");
        booking.setId(201L);

        when(bookingRepository.findByBookingReference("SF-CANCEL-TEST")).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(i -> i.getArgument(0));

        BookingResponseDto result = bookingService.cancelBooking("SF-CANCEL-TEST");

        assertThat(result.getStatus()).isEqualTo("CANCELLED");
        assertThat(booking.getStatus()).isEqualTo("CANCELLED");
        verify(bookingRepository).save(booking);
    }

    @Test
    @DisplayName("cancelBooking should throw BookingCancellationException if already cancelled")
    void cancelBooking_shouldThrowIfAlreadyCancelled() {
        Booking booking = new Booking("SF-ALREADY-CANCELLED", "Guest", "guest@example.com",
                room, LocalDate.now().plusDays(5), LocalDate.now().plusDays(7),
                BigDecimal.valueOf(20000), "CANCELLED");

        when(bookingRepository.findByBookingReference("SF-ALREADY-CANCELLED")).thenReturn(Optional.of(booking));

        assertThatThrownBy(() -> bookingService.cancelBooking("SF-ALREADY-CANCELLED"))
                .isInstanceOf(BookingCancellationException.class)
                .hasMessageContaining("already cancelled");
    }

    @Test
    @DisplayName("getBookingByReference should return DTO when found")
    void getBookingByReference_shouldReturnDto() {
        Booking booking = new Booking("SF-REF-100", "Guest", "guest@example.com",
                room, LocalDate.now().plusDays(5), LocalDate.now().plusDays(7),
                BigDecimal.valueOf(20000), "CONFIRMED");
        booking.setId(301L);

        when(bookingRepository.findByBookingReference("SF-REF-100")).thenReturn(Optional.of(booking));

        BookingResponseDto dto = bookingService.getBookingByReference("SF-REF-100");

        assertThat(dto.getBookingReference()).isEqualTo("SF-REF-100");
        assertThat(dto.getGuestName()).isEqualTo("Guest");
        assertThat(dto.getTotalAmount()).isEqualByComparingTo("20000");
    }
}
