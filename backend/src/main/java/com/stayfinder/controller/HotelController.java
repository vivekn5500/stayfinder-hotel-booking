package com.stayfinder.controller;

import com.stayfinder.dto.ErrorResponse;
import com.stayfinder.dto.HotelDetailDto;
import com.stayfinder.dto.HotelSummaryDto;
import com.stayfinder.dto.RoomAvailabilityDto;
import com.stayfinder.service.BookingService;
import com.stayfinder.service.HotelService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/hotels")
@Tag(name = "Hotels & Availability", description = "Endpoints for discovering hotels, retrieving property details, and checking real-time room availability.")
public class HotelController {

    private final HotelService hotelService;
    private final BookingService bookingService;

    public HotelController(HotelService hotelService, BookingService bookingService) {
        this.hotelService = hotelService;
        this.bookingService = bookingService;
    }

    @Operation(summary = "Get paginated hotel listings", description = "Retrieves a paginated collection of hotels with starting room prices and amenity highlights.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Hotels retrieved successfully")
    })
    @GetMapping
    public ResponseEntity<Page<HotelSummaryDto>> getAllHotels(
            @Parameter(description = "Page number (0-indexed)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort property and direction (e.g. name,asc or starRating,desc)") @RequestParam(defaultValue = "id,asc") String sort) {

        Pageable pageable = createPageable(page, size, sort);
        return ResponseEntity.ok(hotelService.getAllHotels(pageable));
    }

    @Operation(summary = "Search hotels by location", description = "Searches hotels by location substring (case-insensitive) with pagination.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Hotels matching location retrieved successfully")
    })
    @GetMapping("/search")
    public ResponseEntity<Page<HotelSummaryDto>> searchHotels(
            @Parameter(description = "City, state or region name") @RequestParam String location,
            @Parameter(description = "Page number (0-indexed)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort property and direction") @RequestParam(defaultValue = "id,asc") String sort) {

        Pageable pageable = createPageable(page, size, sort);
        return ResponseEntity.ok(hotelService.searchHotelsByLocation(location, pageable));
    }

    @Operation(summary = "Get hotel details by ID", description = "Retrieves complete property details including room categories and amenities.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Hotel found and details returned"),
            @ApiResponse(responseCode = "404", description = "Hotel not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping("/{id}")
    public ResponseEntity<HotelDetailDto> getHotelById(
            @Parameter(description = "Hotel ID", required = true) @PathVariable Long id) {

        return ResponseEntity.ok(hotelService.getHotelDetails(id));
    }

    @Operation(summary = "Check room availability for hotel", description = "Checks physical room availability for requested dates, excluding rooms with overlapping active bookings, respecting guest capacity.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Room availability calculated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid check-in or check-out dates",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Hotel not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping("/{hotelId}/availability")
    public ResponseEntity<List<RoomAvailabilityDto>> getHotelRoomAvailability(
            @Parameter(description = "Hotel ID", required = true) @PathVariable Long hotelId,
            @Parameter(description = "Check-in date (inclusive, YYYY-MM-DD)", required = true)
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @Parameter(description = "Check-out date (exclusive, YYYY-MM-DD)", required = true)
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut,
            @Parameter(description = "Number of guests (default: 1)")
            @RequestParam(required = false, defaultValue = "1") Integer guests) {

        List<RoomAvailabilityDto> availability = bookingService.checkRoomAvailability(hotelId, checkIn, checkOut, guests);
        return ResponseEntity.ok(availability);
    }

    private Pageable createPageable(int page, int size, String sort) {
        String[] sortParts = sort.split(",");
        String sortField = sortParts[0].trim();
        Sort.Direction direction = (sortParts.length > 1 && sortParts[1].trim().equalsIgnoreCase("desc"))
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;

        return PageRequest.of(Math.max(0, page), Math.max(1, size), Sort.by(direction, sortField));
    }
}
