import { useState, useEffect } from 'react';
import { TrendingUp, Target, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface PortfolioGoal {
  id: string;
  user_id: string;
  starting_amount: number;
  target_amount: number;
  target_date: string;
  created_at: string;
  updated_at: string;
}

interface PortfolioGoalProgressProps {
  currentValue: number;
}

export default function PortfolioGoalProgress({ currentValue }: PortfolioGoalProgressProps) {
  const { user } = useAuth();
  const [goal, setGoal] = useState<PortfolioGoal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGoal();
  }, [user]);

  const loadGoal = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('portfolio_goal')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        await createDefaultGoal();
      } else {
        setGoal(data);
      }
    } catch (error) {
      console.error('Error loading goal:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultGoal = async () => {
    if (!user) return;

    try {
      const targetDate = new Date('2026-12-31');

      const { data, error } = await supabase
        .from('portfolio_goal')
        .insert([
          {
            user_id: user.id,
            starting_amount: 15000,
            target_amount: 100000,
            target_date: targetDate.toISOString().split('T')[0],
          },
        ])
        .select()
        .single();

      if (error) throw error;
      setGoal(data);
    } catch (error) {
      console.error('Error creating goal:', error);
    }
  };

  if (loading || !goal) {
    return null;
  }

  const startAmount = Number(goal.starting_amount);
  const targetAmount = Number(goal.target_amount);
  const totalGrowthNeeded = targetAmount - startAmount;
  const currentGrowth = currentValue - startAmount;
  const progressPercentage = Math.max(0, Math.min(100, (currentGrowth / totalGrowthNeeded) * 100));

  const amountRemaining = targetAmount - currentValue;
  const isGoalReached = currentValue >= targetAmount;

  const targetDate = new Date(goal.target_date);
  const today = new Date();
  const daysRemaining = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const monthsRemaining = Math.floor(daysRemaining / 30);

  return (
    <div className="glass rounded-2xl p-8 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-3 rounded-xl">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Portfolio Goal</h2>
            <p className="text-slate-600">Journey to Financial Freedom</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <Calendar className="w-5 h-5" />
          <span className="font-medium">End of 2026</span>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-baseline mb-3">
          <div>
            <span className="text-3xl font-bold text-slate-900">
              ${currentValue.toLocaleString()}
            </span>
            <span className="text-slate-500 ml-2">of ${targetAmount.toLocaleString()}</span>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-emerald-600">
              {progressPercentage.toFixed(1)}%
            </div>
            <div className="text-sm text-slate-600">Complete</div>
          </div>
        </div>

        <div className="relative h-6 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 to-teal-600 transition-all duration-1000 ease-out rounded-full"
            style={{ width: `${progressPercentage}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-emerald-50 rounded-xl p-4 border-2 border-emerald-200">
          <div className="flex items-center gap-2 text-emerald-700 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-semibold">Started At</span>
          </div>
          <div className="text-2xl font-bold text-emerald-900">
            ${startAmount.toLocaleString()}
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
          <div className="flex items-center gap-2 text-blue-700 mb-1">
            <Target className="w-4 h-4" />
            <span className="text-sm font-semibold">Target Goal</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">
            ${targetAmount.toLocaleString()}
          </div>
        </div>

        <div className={`rounded-xl p-4 border-2 ${
          isGoalReached
            ? 'bg-green-50 border-green-200'
            : 'bg-amber-50 border-amber-200'
        }`}>
          <div className={`flex items-center gap-2 mb-1 ${
            isGoalReached ? 'text-green-700' : 'text-amber-700'
          }`}>
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-semibold">
              {isGoalReached ? 'Goal Reached!' : 'Remaining'}
            </span>
          </div>
          <div className={`text-2xl font-bold ${
            isGoalReached ? 'text-green-900' : 'text-amber-900'
          }`}>
            {isGoalReached ? '🎉' : `$${amountRemaining.toLocaleString()}`}
          </div>
        </div>
      </div>

      {!isGoalReached && (
        <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <p className="text-slate-700 text-sm">
            <strong>{monthsRemaining} months</strong> remaining to reach your goal.
            You need to grow your portfolio by <strong>${amountRemaining.toLocaleString()}</strong> more.
            {currentGrowth > 0 && (
              <span className="text-emerald-600 ml-1">
                Great progress so far with ${currentGrowth.toLocaleString()} gained!
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
