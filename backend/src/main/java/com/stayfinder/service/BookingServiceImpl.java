package com.stayfinder.service;

import com.stayfinder.dto.BookingRequestDto;
import com.stayfinder.dto.BookingResponseDto;
import com.stayfinder.dto.PriceCalculationDto;
import com.stayfinder.dto.RoomAvailabilityDto;
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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class BookingServiceImpl implements BookingService {

    private static final String ALPHANUMERIC = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final int REF_RANDOM_LENGTH = 6;
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final DateTimeFormatter YYYYMM_FORMATTER = DateTimeFormatter.ofPattern("yyyyMM");

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final RoomTypeRepository roomTypeRepository;
    private final HotelRepository hotelRepository;

    public BookingServiceImpl(BookingRepository bookingRepository,
                              RoomRepository roomRepository,
                              RoomTypeRepository roomTypeRepository,
                              HotelRepository hotelRepository) {
        this.bookingRepository = bookingRepository;
        this.roomRepository = roomRepository;
        this.roomTypeRepository = roomTypeRepository;
        this.hotelRepository = hotelRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomAvailabilityDto> checkRoomAvailability(Long hotelId, LocalDate checkInDate, LocalDate checkOutDate) {
        validateBookingDates(checkInDate, checkOutDate);
        if (!hotelRepository.existsById(hotelId)) {
            throw new ResourceNotFoundException("Hotel not found with ID: " + hotelId);
        }

        List<Room> allHotelRooms = roomRepository.findByHotelId(hotelId);
        List<Room> availableRooms = roomRepository.findAvailableRoomsByHotel(hotelId, checkInDate, checkOutDate);
        Set<Long> availableRoomIds = availableRooms.stream().map(Room::getId).collect(Collectors.toSet());

        return allHotelRooms.stream()
                .sorted(Comparator.comparing(Room::getRoomNumber))
                .map(r -> new RoomAvailabilityDto(
                        r.getId(),
                        r.getRoomNumber(),
                        r.getFloorNumber(),
                        r.getRoomType().getId(),
                        r.getRoomType().getName(),
                        r.getRoomType().getBasePrice(),
                        r.getRoomType().getMaxOccupancy(),
                        availableRoomIds.contains(r.getId())
                ))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomAvailabilityDto> checkRoomAvailability(Long hotelId, LocalDate checkInDate, LocalDate checkOutDate, Integer guests) {
        List<RoomAvailabilityDto> all = checkRoomAvailability(hotelId, checkInDate, checkOutDate);
        if (guests == null || guests <= 1) {
            return all;
        }
        return all.stream()
                .filter(r -> r.getMaxOccupancy() >= guests)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomAvailabilityDto> checkRoomAvailabilityByType(Long roomTypeId, LocalDate checkInDate, LocalDate checkOutDate) {
        validateBookingDates(checkInDate, checkOutDate);
        RoomType roomType = roomTypeRepository.findById(roomTypeId)
                .orElseThrow(() -> new ResourceNotFoundException("Room type not found with ID: " + roomTypeId));

        List<Room> allRooms = roomRepository.findByRoomTypeId(roomTypeId);
        List<Room> availableRooms = roomRepository.findAvailableRoomsByRoomType(roomTypeId, checkInDate, checkOutDate);
        Set<Long> availableRoomIds = availableRooms.stream().map(Room::getId).collect(Collectors.toSet());

        return allRooms.stream()
                .sorted(Comparator.comparing(Room::getRoomNumber))
                .map(r -> new RoomAvailabilityDto(
                        r.getId(),
                        r.getRoomNumber(),
                        r.getFloorNumber(),
                        roomType.getId(),
                        roomType.getName(),
                        roomType.getBasePrice(),
                        roomType.getMaxOccupancy(),
                        availableRoomIds.contains(r.getId())
                ))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PriceCalculationDto calculatePrice(Long roomTypeId, LocalDate checkInDate, LocalDate checkOutDate) {
        validateBookingDates(checkInDate, checkOutDate);
        RoomType roomType = roomTypeRepository.findById(roomTypeId)
                .orElseThrow(() -> new ResourceNotFoundException("Room type not found with ID: " + roomTypeId));

        long nights = ChronoUnit.DAYS.between(checkInDate, checkOutDate);
        BigDecimal totalAmount = roomType.getBasePrice().multiply(BigDecimal.valueOf(nights));

        List<Room> availableRooms = roomRepository.findAvailableRoomsByRoomType(roomTypeId, checkInDate, checkOutDate);
        boolean isAvailable = !availableRooms.isEmpty();

        PriceCalculationDto dto = new PriceCalculationDto(
                roomType.getId(),
                roomType.getName(),
                roomType.getBasePrice(),
                checkInDate,
                checkOutDate,
                nights,
                totalAmount
        );
        dto.setAvailable(isAvailable);
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public PriceCalculationDto calculatePriceByRoom(Long roomId, LocalDate checkInDate, LocalDate checkOutDate) {
        validateBookingDates(checkInDate, checkOutDate);
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: " + roomId));

        RoomType roomType = room.getRoomType();
        long nights = ChronoUnit.DAYS.between(checkInDate, checkOutDate);
        BigDecimal pricePerNight = roomType.getBasePrice();
        BigDecimal totalAmount = pricePerNight.multiply(BigDecimal.valueOf(nights));

        boolean isRoomOperational = "AVAILABLE".equalsIgnoreCase(room.getStatus());
        List<Booking> overlapping = bookingRepository.findOverlappingBookings(roomId, checkInDate, checkOutDate);
        boolean isAvailable = isRoomOperational && overlapping.isEmpty();

        return new PriceCalculationDto(
                room.getId(),
                room.getRoomNumber(),
                roomType.getId(),
                roomType.getName(),
                pricePerNight,
                checkInDate,
                checkOutDate,
                nights,
                totalAmount,
                isAvailable
        );
    }

    /**
     * Creates a new physical room booking with pessimistic write concurrency locking.
     * Prevents duplicate bookings and overbooking of the same physical room.
     */
    @Override
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public BookingResponseDto createBooking(BookingRequestDto request) {
        if (request == null) {
            throw new IllegalArgumentException("Booking request cannot be null.");
        }
        validateBookingDates(request.getCheckInDate(), request.getCheckOutDate());
        validateGuestInfo(request.getGuestName(), request.getGuestEmail());

        if (request.getRoomId() == null) {
            throw new IllegalArgumentException("Physical room ID is required.");
        }

        // 1. Acquire exclusive pessimistic write lock on the physical room record (SELECT ... FOR UPDATE)
        Room room = roomRepository.findByIdWithLock(request.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: " + request.getRoomId()));

        // 2. Validate physical room operational status
        if (!"AVAILABLE".equalsIgnoreCase(room.getStatus())) {
            throw new RoomUnavailableException("Room " + room.getRoomNumber() + " is currently " + room.getStatus() + " and cannot be booked.");
        }

        // 3. Check for overlapping active bookings inside the exclusive lock
        List<Booking> overlapping = bookingRepository.findOverlappingBookings(
                room.getId(),
                request.getCheckInDate(),
                request.getCheckOutDate()
        );

        if (!overlapping.isEmpty()) {
            throw new RoomUnavailableException("Room " + room.getRoomNumber() +
                    " is already booked for the requested dates: " +
                    request.getCheckInDate() + " to " + request.getCheckOutDate());
        }

        // 4. Calculate total amount
        long nights = ChronoUnit.DAYS.between(request.getCheckInDate(), request.getCheckOutDate());
        BigDecimal pricePerNight = room.getRoomType().getBasePrice();
        BigDecimal totalAmount = pricePerNight.multiply(BigDecimal.valueOf(nights));

        // 5. Generate guaranteed unique booking reference
        String reference = generateUniqueBookingReference();

        // 6. Persist booking
        Booking booking = new Booking();
        booking.setBookingReference(reference);
        booking.setGuestName(request.getGuestName().trim());
        booking.setGuestEmail(request.getGuestEmail().trim().toLowerCase());
        booking.setGuestPhone(request.getGuestPhone() != null ? request.getGuestPhone().trim() : null);
        booking.setRoom(room);
        booking.setCheckInDate(request.getCheckInDate());
        booking.setCheckOutDate(request.getCheckOutDate());
        booking.setTotalAmount(totalAmount);
        booking.setStatus("CONFIRMED");

        Booking saved = bookingRepository.save(booking);

        return mapToResponseDto(saved, nights, pricePerNight);
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponseDto getBookingByReference(String bookingReference) {
        if (bookingReference == null || bookingReference.trim().isEmpty()) {
            throw new IllegalArgumentException("Booking reference cannot be empty.");
        }
        Booking booking = bookingRepository.findByBookingReference(bookingReference.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with reference: " + bookingReference));

        long nights = ChronoUnit.DAYS.between(booking.getCheckInDate(), booking.getCheckOutDate());
        BigDecimal pricePerNight = booking.getRoom().getRoomType().getBasePrice();

        return mapToResponseDto(booking, nights, pricePerNight);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponseDto> getBookingsByGuestEmail(String guestEmail) {
        if (guestEmail == null || guestEmail.trim().isEmpty()) {
            throw new IllegalArgumentException("Guest email cannot be empty.");
        }
        List<Booking> bookings = bookingRepository.findByGuestEmailIgnoreCase(guestEmail.trim());

        return bookings.stream()
                .map(b -> {
                    long nights = ChronoUnit.DAYS.between(b.getCheckInDate(), b.getCheckOutDate());
                    BigDecimal pricePerNight = b.getRoom().getRoomType().getBasePrice();
                    return mapToResponseDto(b, nights, pricePerNight);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public BookingResponseDto cancelBooking(String bookingReference) {
        if (bookingReference == null || bookingReference.trim().isEmpty()) {
            throw new IllegalArgumentException("Booking reference cannot be empty.");
        }
        Booking booking = bookingRepository.findByBookingReference(bookingReference.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with reference: " + bookingReference));

        if ("CANCELLED".equalsIgnoreCase(booking.getStatus())) {
            throw new BookingCancellationException("Booking " + bookingReference + " is already cancelled.");
        }
        if ("COMPLETED".equalsIgnoreCase(booking.getStatus())) {
            throw new BookingCancellationException("Completed bookings cannot be cancelled.");
        }

        booking.setStatus("CANCELLED");
        Booking updated = bookingRepository.save(booking);

        long nights = ChronoUnit.DAYS.between(updated.getCheckInDate(), updated.getCheckOutDate());
        BigDecimal pricePerNight = updated.getRoom().getRoomType().getBasePrice();

        return mapToResponseDto(updated, nights, pricePerNight);
    }

    private void validateBookingDates(LocalDate checkInDate, LocalDate checkOutDate) {
        if (checkInDate == null || checkOutDate == null) {
            throw new InvalidBookingDatesException("Check-in and check-out dates are required.");
        }
        if (checkInDate.isBefore(LocalDate.now())) {
            throw new InvalidBookingDatesException("Check-in date cannot be in the past: " + checkInDate);
        }
        if (!checkOutDate.isAfter(checkInDate)) {
            throw new InvalidBookingDatesException("Check-out date (" + checkOutDate +
                    ") must be strictly after check-in date (" + checkInDate + ").");
        }
    }

    private void validateGuestInfo(String guestName, String guestEmail) {
        if (guestName == null || guestName.trim().isEmpty()) {
            throw new IllegalArgumentException("Guest name is required.");
        }
        if (guestEmail == null || guestEmail.trim().isEmpty() || !guestEmail.contains("@")) {
            throw new IllegalArgumentException("A valid guest email is required.");
        }
    }

    private String generateUniqueBookingReference() {
        String yearMonth = YearMonth.now().format(YYYYMM_FORMATTER);
        for (int i = 0; i < 10; i++) {
            StringBuilder sb = new StringBuilder("SF-").append(yearMonth).append("-");
            for (int j = 0; j < REF_RANDOM_LENGTH; j++) {
                sb.append(ALPHANUMERIC.charAt(RANDOM.nextInt(ALPHANUMERIC.length())));
            }
            String candidate = sb.toString();
            if (!bookingRepository.existsByBookingReference(candidate)) {
                return candidate;
            }
        }
        throw new IllegalStateException("Failed to generate a unique booking reference after multiple attempts.");
    }

    private BookingResponseDto mapToResponseDto(Booking booking, long nights, BigDecimal pricePerNight) {
        Room room = booking.getRoom();
        RoomType roomType = room.getRoomType();
        Hotel hotel = room.getHotel();

        return new BookingResponseDto(
                booking.getId(),
                booking.getBookingReference(),
                booking.getGuestName(),
                booking.getGuestEmail(),
                booking.getGuestPhone(),
                hotel.getId(),
                hotel.getName(),
                hotel.getLocation(),
                room.getId(),
                room.getRoomNumber(),
                roomType.getName(),
                booking.getCheckInDate(),
                booking.getCheckOutDate(),
                nights,
                pricePerNight,
                booking.getTotalAmount(),
                booking.getStatus(),
                booking.getCreatedAt()
        );
    }
}
