package com.stayfinder.repository;

import com.stayfinder.entity.Hotel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HotelRepository extends JpaRepository<Hotel, Long> {

    Page<Hotel> findByLocationContainingIgnoreCase(String location, Pageable pageable);

    Page<Hotel> findByNameContainingIgnoreCase(String name, Pageable pageable);

    List<Hotel> findByLocation(String location);
}
