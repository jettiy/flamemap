/**
 * WarBriefingPanel.tsx
 * 전황 브리핑 — 구조화된 데이터를 블록 형식으로 표시
 * live-data.json의 briefing 객체를 활용
 */
import React, { useEffect, useState } from 'react';
import { fetchLiveData, WarBriefing, LiveData, TrumpPost } from '../data/eiaService';

// ── 색상 맵 ──────────────────────────────────────────────────
const ACTOR_COLOR: Record<string, string> = {
  blue: 'border-blue-500/40 bg-blue-950/30',
  red:  'border-red-500/40 bg-red-950/30',
  green:'border-green-500/40 bg-green-950/30',
};
const ACTOR_BADGE: Record<string, string> = {
  blue: 'bg-blue-500/20 text-blue-300',
  red:  'bg-red-500/20 text-red-300',
  green:'bg-green-500/20 text-green-300',
};

// ── 섹션 타이틀 ──────────────────────────────────────────────
const SectionTitle: React.FC<{ icon: string; label: string }> = ({ icon, label }) => (
  <div className="flex items-center gap-2 mb-3">
    <span className="text-lg">{icon}</span>
    <h3 className="text-sm font-bold text-white tracking-wide">{label}</h3>
    <div className="flex-1 h-px bg-slate-700/60" />
  </div>
);

// ── 주요 지역 상황 배지 ──────────────────────────────────────
const HotspotBadge: React.FC<{ area: string; status: string; detail: string }> = ({ area, status, detail }) => (
  <div className="bg-slate-800/70 border border-slate-700/50 rounded-xl p-3">
    <div className="flex items-start justify-between gap-2 mb-1">
      <span className="text-xs font-bold text-white">{area}</span>
      <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 flex-shrink-0">{status}</span>
    </div>
    <p className="text-xs text-slate-400 leading-relaxed">{detail}</p>
  </div>
);

// ── 에너지/경제 수치 카드 ────────────────────────────────────
const EconCard: React.FC<{ label: string; value: string; note: string; up: boolean | null }> = ({ label, value, note, up }) => (
  <div className="bg-slate-800/70 border border-slate-700/50 rounded-xl p-3 text-center">
    <div className="text-xs text-slate-500 mb-1">{label}</div>
    <div className={`text-lg font-black leading-tight ${
      up === true ? 'text-red-400' : up === false ? 'text-green-400' : 'text-yellow-400'
    }`}>{value}</div>
    <div className="text-xs text-slate-500 mt-1 leading-snug">{note}</div>
  </div>
);

// ── 메인 컴포넌트 ────────────────────────────────────────────
const WarBriefingPanel: React.FC = () => {
  const [liveData, setLiveData] = useState<LiveData | null>(null);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab] = useState<'briefing' | 'timeline' | 'news' | 'trump'>('briefing');

  useEffect(() => {
    setLoading(true);
    fetchLiveData()
      .then(setLiveData)
      .finally(() => setLoading(false));
  }, []);

  const briefing: WarBriefing | undefined = liveData?.briefing;
  const warDay = liveData?.warDay;
  const updatedKST = liveData?.updatedAtKST;
  const warNews = liveData?.warNews ?? [];
  const trumpPosts: TrumpPost[] = liveData?.trumpPosts ?? [];

  return (
    <div className="flex flex-col h-full bg-slate-950 overflow-hidden">

      {/* ── 상단 헤더 ── */}
      <div className="flex-shrink-0 border-b border-slate-800 bg-slate-950">
        <div className="px-4 pt-3 pb-2">
          {/* 타이틀 행 */}
          <div className="flex items-center gap-2 mb-1">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-600/20 border border-red-500/40 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-bold text-red-300">
                {warDay ? `개전 ${warDay}일차` : '교전 중'}
              </span>
            </div>
            <h2 className="text-sm font-bold text-white">미·이스라엘-이란 전황</h2>
          </div>
          <p className="text-xs text-slate-500">
            {briefing?.operationName ?? "'장대한 분노' · '포효하는 사자' 작전"}
          </p>
          {updatedKST && (
            <p className="text-xs text-slate-600 mt-0.5">마지막 업데이트: {updatedKST}</p>
          )}
        </div>

        {/* 탭 전환 (4탭) */}
        <div className="flex gap-0 px-2 pb-0 overflow-x-auto scrollbar-hide">
          {([
            { id: 'briefing',  label: '📋 브리핑' },
            { id: 'timeline',  label: '📅 일지' },
            { id: 'news',      label: '📰 뉴스' },
            { id: 'trump',     label: '🇺🇸 트럼프' },
          ] as const).map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-shrink-0 flex-1 min-w-0 py-2 px-1 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                tab === t.id
                  ? 'border-red-500 text-red-300'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── 본문 스크롤 영역 ── */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col gap-3 p-4">
            {[1,2,3].map(i => <div key={i} className="h-24 bg-slate-800/50 rounded-xl animate-pulse" />)}
          </div>
        ) : tab === 'briefing' ? (
          <BriefingContent briefing={briefing} warNews={warNews} trumpPosts={trumpPosts} />
        ) : tab === 'timeline' ? (
          <TimelineContent briefing={briefing} />
        ) : tab === 'trump' ? (
          <TrumpContent trumpPosts={trumpPosts} />
        ) : (
          <NewsContent warNews={warNews} sources={briefing?.sources} />
        )}
      </div>
    </div>
  );
};

