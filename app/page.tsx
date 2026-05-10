"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  RefreshCw,
  Clock,
  ExternalLink,
  Zap,
  TrendingUp,
  Globe,
  AlertCircle,
  ChevronDown,
  Activity,
  Newspaper,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface TavilyResult {
  title: string;
  url: string;
  content: string;
  score: number;
  published_date?: string;
}

interface TavilyResponse {
  query: string;
  answer?: string;
  results: TavilyResult[];
  response_time: number;
}

const FREQUENCIES = [
  { label: "Manual", value: 0 },
  { label: "30 sec", value: 30 },
  { label: "1 min", value: 60 },
  { label: "5 min", value: 300 },
  { label: "15 min", value: 900 },
  { label: "1 hour", value: 3600 },
];

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

function getScoreLabel(score: number): { label: string; color: string } {
  if (score > 0.7) return { label: "HIGH", color: "#00ff88" };
  if (score > 0.4) return { label: "MED", color: "#ffcc00" };
  return { label: "LOW", color: "#ff6b6b" };
}

export default function Home() {
  const [company, setCompany] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [frequency, setFrequency] = useState(0);
  const [data, setData] = useState<TavilyResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [pulseActive, setPulseActive] = useState(false);
  const [freqOpen, setFreqOpen] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async (name: string) => {
    if (!name.trim()) return;
    setLoading(true);
    setError("");
    setPulseActive(true);
    setTimeout(() => setPulseActive(false), 1500);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company: name, maxResults: 12 }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Request failed");
      setData(json);
      setLastFetched(new Date());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = () => {
    if (!inputValue.trim()) return;
    setCompany(inputValue.trim());
    setData(null);
    setLastFetched(null);
    fetchData(inputValue.trim());
  };

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);

    if (frequency > 0 && company) {
      setCountdown(frequency);

      countdownRef.current = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) return frequency;
          return c - 1;
        });
      }, 1000);

      intervalRef.current = setInterval(() => {
        fetchData(company);
      }, frequency * 1000);
    } else {
      setCountdown(0);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [frequency, company, fetchData]);

  const selectedFreq = FREQUENCIES.find((f) => f.value === frequency);

  return (
    <div className="min-h-screen bg-[#080810] text-white" style={{fontFamily: "'Courier New', monospace"}}>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{backgroundImage: `linear-gradient(rgba(0,255,136,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.03) 1px, transparent 1px)`, backgroundSize: "40px 40px"}} />
        <div className="absolute inset-0" style={{background: "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0,255,136,0.08) 0%, transparent 70%)"}} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 border border-[#00ff88] flex items-center justify-center">
              <Activity size={16} className="text-[#00ff88]" />
            </div>
            <span className="text-[#00ff88] text-xs tracking-[0.3em] uppercase">Intelligence Feed</span>
          </div>
          <h1 className="text-5xl font-bold tracking-tight">
            COMPANY<span className="text-[#00ff88]">_</span>INTEL
          </h1>
          <p className="text-[#666] text-sm mt-2 tracking-wider">REAL-TIME HEADLINE SURVEILLANCE & ANALYSIS SYSTEM</p>
        </div>

        <div className="flex flex-col md:flex-row gap-3 mb-8">
          <div className="flex-1 relative group">
            <div className="absolute inset-0 border border-[#00ff88]/30 group-focus-within:border-[#00ff88] transition-colors pointer-events-none" />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#00ff88]/50">
              <Search size={16} />
            </div>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="ENTER COMPANY NAME... (e.g. Apple, Tesla, Amazon)"
              className="w-full bg-[#0d0d1a] pl-10 pr-4 py-3.5 text-sm tracking-widest placeholder:text-[#333] focus:outline-none"
            />
          </div>

          <div className="relative">
            <button onClick={() => setFreqOpen(!freqOpen)} className="flex items-center gap-2 px-4 py-3.5 border border-[#333] hover:border-[#00ff88]/50 bg-[#0d0d1a] text-sm tracking-wider transition-colors min-w-[140px]">
              <Clock size={14} className="text-[#00ff88]" />
              <span className="flex-1 text-left">{selectedFreq?.label.toUpperCase()}</span>
              <ChevronDown size={14} className={`transition-transform ${freqOpen ? "rotate-180" : ""}`} />
            </button>
            {freqOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#0d0d1a] border border-[#333] z-20">
                {FREQUENCIES.map((f) => (
                  <button key={f.value} onClick={() => { setFrequency(f.value); setFreqOpen(false); }} className={`w-full px-4 py-2.5 text-left text-xs tracking-wider hover:bg-[#00ff88]/10 transition-colors ${frequency === f.value ? "text-[#00ff88]" : "text-[#999]"}`}>
                    {f.label.toUpperCase()}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={handleSearch} disabled={loading || !inputValue.trim()} className="flex items-center gap-2 px-6 py-3.5 bg-[#00ff88] text-black text-sm tracking-widest font-bold hover:bg-[#00cc6a] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            {loading ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />}
            SCAN
          </button>
        </div>

        {company && (
          <div className="flex items-center gap-4 mb-8 py-2 border-y border-[#1a1a2e] text-xs text-[#555] tracking-wider">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${pulseActive ? "bg-[#00ff88] animate-ping" : lastFetched ? "bg-[#00ff88]" : "bg-[#333]"}`} />
              <span>TARGET: <span className="text-[#00ff88]">{company.toUpperCase()}</span></span>
            </div>
            {lastFetched && <span>LAST SYNC: {formatDistanceToNow(lastFetched, { addSuffix: true }).toUpperCase()}</span>}
            {frequency > 0 && countdown > 0 && (
              <div className="flex items-center gap-1 ml-auto">
                <RefreshCw size={11} className="animate-spin text-[#00ff88]" />
                <span>NEXT REFRESH: <span className="text-[#00ff88]">{countdown}s</span></span>
              </div>
            )}
            {data && <span className="ml-auto">{data.results.length} RESULTS &middot; {data.response_time.toFixed(2)}s</span>}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 p-4 border border-[#ff4444]/30 bg-[#ff4444]/5 mb-6 text-sm text-[#ff6b6b]">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {loading && !data && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="border border-[#1a1a2e] p-5 animate-pulse">
                <div className="h-3 bg-[#1a1a2e] rounded mb-3 w-3/4" />
                <div className="h-2 bg-[#1a1a2e] rounded mb-2" />
                <div className="h-2 bg-[#1a1a2e] rounded mb-2 w-5/6" />
                <div className="h-2 bg-[#1a1a2e] rounded w-1/2 mt-4" />
              </div>
            ))}
          </div>
        )}

        {data?.answer && (
          <div className="mb-8 p-5 border border-[#00ff88]/20 bg-[#00ff88]/5 relative overflow-hidden">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={14} className="text-[#00ff88]" />
              <span className="text-[#00ff88] text-xs tracking-[0.2em] uppercase">AI Intelligence Summary</span>
            </div>
            <p className="text-[#ccc] text-sm leading-relaxed">{data.answer}</p>
          </div>
        )}

        {data?.results && data.results.length > 0 && (
          <>
            <div className="flex items-center gap-3 mb-5">
              <Newspaper size={14} className="text-[#00ff88]" />
              <span className="text-xs tracking-[0.3em] text-[#666] uppercase">Live Headlines</span>
              <div className="flex-1 h-px bg-[#1a1a2e]" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.results.map((item, idx) => {
                const scoreInfo = getScoreLabel(item.score);
                const domain = getDomain(item.url);
                return (
                  <a key={idx} href={item.url} target="_blank" rel="noopener noreferrer" className="group block border border-[#1a1a2e] hover:border-[#00ff88]/40 bg-[#0d0d1a] hover:bg-[#0d1a12] p-5 transition-all duration-200 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[#333] text-xs">#{String(idx + 1).padStart(2, "0")}</span>
                      <span className="text-[10px] tracking-widest px-2 py-0.5 border" style={{ color: scoreInfo.color, borderColor: `${scoreInfo.color}40` }}>{scoreInfo.label}</span>
                    </div>
                    <h3 className="text-sm font-bold leading-snug mb-3 text-white group-hover:text-[#00ff88] transition-colors line-clamp-3">{item.title}</h3>
                    <p className="text-[#555] text-xs leading-relaxed line-clamp-3 mb-4">{item.content}</p>
                    <div className="flex items-center justify-between text-[10px] text-[#444]">
                      <div className="flex items-center gap-1">
                        <Globe size={10} />
                        <span className="tracking-wider">{domain}</span>
                      </div>
                      {item.published_date && <span>{formatDistanceToNow(new Date(item.published_date), { addSuffix: true })}</span>}
                      <ExternalLink size={10} className="text-[#333] group-hover:text-[#00ff88] transition-colors" />
                    </div>
                  </a>
                );
              })}
            </div>
          </>
        )}

        {!loading && !data && !error && (
          <div className="text-center py-24">
            <div className="inline-flex items-center justify-center w-16 h-16 border border-[#1a1a2e] mb-6">
              <Search size={24} className="text-[#333]" />
            </div>
            <p className="text-[#333] text-xs tracking-[0.4em] uppercase">Enter a company name to begin intelligence gathering</p>
          </div>
        )}

        <div className="mt-16 pt-6 border-t border-[#1a1a2e] flex items-center justify-between text-[10px] text-[#333] tracking-wider">
          <span>COMPANY INTEL v1.0 &middot; POWERED BY TAVILY</span>
          <span>NAVEED261 &middot; 2026</span>
        </div>
      </div>
    </div>
  );
}
