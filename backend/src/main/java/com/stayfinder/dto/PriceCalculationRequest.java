package com.stayfinder.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

@Schema(description = "Payload for calculating stay price before booking")
public class PriceCalculationRequest {

    @Schema(description = "Physical room ID", example = "1")
    private Long roomId;

    @Schema(description = "Optional room type ID (used if roomId is omitted)", example = "1")
    private Long roomTypeId;

    @NotNull(message = "Check-in date is required")
    @FutureOrPresent(message = "Check-in date cannot be in the past")
    @Schema(description = "Requested check-in date (inclusive)", example = "2026-12-15")
    private LocalDate checkIn;

    @NotNull(message = "Check-out date is required")
    @Schema(description = "Requested check-out date (exclusive)", example = "2026-12-18")
    private LocalDate checkOut;

    public PriceCalculationRequest() {
    }

    public PriceCalculationRequest(Long roomId, LocalDate checkIn, LocalDate checkOut) {
        this.roomId = roomId;
        this.checkIn = checkIn;
        this.checkOut = checkOut;
    }

    public PriceCalculationRequest(Long roomId, Long roomTypeId, LocalDate checkIn, LocalDate checkOut) {
        this.roomId = roomId;
        this.roomTypeId = roomTypeId;
        this.checkIn = checkIn;
        this.checkOut = checkOut;
    }

    public Long getRoomId() {
        return roomId;
    }

    public void setRoomId(Long roomId) {
        this.roomId = roomId;
    }

    public Long getRoomTypeId() {
        return roomTypeId;
    }

    public void setRoomTypeId(Long roomTypeId) {
        this.roomTypeId = roomTypeId;
    }

    public LocalDate getCheckIn() {
        return checkIn;
    }

    public void setCheckIn(LocalDate checkIn) {
        this.checkIn = checkIn;
    }

    public LocalDate getCheckOut() {
        return checkOut;
    }

    public void setCheckOut(LocalDate checkOut) {
        this.checkOut = checkOut;
    }
}
