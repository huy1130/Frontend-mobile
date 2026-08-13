import axiosClient from './axiosClient';

export interface TimeSlotDto {
    slotId: number;
    startTime: string;
    endTime: string;
    carCapacity: number;
    bikeCapacity: number;
    isActive: boolean;
    createdAt?: string;
}

export interface AvailableSlotDto {
    slotId: number;
    startTime: string;
    endTime: string;
    carCapacity: number;
    bikeCapacity: number;
    carBookedCount: number;
    bikeBookedCount: number;
    remainingCarCapacity: number;
    remainingBikeCapacity: number;
}

export const timeSlotService = {
  getAvailableSlots: async (date: string): Promise<AvailableSlotDto[]> => {
    const response = await axiosClient.get(`/TimeSlots/available?date=${date}`);
    return response as any;
  }
};
