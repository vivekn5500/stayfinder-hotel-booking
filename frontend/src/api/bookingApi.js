import apiClient from './client';

export const bookingApi = {
  calculatePrice(roomId, checkIn, checkOut, roomTypeId = null) {
    return apiClient.post('/bookings/calculate-price', {
      roomId,
      roomTypeId,
      checkIn,
      checkOut,
    });
  },

  createBooking(bookingData) {
    return apiClient.post('/bookings', bookingData);
  },

  getBookingByReference(reference) {
    return apiClient.get(`/bookings/${encodeURIComponent(reference)}`);
  },

  getBookingsByEmail(email) {
    return apiClient.get('/bookings', {
      params: { email },
    });
  },

  cancelBooking(reference) {
    return apiClient.patch(`/bookings/${encodeURIComponent(reference)}/cancel`);
  },
};
