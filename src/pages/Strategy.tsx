import { TrendingUp, DollarSign, Shield, Zap, ArrowUpCircle, Target } from 'lucide-react';

export default function Strategy() {
  const strategies = [
    {
      name: 'LEAPS (Long-Term Equity Anticipation Securities)',
      icon: <TrendingUp className="w-8 h-8" />,
      description: 'Long-term call options with expiration dates typically 1-3 years out. Provides leveraged exposure to stocks with less capital.',
      benefits: [
        'Lower capital requirement than buying shares',
        'Leverage gains with limited downside risk',
        'Time for thesis to play out',
        'Can be exercised or sold for profit',
      ],
      risk: 'Time decay (theta) and potential total loss if stock doesn\'t move as expected',
      example: 'Buy $100 strike call expiring in 2 years when stock is at $95',
    },
    {
      name: 'Covered Calls',
      icon: <DollarSign className="w-8 h-8" />,
      description: 'Selling call options against shares you own to generate income. Conservative strategy for sideways or slightly bullish stocks.',
      benefits: [
        'Generate consistent income (premium)',
        'Reduce cost basis of shares',
        'Provides downside cushion equal to premium',
        'Works well in sideways markets',
      ],
      risk: 'Capped upside if stock rallies past strike price, shares may be called away',
      example: 'Own 100 shares at $50, sell $55 call for $2 premium',
    },
    {
      name: 'Cash-Secured Puts',
      icon: <Shield className="w-8 h-8" />,
      description: 'Selling put options while holding enough cash to buy the shares if assigned. Get paid to potentially buy stocks at a discount.',
      benefits: [
        'Generate income from cash reserves',
        'Enter positions at desired price',
        'Keep premium if not assigned',
        'Lower effective cost basis if assigned',
      ],
      risk: 'Obligation to buy shares at strike if price drops, tying up capital',
      example: 'Sell $45 put on $50 stock, collect $2 premium, willing to buy at $43 net',
    },
    {
      name: 'Leveraged ETFs',
      icon: <Zap className="w-8 h-8" />,
      description: 'ETFs that use derivatives to amplify returns (2x or 3x). Best for short-term directional plays, not buy-and-hold.',
      benefits: [
        'Amplified gains on correct directional bets',
        'No options approval needed',
        'Liquid and easy to trade',
        'Defined risk (can only lose 100%)',
      ],
      risk: 'Volatility decay over time, amplified losses, not suitable for long-term holding',
      example: 'TQQQ (3x Nasdaq), SOXL (3x Semiconductors), SPXL (3x S&P 500)',
    },
    {
      name: 'Stock Share Ownership',
      icon: <ArrowUpCircle className="w-8 h-8" />,
      description: 'Direct ownership of company shares. The foundation of long-term wealth building and portfolio growth.',
      benefits: [
        'Unlimited upside potential',
        'Dividend income opportunities',
        'Voting rights in company decisions',
        'No expiration or time decay',
      ],
      risk: 'Full downside exposure, requires more capital than options',
      example: 'Buy shares of quality companies with strong fundamentals and hold',
    },
  ];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-4">
            <Target className="w-12 h-12 text-orange-500" />
          </div>
          <h1 className="text-5xl font-bold gradient-text mb-4">Trading Strategies</h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            These are the core strategies I use to build wealth and work toward financial freedom.
            Each strategy has its place depending on market conditions and personal goals.
          </p>
        </div>

        <div className="glass rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-orange-400 mb-4">My Investment Philosophy</h2>
          <div className="text-slate-300 space-y-4">
            <p>
              I believe in a diversified approach that combines both conservative income generation
              and aggressive growth strategies. The goal is to consistently grow capital while managing risk.
            </p>
            <p>
              <strong className="text-orange-400">Risk Management is Key:</strong> Never risk more than
              you can afford to lose on any single trade. Position sizing and stop losses are critical.
            </p>
            <p>
              <strong className="text-orange-400">Income + Growth:</strong> Generate cash flow through
              covered calls and puts while taking calculated risks on growth plays through LEAPS and shares.
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {strategies.map((strategy, index) => (
            <div
              key={index}
              className="glass rounded-2xl p-8 hover:border-orange-500/40 transition-all duration-300"
            >
              <div className="flex items-start space-x-6">
                <div className="p-4 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl border border-orange-500/30">
                  <div className="text-orange-400">{strategy.icon}</div>
                </div>

                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-orange-400 mb-3">
                    {strategy.name}
                  </h3>
                  <p className="text-slate-300 mb-6 text-lg">
                    {strategy.description}
                  </p>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="text-green-400 font-bold mb-3 flex items-center">
                        <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                        Benefits
                      </h4>
                      <ul className="space-y-2">
                        {strategy.benefits.map((benefit, i) => (
                          <li key={i} className="text-slate-400 text-sm flex items-start">
                            <span className="text-green-400 mr-2">✓</span>
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-red-400 font-bold mb-3 flex items-center">
                        <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                        Risk
                      </h4>
                      <p className="text-slate-400 text-sm">{strategy.risk}</p>

                      <h4 className="text-orange-400 font-bold mb-2 mt-4 flex items-center">
                        <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
                        Example
                      </h4>
                      <p className="text-slate-400 text-sm italic">{strategy.example}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="glass rounded-2xl p-8 mt-12 border-2 border-orange-500/30">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-orange-400 mb-4">Important Disclaimer</h2>
            <p className="text-slate-300 text-lg max-w-3xl mx-auto">
              <strong className="text-red-400">This is NOT financial advice.</strong> These strategies
              represent my personal approach and come with significant risk. Options and leveraged products
              can result in substantial losses. Always do your own research, understand what you're trading,
              and never invest money you can't afford to lose. Past performance doesn't guarantee future results.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
