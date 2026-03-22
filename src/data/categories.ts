import { CategoryInfo } from './types';

export const categories: CategoryInfo[] = [
  {
    id: 'gasoline',
    nameKo: '휘발유',
    unit: 'USD/L',
    icon: '⛽',
    color: '#f97316',
    description: '일반 휘발유(Octane-95) 소매 가격 (GlobalPetrolPrices.com)',
  },
  {
    id: 'diesel',
    nameKo: '경유',
    unit: 'USD/L',
    icon: '🛢',
    color: '#64748b',
    description: '경유 소매 가격 (GlobalPetrolPrices.com)',
  },
  {
    id: 'lng',
    nameKo: 'LNG',
    unit: 'USD/MMBtu',
    icon: '🔥',
    color: '#a78bfa',
    description: '액화천연가스 국제 현물 가격',
  },
  {
    id: 'elec_residential',
    nameKo: '전기(가정)',
    unit: 'USD/kWh',
    icon: '🏠',
    color: '#fbbf24',
    description: '가정용 전기 소매 가격 (GlobalPetrolPrices.com)',
  },
  {
    id: 'elec_industrial',
    nameKo: '전기(산업)',
    unit: 'USD/kWh',
    icon: '🏭',
    color: '#34d399',
    description: '산업용 전기 소매 가격',
  },
  {
    id: 'lpg',
    nameKo: 'LPG',
    unit: 'USD/L',
    icon: '💧',
    color: '#38bdf8',
    description: 'LPG(액화석유가스) 소매 가격 (GlobalPetrolPrices.com)',
  },
];
