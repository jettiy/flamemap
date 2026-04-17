/**
 * eiaService.ts
 * 플레임맵 원자재 가격 + 전쟁 뉴스 데이터 서비스
 *
 * 우선순위:
 * 1. /live-data.json (에이전트가 6시간마다 업데이트하는 파일)
 * 2. 서버 프록시(/api/yahoo)를 통한 시세 데이터
 * 3. 하드코딩 폴백
 */

import { z } from 'zod';

// ── Zod 검증 스키마 ────────────────────────────────────────────
const LiveDataSchema = z.object({
  updatedAt: z.string(),
  updatedAtKST: z.string(),
  warDay: z.number().optional(),
  warSummary: z.string().default(''),
  marketPrices: z.object({
    brent:      z.object({ price: z.number(), change: z.number(), unit: z.string(), nameKo: z.string(), source: z.string() }),
    wti:        z.object({ price: z.number(), change: z.number(), unit: z.string(), nameKo: z.string(), source: z.string() }),
    naturalGas: z.object({ price: z.number(), change: z.number(), unit: z.string(), nameKo: z.string(), source: z.string() }),
  }),
  warNews: z.array(z.object({
    title: z.string(),
    description: z.string(),
    link: z.string(),
    pubDate: z.string(),
    source: z.string(),
  })).default([]),
  warStartDate: z.string().optional(),
  briefing: z.any().optional(),
  trumpPosts: z.array(z.any()).optional(),
  energyMatrix: z.any().optional(),
  countryPrices: z.any().optional(),
}).passthrough();

export interface MarketPrice {
  symbol?: string;
  nameKo: string;
  price: number | null;
  unit: string;
  change: number | null;
  timestamp: string | null;
  source: 'live' | 'agent' | 'fallback';
  note?: string;
}

export interface WarNewsItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
}

export interface BriefingActor {
  id: string;
  nameKo: string;
  flag: string;
  color: string;
  updates: string[];
}

export interface BriefingHotspot {
  area: string;
  status: string;
  detail: string;
}

export interface BriefingEconomy {
  label: string;
  value: string;
  note: string;
  up: boolean | null;
}

export interface WarBriefing {
  keyAssassinations?: string[];
  timeline?: Array<{date: string; event: string; type: string}>;
  title: string;
  dayLabel: string;
  operationName: string;
  startDate: string;
  updatedKST: string;
  sources: string[];
  actors: BriefingActor[];
  hotspots: BriefingHotspot[];
  energyEconomy: BriefingEconomy[];
  casualties: Record<string, { label: string; value: string } | string>;
}

export interface TrumpPost {
  text: string;
  summary: string;
  date: string;
  url?: string;
}

export interface CountryPriceEntry {
  value: number;
  unit: string;
  source: string;
}

// GlobalPetrolPrices.com 기반 국가별 에너지 매트릭스
export interface EnergyCountryData {
  gasoline?: number;
  diesel?: number;
  electricity?: number;
  natural_gas?: number;
  lpg?: number;
}

export interface EnergyMatrix {
  dataDate: string;
  updatedAt: string;
  source: string;
  license: string;
  updateFrequency: string;
  units: Record<string, { unit: string; label: string }>;
  worldAvg: Record<string, number>;
  countries: Record<string, EnergyCountryData>;
  gasolineRanking: { country: string; price: number; rank: number }[];
}

export interface LiveData {
  updatedAt: string;
  updatedAtKST: string;
  warDay?: number;
  warSummary: string;
  briefing?: WarBriefing;
  marketPrices: {
    brent: { price: number; change: number; unit: string; nameKo: string; source: string; note?: string };
    wti: { price: number; change: number; unit: string; nameKo: string; source: string; note?: string };
    naturalGas: { price: number; change: number; unit: string; nameKo: string; source: string; note?: string };
  };
  countryPrices?: Record<string, { gasoline?: CountryPriceEntry; lng?: CountryPriceEntry; electricity?: CountryPriceEntry }>;
  energyMatrix?: EnergyMatrix;
  trumpPosts?: TrumpPost[];
  warNews: WarNewsItem[];
}

const FALLBACK_PRICES: MarketPrice[] = [
  { nameKo: '브렌트유',    price: 106.41, unit: 'USD/배럴',   change: +2.53, timestamp: '2026-03-20', source: 'fallback' },
  { nameKo: 'WTI 원유',   price: 98.23,  unit: 'USD/배럴',   change: +2.80, timestamp: '2026-03-20', source: 'fallback' },
  { nameKo: '천연가스',   price: 3.095,  unit: 'USD/MMBtu',  change: -2.24, timestamp: '2026-03-20', source: 'fallback' },
];

