// @ts-nocheck
import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Country, EnergyType } from '../data/types';
import { countryChangeRate, formatPrice, getFlagEmoji } from '../data/utils';

function MiniSparkline({ data }: { data: number[] }) {
  if (!data || data.length < 2) return null;
  const w = 60, h = 20;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
  const isUp = data[data.length - 1] > data[0];
  return (
    <svg width={w} height={h} className="inline-block">
      <polyline points={pts} fill="none" stroke={isUp ? '#f87171' : '#34d399'} strokeWidth={1.5} />
    </svg>
  );
}

interface TooltipProps {
  country: Country | null;
  activeCategory: EnergyType;
  x: number;
  y: number;
  showKRW?: boolean;
}

const ENERGY_LABELS: Record<EnergyType, { icon: string; name: string }> = {
  gasoline: { icon: '⛽', name: '휘발유' },
  diesel:   { icon: '🛢', name: '경유' },
  lng: { icon: '🔥', name: 'LNG' },
  elec_residential: { icon: '🏠', name: '전기(가정)' },
  elec_industrial: { icon: '🏭', name: '전기(산업)' },
  lpg: { icon: '💧', name: 'LPG' },
};

const Tooltip: React.FC<TooltipProps> = ({ country, activeCategory, x, y, showKRW = false }) => {
  if (!country) return null;

  const { baseline, current, unit } = country.prices[activeCategory];
  const delta = countryChangeRate(country, activeCategory);
  const isUp = delta > 0;
  const isDown = delta < 0;

  const TrendIcon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;
  const trendColor = isUp ? '#f87171' : isDown ? '#34d399' : '#fbbf24';
  const energyInfo = ENERGY_LABELS[activeCategory];

  // 모든 에너지 타입 변화율
  const allRates: { type: EnergyType; delta: number }[] = [
    'gasoline', 'lng', 'elec_residential', 'elec_industrial'
  ].map((t) => ({ type: t as EnergyType, delta: countryChangeRate(country, t as EnergyType) }));

  // 스파크라인: 최근 6개월 히스토리
  const historyAll = country.prices[activeCategory]?.history ?? [];
  const recentHistory = historyAll.slice(-6);
  const sparkData = recentHistory.map((h: any) => h.price ?? 0).filter((v: number) => v > 0);

  // 전쟁 전(2026-02 이전) 대비 변화율
  const preWarEntry = historyAll.find((h: any) => h.date < '2026-02');
  const preWarPrice = preWarEntry?.price ?? null;

  // 화면 오른쪽 경계 고려: x가 너무 크면 왼쪽으로
  const tooltipX = x + 220 > window.innerWidth - 20 ? x - 240 : x + 12;
  const tooltipY = Math.max(8, y - 10);

  return (
    <div
      className="absolute z-50 pointer-events-none"
      style={{ left: tooltipX, top: tooltipY }}
    >
      <div className="bg-slate-800/95 backdrop-blur-sm border border-slate-600 rounded-xl shadow-2xl p-4 w-56">
        {/* 국기 + 국가명 */}
        <div className="flex items-center gap-3 mb-3">
          <span className="flag-emoji" style={{ fontSize: '2rem', lineHeight: 1 }}>{getFlagEmoji(country.id)}</span>
          <div>
            <div className="font-bold text-white text-base leading-tight">{country.nameKo}</div>
            <div className="text-xs text-slate-400">{country.region}</div>
          </div>
        </div>

        {/* 현재 에너지 상세 */}
        <div className="bg-slate-700/60 rounded-lg p-2.5 mb-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1.5">
            <span>{energyInfo.icon}</span>
            <span>{energyInfo.name}</span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-xs text-slate-500">전쟁 전</div>
              <div className="text-sm text-slate-300 font-mono">{formatPrice(baseline, unit, showKRW)}</div>
            </div>
            <div className="text-slate-500 text-xs px-1">→</div>
            <div className="text-right">
              <div className="text-xs text-slate-500">현재</div>
              <div className="text-sm text-white font-mono font-medium">{formatPrice(current, unit, showKRW)}</div>
            </div>
          </div>
          <div
            className="flex items-center justify-center gap-1 mt-2 py-1.5 rounded-md text-sm font-bold"
            style={{ backgroundColor: `${trendColor}18`, color: trendColor }}
          >
            <TrendIcon className="w-3.5 h-3.5" />
            {isUp ? '+' : ''}{delta}% 변화
          </div>
        </div>

        {/* 스파크라인 + 변화율 */}
        {sparkData.length >= 2 && (
          <div className="bg-slate-700/40 rounded-lg px-2.5 py-2 mb-3 flex items-center gap-3">
            <div>
              <div className="text-[9px] text-slate-500 mb-1">최근 6개월</div>
              <MiniSparkline data={sparkData} />
            </div>
            {preWarPrice !== null && (
              <div className="text-right flex-1">
                <div className="text-[9px] text-slate-500">전쟁 전 대비</div>
                <div className={`text-xs font-bold ${current > preWarPrice ? 'text-red-400' : 'text-green-400'}`}>
                  {current > preWarPrice ? '+' : ''}{(((current - preWarPrice) / preWarPrice) * 100).toFixed(1)}%
                </div>
              </div>
            )}
          </div>
        )}

        {/* 모든 에너지 변화율 요약 */}
        <div className="grid grid-cols-2 gap-1">
          {allRates.map(({ type, delta: d }) => {
            const info = ENERGY_LABELS[type];
            const c = d > 0 ? '#f87171' : d < 0 ? '#34d399' : '#fbbf24';
            const isActive = type === activeCategory;
            return (
              <div
                key={type}
                className={`flex items-center justify-between px-1.5 py-1 rounded text-xs ${isActive ? 'bg-slate-700' : ''}`}
              >
                <span className="text-slate-500">{info.icon}</span>
                <span className="font-mono font-medium" style={{ color: c }}>
                  {d > 0 ? '+' : ''}{d}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Tooltip;
