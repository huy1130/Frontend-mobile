import axiosClient from './axiosClient';

export interface ServiceDto {
    serviceId: number;
    serviceName: string;
    description?: string;
    price: number;
    isActive?: boolean;
}

export const serviceService = {
  getActiveServices: (): Promise<ServiceDto[]> => {
    return axiosClient.get('/Services');
  }
};
