import React from 'react';
import { Country, EnergyType, CategoryInfo } from '../data/types';
import { categories } from '../data/categories';
import { countryChangeRate, getFlagEmoji, formatPrice } from '../data/utils';
import {
  importDependencyData,
  riskLevelLabel,
  riskLevelColor,
  ImportDependencyData,
} from '../data/importDependency';

interface ComparisonPanelProps {
  country: Country;
  koreaCountry: Country;
  showKRW: boolean;
}

const ENERGY_TYPES: EnergyType[] = ['gasoline', 'lng', 'elec_residential', 'elec_industrial'];

interface EnergyRowProps {
  catInfo: CategoryInfo;
  korPrice: number;
  selPrice: number;
  korRate: number;
  selRate: number;
  unit: string;
  showKRW: boolean;
  countryNameKo: string;
  countryId: string;
}

const EnergyRow: React.FC<EnergyRowProps> = ({
  catInfo,
  korPrice,
  selPrice,
  korRate,
  selRate,
  unit,
  showKRW,
  countryNameKo,
  countryId,
}) => {
  const diff = selPrice - korPrice;
  const isExpensive = diff > 0;
  const pctDiff = korPrice > 0 ? ((Math.abs(diff) / korPrice) * 100).toFixed(1) : '0';

  return (
    <div className="bg-slate-800 rounded-xl p-3 border border-slate-700">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{catInfo.icon}</span>
        <div>
          <span className="text-sm font-semibold text-white">{catInfo.nameKo}</span>
          <p className="text-xs text-slate-500">{catInfo.description}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {/* 한국 */}
        <div className="bg-slate-900/60 rounded-lg p-2">
          <div className="flex items-center gap-1 mb-1">
            <span className="text-sm">🇰🇷</span>
            <span className="text-xs text-blue-400 font-medium">대한민국</span>
          </div>
          <div className="font-mono text-xs text-white">
            {formatPrice(korPrice, unit, showKRW)}
          </div>
          <div className={`text-xs mt-1 font-medium ${korRate >= 0 ? 'text-red-400' : 'text-green-400'}`}>
            {korRate >= 0 ? '▲' : '▼'} {Math.abs(korRate)}%
          </div>
        </div>
        {/* 선택 국가 */}
        <div className="bg-slate-900/60 rounded-lg p-2">
          <div className="flex items-center gap-1 mb-1">
            <span className="text-sm">{getFlagEmoji(countryId ?? "XX")}</span>
            <span className="text-xs text-slate-300 font-medium truncate">{countryNameKo}</span>
          </div>
          <div className="font-mono text-xs text-white">
            {formatPrice(selPrice, unit, showKRW)}
          </div>
          <div className={`text-xs mt-1 font-medium ${selRate >= 0 ? 'text-red-400' : 'text-green-400'}`}>
            {selRate >= 0 ? '▲' : '▼'} {Math.abs(selRate)}%
          </div>
        </div>
      </div>
      {/* 비교 결론 */}
      <div
        className={`mt-2 text-xs text-center py-1.5 rounded-lg font-medium ${
          isExpensive
            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
            : 'bg-green-500/10 text-green-400 border border-green-500/20'
        }`}
      >
        {countryNameKo}은 한국보다{' '}
        <span className="font-bold">{pctDiff}%</span>{' '}
        {isExpensive ? '비쌉니다 ↑' : '쌉니다 ↓'}
      </div>
    </div>
  );
};

// ── 수입 의존도 섹션 ─────────────────────────────────────────

interface ImportDepRowProps {
  countryId: string;
  nameKo: string;
  flag: string;
  isKorea?: boolean;
}

