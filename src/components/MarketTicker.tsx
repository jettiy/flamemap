/**
 * MarketTicker.tsx
 * 실시간 글로벌 원자재 가격 티커 바
 * - fetchLiveData()를 1순위로 사용
 * - 5분마다 자동 갱신
 */
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { fetchLiveData, MarketPrice } from '../data/eiaService';
import DataStatusBadge, { DataStatus } from './DataStatusBadge';

const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5분

const SYMBOL_ICON: Record<string, string> = {
  'BZ=F': '🛢️',
  'CL=F': '🛢️',
  'NG=F': '⛽',
};

const SYMBOL_MAP: Record<string, string> = {
  'BZ=F': 'brent',
  'CL=F': 'wti',
  'NG=F': 'naturalGas',
};

function formatChange(change: number | null): { text: string; color: string; arrow: string } {
  if (change === null) return { text: '—', color: 'text-slate-400', arrow: '' };
  const abs = Math.abs(change).toFixed(2);
  if (change > 0) return { text: `${abs}%`, color: 'text-red-400', arrow: '▲' };
  if (change < 0) return { text: `${abs}%`, color: 'text-green-400', arrow: '▼' };
  return { text: `${abs}%`, color: 'text-slate-400', arrow: '—' };
}

function TickerItem({ item }: { item: MarketPrice }) {
  const icon = SYMBOL_ICON[item.symbol ?? ''] ?? '💰';
  const { text: changeText, color: changeColor, arrow } = formatChange(item.change);

  return (
    <div className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800/70 border border-slate-700/60 select-none">
      <span className="text-sm leading-none">{icon}</span>
      <span className="text-xs font-medium text-slate-200">{item.nameKo}</span>
      <span className="text-xs font-bold text-white">
        {item.price !== null ? `$${item.price.toFixed(2)}` : '—'}
      </span>
      {item.change !== null && (
        <span className={`text-xs font-semibold ${changeColor}`}>
          {arrow}{changeText}
        </span>
      )}
      <DataStatusBadge status={(item.source as DataStatus) ?? 'unknown'} className="ml-0.5" />
    </div>
  );
}

const MarketTicker: React.FC = () => {
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const liveData = await fetchLiveData();
        if (liveData?.marketPrices) {
          const mp = liveData.marketPrices;
          const result: MarketPrice[] = [
            {
              symbol: 'BZ=F',
              nameKo: mp.brent.nameKo,
              price: mp.brent.price,
              unit: mp.brent.unit,
              change: mp.brent.change,
              timestamp: liveData.updatedAtKST ?? null,
              source: mp.brent.source as any,
            },
            {
              symbol: 'CL=F',
              nameKo: mp.wti.nameKo,
              price: mp.wti.price,
              unit: mp.wti.unit,
              change: mp.wti.change,
              timestamp: liveData.updatedAtKST ?? null,
              source: mp.wti.source as any,
            },
            {
              symbol: 'NG=F',
              nameKo: mp.naturalGas.nameKo,
              price: mp.naturalGas.price,
              unit: mp.naturalGas.unit,
              change: mp.naturalGas.change,
              timestamp: liveData.updatedAtKST ?? null,
              source: mp.naturalGas.source as any,
            },
          ];
          setPrices(result);
          setLastUpdated(liveData.updatedAtKST ?? null);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };

    load();
    const id = setInterval(load, REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  if (loading) {
    return (
      <div className="flex-shrink-0 bg-slate-900/80 border-b border-slate-800 px-4 py-1.5 flex items-center gap-2">
        <span className="text-xs text-slate-500 animate-pulse">📈 시장 데이터 로딩 중...</span>
      </div>
    );
  }

  if (prices.length === 0) {
    return null;
  }

  return (
    <div className="flex-shrink-0 bg-slate-900/80 border-b border-slate-800 px-3 py-1.5 flex items-center gap-2 overflow-x-auto scrollbar-none">
      {/* 레이블 */}
      <div className="flex-shrink-0 flex items-center gap-1.5 mr-1">
        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium whitespace-nowrap">
          원자재
        </span>
      </div>

      {/* 구분선 */}
      <div className="flex-shrink-0 w-px h-4 bg-slate-700" />

      {/* 티커 아이템들 */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
        {prices.map((item) => (
          <TickerItem key={item.symbol} item={item} />
        ))}
      </div>

      {/* 업데이트 시간 (데스크탑만) */}
      {lastUpdated && (
        <div className="flex-shrink-0 ml-auto hidden sm:flex items-center">
          <span className="text-[10px] text-slate-600 whitespace-nowrap">
            {lastUpdated} 기준
          </span>
        </div>
      )}
    </div>
  );
};

export default MarketTicker;
