package com.stayfinder.repository;

import com.stayfinder.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    Optional<Booking> findByBookingReference(String bookingReference);

    boolean existsByBookingReference(String bookingReference);

    List<Booking> findByGuestEmailIgnoreCase(String guestEmail);

    List<Booking> findByRoomId(Long roomId);

    List<Booking> findByStatus(String status);

    /**
     * Finds active (non-cancelled) bookings for a specific room that overlap with the requested dates.
     * Uses half-open interval semantics [checkInDate, checkOutDate):
     * Two intervals overlap if and only if b.checkInDate < :checkOutDate AND b.checkOutDate > :checkInDate.
     */
    @Query("SELECT b FROM Booking b WHERE b.room.id = :roomId " +
           "AND b.status <> 'CANCELLED' " +
           "AND b.checkInDate < :checkOutDate " +
           "AND b.checkOutDate > :checkInDate")
    List<Booking> findOverlappingBookings(@Param("roomId") Long roomId,
                                         @Param("checkInDate") LocalDate checkInDate,
                                         @Param("checkOutDate") LocalDate checkOutDate);
}
