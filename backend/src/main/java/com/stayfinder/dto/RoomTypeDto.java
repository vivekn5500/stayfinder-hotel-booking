package com.stayfinder.dto;

import java.math.BigDecimal;

public class RoomTypeDto {

    private Long id;
    private Long hotelId;
    private String name;
    private String description;
    private BigDecimal basePrice;
    private Integer maxOccupancy;
    private String bedType;
    private Integer roomSizeSqm;

    public RoomTypeDto() {
    }

    public RoomTypeDto(Long id, Long hotelId, String name, String description,
                       BigDecimal basePrice, Integer maxOccupancy, String bedType, Integer roomSizeSqm) {
        this.id = id;
        this.hotelId = hotelId;
        this.name = name;
        this.description = description;
        this.basePrice = basePrice;
        this.maxOccupancy = maxOccupancy;
        this.bedType = bedType;
        this.roomSizeSqm = roomSizeSqm;
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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getBasePrice() {
        return basePrice;
    }

    public void setBasePrice(BigDecimal basePrice) {
        this.basePrice = basePrice;
    }

    public Integer getMaxOccupancy() {
        return maxOccupancy;
    }

    public void setMaxOccupancy(Integer maxOccupancy) {
        this.maxOccupancy = maxOccupancy;
    }

    public String getBedType() {
        return bedType;
    }

    public void setBedType(String bedType) {
        this.bedType = bedType;
    }

    public Integer getRoomSizeSqm() {
        return roomSizeSqm;
    }

    public void setRoomSizeSqm(Integer roomSizeSqm) {
        this.roomSizeSqm = roomSizeSqm;
    }
}
