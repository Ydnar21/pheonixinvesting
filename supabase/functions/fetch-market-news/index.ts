import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface NewsItem {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const googleNewsRss = 'https://news.google.com/rss/search?q=stock+market+news+when:7d&hl=en-US&gl=US&ceid=US:en';
    
    const response = await fetch(googleNewsRss);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch Google News RSS: ${response.statusText}`);
    }

    const xmlText = await response.text();
    
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
        articles.push({
          title: titleMatch[1].trim(),
          url: linkMatch[1].trim(),
          source: sourceMatch ? sourceMatch[1].trim() : 'Google News',
          publishedAt: pubDateMatch ? pubDateMatch[1].trim() : new Date().toISOString(),
        });
      }
      
      if (articles.length >= 30) break;
    }

    return new Response(
      JSON.stringify({ articles }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching news:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch news',
        articles: [],
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});