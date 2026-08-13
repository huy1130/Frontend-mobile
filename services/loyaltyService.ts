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
    return response as any;
  },
  
  getEligibleRewards: async () => {
    const response = await axiosClient.get('/loyalty/me/rewards');
    return response as any;
  },
  
  getMyRedemptions: async () => {
    const response = await axiosClient.get('/loyalty/me/redemptions');
    return response as any;
  },
  
  redeemReward: async (rewardId: number) => {
    // Tạo requestId dạng GUID (UUID v4) hợp lệ để gửi xuống BE
    const requestId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    const response = await axiosClient.post(`/loyalty/me/rewards/${rewardId}/redeem`, { requestId });
    return response as any;
  }
};
