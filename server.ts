import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let genAI: GoogleGenAI | null = null;
function getGeminiClient(customApiKey?: string): GoogleGenAI {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey === "") {
    throw new Error("GEMINI_API_KEY가 설정되지 않았습니다. 화면의 API 키 입력창이나 AI Studio의 'Secrets' 패널에서 등록해 주세요.");
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Health check API
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // Verify custom Gemini API key
  app.post("/api/verify-key", async (req, res) => {
    try {
      const { apiKey } = req.body;
      if (!apiKey) {
        res.status(400).json({ error: "API Key를 입력하지 않았습니다." });
        return;
      }
      
      const testAI = new GoogleGenAI({ apiKey });
      // 테스트용 가벼운 텍스트 생성 전송
      await testAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Connection test",
        config: {
          maxOutputTokens: 5
        }
      });
      
      res.json({ success: true });
    } catch (err: any) {
      console.error("API Key Verification Failed:", err);
      res.status(400).json({ error: err.message || "유효하지 않거나 만료된 API Key입니다. 키를 다시 확인해 주세요." });
    }
  });

  // Gemini AI Analysis Endpoint
  app.post("/api/analyze", async (req, res) => {
    try {
      const {
        branches,
        consolidatedMetrics,
        purposeText,
        focusText,
        remainingWeeks,
        userApiKey
      } = req.body;

      // 1. Validate inputs
      if (!branches || !Array.isArray(branches)) {
        res.status(400).json({ error: "유효하지 않은 지점 실적 데이터입니다." });
        return;
      }

      // 2. Prepare structured representation of the data for prompt
      const summaryText = `
[국제커리어센터 통합 실적 계산 요약]
- 총 종료자 수(분모): ${branches.reduce((sum: number, b: any) => sum + b.terminations, 0)}명
- 보정 취업률: ${consolidatedMetrics.employmentRate}% (보정 취업자: ${consolidatedMetrics.employmentCountCorrected}명)
- 알선취업률: ${consolidatedMetrics.placementRate}% (보정 알선자: ${consolidatedMetrics.placementCountCorrected}명)
- 조기취업률: ${consolidatedMetrics.earlyRate}% (보정 조기취업자: ${consolidatedMetrics.earlyCountCorrected}명)
- 임금기준이상 비중: ${consolidatedMetrics.wageRate}%
- 6개월 고용유지율: ${consolidatedMetrics.retentionRate}%
- 상위 80% 만족도 평균: ${consolidatedMetrics.satisfactionRate}점
- 가점: 우수사례 ${consolidatedMetrics.bestPracticeBonus}점, 타사업연계 ${consolidatedMetrics.otherProjectBonus}점 (합계 ${consolidatedMetrics.totalBonus}점)
- 가중산출 표준점수 총점: ${consolidatedMetrics.totalScore}점 (예측 등급: ${consolidatedMetrics.predictedGrade}등급)
- 적용 가중치: 취업실적(${consolidatedMetrics.employmentAppliedWeight}), 알선취업(${consolidatedMetrics.placementAppliedWeight}), 조기취업(${consolidatedMetrics.earlyAppliedWeight})
`;

      const branchListDetails = branches.map((b: any) => {
        const empRate = b.terminations > 0 ? (((b.employedRaw + b.employedSpecial * 0.5 - b.employedExcluded) / b.terminations) * 100).toFixed(1) : "0.0";
        return `- [${b.region}] ${b.name}: 종료자 ${b.terminations}명, 보정취업률 ${empRate}%, 만족도 ${b.satisfactionScore}점, 타사업연계 ${b.otherProjectLinkedCount}건, 포상훈격 ${b.bestPracticeAward}`;
      }).join("\n");

      // 3. System instruction in Korean for Gemini
      const systemInstruction = `
너는 고용노동부 국민취업지원제도(국취제) 민간위탁기관 성과평가 전문 최고 애널리스트이자, 국제커리어센터 총괄 사업관리자(PM)다.
2026년도 고용노동부 「국민취업지원제도 민간위탁기관 성과평가 계획」의 평가지표 체계와 표준점수 환산 방법을 완벽히 숙지하고 있다.

아래 데이터를 기반으로 고용노동부 및 위탁기관 경영진 제출용 수준의 초일류 정량적·정성적 분석 보고서를 한국어로 작성하라.
A/B/C/D 4등급 체계를 철저히 준수하고, 절대 S등급을 언급하지 마라! (S등급은 존재하지 않음)
일정 역산 시 기준일은 현재 시점인 2026년 6월이며, 고용부 핵심 일정(7월 사전점검, 9.15 특별민원, 9월 2차점검, 10월 만족도조사, 11월 최종평가)을 무조건 반영하여 액션플랜 완료 목표일을 구체적인 날짜로 환산하라.

반드시 사용자가 요청한 전체 'Output Format' 중 아래 3가지 정성적 진단 섹션을 상세히 논리적으로 채워라.
보고서 작성 시 다음 구조와 마크다운 서식을 그대로 반환해야 한다 (반환 결과가 그대로 UI에 렌더링됨).

---
### 3. 지점별 성과 심층 진단 (SWOT 기반)

#### 3-1. 우수 지점 — 강점 및 벤치마킹 포인트
(실제 24개 지점 중 데이터 상 우수한 지점을 매칭하고, 알선취업률 제고 노하우, 신규 일자리 발굴, 타 사업 연계 프로세스를 구체적으로 분석)

#### 3-2. 부진 지점 — 약점 및 하락 원인 분석
- **내부 요인:** (상담 프로세스 공백, IAP 수립 지연 등 부진 지점의 구체적인 약점)
- **외부 요인:** (지역 고용 동향을 지리학적으로 접목. 예: 부산/울산 조선업 구조조정 및 구인난, 대구/경북 제조 침체, 경기/인천 영세 제조 및 도소매 고용 영향 등 권역에 완벽매칭)
(원인 불명확 시 반드시 "추정 원인(현장 확인 필요)" 으로 구분 표기)

---
### 5. 지표 반등을 위한 Action Plan
(각 부진 지표별, 지점별 즉각적인 실행 과제 제시. R&R을 '지점장 주관 / 운영팀장 실행 / 총괄PM 모니터링' 형식으로 매칭)
완료 목표일은 고용부 일정에서 역산하여 구체적인 '2026-XX-XX' 형태의 날짜로 기입하고, 역산 근거 일정을 병기하라.
반드시 아래 만족도 지표 고정 항목을 그대로 정렬하고, 타 지표(알선취업, 조기취업 등) 대책을 추가하라.

[만족도 지표 / 전 지점 공통] - 필수 포함 항목
- **단기 대책 (즉시~2주 내):** 24개 지점별 특별민원 제기 참여자 현황 취합 및 보고서 초안 작성 착수
- **중장기 성과 관리 (1개월 이상):** 불만 유형 분류 → 상담 품질 개선 피드백 루틴화 / 월별 민원 건수 모니터링
- **R&R:** 각 지점장 주관 / 운영팀장 보고서 작성 / 총괄PM 최종 확인 및 고용센터 공문 접수
- **완료 목표일:** 2026-09-15 (특별민원 보고서 고용센터 공문 접수 기준, 특별민원 누적자 만족도 배제 목적)
- **모니터링 KPI:** 24개 지점 보고서 제출 완료율 / 월별 특별민원 건수 증감 추이

---
### 6. 종합 리스크 요약 및 다음 단계 권고

#### ① 최상위 리스크 Top 3
(등급 하락 가능성 및 영향도 기준 우선순위 순 마크다운 표 생성)
| 순위 | 리스크 | 현재 수준 | 목표 수준 | 영향 지표 | 대응 기한 |
|---|---|---|---|---|---|
| 1 | | | | | |
| 2 | | | | | |
| 3 | | | | | |

#### ② 차기 고용부 일정 체크포인트
(다음 사전 데이터 점검 전 확인해야 할 핵심 3가지 기술)

#### ③ 추가 데이터 수집 필요 항목
(상담 데이터 성격 분석, 고용유지 추적 현황 등 명시)
`;

      const promptIn = `
[분석 정보]
- 분석 목적: ${purposeText}
- 분석 중점 지표: ${focusText}
- 잔여 기간: 약 ${remainingWeeks}주 (10월 31일 종료 대상)

[통합 데이터 및 지표 계산 현황]
${summaryText}

[24개 지점 상세 실적 스냅샷]
${branchListDetails}

고용노동부 국민취업지원제도 전문 PM의 냉철하고 지적이면서도 격조 있는 비즈니스 어조로, 위 지침을 완벽히 이행하여 마크다운 결과물을 출력해라.
`;

      // 4. Initialize Gemini client
      const ai = getGeminiClient(userApiKey);
      
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptIn,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.2
        }
      });

      res.json({
        reportMarkdown: response.text
      });
    } catch (err: any) {
      console.error("Gemini Error:", err);
      res.status(500).json({ error: err.message || "보고서 생성 중 오류가 발생했습니다." });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
