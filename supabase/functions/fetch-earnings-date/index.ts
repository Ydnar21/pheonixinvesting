import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { symbol } = await req.json();

    if (!symbol) {
      return new Response(
        JSON.stringify({ error: "Stock symbol is required" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const searchQuery = `${symbol} stock next earnings date`;
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;

    const response = await fetch(searchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    const html = await response.text();

    let earningsDate = null;

    const datePatterns = [
      /earnings date[:\s]+([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i,
      /next earnings[:\s]+([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i,
      /reports on[:\s]+([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i,
      /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}/i,
    ];

    for (const pattern of datePatterns) {
      const match = html.match(pattern);
      if (match) {
        const dateStr = match[1] || match[0];
        const parsedDate = new Date(dateStr);
        
        if (!isNaN(parsedDate.getTime())) {
          const today = new Date();
          if (parsedDate >= today) {
            earningsDate = parsedDate.toISOString().split('T')[0];
            break;
          }
        }
      }
    }

    if (!earningsDate) {
      const futureDatePattern = /(\d{4})-(\d{2})-(\d{2})/g;
      const matches = [...html.matchAll(futureDatePattern)];
      
      const today = new Date();
      const sixMonthsFromNow = new Date();
      sixMonthsFromNow.setMonth(today.getMonth() + 6);

      for (const match of matches) {
        const testDate = new Date(match[0]);
        if (testDate >= today && testDate <= sixMonthsFromNow) {
          earningsDate = match[0];
          break;
        }
      }
    }

    return new Response(
      JSON.stringify({
        symbol,
        earningsDate,
        message: earningsDate
          ? "Earnings date found"
          : "Could not find earnings date",
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching earnings date:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to fetch earnings date",
        details: error.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
