/**
 * 트럼프 Truth Social 게시물 하드코딩 목록
 * 이란·이스라엘 전쟁(2026-02-28~) 이후 전쟁·에너지 관련 주요 발언
 * 최신순(위) → 오래된 순(아래)
 */

export interface TrumpPost {
  date: string;           // 'YYYY-MM-DD'
  text: string;           // 원문 영어
  summary: string;        // 한국어 요약 (60자 이내)
  tag: 'war' | 'energy' | 'diplomacy' | 'economy';
  url?: string;
}

export const trumpPostsStatic: TrumpPost[] = [
  // ── 3월 24일 ──
  {
    date: '2026-03-24',
    text: 'Iran has ONE MORE CHANCE at Peace. We are in very productive talks. Do not blow it, Iran!',
    summary: '이란에 평화의 마지막 기회. 매우 생산적인 협상 진행 중. 망치지 마라.',
    tag: 'diplomacy',
    url: 'https://truthsocial.com/@realDonaldTrump',
  },
  {
    date: '2026-03-24',
    text: 'The United States is the largest Oil Producer in the World, by far. When oil prices go down, that is also a Tax Cut for the American people! MAKE AMERICA GREAT AGAIN!',
    summary: '미국이 세계 최대 원유 생산국. 유가 하락은 국민 감세. MAGA.',
    tag: 'energy',
    url: 'https://truthsocial.com/@realDonaldTrump/posts/116216383667242591',
  },
  // ── 3월 23일 ──
  {
    date: '2026-03-23',
    text: 'I have just ordered a HALT on all Strikes against Iranian Energy and Oil sites. There has been a tremendous amount of progress in the Talks. Let us see how it all works out — Iran has one more chance at Peace!',
    summary: '이란 에너지·석유 시설 공습 전면 중단 명령. 협상 큰 진전. 이란에 평화 마지막 기회.',
    tag: 'diplomacy',
    url: 'https://truthsocial.com/@realDonaldTrump',
  },
  {
    date: '2026-03-23',
    text: 'I have agreed, at the request of many friendly Nations, to postpone the Iran Deadline for 24 additional hours. There has been tremendous progress! I have also just been informed that a Very Good Meeting has taken place between our Representatives and those of Iran.',
    summary: '이란 데드라인 24시간 추가 연장. 미·이란 대표자 간 매우 좋은 회의 진행.',
    tag: 'diplomacy',
    url: 'https://truthsocial.com/@realDonaldTrump',
  },
  {
    date: '2026-03-23',
    text: 'The War with Iran is very complete, pretty much. Our Military did a FANTASTIC job!',
    summary: '이란전 거의 완료. 미군 훌륭한 임무 수행.',
    tag: 'war',
    url: 'https://truthsocial.com/@realDonaldTrump',
  },
  // ── 3월 22일 ──
  {
    date: '2026-03-22',
    text: 'If Iran does not open the Strait of Hormuz IMMEDIATELY, we will hit them 20 TIMES HARDER than we already have. No more games!',
    summary: '호르무즈 즉각 개방 안 하면 20배 강타 경고. 게임 끝.',
    tag: 'war',
    url: 'https://truthsocial.com/@realDonaldTrump',
  },
  {
    date: '2026-03-22',
    text: 'Our great Allies are joining us in the Strait of Hormuz. Together we will reopen the most important waterway in the World. Iran knows what will happen if they interfere!',
    summary: '동맹국들 호르무즈 합동 개방 작전 참여. 이란 방해 시 결과 감수해야.',
    tag: 'war',
    url: 'https://truthsocial.com/@realDonaldTrump',
  },
  // ── 3월 21일 ──
  {
    date: '2026-03-21',
    text: 'OPEN THE STRAIT OF HORMUZ NOW, IRAN. You have 48 hours or we will destroy your power plants. This is your FINAL WARNING!',
    summary: '호르무즈 48시간 내 개방 요구. 불응 시 발전소 파괴. 최후 경고.',
    tag: 'war',
    url: 'https://truthsocial.com/@realDonaldTrump',
  },
  // ── 3월 20일 ──
  {
    date: '2026-03-20',
    text: 'We are WINNING the War in Iran. Phase 1 is almost complete. Oil prices will come down very soon, just watch!',
    summary: '이란전 1단계 거의 완료, 승리 중. 유가 곧 내릴 것.',
    tag: 'war',
    url: 'https://truthsocial.com/@realDonaldTrump',
  },
  {
    date: '2026-03-20',
    text: 'Allowing Iran to temporarily sell its oil was a STRATEGIC decision to keep markets stable. America First means smart energy policy!',
    summary: '이란 원유 한시 판매 허용은 전략적 결정. 시장 안정 목적.',
    tag: 'energy',
    url: 'https://truthsocial.com/@realDonaldTrump',
  },
  // ── 3월 19일 ──
  {
    date: '2026-03-19',
    text: 'Happy Nowruz to the people of Iran — your government does NOT speak for you. Freedom is coming! 🇺🇸',
    summary: '이란 국민에게 노루즈 축하. 정부가 대변 못 해. 자유가 온다.',
    tag: 'diplomacy',
    url: 'https://truthsocial.com/@realDonaldTrump',
  },
  // ── 3월 17일 ──
  {
    date: '2026-03-17',
    text: 'America is releasing 45 MILLION barrels of Strategic Petroleum Reserves to keep gasoline prices LOW for the American people. No country produces more energy than us!',
    summary: '전략비축유 4,500만 배럴 방출. 국민 유가 안정. 세계 최대 에너지 생산국.',
    tag: 'energy',
    url: 'https://truthsocial.com/@realDonaldTrump',
  },
  // ── 3월 14일 ──
  {
    date: '2026-03-14',
    text: 'GREAT NEWS: We have completely destroyed Iran\'s largest oil export hub. This sends a clear message — you attack the world\'s energy supply, you pay the price!',
    summary: '이란 최대 석유 수출허브 완전 파괴. 에너지 공급 공격 시 대가 치른다.',
    tag: 'war',
    url: 'https://truthsocial.com/@realDonaldTrump',
  },
  // ── 3월 13일 ──
  {
    date: '2026-03-13',
    text: 'South Korea did the right thing by capping gasoline prices. Many countries are following America\'s lead in protecting their citizens from Iran\'s energy terrorism!',
    summary: '한국 휘발유 상한제 잘한 결정. 이란 에너지 테러로부터 시민 보호.',
    tag: 'energy',
    url: 'https://truthsocial.com/@realDonaldTrump',
  },
  // ── 3월 10일 ──
  {
    date: '2026-03-10',
    text: 'The United States, together with our IEA partners, is releasing an UNPRECEDENTED amount of strategic oil reserves to stabilize global energy markets. DRILL BABY DRILL!',
    summary: '미국·IEA, 전례 없는 규모 전략비축유 방출로 에너지 시장 안정. 드릴 베이비 드릴!',
    tag: 'energy',
    url: 'https://truthsocial.com/@realDonaldTrump',
  },
  // ── 3월 7일 ──
  {
    date: '2026-03-07',
    text: 'Iran says they will stop attacking our Allies. We\'ll see... Our Military is watching VERY CLOSELY. Any more attacks and the consequences will be SEVERE!',
    summary: '이란 동맹국 공격 중단 선언에 "두고 봐라". 추가 공격 시 엄중 대응.',
    tag: 'war',
    url: 'https://truthsocial.com/@realDonaldTrump',
  },
  // ── 3월 4일 ──
  {
    date: '2026-03-04',
    text: 'Iran ATTACKED our bases, killed our soldiers. The response will be POWERFUL and SWIFT. Nobody attacks America without consequences. NOBODY!',
    summary: '이란이 미군 기지 공격·병사 살해. 강력하고 신속한 대응 예고.',
    tag: 'war',
    url: 'https://truthsocial.com/@realDonaldTrump',
  },
  // ── 3월 1일 ──
  {
    date: '2026-03-01',
    text: 'Iran fired on US forces last night. Americans died. Make no mistake — we will respond with overwhelming force. The era of weakness is OVER!',
    summary: '이란이 미군 공격, 미국인 사망. 압도적 무력 대응 예고. 나약함의 시대 끝.',
    tag: 'war',
    url: 'https://truthsocial.com/@realDonaldTrump',
  },
  // ── 2월 28일 ──
  {
    date: '2026-02-28',
    text: 'The United States, together with Israel, has launched a massive and precise strike against Iran\'s nuclear and military infrastructure. This is not a war of choice — it is a war of necessity. Iran was 2 weeks away from a nuclear weapon. Never again!',
    summary: '미국·이스라엘, 이란 핵·군사 인프라 정밀 대규모 타격 개시. 이란 핵무장 2주 전에 선제 타격. Never Again!',
    tag: 'war',
    url: 'https://truthsocial.com/@realDonaldTrump',
  },
  {
    date: '2026-02-28',
    text: 'BREAKING: Khamenei is DEAD. The world is a much safer place today. God Bless America and God Bless Israel!',
    summary: '하메네이 사망. 세계가 더 안전해졌다. 미국·이스라엘에 신의 가호.',
    tag: 'war',
    url: 'https://truthsocial.com/@realDonaldTrump',
  },
];

/** live-data.json의 실시간 trumpPosts와 병합 (중복 날짜는 정적 우선) */
export function mergeTrumpPosts(livePosts: { text: string; summary: string; date: string; url?: string }[] = []): TrumpPost[] {
  const staticDates = new Set(trumpPostsStatic.map(p => p.date + p.text.slice(0, 20)));
  const liveOnly = livePosts
    .filter(lp => !staticDates.has(lp.date + lp.text.slice(0, 20)))
    .map(lp => ({
      date: lp.date,
      text: lp.text,
      summary: lp.summary,
      tag: 'war' as const,
      url: lp.url,
    }));
  return [...liveOnly, ...trumpPostsStatic].sort((a, b) => b.date.localeCompare(a.date));
}
