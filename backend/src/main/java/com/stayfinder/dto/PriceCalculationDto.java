package com.stayfinder.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class PriceCalculationDto {

    private Long roomId;
    private String roomNumber;
    private Long roomTypeId;
    private String roomTypeName;
    private BigDecimal pricePerNight;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private long numberOfNights;
    private BigDecimal totalAmount;
    private boolean available = true;

    public PriceCalculationDto() {
    }

    public PriceCalculationDto(Long roomTypeId, String roomTypeName, BigDecimal pricePerNight,
                               LocalDate checkInDate, LocalDate checkOutDate,
                               long numberOfNights, BigDecimal totalAmount) {
        this.roomTypeId = roomTypeId;
        this.roomTypeName = roomTypeName;
        this.pricePerNight = pricePerNight;
        this.checkInDate = checkInDate;
        this.checkOutDate = checkOutDate;
        this.numberOfNights = numberOfNights;
        this.totalAmount = totalAmount;
        this.available = true;
    }

    public PriceCalculationDto(Long roomId, String roomNumber, Long roomTypeId, String roomTypeName,
                               BigDecimal pricePerNight, LocalDate checkInDate, LocalDate checkOutDate,
                               long numberOfNights, BigDecimal totalAmount, boolean available) {
        this.roomId = roomId;
        this.roomNumber = roomNumber;
        this.roomTypeId = roomTypeId;
        this.roomTypeName = roomTypeName;
        this.pricePerNight = pricePerNight;
        this.checkInDate = checkInDate;
        this.checkOutDate = checkOutDate;
        this.numberOfNights = numberOfNights;
        this.totalAmount = totalAmount;
        this.available = available;
    }

    public Long getRoomId() {
        return roomId;
    }

    public void setRoomId(Long roomId) {
        this.roomId = roomId;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }

    public Long getRoomTypeId() {
        return roomTypeId;
    }

    public void setRoomTypeId(Long roomTypeId) {
        this.roomTypeId = roomTypeId;
    }

    public String getRoomTypeName() {
        return roomTypeName;
    }

    public void setRoomTypeName(String roomTypeName) {
        this.roomTypeName = roomTypeName;
    }

    public BigDecimal getPricePerNight() {
        return pricePerNight;
    }

    public void setPricePerNight(BigDecimal pricePerNight) {
        this.pricePerNight = pricePerNight;
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

    public long getNumberOfNights() {
        return numberOfNights;
    }

    public void setNumberOfNights(long numberOfNights) {
        this.numberOfNights = numberOfNights;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    /**
     * Alias for totalAmount for seamless frontend interoperability.
     */
    public BigDecimal getTotalPrice() {
        return totalAmount;
    }

    public void setTotalPrice(BigDecimal totalPrice) {
        this.totalAmount = totalPrice;
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }
}
