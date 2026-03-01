// Main Layout Component with Navigation - GridironHub ESPN Theme
import { Link, useLocation } from 'react-router-dom';
import { Home, ListChecks, Trophy, Newspaper, User, Shield, Calendar } from 'lucide-react';
import { useStore } from '../store/useStore';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { currentUser, season } = useStore();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/picks', icon: ListChecks, label: 'Picks' },
    { path: '/leaderboard', icon: Trophy, label: 'Standings' },
    { path: '/playoffs', icon: Calendar, label: 'Playoffs' },
    { path: '/news', icon: Newspaper, label: 'News' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  if (currentUser?.role === 'admin') {
    navItems.push({ path: '/admin', icon: Shield, label: 'Admin' });
  }

  return (
    <div className="min-h-screen bg-[#F3F4F7]">
      {/* Header - ESPN Style White with Red Border */}
      <header className="sticky top-0 z-50 bg-white border-b-[3px] border-[#CC0000] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo & Branding */}
            <div className="flex items-center gap-3">
              {/* Logo Icon - Modern Football */}
              <div className="w-10 h-10 rounded-lg bg-[#CC0000] flex items-center justify-center shadow-md">
                <svg 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  className="w-6 h-6 text-white"
                  stroke="currentColor" 
                  strokeWidth="2"
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <ellipse cx="12" cy="12" rx="9" ry="5" />
                  <path d="M12 7v10" />
                  <path d="M9 9l6 6" />
                  <path d="M15 9l-6 6" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#CC0000] font-display tracking-tight">
                  GridironHub
                </h1>
                {season && (
                  <p className="text-xs text-[#4A4A4A] font-medium">
                    {season.year} Season • Week {season.currentWeek ?? season.current_week}
                  </p>
                )}
              </div>
            </div>
            
            {/* User Avatar */}
            {currentUser && (
              <Link 
                to="/profile" 
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#CC0000] flex items-center justify-center shadow-sm">
                  <span className="text-white font-semibold text-sm font-display">
                    {currentUser.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="hidden sm:block text-sm font-semibold text-[#111111]">
                  {currentUser.username}
                </span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 pb-28">
        {children}
      </main>

      {/* Bottom Navigation - Light Theme */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <div className="max-w-7xl mx-auto px-2">
          <div className="flex justify-around items-center py-2 pb-safe">
            {navItems.slice(0, 6).map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                    isActive
                      ? 'text-[#CC0000]'
                      : 'text-[#6B7280] hover:text-[#111111] hover:bg-gray-100'
                  }`}
                >
                  <Icon 
                    size={22} 
                    strokeWidth={isActive ? 2.5 : 2}
                    className={isActive ? 'drop-shadow-sm' : ''}
                  />
                  <span className={`text-xs font-display uppercase tracking-wide ${
                    isActive ? 'font-bold' : 'font-medium'
                  }`}>
                    {item.label}
                  </span>
                  {/* Active Indicator Dot */}
                  {isActive && (
                    <div className="absolute -bottom-0.5 w-1 h-1 bg-[#CC0000] rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Admin Tab - Shows separately if admin */}
        {currentUser?.role === 'admin' && (
          <div className="absolute -top-12 right-4">
            <Link
              to="/admin"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg transition-all ${
                location.pathname === '/admin'
                  ? 'bg-[#1E293B] text-white'
                  : 'bg-white text-[#1E293B] border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Shield size={16} />
              <span className="text-xs font-display font-bold uppercase">Admin</span>
            </Link>
          </div>
        )}
      </nav>
    </div>
  );
}