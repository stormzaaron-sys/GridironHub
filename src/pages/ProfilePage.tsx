// src/pages/ProfilePage.tsx
import { useState } from 'react';
import {
  Trophy,
  Target,
  Lock,
  Flame,
  Calendar,
  LogOut,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { format } from 'date-fns';
import { cn } from '../utils/cn';
import { NFL_TEAMS, getTeamLogo } from '../utils/nflTeams';
import { supabase } from '../services/supabase';

export function ProfilePage() {
  const { currentUser, leaderboard, picks, logout, updateProfile } = useStore();
  const [isUpdating, setIsUpdating] = useState(false);

  const userEntry = leaderboard.find(e => e.userId === currentUser?.id);
  const safePicks = Array.isArray(picks) ? picks : [];
  const totalPicks = safePicks.filter(p => p.evaluated).length;
  const correctPicks = safePicks.filter(p => p.isCorrect).length;
  const accuracy = totalPicks > 0 ? Math.round((correctPicks / totalPicks) * 100) : 0;

  // ✅ Handle Team Selection with Store Sync
  const handleTeamSelect = async (teamId: string) => {
    if (!currentUser || isUpdating) return;
    setIsUpdating(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ favorite_team: teamId })
        .eq('id', currentUser.id);

      if (error) throw error;
      
      // Update local store so the helmet changes everywhere (Header & Standings) immediately
      updateProfile({ favoriteTeam: teamId }); 
    } catch (err) {
      console.error("Failed to update team:", err);
      alert("Failed to save team selection. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
      logout();
    }
  };

  if (!currentUser) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      
      {/* 1. BROADCAST HEADER - NOW WITH HELMET */}
      <div className="bg-white border-t-4 border-[#CC0000] shadow-sm overflow-hidden">
        <div className="p-6 flex items-center justify-between gap-6">
          
          <div className="flex-1">
            <h2 className="text-5xl font-display font-black text-[#111111] uppercase italic tracking-tighter leading-none">
              {currentUser.username}
            </h2>
            <div className="flex items-center gap-4 mt-3">
              <span className="flex items-center gap-1 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <Calendar size={12} className="text-[#CC0000]" />
                Joined {format(new Date(currentUser.joinDate), 'MMM yyyy')}
              </span>
              <span className="bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-600 uppercase italic">
                {currentUser.role}
              </span>
            </div>
          </div>

          {/* ✅ Display Current Helmet in Header */}
          <div className="relative group">
             <div className={cn(
               "w-20 h-20 rounded-full border-2 flex items-center justify-center shadow-inner overflow-hidden transition-all bg-gray-50 border-gray-100",
               isUpdating && "opacity-50"
             )}>
                <img 
                  src={getTeamLogo(currentUser.favoriteTeam || 'NFL')} 
                  className={cn("w-14 h-14 object-contain transition-transform", isUpdating && "animate-pulse scale-90")}
                  alt="Current Team"
                />
             </div>
          </div>

          <button 
            onClick={handleLogout}
            className="text-gray-300 hover:text-[#CC0000] transition-colors p-2 self-start"
            title="Log Out"
          >
            <LogOut size={24} />
          </button>
        </div>

        {userEntry && (
          <div className="grid grid-cols-3 border-t border-gray-100 bg-[#F6F6F6]">
            <div className="p-4 text-center border-r border-gray-200">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-tight">Global Rank</p>
              <p className="text-2xl font-display font-black text-[#111111] italic">#{userEntry.rank || '--'}</p>
            </div>
            <div className="p-4 text-center border-r border-gray-200">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-tight">Total Pts</p>
              <p className="text-2xl font-display font-black text-[#111111] italic">{userEntry.totalPoints || 0}</p>
            </div>
            <div className="p-4 text-center">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-tight">Win %</p>
              <p className="text-2xl font-display font-black text-[#CC0000] italic">{accuracy}%</p>
            </div>
          </div>
        )}
      </div>

      {/* 2. TEAM AFFILIATION - FRANCHISE PICKER */}
      <section>
        <div className="bg-[#111111] py-1.5 px-4 mb-[1px] flex justify-between items-center">
          <h3 className="text-[11px] font-display font-black text-white uppercase italic tracking-widest">
            Select Your Franchise
          </h3>
          <span className="text-[9px] font-black text-[#CC0000] uppercase tracking-tighter">Official Helmet Registry</span>
        </div>
        
        <div className="bg-white border border-gray-200 p-4">
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide no-scrollbar snap-x">
            {NFL_TEAMS.map((team) => (
              <button
                key={team.id}
                disabled={isUpdating}
                onClick={() => handleTeamSelect(team.id)}
                className={cn(
                  "flex-shrink-0 w-20 flex flex-col items-center gap-2 p-2 transition-all snap-center rounded-xl",
                  currentUser.favoriteTeam === team.id 
                    ? "bg-red-50 border-2 border-[#CC0000] scale-105 shadow-md" 
                    : "opacity-40 hover:opacity-100 grayscale hover:grayscale-0"
                )}
              >
                <img 
                  src={getTeamLogo(team.id)} 
                  alt={team.name}
                  className="w-12 h-12 object-contain"
                />
                <span className="text-[8px] font-black text-[#111111] uppercase tracking-tighter text-center line-clamp-1">
                  {team.name}
                </span>
                {currentUser.favoriteTeam === team.id && (
                   <ShieldCheck size={12} className="text-[#CC0000]" />
                )}
              </button>
            ))}
          </div>
          <p className="text-center text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-2 border-t pt-2 italic">
            Swipe to view all 32 teams
          </p>
        </div>
      </section>

      {/* 3. SEASON DASHBOARD */}
      <section>
        <div className="bg-[#111111] py-1 px-4 mb-[1px]">
          <h3 className="text-[11px] font-display font-black text-white uppercase italic tracking-widest">
            2026 Season Analysis
          </h3>
        </div>
        
        <div className="grid grid-cols-2 gap-[1px] bg-gray-200 border border-gray-200">
          <ProfileStat label="Games Picked" value={totalPicks} icon={Target} />
          <ProfileStat label="Correct" value={correctPicks} icon={Trophy} />
          <ProfileStat label="Lock Efficiency" value={`${accuracy}%`} icon={Lock} />
          <ProfileStat label="Current Streak" value={userEntry?.streak || 0} icon={Flame} isHot={(userEntry?.streak ?? 0) >= 3} />
        </div>
      </section>

      {/* 4. CAREER MILESTONES */}
      <section>
        <div className="bg-[#111111] py-1 px-4 mb-[1px]">
          <h3 className="text-[11px] font-display font-black text-white uppercase italic tracking-widest">
            Career History
          </h3>
        </div>
        <div className="bg-white border border-gray-200 divide-y divide-gray-100">
          <CareerRow label="Total Career Points" value={userEntry?.totalPoints || 0} />
          <CareerRow label="Seasons Active" value="1" />
          <CareerRow label="All-Time Best Rank" value={`#${userEntry?.rank || '--'}`} />
        </div>
      </section>

      <button
        onClick={handleLogout}
        className="w-full md:hidden py-4 bg-white border border-gray-200 text-[#CC0000] font-display font-black uppercase italic text-sm flex items-center justify-center gap-2"
      >
        <LogOut size={18} />
        Log Out of GridironHub
      </button>
    </div>
  );
}

/* HELPER COMPONENTS */

function ProfileStat({ label, value, icon: Icon, isHot }: any) {
  return (
    <div className="bg-white p-4 flex flex-col items-center justify-center text-center">
      <Icon size={16} className={cn("mb-2", isHot ? "text-orange-500" : "text-gray-300")} />
      <p className="text-[9px] font-black text-gray-400 uppercase tracking-tight mb-1">{label}</p>
      <p className="text-xl font-display font-black text-[#111111] uppercase italic">{value}</p>
    </div>
  );
}

function CareerRow({ label, value }: { label: string, value: string | number }) {
  return (
    <div className="flex justify-between items-center p-4">
      <span className="text-[11px] font-black text-gray-500 uppercase tracking-tighter">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-display font-black text-[#111111] italic uppercase">{value}</span>
        <ChevronRight size={14} className="text-gray-300" />
      </div>
    </div>
  );
}