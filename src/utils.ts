import { BranchStats, CompetitorStats, REGIONS_CONFIG } from "./types";

/**
 * 계산 결과 인터페이스
 */
export interface EvaluationResult {
  // 1. 취업실적 (30점)
  employmentRate: number; // 보정 취업률 (%)
  employmentCountCorrected: number; // 보정 취업자 수 (1.5배 가산 반영, 자체채용 등 제외)
  employmentRateZ: number;
  employmentCountZ: number;
  employmentRateStdScore: number;
  employmentCountStdScore: number;
  employmentFinalScore: number; // 최종 취업실적 득점
  employmentAppliedWeight: '20%' | '10%'; // 자동으로 유리한 쪽 지정

  // 2. 알선취업실적 (25점)
  placementRate: number; // 알선취업률 (%)
  placementCountCorrected: number; // 보정 알선취업자 수
  placementRateZ: number;
  placementCountZ: number;
  placementRateStdScore: number;
  placementCountStdScore: number;
  placementFinalScore: number;
  placementAppliedWeight: '20%' | '10%';

  // 3. 조기취업실적 (10점)
  earlyRate: number; // 조기취업률 (%)
  earlyCountCorrected: number; // 보정 조기취업자 수
  earlyRateZ: number;
  earlyCountZ: number;
  earlyRateStdScore: number;
  earlyCountStdScore: number;
  earlyFinalScore: number;
  earlyAppliedWeight: '20%' | '10%';

  // 4. 취업처 임금수준 (10점)
  wageRate: number; // 최저임금 120% 이상 비중 (%)
  wageZ: number;
  wageStdScore: number;
  wageFinalScore: number;

  // 5. 고용유지 수준 (15점)
  retentionRate: number; // 6개월 이상 유지 비중 (%)
  retentionZ: number;
  retentionStdScore: number;
  retentionFinalScore: number;

  // 6. 참여자 만족도 (10점)
  satisfactionRate: number; // 설문 상위 80% 평균점수
  satisfactionZ: number;
  satisfactionStdScore: number;
  satisfactionFinalScore: number;

  // 가점 정보
  bestPracticeBonus: number; // 장관상 등 가점 (0~2점)
  otherProjectBonus: number; // 타사업 연계 가점 (0~3점)
  totalBonus: number;

  // 최종 합계
  totalScore: number;

  // 예측 등급 정보
  predictedGrade: 'A' | 'B' | 'C' | 'D';
}

// 개별 지점 변수 보정
export function getCorrectedEmployed(b: BranchStats): number {
  // 특화/중장년 1.5배 가산, 자체채용 등 제외
  const special加 = b.employedSpecial * 1.5;
  const normalCount = b.employedRaw - b.employedSpecial;
  const rawSum = Math.max(0, normalCount) + special加;
  return Math.max(0, rawSum - b.employedExcluded);
}

export function getCorrectedPlacement(b: BranchStats): number {
  // 신규 발굴 알선 1.5배 가산
  const new加 = b.jobPlacementNew * 1.5;
  const normalPlacement = b.jobPlacementRaw - b.jobPlacementNew;
  return Math.max(0, normalPlacement) + new加;
}

export function getCorrectedEarly(b: BranchStats): number {
  // 특화/중장년 1.5배 가산 동일 적용
  const special加 = b.earlyEmployedSpecial * 1.5;
  const normalEarly = b.earlyEmployedRaw - b.earlyEmployedSpecial;
  return Math.max(0, normalEarly) + special加;
}

// 단일 지표 표준점수 환산
export function calcStandardScore(value: number, mean: number, std: number, maxPoints: number): number {
  if (std <= 0) return maxPoints / 2; // 표준편차가 0일 시 중간값 부여
  const score = (maxPoints * 0.5) * ((value - mean) / std) + (maxPoints * 0.5);
  return Math.min(maxPoints, Math.max(0, score));
}

// 6월~11월 시기에 따른 고용부 역산 잔여 일 주차 구하기
export function calculateRemainingWeeks(currentDateStr: string = "2026-06-04"): number {
  const current = new Date(currentDateStr);
  const target = new Date("2026-10-31"); // 평가 종료 시점
  const diffTime = target.getTime() - current.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, Math.round(diffDays / 7));
}

