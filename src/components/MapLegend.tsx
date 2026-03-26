import React from 'react';
import { EnergyType } from '../data/types';

// 에너지 타입 한국어 레이블
const CATEGORY_LABELS: Record<EnergyType, string> = {
  gasoline: '휘발유',
  diesel: '경유',
  lng: 'LNG',
  elec_residential: '전기 (가정용)',
  elec_industrial: '전기 (산업용)',
  lpg: 'LPG',
};

interface MapLegendProps {
  category: EnergyType;
  mapMode?: 'price' | 'import' | 'security';
}

interface LegendItem {
  color: string;
  label: string;
}

const PRICE_LEGEND_ITEMS: LegendItem[] = [
  { color: '#22c55e', label: '하락 (<0%)' },
  { color: '#fbbf24', label: '0~10%' },
  { color: '#f97316', label: '10~20%' },
  { color: '#ef4444', label: '20~40%' },
  { color: '#991b1b', label: '40%+' },
];

const IMPORT_LEGEND_ITEMS: LegendItem[] = [
  { color: '#dc2626', label: '80%+ 매우 취약' },
  { color: '#f97316', label: '50~80% 취약' },
  { color: '#facc15', label: '20~50% 보통' },
  { color: '#4ade80', label: '20% 미만 안전' },
  { color: '#22c55e', label: '순수출국' },
];

const SECURITY_LEGEND_ITEMS: LegendItem[] = [
  { color: '#dc2626', label: '80%+ 매우 위험' },
  { color: '#f97316', label: '50~80% 위험' },
  { color: '#facc15', label: '20~50% 보통' },
  { color: '#4ade80', label: '20% 미만 안전' },
  { color: '#22c55e', label: '에너지 독립국' },
];

const NO_DATA_COLOR = '#334155';

const MapLegend: React.FC<MapLegendProps> = ({ category, mapMode = 'price' }) => {
  if (mapMode === 'import') {
    return (
      <div className="bg-slate-900/90 backdrop-blur-sm border border-slate-700 rounded-lg p-3 min-w-[180px] shadow-xl">
        {/* 제목 */}
        <div className="mb-2">
          <p className="text-slate-100 text-xs font-semibold">🔗 에너지 수입 의존도</p>
          <p className="text-slate-400 text-[10px] mt-0.5">
            출처: IEA, BP Statistical Review 2024
          </p>
        </div>

        {/* 범례 아이템 목록 */}
        <div className="space-y-1 mt-2">
          {IMPORT_LEGEND_ITEMS.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-sm flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-slate-300 text-[10px]">{item.label}</span>
            </div>
          ))}
          {/* 데이터 없음 */}
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-sm flex-shrink-0"
              style={{ backgroundColor: NO_DATA_COLOR }}
            />
            <span className="text-slate-400 text-[10px]">데이터 없음</span>
          </div>
        </div>

        {/* 하단 설명 */}
        <div className="mt-2 pt-2 border-t border-slate-700">
          <p className="text-slate-500 text-[9px] leading-relaxed">
            호르무즈 해협 봉쇄 시<br />
            의존도 높은 국가일수록 위험↑
          </p>
        </div>
      </div>
    );
  }

  if (mapMode === 'security') {
    return (
      <div className="bg-slate-900/90 backdrop-blur-sm border border-slate-700 rounded-lg p-3 min-w-[180px] shadow-xl">
        <div className="mb-2">
          <p className="text-slate-100 text-xs font-semibold">🛡️ 에너지 안보 지수</p>
          <p className="text-slate-400 text-[10px] mt-0.5">
            출처: IEA, BP Statistical Review 2024
          </p>
        </div>
        <div className="space-y-1 mt-2">
          {SECURITY_LEGEND_ITEMS.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-sm flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-slate-300 text-[10px]">{item.label}</span>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: NO_DATA_COLOR }} />
            <span className="text-slate-400 text-[10px]">데이터 없음</span>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-700">
          <p className="text-slate-500 text-[9px] leading-relaxed">
            에너지 자립도 기반 안보 취약성<br />
            수입 의존도 높을수록 위험↑
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 backdrop-blur-sm border border-slate-700 rounded-lg p-3 min-w-[180px] shadow-xl">
      {/* 제목 */}
      <div className="mb-2">
        <p className="text-slate-100 text-xs font-semibold">
          가격 변화율 — {CATEGORY_LABELS[category]}
        </p>
        <p className="text-slate-400 text-[10px] mt-0.5">
          기준: 2026.01 (전쟁 전) → 2026.03 (현재)
        </p>
      </div>

      {/* 그라디언트 바 */}
      <div className="mb-1.5">
        <div
          className="w-full h-3 rounded-full"
          style={{
            background:
              'linear-gradient(to right, #22c55e, #fbbf24, #f97316, #ef4444, #991b1b)',
          }}
        />
        {/* 퍼센트 레이블 */}
        <div className="flex justify-between mt-0.5">
          <span className="text-slate-400 text-[9px]">↓</span>
          <span className="text-slate-400 text-[9px]">0%</span>
          <span className="text-slate-400 text-[9px]">10%</span>
          <span className="text-slate-400 text-[9px]">20%</span>
          <span className="text-slate-400 text-[9px]">40%+</span>
        </div>
      </div>

      {/* 범례 아이템 목록 */}
      <div className="space-y-1 mt-2">
        {PRICE_LEGEND_ITEMS.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-sm flex-shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-slate-300 text-[10px]">{item.label}</span>
          </div>
        ))}
        {/* 데이터 없음 */}
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-sm flex-shrink-0"
            style={{ backgroundColor: NO_DATA_COLOR }}
          />
          <span className="text-slate-400 text-[10px]">데이터 없음</span>
        </div>
      </div>

      {/* 하단 설명 */}
      <div className="mt-2 pt-2 border-t border-slate-700">
        <p className="text-slate-500 text-[9px] leading-relaxed">
          이란–미국/이스라엘 전쟁 영향<br />
          에너지 가격 변동 현황 (USD 기준)
        </p>
      </div>
    </div>
  );
};

export default MapLegend;
