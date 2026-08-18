import axiosClient from './axiosClient';

export interface SystemParameterDto {
  id: number;
  bikeDepositAmount: number;
  carDepositPercentage: number;
  contactPhone: string;
  cancellationRefundDays: number;
}

export const systemParameterService = {
  getSystemParameter: (): Promise<SystemParameterDto> => {
    return axiosClient.get('/system-parameters');
  }
};
