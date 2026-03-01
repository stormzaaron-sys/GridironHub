// ComparisonStatRow.tsx - The "Tale of the Tape" style stat bars
import { cn } from '../utils/cn';

interface ComparisonStatRowProps {
  label: string;
  awayValue: string | number;
  homeValue: string | number;
  awayColor: string;
  homeColor: string;
}

export function ComparisonStatRow({ 
  label, 
  awayValue, 
  homeValue, 
  awayColor, 
  homeColor 
}: ComparisonStatRowProps) {
  // 1. Clean data: extract numbers from strings like "34% (12/35)" or "452 Total Yds"
  const awayNum = parseFloat(String(awayValue).match(/\d+/)?.[0] || '0');
  const homeNum = parseFloat(String(homeValue).match(/\d+/)?.[0] || '0');
  
  // 2. Calculate percentages for the two-sided bar
  const total = awayNum + homeNum || 1;
  const awayWidth = (awayNum / total) * 100;
  const homeWidth = (homeNum / total) * 100;

  // 3. Highlight the "winner" of the stat
  const awayIsLeading = awayNum > homeNum;
  const homeIsLeading = homeNum > awayNum;

  return (
    <div className="py-3 border-b border-gray-100 last:border-0 group hover:bg-gray-50/50 transition-colors px-1">
      {/* Stat Values & Label */}
      <div className="flex justify-between items-end mb-2">
        <div className="flex flex-col items-start">
          <span className={cn(
            "text-sm font-black tabular-nums transition-transform group-hover:scale-110",
            awayIsLeading ? "text-[#111111]" : "text-gray-400"
          )}>
            {awayValue}
          </span>
        </div>

        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 italic pb-0.5">
          {label}
        </span>

        <div className="flex flex-col items-end">
          <span className={cn(
            "text-sm font-black tabular-nums transition-transform group-hover:scale-110",
            homeIsLeading ? "text-[#111111]" : "text-gray-400"
          )}>
            {homeValue}
          </span>
        </div>
      </div>
      
      {/* Visual Comparison Bar (Two-sided approach) */}
      <div className="relative flex h-2 w-full bg-gray-100 rounded-sm overflow-hidden">
        {/* Away Team Bar (Renders from center to left via transform) */}
        <div className="flex-1 flex justify-end">
          <div 
            className="h-full transition-all duration-1000 ease-out origin-right"
            style={{ 
              width: `${awayWidth}%`, 
              backgroundColor: awayColor,
              opacity: awayIsLeading ? 1 : 0.6
            }}
          />
        </div>

        {/* Center Divider */}
        <div className="w-0.5 bg-white h-full z-10 shrink-0" />

        {/* Home Team Bar (Renders from center to right) */}
        <div className="flex-1 flex justify-start">
          <div 
            className="h-full transition-all duration-1000 ease-out origin-left"
            style={{ 
              width: `${homeWidth}%`, 
              backgroundColor: homeColor,
              opacity: homeIsLeading ? 1 : 0.6
            }}
          />
        </div>
      </div>
    </div>
  );
}