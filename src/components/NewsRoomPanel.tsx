/**
 * NewsRoomPanel.tsx
 * 뉴스룸 — 블룸버그/로이터 중심 경제 뉴스 + Fear & Greed 지표
 *
 * 레이아웃:
 * - 좌측: 메인 뉴스 피드 (카테고리 필터 + 임팩트 뱃지)
 * - 우측 상: Fear & Greed 게이지
 * - 우측 하: 트렌딩 키워드
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';

/* ────────────────────────── 타입 ────────────────────────── */
interface NewsItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
  category: string;
}

interface FearGreedData {
  value: number;
  classification: string;
  date: string;
}

type NewsCategory = 'all' | 'financial' | 'energy' | 'economy';

/* ────────────────────────── 상수 ────────────────────────── */
const NEWS_PROXY = '/api/news?feed_id=all&count=50';
const FEAR_GREED_PROXY = '/api/fear-greed';

const CATEGORY_TABS: { id: NewsCategory; label: string; icon: string }[] = [
  { id: 'all',       label: '전체',     icon: '📰' },
  { id: 'financial', label: '금융',     icon: '💰' },
  { id: 'energy',    label: '에너지',   icon: '⚡' },
  { id: 'economy',   label: '거시경제', icon: '🏦' },
];

/** 에너지 키워드 → 임팩트 분류 */
const IMPACT_KEYWORDS: Record<string, { level: 'high' | 'medium' | 'low'; label: string; icon: string }> = {
  oil:           { level: 'high',   label: '유가',     icon: '🛢️' },
  crude:         { level: 'high',   label: '원유',     icon: '🛢️' },
  brent:         { level: 'high',   label: '브렌트',   icon: '🛢️' },
  OPEC:          { level: 'high',   label: 'OPEC',     icon: '🏛️' },
  sanction:      { level: 'high',   label: '제재',     icon: '🚫' },
  war:           { level: 'high',   label: '전쟁',     icon: '⚔️' },
  iran:          { level: 'high',   label: '이란',     icon: '🇮🇷' },
  israel:        { level: 'high',   label: '이스라엘', icon: '🇮🇱' },
  inflation:     { level: 'medium', label: '인플레',   icon: '📈' },
  'interest rate': { level: 'medium', label: '금리',     icon: '🏦' },
  fed:           { level: 'medium', label: 'Fed',      icon: '🏛️' },
  recession:     { level: 'medium', label: '경기침체', icon: '📉' },
  tariff:        { level: 'medium', label: '관세',     icon: '📜' },
  gas:           { level: 'medium', label: '가스',     icon: '🔥' },
  LNG:           { level: 'medium', label: 'LNG',      icon: '🚢' },
  market:        { level: 'low',    label: '시장',     icon: '📊' },
  stock:         { level: 'low',    label: '주식',     icon: '📈' },
  dollar:        { level: 'low',    label: '달러',     icon: '💵' },
  trade:         { level: 'low',    label: '무역',     icon: '🚢' },
};

const IMPACT_STYLES: Record<string, string> = {
  high:   'bg-red-500/20 text-red-400 border-red-500/40',
  medium: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
  low:    'bg-blue-500/20 text-blue-400 border-blue-500/40',
};

/* ────────────────────────── 유틸 ────────────────────────── */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&[a-z]+;/gi, ' ').trim();
}

