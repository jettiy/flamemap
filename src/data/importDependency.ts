/**
 * 국가별 에너지 수입 의존도 데이터
 * - importPct: 양수 = 수입 의존도(%), 음수 = 순수출 규모(상대적 지수)
 * - riskLevel: very-high(>80%), high(50-80%), medium(20-50%), low(<20%), exporter(순수출국)
 * 출처: IEA, BP Statistical Review 2024 기반 추정치
 */

export interface ImportDependencyData {
  importPct: number; // 에너지 수입 의존도 %, 수출국은 음수(순수출 의미)
  label: string;     // 표시 레이블
  riskLevel: 'very-high' | 'high' | 'medium' | 'low' | 'exporter';
}

export const importDependencyData: Record<string, ImportDependencyData> = {
  // ── 아시아 ──────────────────────────────────────────────────
  KR: { importPct: 93,  label: '93% 수입 의존',  riskLevel: 'very-high' },
  JP: { importPct: 88,  label: '88% 수입 의존',  riskLevel: 'very-high' },
  CN: { importPct: 22,  label: '22% 수입 의존',  riskLevel: 'medium'    },
  IN: { importPct: 45,  label: '45% 수입 의존',  riskLevel: 'medium'    },
  SG: { importPct: 100, label: '100% 수입 의존', riskLevel: 'very-high' },
  TH: { importPct: 62,  label: '62% 수입 의존',  riskLevel: 'high'      },
  MY: { importPct: -30, label: '순수출국',        riskLevel: 'exporter'  },
  ID: { importPct: -15, label: '순수출국',        riskLevel: 'exporter'  },
  VN: { importPct: 35,  label: '35% 수입 의존',  riskLevel: 'medium'    },
  PH: { importPct: 58,  label: '58% 수입 의존',  riskLevel: 'high'      },
  PK: { importPct: 48,  label: '48% 수입 의존',  riskLevel: 'medium'    },
  BD: { importPct: 42,  label: '42% 수입 의존',  riskLevel: 'medium'    },
  TW: { importPct: 97,  label: '97% 수입 의존',  riskLevel: 'very-high' },
  HK: { importPct: 100, label: '100% 수입 의존', riskLevel: 'very-high' },

  // ── 오세아니아 ─────────────────────────────────────────────
  AU: { importPct: -50, label: '순수출국',        riskLevel: 'exporter'  },
  NZ: { importPct: 30,  label: '30% 수입 의존',  riskLevel: 'medium'    },

  // ── 유럽 ───────────────────────────────────────────────────
  DE: { importPct: 70,  label: '70% 수입 의존',  riskLevel: 'high'      },
  FR: { importPct: 50,  label: '50% 수입 의존',  riskLevel: 'high'      },
  GB: { importPct: 40,  label: '40% 수입 의존',  riskLevel: 'medium'    },
  IT: { importPct: 76,  label: '76% 수입 의존',  riskLevel: 'high'      },
  ES: { importPct: 73,  label: '73% 수입 의존',  riskLevel: 'high'      },
  NL: { importPct: 55,  label: '55% 수입 의존',  riskLevel: 'high'      },
  PL: { importPct: 60,  label: '60% 수입 의존',  riskLevel: 'high'      },
  SE: { importPct: 28,  label: '28% 수입 의존',  riskLevel: 'medium'    },
  NO: { importPct: -400,label: '순수출국',        riskLevel: 'exporter'  },
  TR: { importPct: 75,  label: '75% 수입 의존',  riskLevel: 'high'      },
  UA: { importPct: 40,  label: '40% 수입 의존',  riskLevel: 'medium'    },
  RU: { importPct: -300,label: '순수출국',        riskLevel: 'exporter'  },

  // ── 중동 ───────────────────────────────────────────────────
  SA: { importPct: -150,label: '순수출국',        riskLevel: 'exporter'  },
  AE: { importPct: -80, label: '순수출국',        riskLevel: 'exporter'  },
  QA: { importPct: -200,label: '순수출국',        riskLevel: 'exporter'  },
  KW: { importPct: -120,label: '순수출국',        riskLevel: 'exporter'  },
  IQ: { importPct: -100,label: '순수출국',        riskLevel: 'exporter'  },
  IR: { importPct: -90, label: '순수출국',        riskLevel: 'exporter'  },
  IL: { importPct: 30,  label: '30% 수입 의존',  riskLevel: 'medium'    },
  EG: { importPct: 20,  label: '20% 수입 의존',  riskLevel: 'medium'    },
  JO: { importPct: 92,  label: '92% 수입 의존',  riskLevel: 'very-high' },

  // ── 아메리카 ───────────────────────────────────────────────
  US: { importPct: 5,   label: '5% 수입 의존',   riskLevel: 'low'       },
  CA: { importPct: -70, label: '순수출국',        riskLevel: 'exporter'  },
  MX: { importPct: -20, label: '순수출국',        riskLevel: 'exporter'  },
  BR: { importPct: 10,  label: '10% 수입 의존',  riskLevel: 'low'       },
  AR: { importPct: -10, label: '순수출국',        riskLevel: 'exporter'  },
  CL: { importPct: 72,  label: '72% 수입 의존',  riskLevel: 'high'      },
  CO: { importPct: -40, label: '순수출국',        riskLevel: 'exporter'  },
  VE: { importPct: -60, label: '순수출국',        riskLevel: 'exporter'  },

  // ── 아프리카 ───────────────────────────────────────────────
  ZA: { importPct: 25,  label: '25% 수입 의존',  riskLevel: 'medium'    },
  NG: { importPct: -80, label: '순수출국',        riskLevel: 'exporter'  },
  ET: { importPct: 88,  label: '88% 수입 의존',  riskLevel: 'very-high' },
  KE: { importPct: 82,  label: '82% 수입 의존',  riskLevel: 'very-high' },
};

/** 리스크 레벨별 한국어 레이블 */
export const riskLevelLabel: Record<ImportDependencyData['riskLevel'], string> = {
  'very-high': '매우 높음',
  high:        '높음',
  medium:      '보통',
  low:         '낮음',
  exporter:    '순수출국',
};

/** 리스크 레벨별 Tailwind 색상 클래스 */
export const riskLevelColor: Record<ImportDependencyData['riskLevel'], string> = {
  'very-high': 'bg-red-500/20 text-red-400 border-red-500/30',
  high:        'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium:      'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low:         'bg-blue-500/20 text-blue-400 border-blue-500/30',
  exporter:    'bg-green-500/20 text-green-400 border-green-500/30',
};
