package com.stayfinder.controller;

import com.stayfinder.dto.BookingRequestDto;
import com.stayfinder.dto.BookingResponseDto;
import com.stayfinder.dto.ErrorResponse;
import com.stayfinder.dto.PriceCalculationDto;
import com.stayfinder.dto.PriceCalculationRequest;
import com.stayfinder.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/v1/bookings")
@Tag(name = "Bookings & Reservations", description = "Endpoints for calculating stay pricing, creating concurrent-safe room reservations, looking up booking references, and processing cancellations.")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @Operation(summary = "Calculate stay pricing", description = "Calculates total booking amount and number of nights for a given room or room category across specified stay dates.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Pricing calculated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request dates or missing parameters",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Room or room category not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/calculate-price")
    public ResponseEntity<PriceCalculationDto> calculatePrice(
            @Valid @RequestBody PriceCalculationRequest request) {

        PriceCalculationDto calculation;
        if (request.getRoomId() != null) {
            calculation = bookingService.calculatePriceByRoom(request.getRoomId(), request.getCheckIn(), request.getCheckOut());
        } else if (request.getRoomTypeId() != null) {
            calculation = bookingService.calculatePrice(request.getRoomTypeId(), request.getCheckIn(), request.getCheckOut());
        } else {
            throw new IllegalArgumentException("Either roomId or roomTypeId must be provided.");
        }

        return ResponseEntity.ok(calculation);
    }

    @Operation(summary = "Create hotel room booking", description = "Reserves a physical room using pessimistic row locking to prevent race conditions and double bookings.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Booking created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid booking details or dates",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Target room not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "Room is unavailable or already booked for requested dates",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping
    public ResponseEntity<BookingResponseDto> createBooking(
            @Valid @RequestBody BookingRequestDto request) {

        BookingResponseDto response = bookingService.createBooking(request);

        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{reference}")
                .buildAndExpand(response.getBookingReference())
                .toUri();

        return ResponseEntity.created(location).body(response);
    }

    @Operation(summary = "Get booking details by reference", description = "Retrieves booking information using the unique booking reference code (e.g. SF-202611-1001).")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Booking found and returned"),
            @ApiResponse(responseCode = "404", description = "Booking not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping("/{reference}")
    public ResponseEntity<BookingResponseDto> getBookingByReference(
            @Parameter(description = "Unique booking reference code", required = true)
            @PathVariable String reference) {

        return ResponseEntity.ok(bookingService.getBookingByReference(reference));
    }

    @Operation(summary = "Get guest booking history by email", description = "Retrieves all bookings matching a guest email address.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Guest bookings retrieved successfully")
    })
    @GetMapping
    public ResponseEntity<List<BookingResponseDto>> getBookingsByEmail(
            @Parameter(description = "Guest email address", required = true)
            @RequestParam String email) {

        return ResponseEntity.ok(bookingService.getBookingsByGuestEmail(email));
    }

    @Operation(summary = "Cancel hotel booking", description = "Cancels a confirmed reservation, releasing the physical room for new bookings.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Booking cancelled successfully"),
            @ApiResponse(responseCode = "400", description = "Booking already cancelled or cannot be cancelled",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Booking reference not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PatchMapping("/{reference}/cancel")
    public ResponseEntity<BookingResponseDto> cancelBooking(
            @Parameter(description = "Unique booking reference code", required = true)
            @PathVariable String reference) {

        return ResponseEntity.ok(bookingService.cancelBooking(reference));
    }
}
