import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'npm:plaid@20';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

// Initialize Plaid client
const configuration = new Configuration({
  basePath: PlaidEnvironments[Deno.env.get('PLAID_ENV') || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': Deno.env.get('PLAID_CLIENT_ID'),
      'PLAID-SECRET': Deno.env.get('PLAID_SECRET'),
    },
  },
});

const plaidClient = new PlaidApi(configuration);

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get authenticated user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const url = new URL(req.url);
    const action = url.pathname.split('/').pop();

    // Handle different Plaid actions
    switch (action) {
      case 'create_link_token': {
        // Create a link token for Plaid Link initialization
        const request = {
          user: {
            client_user_id: user.id,
          },
          client_name: 'Liquid Phoenix',
          products: [Products.Investments],
          country_codes: [CountryCode.Us],
          language: 'en',
        };

        const response = await plaidClient.linkTokenCreate(request);
        return new Response(
          JSON.stringify({ link_token: response.data.link_token }),
          {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      }

      case 'exchange_public_token': {
        // Exchange public token for access token
        const { public_token } = await req.json();

        const exchangeResponse = await plaidClient.itemPublicTokenExchange({
          public_token,
        });

        const accessToken = exchangeResponse.data.access_token;
        const itemId = exchangeResponse.data.item_id;

        // Get institution details
        const itemResponse = await plaidClient.itemGet({ access_token: accessToken });
        const institutionId = itemResponse.data.item.institution_id;

        const institutionResponse = await plaidClient.institutionsGetById({
          institution_id: institutionId!,
          country_codes: [CountryCode.Us],
        });

        const institutionName = institutionResponse.data.institution.name;

        // Store in database
        const { error: dbError } = await supabaseClient
          .from('plaid_items')
          .insert({
            user_id: user.id,
            access_token: accessToken,
            item_id: itemId,
            institution_id: institutionId,
            institution_name: institutionName,
          });

        if (dbError) throw dbError;

        return new Response(
          JSON.stringify({ success: true, institution_name: institutionName }),
          {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      }

      case 'sync_holdings': {
        // Fetch and sync portfolio holdings
        const { data: plaidItems, error: itemsError } = await supabaseClient
          .from('plaid_items')
          .select('*')
          .eq('user_id', user.id);

        if (itemsError) throw itemsError;

        for (const item of plaidItems || []) {
          try {
            const holdingsResponse = await plaidClient.investmentsHoldingsGet({
              access_token: item.access_token,
            });

            const holdings = holdingsResponse.data.holdings;
            const securities = holdingsResponse.data.securities;

            // Create a map of securities for easy lookup
            const securitiesMap = new Map(
              securities.map((s) => [s.security_id, s])
            );

            // Delete existing holdings for this item
            await supabaseClient
              .from('portfolio_holdings')
              .delete()
              .eq('plaid_item_id', item.id);

            // Insert updated holdings
            const holdingsToInsert = holdings.map((holding) => {
              const security = securitiesMap.get(holding.security_id);
              return {
                user_id: user.id,
                plaid_item_id: item.id,
                security_id: holding.security_id,
                symbol: security?.ticker_symbol || 'UNKNOWN',
                name: security?.name || 'Unknown Security',
                quantity: holding.quantity,
                cost_basis: holding.cost_basis || 0,
                current_price: security?.close_price || 0,
                institution_value: holding.institution_value,
              };
            });

            if (holdingsToInsert.length > 0) {
              await supabaseClient
                .from('portfolio_holdings')
                .insert(holdingsToInsert);
            }

            // Update last_sync timestamp
            await supabaseClient
              .from('plaid_items')
              .update({ last_sync: new Date().toISOString() })
              .eq('id', item.id);
          } catch (error) {
            console.error(`Error syncing holdings for item ${item.id}:`, error);
          }
        }

        return new Response(
          JSON.stringify({ success: true }),
          {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          {
            status: 400,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
    }
  } catch (error) {
    console.error('Plaid handler error:', error);
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