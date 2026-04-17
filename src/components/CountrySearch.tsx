// @ts-nocheck
/**
 * CountrySearch.tsx
 * 국가 검색 컴포넌트 — 헤더 우측에 통합
 */
import React, { useState, useRef, useEffect } from 'react';
import { Country } from '../data/types';
import { getFlagEmoji } from '../data/utils';

interface CountrySearchProps {
  countries: Country[];
  onSelect: (countryId: string) => void;
}

const CountrySearch: React.FC<CountrySearchProps> = ({ countries, onSelect }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = query.length >= 1
    ? countries
        .filter(
          (c) =>
            c.nameKo.includes(query) ||
            c.id.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 8)
    : [];

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = () => {
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleSelect = (countryId: string) => {
    onSelect(countryId);
    setOpen(false);
    setQuery('');
  };

  return (
    <div ref={containerRef} className="relative">
      {!open ? (
        <button
          onClick={handleOpen}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs border border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200 transition-colors"
          title="국가 검색"
        >
          🔍
          <span className="hidden sm:inline">검색</span>
        </button>
      ) : (
        <div className="flex items-center gap-1">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="국가명 검색..."
            className="w-32 sm:w-40 px-2.5 py-1.5 rounded-lg text-xs bg-slate-800 border border-blue-500/60 text-white placeholder-slate-500 outline-none"
          />
          <button
            onClick={() => { setOpen(false); setQuery(''); }}
            className="text-slate-500 hover:text-slate-300 text-xs px-1"
          >✕</button>
        </div>
      )}

      {/* 드롭다운 */}
      {open && filtered.length > 0 && (
        <div className="absolute right-0 top-full mt-1 w-56 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl z-50 overflow-hidden">
          {filtered.map((c) => (
            <button
              key={c.id}
              onClick={() => handleSelect(c.id)}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-700 transition-colors text-left"
            >
              <span className="text-base">{getFlagEmoji(c.id)}</span>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white truncate">{c.nameKo}</div>
                <div className="text-[10px] text-slate-500">{c.region}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* 검색어 있는데 결과 없음 */}
      {open && query.length >= 1 && filtered.length === 0 && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl z-50 p-3 text-center">
          <p className="text-xs text-slate-500">"{query}" 결과 없음</p>
        </div>
      )}
    </div>
  );
};

export default CountrySearch;
