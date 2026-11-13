package com.stayfinder.dto;

import java.math.BigDecimal;

public class RoomDto {

    private Long id;
    private Long hotelId;
    private Long roomTypeId;
    private String roomTypeName;
    private String roomNumber;
    private Integer floorNumber;
    private String status;
    private BigDecimal pricePerNight;

    public RoomDto() {
    }

    public RoomDto(Long id, Long hotelId, Long roomTypeId, String roomTypeName,
                   String roomNumber, Integer floorNumber, String status, BigDecimal pricePerNight) {
        this.id = id;
        this.hotelId = hotelId;
        this.roomTypeId = roomTypeId;
        this.roomTypeName = roomTypeName;
        this.roomNumber = roomNumber;
        this.floorNumber = floorNumber;
        this.status = status;
        this.pricePerNight = pricePerNight;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getHotelId() {
        return hotelId;
    }

    public void setHotelId(Long hotelId) {
        this.hotelId = hotelId;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public BigDecimal getPricePerNight() {
        return pricePerNight;
    }

    public void setPricePerNight(BigDecimal pricePerNight) {
        this.pricePerNight = pricePerNight;
    }
}
