/**
 * MarketTicker.tsx
 * 실시간 글로벌 원자재 가격 티커 바
 * - 5분마다 자동 갱신
 * - source === 'fallback' 이면 "📊 추정" 배지 표시
 */

import React, { useState, useEffect, useCallback } from 'react';
import { fetchMarketPrices, MarketPrice } from '../data/eiaService';

const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5분

const SYMBOL_ICON: Record<string, string> = {
  'BZ=F': '🛢️',
  'CL=F': '🛢️',
  'NG=F': '⛽',
};

function formatChange(change: number | null): { text: string; color: string; arrow: string } {
  if (change === null) return { text: '—', color: 'text-slate-400', arrow: '' };
  const abs = Math.abs(change).toFixed(2);
  if (change > 0) return { text: `${abs}%`, color: 'text-red-400', arrow: '▲' };
  if (change < 0) return { text: `${abs}%`, color: 'text-green-400', arrow: '▼' };
  return { text: `${abs}%`, color: 'text-slate-400', arrow: '—' };
}

function TickerItem({ item }: { item: MarketPrice }) {
  const icon = SYMBOL_ICON[item.symbol] ?? '💰';
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
      {item.source === 'fallback' && (
        <span className="text-[10px] text-slate-500 bg-slate-700/60 px-1 py-0.5 rounded leading-none">
          📊 추정
        </span>
      )}
    </div>
  );
}

const MarketTicker: React.FC = () => {
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await fetchMarketPrices();
      setPrices(data);
      setLastUpdated(new Date());
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, REFRESH_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [load]);

  if (loading) {
    return (
      <div className="flex-shrink-0 bg-slate-900/80 border-b border-slate-800 px-4 py-1.5 flex items-center gap-2">
        <span className="text-xs text-slate-500 animate-pulse">📈 시장 데이터 로딩 중...</span>
      </div>
    );
  }

  if (error && prices.length === 0) {
    return null;
  }

  return (
    <div className="flex-shrink-0 bg-slate-900/80 border-b border-slate-800 px-3 py-1.5 flex items-center gap-2 overflow-x-auto scrollbar-none">
      {/* 레이블 */}
      <div className="flex-shrink-0 flex items-center gap-1.5 mr-1">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
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
            {lastUpdated.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })} 기준
          </span>
        </div>
      )}
    </div>
  );
};

export default MarketTicker;
