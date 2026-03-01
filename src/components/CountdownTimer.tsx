// Countdown Timer Component
import { useState, useEffect } from 'react';
import { differenceInSeconds } from 'date-fns';

interface CountdownTimerProps {
  targetDate: Date;
  onComplete?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export function CountdownTimer({ targetDate, onComplete, size = 'md' }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const diff = differenceInSeconds(targetDate, new Date());
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    
    const days = Math.floor(diff / (24 * 60 * 60));
    const hours = Math.floor((diff % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((diff % (60 * 60)) / 60);
    const seconds = diff % 60;
    
    return { days, hours, minutes, seconds, expired: false };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      
      if (newTimeLeft.expired && onComplete) {
        onComplete();
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, onComplete]);

  if (timeLeft.expired) {
    return (
      <div className="text-red-400 font-semibold animate-pulse">
        Game Started!
      </div>
    );
  }

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  };

  const boxClasses = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
  };

  return (
    <div className={`flex items-center gap-2 ${sizeClasses[size]}`}>
      {timeLeft.days > 0 && (
        <TimeBox value={timeLeft.days} label="D" size={boxClasses[size]} />
      )}
      <TimeBox value={timeLeft.hours} label="H" size={boxClasses[size]} />
      <TimeBox value={timeLeft.minutes} label="M" size={boxClasses[size]} />
      <TimeBox value={timeLeft.seconds} label="S" size={boxClasses[size]} />
    </div>
  );
}

function TimeBox({ value, label, size }: { value: number; label: string; size: string }) {
  return (
    <div className={`${size} bg-slate-800/80 rounded-lg flex flex-col items-center justify-center border border-slate-700`}>
      <span className="font-bold text-white">{String(value).padStart(2, '0')}</span>
      <span className="text-xs text-slate-500">{label}</span>
    </div>
  );
}
