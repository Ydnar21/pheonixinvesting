import { TrendingUp, Users, Heart, Coffee } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 p-4 rounded-2xl mb-6">
          <TrendingUp className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-5xl font-bold gradient-text mb-4">About Liquid Phoenix</h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          A free community for people who want to escape the 9-5 and build real wealth together
        </p>
      </div>

      <div className="glass rounded-2xl p-8 mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Hey, I'm Just Like You</h2>
        <p className="text-slate-700 text-lg leading-relaxed mb-4">
          I'm tired of working a 9-5. Tired of trading my time for money. Tired of building someone else's dream while my own sits on the back burner.
        </p>
        <p className="text-slate-700 text-lg leading-relaxed mb-4">
          So I'm doing something about it. I'm building capital through smart investing, and I'm sharing the entire journey with you—completely free, no strings attached.
        </p>
        <p className="text-slate-700 text-lg leading-relaxed">
          Liquid Phoenix is my path to financial freedom, and I want to build a small community of like-minded people who are on the same journey.
          People who think critically, do their research, and aren't afraid to take calculated risks to change their lives.
        </p>
      </div>

      <div className="glass rounded-2xl p-8 mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">What We're Building Here</h2>
        <p className="text-slate-700 text-lg leading-relaxed mb-4">
          This isn't some guru trying to sell you a course. This is a completely free platform where I track my trades, share my thinking, and connect with intelligent people who want to talk about stocks and strategies.
        </p>
        <p className="text-slate-700 text-lg leading-relaxed mb-4">
          You can see exactly what positions I'm holding, how they're performing, and why I made those decisions. The community page is where we discuss ideas, share due diligence, and learn from each other. The news feed keeps us informed about what's moving markets.
        </p>
        <p className="text-slate-700 text-lg leading-relaxed font-medium">
          Remember: scared money doesn't make money. Just be calculated with it.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass rounded-xl p-6 text-center">
          <div className="bg-emerald-100 w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-7 h-7 text-emerald-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Track Trades</h3>
          <p className="text-slate-600 text-sm">
            See every position I'm holding, both stocks and options, with full transparency on performance and strategy
          </p>
        </div>

        <div className="glass rounded-xl p-6 text-center">
          <div className="bg-blue-100 w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-7 h-7 text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Small Community</h3>
          <p className="text-slate-600 text-sm">
            Connect with other intelligent investors who do their homework and share quality insights about the market
          </p>
        </div>

        <div className="glass rounded-xl p-6 text-center">
          <div className="bg-teal-100 w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Coffee className="w-7 h-7 text-teal-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Stay Informed</h3>
          <p className="text-slate-600 text-sm">
            Keep up with market news and important developments that could impact your investments
          </p>
        </div>
      </div>

      <div className="glass rounded-2xl p-8 mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Why It's Free</h2>
        <p className="text-slate-700 text-lg leading-relaxed mb-4">
          I'm not trying to make money off you. I'm not selling courses, subscriptions, or premium features. This is just me, tracking my own journey to financial freedom, and inviting others to come along for the ride.
        </p>
        <p className="text-slate-700 text-lg leading-relaxed">
          My only goal is to build capital, escape the 9-5 grind, and connect with people who are working toward the same thing. If this helps you on your journey too, that's awesome. That's what community is all about.
        </p>
      </div>

      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg p-8 text-white text-center mb-8">
        <div className="inline-flex items-center justify-center bg-white bg-opacity-20 w-16 h-16 rounded-2xl mb-4">
          <Heart className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-bold mb-4">Built for the Community</h2>
        <p className="text-emerald-50 text-lg max-w-2xl mx-auto leading-relaxed">
          No ads. No subscriptions. No gimmicks. Just a small group of people who are tired of the rat race and want to build something better.
          Let's escape the 9-5 together.
        </p>
      </div>

      <div className="glass rounded-2xl p-8 mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Community Guidelines</h2>
        <p className="text-slate-700 text-lg leading-relaxed mb-4">
          Please feel free to contribute to stock discussions and share your insights! The only thing I ask is that you keep a positive mentality towards others when chatting.
        </p>
        <p className="text-slate-700 text-lg leading-relaxed">
          We're all here to learn and grow. Everyone has different experience levels, and that's okay. Let's support each other and build something great together.
        </p>
      </div>

      <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold text-amber-900 mb-3">Important Disclaimer</h2>
        <p className="text-amber-800 text-lg leading-relaxed max-w-2xl mx-auto">
          <strong>Nothing on this website is financial advice in any way, shape, or form.</strong> I'm just sharing my own trades and thoughts as I navigate my journey to financial freedom.
          Always do your own research and make your own informed decisions. Investing involves risk, and you could lose money.
        </p>
      </div>
    </div>
  );
}