// ── 에이전트가 업데이트하는 정적 JSON fetch ────────────────────
async function fetchAgentLiveData(): Promise<LiveData | null> {
  try {
    const res = await fetch('/live-data.json', {
      cache: 'no-cache',
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const data: LiveData = await res.json();
    const validated = LiveDataSchema.safeParse(data);
    if (!validated.success) {
      console.warn('[FlameMap] live-data.json validation failed:', validated.error.issues.slice(0, 3));
      return null;
    }
    return validated.data as LiveData;
  } catch {
    return null;
  }
}

// ── 시세 서버 프록시 ─────────────────────────────────
async function fetchYahooPrice(symbol: string): Promise<{ price: number; change: number } | null> {
  try {
    const url = `/api/yahoo?symbol=${symbol}&range=5d&interval=1d`;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    // 프록시가 이미 price/change 파싱해서 반환
    if (data?.price != null && data?.change != null) {
      return { price: data.price, change: data.change };
    }
    return null;
  } catch {
    return null;
  }
}

// ── 메인 export: 원자재 가격 조회 ──────────────────────────────
export async function fetchMarketPrices(): Promise<MarketPrice[]> {
  // 1순위: 에이전트 live-data.json
  const agentData = await fetchAgentLiveData();
  if (agentData?.marketPrices) {
    const mp = agentData.marketPrices;
    return [
      { nameKo: mp.brent.nameKo,     price: mp.brent.price,      unit: mp.brent.unit,      change: mp.brent.change,      timestamp: agentData.updatedAtKST, source: 'agent', note: mp.brent.note },
      { nameKo: mp.wti.nameKo,       price: mp.wti.price,        unit: mp.wti.unit,        change: mp.wti.change,        timestamp: agentData.updatedAtKST, source: 'agent', note: mp.wti.note },
      { nameKo: mp.naturalGas.nameKo,price: mp.naturalGas.price, unit: mp.naturalGas.unit, change: mp.naturalGas.change, timestamp: agentData.updatedAtKST, source: 'agent', note: mp.naturalGas.note },
    ];
  }

  // 2순위: 서버 프록시를 통한 시세 데이터
  const symbols = ['BZ=F', 'CL=F', 'NG=F'];
  const names   = ['브렌트유', 'WTI 원유', '천연가스'];
  const units   = ['USD/배럴', 'USD/배럴', 'USD/MMBtu'];

  const results = await Promise.allSettled(symbols.map(fetchYahooPrice));
  return results.map((r, i) => {
    if (r.status === 'fulfilled' && r.value) {
      return { nameKo: names[i], price: r.value.price, unit: units[i], change: r.value.change, timestamp: new Date().toISOString().slice(0, 10), source: 'live' as const };
    }
    return { ...FALLBACK_PRICES[i] };
  });
}

// ── 메인 export: 전쟁 뉴스 + 요약 조회 ─────────────────────────
export async function fetchWarNews(): Promise<{ news: WarNewsItem[]; summary: string; updatedAtKST: string }> {
  const agentData = await fetchAgentLiveData();
  if (agentData?.warNews?.length) {
    return {
      news: agentData.warNews,
      summary: agentData.warSummary ?? '',
      updatedAtKST: agentData.updatedAtKST,
    };
  }
  return { news: [], summary: '뉴스 데이터를 불러오는 중입니다.', updatedAtKST: '' };
}

// ── 전체 LiveData 반환 (컴포넌트용) ─────────────────────────────
export async function fetchLiveData(): Promise<LiveData | null> {
  return fetchAgentLiveData();
}


// ── GlobalPetrolPrices.com 에너지 DB ─────────────────────────────
export interface EnergyDB {
  _meta: {
    source: string; reference_date: string; collected_at: string;
    usd_krw: number; usd_krw_date: string;
    world_avg: Record<string, number>;
  };
  snapshots: Record<string, Record<string, Record<string, number>>>;
  country_snapshots: Record<string, Record<string, Record<string, number>>>;
}
let _energyDBCache: EnergyDB | null = null;

export async function fetchEnergyDatabase(): Promise<EnergyDB | null> {
  if (_energyDBCache) return _energyDBCache;
  try {
    const res = await fetch('/energy_database.json', { cache: 'no-cache', signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    _energyDBCache = await res.json();
    return _energyDBCache;
  } catch { return null; }
}

/** 환율 실데이터 (USD/KRW) — energy_database.json 우선, 폴백 1504 */
export async function getUsdKrw(): Promise<number> {
  const db = await fetchEnergyDatabase();
  return db?._meta?.usd_krw ?? 1504.17;
}