/**
 * 24개 지점을 합산하여 통합 국제커리어센터 성과평가 점수를 산출
 */
export function calculateConsolidatedScore(
  branches: BranchStats[],
  comp: CompetitorStats
): EvaluationResult {
  // 1. 합산 기본값
  let totalTerminations = 0;
  let totalEmployedCorrected = 0;
  let totalPlacementCorrected = 0;
  let totalEarlyCorrected = 0;

  let totalWageQualified = 0;
  let totalWageTotal = 0;

  let totalRetentionHold = 0;
  let totalEmployedRawTotal = 0; // 고용유지의 분모 (가산 전 실제 취업자)

  // 24개 지점 데이터 합산
  branches.forEach(b => {
    totalTerminations += b.terminations;
    totalEmployedCorrected += getCorrectedEmployed(b);
    totalPlacementCorrected += getCorrectedPlacement(b);
    totalEarlyCorrected += getCorrectedEarly(b);

    totalWageQualified += (b.wageQualified2025 + b.wageQualified2026);
    totalWageTotal += (b.wageTotal2025 + b.wageTotal2026);

    totalRetentionHold += b.retention6Months;
    totalEmployedRawTotal += (b.employedRaw - b.employedExcluded);
  });

  totalEmployedRawTotal = Math.max(1, totalEmployedRawTotal);
  totalWageTotal = Math.max(1, totalWageTotal);
  const denom = Math.max(1, totalTerminations);

  // 비율 계산
  const empRate = (totalEmployedCorrected / denom) * 100;
  const placementRate = (totalPlacementCorrected / denom) * 100;
  const earlyRate = (totalEarlyCorrected / denom) * 100;
  const wageRate = (totalWageQualified / totalWageTotal) * 100;
  const retentionRate = (totalRetentionHold / denom) * 100;

  // 만족도: "기관별 설문 상위 80% 평균점수 반영"
  // 24개 지점의 점수를 정렬해서 상위 80% (19개 지점)의 평균 반영
  const sortedSatisfaction = [...branches]
    .map(b => b.satisfactionScore)
    .sort((a, b) => b - a);
  const activeCount = Math.max(1, Math.round(branches.length * 0.8));
  const topSatisfactions = sortedSatisfaction.slice(0, activeCount);
  const satisfactionRate = topSatisfactions.reduce((sum, v) => sum + v, 0) / activeCount;

  // 2. 가중합 표준점수 산출
  // ① 취업실적 (30점)
  // 비율 30점 대비 표준점수, 규모 30점 대비 표준점수
  const empRateZ = comp.employmentRateStd > 0 ? (empRate - comp.employmentRateMean) / comp.employmentRateStd : 0;
  const empCountZ = comp.employmentCountStd > 0 ? (totalEmployedCorrected - comp.employmentCountMean) / comp.employmentCountStd : 0;

  const empRateStd = calcStandardScore(empRate, comp.employmentRateMean, comp.employmentRateStd, 30);
  const empCountStd = calcStandardScore(totalEmployedCorrected, comp.employmentCountMean, comp.employmentCountStd, 30);

  // 유리한 비율/규모 가중 선택 적용
  const empScore20 = empRateStd * 0.8 + empCountStd * 0.2;
  const empScore10 = empRateStd * 0.9 + empCountStd * 0.1;
  const empFinal = Math.max(empScore20, empScore10);
  const empWeight: '20%' | '10%' = empScore20 >= empScore10 ? '20%' : '10%';

  // ② 알선취업실적 (25점)
  const placeRateZ = comp.placementRateStd > 0 ? (placementRate - comp.placementRateMean) / comp.placementRateStd : 0;
  const placeCountZ = comp.placementCountStd > 0 ? (totalPlacementCorrected - comp.placementCountMean) / comp.placementCountStd : 0;

  const placeRateStd = calcStandardScore(placementRate, comp.placementRateMean, comp.placementRateStd, 25);
  const placeCountStd = calcStandardScore(totalPlacementCorrected, comp.placementCountMean, comp.placementCountStd, 25);

  const placeScore20 = placeRateStd * 0.8 + placeCountStd * 0.2;
  const placeScore10 = placeRateStd * 0.9 + placeCountStd * 0.1;
  const placeFinal = Math.max(placeScore20, placeScore10);
  const placeWeight: '20%' | '10%' = placeScore20 >= placeScore10 ? '20%' : '10%';

  // ③ 조기취업실적 (10점)
  const earlyRateZ = comp.earlyRateStd > 0 ? (earlyRate - comp.earlyRateMean) / comp.earlyRateStd : 0;
  const earlyCountZ = comp.earlyCountStd > 0 ? (totalEarlyCorrected - comp.earlyCountMean) / comp.earlyCountStd : 0;

  const earlyRateStd = calcStandardScore(earlyRate, comp.earlyRateMean, comp.earlyRateStd, 10);
  const earlyCountStd = calcStandardScore(totalEarlyCorrected, comp.earlyCountMean, comp.earlyCountStd, 10);

  const earlyScore20 = earlyRateStd * 0.8 + earlyCountStd * 0.2;
  const earlyScore10 = earlyRateStd * 0.9 + earlyCountStd * 0.1;
  const earlyFinal = Math.max(earlyScore20, earlyScore10);
  const earlyWeight: '20%' | '10%' = earlyScore20 >= earlyScore10 ? '20%' : '10%';

  // ④ 임금수준 (10점)
  // 임금수준의 전체 합산 시 전국 평균은 각 권역의 평균을 법인 가중평균하거네, 여기서는 대표 경기도/서울 등 적합한 수치를 매칭 
  // 국제커리어센터의 임금수준 점수는 지점별로 각 권역 표준점수를 매기고 이를 가중합산(종료자 비중 등)하거나 또는 법인 통합해서 수도권 대표 평균기준으로 평가
  // 여기서는 지점별로 각 권역 기준 표준점수를 산출한 후 지점별 가중평균(분모 비중)을 취하는 것이 법인의 실제 점수와 부합함!
  let weightedWageScoreSum = 0;
  let totalWageDenominator = 0;

  branches.forEach(b => {
    const bWageCorrect = (b.wageQualified2025 + b.wageQualified2026);
    const bWageTotal = (b.wageTotal2025 + b.wageTotal2026);
    if (bWageTotal > 0) {
      const bWageRate = (bWageCorrect / bWageTotal) * 100;
      const regMean = comp.wageRateMeans[b.region] || comp.wageRateMeans["경기"];
      const regStd = comp.wageRateStds[b.region] || comp.wageRateStds["경기"];
      const bWageScore = calcStandardScore(bWageRate, regMean, regStd, 10);
      weightedWageScoreSum += (bWageScore * bWageTotal);
      totalWageDenominator += bWageTotal;
    }
  });

  const wageFinalScore = totalWageDenominator > 0 ? (weightedWageScoreSum / totalWageDenominator) : 5.0;
  const wageMeanMatched = comp.wageRateMeans["경기"]; // 경기 중심 대리값
  const wageStdMatched = comp.wageRateStds["경기"];
  const wageZ = wageStdMatched > 0 ? (wageRate - wageMeanMatched) / wageStdMatched : 0;

  // ⑤ 고용유지 수준 (15점)
  const retentionZ = comp.retentionRateStd > 0 ? (retentionRate - comp.retentionRateMean) / comp.retentionRateStd : 0;
  const retentionFinalScore = calcStandardScore(retentionRate, comp.retentionRateMean, comp.retentionRateStd, 15);

  // ⑥ 참여자 만족도 (10점)
  const satisfactionZ = comp.satisfactionStd > 0 ? (satisfactionRate - comp.satisfactionMean) / comp.satisfactionStd : 0;
  const satisfactionFinalScore = calcStandardScore(satisfactionRate, comp.satisfactionMean, comp.satisfactionStd, 10);

  // 3. 가점 관리
  // (1) 우수사례 가점 (대상 2점 / 최우수 1점 / 우수 0.7점 / 장려 0.5점) - 지점 최대 가점을 취하거나 합산?
  // 공모전 가점은 단독 기관(총합산 법인 기준)이므로 장관상 수상 건수 훈격 매칭
  // 각 지점의 우수사례 수상 항목 중 가장 높은 훈격 점수 반영 또는 지점별 합산 후 최대 2점 상한
  let bestPracticeBonus = 0;
  branches.forEach(b => {
    let bScore = 0;
    if (b.bestPracticeAward === "target") bScore = 2.0;
    else if (b.bestPracticeAward === "best") bScore = 1.0;
    else if (b.bestPracticeAward === "excellent") bScore = 0.7;
    else if (b.bestPracticeAward === "normal") bScore = 0.5;
    bestPracticeBonus = Math.max(bestPracticeBonus, bScore);
  });

  // (2) 타 사업 연계 건수 (24개 지점 합산 적용!!!!)
  let totalOtherProjectLinked = 0;
  branches.forEach(b => {
    totalOtherProjectLinked += b.otherProjectLinkedCount;
  });

  let otherProjectBonus = 0;
  if (totalOtherProjectLinked >= 40) otherProjectBonus = 3.0;
  else if (totalOtherProjectLinked >= 20) otherProjectBonus = 2.0;
  else if (totalOtherProjectLinked >= 10) otherProjectBonus = 1.0;

  const totalBonus = Math.min(5.0, bestPracticeBonus + otherProjectBonus); // 가점 상한 관리

  // 최종 합산 점수
  const totalScore = parseFloat(
    (empFinal + placeFinal + earlyFinal + wageFinalScore + retentionFinalScore + satisfactionFinalScore + totalBonus).toFixed(2)
  );

  // 예측 등급 산정 (전체 위탁기관 대비 상대 비율 가정)
  // AI 시뮬레이션을 통해 점수 대역벌 등급 배치
  // A: 상위 20% (통상 표준점수 합계 82점 이상)
  // B: 상위 60% (72점 ~ 81.99점)
  // C: 상위 85% (60점 ~ 71.99점)
  // D: 최하위 15% (60점 미만)
  let predictedGrade: 'A' | 'B' | 'C' | 'D' = 'B';
  if (totalScore >= 82.0) predictedGrade = 'A';
  else if (totalScore >= 70.0) predictedGrade = 'B';
  else if (totalScore >= 58.0) predictedGrade = 'C';
  else predictedGrade = 'D';

  return {
    employmentRate: parseFloat(empRate.toFixed(1)),
    employmentCountCorrected: Math.round(totalEmployedCorrected),
    employmentRateZ: parseFloat(empRateZ.toFixed(2)),
    employmentCountZ: parseFloat(empCountZ.toFixed(2)),
    employmentRateStdScore: parseFloat(empRateStd.toFixed(2)),
    employmentCountStdScore: parseFloat(empCountStd.toFixed(2)),
    employmentFinalScore: parseFloat(empFinal.toFixed(2)),
    employmentAppliedWeight: empWeight,

    placementRate: parseFloat(placementRate.toFixed(1)),
    placementCountCorrected: Math.round(totalPlacementCorrected),
    placementRateZ: parseFloat(placeRateZ.toFixed(2)),
    placementCountZ: parseFloat(placeCountZ.toFixed(2)),
    placementRateStdScore: parseFloat(placeRateStd.toFixed(2)),
    placementCountStdScore: parseFloat(placeCountStd.toFixed(2)),
    placementFinalScore: parseFloat(placeFinal.toFixed(2)),
    placementAppliedWeight: placeWeight,

    earlyRate: parseFloat(earlyRate.toFixed(1)),
    earlyCountCorrected: Math.round(totalEarlyCorrected),
    earlyRateZ: parseFloat(earlyRateZ.toFixed(2)),
    earlyCountZ: parseFloat(earlyCountZ.toFixed(2)),
    earlyRateStdScore: parseFloat(earlyRateStd.toFixed(2)),
    earlyCountStdScore: parseFloat(earlyCountStd.toFixed(2)),
    earlyFinalScore: parseFloat(earlyFinal.toFixed(2)),
    earlyAppliedWeight: earlyWeight,

    wageRate: parseFloat(wageRate.toFixed(1)),
    wageZ: parseFloat(wageZ.toFixed(2)),
    wageStdScore: parseFloat(wageFinalScore.toFixed(2)),
    wageFinalScore: parseFloat(wageFinalScore.toFixed(2)),

    retentionRate: parseFloat(retentionRate.toFixed(1)),
    retentionZ: parseFloat(retentionZ.toFixed(2)),
    retentionStdScore: parseFloat(retentionFinalScore.toFixed(2)),
    retentionFinalScore: parseFloat(retentionFinalScore.toFixed(2)),

    satisfactionRate: parseFloat(satisfactionRate.toFixed(2)),
    satisfactionZ: parseFloat(satisfactionZ.toFixed(2)),
    satisfactionStdScore: parseFloat(satisfactionFinalScore.toFixed(2)),
    satisfactionFinalScore: parseFloat(satisfactionFinalScore.toFixed(2)),

    bestPracticeBonus,
    otherProjectBonus,
    totalBonus,
    totalScore,
    predictedGrade
  };
}

