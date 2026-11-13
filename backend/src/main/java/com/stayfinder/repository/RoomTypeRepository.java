package com.stayfinder.repository;

import com.stayfinder.entity.RoomType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoomTypeRepository extends JpaRepository<RoomType, Long> {

    List<RoomType> findByHotelId(Long hotelId);

    List<RoomType> findByHotelIdAndMaxOccupancyGreaterThanEqual(Long hotelId, Integer maxOccupancy);
}
