// @ts-nocheck
/**
 * ShockSimulator.tsx
 * 에너지 충격 시뮬레이터: 브렌트유 가격 슬라이더 → 각국 영향 계산
 */
import React, { useState, useMemo } from 'react';

interface CountryImpact {
  id: string;
  nameKo: string;
  flag: string;
  currentPrice: number; // 현재 휘발유가격 (USD/L)
  energyWeight: number; // CPI 에너지 가중치 (%)
  importDep: number;    // 에너지 수입 의존도 (%)
}

const SIMULATION_COUNTRIES: CountryImpact[] = [
  { id: 'KR', nameKo: '대한민국', flag: '🇰🇷', currentPrice: 1.52, energyWeight: 8.5, importDep: 93 },
  { id: 'JP', nameKo: '일본',     flag: '🇯🇵', currentPrice: 1.48, energyWeight: 7.2, importDep: 89 },
  { id: 'DE', nameKo: '독일',     flag: '🇩🇪', currentPrice: 1.87, energyWeight: 9.1, importDep: 65 },
  { id: 'US', nameKo: '미국',     flag: '🇺🇸', currentPrice: 1.01, energyWeight: 6.8, importDep: 20 },
  { id: 'CN', nameKo: '중국',     flag: '🇨🇳', currentPrice: 1.21, energyWeight: 5.3, importDep: 72 },
  { id: 'SA', nameKo: '사우디',   flag: '🇸🇦', currentPrice: 0.61, energyWeight: 3.2, importDep: -100 }, // 순수출
];

const BASE_BRENT = 75;      // 전쟁 전 기준가 (USD/배럴)
const PASSTHROUGH = 0.35;   // 정유 마진 전가율 35%

function calcImpact(country: CountryImpact, simBrent: number) {
  const shockRatio = (simBrent - BASE_BRENT) / BASE_BRENT; // 브렌트 상승률
  // 휘발유 가격 변화 = shock * passthrough * 현재가
  const gasolineImpact = shockRatio * PASSTHROUGH * country.currentPrice;
  const newGasoline = country.currentPrice + gasolineImpact;
  // CPI 영향 = shock * (importDep/100) * energyWeight/100 * 100 (%)
  const cpiImpact = shockRatio * (Math.max(0, country.importDep) / 100) * (country.energyWeight / 100) * 100;
  return {
    newGasoline: Math.max(0, newGasoline),
    gasolineChangePct: shockRatio * PASSTHROUGH * 100,
    cpiImpact: Math.max(0, cpiImpact),
  };
}

