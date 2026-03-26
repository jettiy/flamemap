import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from 'react-simple-maps';
import { Country, EnergyType } from '../data/types';
import { countryChangeRate } from '../data/utils';
import { importDependencyData } from '../data/importDependency';
import Tooltip from './Tooltip';
import MapSkeleton from './MapSkeleton';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json';

// ─── 대륙 정의 ───
export type ContinentKey = 'world' | 'asia' | 'europe' | 'namerica' | 'samerica' | 'oceania';

export interface ContinentInfo {
  id: ContinentKey;
  label: string;
  icon: string;
  projectionConfig: { scale: number; center: [number, number] };
  regionFilter: string[];   // country.region 값들
}

export const CONTINENTS: ContinentInfo[] = [
  {
    id: 'world',
    label: '전체',
    icon: '🌍',
    projectionConfig: { scale: 147, center: [10, 5] },
    regionFilter: [],
  },
  {
    id: 'asia',
    label: '아시아',
    icon: '🌏',
    projectionConfig: { scale: 380, center: [105, 30] },
    regionFilter: ['아시아'],
  },
  {
    id: 'europe',
    label: '유럽',
    icon: '🌍',
    projectionConfig: { scale: 560, center: [18, 54] },
    regionFilter: ['유럽'],
  },
  {
    id: 'namerica',
    label: '북아메리카',
    icon: '🌎',
    projectionConfig: { scale: 300, center: [-96, 48] },
    regionFilter: ['아메리카'],
  },
  {
    id: 'samerica',
    label: '남아메리카',
    icon: '🌎',
    projectionConfig: { scale: 380, center: [-60, -18] },
    regionFilter: ['아메리카'],
  },
  {
    id: 'oceania',
    label: '오세아니아',
    icon: '🌏',
    projectionConfig: { scale: 500, center: [140, -26] },
    regionFilter: ['기타'],
  },
];

// ISO Numeric → Alpha-2
const ISO_NUMERIC_TO_ALPHA2: Record<string, string> = {
  '004': 'AF', '008': 'AL', '012': 'DZ', '024': 'AO', '032': 'AR',
  '036': 'AU', '040': 'AT', '050': 'BD', '056': 'BE', '068': 'BO',
  '076': 'BR', '100': 'BG', '116': 'KH', '120': 'CM', '124': 'CA',
  '144': 'LK', '152': 'CL', '156': 'CN', '170': 'CO', '188': 'CR',
  '191': 'HR', '192': 'CU', '196': 'CY', '203': 'CZ', '208': 'DK',
  '218': 'EC', '818': 'EG', '222': 'SV', '231': 'ET', '246': 'FI',
  '250': 'FR', '276': 'DE', '288': 'GH', '300': 'GR', '320': 'GT',
  '332': 'HT', '340': 'HN', '348': 'HU', '356': 'IN', '360': 'ID',
  '364': 'IR', '368': 'IQ', '376': 'IL', '380': 'IT', '388': 'JM',
  '392': 'JP', '400': 'JO', '398': 'KZ', '404': 'KE', '410': 'KR',
  '414': 'KW', '418': 'LA', '422': 'LB', '430': 'LR', '434': 'LY',
  '458': 'MY', '484': 'MX', '496': 'MN', '504': 'MA', '516': 'NA',
  '528': 'NL', '554': 'NZ', '558': 'NI', '566': 'NG', '578': 'NO',
  '586': 'PK', '591': 'PA', '598': 'PG', '600': 'PY', '604': 'PE',
  '608': 'PH', '616': 'PL', '620': 'PT', '630': 'PR', '634': 'QA',
  '642': 'RO', '643': 'RU', '682': 'SA', '706': 'SO', '710': 'ZA',
  '724': 'ES', '752': 'SE', '756': 'CH', '760': 'SY', '764': 'TH',
  '780': 'TT', '788': 'TN', '792': 'TR', '800': 'UG', '804': 'UA',
  '784': 'AE', '826': 'GB', '840': 'US', '858': 'UY', '862': 'VE',
  '704': 'VN', '887': 'YE', '894': 'ZM', '716': 'ZW', '064': 'BT',
  '096': 'BN', '104': 'MM', '524': 'NP', '462': 'MV',
  '508': 'MZ', '548': 'VU', '480': 'MU', '498': 'MD', '051': 'AM',
  '031': 'AZ', '268': 'GE', '070': 'BA', '807': 'MK',
  '499': 'ME', '688': 'RS', '703': 'SK',
  '705': 'SI', '440': 'LT', '428': 'LV', '233': 'EE', '112': 'BY',
  '238': 'FK', '442': 'LU', '470': 'MT',
};

function getDeltaColor(delta: number | null, dimmed = false): string {
  if (delta === null) return dimmed ? '#1e293b' : '#334155';
  if (dimmed) {
    if (delta < 0) return '#166534';
    if (delta < 10) return '#78350f';
    if (delta < 20) return '#7c2d12';
    if (delta < 40) return '#7f1d1d';
    return '#450a0a';
  }
  if (delta < 0) return '#22c55e';
  if (delta < 10) return '#fbbf24';
  if (delta < 20) return '#f97316';
  if (delta < 40) return '#ef4444';
  return '#991b1b';
}

