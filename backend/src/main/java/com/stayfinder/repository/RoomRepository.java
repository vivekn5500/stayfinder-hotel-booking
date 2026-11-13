package com.stayfinder.repository;

import com.stayfinder.entity.Room;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {

    List<Room> findByHotelId(Long hotelId);

    List<Room> findByRoomTypeId(Long roomTypeId);

    List<Room> findByHotelIdAndStatus(Long hotelId, String status);

    Optional<Room> findByHotelIdAndRoomNumber(Long hotelId, String roomNumber);

    /**
     * Acquires an exclusive row-level lock (SELECT ... FOR UPDATE) on the Room record.
     * Guarantees safe physical room allocation and prevents concurrent race conditions.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM Room r WHERE r.id = :id")
    Optional<Room> findByIdWithLock(@Param("id") Long id);

    /**
     * Finds physical rooms for a given hotel that are currently AVAILABLE and have NO active bookings
     * overlapping the half-open interval [checkInDate, checkOutDate).
     */
    @Query("SELECT r FROM Room r " +
           "WHERE r.hotel.id = :hotelId " +
           "AND r.status = 'AVAILABLE' " +
           "AND r.id NOT IN (" +
           "    SELECT b.room.id FROM Booking b " +
           "    WHERE b.status <> 'CANCELLED' " +
           "    AND b.checkInDate < :checkOutDate " +
           "    AND b.checkOutDate > :checkInDate" +
           ")")
    List<Room> findAvailableRoomsByHotel(@Param("hotelId") Long hotelId,
                                        @Param("checkInDate") LocalDate checkInDate,
                                        @Param("checkOutDate") LocalDate checkOutDate);

    /**
     * Finds physical rooms for a given room type that are currently AVAILABLE and have NO active bookings
     * overlapping the half-open interval [checkInDate, checkOutDate).
     */
    @Query("SELECT r FROM Room r " +
           "WHERE r.roomType.id = :roomTypeId " +
           "AND r.status = 'AVAILABLE' " +
           "AND r.id NOT IN (" +
           "    SELECT b.room.id FROM Booking b " +
           "    WHERE b.status <> 'CANCELLED' " +
           "    AND b.checkInDate < :checkOutDate " +
           "    AND b.checkOutDate > :checkInDate" +
           ")")
    List<Room> findAvailableRoomsByRoomType(@Param("roomTypeId") Long roomTypeId,
                                           @Param("checkInDate") LocalDate checkInDate,
                                           @Param("checkOutDate") LocalDate checkOutDate);
}
