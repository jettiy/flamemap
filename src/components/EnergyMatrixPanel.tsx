import React, { useState, useEffect } from 'react';
import { fetchLiveData, EnergyMatrix } from '../data/eiaService';
import { ENERGY_DATA_REFERENCE_DATE } from '../data/constants';

type EnergyKey = 'gasoline' | 'diesel' | 'electricity' | 'natural_gas' | 'lpg';

const TABS: { key: EnergyKey; label: string; icon: string; unit: string }[] = [
  { key: 'gasoline',    label: '휘발유',   icon: '⛽', unit: 'USD/L' },
  { key: 'diesel',      label: '경유',     icon: '🛢',  unit: 'USD/L' },
  { key: 'electricity', label: '전력요금', icon: '⚡', unit: 'USD/kWh' },
  { key: 'natural_gas', label: '천연가스', icon: '🔥', unit: 'USD/kWh' },
  { key: 'lpg',         label: 'LPG',      icon: '💧', unit: 'USD/L' },
];

const FLAG_MAP: Record<string, string> = {
  "South Korea":"🇰🇷","USA":"🇺🇸","Japan":"🇯🇵","China":"🇨🇳","Germany":"🇩🇪",
  "UK":"🇬🇧","France":"🇫🇷","Russia":"🇷🇺","India":"🇮🇳","Saudi Arabia":"🇸🇦",
  "Iran":"🇮🇷","UAE":"🇦🇪","Qatar":"🇶🇦","Australia":"🇦🇺","Canada":"🇨🇦",
  "Norway":"🇳🇴","Singapore":"🇸🇬","Vietnam":"🇻🇳","Taiwan":"🇹🇼","Malaysia":"🇲🇾",
  "Indonesia":"🇮🇩","Turkey":"🇹🇷","Brazil":"🇧🇷","Israel":"🇮🇱","Hong Kong":"🇭🇰",
  "Libya":"🇱🇾","Venezuela":"🇻🇪","Kuwait":"🇰🇼","Algeria":"🇩🇿",
  "Netherlands":"🇳🇱","Denmark":"🇩🇰",
};

interface EnergyMatrixPanelProps {}

