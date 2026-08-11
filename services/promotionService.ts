import axiosClient from './axiosClient';

export interface PromotionDTO {
  promotionId: number;
  promoCode?: string;
  promoName: string;
  description?: string;
  promoType: string;
  targetTier: string;
  validFrom?: string;
  validTo?: string;
  isActive: boolean;
}

export const promotionService = {
  getEligiblePromotions: (): Promise<PromotionDTO[]> => {
    return axiosClient.get('/loyalty/me/promotions');
  },
  getPublicPromotions: (): Promise<PromotionDTO[]> => {
    return axiosClient.get('/promotions/public');
  }
};
