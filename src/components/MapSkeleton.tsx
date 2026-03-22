import React from 'react';

const MapSkeleton: React.FC = () => (
  <div className="w-full h-full bg-slate-950 rounded-xl flex flex-col items-center justify-center gap-4 animate-pulse">
    <div className="relative">
      <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center">
        <span className="text-4xl animate-spin" style={{ animationDuration: '3s' }}>🔥</span>
      </div>
    </div>
    <div className="flex flex-col items-center gap-1.5">
      <div className="h-3 w-32 bg-slate-800 rounded-full" />
      <div className="h-2 w-24 bg-slate-800/70 rounded-full" />
    </div>
    <p className="text-xs text-slate-600">지도 데이터 로딩 중...</p>
  </div>
);

export default MapSkeleton;
