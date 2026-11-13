package com.stayfinder.service;

import com.stayfinder.dto.HotelDetailDto;
import com.stayfinder.dto.HotelSummaryDto;
import com.stayfinder.entity.Amenity;
import com.stayfinder.entity.Hotel;
import com.stayfinder.entity.HotelAmenity;
import com.stayfinder.entity.RoomType;
import com.stayfinder.exception.ResourceNotFoundException;
import com.stayfinder.repository.HotelRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class HotelServiceTest {

    @Mock
    private HotelRepository hotelRepository;

    @InjectMocks
    private HotelServiceImpl hotelService;

    private Hotel sampleHotel;

    @BeforeEach
    void setUp() {
        sampleHotel = new Hotel("The Grand Azure", "Goa, India", "Beach Road", "Luxury resort");
        sampleHotel.setId(1L);
        sampleHotel.setStarRating(BigDecimal.valueOf(4.8));

        RoomType roomType1 = new RoomType(sampleHotel, "Deluxe Ocean View", "Sea view", BigDecimal.valueOf(18500), 2);
        roomType1.setId(10L);
        RoomType roomType2 = new RoomType(sampleHotel, "Presidential Villa", "Villa with pool", BigDecimal.valueOf(45000), 4);
        roomType2.setId(11L);
        sampleHotel.setRoomTypes(List.of(roomType1, roomType2));

        Amenity wifi = new Amenity("High-Speed Wi-Fi", "Free internet", "wifi");
        wifi.setId(100L);
        HotelAmenity ha = new HotelAmenity(sampleHotel, wifi);
        sampleHotel.setHotelAmenities(Set.of(ha));
    }

    @Test
    @DisplayName("getAllHotels should return paginated summary DTOs with starting price and amenities")
    void getAllHotels_shouldReturnPaginatedSummaries() {
        Pageable pageable = PageRequest.of(0, 10);
        when(hotelRepository.findAll(pageable)).thenReturn(new PageImpl<>(List.of(sampleHotel), pageable, 1));

        Page<HotelSummaryDto> result = hotelService.getAllHotels(pageable);

        assertThat(result.getContent()).hasSize(1);
        HotelSummaryDto dto = result.getContent().get(0);
        assertThat(dto.getName()).isEqualTo("The Grand Azure");
        assertThat(dto.getStartingPrice()).isEqualByComparingTo("18500");
        assertThat(dto.getAmenities()).containsExactly("High-Speed Wi-Fi");
    }

    @Test
    @DisplayName("searchHotelsByLocation should filter by location substring")
    void searchHotelsByLocation_shouldFilterResults() {
        Pageable pageable = PageRequest.of(0, 5);
        when(hotelRepository.findByLocationContainingIgnoreCase(eq("Goa"), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(sampleHotel), pageable, 1));

        Page<HotelSummaryDto> result = hotelService.searchHotelsByLocation("Goa", pageable);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getLocation()).contains("Goa");
        verify(hotelRepository).findByLocationContainingIgnoreCase(eq("Goa"), eq(pageable));
    }

    @Test
    @DisplayName("getHotelDetails should return full details when hotel exists")
    void getHotelDetails_shouldReturnDetails() {
        when(hotelRepository.findById(1L)).thenReturn(Optional.of(sampleHotel));

        HotelDetailDto details = hotelService.getHotelDetails(1L);

        assertThat(details.getId()).isEqualTo(1L);
        assertThat(details.getName()).isEqualTo("The Grand Azure");
        assertThat(details.getRoomTypes()).hasSize(2);
        assertThat(details.getAmenities()).hasSize(1);
    }

    @Test
    @DisplayName("getHotelDetails should throw ResourceNotFoundException when hotel does not exist")
    void getHotelDetails_shouldThrowWhenNotFound() {
        when(hotelRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> hotelService.getHotelDetails(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Hotel not found with ID: 999");
    }
}
