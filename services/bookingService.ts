import axiosClient from './axiosClient';

export interface BookingRequestDTO {
  vehicleId: number;
  serviceId: number;
  slotId: number;
  promotionId?: number;
}

export const bookingService = {
  createBooking: (data: BookingRequestDTO): Promise<number> => {
    return axiosClient.post('/Booking', data);
  }
};
