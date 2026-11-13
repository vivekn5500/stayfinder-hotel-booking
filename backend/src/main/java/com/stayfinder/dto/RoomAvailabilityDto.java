package com.stayfinder.dto;

import java.math.BigDecimal;

public class RoomAvailabilityDto {

    private Long roomId;
    private String roomNumber;
    private Integer floorNumber;
    private Long roomTypeId;
    private String roomTypeName;
    private BigDecimal pricePerNight;
    private Integer maxOccupancy;
    private boolean isAvailable;

    public RoomAvailabilityDto() {
    }

    public RoomAvailabilityDto(Long roomId, String roomNumber, Integer floorNumber,
                               Long roomTypeId, String roomTypeName, BigDecimal pricePerNight,
                               Integer maxOccupancy, boolean isAvailable) {
        this.roomId = roomId;
        this.roomNumber = roomNumber;
        this.floorNumber = floorNumber;
        this.roomTypeId = roomTypeId;
        this.roomTypeName = roomTypeName;
        this.pricePerNight = pricePerNight;
        this.maxOccupancy = maxOccupancy;
        this.isAvailable = isAvailable;
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

    public Integer getFloorNumber() {
        return floorNumber;
    }

    public void setFloorNumber(Integer floorNumber) {
        this.floorNumber = floorNumber;
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

    public Integer getMaxOccupancy() {
        return maxOccupancy;
    }

    public void setMaxOccupancy(Integer maxOccupancy) {
        this.maxOccupancy = maxOccupancy;
    }

    public boolean isAvailable() {
        return isAvailable;
    }

    public void setAvailable(boolean available) {
        isAvailable = available;
    }
}
