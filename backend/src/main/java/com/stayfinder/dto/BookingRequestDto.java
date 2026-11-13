package com.stayfinder.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

@Schema(description = "Payload for creating a new hotel room booking")
public class BookingRequestDto {

    @NotNull(message = "Room ID is required")
    @Schema(description = "Assigned physical room ID", example = "1", requiredMode = Schema.RequiredMode.REQUIRED)
    private Long roomId;

    @NotBlank(message = "Guest name is required")
    @Size(min = 2, max = 150, message = "Guest name must be between 2 and 150 characters")
    @Schema(description = "Primary guest full name", example = "Vikram Malhotra", requiredMode = Schema.RequiredMode.REQUIRED)
    private String guestName;

    @NotBlank(message = "Guest email is required")
    @Email(message = "Guest email must be valid")
    @Schema(description = "Primary guest email address", example = "vikram.m@example.com", requiredMode = Schema.RequiredMode.REQUIRED)
    private String guestEmail;

    @Schema(description = "Guest contact phone number", example = "+91-9876543210")
    private String guestPhone;

    @NotNull(message = "Check-in date is required")
    @FutureOrPresent(message = "Check-in date cannot be in the past")
    @Schema(description = "Stay check-in date (inclusive)", example = "2026-12-15", requiredMode = Schema.RequiredMode.REQUIRED)
    private LocalDate checkInDate;

    @NotNull(message = "Check-out date is required")
    @Schema(description = "Stay check-out date (exclusive)", example = "2026-12-18", requiredMode = Schema.RequiredMode.REQUIRED)
    private LocalDate checkOutDate;

    public BookingRequestDto() {
    }

    public BookingRequestDto(Long roomId, String guestName, String guestEmail,
                             String guestPhone, LocalDate checkInDate, LocalDate checkOutDate) {
        this.roomId = roomId;
        this.guestName = guestName;
        this.guestEmail = guestEmail;
        this.guestPhone = guestPhone;
        this.checkInDate = checkInDate;
        this.checkOutDate = checkOutDate;
    }

    public Long getRoomId() {
        return roomId;
    }

    public void setRoomId(Long roomId) {
        this.roomId = roomId;
    }

    public String getGuestName() {
        return guestName;
    }

    public void setGuestName(String guestName) {
        this.guestName = guestName;
    }

    public String getGuestEmail() {
        return guestEmail;
    }

    public void setGuestEmail(String guestEmail) {
        this.guestEmail = guestEmail;
    }

    public String getGuestPhone() {
        return guestPhone;
    }

    public void setGuestPhone(String guestPhone) {
        this.guestPhone = guestPhone;
    }

    public LocalDate getCheckInDate() {
        return checkInDate;
    }

    public void setCheckInDate(LocalDate checkInDate) {
        this.checkInDate = checkInDate;
    }

    public LocalDate getCheckOutDate() {
        return checkOutDate;
    }

    public void setCheckOutDate(LocalDate checkOutDate) {
        this.checkOutDate = checkOutDate;
    }
}
