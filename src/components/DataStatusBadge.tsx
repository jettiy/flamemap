/**
 * DataStatusBadge.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * 데이터 신뢰도 상태 배지
 * - live   : 외부 API 실시간 수신
 * - agent  : 크론/에이전트가 갱신한 live-data.json
 * - cached : 캐시된 최근 데이터
 * - fallback: 외부 fetch 실패, 폴백 추정값 사용
 * ─────────────────────────────────────────────────────────────────────────────
 */
import React from 'react';

export type DataStatus = 'live' | 'agent' | 'cached' | 'fallback' | 'unknown';

interface DataStatusBadgeProps {
  status: DataStatus;
  updatedAt?: string;   // KST 문자열 (e.g. "2026-03-23 09:24 KST")
  className?: string;
}

const CONFIG: Record<DataStatus, { label: string; dot: string; text: string; bg: string; border: string }> = {
  live:     { label: 'LIVE',     dot: 'bg-green-400 animate-pulse', text: 'text-green-300', bg: 'bg-green-900/20', border: 'border-green-600/40' },
  agent:    { label: '자동갱신', dot: 'bg-blue-400 animate-pulse',  text: 'text-blue-300',  bg: 'bg-blue-900/20',  border: 'border-blue-600/40'  },
  cached:   { label: '캐시',     dot: 'bg-yellow-400',              text: 'text-yellow-300',bg: 'bg-yellow-900/20',border: 'border-yellow-600/40' },
  fallback: { label: '추정값',   dot: 'bg-orange-400',              text: 'text-orange-300',bg: 'bg-orange-900/20',border: 'border-orange-600/40' },
  unknown:  { label: '알 수 없음',dot: 'bg-slate-400',              text: 'text-slate-400', bg: 'bg-slate-800/30', border: 'border-slate-600/40'  },
};

const DataStatusBadge: React.FC<DataStatusBadgeProps> = ({ status, updatedAt, className = '' }) => {
  const cfg = CONFIG[status] ?? CONFIG.unknown;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-medium ${cfg.bg} ${cfg.border} ${cfg.text} ${className}`}
      title={updatedAt ? `마지막 갱신: ${updatedAt}` : undefined}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      <span>{cfg.label}</span>
      {updatedAt && (
        <span className="opacity-60 hidden sm:inline truncate max-w-[120px]">{updatedAt}</span>
      )}
    </div>
  );
};

export default DataStatusBadge;
