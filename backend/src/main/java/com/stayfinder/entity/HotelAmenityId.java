package com.stayfinder.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class HotelAmenityId implements Serializable {

    @Column(name = "hotel_id")
    private Long hotelId;

    @Column(name = "amenity_id")
    private Long amenityId;

    public HotelAmenityId() {
    }

    public HotelAmenityId(Long hotelId, Long amenityId) {
        this.hotelId = hotelId;
        this.amenityId = amenityId;
    }

    public Long getHotelId() {
        return hotelId;
    }

    public void setHotelId(Long hotelId) {
        this.hotelId = hotelId;
    }

    public Long getAmenityId() {
        return amenityId;
    }

    public void setAmenityId(Long amenityId) {
        this.amenityId = amenityId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        HotelAmenityId that = (HotelAmenityId) o;
        return Objects.equals(hotelId, that.hotelId) &&
               Objects.equals(amenityId, that.amenityId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(hotelId, amenityId);
    }

    @Override
    public String toString() {
        return "HotelAmenityId{" +
                "hotelId=" + hotelId +
                ", amenityId=" + amenityId +
                '}';
    }
}