function getImportColor(countryId: string): string {
  const data = importDependencyData[countryId];
  if (!data) return '#334155';
  switch (data.riskLevel) {
    case 'very-high': return '#dc2626';
    case 'high':      return '#f97316';
    case 'medium':    return '#facc15';
    case 'low':       return '#4ade80';
    case 'exporter':  return '#22c55e';
    default:          return '#334155';
  }
}

const KOREA_COORDINATES: [number, number] = [127.7669, 35.9078];

interface WorldMapProps {
  countries: Country[];
  selectedCountry: Country | null;
  onCountrySelect: (country: Country) => void;
  activeCategory?: EnergyType;
  category?: EnergyType;
  showKRW?: boolean;
  continent?: ContinentKey;
  mapMode?: 'price' | 'import' | 'security';
}

interface TooltipState {
  country: Country | null;
  x: number;
  y: number;
}

const WorldMap: React.FC<WorldMapProps> = ({
  countries,
  selectedCountry,
  onCountrySelect,
  activeCategory: activeCategoryProp,
  category: categoryProp,
  showKRW = false,
  continent = 'world',
  mapMode = 'price',
}) => {
  const activeCategory: EnergyType = (activeCategoryProp ?? categoryProp) ?? 'gasoline';
  const [tooltip, setTooltip] = useState<TooltipState>({ country: null, x: 0, y: 0 });
  const [geoLoaded, setGeoLoaded] = useState(false);

  // 지도 로딩 스켈레톤: 1.5초 후 숨김
  useEffect(() => {
    setGeoLoaded(false);
    const t = setTimeout(() => setGeoLoaded(true), 1500);
    return () => clearTimeout(t);
  }, []);

  const continentInfo = CONTINENTS.find(c => c.id === continent) ?? CONTINENTS[0];

  // 대륙 필터에서 보여줄 국가 ID set
  const highlightedIds = useMemo(() => {
    if (continentInfo.regionFilter.length === 0) return null; // world: 전체
    const set = new Set<string>();
    countries.forEach(c => {
      if (continentInfo.regionFilter.includes(c.region)) set.add(c.id);
    });
    return set;
  }, [continentInfo, countries]);

  const countryMap = useMemo(() => {
    const m = new Map<string, Country>();
    countries.forEach(c => m.set(c.id, c));
    return m;
  }, [countries]);

  const getCountryByNumericId = useCallback(
    (numericId: string): Country | undefined => {
      const alpha2 = ISO_NUMERIC_TO_ALPHA2[numericId];
      if (!alpha2) return undefined;
      return countryMap.get(alpha2);
    },
    [countryMap]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent, country: Country) => {
      const rect = (e.currentTarget as SVGElement)
        .closest('.map-container')
        ?.getBoundingClientRect();
      if (!rect) return;
      setTooltip({
        country,
        x: e.clientX - rect.left + 12,
        y: e.clientY - rect.top - 40,
      });
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    setTooltip({ country: null, x: 0, y: 0 });
  }, []);


  return (
    <div className="relative w-full h-full bg-slate-950 rounded-xl overflow-hidden map-container">
      {/* 로딩 스켈레톤 */}
      {!geoLoaded && (
        <div className="absolute inset-0 z-10">
          <MapSkeleton />
        </div>
      )}

      {/* 대륙 라벨 (전체 외에만 표시) */}
      {continent !== 'world' && (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-slate-800/90 backdrop-blur border border-slate-700 rounded-lg px-2.5 py-1.5">
          <span className="text-base">{continentInfo.icon}</span>
          <span className="text-xs font-semibold text-white">{continentInfo.label}</span>
          <span className="text-xs text-slate-400 ml-1">
            {highlightedIds ? `${highlightedIds.size}개국` : ''}
          </span>
        </div>
      )}

      {/* 지도 모드 배지 */}
      {mapMode === 'import' && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-orange-500/20 border border-orange-500/40 rounded-lg px-2 py-1">
          <span className="text-orange-400 text-xs font-semibold">🔗 수입 의존도</span>
        </div>
      )}
      {mapMode === 'security' && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-blue-500/20 border border-blue-500/40 rounded-lg px-2 py-1">
          <span className="text-blue-400 text-xs font-semibold">🛡️ 에너지 안보</span>
        </div>
      )}

      <ComposableMap
        projectionConfig={continentInfo.projectionConfig}
        style={{ width: '100%', height: '100%' }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const numericId = String(geo.id ?? '').padStart(3, '0');
              const country = getCountryByNumericId(numericId);
              const alpha2 = country?.id ?? ISO_NUMERIC_TO_ALPHA2[numericId];
              const isInContinent = !highlightedIds || (alpha2 ? highlightedIds.has(alpha2) : false);

              let fillColor: string;
              if (mapMode === 'import' || mapMode === 'security') {
                // 수입 의존도 / 에너지 안보 모드
                fillColor = alpha2 ? getImportColor(alpha2) : '#334155';
                if (!isInContinent) fillColor = '#1e293b';
              } else {
                // 가격 변화율 모드 (기본)
                const delta = country ? countryChangeRate(country, activeCategory) : null;
                fillColor = getDeltaColor(delta, !isInContinent);
              }

              const isSelected = selectedCountry?.id === country?.id;

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  style={{
                    default: {
                      fill: isSelected ? '#2563eb' : fillColor,
                      stroke: isSelected ? '#60a5fa' : '#0f172a',
                      strokeWidth: isSelected ? 2 : 0.5,
                      outline: 'none',
                      cursor: (country && isInContinent) ? 'pointer' : 'default',
                      opacity: isInContinent ? 1 : 0.35,
                    },
                    hover: {
                      fill: (country && isInContinent) ? '#60a5fa' : fillColor,
                      stroke: isInContinent ? '#1d4ed8' : '#0f172a',
                      strokeWidth: isInContinent ? 1.5 : 0.5,
                      outline: 'none',
                      cursor: (country && isInContinent) ? 'pointer' : 'default',
                      opacity: isInContinent ? 1 : 0.35,
                    },
                    pressed: { fill: '#2563eb', outline: 'none' },
                  }}
                  onClick={() => {
                    if (country && isInContinent) onCountrySelect(country);
                  }}
                  onMouseMove={(e) => {
                    if (country && isInContinent)
                      handleMouseMove(e as unknown as React.MouseEvent, country);
                  }}
                  onMouseLeave={handleMouseLeave}
                />
              );
            })
          }
        </Geographies>


        {/* 주요 국가 가격변화율 오버레이 마커 */}
        {mapMode === 'price' && (() => {
          // 지도에 표시할 주요 국가 좌표 (가격변화율 라벨)
          const LABEL_COUNTRIES: { id: string; coords: [number, number] }[] = [
            { id: 'KR', coords: [127.7, 35.9] },
            { id: 'JP', coords: [138.3, 36.2] },
            { id: 'CN', coords: [104.2, 35.9] },
            { id: 'IN', coords: [78.9, 20.6] },
            { id: 'US', coords: [-98.4, 39.5] },
            { id: 'DE', coords: [10.5, 51.2] },
            { id: 'GB', coords: [-3.4, 55.4] },
            { id: 'FR', coords: [2.2, 46.2] },
            { id: 'RU', coords: [90.0, 61.5] },
            { id: 'SA', coords: [45.0, 24.0] },
            { id: 'IR', coords: [53.7, 32.4] },
            { id: 'AU', coords: [133.8, -25.3] },
            { id: 'BR', coords: [-51.9, -14.2] },
            { id: 'CA', coords: [-96.8, 56.1] },
            { id: 'AE', coords: [54.4, 24.5] },
          ];
          return LABEL_COUNTRIES.map(({ id, coords }) => {
            const country = countries.find(c => c.id === id);
            if (!country) return null;
            const delta = countryChangeRate(country, activeCategory);
            if (delta === null) return null;
            const isHighlighted = !highlightedIds || highlightedIds.has(id);
            if (!isHighlighted) return null;
            const sign = delta >= 0 ? '+' : '';
            const color = delta < 0 ? '#4ade80' : delta < 10 ? '#fbbf24' : delta < 20 ? '#f97316' : '#ef4444';
            const bgColor = delta < 0 ? 'rgba(34,197,94,0.18)' : delta < 10 ? 'rgba(251,191,36,0.18)' : delta < 20 ? 'rgba(249,115,22,0.18)' : 'rgba(239,68,68,0.18)';
            return (
              <Marker key={id} coordinates={coords}>
                <g style={{ pointerEvents: 'none' }}>
                  <rect
                    x={-18} y={-9}
                    width={36} height={18}
                    rx={4}
                    fill={bgColor}
                    stroke={color}
                    strokeWidth={0.8}
                    opacity={0.92}
                  />
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    style={{ fontSize: '8.5px', fontWeight: 700, fill: color, fontFamily: 'monospace', letterSpacing: '-0.3px' }}
                  >
                    {sign}{delta.toFixed(1)}%
                  </text>
                </g>
              </Marker>
            );
          });
        })()}

        {/* 한국 고정 ★ 핀 */}
        <Marker coordinates={KOREA_COORDINATES}>
          <text
            textAnchor="middle"
            dominantBaseline="central"
            style={{
              fontSize: '18px',
              fill: '#fbbf24',
              filter: 'drop-shadow(0 0 4px rgba(251,191,36,0.8))',
              cursor: 'pointer',
              userSelect: 'none',
            }}
            onClick={() => {
              const kr = countryMap.get('KR');
              if (kr) onCountrySelect(kr);
            }}
          >
            ★
          </text>
          <text textAnchor="middle" y={14} style={{ fontSize: '8px', fill: '#fbbf24', fontWeight: 'bold' }}>
            한국
          </text>
        </Marker>
      </ComposableMap>

      {/* 호버 툴팁 */}
      {tooltip.country && (
        <Tooltip
          country={tooltip.country}
          activeCategory={activeCategory}
          x={tooltip.x}
          y={tooltip.y}
          showKRW={showKRW}
        />
      )}
    </div>
  );
};

export default WorldMap;