function timeAgo(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 60) return `${diffMin}분 전`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}시간 전`;
    const diffDay = Math.floor(diffHr / 24);
    return `${diffDay}일 전`;
  } catch {
    return dateStr.slice(0, 10);
  }
}

/** 뉴스 제목에서 임팩트 키워드 추출 */
function extractImpacts(title: string, description: string): { level: 'high' | 'medium' | 'low'; label: string; icon: string }[] {
  const text = `${title} ${description}`.toLowerCase();
  const found: { level: 'high' | 'medium' | 'low'; label: string; icon: string }[] = [];
  const seen = new Set<string>();
  for (const [kw, info] of Object.entries(IMPACT_KEYWORDS)) {
    if (text.includes(kw.toLowerCase()) && !seen.has(info.label)) {
      seen.add(info.label);
      found.push(info);
    }
  }
  // 정렬: high → medium → low
  const order = { high: 0, medium: 1, low: 2 };
  return found.sort((a, b) => order[a.level] - order[b.level]);
}

/** Fear & Greed → 색상/레이블 */
function fgMeta(value: number): { color: string; bg: string; label: string; emoji: string } {
  if (value <= 20) return { color: '#ef4444', bg: 'bg-red-500', label: '극도공포', emoji: '😱' };
  if (value <= 35) return { color: '#f97316', bg: 'bg-orange-500', label: '공포', emoji: '😨' };
  if (value <= 50) return { color: '#eab308', bg: 'bg-yellow-500', label: '중립', emoji: '😐' };
  if (value <= 65) return { color: '#84cc16', bg: 'bg-lime-500', label: '탐욕', emoji: '😏' };
  if (value <= 80) return { color: '#22c55e', bg: 'bg-green-500', label: '탐욕', emoji: '🤑' };
  return { color: '#16a34a', bg: 'bg-green-600', label: '극도탐욕', emoji: '🤯' };
}

/* ────────────────────────── fetch ────────────────────────── */
async function fetchNews(): Promise<NewsItem[]> {
  const res = await fetch(NEWS_PROXY, { signal: AbortSignal.timeout(12000) });
  if (!res.ok) throw new Error(`News proxy HTTP ${res.status}`);
  const json = await res.json();
  if (json.status !== 'ok') throw new Error('News proxy error');
  return (json.items ?? []).map((item: any) => ({
    title: stripHtml(item.title ?? ''),
    description: stripHtml(item.description ?? '').slice(0, 200),
    link: item.link ?? '',
    pubDate: item.pubDate ?? '',
    source: item.source ?? '',
    category: item.category ?? 'general',
  }));
}

async function fetchFearGreed(): Promise<FearGreedData> {
  try {
    const res = await fetch(FEAR_GREED_PROXY, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error('F&G API error');
    const json = await res.json();
    if (json.current) {
      return json.current;
    }
  } catch { /* fallback */ }
  return { value: 45, classification: 'Fear', date: new Date().toISOString().slice(0, 10) };
}

/* ────────────────────────── 컴포넌트 ────────────────────────── */

/** Fear & Greed 게이지 */
const FearGreedGauge: React.FC<{ data: FearGreedData | null; loading: boolean }> = ({ data, loading }) => {
  if (loading || !data) {
    return (
      <div className="rounded-xl bg-slate-800/60 border border-slate-700/60 p-4 animate-pulse">
        <div className="h-4 bg-slate-700 rounded w-24 mb-3" />
        <div className="h-20 bg-slate-700 rounded-full w-20 mx-auto" />
      </div>
    );
  }

  const meta = fgMeta(data.value);
  const rotation = (data.value / 100) * 180 - 90; // -90° ~ +90°

  return (
    <div className="rounded-xl bg-slate-800/60 border border-slate-700/60 p-4">
      {/* 헤더 */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm">🎭</span>
        <h3 className="text-xs font-semibold text-slate-200">시장 심리 지표</h3>
        <span className="text-[9px] text-slate-500 ml-auto">Fear & Greed</span>
      </div>

      {/* 게이지 */}
      <div className="relative flex flex-col items-center">
        <svg viewBox="0 0 200 120" className="w-40 h-24">
          {/* 배경 반원 */}
          <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#334155" strokeWidth="16" strokeLinecap="round" />
          {/* 컬러 구간 */}
          <path d="M 20 100 A 80 80 0 0 1 60 30" fill="none" stroke="#ef4444" strokeWidth="16" strokeLinecap="round" opacity="0.7" />
          <path d="M 50 40 A 80 80 0 0 1 90 22" fill="none" stroke="#f97316" strokeWidth="16" strokeLinecap="round" opacity="0.7" />
          <path d="M 80 22 A 80 80 0 0 1 120 22" fill="none" stroke="#eab308" strokeWidth="16" strokeLinecap="round" opacity="0.7" />
          <path d="M 110 22 A 80 80 0 0 1 150 40" fill="none" stroke="#84cc16" strokeWidth="16" strokeLinecap="round" opacity="0.7" />
          <path d="M 140 30 A 80 80 0 0 1 180 100" fill="none" stroke="#22c55e" strokeWidth="16" strokeLinecap="round" opacity="0.7" />
          {/* 바늘 */}
          <line
            x1="100" y1="100"
            x2={100 + 60 * Math.sin((rotation * Math.PI) / 180)}
            y2={100 - 60 * Math.cos((rotation * Math.PI) / 180)}
            stroke={meta.color} strokeWidth="3" strokeLinecap="round"
          />
          <circle cx="100" cy="100" r="6" fill={meta.color} />
        </svg>

        {/* 수치 */}
        <div className="text-center -mt-1">
          <span className="text-3xl font-bold" style={{ color: meta.color }}>{data.value}</span>
          <div className="flex items-center justify-center gap-1 mt-0.5">
            <span className="text-sm">{meta.emoji}</span>
            <span className="text-xs font-medium text-slate-300">{meta.label}</span>
          </div>
        </div>
      </div>

      {/* 스케일 라벨 */}
      <div className="flex justify-between px-2 mt-1">
        <span className="text-[9px] text-red-400">공포</span>
        <span className="text-[9px] text-yellow-400">중립</span>
        <span className="text-[9px] text-green-400">탐욕</span>
      </div>
    </div>
  );
};

/** 트렌딩 키워드 */
const TrendingKeywords: React.FC<{ news: NewsItem[] }> = ({ news }) => {
  const keywords = useMemo(() => {
    const freq: Record<string, number> = {};
    for (const item of news.slice(0, 30)) {
      const impacts = extractImpacts(item.title, item.description);
      for (const imp of impacts) {
        freq[imp.label] = (freq[imp.label] || 0) + 1;
      }
    }
    return Object.entries(freq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8);
  }, [news]);

  if (keywords.length === 0) return null;

  return (
    <div className="rounded-xl bg-slate-800/60 border border-slate-700/60 p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm">🔥</span>
        <h3 className="text-xs font-semibold text-slate-200">트렌딩 키워드</h3>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {keywords.map(([label, count]) => {
          const info = Object.values(IMPACT_KEYWORDS).find(k => k.label === label);
          const level = info?.level ?? 'low';
          return (
            <span
              key={label}
              className={`text-[10px] px-2 py-1 rounded-full border font-medium ${IMPACT_STYLES[level]}`}
            >
              {info?.icon} {label} <span className="opacity-60">×{count}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
};

/** 뉴스 카드 */
const NewsCard: React.FC<{ item: NewsItem; featured?: boolean }> = ({ item, featured }) => {
  const impacts = extractImpacts(item.title, item.description);

  return (
    <div
      className={`rounded-xl border transition-colors group ${
        featured
          ? 'bg-slate-800/80 border-slate-600/60 p-4'
          : 'bg-slate-800/40 border-slate-700/40 p-3 hover:bg-slate-800/70'
      }`}
    >
      {/* 임팩트 뱃지 */}
      {impacts.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {impacts.slice(0, 3).map((imp) => (
            <span
              key={imp.label}
              className={`text-[9px] px-1.5 py-0.5 rounded border font-medium ${IMPACT_STYLES[imp.level]}`}
            >
              {imp.icon} {imp.label}
            </span>
          ))}
        </div>
      )}

      {/* 제목 */}
      <p
        className={`text-slate-200 group-hover:text-white leading-snug font-medium ${
          featured ? 'text-sm' : 'text-xs'
        }`}
        style={{
          display: '-webkit-box',
          WebkitLineClamp: featured ? 3 : 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {item.title}
      </p>

      {/* 설명 (featured만) */}
      {featured && item.description && (
        <p
          className="text-[11px] text-slate-500 leading-snug mt-1"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {item.description}
        </p>
      )}

      {/* 메타 */}
      <div className="flex items-center gap-1.5 mt-2">
        <span className="text-[10px] font-medium text-blue-400/80">{item.source}</span>
        <span className="text-[10px] text-slate-600">·</span>
        <span className="text-[10px] text-slate-600">{timeAgo(item.pubDate)}</span>
        {item.link && (
          <>
            <span className="text-[10px] text-slate-600">·</span>
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-blue-400 hover:text-blue-300 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              원문 ↗
            </a>
          </>
        )}
      </div>
    </div>
  );
};

/* ────────────────────────── 메인 패널 ────────────────────────── */
const NewsRoomPanel: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [fgData, setFgData] = useState<FearGreedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeCategory, setActiveCategory] = useState<NewsCategory>('all');

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [newsResult, fgResult] = await Promise.allSettled([
        fetchNews(),
        fetchFearGreed(),
      ]);
      if (newsResult.status === 'fulfilled') setNews(newsResult.value);
      else setError(true);
      if (fgResult.status === 'fulfilled') setFgData(fgResult.value);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // 카테고리 필터 + 시간순 정렬
  const filteredNews = useMemo(() => {
    let items = news;
    if (activeCategory !== 'all') {
      items = items.filter((n) => n.category === activeCategory);
    }
    // pubDate 내림차순
    return items.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
  }, [news, activeCategory]);

  const featuredNews = filteredNews[0];
  const restNews = filteredNews.slice(1);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* 카테고리 필터 + 새로고침 */}
      <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2 border-b border-slate-700/60">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border ${
                activeCategory === tab.id
                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
              }`}
            >
              <span className="text-sm leading-none">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="ml-auto flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors disabled:opacity-40 border border-slate-700/60"
          title="새로고침"
        >
          {loading ? '⏳' : '↻'} 새로고침
        </button>
      </div>

      {/* 본문: 3컬럼 (데스크탑) / 1컬럼 (모바일) */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {loading && (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse space-y-2 rounded-xl bg-slate-800/40 border border-slate-700/40 p-3">
                <div className="h-3 bg-slate-700 rounded w-1/4" />
                <div className="h-4 bg-slate-700 rounded w-full" />
                <div className="h-4 bg-slate-700 rounded w-3/4" />
                <div className="h-3 bg-slate-700/60 rounded w-1/3" />
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="p-8 text-center text-sm text-slate-500">
            뉴스를 불러오지 못했어요.{' '}
            <button onClick={load} className="text-blue-400 hover:underline">다시 시도</button>
          </div>
        )}

        {!loading && !error && (
          <div className="h-full flex gap-3 p-3">
            {/* 좌측: 메인 뉴스 피드 */}
            <div className="flex-1 min-w-0 overflow-y-auto space-y-2 pr-1">
              {/* Featured 뉴스 */}
              {featuredNews && (
                <NewsCard item={featuredNews} featured />
              )}

              {/* 나머지 뉴스 */}
              {restNews.map((item, idx) => (
                <NewsCard key={`${item.link}-${idx}`} item={item} />
              ))}

              {filteredNews.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-500">
                  해당 카테고리의 뉴스가 없습니다.
                </div>
              )}
            </div>

            {/* 우측: F&G + 트렌딩 (데스크탑만) */}
            <div className="hidden sm:flex flex-col gap-3 w-72 flex-shrink-0">
              <FearGreedGauge data={fgData} loading={loading} />
              <TrendingKeywords news={news} />

              {/* 소스 정보 */}
              <div className="rounded-xl bg-slate-800/60 border border-slate-700/60 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm">📡</span>
                  <h3 className="text-xs font-semibold text-slate-200">뉴스 소스</h3>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { name: 'Bloomberg', icon: '📊' },
                    { name: 'Reuters', icon: '📰' },
                    { name: 'WSJ', icon: '📜' },
                    { name: 'FT', icon: '🏦' },
                    { name: 'CNBC', icon: '📺' },
                    { name: 'BBC', icon: '🌐' },
                    { name: 'Al Jazeera', icon: '🕌' },
                  ].map((s) => (
                    <div key={s.name} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-700/30">
                      <span className="text-[10px]">{s.icon}</span>
                      <span className="text-[10px] text-slate-400">{s.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 모바일: F&G 게이지 (접이식) */}
            <div className="sm:hidden">
              <FearGreedGauge data={fgData} loading={loading} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsRoomPanel;
