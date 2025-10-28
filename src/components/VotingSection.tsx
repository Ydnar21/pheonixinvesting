import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useState } from 'react';

interface VotingSectionProps {
  postId: string;
  userVote?: {
    short_term_sentiment: 'bullish' | 'bearish' | 'neutral';
    long_term_sentiment: 'bullish' | 'bearish' | 'neutral';
  };
  voteCounts: {
    shortTerm: { bullish: number; bearish: number; neutral: number };
    longTerm: { bullish: number; bearish: number; neutral: number };
  };
  onVote: (
    postId: string,
    shortTermSentiment: 'bullish' | 'bearish' | 'neutral',
    longTermSentiment: 'bullish' | 'bearish' | 'neutral'
  ) => void;
}

export default function VotingSection({ postId, userVote, voteCounts, onVote }: VotingSectionProps) {
  const [shortTermVote, setShortTermVote] = useState<'bullish' | 'bearish' | 'neutral'>(
    userVote?.short_term_sentiment || 'neutral'
  );
  const [longTermVote, setLongTermVote] = useState<'bullish' | 'bearish' | 'neutral'>(
    userVote?.long_term_sentiment || 'neutral'
  );

  const handleSubmitVote = () => {
    onVote(postId, shortTermVote, longTermVote);
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
        return <TrendingUp className="w-4 h-4" />;
      case 'bearish':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  const getSentimentColor = (sentiment: string, isSelected: boolean) => {
    if (!isSelected) return 'border-slate-300 bg-white text-slate-600 hover:border-slate-400';

    switch (sentiment) {
      case 'bullish':
        return 'border-emerald-500 bg-emerald-50 text-emerald-700';
      case 'bearish':
        return 'border-red-500 bg-red-50 text-red-700';
      default:
        return 'border-slate-500 bg-slate-50 text-slate-700';
    }
  };

  const calculatePercentage = (count: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  };

  const shortTermTotal = voteCounts.shortTerm.bullish + voteCounts.shortTerm.bearish + voteCounts.shortTerm.neutral;
  const longTermTotal = voteCounts.longTerm.bullish + voteCounts.longTerm.bearish + voteCounts.longTerm.neutral;

  return (
    <div className="bg-slate-50 rounded-lg p-4 space-y-4">
      <h4 className="font-semibold text-slate-900 text-sm">Community Sentiment</h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Short Term Voting */}
        <div className="space-y-3">
          <div className="text-xs font-medium text-slate-700 uppercase">Short Term (0-3 months)</div>
          <div className="flex space-x-2">
            {(['bullish', 'neutral', 'bearish'] as const).map((sentiment) => (
              <button
                key={sentiment}
                onClick={() => setShortTermVote(sentiment)}
                className={`flex-1 flex flex-col items-center justify-center py-2 px-2 rounded-lg border-2 transition ${getSentimentColor(
                  sentiment,
                  shortTermVote === sentiment
                )}`}
              >
                {getSentimentIcon(sentiment)}
                <span className="text-xs mt-1 capitalize font-medium">{sentiment}</span>
              </button>
            ))}
          </div>
          {shortTermTotal > 0 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-600 font-medium">
                  {calculatePercentage(voteCounts.shortTerm.bullish, shortTermTotal)}% Bullish
                </span>
                <span className="text-slate-600">{voteCounts.shortTerm.bullish} votes</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">
                  {calculatePercentage(voteCounts.shortTerm.neutral, shortTermTotal)}% Neutral
                </span>
                <span className="text-slate-600">{voteCounts.shortTerm.neutral} votes</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-red-600 font-medium">
                  {calculatePercentage(voteCounts.shortTerm.bearish, shortTermTotal)}% Bearish
                </span>
                <span className="text-slate-600">{voteCounts.shortTerm.bearish} votes</span>
              </div>
            </div>
          )}
        </div>

        {/* Long Term Voting */}
        <div className="space-y-3">
          <div className="text-xs font-medium text-slate-700 uppercase">Long Term (6+ months)</div>
          <div className="flex space-x-2">
            {(['bullish', 'neutral', 'bearish'] as const).map((sentiment) => (
              <button
                key={sentiment}
                onClick={() => setLongTermVote(sentiment)}
                className={`flex-1 flex flex-col items-center justify-center py-2 px-2 rounded-lg border-2 transition ${getSentimentColor(
                  sentiment,
                  longTermVote === sentiment
                )}`}
              >
                {getSentimentIcon(sentiment)}
                <span className="text-xs mt-1 capitalize font-medium">{sentiment}</span>
              </button>
            ))}
          </div>
          {longTermTotal > 0 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-600 font-medium">
                  {calculatePercentage(voteCounts.longTerm.bullish, longTermTotal)}% Bullish
                </span>
                <span className="text-slate-600">{voteCounts.longTerm.bullish} votes</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">
                  {calculatePercentage(voteCounts.longTerm.neutral, longTermTotal)}% Neutral
                </span>
                <span className="text-slate-600">{voteCounts.longTerm.neutral} votes</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-red-600 font-medium">
                  {calculatePercentage(voteCounts.longTerm.bearish, longTermTotal)}% Bearish
                </span>
                <span className="text-slate-600">{voteCounts.longTerm.bearish} votes</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={handleSubmitVote}
        className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-2 rounded-lg transition font-medium text-sm shadow-md"
      >
        {userVote ? 'Update Vote' : 'Submit Vote'}
      </button>
    </div>
  );
}
