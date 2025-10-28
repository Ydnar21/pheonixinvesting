import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface StockQuote {
  symbol: string;
  price: number | null;
  error?: string;
}

async function fetchStockPrice(symbol: string): Promise<number | null> {
  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      }
    );

    if (!response.ok) {
      console.error(`Failed to fetch price for ${symbol}, status: ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (!data?.chart?.result?.[0]?.meta?.regularMarketPrice) {
      console.error(`No price data found for ${symbol}`);
      return null;
    }

    const price = data.chart.result[0].meta.regularMarketPrice;
    console.log(`Fetched ${symbol}: $${price}`);
    return price;
  } catch (error) {
    console.error(`Error fetching ${symbol}:`, error);
    return null;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: allTrades, error: fetchError } = await supabase
      .from('user_trades')
      .select('id, symbol, trade_type')
      .in('trade_type', ['stock', 'option']);

    if (fetchError) {
      throw new Error(`Failed to fetch trades: ${fetchError.message}`);
    }

    if (!allTrades || allTrades.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No positions to update', updated: [] }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const uniqueSymbols = [...new Set(allTrades.map(t => t.symbol))];
    console.log(`Updating prices for ${uniqueSymbols.length} symbols:`, uniqueSymbols);

    const priceUpdates: StockQuote[] = [];

    for (const symbol of uniqueSymbols) {
      const price = await fetchStockPrice(symbol);
      priceUpdates.push({
        symbol,
        price,
        error: price === null ? 'Failed to fetch price' : undefined,
      });

      await new Promise(resolve => setTimeout(resolve, 500));
    }

    const successfulStockUpdates = [];
    const successfulOptionUpdates = [];
    const failedUpdates = [];

    for (const update of priceUpdates) {
      if (update.price !== null) {
        const { error: stockUpdateError } = await supabase
          .from('user_trades')
          .update({ current_price: update.price })
          .eq('symbol', update.symbol)
          .eq('trade_type', 'stock');

        if (stockUpdateError) {
          console.error(`Failed to update stock ${update.symbol}:`, stockUpdateError);
        } else {
          const stockCount = allTrades.filter(t => t.symbol === update.symbol && t.trade_type === 'stock').length;
          if (stockCount > 0) {
            console.log(`Updated ${stockCount} stock positions for ${update.symbol} to $${update.price}`);
            successfulStockUpdates.push({ symbol: update.symbol, price: update.price });
          }
        }

        const { error: optionUpdateError } = await supabase
          .from('user_trades')
          .update({ current_price: update.price })
          .eq('symbol', update.symbol)
          .eq('trade_type', 'option');

        if (optionUpdateError) {
          console.error(`Failed to update options ${update.symbol}:`, optionUpdateError);
        } else {
          const optionCount = allTrades.filter(t => t.symbol === update.symbol && t.trade_type === 'option').length;
          if (optionCount > 0) {
            console.log(`Updated ${optionCount} option positions for ${update.symbol} to $${update.price}`);
            successfulOptionUpdates.push({ symbol: update.symbol, price: update.price });
          }
        }
      } else {
        failedUpdates.push(update.symbol);
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Price update completed',
        stocks_updated: successfulStockUpdates,
        options_updated: successfulOptionUpdates,
        failed: failedUpdates,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error in update-stock-prices function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
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
