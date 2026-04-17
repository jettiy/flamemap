import { Country, EnergyType } from './types';
import { WAR_START_DATE, USD_TO_KRW_DEFAULT } from './constants';

// 하위 호환성 — 외부에서 WAR_START_DATE / USD_TO_KRW 직접 import하던 곳 대응
export { WAR_START_DATE } from './constants';
export const USD_TO_KRW = USD_TO_KRW_DEFAULT;

/** ISO Alpha-2 → 유니코드 국기 이모지 */
export const getFlagEmoji = (iso2: string): string =>
  iso2.toUpperCase().replace(/./g, (c) =>
    String.fromCodePoint(c.charCodeAt(0) + 127397)
  );

/** 변화율(%) 계산 */
export const getChangeRate = (baseline: number, current: number): number =>
  parseFloat((((current - baseline) / baseline) * 100).toFixed(1));

/** 가격을 KRW로 변환 */
export const toKRW = (price: number, unit: string): { value: number; unit: string } => {
  if (unit === 'USD/L') {
    return { value: parseFloat((price * USD_TO_KRW).toFixed(0)), unit: 'KRW/L' };
  }
  if (unit === 'USD/MMBtu') {
    return { value: parseFloat((price * USD_TO_KRW).toFixed(0)), unit: 'KRW/MMBtu' };
  }
  if (unit.includes('USD/kWh')) {
    return { value: parseFloat((price * USD_TO_KRW).toFixed(1)), unit: 'KRW/kWh' };
  }
  return { value: price, unit };
};

/** 국가의 특정 에너지 변화율 */
export const countryChangeRate = (country: Country, category: EnergyType): number => {
  const { baseline, current } = country.prices[category];
  return getChangeRate(baseline, current);
};

/** 전체 국가 평균 변화율 */
export const globalAvgChangeRate = (countries: Country[], category: EnergyType): number => {
  const rates = countries.map((c) => countryChangeRate(c, category));
  return parseFloat((rates.reduce((a, b) => a + b, 0) / rates.length).toFixed(1));
};

/** 중위값 계산 */
export const median = (values: number[]): number => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
};

/** 날짜별 글로벌 중위 가격 배열 생성 */
export const buildGlobalMedianSeries = (
  countries: Country[],
  category: EnergyType
): { date: string; price: number }[] => {
  const sampleHistory = countries[0]?.prices[category].history ?? [];
  return sampleHistory.map((_, idx) => {
    const prices = countries.map((c) => c.prices[category].history[idx]?.price ?? 0);
    return {
      date: sampleHistory[idx].date,
      price: parseFloat(median(prices).toFixed(4)),
    };
  });
};

/** 가격 포맷 */
export const formatPrice = (
  price: number,
  unit: string,
  showKRW: boolean
): string => {
  if (showKRW) {
    const converted = toKRW(price, unit);
    return `${converted.value.toLocaleString('ko-KR')} ${converted.unit}`;
  }
  return `${price} ${unit}`;
};

/** 최대 상승 국가 찾기 */
export const topRisingCountry = (
  countries: Country[],
  category: EnergyType
): { country: Country; rate: number } => {
  const sorted = [...countries].sort(
    (a, b) => countryChangeRate(b, category) - countryChangeRate(a, category)
  );
  return { country: sorted[0], rate: countryChangeRate(sorted[0], category) };
};

/** 지역 필터 목록 */
export const REGION_FILTERS = ['전체', '아시아', '유럽', '중동', '아메리카', '기타'] as const;
