// Badge Component
import { Badge as BadgeType } from '../models/types';
import { Trophy, Target, Lock, Flame, Zap, Award, Star, Shield } from 'lucide-react';
import { cn } from '../utils/cn';

interface BadgeProps {
  badge: BadgeType;
  size?: 'sm' | 'md' | 'lg';
}

const badgeConfig: Record<string, { icon: typeof Trophy; color: string; bgColor: string }> = {
  champion: { icon: Trophy, color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
  playoff_contender: { icon: Star, color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
  upset_hunter: { icon: Target, color: 'text-red-400', bgColor: 'bg-red-500/20' },
  lock_master: { icon: Lock, color: 'text-orange-400', bgColor: 'bg-orange-500/20' },
  perfect_week: { icon: Zap, color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  hot_streak: { icon: Flame, color: 'text-red-400', bgColor: 'bg-red-500/20' },
  comeback_kid: { icon: Award, color: 'text-green-400', bgColor: 'bg-green-500/20' },
  iron_man: { icon: Shield, color: 'text-slate-400', bgColor: 'bg-slate-500/20' },
};

export function BadgeDisplay({ badge, size = 'md' }: BadgeProps) {
  const config = badgeConfig[badge.badgeType] || badgeConfig.champion;
  const Icon = config.icon;

  const sizeStyles = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const iconSizes = {
    sm: 14,
    md: 20,
    lg: 28,
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={cn(
          'rounded-full flex items-center justify-center',
          sizeStyles[size],
          config.bgColor
        )}
      >
        <Icon size={iconSizes[size]} className={config.color} />
      </div>
      {size !== 'sm' && (
        <span className="text-xs text-slate-400 text-center">{badge.description}</span>
      )}
    </div>
  );
}

export function BadgeList({ badges, maxShow = 5 }: { badges: BadgeType[]; maxShow?: number }) {
  const displayBadges = badges.slice(0, maxShow);
  const remaining = badges.length - maxShow;

  return (
    <div className="flex items-center gap-2">
      {displayBadges.map((badge) => (
        <BadgeDisplay key={badge.id} badge={badge} size="sm" />
      ))}
      {remaining > 0 && (
        <span className="text-xs text-slate-500">+{remaining} more</span>
      )}
    </div>
  );
}
