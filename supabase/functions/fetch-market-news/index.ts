import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface NewsItem {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  stock?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get stocks from community posts
    const { data: communityStocks, error: stocksError } = await supabase.rpc(
      "get_community_stocks"
    );

    if (stocksError) {
      console.error("Error fetching community stocks:", stocksError);
    }

    const articles: NewsItem[] = [];

    // Fetch general market news
    const generalNewsRss = "https://news.google.com/rss/search?q=stock+market+news+when:7d&hl=en-US&gl=US&ceid=US:en";
    const generalResponse = await fetch(generalNewsRss);
    
    if (generalResponse.ok) {
      const xmlText = await generalResponse.text();
      const generalArticles = parseRSS(xmlText);
      articles.push(...generalArticles.slice(0, 15));
    }

    // Fetch news for community stocks
    if (communityStocks && communityStocks.length > 0) {
      for (const stock of communityStocks.slice(0, 10)) {
        try {
          const stockNewsRss = `https://news.google.com/rss/search?q=${encodeURIComponent(stock.stock_symbol + " stock")}+when:7d&hl=en-US&gl=US&ceid=US:en`;
          const stockResponse = await fetch(stockNewsRss);
          
          if (stockResponse.ok) {
            const xmlText = await stockResponse.text();
            const stockArticles = parseRSS(xmlText, stock.stock_symbol);
            articles.push(...stockArticles.slice(0, 3));
          }
        } catch (error) {
          console.error(`Error fetching news for ${stock.stock_symbol}:`, error);
        }
      }
    }

    // Sort by date and remove duplicates
    const uniqueArticles = Array.from(
      new Map(articles.map(item => [item.url, item])).values()
    ).sort((a, b) => {
      const dateA = new Date(a.publishedAt).getTime();
      const dateB = new Date(b.publishedAt).getTime();
      return dateB - dateA;
    });

    return new Response(
      JSON.stringify({ articles: uniqueArticles.slice(0, 50) }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching news:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to fetch news",
        articles: [],
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

function parseRSS(xmlText: string, stockSymbol?: string): NewsItem[] {
  const articles: NewsItem[] = [];
  const itemRegex = /<item>(.*?)<\/item>/gs;
  const titleRegex = /<title>([^<]+)<\/title>/;
  const linkRegex = /<link>([^<]+)<\/link>/;
  const pubDateRegex = /<pubDate>([^<]+)<\/pubDate>/;
  const sourceRegex = /<source[^>]*>([^<]+)<\/source>/;
  
  let match;
  while ((match = itemRegex.exec(xmlText)) !== null) {
    const itemContent = match[1];
    
    const titleMatch = titleRegex.exec(itemContent);
    const linkMatch = linkRegex.exec(itemContent);
    const pubDateMatch = pubDateRegex.exec(itemContent);
    const sourceMatch = sourceRegex.exec(itemContent);
    
    if (titleMatch && linkMatch) {
      const article: NewsItem = {
        title: titleMatch[1].trim(),
        url: linkMatch[1].trim(),
        source: sourceMatch ? sourceMatch[1].trim() : "Google News",
        publishedAt: pubDateMatch ? pubDateMatch[1].trim() : new Date().toISOString(),
      };
      
      if (stockSymbol) {
        article.stock = stockSymbol;
      }
      
      articles.push(article);
    }
  }
  
  return articles;
}