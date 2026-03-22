import React, { useState, useMemo, useEffect } from 'react';
import './App.css';

import { EnergyType, MobileTab } from './data/types';
import { countries } from './data/countries';
import { categories } from './data/categories';

import WorldMap, { ContinentKey } from './components/WorldMap';
import MapLegend from './components/MapLegend';
import EnergyTabs from './components/EnergyTabs';
import ContinentTabs from './components/ContinentTabs';
import StatsStrip from './components/StatsStrip';
import PriceChart from './components/PriceChart';
import RankingPanel from './components/RankingPanel';
import EnergyMatrixPanel from './components/EnergyMatrixPanel';
import RankingSubTabs from './components/RankingSubTabs';
import WarTimeline from './components/WarTimeline';
import WarBriefingPanel from './components/WarBriefingPanel';
import ShareCard from './components/ShareCard';
import MarketTicker from './components/MarketTicker';
import CountryNewsPanel from './components/CountryNewsPanel';

/* ══════════════════════════════════════════════════════
   데스크탑 섹션 (비교 탭 제거)
══════════════════════════════════════════════════════ */
type DesktopSection = 'map' | 'chart' | 'ranking' | 'timeline' | 'briefing';

const DESKTOP_SIDEBAR: { id: DesktopSection; label: string; icon: string }[] = [
  { id: 'map',      label: '지도',     icon: '🗺️' },
  { id: 'chart',    label: '차트',     icon: '📊' },
  { id: 'ranking',  label: '랭킹',     icon: '🏆' },
  { id: 'timeline', label: '타임라인', icon: '⚠️' },
  { id: 'briefing', label: '전황',     icon: '📡' },
];

/* 모바일 탭 (비교 탭 제거) */
const MOBILE_TABS: { id: MobileTab; label: string; icon: string }[] = [
  { id: 'map',      label: '지도',   icon: '🗺️' },
  { id: 'chart',    label: '차트',   icon: '📊' },
  { id: 'ranking',  label: '랭킹',   icon: '🏆' },
  { id: 'timeline', label: '타임라인', icon: '⚠️' },
  { id: 'briefing', label: '전황',   icon: '📡' },
];

