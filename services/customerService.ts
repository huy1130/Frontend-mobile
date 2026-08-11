import axiosClient from './axiosClient';

export interface CustomerVehicleDTO {
  vehicleId: number;
  licensePlate: string;
  vehicleType: string;
  qrCode?: string;
}

export const customerService = {
  getMyVehicles: (): Promise<{ success: boolean; data: CustomerVehicleDTO[] }> => {
    return axiosClient.get('/Customer/my-vehicles');
  }
};
