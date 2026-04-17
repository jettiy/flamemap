// @ts-nocheck
import React, { useMemo } from 'react';
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  Legend as RLegend,
  ReferenceLine,
  ReferenceArea,
  ResponsiveContainer,
} from 'recharts';
import { Country, EnergyType, CategoryInfo } from '../data/types';
import { buildGlobalMedianSeries, toKRW } from '../data/utils';
import { WAR_START_DATE, CHART_HISTORY_FROM, CHART_HISTORY_TO } from '../data/constants';

const COMPARE_COLORS = ['#f59e0b', '#10b981', '#8b5cf6'];

interface PriceChartProps {
  selectedCountry: Country | null;
  koreaCountry: Country;
  category: EnergyType;
  categoryInfo: CategoryInfo;
  countries: Country[];
  showKRW: boolean;
  compareCountryIds?: string[];
}

interface ChartDataPoint {
  date: string;
  selected?: number;
  korea: number;
  median: number;
  isReal?: boolean;
  [key: string]: number | string | boolean | undefined;
}

const CustomTooltipContent = ({
  active, payload, label, unit, showKRW,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
  unit: string;
  showKRW: boolean;
}) => {
  if (!active || !payload?.length) return null;
  const displayUnit = showKRW ? toKRW(1, unit).unit : unit;
  return (
    <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl text-sm">
      <div className="text-slate-400 text-xs mb-2">{label}</div>
      {payload.map((entry) => {
        const val = showKRW
          ? toKRW(entry.value, unit).value.toLocaleString('ko-KR')
          : Number(entry.value).toFixed(4);
        return (
          <div key={entry.name} className="flex items-center gap-2 mb-1">
            <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-300">{entry.name}:</span>
            <span className="font-mono text-white">{val} {displayUnit}</span>
          </div>
        );
      })}
    </div>
  );
};

const PriceChart: React.FC<PriceChartProps> = ({
  selectedCountry,
  koreaCountry,
  category,
  categoryInfo,
  countries,
  showKRW,
  compareCountryIds = [],
}) => {
  const globalMedian = useMemo(
    () => buildGlobalMedianSeries(countries, category),
    [countries, category]
  );

  // 비교 국가 객체 배열 (최대 3개)
  const compareCountries = useMemo(() => {
    return compareCountryIds.slice(0, 3).map(id => countries.find(c => c.id === id)).filter(Boolean) as Country[];
  }, [compareCountryIds, countries]);

  const chartData: ChartDataPoint[] = useMemo(() => {
    return globalMedian.map((gm, idx) => {
      const koreaPrice = koreaCountry.prices[category].history[idx]?.price ?? 0;
      const selectedPrice = selectedCountry?.prices[category].history[idx]?.price;
      const convert = (v: number) => showKRW ? toKRW(v, categoryInfo.unit).value : v;
      const koreaEntry = koreaCountry.prices[category].history[idx];
      const point: ChartDataPoint = {
        date: gm.date,
        korea: parseFloat(convert(koreaPrice).toFixed(showKRW ? 0 : 4)),
        median: parseFloat(convert(gm.price).toFixed(showKRW ? 0 : 4)),
        isReal: koreaEntry?.isReal === true,
        ...(selectedPrice !== undefined
          ? { selected: parseFloat(convert(selectedPrice).toFixed(showKRW ? 0 : 4)) }
          : {}),
      };
      // 비교 국가 데이터 추가
      compareCountries.forEach((cc) => {
        const p = cc.prices[category].history[idx]?.price;
        if (p !== undefined) {
          point[`compare_${cc.id}`] = parseFloat(convert(p).toFixed(showKRW ? 0 : 4));
        }
      });
      return point;
    });
  }, [globalMedian, koreaCountry, selectedCountry, category, showKRW, categoryInfo.unit, compareCountries]);

  const allValues = chartData.flatMap((d) => {
    const vals: number[] = [d.korea as number, d.median as number];
    if (d.selected !== undefined) vals.push(d.selected as number);
    compareCountries.forEach(cc => {
      const v = d[`compare_${cc.id}`];
      if (v !== undefined) vals.push(v as number);
    });
    return vals.filter((v): v is number => v !== undefined && !isNaN(v));
  });
  const yMin = allValues.length > 0 ? Math.floor(Math.min(...allValues) * 0.9) : 0;
  const yMax = allValues.length > 0 ? Math.ceil(Math.max(...allValues) * 1.05) : 100;
  const lastDate = chartData[chartData.length - 1]?.date ?? '2026-03';

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-xl border border-slate-700 p-3">
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div>
          <h3 className="text-sm font-semibold text-white">
            {categoryInfo.icon} {categoryInfo.nameKo} 가격 추이
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">{CHART_HISTORY_FROM.replace('-','.')} – {CHART_HISTORY_TO.replace('-','.')}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-orange-400 bg-orange-400/10 px-2 py-1 rounded border border-orange-400/30">
            🔴 개전: {WAR_START_DATE.slice(0,7).replace('-','.')}
          </div>
          <div className="text-xs text-slate-500 hidden md:flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white inline-block" />
            실측
          </div>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: 5, bottom: 5 }}>
            <defs>
              <linearGradient id="warZoneGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="date"
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
            />
            <YAxis
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              domain={[yMin, yMax]}
              width={showKRW ? 65 : 52}
              tickFormatter={(v: number) => showKRW ? v.toLocaleString('ko-KR') : Number(v).toFixed(3)}
            />
            <RTooltip
              content={(props) => (
                <CustomTooltipContent
                  {...props}
                  unit={categoryInfo.unit}
                  showKRW={showKRW}
                />
              )}
            />
            <RLegend
              wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
              formatter={(value: string) => <span style={{ color: '#94a3b8' }}>{value}</span>}
            />
            <ReferenceArea
              x1={WAR_START_DATE.slice(0,7)}
              x2={lastDate}
              fill="url(#warZoneGradient)"
            />
            <ReferenceLine
              x={WAR_START_DATE.slice(0,7)}
              stroke="#f97316"
              strokeWidth={2}
              strokeDasharray="5 3"
              label={{ value: '전쟁 발발', position: 'insideTopLeft', fill: '#f97316', fontSize: 10, fontWeight: 'bold' }}
            />
            <Area
              type="monotone"
              dataKey="median"
              name="글로벌 중위값"
              stroke="#6b7280"
              fill="#6b728011"
              strokeDasharray="4 2"
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="korea"
              name="대한민국"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={(props: any) => {
                if (props.payload?.isReal) {
                  return <circle key={props.key} cx={props.cx} cy={props.cy} r={4} fill="#3b82f6" stroke="#fff" strokeWidth={1.5} />;
                }
                return <g key={props.key} />;
              }}
              activeDot={{ r: 5, fill: '#3b82f6' }}
            />
            {selectedCountry && (
              <Line
                type="monotone"
                dataKey="selected"
                name={selectedCountry.nameKo}
                stroke="#ef4444"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: '#ef4444' }}
              />
            )}
            {/* 비교 국가 라인들 */}
            {compareCountries.map((cc, i) => (
              <Line
                key={cc.id}
                type="monotone"
                dataKey={`compare_${cc.id}`}
                name={cc.nameKo}
                stroke={COMPARE_COLORS[i]}
                strokeWidth={1.8}
                strokeDasharray="6 3"
                dot={false}
                activeDot={{ r: 4, fill: COMPARE_COLORS[i] }}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PriceChart;
