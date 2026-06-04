export interface BranchStats {
  id: string;
  name: string;
  region: string; // 서울, 경기, 중부, 대구, 대전, 부산
  
  // 1. 종료자 (분모)
  terminations: number; // 종료자 수 (동일 법인 이관자 포함, 타법인 이관 제외)
  
  // 2. 취업자 (분자)
  employedRaw: number; // 일반 취업자 수
  employedSpecial: number; // 특화지원대상 및 중장년 취업자 수 (1.5배 가산 대상)
  employedExcluded: number; // 파견근로, 자체채용, 6개월 이내 재취업 등 제외자 수 (감산 대상)
  
  // 3. 알선취업자
  jobPlacementRaw: number; // 일반 알선 취업자 수
  jobPlacementNew: number; // 워크넷 미등록 신규 일자리 발굴 알선 취업자 수 (1.5배 가산 대상)
  
  // 4. 조기취업자 (IAP 수립 후 3개월 이내)
  earlyEmployedRaw: number; // 일반 조기 취업자 수
  earlyEmployedSpecial: number; // 특화 및 중장년 조기 취업자 수 (1.5배 가산 대상)
  
  // 5. 임금수준
  wageQualified2025: number; // 2025년 취업자 중 250만원 이상 취업자 수
  wageQualified2026: number; // 2026년 취업자 중 258만원 이상 취업자 수
  wageTotal2025: number; // 2025년 전체 취업자 수
  wageTotal2026: number; // 2026년 전체 취업자 수
  
  // 6. 고용유지
  retention6Months: number; // 6개월 이상 고용 상태 유지자 수
  
  // 7. 참여자 만족도 (10점 만점 기준 설문)
  satisfactionScore: number; 
  
  // 8. 내부 관리 지표 (IAP 수립률, 중도탈락률)
  iapEstablished: number; // IAP 수립 수
  dropoutCount: number; // 중도탈락자 수
  
  // 9. 가점 관리
  bestPracticeCount: number; // 우수사례 수
  bestPracticeAward: 'target' | 'best' | 'excellent' | 'normal' | 'none'; // 대상, 최우수, 우수, 장려, 없음
  otherProjectLinkedCount: number; // 타 사업 연계 건수 (지합산)
}

export interface RegionGroup {
  region: string;
  branches: string[];
}

export const REGIONS_CONFIG: RegionGroup[] = [
  { region: "서울", branches: ["서울강남", "서울관악", "서울남부", "서울동부", "서울북부", "서울서부"] },
  { region: "경기", branches: ["경기고양", "경기남양주", "경기성남", "경기안산", "경기안양", "경기의정부", "경기화성", "경기수원", "경기평택"] },
  { region: "중부(인천)", branches: ["인천부평", "인천지점"] },
  { region: "대구(경북)", branches: ["대구동부", "포항지점"] },
  { region: "대전(충청·세종)", branches: ["대전지점"] },
  { region: "부산(경남·울산)", branches: ["부산남구", "부산북부", "부산동부", "울산지점"] }
];

export const FIXED_BRANCHES: { name: string; region: string }[] = [
  { name: "서울강남", region: "서울" },
  { name: "서울관악", region: "서울" },
  { name: "서울남부", region: "서울" },
  { name: "서울동부", region: "서울" },
  { name: "서울북부", region: "서울" },
  { name: "서울서부", region: "서울" },
  { name: "경기고양", region: "경기" },
  { name: "경기남양주", region: "경기" },
  { name: "경기성남", region: "경기" },
  { name: "경기안산", region: "경기" },
  { name: "경기안양", region: "경기" },
  { name: "경기의정부", region: "경기" },
  { name: "경기화성", region: "경기" },
  { name: "경기수원", region: "경기" },
  { name: "경기평택", region: "경기" },
  { name: "인천부평", region: "중부(인천)" },
  { name: "인천지점", region: "중부(인천)" },
  { name: "대구동부", region: "대구(경북)" },
  { name: "포항지점", region: "대구(경북)" },
  { name: "대전지점", region: "대전(충청·세종)" },
  { name: "부산남구", region: "부산(경남·울산)" },
  { name: "부산북부", region: "부산(경남·울산)" },
  { name: "부산동부", region: "부산(경남·울산)" },
  { name: "울산지점", region: "부산(경남·울산)" }
];

// 전국 평균/표준편차 기본값 가설 (시뮬레이션 용도)
// 실제 고용부 평균/표준편차는 상대평가에 맞춰서 설정
export interface CompetitorStats {
  employmentRateMean: number;
  employmentRateStd: number;
  employmentCountMean: number;
  employmentCountStd: number;

  placementRateMean: number;
  placementRateStd: number;
  placementCountMean: number;
  placementCountStd: number;

  earlyRateMean: number;
  earlyRateStd: number;
  earlyCountMean: number;
  earlyCountStd: number;

  wageRateMeans: { [region: string]: number };
  wageRateStds: { [region: string]: number };

  retentionRateMean: number;
  retentionRateStd: number;

  satisfactionMean: number;
  satisfactionStd: number;
}

export const DEFAULT_COMPETITOR_STATS: CompetitorStats = {
  employmentRateMean: 62.5,
  employmentRateStd: 8.5,
  employmentCountMean: 110,
  employmentCountStd: 35,

  placementRateMean: 35.0,
  placementRateStd: 6.2,
  placementCountMean: 50,
  placementCountStd: 18,

  earlyRateMean: 18.0,
  earlyRateStd: 4.5,
  earlyCountMean: 22,
  earlyCountStd: 8,

  wageRateMeans: {
    "서울": 55.0,
    "경기": 48.0,
    "중부(인천)": 45.0,
    "대구(경북)": 38.0,
    "대전(충청·세종)": 42.0,
    "부산(경남·울산)": 40.0
  },
  wageRateStds: {
    "서울": 7.2,
    "경기": 6.8,
    "중부(인천)": 6.5,
    "대구(경북)": 5.8,
    "대전(충청·세종)": 6.2,
    "부산(경남·울산)": 6.0
  },

  retentionRateMean: 72.0,
  retentionRateStd: 5.5,

  satisfactionMean: 8.8,
  satisfactionStd: 0.6
};
