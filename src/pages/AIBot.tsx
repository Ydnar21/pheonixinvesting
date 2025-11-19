import { Bot, Zap, TrendingUp, Brain, AlertCircle, Rocket } from 'lucide-react';

export default function AIBot() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <Bot className="w-20 h-20 text-orange-500 animate-pulse" />
              <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                COMING SOON
              </div>
            </div>
          </div>
          <h1 className="text-6xl font-bold gradient-text mb-4">AI Trading Bot</h1>
          <p className="text-2xl text-slate-400 max-w-3xl mx-auto">
            An emotionless, algorithm-driven trading system powered by technical analysis
            and market sentiment
          </p>
        </div>

        <div className="glass rounded-2xl p-10 mb-12 border-2 border-orange-500/30">
          <div className="flex items-start space-x-6">
            <div className="p-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
              <Rocket className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-orange-400 mb-4">In Development</h2>
              <p className="text-slate-300 text-lg leading-relaxed">
                I'm currently building an advanced AI trading bot that removes emotion from trading decisions.
                This system will analyze technical indicators, market sentiment, volume patterns, and price action
                to make data-driven trading decisions 24/7.
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="glass rounded-2xl p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-orange-500/20 rounded-lg">
                <Brain className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-2xl font-bold text-orange-400">Core Features</h3>
            </div>
            <ul className="space-y-4">
              {[
                'Technical Analysis: RSI, MACD, Moving Averages, Bollinger Bands',
                'Market Sentiment Analysis: Social media, news, volume',
                'Risk Management: Automatic stop losses and position sizing',
                'Backtesting: Historical data validation before live trading',
                'Multiple Timeframes: Day trading to swing trading strategies',
                'Real-time Monitoring: 24/7 market surveillance',
              ].map((feature, index) => (
                <li key={index} className="flex items-start text-slate-300">
                  <Zap className="w-5 h-5 text-orange-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="glass rounded-2xl p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-orange-500/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-2xl font-bold text-orange-400">Why AI Trading?</h3>
            </div>
            <div className="space-y-4 text-slate-300">
              <p>
                <strong className="text-orange-400">Emotion-Free:</strong> No fear, no greed, no FOMO.
                The bot follows the rules without hesitation.
              </p>
              <p>
                <strong className="text-orange-400">Speed:</strong> Executes trades in milliseconds,
                capitalizing on opportunities humans would miss.
              </p>
              <p>
                <strong className="text-orange-400">Consistency:</strong> Applies the same strategy
                every time without fatigue or distraction.
              </p>
              <p>
                <strong className="text-orange-400">Data-Driven:</strong> Makes decisions based on
                hard data, not gut feelings or emotions.
              </p>
              <p>
                <strong className="text-orange-400">24/7 Operation:</strong> Never sleeps, never misses
                a setup, always monitoring the markets.
              </p>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-8 mb-12">
          <h3 className="text-2xl font-bold text-orange-400 mb-6">Technical Stack</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-orange-300 font-bold mb-3">Data Collection</h4>
              <ul className="text-slate-400 text-sm space-y-2">
                <li>• Real-time price feeds</li>
                <li>• News sentiment API</li>
                <li>• Social media analysis</li>
                <li>• Options flow data</li>
                <li>• Volume analysis</li>
              </ul>
            </div>
            <div>
              <h4 className="text-orange-300 font-bold mb-3">Analysis Engine</h4>
              <ul className="text-slate-400 text-sm space-y-2">
                <li>• Machine learning models</li>
                <li>• Technical indicators</li>
                <li>• Pattern recognition</li>
                <li>• Sentiment scoring</li>
                <li>• Probability calculations</li>
              </ul>
            </div>
            <div>
              <h4 className="text-orange-300 font-bold mb-3">Execution</h4>
              <ul className="text-slate-400 text-sm space-y-2">
                <li>• Automated order placement</li>
                <li>• Risk management rules</li>
                <li>• Position monitoring</li>
                <li>• Stop loss management</li>
                <li>• Profit taking logic</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-8 mb-12 border-2 border-orange-500/30">
          <div className="flex items-start space-x-4">
            <AlertCircle className="w-8 h-8 text-orange-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-2xl font-bold text-orange-400 mb-4">Development Status</h3>
              <div className="space-y-4 text-slate-300">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold">Strategy Development</span>
                    <span className="text-orange-400">75%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-3">
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold">Backtesting Engine</span>
                    <span className="text-orange-400">60%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-3">
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold">Live Trading Integration</span>
                    <span className="text-orange-400">30%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-3">
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full" style={{ width: '30%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-10 border-2 border-red-500/30">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-red-400 mb-4">Critical Disclaimer</h2>
            <div className="text-slate-300 text-lg space-y-3 max-w-3xl mx-auto">
              <p>
                <strong>Automated trading carries significant risk.</strong> Even the best algorithms
                can lose money in volatile or unpredictable market conditions.
              </p>
              <p>
                This bot is in development and will undergo extensive testing before live deployment.
                Past backtesting performance does not guarantee future results.
              </p>
              <p className="text-red-400 font-bold">
                Never risk capital you cannot afford to lose. Always start with paper trading
                and minimal position sizes when going live.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-slate-400 text-lg">
            Want to follow the development? Join the community and stay updated on progress.
          </p>
        </div>
      </div>
    </div>
  );
}
