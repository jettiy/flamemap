import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Country, EnergyType } from '../data/types';
import { countryChangeRate, formatPrice, getFlagEmoji } from '../data/utils';

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
