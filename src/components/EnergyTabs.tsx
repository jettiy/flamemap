import React from 'react';
import { EnergyType, CategoryInfo } from '../data/types';

interface EnergyTabsProps {
  categories: CategoryInfo[];
  active: EnergyType;
  onChange: (t: EnergyType) => void;
}

const EnergyTabs: React.FC<EnergyTabsProps> = ({ categories, active, onChange }) => {
  return (
    <div className="flex items-center gap-1 overflow-x-auto px-2 py-1 scrollbar-hide">
      {categories.map((cat) => {
        const isActive = cat.id === active;
        return (
          <button
            key={cat.id}
            onClick={() => onChange(cat.id)}
            className={[
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium whitespace-nowrap transition-all duration-200',
              isActive
                ? 'border-transparent'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-200',
            ].join(' ')}
            style={
              isActive
                ? {
                    backgroundColor: `${cat.color}22`,
                    borderColor: cat.color,
                    color: cat.color,
                    boxShadow: `0 0 12px ${cat.color}44`,
                  }
                : undefined
            }
          >
            <span className="text-base leading-none">{cat.icon}</span>
            <span>{cat.nameKo}</span>
            {isActive && (
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: cat.color }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default EnergyTabs;
