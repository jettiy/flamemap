export type EnergyType = 'gasoline' | 'diesel' | 'lng' | 'elec_residential' | 'elec_industrial' | 'lpg';

export interface PriceHistory {
  date: string;
  price: number;
}

export interface EnergyPrice {
  baseline: number;
  current: number;
  unit: string;
  history: PriceHistory[];
}

export interface Country {
  id: string;
  nameKo: string;
  region: string;
  lat: number;
  lng: number;
  prices: Record<EnergyType, EnergyPrice>;
}

export interface CategoryInfo {
  id: EnergyType;
  nameKo: string;
  unit: string;
  icon: string;
  color: string;
  description: string;
}

export type RegionFilter = '전체' | '아시아' | '유럽' | '중동' | '아메리카' | '기타';
export type MobileTab = 'map' | 'chart' | 'ranking' | 'compare' | 'timeline' | 'briefing';
export type RankingSort = 'rise' | 'fall';
