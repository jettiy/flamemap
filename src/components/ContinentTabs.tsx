import React from 'react';
import { CONTINENTS, ContinentKey } from './WorldMap';

interface ContinentTabsProps {
  active: ContinentKey;
  onChange: (c: ContinentKey) => void;
}

const ContinentTabs: React.FC<ContinentTabsProps> = ({ active, onChange }) => {
  return (
    <div className="flex items-center gap-1 overflow-x-auto px-2 py-1.5 scrollbar-hide bg-slate-900/40 border-b border-slate-800">
      {CONTINENTS.map((c) => {
        const isActive = c.id === active;
        return (
          <button
            key={c.id}
            onClick={() => onChange(c.id)}
            className={[
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border',
              isActive
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-sm'
                : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:bg-slate-700/60 hover:text-slate-200',
            ].join(' ')}
          >
            <span>{c.icon}</span>
            <span>{c.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ContinentTabs;
