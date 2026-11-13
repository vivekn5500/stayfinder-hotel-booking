package com.stayfinder.service;

import com.stayfinder.dto.HotelDetailDto;
import com.stayfinder.dto.HotelSummaryDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface HotelService {

    Page<HotelSummaryDto> getAllHotels(Pageable pageable);

    Page<HotelSummaryDto> searchHotelsByLocation(String location, Pageable pageable);

    Page<HotelSummaryDto> searchHotelsByName(String name, Pageable pageable);

    HotelDetailDto getHotelDetails(Long hotelId);
}
