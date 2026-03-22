import React from 'react';
import { Country, EnergyType } from '../data/types';
import {
  countryChangeRate,
  globalAvgChangeRate,
  topRisingCountry,
} from '../data/utils';

interface StatsStripProps {
  countries: Country[];
  category: EnergyType;
  showKRW: boolean;
}

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  accent?: 'red' | 'green' | 'blue' | 'default';
}

const StatCard: React.FC<StatCardProps> = ({ label, value, sub, accent = 'default' }) => {
  const accentColors: Record<string, string> = {
    red: 'text-red-400',
    green: 'text-green-400',
    blue: 'text-blue-400',
    default: 'text-slate-100',
  };

  return (
    <div className="flex-1 min-w-[130px] bg-slate-800 rounded-xl px-4 py-3 border border-slate-700 hover:border-slate-600 transition-colors">
      <div className="text-xs text-slate-500 mb-1 truncate">{label}</div>
      <div className={`text-lg font-bold ${accentColors[accent]} truncate`}>{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-0.5 truncate">{sub}</div>}
    </div>
  );
};

const StatsStrip: React.FC<StatsStripProps> = ({ countries, category }) => {
  const avgRate = globalAvgChangeRate(countries, category);
  const { country: topCountry, rate: topRate } = topRisingCountry(countries, category);

  const avgAccent: 'red' | 'green' | 'default' =
    avgRate > 0 ? 'red' : avgRate < 0 ? 'green' : 'default';

  return (
    <div className="flex gap-2 px-4 py-2 overflow-x-auto scrollbar-hide bg-slate-950">
      <StatCard
        label="분석 국가"
        value={`${countries.length}개국`}
        sub="전 세계 주요국"
        accent="blue"
      />
      <StatCard
        label="평균 상승률"
        value={`${avgRate > 0 ? '+' : ''}${avgRate}%`}
        sub="기준일 대비"
        accent={avgAccent}
      />
      <StatCard
        label="최대 상승국"
        value={topCountry.nameKo}
        sub={`+${topRate}% 상승`}
        accent="red"
      />
      <StatCard
        label="마지막 갱신"
        value="2026년 3월 16일"
        sub="데이터 기준"
        accent="default"
      />
    </div>
  );
};

export default StatsStrip;
