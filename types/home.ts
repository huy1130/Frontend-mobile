export interface HeroStats {
  customers: number;
  bookings: number;
  branches: number;
  satisfactionRate: number;
}

export interface ProcessStep {
  id: number;
  stepNumber: string;
  title: string;
  description: string;
  iconName: string;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  iconName: string;
  highlightText?: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  category: 'exterior' | 'interior' | 'detailing' | 'protection';
  description: string;
  price: number;
  durationMinutes: number;
  popular?: boolean;
  imageUrl?: string;
}

export interface ComboPackage {
  id: string;
  name: string;
  tagline: string;
  originalPrice: number;
  discountedPrice: number;
  saveBadge?: string;
  isBestSeller?: boolean;
  servicesIncluded: string[];
  durationMinutes: number;
  bonusPoints: number;
}

export interface Promotion {
  id: string;
  code: string;
  title: string;
  description: string;
  discountBadge: string;
  validUntil: string;
  minSpend?: number;
  category: 'new_user' | 'weekend' | 'tier_bonus' | 'seasonal';
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  rating: number;
  reviewsCount: number;
  status: 'open' | 'busy' | 'closing_soon';
  operatingHours: string;
  imageUrl: string;
  facilities: string[];
}

export interface MembershipTier {
  id: string;
  level: 'copper' | 'silver' | 'gold' | 'diamond';
  name: string;
  minPoints: number;
  pointMultiplier: string;
  discountPercent: number;
  color: string;
  badgeBg: string;
  benefits: string[];
}

export interface CustomerReview {
  id: string;
  customerName: string;
  avatarUrl: string;
  carModel: string;
  rating: number;
  comment: string;
  date: string;
  branchName: string;
}
