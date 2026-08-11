import axiosClient from './axiosClient';

export interface LoyaltySummary {
  currentPoints: number;
  currentTier: string;
  totalSpent: number;
  totalVisits: number;
}

export const loyaltyService = {
  getMySummary: async (): Promise<LoyaltySummary> => {
    // Lấy thông tin điểm và hạng thành viên
    const response = await axiosClient.get<any, LoyaltySummary>('/loyalty/me/summary');
    return response;
  },

  getMyTransactions: async (page: number = 1, pageSize: number = 20) => {
    // Lấy lịch sử giao dịch điểm
    const response = await axiosClient.get(`/loyalty/me/transactions?page=${page}&pageSize=${pageSize}`);
    return response;
  },
};
