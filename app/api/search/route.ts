import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { company, maxResults = 10 } = await req.json();

  if (!company) {
    return NextResponse.json({ error: "Company name is required" }, { status: 400 });
  }

  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Tavily API key not configured" }, { status: 500 });
  }

  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: apiKey,
        query: `${company} latest news headlines 2025`,
        search_depth: "advanced",
        include_answer: true,
        include_raw_content: false,
        max_results: maxResults,
        include_domains: [],
        exclude_domains: [],
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
