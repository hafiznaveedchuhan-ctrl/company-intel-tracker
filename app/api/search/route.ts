import { NextRequest, NextResponse } from "next/server";

const TAVILY_KEY = process.env.TAVILY_API_KEY ?? "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";

export async function POST(req: NextRequest) {
  const { company, maxResults = 10 } = await req.json();

  if (!company) {
    return NextResponse.json({ error: "Company name is required" }, { status: 400 });
  }

  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: TAVILY_KEY,
        query: `${company} latest news headlines 2026`,
        search_depth: "advanced",
        include_answer: true,
        include_raw_content: false,
        max_results: maxResults,
        topic: "news",
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json({ error: `Tavily error: ${err}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