/* ══════════════════════════════════════════════════════
   메인 App
══════════════════════════════════════════════════════ */
function App() {
  const [category, setCategory]             = useState<EnergyType>('gasoline');
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null);
  const [showKRW, setShowKRW]               = useState(false);
  const [mobileTab, setMobileTab]           = useState<MobileTab>('map');
  const [prevTab, setPrevTab]               = useState<MobileTab>('map');
  const [chartHighlight, setChartHighlight] = useState(false);
  const [continent, setContinent]           = useState<ContinentKey>('world');
  const [showShareCard, setShowShareCard]   = useState(false);
  const [mapMode, setMapMode]               = useState<'price' | 'import'>('price');
  const [desktopSection, setDesktopSection] = useState<DesktopSection>('map');
  const [isDark, setIsDark]                 = useState(true); // 기본 다크

  // 테마 적용
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
    }
  }, [isDark]);

  const selectedCountry = useMemo(
    () => countries.find((c) => c.id === selectedCountryId) ?? null,
    [selectedCountryId]
  );
  const koreaCountry  = useMemo(() => countries.find((c) => c.id === 'KR')!, []);
  const categoryInfo  = useMemo(() => categories.find((c) => c.id === category)!, [category]);

  const handleCountrySelect = (countryId: string) => {
    setSelectedCountryId(countryId);
    if (window.innerWidth < 640) {
      setPrevTab(mobileTab);
      setMobileTab('chart');
    } else {
      setChartHighlight(true);
      setTimeout(() => setChartHighlight(false), 1200);
    }
  };

  const handleTabChange = (tab: MobileTab) => {
    setPrevTab(mobileTab);
    setMobileTab(tab);
  };

  const handleBack = () => setMobileTab(prevTab);
  const showBack = mobileTab === 'chart';

  // ── 테마별 클래스 헬퍼 ──
  const t = {
    bgPrimary:   isDark ? 'bg-slate-950' : 'bg-slate-50',
    bgSecondary: isDark ? 'bg-slate-900' : 'bg-slate-100',
    bgCard:      isDark ? 'bg-slate-800' : 'bg-white',
    bgCardHover: isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100',
    border:      isDark ? 'border-slate-700' : 'border-slate-200',
    borderLight: isDark ? 'border-slate-800' : 'border-slate-200',
    text:        isDark ? 'text-slate-100' : 'text-slate-900',
    textSub:     isDark ? 'text-slate-400' : 'text-slate-600',
    textMuted:   isDark ? 'text-slate-500' : 'text-slate-500',
    sidebar:     isDark ? 'bg-slate-900' : 'bg-slate-100',
    header:      isDark ? 'bg-slate-900/95' : 'bg-white/95',
    warBanner:   isDark
      ? 'bg-gradient-to-r from-red-950 to-red-900/80 border-red-800/60 text-red-200'
      : 'bg-gradient-to-r from-red-100 to-red-50 border-red-200 text-red-700',
    sidebarActive: isDark ? 'bg-blue-600/20 text-blue-400 ring-1 ring-blue-500/40' : 'bg-blue-100 text-blue-600 ring-1 ring-blue-300',
    sidebarHover:  isDark ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-800' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200',
    tabActive:     isDark ? 'text-blue-400' : 'text-blue-600',
    tabInactive:   isDark ? 'text-slate-500' : 'text-slate-400',
    tabBar:        isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200',
    tabHighlight:  isDark ? 'bg-blue-400' : 'bg-blue-600',
    btnSecondary:  isDark ? 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-200' : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200',
    btnActive:     isDark ? 'bg-blue-500/20 text-blue-400 border-blue-500/40' : 'bg-blue-100 text-blue-600 border-blue-300',
    btnDisabled:   isDark ? 'bg-slate-900 text-slate-700 border-slate-800' : 'bg-slate-50 text-slate-300 border-slate-200',
    mapBorder:     isDark ? 'border-slate-700/60' : 'border-slate-300',
  };

  return (
    <div className={`h-screen ${t.bgPrimary} ${t.text} flex flex-col overflow-hidden transition-colors duration-300`}>

      {/* ─── 헤더 ─── */}
      <header className={`flex-shrink-0 ${t.header} backdrop-blur border-b ${t.border} px-4 py-2.5 flex items-center justify-between z-30`}>
        <div className="flex items-center gap-2.5">
          {showBack && (
            <button onClick={handleBack}
              className={`sm:hidden flex items-center gap-1 px-2 py-1.5 rounded-lg ${t.btnSecondary} border text-xs transition-colors mr-1`}
            >‹ 뒤로</button>
          )}
          <span className="text-xl">🔥</span>
          <div>
            <h1 className="text-sm font-bold leading-tight tracking-tight">
              <span className="sm:hidden">
                {mobileTab === 'chart' && selectedCountry ? `${selectedCountry.nameKo} · 가격 추이`
                 : mobileTab === 'timeline' ? '⚠️ 전쟁 타임라인'
                 : 'FlameMap'}
              </span>
              <span className="hidden sm:inline">🔥 FlameMap</span>
            </h1>
            <p className={`text-xs ${t.textMuted} hidden sm:block`}>에너지 전쟁 지도 · 이란-미국/이스라엘 전쟁</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`hidden sm:flex items-center gap-1.5 text-xs ${t.textMuted} border ${t.border} rounded-lg px-2.5 py-1`}>
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />2026.03.16 기준
          </span>

          {/* 공유 */}
          <button onClick={() => selectedCountry && setShowShareCard(true)} disabled={!selectedCountry}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs border transition-colors ${
              selectedCountry ? t.btnSecondary : t.btnDisabled
            }`}
          >📤 공유</button>

          {/* 지도 모드 */}
          <button onClick={() => setMapMode(m => m === 'price' ? 'import' : 'price')}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              mapMode === 'import'
                ? 'bg-orange-500/20 text-orange-400 border-orange-500/40'
                : t.btnSecondary
            }`}
          >{mapMode === 'import' ? '🔗 의존도' : '📊 가격'}</button>

          {/* KRW/USD */}
          <button onClick={() => setShowKRW(p => !p)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              showKRW ? t.btnActive : t.btnSecondary
            }`}
          >{showKRW ? '₩ KRW' : '$ USD'}</button>

          {/* 다크/라이트 토글 */}
          <button onClick={() => setIsDark(d => !d)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${t.btnSecondary}`}
            title={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* ─── 전쟁 배너 ─── */}
      <div className={`flex-shrink-0 ${t.warBanner} border-b px-4 py-1.5 text-center war-banner`}>
        <p className="text-xs font-medium">
          ⚠️ 이란-미국/이스라엘 전쟁(2026.01.20~) 영향 — 글로벌 에너지 평균&nbsp;
          <span className={`font-bold text-sm ${isDark ? 'text-red-100' : 'text-red-700'}`}>+27.3%</span>&nbsp;상승
        </p>
      </div>

      {/* ─── 원자재 티커 ─── */}
      <MarketTicker />

      {/* ─── 에너지 탭 ─── */}
      <div className={`flex-shrink-0 ${t.bgSecondary}/60 border-b ${t.borderLight}`}>
        <EnergyTabs categories={categories} active={category} onChange={setCategory} />
      </div>

      {/* ══════════════ 데스크탑 ══════════════ */}
      <div className="hidden sm:flex flex-1 min-h-0 overflow-hidden">

        {/* 좌측 사이드바 */}
        <div className={`flex-shrink-0 w-[68px] ${t.sidebar} border-r ${t.borderLight} flex flex-col items-center py-2 gap-1 z-20`}>
          {DESKTOP_SIDEBAR.map((item) => (
            <button key={item.id} onClick={() => setDesktopSection(item.id)} title={item.label}
              className={[
                'w-12 flex flex-col items-center justify-center gap-0.5 py-2.5 rounded-xl transition-all text-center',
                desktopSection === item.id ? t.sidebarActive : t.sidebarHover,
              ].join(' ')}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              <span className="text-[9px] font-medium leading-tight">{item.label}</span>
            </button>
          ))}
        </div>

        {/* 메인 콘텐츠 */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">

          {/* 대륙 탭 (지도/랭킹에서만) */}
          {(desktopSection === 'map' || desktopSection === 'ranking') && (
            <div className="flex-shrink-0">
              <ContinentTabs active={continent} onChange={setContinent} />
            </div>
          )}

          {/* 통계 스트립 (지도/차트에서만) */}
          {(desktopSection === 'map' || desktopSection === 'chart') && (
            <div className="flex-shrink-0">
              <StatsStrip countries={countries} category={category} showKRW={showKRW} />
            </div>
          )}

          {/* 콘텐츠 */}
          <div className="flex-1 min-h-0 flex gap-2 p-2 overflow-hidden">

            {/* 지도 섹션: 지도 + 차트 + 랭킹 3단 */}
            {desktopSection === 'map' && (
              <>
                <div className="flex flex-col min-h-0" style={{ flex: '8' }}>
                  <div className={`flex-1 min-h-0 rounded-xl overflow-hidden border ${t.mapBorder}`}>
                    <WorldMap countries={countries} selectedCountry={selectedCountry}
                      category={category} continent={continent}
                      onCountrySelect={(c) => handleCountrySelect(c.id)} mapMode={mapMode}
                    />
                  </div>
                  <div className="mt-1.5 flex-shrink-0">
                    <MapLegend category={category} mapMode={mapMode} />
                  </div>
                </div>
                <div className="flex flex-col gap-2 min-h-0" style={{ flex: '4' }}>
                  <div className={`min-h-0 rounded-xl transition-all duration-500 ${chartHighlight ? 'ring-2 ring-blue-400 ring-offset-2' : ''}`} style={{ flex: '5' }}>
                    <PriceChart selectedCountry={selectedCountry} koreaCountry={koreaCountry}
                      category={category} categoryInfo={categoryInfo}
                      countries={countries} showKRW={showKRW}
                    />
                  </div>
                  <div className="min-h-0 overflow-hidden rounded-xl" style={{ flex: '6' }}>
                    <RankingPanel countries={countries} selectedCountry={selectedCountry}
                      category={category} categoryInfo={categoryInfo}
                      showKRW={showKRW} continent={continent}
                      onCountrySelect={(c) => handleCountrySelect(c.id)}
                    />
                  </div>
                </div>
              </>
            )}

            {/* 차트 섹션: 풀 화면 차트 + 우측 국가 뉴스 */}
            {desktopSection === 'chart' && (
              <>
                <div className={`flex-1 min-h-0 rounded-xl overflow-hidden border ${t.mapBorder}`}>
                  <PriceChart selectedCountry={selectedCountry} koreaCountry={koreaCountry}
                    category={category} categoryInfo={categoryInfo}
                    countries={countries} showKRW={showKRW}
                  />
                </div>
                {selectedCountry && (
                  <div className="w-72 flex-shrink-0 overflow-y-auto">
                    <CountryNewsPanel countryId={selectedCountry.id} countryNameKo={selectedCountry.nameKo} />
                  </div>
                )}
              </>
            )}

            {/* 랭킹 섹션: 전체 폭 랭킹 리스트 (지도 없음) */}
            {desktopSection === 'ranking' && (
              <div className={`flex-1 min-h-0 rounded-xl overflow-hidden border ${t.mapBorder} flex flex-col`}>
                <RankingSubTabs
                  desktopProps={{
                    countries,
                    selectedCountry,
                    category,
                    categoryInfo,
                    showKRW,
                    continent,
                    onCountrySelect: (c) => { handleCountrySelect(c.id); setDesktopSection('chart'); },
                  }}
                />
              </div>
            )}

            {/* 타임라인 섹션 */}
            {desktopSection === 'timeline' && (
              <div className={`flex-1 min-h-0 overflow-hidden rounded-xl border ${t.mapBorder}`}>
                <WarTimeline />
              </div>
            )}

            {/* 전황 브리핑 섹션 */}
            {desktopSection === 'briefing' && (
              <div className={`flex-1 min-h-0 overflow-hidden rounded-xl border ${t.mapBorder}`}>
                <WarBriefingPanel />
              </div>
            )}

          </div>
        </div>
      </div>

      {/* 대륙 탭 (모바일 지도/랭킹 탭에서만) */}
      <div className={`flex-shrink-0 sm:hidden ${mobileTab !== 'map' && mobileTab !== 'ranking' ? 'hidden' : ''}`}>
        <ContinentTabs active={continent} onChange={setContinent} />
      </div>

      {/* ══════════════ 모바일 ══════════════ */}
      <div className="flex sm:hidden flex-1 min-h-0 flex-col overflow-hidden">
        <div className="flex-1 min-h-0 overflow-hidden">

          {mobileTab === 'map' && (
            <div className="h-full flex flex-col p-2 gap-2">
              <div className={`flex-1 min-h-0 rounded-xl overflow-hidden border ${t.mapBorder}`}>
                <WorldMap countries={countries} selectedCountry={selectedCountry}
                  category={category} continent={continent}
                  onCountrySelect={(c) => handleCountrySelect(c.id)} mapMode={mapMode}
                />
              </div>
              <div className="flex-shrink-0"><MapLegend category={category} mapMode={mapMode} /></div>
            </div>
          )}

          {mobileTab === 'chart' && (
            <div className="h-full flex flex-col p-2 gap-2 overflow-y-auto">
              {selectedCountry && (
                <div className="flex-shrink-0 flex items-center gap-2 px-1">
                  <span className="flag-emoji">{selectedCountry.id ? (() => {
                    const id = selectedCountry.id;
                    return id.toUpperCase().replace(/./g, (c: string) => String.fromCodePoint(c.charCodeAt(0) + 127397));
                  })() : ''}</span>
                  <span className="text-sm font-semibold">{selectedCountry.nameKo}</span>
                </div>
              )}
              <div className="flex-shrink-0" style={{ height: '260px' }}>
                <PriceChart selectedCountry={selectedCountry} koreaCountry={koreaCountry}
                  category={category} categoryInfo={categoryInfo}
                  countries={countries} showKRW={showKRW}
                />
              </div>
              {selectedCountry && (
                <div className="flex-shrink-0">
                  <CountryNewsPanel countryId={selectedCountry.id} countryNameKo={selectedCountry.nameKo} />
                </div>
              )}
            </div>
          )}

          {mobileTab === 'ranking' && (
            <div className="h-full overflow-hidden">
              <RankingSubTabs
                mobileProps={{ countries, selectedCountry, category, categoryInfo, showKRW, continent, onCountrySelect: (c) => handleCountrySelect(c.id) }}
              />
            </div>
          )}

          {mobileTab === 'timeline' && (
            <div className="h-full overflow-hidden">
              <WarTimeline />
            </div>
          )}

          {mobileTab === 'briefing' && (
            <div className="h-full overflow-hidden">
              <WarBriefingPanel />
            </div>
          )}
        </div>

        {/* 하단 탭바 */}
        <div className={`flex-shrink-0 ${t.tabBar} border-t flex`}>
          {MOBILE_TABS.map((tab) => (
            <button key={tab.id} onClick={() => handleTabChange(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-colors ${
                mobileTab === tab.id ? t.tabActive : t.tabInactive
              }`}
            >
              <span className="text-xl leading-none">{tab.icon}</span>
              <span className="text-xs">{tab.label}</span>
              {mobileTab === tab.id && <div className={`w-5 h-0.5 ${t.tabHighlight} rounded-full mt-0.5`} />}
            </button>
          ))}
        </div>
      </div>

      {/* ShareCard */}
      {showShareCard && selectedCountry && (
        <ShareCard country={selectedCountry} koreaCountry={koreaCountry}
          category={category} categoryInfo={categoryInfo}
          showKRW={showKRW} onClose={() => setShowShareCard(false)}
        />
      )}
    </div>
  );
}

export default App;
