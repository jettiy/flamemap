/**
 * CountryNewsPanel.tsx
 * 선택 국가의 에너지 관련 뉴스를 표시하는 패널
 *
 * 뉴스 소스: 서버 프록시(/api/news)를 통해 RSS 피드 조회
 * 국가명 키워드로 필터링 후 상위 3건 표시
 */

import React, { useState, useEffect, useCallback } from 'react';

/* ────────────────────────── 타입 ────────────────────────── */
export interface NewsItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
}

/* ────────────────────────── 상수 ────────────────────────── */
// 프록시를 통해 rss2json 호출 — API 엔드포인트 숨김
// feed_id만 전송 → 클라이언트에 외부 RSS URL 노출 없음
const NEWS_PROXY = '/api/news?feed_id=all&count=30';

/** 국가 ID → 영문 이름 (RSS 필터링 키워드) */
const COUNTRY_EN_NAME: Record<string, string> = {
  KR: 'South Korea',
  JP: 'Japan',
  CN: 'China',
  IN: 'India',
  SA: 'Saudi Arabia',
  AE: 'UAE',
  IR: 'Iran',
  IQ: 'Iraq',
  KW: 'Kuwait',
  QA: 'Qatar',
  OM: 'Oman',
  BH: 'Bahrain',
  YE: 'Yemen',
  US: 'United States',
  CA: 'Canada',
  MX: 'Mexico',
  BR: 'Brazil',
  AR: 'Argentina',
  VE: 'Venezuela',
  CO: 'Colombia',
  DE: 'Germany',
  FR: 'France',
  GB: 'UK',
  IT: 'Italy',
  ES: 'Spain',
  NL: 'Netherlands',
  PL: 'Poland',
  NO: 'Norway',
  RU: 'Russia',
  UA: 'Ukraine',
  TR: 'Turkey',
  AU: 'Australia',
  ID: 'Indonesia',
  MY: 'Malaysia',
  TH: 'Thailand',
  SG: 'Singapore',
  PH: 'Philippines',
  NG: 'Nigeria',
  DZ: 'Algeria',
  LY: 'Libya',
  EG: 'Egypt',
  AO: 'Angola',
  ZA: 'South Africa',
  AZ: 'Azerbaijan',
  KZ: 'Kazakhstan',
  PK: 'Pakistan',
  BD: 'Bangladesh',
  VN: 'Vietnam',
};

/** 에너지 관련 키워드 (general) */
const ENERGY_KEYWORDS = ['oil', 'energy', 'gas', 'fuel', 'petroleum', 'crude', 'LNG', 'barrel', 'opec'];

/* ────────────────────────── fetch 로직 ────────────────────────── */
interface RssItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
}

// 서버 프록시에서 모든 피드를 한 번에 받아옴 (RSS URL은 서버에서만 관리)
async function fetchAllFeeds(): Promise<RssItem[]> {
  const res = await fetch(NEWS_PROXY, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`News proxy HTTP ${res.status}`);
  const json = await res.json();
  if (json.status !== 'ok') throw new Error('News proxy error: ' + (json.error ?? 'unknown'));
  return json.items ?? [];
}

/** HTML 태그 제거 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&[a-z]+;/gi, ' ').trim();
}

/** 날짜 포맷 (YYYY-MM-DD 또는 간단 표기) */
function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  } catch {
    return dateStr.slice(0, 10);
  }
}

/**
 * 국가 ID를 받아 에너지 관련 뉴스 최대 3건 반환
 */
