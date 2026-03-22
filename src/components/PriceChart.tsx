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

interface PriceChartProps {
  selectedCountry: Country | null;
  koreaCountry: Country;
  category: EnergyType;
  categoryInfo: CategoryInfo;
  countries: Country[];
  showKRW: boolean;
}

interface ChartDataPoint {
  date: string;
  selected?: number;
  korea: number;
  median: number;
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
}) => {
  const globalMedian = useMemo(
    () => buildGlobalMedianSeries(countries, category),
    [countries, category]
  );

  const chartData: ChartDataPoint[] = useMemo(() => {
    return globalMedian.map((gm, idx) => {
      const koreaPrice = koreaCountry.prices[category].history[idx]?.price ?? 0;
      const selectedPrice = selectedCountry?.prices[category].history[idx]?.price;
      const convert = (v: number) => showKRW ? toKRW(v, categoryInfo.unit).value : v;
      return {
        date: gm.date,
        korea: parseFloat(convert(koreaPrice).toFixed(showKRW ? 0 : 4)),
        median: parseFloat(convert(gm.price).toFixed(showKRW ? 0 : 4)),
        ...(selectedPrice !== undefined
          ? { selected: parseFloat(convert(selectedPrice).toFixed(showKRW ? 0 : 4)) }
          : {}),
      };
    });
  }, [globalMedian, koreaCountry, selectedCountry, category, showKRW, categoryInfo.unit]);

  const allValues = chartData.flatMap((d) =>
    [d.korea, d.median, d.selected].filter((v): v is number => v !== undefined)
  );
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
          <p className="text-xs text-slate-500 mt-0.5">2025.01 – 2026.03</p>
        </div>
        <div className="text-xs text-orange-400 bg-orange-400/10 px-2 py-1 rounded border border-orange-400/30">
          🔴 전쟁 발발: 2026.01.20
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
              x1="2026-01"
              x2={lastDate}
              fill="url(#warZoneGradient)"
            />
            <ReferenceLine
              x="2026-01"
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
              dot={false}
              activeDot={{ r: 4, fill: '#3b82f6' }}
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
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PriceChart;
