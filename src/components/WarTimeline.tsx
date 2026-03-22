import React, { useState } from 'react';
import { warTimeline, WarEvent } from '../data/warTimeline';

// ── 상수 ──────────────────────────────────────────────────────
type FilterCategory = '전체' | '군사' | '외교' | '에너지' | '제재';

const CATEGORY_MAP: Record<WarEvent['category'], string> = {
  military:   '군사',
  diplomatic: '외교',
  energy:     '에너지',
  sanction:   '제재',
};

const FILTER_BUTTONS: FilterCategory[] = ['전체', '군사', '외교', '에너지', '제재'];

const IMPACT_CONFIG: Record<
  WarEvent['impact'],
  { emoji: string; label: string; badge: string; dot: string }
> = {
  critical: { emoji: '🔴', label: '심각',  badge: 'bg-red-500/20 text-red-400 border border-red-500/40',         dot: 'bg-red-500'    },
  high:     { emoji: '🟠', label: '높음',  badge: 'bg-orange-500/20 text-orange-400 border border-orange-500/40', dot: 'bg-orange-500' },
  medium:   { emoji: '🟡', label: '중간',  badge: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40', dot: 'bg-yellow-500' },
  low:      { emoji: '🔵', label: '낮음',  badge: 'bg-blue-500/20 text-blue-400 border border-blue-500/40',       dot: 'bg-blue-500'   },
};

const CATEGORY_ICON: Record<WarEvent['category'], string> = {
  military:   '⚔️',
  diplomatic: '🤝',
  energy:     '⛽',
  sanction:   '🚫',
};

function formatDate(dateStr: string): string {
  const [, mm, dd] = dateStr.split('-');
  return `${parseInt(mm, 10)}월 ${parseInt(dd, 10)}일`;
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────
const WarTimeline: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('전체');

  // 최신순(내림차순) 정렬
  const sortedTimeline = [...warTimeline].sort((a, b) => b.date.localeCompare(a.date));

  const filteredEvents =
    activeFilter === '전체'
      ? sortedTimeline
      : sortedTimeline.filter((e) => CATEGORY_MAP[e.category] === activeFilter);

  const totalEvents = filteredEvents.length;
  const cumulativePriceImpact = filteredEvents
    .reduce((sum, e) => sum + e.priceImpact, 0)
    .toFixed(1);
  const isPositiveImpact = parseFloat(cumulativePriceImpact) >= 0;

  return (
    <div className="flex flex-col h-full bg-slate-950 overflow-y-auto">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-slate-950 border-b border-slate-800">
        <div className="px-4 pt-3 pb-2">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            ⚔️ 전쟁 타임라인
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            이란-미국/이스라엘 충돌 · 2026년 2월 28일 시작 · 최신순
          </p>
        </div>

        {/* 요약 스트립 */}
        <div className="mx-4 mb-2 bg-slate-800/70 rounded-xl px-3 py-2 flex items-center justify-between gap-2 border border-slate-700">
          <div className="text-xs text-slate-400">
            <span className="font-semibold text-white">{totalEvents}</span>건의 주요 사건
          </div>
          <div className={`text-xs font-bold ${isPositiveImpact ? 'text-red-400' : 'text-green-400'}`}>
            누적 유가 영향 {isPositiveImpact ? '▲ +' : '▼ '}{cumulativePriceImpact}%
          </div>
        </div>

        {/* 필터 버튼 */}
        <div className="flex gap-1.5 px-4 pb-3 overflow-x-auto scrollbar-hide">
          {FILTER_BUTTONS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                activeFilter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* 타임라인 이벤트 목록 */}
      <div className="px-4 py-3 flex flex-col gap-0">
        {filteredEvents.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-8">해당 카테고리의 사건이 없습니다.</p>
        )}
        {filteredEvents.map((event, idx) => {
          const impactCfg = IMPACT_CONFIG[event.impact];
          const isLast = idx === filteredEvents.length - 1;
          const priceUp = event.priceImpact >= 0;

          return (
            <div key={`${event.date}-${idx}`} className="flex gap-3">
              {/* 타임라인 선 & 점 */}
              <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ring-2 ring-slate-950 ${impactCfg.dot}`} />
                {!isLast && <div className="w-px flex-1 bg-slate-700 mt-1" />}
              </div>

              {/* 이벤트 카드 */}
              <div className="pb-4 flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs text-slate-500 font-mono">{formatDate(event.date)}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${impactCfg.badge}`}>
                    {impactCfg.emoji} {impactCfg.label}
                  </span>
                  <span className="text-sm">{CATEGORY_ICON[event.category]}</span>
                </div>
                <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-white leading-snug">{event.title}</h3>
                    <span className={`text-xs font-bold flex-shrink-0 ${priceUp ? 'text-red-400' : 'text-green-400'}`}>
                      {priceUp ? '▲ +' : '▼ '}{event.priceImpact}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{event.description}</p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="text-xs text-slate-600 bg-slate-900/50 px-2 py-0.5 rounded-full">
                      {CATEGORY_ICON[event.category]} {CATEGORY_MAP[event.category]}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="h-4" />
    </div>
  );
};

export default WarTimeline;
