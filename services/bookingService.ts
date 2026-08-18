import axiosClient from './axiosClient';

export interface BookingAddOnDTO {
    bookingAddOnId: number;
    serviceId: number;
    serviceName: string;
    promotionId?: number | null;
    redemptionId?: number | null;
    originalPrice: number;
    finalPrice: number;
    status: string;
}

export interface BookingRequestDTO {
    customerId?: number;
    vehicleId?: number;
    guestName?: string;
    guestPhone?: string;
    guestLicensePlate?: string;
    guestVehicleType?: string;
    serviceId: number;
    slotId: number;
    bookingDate: string;
    promotionId?: number | null;
    redemptionId?: number | null;
}

export interface AppliedRewardDTO {
    redemptionId: number;
    rewardId: number;
    rewardName: string;
    rewardType: string;
    description?: string | null;
    pointsSpent: number;
    discountValue?: number | null;
    serviceId?: number | null;
    serviceName?: string | null;
    status: string;
    redeemedAt: string;
    usedAt?: string | null;
}

export interface BookingResponseDTO {
    bookingId: number;
    customerId?: number;
    customerName?: string;
    vehicleId?: number;
    licensePlate: string;
    vehicleType?: string;
    serviceId: number;
    serviceName: string;
    slotId: number;
    startTime: string;
    endTime: string;
    bookingDate: string;
    originalPrice?: number;
    finalPrice?: number;
    depositAmount?: number | null;
    accountNumber?: string;
    accountName?: string;
    bin?: string;
    description?: string;
    qrImageUrl?: string;
    checkoutUrl?: string;
    promotionId?: number | null;
    promoCode?: string | null;
    redemptionId?: number | null;
    rewardName?: string | null;
    appliedReward?: AppliedRewardDTO | null;
    addOns?: BookingAddOnDTO[];
    qrCode?: string;
    status: string;
    createdAt?: string;
}

export const bookingService = {
  createBooking: (data: BookingRequestDTO): Promise<BookingResponseDTO> => {
    return axiosClient.post('/Booking', data);
  },
  
  getBookingHistory: (phone: string): Promise<{ success: boolean; data: BookingResponseDTO[] }> => {
    return axiosClient.get(`/Booking/search?phone=${phone}`);
  },

  cancelBooking: (bookingId: number): Promise<any> => {
    return axiosClient.put(`/Booking/${bookingId}/cancel`);
  },

  getBookingDetail: (bookingId: number): Promise<{ success: boolean; data: any }> => {
    return axiosClient.get(`/Booking/${bookingId}`);
  },

  createDepositPayment: (bookingId: number): Promise<any> => {
    return axiosClient.post(`/payments/deposit-qr/${bookingId}`);
  }
};
