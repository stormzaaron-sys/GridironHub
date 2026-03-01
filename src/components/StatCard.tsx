import { LucideIcon } from 'lucide-react';
import { cn } from '../utils/cn';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  color?: "red" | "black";
  className?: string;
}

export function StatCard({ label, value, icon: Icon, trend, color = "red", className }: StatCardProps) {
  // Safe formatting to prevent the "Cannot read properties of undefined" error
  const safeValue = value?.toString() || "0";
  
  return (
    <div className={cn(
      "relative overflow-hidden bg-white border border-gray-100 shadow-sm transition-all group",
      className
    )}>
      {/* Top Accent Bar - ESPN Style */}
      <div className={cn(
        "absolute top-0 left-0 right-0 h-1 z-10",
        color === "red" ? "bg-[#CC0000]" : "bg-[#111111]"
      )} />

      <div className="p-4 flex items-center justify-between relative z-10">
        <div className="flex-1 min-w-0">
          {/* Label - Forced Gray to prevent it turning black or disappearing */}
          <p className="text-[9px] sm:text-[10px] font-black !text-gray-400 uppercase tracking-[0.2em] italic mb-1 truncate">
            {label}
          </p>
          
          <div className="flex items-baseline gap-2">
            {/* Value - Forced Black to override any global white text rules */}
            <h4 className="text-2xl sm:text-3xl font-display font-black !text-[#111111] uppercase italic leading-none tracking-tighter">
              {safeValue}
            </h4>
            
            {trend && (
              <span className="text-[10px] font-black text-emerald-600 uppercase italic tracking-tighter">
                {trend}
              </span>
            )}
          </div>
        </div>

        {/* Icon Overlay - Background accent */}
        <div className={cn(
          "p-2 sm:p-3 transition-transform group-hover:scale-110 shrink-0",
          color === "red" ? "text-[#CC0000]/10" : "text-gray-200/50"
        )}>
          <Icon size={28} sm-size={32} strokeWidth={2.5} />
        </div>
      </div>

      {/* Subtle Bottom Ticker deco - Corner Icon */}
      <div className="absolute -bottom-2 -right-2 p-1 opacity-[0.03] pointer-events-none">
        <Icon size={72} strokeWidth={3} className="transform rotate-12" />
      </div>

      {/* Hover Background Effect */}
      <div className="absolute inset-0 bg-gray-50/50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  );
}