const ImportDepRow: React.FC<ImportDepRowProps> = ({ countryId, nameKo, flag, isKorea }) => {
  const data: ImportDependencyData | undefined = importDependencyData[countryId];
  if (!data) return null;

  const isExporter = data.riskLevel === 'exporter';
  const barWidth   = isExporter ? 0 : Math.min(data.importPct, 100);

  return (
    <div className={`p-3 rounded-xl border ${isKorea ? 'bg-blue-500/5 border-blue-500/20' : 'bg-slate-900/60 border-slate-700/50'}`}>
      {/* 국가명 행 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{flag}</span>
          <span className={`text-xs font-medium ${isKorea ? 'text-blue-300' : 'text-slate-300'}`}>
            {nameKo}
          </span>
        </div>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium border ${riskLevelColor[data.riskLevel]}`}
        >
          {isExporter ? '순수출국 🟢' : riskLevelLabel[data.riskLevel]}
        </span>
      </div>

      {/* 레이블 */}
      <div className="text-xs text-slate-400 mb-1.5">{data.label}</div>

      {/* 퍼센트 바 */}
      {isExporter ? (
        <div className="text-xs text-green-400 flex items-center gap-1">
          🟢 에너지 순수출국 (수입 의존도 해당 없음)
        </div>
      ) : (
        <div className="relative w-full bg-slate-700/60 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              data.riskLevel === 'very-high'
                ? 'bg-red-500'
                : data.riskLevel === 'high'
                ? 'bg-orange-500'
                : data.riskLevel === 'medium'
                ? 'bg-yellow-500'
                : 'bg-blue-500'
            }`}
            style={{ width: `${barWidth}%` }}
          />
          <span className="absolute right-0 -top-4 text-xs text-slate-400 font-mono">
            {data.importPct}%
          </span>
        </div>
      )}
    </div>
  );
};

// ── 메인 패널 ─────────────────────────────────────────────────

// We need country.id in EnergyRow — pass it through countryNameKo context
// Instead, we'll inline getFlagEmoji for the selected country

const ComparisonPanel: React.FC<ComparisonPanelProps> = ({
  country,
  koreaCountry,
  showKRW,
}) => {
  return (
    <div className="flex flex-col h-full bg-slate-950 overflow-y-auto">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-slate-950 px-4 pt-4 pb-3 border-b border-slate-800">
        <h2 className="text-base font-bold text-white mb-1">🔍 상세 비교</h2>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span>🇰🇷 대한민국</span>
          <span className="text-slate-600">vs</span>
          <span>{getFlagEmoji(country.id)} {country.nameKo}</span>
        </div>
      </div>

      {/* ── 수입 의존도 섹션 ── */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-sm font-semibold text-slate-300">🛢️ 에너지 수입 의존도</h3>
          <span className="text-xs text-slate-600 bg-slate-800 px-2 py-0.5 rounded-full">
            IEA 기준
          </span>
        </div>

        <div className="flex flex-col gap-2 pt-1">
          <ImportDepRow
            countryId={koreaCountry.id}
            nameKo="대한민국"
            flag="🇰🇷"
            isKorea
          />
          <ImportDepRow
            countryId={country.id}
            nameKo={country.nameKo}
            flag={getFlagEmoji(country.id)}
          />
        </div>
      </div>

      {/* 구분선 */}
      <div className="mx-4 mt-2 border-t border-slate-800" />

      {/* 에너지별 비교 행 */}
      <div className="p-4 flex flex-col gap-3">
        {ENERGY_TYPES.map((type) => {
          const catInfo = categories.find((c) => c.id === type)!;
          const korData = koreaCountry.prices[type];
          const selData = country.prices[type];
          const korRate = countryChangeRate(koreaCountry, type);
          const selRate = countryChangeRate(country, type);

          return (
            <EnergyRow
              key={type}
              catInfo={catInfo}
              korPrice={korData.current}
              selPrice={selData.current}
              korRate={korRate}
              selRate={selRate}
              unit={korData.unit}
              showKRW={showKRW}
              countryNameKo={country.nameKo}
              countryId={country.id}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ComparisonPanel;
