/**
 * 이란-미국/이스라엘 전쟁(2026년 2월 28일~) 관련
 * 에너지 시장 주요 사건 타임라인
 * ⚠️ 기준일: constants.ts의 WAR_START_DATE ('2026-02-28')
 */

export interface WarEvent {
  date: string;        // 'YYYY-MM-DD'
  title: string;       // 한국어 제목 (25자 이내)
  description: string; // 한국어 설명 (50자 이내)
  impact: 'critical' | 'high' | 'medium' | 'low'; // 에너지 시장 영향도
  priceImpact: number; // 예상 유가 영향 (%, 양수=상승)
  category: 'military' | 'diplomatic' | 'energy' | 'sanction';
}

export const warTimeline: WarEvent[] = [
  {
    date: '2026-02-28',
    title: '이란-이스라엘 전면전 개전',
    description: '미국·이스라엘 연합군 이란 기습 공습. 하메네이 최고지도자 사망. 이란 즉각 보복 선언.',
    impact: 'critical',
    priceImpact: 12.5,
    category: 'military',
  },
  {
    date: '2026-03-01',
    title: '호르무즈 해협 위협 선언',
    description: '이란 혁명수비대, 호르무즈 해협 봉쇄 가능성 공식 경고. 전세계 유조선 운항 지연.',
    impact: 'critical',
    priceImpact: 8.3,
    category: 'military',
  },
  {
    date: '2026-01-24',
    title: '미국 항모전단 페르시아만 배치',
    description: '미 해군 제5함대, 핵항모 2척 및 구축함 6척 페르시아만 긴급 배치.',
    impact: 'high',
    priceImpact: 3.2,
    category: 'military',
  },
  {
    date: '2026-03-03',
    title: '이란 석유 수출 일부 제한',
    description: '이란 국영석유공사(NIOC), 일일 수출량 120만 배럴 감산 선언.',
    impact: 'critical',
    priceImpact: 6.7,
    category: 'energy',
  },
  {
    date: '2026-03-05',
    title: 'G7 긴급 에너지 회의 소집',
    description: 'G7 에너지 장관 긴급 화상회의 개최. 공동 전략비축유 방출 검토.',
    impact: 'medium',
    priceImpact: -2.1,
    category: 'diplomatic',
  },
  {
    date: '2026-03-07',
    title: '미국 대이란 제재 대폭 강화',
    description: '美 재무부, 이란 석유 수출 관련 140개 기업·개인 추가 제재. SWIFT 차단 확대.',
    impact: 'high',
    priceImpact: 4.5,
    category: 'sanction',
  },
  {
    date: '2026-03-09',
    title: '중국·러시아 이란 지지 성명',
    description: '중러 공동성명으로 이란산 석유 계속 수입 의사 표명. 달러 우회 결제 논의.',
    impact: 'medium',
    priceImpact: 1.8,
    category: 'diplomatic',
  },
  {
    date: '2026-03-12',
    title: '이스라엘, 이란 정유시설 공습',
    description: '이스라엘 공군, 아바단 정유시설 및 반다르아바스 항구 정밀 타격. 처리량 40% 감소.',
    impact: 'critical',
    priceImpact: 9.8,
    category: 'military',
  },
  {
    date: '2026-02-13',
    title: '유가 배럴당 $130 돌파',
    description: '브렌트유 배럴당 $131.5 기록. 2022년 이후 최고가. 아시아 증시 동반 급락.',
    impact: 'critical',
    priceImpact: 5.2,
    category: 'energy',
  },
  {
    date: '2026-03-14',
    title: 'OPEC 긴급회의 - 감산 유지',
    description: 'OPEC+ 긴급 화상회의 결과, 현행 감산 유지 결정. 사우디 추가 증산 거부.',
    impact: 'high',
    priceImpact: 3.0,
    category: 'energy',
  },
  {
    date: '2026-03-17',
    title: '호르무즈 해협 72시간 봉쇄',
    description: '이란 혁명수비대, 기뢰 부설 및 해협 일시 봉쇄. 전세계 유조선 100척 이상 대기.',
    impact: 'critical',
    priceImpact: 11.4,
    category: 'military',
  },
  {
    date: '2026-02-23',
    title: '한국 에너지 비상대책 가동',
    description: '한국 정부, 에너지 비상대책위원회 소집. 전략비축유 7일치 방출 및 절전 권고.',
    impact: 'high',
    priceImpact: 0.5,
    category: 'energy',
  },
  {
    date: '2026-03-01',
    title: '이란, 이스라엘 정유시설 드론 공격',
    description: '이란 드론 200기, 이스라엘 하이파 정유시설 타격. 시설 80% 가동 중단.',
    impact: 'critical',
    priceImpact: 7.6,
    category: 'military',
  },
  {
    date: '2026-03-05',
    title: 'EU 긴급 에너지 공동구매제 발동',
    description: 'EU, 천연가스 공동구매제 긴급 발동. LNG 대체 공급선 확보 위해 카타르·미국과 협상.',
    impact: 'high',
    priceImpact: -1.5,
    category: 'diplomatic',
  },
  {
    date: '2026-03-10',
    title: '미국 전략비축유 5,000만 배럴 방출',
    description: '바이든 행정부, IEA와 공조하여 사상 최대 규모 전략비축유 긴급 방출 발표.',
    impact: 'high',
    priceImpact: -4.8,
    category: 'energy',
  },
  {
    date: '2026-03-15',
    title: '이란 핵협상 재개 타진 보도',
    description: '오만 중재로 이란-미국 비공개 접촉 시작. 일시 휴전 논의 중이나 양측 공식 부인.',
    impact: 'medium',
    priceImpact: -3.2,
    category: 'diplomatic',
  },
  {
    date: '2026-03-21',
    title: '나탄즈 재타격·호르무즈 최후통첩',
    description: '미국, 이란 나탄즈 핵시설 벙커버스터 재타격. 트럼프 "48시간 내 호르무즈 개방" 최후통첩.',
    impact: 'critical',
    priceImpact: 4.2,
    category: 'military',
  },
  {
    date: '2026-03-22',
    title: '이란, 이스라엘 핵시설 인근 타격',
    description: '이란, 디모나 핵연구소 인근 타격. 이스라엘 남부 160명 이상 부상. 이란 걸프 에너지 인프라 보복 경고.',
    impact: 'critical',
    priceImpact: 3.5,
    category: 'military',
  },
  {
    date: '2026-03-23',
    title: '트럼프 공습 유예·협상 진전 선언',
    description: '트럼프, 이란 에너지시설 공습 5일 유예 + 미·이란 "매우 좋은 회의" 확인. 브렌트유 -10% 폭락.',
    impact: 'critical',
    priceImpact: -10.2,
    category: 'diplomatic',
  },
  {
    date: '2026-03-24',
    title: '미·이란 협상 지속·유가 $101 안정',
    description: '트럼프 "이란에 평화 마지막 기회" 발언. 이스라엘 공습 지속 속 협상 병행. 브렌트유 $101.34.',
    impact: 'critical',
    priceImpact: -1.5,
    category: 'diplomatic',
  },
];