function ImpactBar({ value, max }: { value: number; max: number }) {
  const pct = Math.min(100, (value / max) * 100);
  const color = pct < 30 ? '#4ade80' : pct < 60 ? '#fbbf24' : '#ef4444';
  return (
    <div className="w-full bg-slate-700 rounded-full h-1.5 mt-1">
      <div
        className="h-1.5 rounded-full transition-all duration-300"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}

interface ShockSimulatorProps {
  showKRW: boolean;
}

const ShockSimulator: React.FC<ShockSimulatorProps> = ({ showKRW }) => {
  const [brent, setBrent] = useState(112); // 현재 시뮬 브렌트유 가격

  const impacts = useMemo(() => {
    return SIMULATION_COUNTRIES.map(c => ({
      country: c,
      ...calcImpact(c, brent),
    }));
  }, [brent]);

  const shockPct = Math.round(((brent - BASE_BRENT) / BASE_BRENT) * 100);
  const shockColor = shockPct < 20 ? 'text-yellow-400' : shockPct < 50 ? 'text-orange-400' : 'text-red-400';

  // KRW 환율 (대략)
  const krw = 1504;

  return (
    <div className="flex flex-col h-full bg-slate-950 overflow-y-auto p-4 gap-5">
      {/* 헤더 */}
      <div>
        <h2 className="text-lg font-bold text-white mb-1">⚡ 에너지 충격 시뮬레이터</h2>
        <p className="text-xs text-slate-500">
          브렌트유 가격을 조절해 각국 에너지 가격 및 CPI 파급 효과를 시뮬레이션합니다.
          전가율 {Math.round(PASSTHROUGH * 100)}%, 기준가 ${BASE_BRENT}/배럴
        </p>
      </div>

      {/* 슬라이더 */}
      <div className="bg-slate-900 rounded-xl border border-slate-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-slate-300">브렌트유 시뮬레이션 가격</span>
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-white">${brent}</span>
            <span className="text-xs text-slate-500">/배럴</span>
            <span className={`text-sm font-bold ${shockColor}`}>
              {shockPct >= 0 ? '+' : ''}{shockPct}%
            </span>
          </div>
        </div>

        <input
          type="range"
          min={75}
          max={200}
          step={1}
          value={brent}
          onChange={(e) => setBrent(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${((brent - 75) / 125) * 100}%, #334155 ${((brent - 75) / 125) * 100}%, #334155 100%)`,
          }}
        />

        <div className="flex justify-between text-xs text-slate-600 mt-1">
          <span>$75 (기준)</span>
          <span>$100</span>
          <span>$150</span>
          <span>$200</span>
        </div>

        {/* 시나리오 버튼 */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {[
            { label: '전쟁 전', price: 75, color: 'bg-green-500/20 text-green-400 border-green-500/30' },
            { label: '현재', price: 112, color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
            { label: '호르무즈 봉쇄', price: 160, color: 'bg-red-500/20 text-red-400 border-red-500/30' },
            { label: '최악 시나리오', price: 200, color: 'bg-red-900/40 text-red-300 border-red-700/40' },
          ].map(s => (
            <button
              key={s.label}
              onClick={() => setBrent(s.price)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${s.color} ${brent === s.price ? 'ring-1 ring-offset-1 ring-offset-slate-900' : ''}`}
            >
              {s.label} (${s.price})
            </button>
          ))}
        </div>
      </div>

      {/* 국가별 영향 */}
      <div>
        <h3 className="text-sm font-bold text-slate-300 mb-3">📊 국가별 파급 효과</h3>
        <div className="flex flex-col gap-3">
          {impacts.map(({ country, newGasoline, gasolineChangePct, cpiImpact }) => (
            <div key={country.id} className="bg-slate-900 rounded-xl border border-slate-700 p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{country.flag}</span>
                  <div>
                    <span className="text-sm font-bold text-white">{country.nameKo}</span>
                    <div className="text-xs text-slate-500">
                      의존도 {country.importDep < 0 ? '순수출' : `${country.importDep}%`}
                      {' · '}CPI 에너지 가중치 {country.energyWeight}%
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500">CPI 영향</div>
                  <div className={`text-sm font-bold ${cpiImpact < 0.5 ? 'text-green-400' : cpiImpact < 1.5 ? 'text-yellow-400' : 'text-red-400'}`}>
                    +{cpiImpact.toFixed(2)}%p
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* 휘발유 가격 */}
                <div className="bg-slate-800/60 rounded-lg p-2">
                  <div className="text-xs text-slate-500 mb-1">휘발유 예상가</div>
                  <div className="text-sm font-bold text-white">
                    {showKRW
                      ? `₩${Math.round(newGasoline * krw).toLocaleString()}/L`
                      : `$${newGasoline.toFixed(3)}/L`}
                  </div>
                  <div className={`text-xs font-semibold mt-0.5 ${gasolineChangePct > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {gasolineChangePct > 0 ? '+' : ''}{gasolineChangePct.toFixed(1)}%
                  </div>
                  <ImpactBar value={Math.abs(gasolineChangePct)} max={60} />
                </div>

                {/* CPI 충격 */}
                <div className="bg-slate-800/60 rounded-lg p-2">
                  <div className="text-xs text-slate-500 mb-1">물가 상승압력</div>
                  <div className={`text-sm font-bold ${cpiImpact < 0.5 ? 'text-green-400' : cpiImpact < 1.5 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {cpiImpact < 0.3 ? '미미' : cpiImpact < 1.0 ? '보통' : cpiImpact < 2.0 ? '높음' : '위험'}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">+{cpiImpact.toFixed(2)}%p</div>
                  <ImpactBar value={cpiImpact} max={5} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 주석 */}
      <div className="text-xs text-slate-600 leading-relaxed border-t border-slate-800 pt-3">
        * 정유 마진 전가율 35% 가정. CPI 영향 = 브렌트 상승률 × 에너지수입의존도 × CPI 에너지 가중치.
        실제 영향은 환율, 정유 마진, 정부 보조금 등에 따라 달라질 수 있습니다.
      </div>
    </div>
  );
};

export default ShockSimulator;
