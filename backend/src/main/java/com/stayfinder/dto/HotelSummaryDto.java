package com.stayfinder.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class HotelSummaryDto {

    private Long id;
    private String name;
    private String location;
    private String address;
    private String description;
    private BigDecimal starRating;
    private String phone;
    private String email;
    private BigDecimal startingPrice;
    private List<String> amenities = new ArrayList<>();

    public HotelSummaryDto() {
    }

    public HotelSummaryDto(Long id, String name, String location, String address,
                           String description, BigDecimal starRating, String phone,
                           String email, BigDecimal startingPrice, List<String> amenities) {
        this.id = id;
        this.name = name;
        this.location = location;
        this.address = address;
        this.description = description;
        this.starRating = starRating;
        this.phone = phone;
        this.email = email;
        this.startingPrice = startingPrice;
        this.amenities = amenities != null ? amenities : new ArrayList<>();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getStarRating() {
        return starRating;
    }

    public void setStarRating(BigDecimal starRating) {
        this.starRating = starRating;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public BigDecimal getStartingPrice() {
        return startingPrice;
    }

    public void setStartingPrice(BigDecimal startingPrice) {
        this.startingPrice = startingPrice;
    }

    public List<String> getAmenities() {
        return amenities;
    }

    public void setAmenities(List<String> amenities) {
        this.amenities = amenities;
    }
}