// ── 브리핑 콘텐츠 ────────────────────────────────────────────
const BriefingContent: React.FC<{
  briefing?: WarBriefing;
  warNews: ReturnType<typeof Array.prototype.slice>;
  trumpPosts?: TrumpPost[];
}> = ({ briefing, trumpPosts = [] }) => {
  if (!briefing) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500 text-sm">
        <div className="text-center">
          <div className="text-4xl mb-3">📡</div>
          <p>브리핑 데이터를 불러오는 중이에요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 flex flex-col gap-5">

      {/* 🏳️ 주요 행위자 */}
      <div>
        <SectionTitle icon="🏳️" label="주요 행위자 동향" />
        <div className="flex flex-col gap-3">
          {briefing.actors.map((actor) => (
            <div key={actor.id} className={`border rounded-xl p-3 ${ACTOR_COLOR[actor.color] ?? 'border-slate-700 bg-slate-800/40'}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{actor.flag}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ACTOR_BADGE[actor.color] ?? 'bg-slate-700 text-slate-300'}`}>
                  {actor.nameKo}
                </span>
              </div>
              <ul className="flex flex-col gap-1.5">
                {actor.updates.map((u, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                    <span className="text-slate-600 flex-shrink-0 mt-0.5">·</span>
                    {u}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ⚡ 주요 지역 상황 */}
      <div>
        <SectionTitle icon="⚡" label="주요 파급 지역" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {briefing.hotspots.map((h, i) => (
            <HotspotBadge key={i} area={h.area} status={h.status} detail={h.detail} />
          ))}
        </div>
      </div>

      {/* 💰 에너지·경제 */}
      <div>
        <SectionTitle icon="💰" label="에너지·경제 동향" />
        <div className="grid grid-cols-2 gap-2">
          {briefing.energyEconomy.map((e, i) => (
            <EconCard key={i} label={e.label} value={e.value} note={e.note} up={e.up} />
          ))}
        </div>
      </div>

      {/* 💀 피해 현황 */}
      <div>
        <SectionTitle icon="💀" label="피해 현황" />
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 flex flex-col gap-2">
          {Object.entries(briefing.casualties).map(([key, val]) => {
            if (typeof val === 'string') return (
              <div key={key} className="text-xs text-slate-500">{val}</div>
            );
            return (
              <div key={key} className="flex items-center justify-between">
                <span className="text-xs text-slate-400">{val.label}</span>
                <span className="text-xs font-bold text-red-400">{val.value}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 🗡️ 주요 암살 목록 */}
      {(briefing as any).keyAssassinations?.length > 0 && (
        <div>
          <SectionTitle icon="🗡️" label="주요 제거 인물" />
          <div className="bg-red-950/30 border border-red-800/40 rounded-xl p-3 flex flex-col gap-1.5">
            {(briefing as any).keyAssassinations.map((name: string, i: number) => (
              <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                <span className="text-red-500 flex-shrink-0 mt-0.5">✕</span>
                {name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 📅 주요 사건 타임라인 (briefing.timeline) */}
      {(briefing as any).timeline?.length > 0 && (
        <div>
          <SectionTitle icon="📅" label="주요 사건 일지 (최신순)" />
          <div className="flex flex-col gap-0">
            {[...(briefing as any).timeline]
              .sort((a: any, b: any) => b.date.localeCompare(a.date))
              .map((item: any, i: number) => {
                const isLast = i === (briefing as any).timeline.length - 1;
                const typeColor = item.type === 'military'
                  ? 'bg-red-500' : item.type === 'energy'
                  ? 'bg-orange-500' : 'bg-blue-500';
                return (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ring-2 ring-slate-950 ${typeColor}`} />
                      {!isLast && <div className="w-px flex-1 bg-slate-700/60 mt-1" />}
                    </div>
                    <div className="pb-3 flex-1 min-w-0">
                      <span className="text-xs text-slate-500 font-mono">{item.date}</span>
                      <p className="text-xs text-slate-300 leading-relaxed mt-0.5">{item.event}</p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* 출처 */}
      {briefing.sources?.length > 0 && (
        <div className="text-xs text-slate-600 text-center pb-2">
          출처: {briefing.sources.join(', ')} · {briefing.updatedKST}
        </div>
      )}

      {/* 🇺🇸 트럼프 Truth Social 게시물 */}
      {trumpPosts.length > 0 && (
        <div>
          <SectionTitle icon="🇺🇸" label="트럼프 Truth Social" />
          <div className="flex flex-col gap-3">
            {trumpPosts.map((post, i) => (
              <div key={i} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">T</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Donald J. Trump</div>
                    <div className="text-xs text-slate-500 font-mono">{post.date}</div>
                  </div>
                  {post.url && (
                    <a href={post.url} target="_blank" rel="noopener noreferrer"
                      className="ml-auto text-xs text-blue-400 hover:text-blue-300">↗</a>
                  )}
                </div>
                <p className="text-sm font-semibold text-white leading-snug mb-1.5">{post.summary}</p>
                <p className="text-xs text-slate-400 italic leading-relaxed line-clamp-3">{post.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── 트럼프 Truth Social 탭 (독립) ───────────────────────────
const TrumpContent: React.FC<{ trumpPosts: TrumpPost[] }> = ({ trumpPosts }) => {
  const sorted = [...trumpPosts].sort((a, b) => b.date.localeCompare(a.date));

  if (!sorted.length) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-3 text-slate-500">
        <span className="text-4xl">🇺🇸</span>
        <p className="text-sm">데이터를 불러오는 중이에요.</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 flex flex-col gap-3">
      {/* 헤더 설명 */}
      <div className="bg-blue-950/40 border border-blue-800/40 rounded-xl px-3 py-2 flex items-center gap-2">
        <span className="text-xl">🇺🇸</span>
        <div>
          <p className="text-xs font-bold text-blue-200">@realDonaldTrump · Truth Social</p>
          <p className="text-xs text-slate-500">이란 전쟁·에너지 관련 게시물 (최신순)</p>
        </div>
        <a href="https://truthsocial.com/@realDonaldTrump" target="_blank" rel="noopener noreferrer"
          className="ml-auto text-xs text-blue-400 hover:text-blue-300 flex-shrink-0">원문 ↗</a>
      </div>

      {sorted.map((post, i) => (
        <div key={i} className="bg-slate-800/70 border border-slate-700/50 rounded-xl p-4">
          {/* 프로필 행 */}
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center flex-shrink-0 border-2 border-blue-500/40">
              <span className="text-white text-sm font-black">T</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white">Donald J. Trump</div>
              <div className="text-xs text-slate-500">@realDonaldTrump · <span className="font-mono">{post.date}</span></div>
            </div>
            {post.url && (
              <a href={post.url} target="_blank" rel="noopener noreferrer"
                className="flex-shrink-0 text-xs text-slate-500 hover:text-blue-400 transition-colors">↗</a>
            )}
          </div>

          {/* 원문 (영어) */}
          <p className="text-sm text-white leading-relaxed mb-2.5 border-l-2 border-blue-500/40 pl-3">
            "{post.text}"
          </p>

          {/* 한국어 요약 */}
          <div className="bg-slate-900/60 rounded-lg px-3 py-2">
            <p className="text-xs text-blue-300 font-medium mb-0.5">🇰🇷 번역 요약</p>
            <p className="text-xs text-slate-300 leading-relaxed">{post.summary}</p>
          </div>
        </div>
      ))}

      <p className="text-xs text-slate-600 text-center pb-2">
        출처: Trump Truth Social (@realDonaldTrump)
      </p>
    </div>
  );
};

// ── 사건일지 콘텐츠 ─────────────────────────────────────────
const TimelineContent: React.FC<{ briefing?: WarBriefing }> = ({ briefing }) => {
  const items: any[] = (briefing as any)?.timeline ?? [];
  const sorted = [...items].sort((a, b) => b.date.localeCompare(a.date));

  const TYPE_CONFIG: Record<string, { dot: string; badge: string; label: string }> = {
    military:   { dot: 'bg-red-500',    badge: 'bg-red-500/20 text-red-300',    label: '군사' },
    diplomatic: { dot: 'bg-blue-500',   badge: 'bg-blue-500/20 text-blue-300',  label: '외교' },
    energy:     { dot: 'bg-orange-500', badge: 'bg-orange-500/20 text-orange-300', label: '에너지' },
    sanction:   { dot: 'bg-purple-500', badge: 'bg-purple-500/20 text-purple-300', label: '제재' },
  };

  if (!sorted.length) return (
    <div className="flex items-center justify-center h-48 text-slate-500 text-sm">데이터를 불러오는 중이에요.</div>
  );

  return (
    <div className="px-4 py-3 flex flex-col gap-0">
      {/* 범례 */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {Object.entries(TYPE_CONFIG).map(([k, v]) => (
          <span key={k} className={`text-xs px-2 py-0.5 rounded-full ${v.badge}`}>{v.label}</span>
        ))}
      </div>

      {sorted.map((item: any, i: number) => {
        const cfg = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.military;
        const isLast = i === sorted.length - 1;
        return (
          <div key={i} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full mt-0.5 flex-shrink-0 ring-2 ring-slate-950 ${cfg.dot}`} />
              {!isLast && <div className="w-px flex-1 bg-slate-700/50 mt-1" />}
            </div>
            <div className="pb-4 flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-slate-500 font-mono">{item.date}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${cfg.badge}`}>{cfg.label}</span>
              </div>
              <div className="bg-slate-800/60 rounded-xl px-3 py-2 border border-slate-700/50">
                <p className="text-xs text-slate-200 leading-relaxed">{item.event}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ── 뉴스 콘텐츠 ─────────────────────────────────────────────
const NewsContent: React.FC<{
  warNews: { title: string; description: string; link: string; pubDate: string; source: string }[];
  sources?: string[];
}> = ({ warNews, sources }) => {
  const sorted = [...warNews].sort((a, b) => b.pubDate.localeCompare(a.pubDate));

  return (
    <div className="px-4 py-3 flex flex-col gap-3">
      {sorted.length === 0 ? (
        <div className="text-center py-8 text-slate-500 text-xs">
          <div className="text-3xl mb-2">📰</div>
          <p>뉴스를 불러오는 중이에요.</p>
        </div>
      ) : (
        sorted.map((item, idx) => (
          <a key={idx} href={item.link} target="_blank" rel="noopener noreferrer"
            className="block bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <span className="text-xs text-blue-400 font-medium">{item.source}</span>
              <span className="text-xs text-slate-500 font-mono flex-shrink-0">{item.pubDate}</span>
            </div>
            {/* 한국어 요약 우선 표시 */}
            <p className="text-sm font-semibold text-white leading-snug mb-1.5">{item.description}</p>
            {/* 원문 작게 */}
            <p className="text-xs text-slate-500 italic leading-relaxed line-clamp-2">{item.title}</p>
            <div className="mt-1.5 text-xs text-slate-600">↗ 원문 보기</div>
          </a>
        ))
      )}
      {sources?.length ? (
        <p className="text-xs text-slate-600 text-center pb-2">
          출처: {sources.join(', ')}
        </p>
      ) : null}
    </div>
  );
};

export default WarBriefingPanel;
