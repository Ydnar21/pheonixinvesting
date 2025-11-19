import { TrendingUp, Users, Coffee, Heart } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <img
          src="/LiquidPheonix.png"
          alt="Liquid Phoenix"
          className="w-20 h-20 mx-auto mb-4"
        />
        <h1 className="text-4xl font-bold text-orange-500 mb-3">About Liquid Phoenix</h1>
        <p className="text-lg text-slate-400">
          A free community for people who want to escape the 9-5 and build real wealth together
        </p>
      </div>

      <div className="glass rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-orange-500 mb-3">Hey, I'm Just Like You</h2>
        <p className="text-slate-400 leading-relaxed mb-3">
          I'm tired of working a 9-5. Tired of trading my time for money. Tired of building someone else's dream while my own sits on the back burner.
        </p>
        <p className="text-slate-400 leading-relaxed mb-3">
          So I'm doing something about it. I'm building capital through smart investing, and I'm sharing the entire journey with you—completely free, no strings attached.
        </p>
        <p className="text-slate-400 leading-relaxed">
          Liquid Phoenix is my path to financial freedom, and I want to build a small community of like-minded people who are on the same journey.
          People who think critically, do their research, and aren't afraid to take calculated risks to change their lives.
        </p>
      </div>

      <div className="glass rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-orange-500 mb-3">What We're Building Here</h2>
        <p className="text-slate-400 leading-relaxed mb-3">
          This isn't some guru trying to sell you a course. This is a completely free platform where I track my trades, share my thinking, and connect with intelligent people who want to talk about stocks and strategies.
        </p>
        <p className="text-slate-400 leading-relaxed mb-3">
          You can see my strategies, how I approach the market, and why I make certain decisions. The community page is where we discuss ideas, share due diligence, and learn from each other. The news feed keeps us informed about what's moving markets.
        </p>
        <p className="text-orange-500 font-semibold">
          Remember: scared money doesn't make money. Just be calculated with it.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="glass rounded-lg p-6 text-center">
          <div className="bg-orange-500 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-bold text-orange-500 mb-2">Track Strategies</h3>
          <p className="text-slate-400 text-sm">
            See the strategies I use, my approach to the market, with full transparency on my thinking and methodology
          </p>
        </div>

        <div className="glass rounded-lg p-6 text-center">
          <div className="bg-orange-500 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-bold text-orange-500 mb-2">Small Community</h3>
          <p className="text-slate-400 text-sm">
            Connect with other intelligent investors who do their homework and share quality insights about the market
          </p>
        </div>

        <div className="glass rounded-lg p-6 text-center">
          <div className="bg-orange-500 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Coffee className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-bold text-orange-500 mb-2">Stay Informed</h3>
          <p className="text-slate-400 text-sm">
            Keep up with market news and important developments that could impact your investments
          </p>
        </div>
      </div>

      <div className="glass rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-orange-500 mb-3">Why It's Free</h2>
        <p className="text-slate-400 leading-relaxed mb-3">
          I'm not trying to make money off you. I'm not selling courses, subscriptions, or premium features. This is just me, tracking my own journey to financial freedom, and inviting others to come along for the ride.
        </p>
        <p className="text-slate-400 leading-relaxed">
          My only goal is to build capital, escape the 9-5 grind, and connect with people who are working toward the same thing. If this helps you on your journey too, that's awesome. That's what community is all about.
        </p>
      </div>

      <div className="bg-orange-500 rounded-lg p-8 text-white text-center mb-6">
        <div className="inline-flex items-center justify-center bg-white/20 w-14 h-14 rounded-lg mb-4">
          <Heart className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold mb-3">Built for the Community</h2>
        <p className="text-orange-50 leading-relaxed">
          No ads. No subscriptions. No gimmicks. Just a small group of people who are tired of the rat race and want to build something better.
          Let's escape the 9-5 together.
        </p>
      </div>

      <div className="glass rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-orange-500 mb-3">Community Guidelines</h2>
        <p className="text-slate-400 leading-relaxed mb-3">
          Please feel free to contribute to stock discussions and share your insights! The only thing I ask is that you keep a positive mentality towards others when chatting.
        </p>
        <p className="text-slate-400 leading-relaxed">
          We're all here to learn and grow. Everyone has different experience levels, and that's okay. Let's support each other and build something great together.
        </p>
      </div>

      <div className="glass-dark rounded-lg p-6 border border-red-500/30">
        <h2 className="text-xl font-bold text-red-400 mb-2">Important Disclaimer</h2>
        <p className="text-slate-400 leading-relaxed">
          <strong className="text-red-400">Nothing on this website is financial advice in any way, shape, or form.</strong> I'm just sharing my own trades and thoughts as I navigate my journey to financial freedom.
          Always do your own research and make your own informed decisions. Investing involves risk, and you could lose money.
        </p>
      </div>
    </div>
  );
}
