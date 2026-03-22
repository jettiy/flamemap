import React, { useState } from 'react';
import RankingPanel from './RankingPanel';
import EnergyMatrixPanel from './EnergyMatrixPanel';
import { Country, EnergyType, CategoryInfo } from '../data/types';
import { ContinentKey } from './WorldMap';

interface RankingSubTabsProps {
  mobileProps?: {
    countries: Country[];
    selectedCountry: Country | null;
    category: EnergyType;
    categoryInfo: CategoryInfo;
    showKRW: boolean;
    continent: ContinentKey;
    onCountrySelect: (c: Country) => void;
  };
  desktopProps?: {
    countries: Country[];
    selectedCountry: Country | null;
    category: EnergyType;
    categoryInfo: CategoryInfo;
    showKRW: boolean;
    continent: ContinentKey;
    onCountrySelect: (c: Country) => void;
  };
}

type SubTab = 'ranking' | 'energy';

const RankingSubTabs: React.FC<RankingSubTabsProps> = ({ mobileProps, desktopProps }) => {
  const [sub, setSub] = useState<SubTab>('ranking');
  const props = desktopProps ?? mobileProps;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* 서브탭 헤더 */}
      <div className="flex-shrink-0 flex border-b border-slate-700/50 bg-slate-900">
        <button
          onClick={() => setSub('ranking')}
          className={`flex-1 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            sub === 'ranking'
              ? 'border-amber-500 text-amber-300'
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          🏆 가격변화율 랭킹
        </button>
        <button
          onClick={() => setSub('energy')}
          className={`flex-1 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            sub === 'energy'
              ? 'border-blue-500 text-blue-300'
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          🌍 에너지 요금 비교
        </button>
      </div>

      {/* 콘텐츠 */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {sub === 'ranking' && props ? (
          <div className="h-full p-2">
            <RankingPanel
              countries={props.countries}
              selectedCountry={props.selectedCountry}
              category={props.category}
              categoryInfo={props.categoryInfo}
              showKRW={props.showKRW}
              continent={props.continent}
              onCountrySelect={props.onCountrySelect}
              fullWidth={!!desktopProps}
            />
          </div>
        ) : (
          <EnergyMatrixPanel />
        )}
      </div>
    </div>
  );
};

export default RankingSubTabs;
