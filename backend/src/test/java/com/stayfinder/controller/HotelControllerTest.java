package com.stayfinder.controller;

import com.stayfinder.dto.AmenityDto;
import com.stayfinder.dto.HotelDetailDto;
import com.stayfinder.dto.HotelSummaryDto;
import com.stayfinder.dto.RoomAvailabilityDto;
import com.stayfinder.dto.RoomTypeDto;
import com.stayfinder.exception.InvalidBookingDatesException;
import com.stayfinder.exception.ResourceNotFoundException;
import com.stayfinder.service.BookingService;
import com.stayfinder.service.HotelService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(HotelController.class)
class HotelControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private HotelService hotelService;

    @MockitoBean
    private BookingService bookingService;

    @Test
    @DisplayName("GET /api/v1/hotels should return 200 OK with paginated list")
    void getAllHotels_shouldReturnPaginatedHotels() throws Exception {
        HotelSummaryDto hotel = new HotelSummaryDto(
                1L, "Grand Azure", "Goa, India", "Beach Road",
                "Beach resort", BigDecimal.valueOf(4.8), "+91-832-123456",
                "info@azure.com", BigDecimal.valueOf(18500), List.of("Wi-Fi", "Pool")
        );

        when(hotelService.getAllHotels(any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(hotel)));

        mockMvc.perform(get("/api/v1/hotels")
                        .param("page", "0")
                        .param("size", "10")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].id", is(1)))
                .andExpect(jsonPath("$.content[0].name", is("Grand Azure")))
                .andExpect(jsonPath("$.content[0].startingPrice", is(18500)));
    }

    @Test
    @DisplayName("GET /api/v1/hotels/{id} should return 200 OK with hotel details")
    void getHotelById_shouldReturnHotelDetails() throws Exception {
        HotelDetailDto detail = new HotelDetailDto(
                1L, "Grand Azure", "Goa, India", "Beach Road",
                "Luxury beachfront", BigDecimal.valueOf(4.8), "+91-832-123456",
                "info@azure.com",
                List.of(new AmenityDto(1L, "Wi-Fi", "Free internet", "wifi")),
                List.of(new RoomTypeDto(10L, 1L, "Deluxe Ocean View", "Sea view", BigDecimal.valueOf(18500), 2, "King", 48))
        );

        when(hotelService.getHotelDetails(1L)).thenReturn(detail);

        mockMvc.perform(get("/api/v1/hotels/1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.name", is("Grand Azure")))
                .andExpect(jsonPath("$.amenities", hasSize(1)))
                .andExpect(jsonPath("$.roomTypes", hasSize(1)));
    }

    @Test
    @DisplayName("GET /api/v1/hotels/{id} should return 404 Not Found when ID does not exist")
    void getHotelById_shouldReturn404WhenNotFound() throws Exception {
        when(hotelService.getHotelDetails(999L))
                .thenThrow(new ResourceNotFoundException("Hotel not found with ID: 999"));

        mockMvc.perform(get("/api/v1/hotels/999")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status", is(404)))
                .andExpect(jsonPath("$.error", is("Not Found")))
                .andExpect(jsonPath("$.message", is("Hotel not found with ID: 999")))
                .andExpect(jsonPath("$.path", is("/api/v1/hotels/999")));
    }

    @Test
    @DisplayName("GET /api/v1/hotels/search?location=Goa should return 200 OK with matching hotels")
    void searchHotels_shouldReturnMatchingHotels() throws Exception {
        HotelSummaryDto hotel = new HotelSummaryDto(
                1L, "Grand Azure", "Goa, India", "Beach Road",
                "Beach resort", BigDecimal.valueOf(4.8), "+91-832-123456",
                "info@azure.com", BigDecimal.valueOf(18500), List.of("Wi-Fi")
        );

        when(hotelService.searchHotelsByLocation(eq("Goa"), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(hotel)));

        mockMvc.perform(get("/api/v1/hotels/search")
                        .param("location", "Goa")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].location", is("Goa, India")));
    }

    @Test
    @DisplayName("GET /api/v1/hotels/{id}/availability should return 200 OK with physical room availability")
    void getHotelRoomAvailability_shouldReturnAvailability() throws Exception {
        LocalDate checkIn = LocalDate.now().plusDays(5);
        LocalDate checkOut = LocalDate.now().plusDays(8);

        RoomAvailabilityDto room1 = new RoomAvailabilityDto(
                1L, "101", 1, 10L, "Deluxe Ocean View", BigDecimal.valueOf(18500), 2, true
        );
        RoomAvailabilityDto room2 = new RoomAvailabilityDto(
                2L, "102", 1, 10L, "Deluxe Ocean View", BigDecimal.valueOf(18500), 2, false
        );

        when(bookingService.checkRoomAvailability(eq(1L), eq(checkIn), eq(checkOut), eq(2)))
                .thenReturn(List.of(room1, room2));

        mockMvc.perform(get("/api/v1/hotels/1/availability")
                        .param("checkIn", checkIn.toString())
                        .param("checkOut", checkOut.toString())
                        .param("guests", "2")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].roomNumber", is("101")))
                .andExpect(jsonPath("$[0].available", is(true)))
                .andExpect(jsonPath("$[1].roomNumber", is("102")))
                .andExpect(jsonPath("$[1].available", is(false)));
    }

    @Test
    @DisplayName("GET /api/v1/hotels/{id}/availability should return 400 Bad Request when dates are invalid")
    void getHotelRoomAvailability_shouldReturn400WhenDatesInvalid() throws Exception {
        LocalDate checkIn = LocalDate.now().plusDays(10);
        LocalDate checkOut = LocalDate.now().plusDays(5); // checkOut before checkIn!

        when(bookingService.checkRoomAvailability(eq(1L), eq(checkIn), eq(checkOut), eq(1)))
                .thenThrow(new InvalidBookingDatesException("Check-out date must be strictly after check-in date."));

        mockMvc.perform(get("/api/v1/hotels/1/availability")
                        .param("checkIn", checkIn.toString())
                        .param("checkOut", checkOut.toString())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.error", is("Bad Request")))
                .andExpect(jsonPath("$.message", is("Check-out date must be strictly after check-in date.")));
    }
}