const EnergyMatrixPanel: React.FC<EnergyMatrixPanelProps> = () => {
  const [matrix, setMatrix] = useState<EnergyMatrix | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<EnergyKey>('gasoline');

  useEffect(() => {
    setLoading(true);
    fetchLiveData()
      .then((d) => setMatrix(d?.energyMatrix ?? null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-3 p-4">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="h-16 rounded-xl bg-slate-800/50 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!matrix) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-slate-500 gap-2">
        <span className="text-4xl">⚡</span>
        <p className="text-sm">에너지 가격 데이터를 불러오는 중이에요.</p>
      </div>
    );
  }

  const tabInfo = TABS.find(t => t.key === tab)!;
  const worldAvg = matrix.worldAvg[tab] ?? 0;

  // 해당 탭 데이터가 있는 국가 + 가격순 정렬
  const ranked = Object.entries(matrix.countries)
    .filter(([, v]) => v[tab] !== undefined)
    .map(([country, v]) => ({ country, price: v[tab] as number }))
    .sort((a, b) => a.price - b.price);

  const minP = ranked[0]?.price ?? 0;
  const maxP = ranked[ranked.length - 1]?.price ?? 1;

  function barWidth(p: number) {
    return Math.max(4, Math.round(((p - minP) / Math.max(maxP - minP, 0.001)) * 100));
  }

  function priceColor(p: number): string {
    const ratio = (p - minP) / Math.max(maxP - minP, 0.001);
    if (ratio < 0.33) return 'text-emerald-400';
    if (ratio < 0.66) return 'text-amber-400';
    return 'text-red-400';
  }

  function barColor(p: number): string {
    const ratio = (p - minP) / Math.max(maxP - minP, 0.001);
    if (ratio < 0.33) return 'bg-emerald-500/60';
    if (ratio < 0.66) return 'bg-amber-500/60';
    return 'bg-red-500/60';
  }

  return (
    <div className="flex flex-col h-full bg-slate-950 overflow-hidden">
      {/* 헤더 */}
      <div className="flex-shrink-0 border-b border-slate-800 px-4 pt-3 pb-0">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-sm font-bold text-white">🌍 국가별 에너지 요금 비교</h2>
          <span className="text-xs text-slate-500 ml-auto">출처: GlobalPetrolPrices.com</span>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <p className="text-xs text-slate-600">
            기준일: {matrix.dataDate} · 매주 업데이트 · {matrix.license}
          </p>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400 font-medium flex-shrink-0">
            기준일: {ENERGY_DATA_REFERENCE_DATE}
          </span>
        </div>

        {/* 에너지 종류 탭 */}
        <div className="flex gap-0 overflow-x-auto scrollbar-hide -mx-1">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                tab === t.key
                  ? 'border-blue-500 text-blue-300'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 세계 평균 배지 */}
      <div className="flex-shrink-0 px-4 py-2 flex items-center gap-2 border-b border-slate-800/50">
        <span className="text-xs text-slate-500">세계 평균</span>
        <span className="text-sm font-bold text-white">{worldAvg.toFixed(3)}</span>
        <span className="text-xs text-slate-500">{tabInfo.unit}</span>
        <span className="ml-auto text-xs text-slate-600">{ranked.length}개국</span>
      </div>

      {/* 랭킹 리스트 */}
      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-1.5">
        {ranked.map(({ country, price }, i) => {
          const flag = FLAG_MAP[country] ?? '🏳️';
          const vsAvg = price - worldAvg;
          const isKR = country === 'South Korea';

          return (
            <div
              key={country}
              className={`rounded-xl px-3 py-2.5 border transition-colors ${
                isKR
                  ? 'bg-blue-950/40 border-blue-700/40'
                  : 'bg-slate-800/40 border-slate-700/30 hover:bg-slate-800/70'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                {/* 순위 */}
                <span className={`text-xs font-mono w-6 text-center flex-shrink-0 ${
                  i < 3 ? 'text-amber-400 font-bold' : 'text-slate-500'
                }`}>
                  {i < 3 ? ['🥇','🥈','🥉'][i] : `${i+1}`}
                </span>

                {/* 국기 + 국가명 */}
                <span className="flag-emoji text-base flex-shrink-0">{flag}</span>
                <span className={`text-xs font-semibold flex-1 min-w-0 truncate ${isKR ? 'text-blue-200' : 'text-white'}`}>
                  {country}
                </span>

                {/* 가격 */}
                <span className={`text-sm font-bold flex-shrink-0 ${priceColor(price)}`}>
                  {price.toFixed(3)}
                </span>
                <span className="text-xs text-slate-500 flex-shrink-0">{tabInfo.unit}</span>

                {/* vs 세계평균 */}
                <span className={`text-xs flex-shrink-0 px-1.5 py-0.5 rounded-full ${
                  vsAvg <= 0
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {vsAvg > 0 ? '+' : ''}{vsAvg.toFixed(3)}
                </span>
              </div>

              {/* 바 차트 */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${barColor(price)}`}
                    style={{ width: `${barWidth(price)}%` }}
                  />
                </div>
                {/* 세계평균 마커 */}
                <div className="w-1 h-2 bg-slate-500/60 rounded-full flex-shrink-0" title="세계 평균" />
              </div>
            </div>
          );
        })}

        {/* 출처 */}
        <p className="text-xs text-slate-600 text-center pt-2 pb-1">
          출처: GlobalPetrolPrices.com (CC BY-NC-ND 3.0) · {matrix.dataDate}
        </p>
      </div>
    </div>
  );
};

export default EnergyMatrixPanel;
