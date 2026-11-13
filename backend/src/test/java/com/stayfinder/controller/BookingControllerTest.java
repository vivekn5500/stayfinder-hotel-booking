package com.stayfinder.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stayfinder.dto.BookingRequestDto;
import com.stayfinder.dto.BookingResponseDto;
import com.stayfinder.dto.PriceCalculationDto;
import com.stayfinder.dto.PriceCalculationRequest;
import com.stayfinder.exception.BookingCancellationException;
import com.stayfinder.exception.InvalidBookingDatesException;
import com.stayfinder.exception.ResourceNotFoundException;
import com.stayfinder.exception.RoomUnavailableException;
import com.stayfinder.service.BookingService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(BookingController.class)
class BookingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private BookingService bookingService;

    @Test
    @DisplayName("POST /api/v1/bookings/calculate-price should return 200 OK with nights and total")
    void calculatePrice_shouldReturnPriceCalculation() throws Exception {
        LocalDate checkIn = LocalDate.now().plusDays(5);
        LocalDate checkOut = LocalDate.now().plusDays(8);

        PriceCalculationRequest request = new PriceCalculationRequest(1L, checkIn, checkOut);
        PriceCalculationDto calculation = new PriceCalculationDto(
                10L, "Deluxe Ocean View", BigDecimal.valueOf(18500), checkIn, checkOut, 3, BigDecimal.valueOf(55500)
        );

        when(bookingService.calculatePriceByRoom(eq(1L), eq(checkIn), eq(checkOut)))
                .thenReturn(calculation);

        mockMvc.perform(post("/api/v1/bookings/calculate-price")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.numberOfNights", is(3)))
                .andExpect(jsonPath("$.pricePerNight", is(18500)))
                .andExpect(jsonPath("$.totalAmount", is(55500)))
                .andExpect(jsonPath("$.totalPrice", is(55500)))
                .andExpect(jsonPath("$.available", is(true)));
    }

    @Test
    @DisplayName("POST /api/v1/bookings/calculate-price should return 400 Bad Request on invalid dates")
    void calculatePrice_shouldReturn400OnInvalidDates() throws Exception {
        LocalDate checkIn = LocalDate.now().plusDays(10);
        LocalDate checkOut = LocalDate.now().plusDays(5);

        PriceCalculationRequest request = new PriceCalculationRequest(1L, checkIn, checkOut);

        when(bookingService.calculatePriceByRoom(eq(1L), eq(checkIn), eq(checkOut)))
                .thenThrow(new InvalidBookingDatesException("Check-out date must be strictly after check-in date."));

        mockMvc.perform(post("/api/v1/bookings/calculate-price")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.message", containsString("Check-out date must be strictly after check-in date.")));
    }

    @Test
    @DisplayName("POST /api/v1/bookings should return 201 Created with Location header and booking details")
    void createBooking_shouldReturn201Created() throws Exception {
        LocalDate checkIn = LocalDate.now().plusDays(5);
        LocalDate checkOut = LocalDate.now().plusDays(8);

        BookingRequestDto request = new BookingRequestDto(
                1L, "Rohit Sharma", "rohit@example.com", "+91-9876543210", checkIn, checkOut
        );

        BookingResponseDto response = new BookingResponseDto(
                1001L, "SF-202611-ABC123", "Rohit Sharma", "rohit@example.com", "+91-9876543210",
                1L, "Grand Azure", "Goa, India", 1L, "101", "Deluxe Ocean View",
                checkIn, checkOut, 3, BigDecimal.valueOf(18500), BigDecimal.valueOf(55500),
                "CONFIRMED", LocalDateTime.now()
        );

        when(bookingService.createBooking(any(BookingRequestDto.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", containsString("/api/v1/bookings/SF-202611-ABC123")))
                .andExpect(jsonPath("$.bookingReference", is("SF-202611-ABC123")))
                .andExpect(jsonPath("$.guestName", is("Rohit Sharma")))
                .andExpect(jsonPath("$.status", is("CONFIRMED")))
                .andExpect(jsonPath("$.totalAmount", is(55500)));
    }

    @Test
    @DisplayName("POST /api/v1/bookings should return 400 Bad Request when request body has validation errors")
    void createBooking_shouldReturn400OnValidationErrors() throws Exception {
        BookingRequestDto invalidRequest = new BookingRequestDto(); // Missing all mandatory fields

        mockMvc.perform(post("/api/v1/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.error", is("Bad Request")))
                .andExpect(jsonPath("$.details", notNullValue()));
    }

    @Test
    @DisplayName("POST /api/v1/bookings should return 409 Conflict when room has overlapping booking")
    void createBooking_shouldReturn409OnConflict() throws Exception {
        LocalDate checkIn = LocalDate.now().plusDays(5);
        LocalDate checkOut = LocalDate.now().plusDays(8);

        BookingRequestDto request = new BookingRequestDto(
                1L, "Rohit Sharma", "rohit@example.com", null, checkIn, checkOut
        );

        when(bookingService.createBooking(any(BookingRequestDto.class)))
                .thenThrow(new RoomUnavailableException("Room 101 is already booked for the requested dates."));

        mockMvc.perform(post("/api/v1/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status", is(409)))
                .andExpect(jsonPath("$.error", is("Conflict")))
                .andExpect(jsonPath("$.message", containsString("already booked")));
    }

    @Test
    @DisplayName("GET /api/v1/bookings/{reference} should return 200 OK with booking details")
    void getBookingByReference_shouldReturnBooking() throws Exception {
        LocalDate checkIn = LocalDate.now().plusDays(5);
        LocalDate checkOut = LocalDate.now().plusDays(8);

        BookingResponseDto response = new BookingResponseDto(
                1001L, "SF-202611-ABC123", "Rohit Sharma", "rohit@example.com", "+91-9876543210",
                1L, "Grand Azure", "Goa, India", 1L, "101", "Deluxe Ocean View",
                checkIn, checkOut, 3, BigDecimal.valueOf(18500), BigDecimal.valueOf(55500),
                "CONFIRMED", LocalDateTime.now()
        );

        when(bookingService.getBookingByReference("SF-202611-ABC123")).thenReturn(response);

        mockMvc.perform(get("/api/v1/bookings/SF-202611-ABC123")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.bookingReference", is("SF-202611-ABC123")))
                .andExpect(jsonPath("$.guestName", is("Rohit Sharma")));
    }

    @Test
    @DisplayName("GET /api/v1/bookings/{reference} should return 404 Not Found when reference does not exist")
    void getBookingByReference_shouldReturn404WhenNotFound() throws Exception {
        when(bookingService.getBookingByReference("SF-UNKNOWN"))
                .thenThrow(new ResourceNotFoundException("Booking not found with reference: SF-UNKNOWN"));

        mockMvc.perform(get("/api/v1/bookings/SF-UNKNOWN")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status", is(404)))
                .andExpect(jsonPath("$.message", containsString("Booking not found")));
    }

    @Test
    @DisplayName("GET /api/v1/bookings?email={email} should return 200 OK with guest booking list")
    void getBookingsByEmail_shouldReturnBookingsList() throws Exception {
        LocalDate checkIn = LocalDate.now().plusDays(5);
        LocalDate checkOut = LocalDate.now().plusDays(8);

        BookingResponseDto b1 = new BookingResponseDto(
                1001L, "SF-202611-ABC123", "Rohit Sharma", "rohit@example.com", null,
                1L, "Grand Azure", "Goa, India", 1L, "101", "Deluxe Ocean View",
                checkIn, checkOut, 3, BigDecimal.valueOf(18500), BigDecimal.valueOf(55500),
                "CONFIRMED", LocalDateTime.now()
        );

        when(bookingService.getBookingsByGuestEmail("rohit@example.com"))
                .thenReturn(List.of(b1));

        mockMvc.perform(get("/api/v1/bookings")
                        .param("email", "rohit@example.com")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].bookingReference", is("SF-202611-ABC123")));
    }

    @Test
    @DisplayName("PATCH /api/v1/bookings/{reference}/cancel should return 200 OK with CANCELLED status")
    void cancelBooking_shouldReturnCancelledBooking() throws Exception {
        LocalDate checkIn = LocalDate.now().plusDays(5);
        LocalDate checkOut = LocalDate.now().plusDays(8);

        BookingResponseDto cancelled = new BookingResponseDto(
                1001L, "SF-202611-ABC123", "Rohit Sharma", "rohit@example.com", null,
                1L, "Grand Azure", "Goa, India", 1L, "101", "Deluxe Ocean View",
                checkIn, checkOut, 3, BigDecimal.valueOf(18500), BigDecimal.valueOf(55500),
                "CANCELLED", LocalDateTime.now()
        );

        when(bookingService.cancelBooking("SF-202611-ABC123")).thenReturn(cancelled);

        mockMvc.perform(patch("/api/v1/bookings/SF-202611-ABC123/cancel")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("CANCELLED")));
    }

    @Test
    @DisplayName("PATCH /api/v1/bookings/{reference}/cancel should return 400 Bad Request when already cancelled")
    void cancelBooking_shouldReturn400WhenAlreadyCancelled() throws Exception {
        when(bookingService.cancelBooking("SF-ALREADY-CANCELLED"))
                .thenThrow(new BookingCancellationException("Booking is already cancelled."));

        mockMvc.perform(patch("/api/v1/bookings/SF-ALREADY-CANCELLED/cancel")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.message", containsString("already cancelled")));
    }
}
