import React, { useState, useMemo } from 'react';
import { Country, EnergyType, CategoryInfo, RegionFilter, RankingSort } from '../data/types';
import { countryChangeRate, getFlagEmoji, formatPrice, REGION_FILTERS, globalAvgChangeRate } from '../data/utils';
import { ContinentKey, CONTINENTS } from './WorldMap';

// 대륙별 고정 국가 ID (namerica/samerica/oceania는 region만으로 구분 불가)
const CONTINENT_COUNTRY_IDS: Partial<Record<ContinentKey, string[]>> = {
  namerica: ['US', 'CA', 'MX'],
  samerica: ['BR', 'AR', 'CL', 'CO', 'VE'],
  oceania: ['AU', 'NZ'],
};

interface RankingPanelProps {
  countries: Country[];
  selectedCountry: Country | null;
  category: EnergyType;
  categoryInfo: CategoryInfo;
  showKRW: boolean;
  onCountrySelect: (c: Country) => void;
  continent: ContinentKey;
  fullWidth?: boolean; // 데스크탑 랭킹 전용: 그리드 레이아웃
}

const RankingPanel: React.FC<RankingPanelProps> = ({
  countries,
  selectedCountry,
  category,
  categoryInfo,
  showKRW,
  onCountrySelect,
  continent,
  fullWidth = false,
}) => {
  const [sort, setSort] = useState<RankingSort>('rise');
  const [region, setRegion] = useState<RegionFilter>('전체');

  // continent 기반 필터링
  const continentFiltered = useMemo(() => {
    if (continent === 'world') return countries;

    const fixedIds = CONTINENT_COUNTRY_IDS[continent];
    if (fixedIds) {
      return countries.filter((c) => fixedIds.includes(c.id));
    }

    // asia: 아시아 region, AU 제외
    if (continent === 'asia') {
      return countries.filter((c) => c.region === '아시아' && c.id !== 'AU');
    }

    // europe: 유럽 region
    if (continent === 'europe') {
      return countries.filter((c) => c.region === '유럽');
    }

    return countries;
  }, [countries, continent]);

  const filtered = useMemo(() => {
    // continent가 world가 아닌 경우 내부 지역 필터 무시
    const base =
      continent !== 'world'
        ? continentFiltered
        : region === '전체'
        ? countries
        : countries.filter((c) => c.region === region);

    return [...base].sort((a, b) => {
      const ra = countryChangeRate(a, category);
      const rb = countryChangeRate(b, category);
      return sort === 'rise' ? rb - ra : ra - rb;
    });
  }, [continentFiltered, countries, region, sort, category, continent]);

  const avgRate = useMemo(() => globalAvgChangeRate(filtered, category), [filtered, category]);
  const topCountry = filtered[0];
  const bottomCountry = filtered[filtered.length - 1];

  const REGION_SHORT: Record<string, string> = {
    '전체': '전체',
    '아시아': '아시아',
    '유럽': '유럽',
    '중동': '중동',
    '아메리카': '미주',
    '기타': '기타',
  };

  const continentInfo = CONTINENTS.find((c) => c.id === continent);

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
      {/* 헤더 */}
      <div className="p-3 border-b border-slate-700 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-white">🏆 가격 변화율 랭킹</h3>
          {/* 대륙 배지 */}
          {continent !== 'world' && continentInfo && (
            <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
              {continentInfo.icon} {continentInfo.label}
              <span className="text-blue-400/70 ml-0.5">· {filtered.length}개국</span>
            </span>
          )}
        </div>

        {/* 정렬 탭 */}
        <div className="flex bg-slate-800 rounded-lg p-0.5 mb-2">
          <button
            onClick={() => setSort('rise')}
            className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${
              sort === 'rise' ? 'bg-red-500/20 text-red-400 font-medium' : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            ▲ 상승 순
          </button>
          <button
            onClick={() => setSort('fall')}
            className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${
              sort === 'fall' ? 'bg-green-500/20 text-green-400 font-medium' : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            ▼ 하락 순
          </button>
        </div>

        {/* 지역 필터 — continent가 world일 때만 표시 */}
        {continent === 'world' && (
          <div className="flex flex-wrap gap-1">
            {REGION_FILTERS.map((r) => (
              <button
                key={r}
                onClick={() => setRegion(r as RegionFilter)}
                className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                  region === r
                    ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                    : 'text-slate-500 border-slate-700 hover:text-slate-300 hover:border-slate-600'
                }`}
              >
                {REGION_SHORT[r] ?? r}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 랭킹 목록 */}
      <div className="flex-1 overflow-y-auto">
        <div className={fullWidth ? 'grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-0' : ''}>
        {filtered.map((country, idx) => {
          const rate = countryChangeRate(country, category);
          const { current, unit } = country.prices[category];
          const isSelected = selectedCountry?.id === country.id;
          const isPositive = rate >= 0;

          const badgeCls =
            idx === 0 ? 'bg-yellow-500 text-yellow-900' :
            idx === 1 ? 'bg-slate-400 text-slate-900' :
            idx === 2 ? 'bg-amber-700 text-amber-100' :
            'bg-slate-700 text-slate-400';

          return (
            <button
              key={country.id}
              onClick={() => onCountrySelect(country)}
              className={`w-full flex items-center gap-2 px-3 py-2.5 text-left transition-all hover:bg-slate-800/80 ${
                isSelected ? 'bg-slate-800 border-l-2 border-blue-400' : 'border-l-2 border-transparent'
              } ${fullWidth ? 'border-b border-slate-800/60' : ''}`}
            >
              <span className={`text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full flex-shrink-0 ${badgeCls}`}>
                {idx + 1}
              </span>
              <span className="flag-emoji flex-shrink-0" title={country.nameKo}>
                {getFlagEmoji(country.id)}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-slate-200 truncate">{country.nameKo}</div>
                <div className="text-xs text-slate-500 font-mono">
                  {formatPrice(current, unit, showKRW)}
                </div>
              </div>
              <div className={`text-xs font-bold flex-shrink-0 ${isPositive ? 'text-red-400' : 'text-green-400'}`}>
                {isPositive ? '+' : ''}{rate}%
              </div>
            </button>
          );
        })}

        {filtered.length === 0 && (
          <div className="flex items-center justify-center h-24 text-slate-600 text-xs col-span-4">
            해당 대륙 국가 데이터 없음
          </div>
        )}
        </div>
      </div>

      {/* 글로벌 요약 */}
      <div className="flex-shrink-0 p-3 border-t border-slate-700 bg-slate-800/50">
        <div className="text-xs text-slate-500 mb-2">
          📊 {continent !== 'world' && continentInfo ? `${continentInfo.label} ` : '글로벌 '}요약
        </div>
        <div className="grid grid-cols-3 gap-1 text-center">
          <div>
            <div className="text-xs text-slate-500">최고 상승</div>
            <div className="text-xs font-bold text-red-400">
              {topCountry ? `+${countryChangeRate(topCountry, category)}%` : '-'}
            </div>
            <div className="text-xs text-slate-500 truncate">{topCountry?.nameKo ?? ''}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">평균</div>
            <div className={`text-xs font-bold ${avgRate >= 0 ? 'text-red-400' : 'text-green-400'}`}>
              {avgRate >= 0 ? '+' : ''}{avgRate}%
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500">최저</div>
            <div className="text-xs font-bold text-green-400">
              {bottomCountry ? `${countryChangeRate(bottomCountry, category)}%` : '-'}
            </div>
            <div className="text-xs text-slate-500 truncate">{bottomCountry?.nameKo ?? ''}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RankingPanel;
