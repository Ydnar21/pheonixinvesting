import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  source: {
    name: string;
  };
  publishedAt: string;
  urlToImage: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const newsApiUrl = 'https://newsapi.org/v2/everything';
    const params = new URLSearchParams({
      q: 'stock market OR finance OR wall street OR investing',
      language: 'en',
      sortBy: 'publishedAt',
      pageSize: '20',
      apiKey: 'bc0c9f39ea084a9cb1af9ec1e5be9f71',
    });

    const response = await fetch(`${newsApiUrl}?${params}`);
    
    if (!response.ok) {
      throw new Error(`NewsAPI error: ${response.statusText}`);
    }

    const data = await response.json();
    
    const articles = data.articles?.map((article: NewsArticle) => ({
      title: article.title,
      description: article.description,
      url: article.url,
      source: article.source.name,
      publishedAt: article.publishedAt,
      imageUrl: article.urlToImage,
    })) || [];

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