/**
 * 지점 단위 개별 평가 등급 산수 및 가설 요약
 */
export interface BranchDetailsSummary {
  name: string;
  region: string;
  empRate: number;
  placeRate: number;
  earlyRate: number;
  wageRate: number;
  retentionRate: number;
  score: number;
  grade: 'A' | 'B' | 'C' | 'D';
}

export function evaluateIndividualBranches(
  branches: BranchStats[],
  comp: CompetitorStats
): BranchDetailsSummary[] {
  return branches.map(b => {
    const denom = Math.max(1, b.terminations);
    const empC = getCorrectedEmployed(b);
    const placeC = getCorrectedPlacement(b);
    const earlyC = getCorrectedEarly(b);

    const empRate = (empC / denom) * 100;
    const placeRate = (placeC / denom) * 100;
    const earlyRate = (earlyC / denom) * 100;

    const wageCorrect = (b.wageQualified2025 + b.wageQualified2026);
    const wageTot = Math.max(1, b.wageTotal2025 + b.wageTotal2026);
    const wageRate = (wageCorrect / wageTot) * 100;

    const retentionTot = Math.max(1, b.terminations);
    const retentionRate = (b.retention6Months / retentionTot) * 100;

    // 지점 가중 수치
    const regMean = comp.wageRateMeans[b.region] || comp.wageRateMeans["경기"];
    const regStd = comp.wageRateStds[b.region] || comp.wageRateStds["경기"];

    const sEmp = calcStandardScore(empRate, comp.employmentRateMean, comp.employmentRateStd, 30);
    const sPlace = calcStandardScore(placeRate, comp.placementRateMean, comp.placementRateStd, 25);
    const sEarly = calcStandardScore(earlyRate, comp.earlyRateMean, comp.earlyRateStd, 10);
    const sWage = calcStandardScore(wageRate, regMean, regStd, 10);
    const sRet = calcStandardScore(retentionRate, comp.retentionRateMean, comp.retentionRateStd, 15);
    const sSat = calcStandardScore(b.satisfactionScore, comp.satisfactionMean, comp.satisfactionStd, 10);

    const score = parseFloat((sEmp + sPlace + sEarly + sWage + sRet + sSat).toFixed(2));
    
    let grade: 'A' | 'B' | 'C' | 'D' = 'B';
    if (score >= 78.0) grade = 'A';
    else if (score >= 66.0) grade = 'B';
    else if (score >= 54.0) grade = 'C';
    else grade = 'D';

    return {
      name: b.name,
      region: b.region,
      empRate: parseFloat(empRate.toFixed(1)),
      placeRate: parseFloat(placeRate.toFixed(1)),
      earlyRate: parseFloat(earlyRate.toFixed(1)),
      wageRate: parseFloat(wageRate.toFixed(1)),
      retentionRate: parseFloat(retentionRate.toFixed(1)),
      score,
      grade
    };
  });
}
