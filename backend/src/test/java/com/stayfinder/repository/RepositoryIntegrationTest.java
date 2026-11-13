package com.stayfinder.repository;

import com.stayfinder.entity.Amenity;
import com.stayfinder.entity.Booking;
import com.stayfinder.entity.Hotel;
import com.stayfinder.entity.HotelAmenity;
import com.stayfinder.entity.Room;
import com.stayfinder.entity.RoomType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

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
@Transactional
class RepositoryIntegrationTest {

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private AmenityRepository amenityRepository;

    @Autowired
    private HotelAmenityRepository hotelAmenityRepository;

    @Autowired
    private RoomTypeRepository roomTypeRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Test
    @DisplayName("HotelRepository: pagination and location search")
    void testHotelPaginationAndSearch() {
        Page<Hotel> firstPage = hotelRepository.findAll(PageRequest.of(0, 3));
        assertThat(firstPage.getContent()).hasSize(3);
        assertThat(firstPage.getTotalElements()).isEqualTo(5);
        assertThat(firstPage.getTotalPages()).isEqualTo(2);

        Page<Hotel> goaHotels = hotelRepository.findByLocationContainingIgnoreCase("Goa", PageRequest.of(0, 10));
        assertThat(goaHotels.getContent()).hasSize(1);
        assertThat(goaHotels.getContent().get(0).getName()).isEqualTo("The Grand Azure Resort & Spa");

        Page<Hotel> searchResult = hotelRepository.findByNameContainingIgnoreCase("Haveli", PageRequest.of(0, 10));
        assertThat(searchResult.getContent()).hasSize(1);
        assertThat(searchResult.getContent().get(0).getLocation()).contains("Jaipur");
    }

    @Test
    @DisplayName("AmenityRepository: lookup and collections")
    void testAmenityRepository() {
        Optional<Amenity> wifi = amenityRepository.findByName("High-Speed Wi-Fi");
        assertThat(wifi).isPresent();
        assertThat(wifi.get().getIcon()).isEqualTo("wifi");

        List<Amenity> filtered = amenityRepository.findByNameIn(List.of("Swimming Pool", "Free Parking"));
        assertThat(filtered).hasSize(2);
        assertThat(amenityRepository.count()).isEqualTo(10);
    }

    @Test
    @DisplayName("HotelAmenityRepository: many-to-many relationship")
    void testHotelAmenityRepository() {
        List<HotelAmenity> hotel1Amenities = hotelAmenityRepository.findByHotelId(1L);
        assertThat(hotel1Amenities).isNotEmpty();
        assertThat(hotel1Amenities).allMatch(ha -> ha.getHotel().getId().equals(1L));
        assertThat(hotel1Amenities).allMatch(ha -> ha.getAmenity() != null);

        List<HotelAmenity> wifiHotels = hotelAmenityRepository.findByAmenityId(1L);
        assertThat(wifiHotels).hasSize(5); // All 5 hotels have Wi-Fi
    }

    @Test
    @DisplayName("RoomTypeRepository: hotel room categories")
    void testRoomTypeRepository() {
        List<RoomType> hotel1RoomTypes = roomTypeRepository.findByHotelId(1L);
        assertThat(hotel1RoomTypes).hasSize(2);
        assertThat(hotel1RoomTypes).extracting(RoomType::getName)
                .containsExactlyInAnyOrder("Deluxe Ocean View", "Azure Presidential Villa");

        List<RoomType> familyRooms = roomTypeRepository.findByHotelIdAndMaxOccupancyGreaterThanEqual(1L, 4);
        assertThat(familyRooms).hasSize(1);
        assertThat(familyRooms.get(0).getName()).isEqualTo("Azure Presidential Villa");
    }

    @Test
    @DisplayName("RoomRepository: physical rooms and unique constraints")
    void testRoomRepository() {
        List<Room> hotel1Rooms = roomRepository.findByHotelId(1L);
        assertThat(hotel1Rooms).hasSize(5);

        Optional<Room> room101 = roomRepository.findByHotelIdAndRoomNumber(1L, "101");
        assertThat(room101).isPresent();
        assertThat(room101.get().getStatus()).isEqualTo("AVAILABLE");
        assertThat(room101.get().getFloorNumber()).isEqualTo(1);
    }

    @Test
    @DisplayName("BookingRepository: reference lookup and overlapping-stay validation")
    void testBookingRepositoryAndOverlapLogic() {
        Optional<Booking> booking = bookingRepository.findByBookingReference("SF-202611-1001");
        assertThat(booking).isPresent();
        assertThat(booking.get().getGuestName()).isEqualTo("Arjun Sharma");
        assertThat(booking.get().getStatus()).isEqualTo("CONFIRMED");

        Long roomId = booking.get().getRoom().getId(); // Room 1

        // 1. Exact overlap with existing booking [2026-12-15 to 2026-12-18]
        List<Booking> overlapping = bookingRepository.findOverlappingBookings(
                roomId,
                LocalDate.of(2026, 12, 16),
                LocalDate.of(2026, 12, 17)
        );
        assertThat(overlapping).hasSize(1);
        assertThat(overlapping.get(0).getBookingReference()).isEqualTo("SF-202611-1001");

        // 2. Non-overlapping: Requested checkout on or before check-in date
        List<Booking> beforeBooking = bookingRepository.findOverlappingBookings(
                roomId,
                LocalDate.of(2026, 12, 10),
                LocalDate.of(2026, 12, 15)
        );
        assertThat(beforeBooking).isEmpty();

        // 3. Non-overlapping: Requested check-in on or after check-out date
        List<Booking> afterBooking = bookingRepository.findOverlappingBookings(
                roomId,
                LocalDate.of(2026, 12, 18),
                LocalDate.of(2026, 12, 22)
        );
        assertThat(afterBooking).isEmpty();

        // 4. Cancelled booking on room 11 does not block availability
        Optional<Booking> cancelledBooking = bookingRepository.findByBookingReference("SF-202611-1003");
        assertThat(cancelledBooking).isPresent();
        assertThat(cancelledBooking.get().getStatus()).isEqualTo("CANCELLED");

        List<Booking> cancelledOverlap = bookingRepository.findOverlappingBookings(
                cancelledBooking.get().getRoom().getId(),
                LocalDate.of(2026, 11, 25),
                LocalDate.of(2026, 11, 27)
        );
        assertThat(cancelledOverlap).isEmpty(); // Cancelled booking is excluded!
    }
}
