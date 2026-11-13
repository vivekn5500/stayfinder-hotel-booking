package com.stayfinder.service;

import com.stayfinder.dto.AmenityDto;
import com.stayfinder.dto.HotelDetailDto;
import com.stayfinder.dto.HotelSummaryDto;
import com.stayfinder.dto.RoomTypeDto;
import com.stayfinder.entity.Amenity;
import com.stayfinder.entity.Hotel;
import com.stayfinder.entity.HotelAmenity;
import com.stayfinder.entity.RoomType;
import com.stayfinder.exception.ResourceNotFoundException;
import com.stayfinder.repository.HotelRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class HotelServiceImpl implements HotelService {

    private final HotelRepository hotelRepository;

    public HotelServiceImpl(HotelRepository hotelRepository) {
        this.hotelRepository = hotelRepository;
    }

    @Override
    public Page<HotelSummaryDto> getAllHotels(Pageable pageable) {
        return hotelRepository.findAll(pageable).map(this::mapToSummaryDto);
    }

    @Override
    public Page<HotelSummaryDto> searchHotelsByLocation(String location, Pageable pageable) {
        if (location == null || location.trim().isEmpty()) {
            return getAllHotels(pageable);
        }
        return hotelRepository.findByLocationContainingIgnoreCase(location.trim(), pageable)
                .map(this::mapToSummaryDto);
    }

    @Override
    public Page<HotelSummaryDto> searchHotelsByName(String name, Pageable pageable) {
        if (name == null || name.trim().isEmpty()) {
            return getAllHotels(pageable);
        }
        return hotelRepository.findByNameContainingIgnoreCase(name.trim(), pageable)
                .map(this::mapToSummaryDto);
    }

    @Override
    public HotelDetailDto getHotelDetails(Long hotelId) {
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with ID: " + hotelId));

        return mapToDetailDto(hotel);
    }

    private HotelSummaryDto mapToSummaryDto(Hotel hotel) {
        BigDecimal startingPrice = hotel.getRoomTypes().stream()
                .map(RoomType::getBasePrice)
                .min(Comparator.naturalOrder())
                .orElse(BigDecimal.ZERO);

        List<String> amenityNames = hotel.getHotelAmenities().stream()
                .map(HotelAmenity::getAmenity)
                .map(Amenity::getName)
                .sorted()
                .collect(Collectors.toList());

        return new HotelSummaryDto(
                hotel.getId(),
                hotel.getName(),
                hotel.getLocation(),
                hotel.getAddress(),
                hotel.getDescription(),
                hotel.getStarRating(),
                hotel.getPhone(),
                hotel.getEmail(),
                startingPrice,
                amenityNames
        );
    }

    private HotelDetailDto mapToDetailDto(Hotel hotel) {
        List<AmenityDto> amenities = hotel.getHotelAmenities().stream()
                .map(HotelAmenity::getAmenity)
                .sorted(Comparator.comparing(Amenity::getName))
                .map(a -> new AmenityDto(a.getId(), a.getName(), a.getDescription(), a.getIcon()))
                .collect(Collectors.toList());

        List<RoomTypeDto> roomTypes = hotel.getRoomTypes().stream()
                .sorted(Comparator.comparing(RoomType::getBasePrice))
                .map(rt -> new RoomTypeDto(
                        rt.getId(),
                        hotel.getId(),
                        rt.getName(),
                        rt.getDescription(),
                        rt.getBasePrice(),
                        rt.getMaxOccupancy(),
                        rt.getBedType(),
                        rt.getRoomSizeSqm()
                ))
                .collect(Collectors.toList());

        return new HotelDetailDto(
                hotel.getId(),
                hotel.getName(),
                hotel.getLocation(),
                hotel.getAddress(),
                hotel.getDescription(),
                hotel.getStarRating(),
                hotel.getPhone(),
                hotel.getEmail(),
                amenities,
                roomTypes
        );
    }
}
