package com.stayfinder.repository;

import com.stayfinder.entity.HotelAmenity;
import com.stayfinder.entity.HotelAmenityId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HotelAmenityRepository extends JpaRepository<HotelAmenity, HotelAmenityId> {

    List<HotelAmenity> findByHotelId(Long hotelId);

    List<HotelAmenity> findByAmenityId(Long amenityId);

    Optional<HotelAmenity> findByHotelIdAndAmenityId(Long hotelId, Long amenityId);
}