async function fetchCountryNews(countryId: string): Promise<NewsItem[]> {
  const countryName = COUNTRY_EN_NAME[countryId];

  // 서버 프록시에서 모든 피드를 한 번에 fetch
  const allItems = await fetchAllFeeds();

  if (allItems.length === 0) return [];

  // 1순위: 국가명 + 에너지 키워드 둘 다 포함
  // 2순위: 에너지 키워드만 포함 (국가 미언급 시 일반 에너지 뉴스)
  const scored = allItems.map((item) => {
    const text = `${item.title} ${item.description}`.toLowerCase();
    const hasCountry = countryName ? text.includes(countryName.toLowerCase()) : false;
    const hasEnergy = ENERGY_KEYWORDS.some((kw) => text.includes(kw.toLowerCase()));
    return { item, score: (hasCountry ? 10 : 0) + (hasEnergy ? 1 : 0) };
  });

  // score 0인 것(국가도 에너지도 없음) 제외, 내림차순 정렬
  const filtered = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ item }) => ({
      title: stripHtml(item.title),
      description: stripHtml(item.description).slice(0, 160),
      link: item.link,
      pubDate: item.pubDate,
      source: item.source,
    }));

  return filtered;
}

/* ────────────────────────── 컴포넌트 ────────────────────────── */
interface CountryNewsPanelProps {
  countryId: string;
  countryNameKo: string;
}

const CountryNewsPanel: React.FC<CountryNewsPanelProps> = ({ countryId, countryNameKo }) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const items = await fetchCountryNews(countryId);
      setNews(items);
    } catch {
      setError(true);
      setNews([]);
    } finally {
      setLoading(false);
    }
  }, [countryId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="rounded-xl bg-slate-800/60 border border-slate-700/60 overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/80 border-b border-slate-700/60">
        <span className="text-sm">🗞️</span>
        <h3 className="text-xs font-semibold text-slate-200">
          {countryNameKo} 에너지 뉴스
        </h3>
        <button
          onClick={load}
          disabled={loading}
          className="ml-auto text-[10px] text-slate-500 hover:text-slate-300 transition-colors disabled:opacity-40"
          title="새로고침"
        >
          {loading ? '⏳' : '↻'}
        </button>
      </div>

      {/* 본문 */}
      <div className="divide-y divide-slate-700/40">
        {loading && (
          <div className="px-3 py-4 flex flex-col gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse space-y-1">
                <div className="h-2.5 bg-slate-700 rounded w-full" />
                <div className="h-2.5 bg-slate-700 rounded w-4/5" />
                <div className="h-2 bg-slate-700/60 rounded w-2/5 mt-1" />
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="px-3 py-4 text-center text-xs text-slate-500">
            뉴스를 불러오지 못했어요.{' '}
            <button
              onClick={load}
              className="text-blue-400 hover:underline"
            >
              다시 시도
            </button>
          </div>
        )}

        {!loading && !error && news.length === 0 && (
          <div className="px-3 py-4 text-center text-xs text-slate-500">
            관련 뉴스를 찾지 못했어요.
          </div>
        )}

        {!loading && !error && news.map((item, idx) => (
          <div
            key={idx}
            className="block px-3 py-2.5 hover:bg-slate-700/40 transition-colors group"
          >
            {/* 제목 (2줄 클램프) */}
            <p
              className="text-xs text-slate-200 group-hover:text-white leading-snug font-medium"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {item.title}
            </p>

            {/* 설명 (1줄) + 자동요약 배지 */}
            {item.description && (
              <div className="flex items-start gap-1.5 mt-0.5">
                <span className="flex-shrink-0 text-[9px] px-1.5 py-0.5 rounded bg-blue-900/40 text-blue-400 border border-blue-700/40 font-medium leading-tight mt-0.5">
                  자동요약
                </span>
                <p
                  className="text-[10px] text-slate-500 leading-snug"
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {item.description}
                </p>
              </div>
            )}

            {/* 출처 + 날짜 + 링크 */}
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] text-blue-400/80">{item.source}</span>
              <span className="text-[10px] text-slate-600">·</span>
              <span className="text-[10px] text-slate-600">{formatDate(item.pubDate)}</span>
              {item.link && (
                <>
                  <span className="text-[10px] text-slate-600">·</span>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-blue-400 hover:text-blue-300 transition-colors"
                    onClick={e => e.stopPropagation()}
                  >
                    출처 ↗
                  </a>
                </>
              )}
              <span className="ml-auto text-[10px] text-slate-600 group-hover:text-slate-400 transition-colors">
                {item.link ? '' : ''}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CountryNewsPanel;
export { fetchCountryNews };
