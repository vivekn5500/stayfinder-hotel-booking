package com.stayfinder.service;

import com.stayfinder.dto.BookingRequestDto;
import com.stayfinder.dto.BookingResponseDto;
import com.stayfinder.dto.PriceCalculationDto;
import com.stayfinder.dto.RoomAvailabilityDto;

import java.time.LocalDate;
import java.util.List;

public interface BookingService {

    List<RoomAvailabilityDto> checkRoomAvailability(Long hotelId, LocalDate checkInDate, LocalDate checkOutDate);

    List<RoomAvailabilityDto> checkRoomAvailability(Long hotelId, LocalDate checkInDate, LocalDate checkOutDate, Integer guests);

    List<RoomAvailabilityDto> checkRoomAvailabilityByType(Long roomTypeId, LocalDate checkInDate, LocalDate checkOutDate);

    PriceCalculationDto calculatePrice(Long roomTypeId, LocalDate checkInDate, LocalDate checkOutDate);

    PriceCalculationDto calculatePriceByRoom(Long roomId, LocalDate checkInDate, LocalDate checkOutDate);

    BookingResponseDto createBooking(BookingRequestDto request);

    BookingResponseDto getBookingByReference(String bookingReference);

    List<BookingResponseDto> getBookingsByGuestEmail(String guestEmail);

    BookingResponseDto cancelBooking(String bookingReference);
}
