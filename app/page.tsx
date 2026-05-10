"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Search, RefreshCw, Clock, ExternalLink, Zap,
  TrendingUp, Globe, AlertCircle, ChevronDown, Newspaper, Sparkles,
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

function getDomain(url: string) {
  try { return new URL(url).hostname.replace("www.", ""); } catch { return url; }
}

function getScoreBadge(score: number) {
  if (score > 0.7) return { label: "Top Story", bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" };
  if (score > 0.4) return { label: "Trending", bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500" };
  return { label: "Related", bg: "bg-slate-100", text: "text-slate-500", dot: "bg-slate-400" };
}

export default function Home() {
  const [inputValue, setInputValue] = useState("");
  const [company, setCompany] = useState("");
  const [frequency, setFrequency] = useState(0);
  const [data, setData] = useState<TavilyResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [freqOpen, setFreqOpen] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async (name: string) => {
    if (!name.trim()) return;
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company: name, maxResults: 12 }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Request failed");
      setData(json); setLastFetched(new Date());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally { setLoading(false); }
  }, []);

  const handleSearch = () => {
    if (!inputValue.trim()) return;
    setCompany(inputValue.trim()); setData(null); setLastFetched(null);
    fetchData(inputValue.trim());
  };

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (frequency > 0 && company) {
      setCountdown(frequency);
      countdownRef.current = setInterval(() => setCountdown(c => c <= 1 ? frequency : c - 1), 1000);
      intervalRef.current = setInterval(() => fetchData(company), frequency * 1000);
    } else setCountdown(0);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [frequency, company, fetchData]);

  const selectedFreq = FREQUENCIES.find(f => f.value === frequency);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-indigo-50" style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* Decorative blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-sky-200/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-100/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-sky-100 border border-sky-200 text-sky-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-5 tracking-wide uppercase">
            <Sparkles size={12} />
            AI-Powered News Intelligence
          </div>
          <h1 className="text-6xl font-black text-slate-800 mb-3 leading-tight">
            Ibrahim<span className="text-sky-500">.</span>News
          </h1>
          <p className="text-slate-500 text-lg">
            Search any topic — get real-time headlines, AI summaries & live updates
          </p>
        </div>

        {/* Search Box */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-3 flex flex-col md:flex-row gap-2 mb-8 max-w-4xl mx-auto">
          <div className="flex-1 flex items-center gap-3 px-4">
            <Search size={18} className="text-slate-400 shrink-0" />
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              placeholder="Search Pakistan, Apple, Bitcoin, PSL, AI..."
              className="flex-1 bg-transparent py-3 text-slate-800 placeholder:text-slate-300 focus:outline-none text-base"
            />
          </div>

          {/* Frequency */}
          <div className="relative shrink-0">
            <button onClick={() => setFreqOpen(!freqOpen)} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 text-sm font-medium transition-colors border border-slate-200 min-w-[130px]">
              <Clock size={14} className="text-sky-500" />
              <span className="flex-1 text-left">{selectedFreq?.label}</span>
              <ChevronDown size={13} className={`transition-transform text-slate-400 ${freqOpen ? "rotate-180" : ""}`} />
            </button>
            {freqOpen && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl border border-slate-200 shadow-xl z-20 overflow-hidden">
                {FREQUENCIES.map(f => (
                  <button key={f.value} onClick={() => { setFrequency(f.value); setFreqOpen(false); }}
                    className={`w-full px-4 py-2.5 text-left text-sm hover:bg-sky-50 transition-colors ${frequency === f.value ? "text-sky-600 font-semibold bg-sky-50" : "text-slate-600"}`}>
                    {f.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Scan Button */}
          <button onClick={handleSearch} disabled={loading || !inputValue.trim()}
            className="flex items-center justify-center gap-2 px-7 py-3 bg-sky-500 hover:bg-sky-600 text-white text-sm font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-sky-200 active:scale-95">
            {loading ? <RefreshCw size={15} className="animate-spin" /> : <Zap size={15} />}
            Search
          </button>
        </div>

        {/* Status bar */}
        {company && (
          <div className="flex flex-wrap items-center gap-4 mb-6 max-w-4xl mx-auto text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${loading ? "bg-amber-400 animate-pulse" : lastFetched ? "bg-emerald-400" : "bg-slate-300"}`} />
              <span>Tracking: <span className="text-slate-600 font-semibold">{company}</span></span>
            </div>
            {lastFetched && <span>Updated {formatDistanceToNow(lastFetched, { addSuffix: true })}</span>}
            {frequency > 0 && countdown > 0 && (
              <div className="flex items-center gap-1 ml-auto text-sky-500 font-medium">
                <RefreshCw size={11} className="animate-spin" />
                Next in {countdown}s
              </div>
            )}
            {data && <span className="ml-auto">{data.results.length} articles · {data.response_time.toFixed(2)}s</span>}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm mb-6 max-w-4xl mx-auto">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && !data && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm animate-pulse">
                <div className="h-3 bg-slate-100 rounded-full mb-3 w-1/3" />
                <div className="h-4 bg-slate-100 rounded-full mb-2" />
                <div className="h-4 bg-slate-100 rounded-full mb-2 w-4/5" />
                <div className="h-3 bg-slate-100 rounded-full w-2/3 mt-4" />
              </div>
            ))}
          </div>
        )}

        {/* AI Summary */}
        {data?.answer && (
          <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-xl shadow-sky-200 max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-3 opacity-80">
              <TrendingUp size={15} />
              <span className="text-xs font-semibold uppercase tracking-wider">AI Summary</span>
            </div>
            <p className="text-sm leading-relaxed opacity-95">{data.answer}</p>
          </div>
        )}

        {/* Results */}
        {data?.results && data.results.length > 0 && (
          <>
            <div className="flex items-center gap-3 mb-5 max-w-4xl mx-auto">
              <Newspaper size={15} className="text-sky-500" />
              <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Latest Headlines</span>
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-400">{data.results.length} results</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.results.map((item, idx) => {
                const badge = getScoreBadge(item.score);
                return (
                  <a key={idx} href={item.url} target="_blank" rel="noopener noreferrer"
                    className="group bg-white hover:bg-sky-50 rounded-2xl p-5 border border-slate-100 hover:border-sky-200 shadow-sm hover:shadow-lg hover:shadow-sky-100 transition-all duration-200 flex flex-col">
                    {/* Badge */}
                    <div className="flex items-center justify-between mb-3">
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${badge.bg} ${badge.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                        {badge.label}
                      </span>
                      <ExternalLink size={13} className="text-slate-300 group-hover:text-sky-400 transition-colors" />
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-bold text-slate-800 group-hover:text-sky-700 leading-snug mb-3 line-clamp-3 transition-colors flex-1">
                      {item.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-4">
                      {item.content}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between text-[11px] text-slate-300 border-t border-slate-100 pt-3 mt-auto">
                      <div className="flex items-center gap-1.5">
                        <Globe size={11} />
                        <span className="font-medium text-slate-400">{getDomain(item.url)}</span>
                      </div>
                      {item.published_date && (
                        <span>{formatDistanceToNow(new Date(item.published_date), { addSuffix: true })}</span>
                      )}
                    </div>
                  </a>
                );
              })}
            </div>
          </>
        )}

        {/* Empty state */}
        {!loading && !data && !error && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-sky-50 rounded-3xl mb-6 border border-sky-100">
              <Search size={32} className="text-sky-300" />
            </div>
            <h3 className="text-slate-600 font-semibold text-lg mb-2">What would you like to know?</h3>
            <p className="text-slate-400 text-sm">Try: <span className="text-sky-500 cursor-pointer" onClick={() => { setInputValue("Pakistan"); }}>Pakistan</span> · <span className="text-sky-500 cursor-pointer" onClick={() => { setInputValue("Bitcoin"); }}>Bitcoin</span> · <span className="text-sky-500 cursor-pointer" onClick={() => { setInputValue("Apple"); }}>Apple</span> · <span className="text-sky-500 cursor-pointer" onClick={() => { setInputValue("PSL"); }}>PSL</span></p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 text-center text-xs text-slate-300">
          Ibrahim.News · Powered by Tavily AI · Made with ❤️ by Naveed
        </div>
      </div>
    </div>
  );
}
