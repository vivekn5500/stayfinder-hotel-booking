import apiClient from './client';

export const hotelApi = {
  getAllHotels(page = 0, size = 10, sort = 'id,asc') {
    return apiClient.get('/hotels', {
      params: { page, size, sort },
    });
  },

  getHotelById(id) {
    return apiClient.get(`/hotels/${id}`);
  },

  searchHotels(location, page = 0, size = 10, sort = 'id,asc') {
    return apiClient.get('/hotels/search', {
      params: { location, page, size, sort },
    });
  },

  getHotelAvailability(hotelId, checkIn, checkOut, guests = 1) {
    return apiClient.get(`/hotels/${hotelId}/availability`, {
      params: { checkIn, checkOut, guests },
    });
  },
};
