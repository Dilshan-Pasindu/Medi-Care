import { cn } from '../../lib/utils';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  accentColor?: 'teal' | 'emerald' | 'cyan' | 'blue' | 'violet';
  className?: string;
}

const accentMap = {
  teal: {
    icon: 'bg-teal-100 text-teal-600',
    border: 'border-teal-100',
    bar: 'bg-teal-500',
    value: 'text-teal-700',
  },
  emerald: {
    icon: 'bg-emerald-100 text-emerald-600',
    border: 'border-emerald-100',
    bar: 'bg-emerald-500',
    value: 'text-emerald-700',
  },
  cyan: {
    icon: 'bg-cyan-100 text-cyan-600',
    border: 'border-cyan-100',
    bar: 'bg-cyan-500',
    value: 'text-cyan-700',
  },
  blue: {
    icon: 'bg-blue-100 text-blue-600',
    border: 'border-blue-100',
    bar: 'bg-blue-500',
    value: 'text-blue-700',
  },
  violet: {
    icon: 'bg-violet-100 text-violet-600',
    border: 'border-violet-100',
    bar: 'bg-violet-500',
    value: 'text-violet-700',
  },
};

export function StatCard({
  title, value, icon: Icon, description, trend, trendValue,
  accentColor = 'teal', className,
}: StatCardProps) {
  const accent = accentMap[accentColor];

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor =
    trend === 'up' ? 'text-emerald-600 bg-emerald-50' :
    trend === 'down' ? 'text-red-500 bg-red-50' :
    'text-slate-500 bg-slate-100';

  return (
    <div className={cn(
      'relative bg-white rounded-2xl border p-5 stat-card-glow overflow-hidden',
      accent.border,
      className
    )}>
      {/* Top accent bar */}
      <div className={cn('absolute top-0 left-0 right-0 h-0.5', accent.bar)} />

      {/* Background decoration */}
      <div className="absolute -right-4 -bottom-4 h-20 w-20 rounded-full opacity-5"
        style={{ background: 'radial-gradient(circle, currentColor 0%, transparent 70%)' }} />

      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <p className={cn('text-3xl font-bold tracking-tight', accent.value)}>{value}</p>
          {description && (
            <p className="text-xs text-slate-400 font-medium">{description}</p>
          )}
        </div>
        <div className={cn('p-2.5 rounded-xl', accent.icon)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {trend && trendValue && (
        <div className="mt-3 pt-3 border-t border-slate-50">
          <span className={cn('inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full', trendColor)}>
            <TrendIcon className="h-3 w-3" />
            {trendValue}
          </span>
        </div>
      )}
    </div>
  );
}
