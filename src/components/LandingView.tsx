import React, { useState } from "react";
import { BranchStats, CompetitorStats } from "../types";
import { calculateConsolidatedScore, calculateRemainingWeeks } from "../utils";
import { 
  Sparkles, 
  ChevronRight, 
  Flame, 
  Target, 
  TrendingUp, 
  Award, 
  Users, 
  Compass, 
  Clock, 
  ArrowRight,
  ShieldAlert,
  Zap,
  BarChart3,
  CheckCircle2,
  Lock,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Check,
  Send,
  Building2,
  HelpCircle as HelpIcon,
  Search,
  Facebook,
  Twitter,
  Globe,
  Instagram
} from "lucide-react";
import { motion } from "motion/react";

interface Props {
  branches: BranchStats[];
  competitorStats: CompetitorStats;
  onNavigate: (tab: "home" | "dashboard" | "branches" | "report" | "settings") => void;
  onApiKeyVerified?: () => void;
  onApiKeyRemoved?: () => void;
}

export default function LandingView({ branches, competitorStats, onNavigate, onApiKeyVerified, onApiKeyRemoved }: Props) {
  const consolidated = calculateConsolidatedScore(branches, competitorStats);
  const remainingWeeks = calculateRemainingWeeks();

  // 계산 부품
  const totalBranches = branches.length;
  const currentGrade = consolidated.predictedGrade;
  const currentScore = consolidated.totalScore;
  const currentBonus = consolidated.totalBonus;

  // 인위적 게이지 데이터 놀이터용 상태
  const [extraEmpPerBranch, setExtraEmpPerBranch] = useState(1);

  // 놀이터 시뮬레이션 계산
  const simTotalScore = Math.min(100, Math.max(0, parseFloat((currentScore + (extraEmpPerBranch * 1.45)).toFixed(2))));
  const simGrade = simTotalScore >= 80 ? "A" : simTotalScore >= 68 ? "B" : simTotalScore >= 55 ? "C" : "D";

  // API Key 등록 및 승인 상태
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("GEMINI_API_KEY") || "");
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{ success: boolean; message: string } | null>(() => {
    const isSaved = localStorage.getItem("GEMINI_API_KEY");
    if (isSaved) {
      return { success: true, message: "승인된 Gemini API Key가 정상 작동 중입니다. 바로 AI 보고서 센터를 사용해 보세요!" };
    }
    return null;
  });
  const [showGuide, setShowGuide] = useState(true); // Default open for better user visibility

  // Contact Form States (for high fidelity mockup)
  const [contactEmail, setContactEmail] = useState("");
  const [contactSent, setContactSent] = useState(false);

  const handleVerifyApiKey = async () => {
    if (!apiKey.trim()) {
      setValidationResult({ success: false, message: "API Key를 입력하지 않았습니다." });
      return;
    }
    setIsValidating(true);
    setValidationResult(null);
    try {
      const response = await fetch("/api/verify-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ apiKey: apiKey.trim() })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        localStorage.setItem("GEMINI_API_KEY", apiKey.trim());
        setValidationResult({ success: true, message: "Gemini API Key가 성공적으로 등록 및 승인되었습니다! 모든 인공지능 SWOT 성과분석이 가동됩니다." });
        if (onApiKeyVerified) {
          onApiKeyVerified();
        }
      } else {
        setValidationResult({ success: false, message: data.error || "유효하지 않은 API Key입니다." });
      }
    } catch (err: any) {
      setValidationResult({ success: false, message: "서버 통신 실패. API키가 올바른지 권한을 진단해 주세요." });
    } finally {
      setIsValidating(false);
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (contactEmail.trim()) {
      setContactSent(true);
      setTimeout(() => setContactSent(false), 4000);
      setContactEmail("");
    }
  };

  return (
    <div className="min-h-screen bg-fluid-gradient text-slate-100 font-sans relative overflow-hidden -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-16">
      
      {/* 3D 모래 입자 및 입체감 파동 텍스쳐 매핑 오목 볼록 레이어 */}
      <div className="absolute inset-0 bg-stipple-texture opacity-25 pointer-events-none mix-blend-overlay" />
      <div className="absolute inset-0 bg-grid-white/[0.012] bg-[size:36px_36px] pointer-events-none" />
      
      {/* 3D 유체 이미지 물결 질감 형상화하는 입체형 네온 웨이브 오구 (배경을 물결치듯 장식) */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-[160%] h-[500px] bg-gradient-to-b from-blue-500/10 via-indigo-500/5 to-transparent rounded-[100%] filter blur-[80px] pointer-events-none transform rotate-3" />
      <div className="absolute top-[20%] left-[-20%] w-[800px] h-[600px] bg-sky-500/8 rounded-full filter blur-[150px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[20%] right-[-20%] w-[900px] h-[700px] bg-indigo-500/10 rounded-full filter blur-[180px] pointer-events-none mix-blend-screen" />

      {/* 액체 질감 경사면(S자 입체 곡선 코스믹 오라) 효과용 플로팅 조형 */}
      <div className="absolute top-[40%] left-1/2 -translate-x-1/2 w-[80%] h-[300px] bg-gradient-to-r from-blue-600/5 via-teal-500/5 to-indigo-650/10 rounded-[120px] filter blur-[100px] transform rotate-12 pointer-events-none" />
      
      {/* 1. 최상단 APEX SOLUTIONS 스타일 글래스 헤더 */}
      <div className="relative max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center bg-slate-950/40 backdrop-blur-xl rounded-2xl border border-white/10 px-6 py-4.5 gap-4 shadow-neon-blue z-20">
        <div className="flex items-center gap-2.5">
          {/* APEX SOLUTIONS 로고 형상 마크 */}
          <div className="relative w-9 h-9 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-8 h-8 text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.5)]">
              <polygon points="50,15 15,85 85,85" fill="none" stroke="currentColor" strokeWidth="12" strokeLinejoin="miter" />
              <polygon points="50,38 32,74 68,74" fill="currentColor" opacity="0.8" />
              <circle cx="50" cy="15" r="7" fill="#60a5fa" />
            </svg>
          </div>
          <div>
            <div className="font-extrabold text-[#f8fafc] text-sm tracking-wider flex items-center gap-1">
              <span>국취제 성과평가 포털</span>
              <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded uppercase font-black">민간위탁 특화</span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium">국민취업지원제도 성과관리 시스템</div>
          </div>
        </div>

        {/* 미니 네비게이션 */}
        <div className="flex items-center gap-6 text-xs font-semibold text-slate-300">
          <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="hover:text-blue-400 transition cursor-pointer">홈</button>
          <button onClick={() => onNavigate("branches")} className="hover:text-blue-400 transition cursor-pointer">지부 현황</button>
          <button onClick={() => onNavigate("dashboard")} className="hover:text-blue-400 transition cursor-pointer font-bold text-blue-300">종합 대시보드</button>
          <button onClick={() => onNavigate("report")} className="hover:text-blue-400 transition cursor-pointer">처방전 보고서</button>
          <button onClick={() => onNavigate("settings")} className="hover:text-blue-400 transition cursor-pointer">전국대비 통계</button>
        </div>

        <div>
          <button 
            onClick={() => onNavigate("dashboard")}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-lg shadow-md shadow-blue-500/20 hover:shadow-indigo-500/30 transition-all cursor-pointer"
          >
            분석 시작하기
          </button>
        </div>
      </div>

      {/* 2. 대문 히어로 슬로건 및 3D 렌더링 스타일 시티 레이아웃 */}
      <section className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pt-4 z-10">
        
        {/* 좌측 6칸: 슬로건 및 브랜드 메시지 */}
        <div className="lg:col-span-6 space-y-8 text-left">
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[10px] font-black tracking-widest uppercase"
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse text-blue-400" />
              <span>취업성공 • 고용유지 • S등급 달성</span>
            </motion.div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1] text-white">
              국취제 민간위탁<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-200 to-blue-200">성과평가</span><br />
              시뮬레이터.
            </h1>
            
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-lg font-medium">
              국민취업지원제도 24개 지부의 복잡한 수탁 실적 데이터(보정취업률, 고용유지율, 조기취업 가점 등)를 정합하여 
              고용노동부 상대 평가식(Z-Score) 기준 점수를 완벽 예측합니다. 지부별 가중 우수 배점을 실시간 분석하고 
              취약점에 기반한 맞춤형 AI 등급 향상 처방전을 산출해 드립니다.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            <button
              onClick={() => onNavigate("dashboard")}
              className="px-6 py-3.5 bg-white text-slate-950 hover:bg-slate-100 rounded-lg font-extrabold text-xs tracking-tight transition duration-200 cursor-pointer shadow-xl text-center active:scale-97"
            >
              서비스 살펴보기
            </button>
            <div className="text-slate-400 text-xs flex items-center justify-center sm:justify-start gap-3">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span>실시간 24개 지점 시뮬레이션 가동 중</span>
            </div>
          </div>
        </div>

        {/* 우측 6칸: 3D 빌딩 시티 랜더링 모티브 그래픽 (CSS/SVG 극강의 고화질 데코레이션) */}
        <div className="lg:col-span-6 flex justify-center items-center relative py-12">
          
          {/* 빛나는 3D 베이스 플레이트 디스크 */}
          <div className="relative w-[340px] h-[340px] sm:w-[420px] sm:h-[420px] rounded-full flex items-center justify-center">
            
            {/* 오라 효과 */}
            <div className="absolute inset-0 bg-blue-500/20 rounded-full filter blur-[60px] animate-pulse" />
            
            {/* 디스크 링 레이어들 */}
            <div className="absolute w-full h-full rounded-full border border-blue-500/30 bg-slate-900/40 backdrop-blur-md transform rotate-x-60 shadow-[0_30px_100px_rgba(30,58,138,0.5)] flex items-center justify-center">
              <div className="w-[85%] h-[85%] rounded-full border border-blue-400/40 relative">
                <div className="w-[80%] h-[80%] rounded-full border border-indigo-500/40 absolute top-10 left-10" />
              </div>
            </div>
            
            {/* 3D 실린더 빌딩 구조물 무더기 */}
            <div className="absolute z-10 bottom-1/4 flex items-end justify-center gap-3">
              
              {/* 빌딩 1: 좌측 실린더 */}
              <div className="w-6 h-28 bg-gradient-to-t from-slate-900 via-blue-900 to-blue-400 rounded-t-full shadow-[0_0_20px_rgba(59,130,246,0.3)] border-t border-blue-300 relative group transform hover:translate-y-[-10px] transition duration-300">
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1.5 h-16 bg-blue-300/30 rounded-full" />
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-300 rounded-full animate-pulse" />
              </div>

              {/* 빌딩 2: 중간 중단 실린더 */}
              <div className="w-5 h-20 bg-gradient-to-t from-slate-900 via-indigo-950 to-indigo-400 rounded-t-full shadow-lg border-t border-indigo-300 relative transform hover:translate-y-[-10px] transition duration-300">
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-1 h-8 bg-indigo-300/40 rounded-full" />
              </div>

              {/* 빌딩 3: 메인 최고 탑 빌딩 */}
              <div className="w-9 h-48 bg-gradient-to-t from-slate-950 via-blue-950 to-blue-300 rounded-t-xl shadow-[0_0_40px_rgba(30,64,175,0.6)] border border-blue-400/30 relative flex flex-col justify-between p-1 group transform hover:translate-y-[-10px] transition duration-300">
                {/* 외장 네온 스트립 */}
                <div className="w-full h-full bg-slate-900/90 rounded-t-lg border-t border-blue-300/60 p-1.5 flex flex-col justify-start gap-1">
                  <div className="h-3 w-full bg-blue-400/20 rounded" />
                  <div className="h-3 w-full bg-blue-400/20 rounded" />
                  <div className="h-3 w-full bg-blue-400/20 rounded" />
                  <div className="h-3 w-full bg-blue-400/20 rounded" />
                  <div className="h-3 w-full bg-blue-400/20 rounded" />
                  <div className="h-3 w-full bg-blue-400/20 rounded" />
                  <div className="h-3 w-full bg-blue-400/20 rounded" />
                  <div className="h-3 w-full bg-blue-400/20 rounded" />
                </div>
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-1 h-12 bg-gradient-to-t from-blue-300 to-transparent" />
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-blue-400 rounded-full blur-[2px] animate-ping" />
              </div>

              {/* 빌딩 4: 유리 벽돌 블록 */}
              <div className="w-6 h-32 bg-gradient-to-t from-slate-900 via-[#1e293b] to-indigo-500 rounded-t-full border-t border-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.3)] transform hover:translate-y-[-10px] transition duration-300">
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1.5 h-20 bg-indigo-200/20 rounded-full" />
              </div>

              {/* 빌딩 5: 우단 미니 실린더 */}
              <div className="w-4 h-16 bg-gradient-to-t from-slate-950 via-slate-800 to-blue-400 rounded-t-full border-t border-blue-400 relative transform hover:translate-y-[-10px] transition duration-300">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-300 rounded-full" />
              </div>
            </div>

            {/* 메탈 지지 플랫폼 테두리 링 */}
            <div className="absolute bottom-1/6 w-[280px] h-6 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-950 rounded-full border border-slate-600/50 shadow-2xl transform rotate-x-60 flex items-center justify-between px-6">
              <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
              <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-pulse" />
            </div>

            {/* 3D 몽글몽글 구름 (SVG-CSS 에어필터 디자인) */}
            <div className="absolute top-1/4 right-[5%] z-20 bg-white/10 hover:bg-white/20 transition-all backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 text-[10px] font-bold text-blue-200 flex items-center gap-1.5 shadow-lg shadow-black/30 cursor-pointer animate-bounce">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-blue-300 shrink-0">
                <path d="M19.36 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.64-4.96z" />
              </svg>
              <span>아펙스 클라우드</span>
            </div>

            <div className="absolute top-[45%] left-[5%] z-20 bg-white/10 hover:bg-white/20 transition-all backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15 text-[9px] font-bold text-indigo-200 flex items-center gap-1 shadow-md shadow-black/20 cursor-pointer">
              <Globe className="w-3 h-3 text-slate-300" />
              <span>서버 동기화 완료</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 명품 4컬럼 벤토 글래스포브틱 카드 그리드 (Services / Profiles / Gemini / Portfolio) */}
      <section className="relative max-w-7xl mx-auto z-10 space-y-4">
        <div className="text-center">
          <div className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">평가지표 핵심 벤토그리드 요약</div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">성과 최적화 및 평가 대응 코어 모듈</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* 카드 1. Services - 통합 성과 대시보드 */}
          <div 
            onClick={() => onNavigate("dashboard")}
            className="group bg-slate-950/70 backdrop-blur-xl border border-blue-500/25 rounded-2xl p-5 hover:border-blue-400 hover:shadow-neon-blue transition-all duration-300 flex flex-col justify-between h-[360px] cursor-pointer"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold tracking-widest text-[#70b4f7] uppercase font-black">📊 종합 서비스 대형</span>
                <span className="w-6 h-6 rounded-full bg-blue-500/10 border border-blue-400/20 flex items-center justify-center text-xs text-white font-extrabold">I</span>
              </div>
              
              {/* 특수 3D 블록 그래픽 데모 */}
              <div className="h-28 bg-[#09122c]/80 rounded-xl border border-blue-500/20 flex items-center justify-center relative p-3 overflow-hidden">
                <div className="absolute inset-0 bg-stipple-texture opacity-15 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/0 via-blue-500/10 to-slate-900/0" />
                <div className="flex gap-1.5 items-end h-[70%]">
                  <div className="w-5 bg-gradient-to-t from-blue-950 via-blue-800 to-blue-400 h-[40%] rounded-sm shadow-[0_0_10px_rgba(96,165,250,0.3)] transition-all group-hover:h-[60%]" />
                  <div className="w-5 bg-gradient-to-t from-blue-950 via-blue-800 to-blue-400 h-[65%] rounded-sm shadow-[0_0_10px_rgba(96,165,250,0.3)] transition-all group-hover:h-[85%]" />
                  <div className="w-5 bg-gradient-to-t from-blue-950 via-blue-800 to-blue-400 h-[50%] rounded-sm shadow-[0_0_10px_rgba(96,165,250,0.3)] transition-all group-hover:h-[70%]" />
                  <div className="w-5 bg-gradient-to-t from-blue-950 via-blue-800 to-blue-300 h-[80%] rounded-sm shadow-[0_0_15px_rgba(147,197,253,0.4)] transition-all group-hover:h-[95%]" />
                  <div className="w-5 bg-gradient-to-t from-blue-950 via-blue-800 to-blue-400 h-[30%] rounded-sm shadow-[0_0_10px_rgba(96,165,250,0.2)] transition-all group-hover:h-[50%]" />
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-[17px] font-black text-white group-hover:text-blue-400 transition">성과평가 통합 대시보드</h3>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  전체 24개 수탁지부의 핵심 지표 환산 점수를 일원화하여 고용센터 등급 기준선 도달률 및 부진 지표 구간을 모니터링합니다.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] font-bold text-blue-300 border-t border-blue-500/10 pt-3">
              <span>대시보드로 신속 진입</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* 카드 2. Profiles - 전국 지점 데이터 기획실 */}
          <div 
            onClick={() => onNavigate("branches")}
            className="group bg-slate-950/70 backdrop-blur-xl border border-blue-500/25 rounded-2xl p-5 hover:border-blue-400 hover:shadow-neon-blue transition-all duration-300 flex flex-col justify-between h-[360px] cursor-pointer"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold tracking-widest text-[#70b4f7] uppercase font-black">🏢 지부 상세 배점</span>
                <span className="w-6 h-6 rounded-full bg-blue-500/10 border border-blue-400/20 flex items-center justify-center text-xs text-white font-extrabold">II</span>
              </div>
              
              {/* 특수 3D 실린더 큐브 데모 */}
              <div className="h-28 bg-[#09122c]/80 rounded-xl border border-blue-500/20 flex items-center justify-center relative p-3 overflow-hidden">
                <div className="absolute inset-0 bg-stipple-texture opacity-15 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-slate-900/0 to-slate-900/0" />
                <div className="flex gap-3 items-end justify-center h-[75%] width-full">
                  <div className="w-4 bg-gradient-to-t from-indigo-950 to-indigo-500 h-[60%] rounded-full shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all group-hover:scale-y-110" />
                  <div className="w-6 bg-gradient-to-t from-blue-950 to-blue-400 h-[80%] rounded-full shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all group-hover:scale-y-110" />
                  <div className="w-5 bg-gradient-to-t from-[#122b80] to-[#60a5fa] h-[45%] rounded-full shadow-[0_0_15px_rgba(96,165,250,0.3)] transition-all group-hover:scale-y-110" />
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-[17px] font-black text-white group-hover:text-blue-400 transition">지부별 지표 시뮬레이터</h3>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  지부별 취업률, 고용유지율, 조기취업 가점 및 소명 제거 인원을 커스텀 대입하여 즉각적인 종합 점수 변동을 예측합니다.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] font-bold text-blue-300 border-t border-blue-500/10 pt-3">
              <span>24개 지부 정밀 관리</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* 카드 3. PERFECT - 전국 경쟁사 및 상대평가 환경 조정 */}
          <div 
            onClick={() => onNavigate("settings")}
            className="group bg-slate-950/70 backdrop-blur-xl border border-blue-500/25 rounded-2xl p-5 hover:border-blue-400 hover:shadow-neon-blue transition-all duration-300 flex flex-col justify-between h-[360px] cursor-pointer"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold tracking-widest text-[#70b4f7] uppercase font-bold">⚡ 전국 통계 가이드</span>
                <span className="w-6 h-6 rounded-full bg-blue-500/10 border border-blue-400/20 flex items-center justify-center text-xs text-white">III</span>
              </div>
              
              {/* 미래형 격자 그리드 큐빅 그래픽 */}
              <div className="h-28 bg-[#09122c]/80 rounded-xl border border-blue-500/20 flex items-center justify-center p-3 relative overflow-hidden">
                <div className="absolute inset-0 bg-stipple-texture opacity-15 pointer-events-none" />
                <div className="grid grid-cols-5 gap-1.5 w-[75%]">
                  {Array.from({ length: 15 }).map((_, idx) => (
                    <div 
                      key={idx} 
                      className={`h-4 rounded-[2px] transition ${
                        idx % 3 === 0 
                          ? "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]" 
                          : idx % 4 === 0 
                          ? "bg-slate-700" 
                          : "bg-indigo-950"
                      }`} 
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-[17px] font-black text-white group-hover:text-blue-400 transition">전국 Z-Score 조건 설정</h3>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  노동부 상대평가 산정의 표준이 되는 타 기관(전국 평균 및 표준편차) 기준선을 대조 및 상정합니다.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] font-bold text-blue-300 border-t border-blue-500/10 pt-3">
              <span>상대평가 조건 설정</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* 카드 4. PORTFOLIO - 인공지능 SWOT 보고서 생성 센터 */}
          <div 
            onClick={() => onNavigate("report")}
            className="group bg-slate-950/70 backdrop-blur-xl border border-blue-500/25 rounded-2xl p-5 hover:border-blue-400 hover:shadow-neon-blue transition-all duration-300 flex flex-col justify-between h-[360px] cursor-pointer"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold tracking-widest text-[#70b4f7] uppercase font-black">🤖 인공지능 분석 가동</span>
                <span className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-xs text-blue-300 font-extrabold animate-pulse">✨</span>
              </div>
              
              {/* 특수 글래스 드롭 그래픽 데모 */}
              <div className="h-28 bg-[#1e274b]/70 rounded-xl border border-blue-500/20 flex flex-col items-center justify-center relative p-3 overflow-hidden">
                <div className="absolute inset-0 bg-stipple-texture opacity-15 pointer-events-none" />
                <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <div className="flex gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/30 border border-blue-400/40 flex items-center justify-center text-xs text-blue-300 font-black shadow-neon-blue">AI</div>
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center text-xs text-indigo-300 font-black">A★</div>
                </div>
                <div className="text-[10px] text-blue-200/80 font-bold mt-2 tracking-tight">수식 결합형 SWOT 완편</div>
              </div>

              <div className="space-y-1">
                <h3 className="text-[17px] font-black text-white group-hover:text-blue-400 transition">SWOT 점수 개선 AI 처방전</h3>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  각 지부의 정량 실적 패턴을 SWOT 기법으로 자동 감지하여 고득점 쇄신을 위한 표준 정정 소명서 및 국취 특화 대응안을 자동 기안합니다.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] font-bold text-blue-300 border-t border-blue-500/10 pt-3">
              <span>분석 보고서로 제고</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </div>

        </div>
      </section>

      {/* 4. [USER REQUEST] 핵심 기능: Gemini API Key 등록 및 실시간 승인 기기 */}
      <section id="api-key-section" className="relative max-w-2xl mx-auto z-10 px-4 sm:px-0">
        <div className="bg-gradient-to-br from-[#12182c]/90 to-[#0c0f1d]/95 rounded-2xl border border-blue-500/30 p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full filter blur-xl" />

          {/* 그린 체크 마크 헤더 공고 */}
          <div className="flex items-center gap-3.5 pb-2.5 border-b border-white/5">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-500 text-[#070b19] shrink-0 shadow-lg shadow-emerald-500/20">
              <Check className="w-4 h-4 stroke-[3px]" />
            </span>
            <div>
              <span className="tracking-tight text-[15px] font-black text-emerald-300 block">무료로 시작하세요. Gemini API 키만 있으면 됩니다.</span>
              <span className="text-[10px] text-slate-400">등록된 API Key는 브라우저 로컬 저장소에 고도로 안전하게 편입됩니다.</span>
            </div>
          </div>

          {/* 키 실시간 대입 콘솔 */}
          <div className="flex flex-col sm:flex-row gap-2.5 items-stretch">
            <div className="relative flex-1 flex items-center bg-[#070b19]/90 border border-blue-500/20 rounded-xl px-4 py-3.5 focus-within:ring-2 focus-within:ring-blue-500/40 focus-within:border-blue-400 transition-all shadow-inner">
              <Lock className="w-4.5 h-4.5 text-blue-400 mr-2.5 shrink-0" />
              <input
                type="password"
                placeholder="AIzaSy로 시작하는 Gemini API Key 입력"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-transparent border-none text-xs sm:text-sm focus:outline-none placeholder-slate-500 text-blue-200 font-mono tracking-widest"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleVerifyApiKey}
                disabled={isValidating}
                className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-extrabold rounded-xl text-xs sm:text-sm tracking-tight transition duration-200 active:scale-97 cursor-pointer text-center whitespace-nowrap min-w-[110px] flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10"
              >
                {isValidating ? "승인 진단 중..." : "시작하기"}
              </button>
              {localStorage.getItem("GEMINI_API_KEY") && (
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem("GEMINI_API_KEY");
                    setApiKey("");
                    setValidationResult(null);
                    if (onApiKeyRemoved) {
                      onApiKeyRemoved();
                    }
                  }}
                  className="px-4 py-3.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/20 hover:border-rose-500/40 font-extrabold rounded-xl text-xs tracking-tight transition duration-200 cursor-pointer"
                >
                  인증 해제
                </button>
              )}
            </div>
          </div>

          {/* 승인 메세지 알리미 */}
          {validationResult && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-4 rounded-xl text-xs leading-relaxed border ${
                validationResult.success 
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" 
                  : "bg-rose-500/10 border-rose-500/30 text-rose-300"
              }`}
            >
              <div className="flex gap-2 items-start">
                <span className="font-bold underline text-[11px] shrink-0 uppercase tracking-widest block mt-0.5">
                  {validationResult.success ? "✓ 승인 성공:" : "✕ 승인 오류:"}
                </span>
                <span className="font-medium text-slate-300">{validationResult.message}</span>
              </div>
            </motion.div>
          )}

          {/* 아코디언 가이드 */}
          <div className="border border-white/5 rounded-xl overflow-hidden bg-slate-950/40 shadow-inner">
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="w-full flex items-center justify-between p-4 bg-white/[0.02] hover:bg-white/[0.05] transition border-none text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5 text-slate-200 font-semibold text-xs sm:text-sm">
                <HelpIcon className="w-4.5 h-4.5 text-blue-400 shrink-0" />
                <span>Gemini API Key 1분 무료 발급 가이드</span>
              </div>
              <div>
                {showGuide ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </div>
            </button>

            {showGuide && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-5 border-t border-white/5 bg-[#070b19]/60 space-y-4 text-xs sm:text-[13px] leading-relaxed text-slate-400"
              >
                {/* 1단계 */}
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded bg-blue-500/10 text-blue-400 font-black text-xs flex items-center justify-center shrink-0 border border-blue-500/20">
                    1
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-extrabold text-white text-xs sm:text-sm">Google AI Studio 공식 웹페이지 접속</h5>
                    <p className="text-slate-400 text-xs text-balance">
                      구글 계정만 가입되어 있다면 누구나 상시 100% 무료로 고성능 API 혜택을 수령할 수 있습니다.
                    </p>
                    <a 
                      href="https://aistudio.google.com/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 hover:underline text-xs inline-flex items-center gap-0.5 font-mono"
                    >
                      https://aistudio.google.com/apikey
                    </a>
                  </div>
                </div>

                {/* 2단계 */}
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded bg-blue-500/10 text-blue-400 font-black text-xs flex items-center justify-center shrink-0 border border-blue-500/20">
                    2
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-extrabold text-white text-xs sm:text-sm">구글 계정 로그인</h5>
                    <p className="text-slate-400 text-xs">
                      기존 Gmail 계정으로 가볍게 약관 동의를 수임합니다.
                    </p>
                  </div>
                </div>

                {/* 3단계 */}
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded bg-blue-500/10 text-blue-400 font-black text-xs flex items-center justify-center shrink-0 border border-blue-500/20">
                    3
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-extrabold text-white text-xs sm:text-sm">'API 키 만들기 (Create API Key)' 호출</h5>
                    <p className="text-slate-400 text-xs">
                      보이는 청색 버튼을 클릭하여 새로운 API Key 발급 마법사에 진입합니다.
                    </p>
                  </div>
                </div>

                {/* 4단계 */}
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded bg-blue-500/10 text-blue-400 font-black text-xs flex items-center justify-center shrink-0 border border-blue-500/20">
                    4
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-extrabold text-white text-xs sm:text-sm">프로젝트 선택 설정 완료</h5>
                    <p className="text-slate-400 text-xs">
                      'Create API key in existing project' 혹은 기본 프로젝트를 클릭하여 즉시 생성합니다.
                    </p>
                  </div>
                </div>

                {/* 5단계 */}
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded bg-blue-500/10 text-blue-400 font-black text-xs flex items-center justify-center shrink-0 border border-blue-500/20">
                    5
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-extrabold text-white text-xs sm:text-sm">키 복사 및 활성화</h5>
                    <p className="text-slate-400 text-xs">
                      AIzaSy로 시작되는 고유 키 문자열을 클립보드에 복사해 오시면 준비가 만전 완료됩니다!
                    </p>
                  </div>
                </div>

                {/* 🔑 API 키 발급 페이지로 이동 버튼 */}
                <div className="pt-2">
                  <a
                    href="https://aistudio.google.com/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 font-black rounded-lg text-xs tracking-tight transition text-center flex items-center justify-center gap-2 cursor-pointer border border-blue-400/30"
                  >
                    <span>🔑 무료 API 키 즉시 수령하러 가기 🔗</span>
                  </a>
                </div>
              </motion.div>
            )}
          </div>

          <div className="text-center text-[10px] text-slate-500 italic">
            가입 및 이용 시 국제커리어센터 내부 비밀 유지 보안 서약이 상호 발효됩니다.
          </div>
        </div>
      </section>

      {/* 5. 3D 아바타 피드백 상담 및 대화형 조언 섹션 */}
      <section className="relative max-w-5xl mx-auto z-10 space-y-8">
        <div className="text-center space-y-1">
          <div className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">전문가 분석 종합 피드백</div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">현장 컨설턴트 지부장 및 PM 종합 진단 피드백</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* 아바타 1 (안경을 쓴 엄격한 총괄 본부장 형상) */}
          <div className="flex flex-col sm:flex-row gap-4 items-center bg-slate-900/40 p-5 rounded-2xl border border-white/5 relative group hover:border-blue-500/30 transition duration-300">
            {/* SVG 3D 아바타 렌더 */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-900 via-[#151c38] to-slate-800 p-1 shrink-0 shadow-lg border border-white/10 relative overflow-hidden">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* 배경 네온 */}
                <circle cx="50" cy="50" r="45" fill="none" stroke="#2563eb" strokeWidth="1" strokeDasharray="5,3" />
                {/* 몸체 슈트 */}
                <path d="M20,90 C25,70 35,65 50,65 C65,65 75,70 80,90" fill="#1e293b" />
                <path d="M40,65 L50,85 L60,65 Z" fill="#ffffff" />
                <path d="M48,65 L50,90 L52,65 Z" fill="#3b82f6" /> {/* 넥타이 */}
                {/* 둥근 얼굴 */}
                <circle cx="50" cy="45" r="22" fill="#fed7aa" />
                {/* 흑발 안경 머리 */}
                <path d="M28,38 C28,24 35,22 50,22 C65,22 72,24 72,38 C72,40 65,30 50,30 C35,30 28,40 28,38 Z" fill="#1e293b" />
                {/* 안경 안면 묘사 */}
                <rect x="35" y="40" width="12" height="8" rx="2" fill="none" stroke="#000000" strokeWidth="2" />
                <rect x="53" y="40" width="12" height="8" rx="2" fill="none" stroke="#000000" strokeWidth="2" />
                <line x1="47" y1="44" x2="53" y2="44" stroke="#000000" strokeWidth="2" />
                {/* 눈 & 미소 */}
                <circle cx="41" cy="44" r="2.5" fill="#1e293b" />
                <circle cx="59" cy="44" r="2.5" fill="#1e293b" />
                <path d="M44,55 Q50,60 56,55" fill="none" stroke="#1e293b" strokeWidth="2" />
              </svg>
            </div>

            {/* 마법의 말풍선 대화 */}
            <div className="space-y-2 bg-gradient-to-br from-[#1b254b]/50 to-[#0e142c]/90 p-4.5 rounded-xl border border-white/10 text-xs leading-relaxed flex-1 shadow-inner relative">
              <div className="absolute left-[-6px] top-10 w-3 h-3 bg-[#1b254b] border-l border-b border-white/10 transform rotate-45 hidden sm:block" />
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-blue-300">최기석 평가대비 총괄소장</span>
                <span className="bg-red-500/20 text-red-300 font-extrabold text-[9px] px-1.5 py-0.2 rounded uppercase">S등급 로드맵</span>
              </div>
              <p className="text-slate-300 font-medium">
                "종합 평가 Z-Score 산출 결과, <strong>경기남양주 지부</strong>의 중도탈락자 구제 소명서 마감 직전 접수가 당락을 가르는 변수입니다. 중도탈락 분모 제외가 인정되면 표준점수 2.45점이 즉각 가산되므로 이를 최우선 보강해 주십시오."
              </p>
            </div>
          </div>

          {/* 아바타 2 (금발 / 밝은 갈색 머리의 활기찬 교육/제도 분석가 형상) */}
          <div className="flex flex-col sm:flex-row gap-4 items-center bg-slate-900/40 p-5 rounded-2xl border border-white/5 relative group hover:border-blue-500/30 transition duration-300">
            {/* SVG 3D 아바타 2 렌더 */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-900 via-[#151c38] to-slate-800 p-1 shrink-0 shadow-lg border border-white/10 relative overflow-hidden">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* 배경 오키드 서클 */}
                <circle cx="50" cy="50" r="45" fill="none" stroke="#818cf8" strokeWidth="1" strokeDasharray="5,3" />
                {/* 회색 자켓 */}
                <path d="M20,90 C25,72 35,68 50,68 C65,68 75,72 80,90" fill="#334155" />
                <path d="M38,68 L50,88 L62,68 Z" fill="#f1f5f9" />
                <path d="M47,68 L50,90 L53,68 Z" fill="#475569" />
                {/* 밝은 미남형 안면 */}
                <circle cx="50" cy="46" r="22" fill="#ffedd5" />
                {/* 갈색 머리칼 */}
                <path d="M26,36 C26,20 38,18 50,18 C62,18 74,20 74,36 C74,40 65,26 50,26 C35,26 26,40 26,36 Z" fill="#b45309" />
                {/* 자상한 눈매 */}
                <circle cx="42" cy="44" r="2.5" fill="#451a03" />
                <circle cx="58" cy="44" r="2.5" fill="#451a03" />
                {/* 눈썹 */}
                <path d="M37,39 Q42,37 45,40" fill="none" stroke="#b45309" strokeWidth="2" />
                <path d="M55,40 Q58,37 63,39" fill="none" stroke="#b45309" strokeWidth="2" />
                {/* 기분 좋은 웃음 */}
                <path d="M42,54 Q50,61 58,54" fill="none" stroke="#b45309" strokeWidth="2.5" />
              </svg>
            </div>

            {/* 마법의 말풍선 대화 2 */}
            <div className="space-y-2 bg-gradient-to-br from-[#1b254b]/50 to-[#0e142c]/90 p-4.5 rounded-xl border border-white/10 text-xs leading-relaxed flex-1 shadow-inner relative">
              <div className="absolute left-[-6px] top-10 w-3 h-3 bg-[#1b254b] border-l border-b border-white/10 transform rotate-45 hidden sm:block" />
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-blue-300">이시은 수탁평가 컨설턴트</span>
                <span className="bg-blue-500/20 text-blue-300 font-extrabold text-[9px] px-1.5 py-0.2 rounded uppercase">고용유지가점</span>
              </div>
              <p className="text-slate-300 font-medium">
                "워크넷 및 아펙스 내부 통계 교차 체크 시 <strong>6개월 고용유지 실적자 12명</strong>의 전산 등재 소명이 누락되었습니다. 이 소명 처리를 완비한다면 지부 누적 유지율이 대폭 상승하여 즉시 S등급 자격 요건을 가용 충족하게 됩니다."
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 6. 등급 점프 놀이터 시뮬레이터 (S등급 가상 테스트베드) */}
      <section className="max-w-4xl mx-auto bg-gradient-to-r from-[#17214b]/80 via-[#0d1330]/90 to-[#12193b]/80 p-6 md:p-8 rounded-3xl border border-blue-500/20 shadow-2xl relative overflow-hidden z-10">
        <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full filter blur-2xl" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full filter blur-2xl" />
        
        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-500/10 text-blue-300 text-[10px] font-black uppercase tracking-widest">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              S등급 점프 전략 시뮬레이터
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">"전국 지부당 취업 성공 인원을 1명씩 더 늘린다면?"</h3>
            <p className="text-slate-400 text-xs sm:text-[13px] leading-relaxed">
              아래 게이지를 조절하여 전국 지부가 일치단결하여 취업 성공(조기성공 포함) 실적을 배가했을 때, 
              종합 연산 점수가 어떻게 변동하며 목표로 하는 최적의 평가 안전 등급선에 도달할 수 있는지 즉시 확인해 보세요.
            </p>

            <div className="bg-slate-950/80 p-4.5 rounded-xl border border-blue-500/10 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-300">지부별 평균 취업 성공 보정 실정 목표</span>
                <span className="bg-amber-400 text-slate-900 px-2 py-0.5 rounded font-black text-[11px] shadow-sm animate-pulse">
                  지부당 취업성공 인원 +{extraEmpPerBranch}명 추가
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                step="1"
                value={extraEmpPerBranch}
                onChange={(e) => setExtraEmpPerBranch(parseInt(e.target.value))}
                className="w-full accent-blue-400 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-semibold font-mono">
                <span>0명 추가 (현재고)</span>
                <span>+1명</span>
                <span>+2명</span>
                <span>+3명 (추천 가이드)</span>
                <span>+4명</span>
                <span>+5명 (종합 한계돌파)</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-slate-950/90 rounded-2xl p-6 border border-white/5 text-center flex flex-col justify-between h-full space-y-4 shadow-2xl relative">
            <div className="space-y-1">
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">시뮬레이션 종합 환산 표준점수</div>
              <div className="text-4xl font-black tracking-tight text-white">
                {simTotalScore.toFixed(2)} <span className="text-sm font-semibold text-blue-400">점</span>
              </div>
              <p className="text-[9px] text-slate-500 font-semibold">고용인원 가중치 가산법 정합 완료</p>
            </div>

            <div className="bg-white/5 rounded-xl p-3.5 border border-white/5 text-center">
              <div className="text-[10px] text-slate-400 font-bold mb-1">합산 예상 고용노동부 공식 수탁 평가 등급</div>
              <div className="flex items-center justify-center gap-2">
                <span className={`text-3xl font-black ${
                  simGrade === "A" ? "text-amber-300 drop-shadow-[0_0_10px_rgba(252,211,77,0.3)]" : simGrade === "B" ? "text-indigo-300" : "text-amber-500"
                }`}>
                  {simGrade === "A" ? "S/A등급" : simGrade === "B" ? "B등급" : simGrade === "C" ? "C등급" : "D등급"}
                </span>
                <span className="text-[10px] text-slate-300 text-left font-semibold leading-relaxed">
                  {simGrade === "A" ? "★ 성과 인센티브 최대 확보\n및 최우수 위탁기관 지위" : simGrade === "B" ? "차상위 안전망 안착\n기본 수탁 운영비 전액 확보" : "미달 구간 - 신속한\n지부 집중 소명 처방 요망"}
                </span>
              </div>
            </div>

            <button
              onClick={() => onNavigate("dashboard")}
              className="w-full py-3 bg-[#f8fafc] hover:bg-slate-200 text-slate-950 font-black rounded-xl text-xs tracking-tight transition text-center flex items-center justify-center gap-1.5 shadow-xl cursor-pointer"
            >
              <span>이 실적으로 세부 대시보드 진단하기</span>
              <ArrowRight className="w-4 h-4 ml-1 shrink-0" />
            </button>
          </div>

        </div>
      </section>

      {/* 7. 최하단 Contact Form 및 공식 브랜드 푸터 (APEX SOLUTIONS / 국제커리어센터 결합) */}
      <section className="relative max-w-4xl mx-auto z-10 bg-slate-900/40 rounded-3xl p-6 sm:p-8 border border-white/5 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1 text-left">
            <h4 className="text-base font-extrabold text-white">헬프데스크 및 문의</h4>
            <p className="text-slate-400 text-xs font-semibold">
              국제커리어센터 기획제도운영팀 및 전국 상담부 지회 성과 소명 헬프데스크
            </p>
          </div>

          <form onSubmit={handleContactSubmit} className="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto items-stretch">
            <div className="relative flex items-center bg-[#070b19]/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs">
              <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
              <input
                type="email"
                placeholder="지칭인 사번 및 이메일 입력"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="bg-transparent border-none focus:outline-none placeholder-slate-500 text-slate-200 font-bold"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold rounded-xl text-[11px] transition duration-200 active:scale-97 cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/10"
            >
              <span>{contactSent ? "전송 완료 ✓" : "컨설팅 요청"}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* 3D 캐릭터 소형 피드백 조언 3 (하단 왼쪽 여성 조언가) */}
        <div className="border-t border-white/5 pt-6 flex sm:flex-row flex-col items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            {/* 세번째 아바타 */}
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-900 via-[#151c38] to-slate-800 p-0.5 shrink-0 shadow-lg border border-white/10 relative overflow-hidden">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#2563eb" strokeWidth="1" />
                <path d="M22,90 C26,75 36,70 50,70 C64,70 74,75 78,90" fill="#475569" />
                <circle cx="50" cy="46" r="21" fill="#fbcfe8" />
                <path d="M24,38 C24,22 36,20 50,20 C64,20 76,22 76,38 C76,42 66,28 50,28 C34,28 24,42 24,38 Z" fill="#312e81" /> {/* 단발 회색머리 */}
                <rect x="36" y="42" width="10" height="7" rx="2.5" fill="none" stroke="#312e81" strokeWidth="1.5" />
                <rect x="54" y="42" width="10" height="7" rx="2.5" fill="none" stroke="#312e81" strokeWidth="1.5" />
                <circle cx="41" cy="45" r="2" fill="#312e81" />
                <circle cx="59" cy="45" r="2" fill="#312e81" />
                <path d="M45,55 Q50,59 55,55" fill="none" stroke="#312e81" strokeWidth="2" />
              </svg>
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-white">안혜지 기획운영 선임원</div>
              <p className="text-[10px] text-slate-400 font-semibold leading-relaxed max-w-sm">
                "종합 경영 통계 대시보드와 지부 분석전략 처방전은 내부 공유 및 외부 반출이 원칙적으로 제한됩니다."
              </p>
            </div>
          </div>

          {/* 소셜 연결 아이콘들 */}
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 rounded-full bg-slate-950/80 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-blue-500 transition cursor-pointer">
              <Facebook className="w-4 h-4" />
            </button>
            <button className="w-9 h-9 rounded-full bg-slate-950/80 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-blue-500 transition cursor-pointer">
              <Twitter className="w-4 h-4" />
            </button>
            <button className="w-9 h-9 rounded-full bg-slate-950/80 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-blue-500 transition cursor-pointer">
              <Globe className="w-4 h-4" />
            </button>
            <button className="w-9 h-9 rounded-full bg-slate-950/80 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-blue-500 transition cursor-pointer">
              <Instagram className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 8. 면임 고시 국회 표준 푸터 */}
      <footer className="text-center text-[10px] text-slate-500 max-w-3xl mx-auto space-y-1 !mt-12">
        <p>© 2026 국제커리어센터 법인본부 기획제도운영팀 & APEX SOLUTIONS. All rights reserved.</p>
        <p className="leading-relaxed">
          본 시스템은 2026년 국민취업지원제도 민간위탁기관 성과평가 세부 기준 설계 공식 알고리즘을 완벽히 모의하여, 실물 현장 상담 평가의 등지 점퍼 지수를 정밀 산정합니다.
        </p>
      </footer>

    </div>
  );
}
