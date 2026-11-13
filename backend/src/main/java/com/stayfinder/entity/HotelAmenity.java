package com.stayfinder.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;

import java.util.Objects;

@Entity
@Table(name = "hotel_amenity")
public class HotelAmenity {

    @EmbeddedId
    private HotelAmenityId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("hotelId")
    @JoinColumn(name = "hotel_id", nullable = false)
    @JsonIgnore
    private Hotel hotel;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("amenityId")
    @JoinColumn(name = "amenity_id", nullable = false)
    private Amenity amenity;

    public HotelAmenity() {
        this.id = new HotelAmenityId();
    }

    public HotelAmenity(Hotel hotel, Amenity amenity) {
        this.hotel = hotel;
        this.amenity = amenity;
        this.id = new HotelAmenityId(
                hotel != null ? hotel.getId() : null,
                amenity != null ? amenity.getId() : null
        );
    }

    public HotelAmenityId getId() {
        return id;
    }

    public void setId(HotelAmenityId id) {
        this.id = id;
    }

    public Hotel getHotel() {
        return hotel;
    }

    public void setHotel(Hotel hotel) {
        this.hotel = hotel;
        if (hotel != null) {
            if (this.id == null) {
                this.id = new HotelAmenityId();
            }
            this.id.setHotelId(hotel.getId());
        }
    }

    public Amenity getAmenity() {
        return amenity;
    }

    public void setAmenity(Amenity amenity) {
        this.amenity = amenity;
        if (amenity != null) {
            if (this.id == null) {
                this.id = new HotelAmenityId();
            }
            this.id.setAmenityId(amenity.getId());
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        HotelAmenity that = (HotelAmenity) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public String toString() {
        return "HotelAmenity{" +
                "id=" + id +
                '}';
    }
}
