// src/pages/NewsPage.tsx (Updated)
import { useEffect, useState } from 'react';
import { 
  RefreshCw, 
  Newspaper, 
  Filter,
  Wifi,
  ChevronRight
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useStore } from '../store/useStore';
import { NewsCard } from '../components/NewsCard';
import { cn } from '../utils/cn';

// Simplified types
type NewsFilter = 'all' | 'headlines';

export function NewsPage() {
  const { news, refreshNews, isLoading, lastSync, isPolling } = useStore();
  const [filter, setFilter] = useState<NewsFilter>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    refreshNews(false);
  }, [refreshNews]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshNews(true);
    setIsRefreshing(false);
  };

  const safeFormatDistance = (dateValue: any) => {
    if (!dateValue) return 'Recently';
    try {
      const d = new Date(dateValue);
      return isNaN(d.getTime()) ? 'Recently' : formatDistanceToNow(d, { addSuffix: true });
    } catch { return 'Recently'; }
  };

  // Featured and Sidebar logic
  const featuredStory = news[0];
  const secondaryStories = news.slice(1, 5);
  const remainingStories = news.slice(5);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b-4 border-[#111111] pb-2 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#CC0000] text-white text-[10px] font-black px-2 py-0.5 uppercase italic tracking-widest">Live Feed</span>
            {isPolling && (
              <span className="flex items-center gap-1 text-green-600 text-[10px] font-black uppercase tracking-widest">
                <Wifi size={10} className="animate-pulse" /> Signal Active
              </span>
            )}
          </div>
          <h1 className="text-5xl font-display font-black text-[#111111] uppercase italic tracking-tighter leading-none">
            NFL Newsroom
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Last Sync</p>
            <p className="text-xs font-bold text-[#111111] uppercase mt-1">
              {safeFormatDistance(lastSync)}
            </p>
          </div>
          <button onClick={handleRefresh} className="p-3 bg-white border border-gray-200 shadow-sm">
            <RefreshCw size={20} className={cn((isLoading || isRefreshing) && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* 2. CATEGORY TABS (Removed Video) */}
      <div className="flex items-center gap-[1px] bg-gray-200 border border-gray-200 shadow-sm">
        <button className="flex-1 flex items-center justify-center gap-2 py-4 bg-[#111111] text-white font-black text-[11px] uppercase italic tracking-widest">
          <Newspaper size={14} className="text-[#CC0000]" />
          All Headlines
        </button>
        <div className="flex-1 bg-white hidden md:flex items-center justify-center text-gray-300 text-[10px] font-black uppercase tracking-widest italic">
          Broadcast Coverage 2026
        </div>
      </div>

      {/* 3. GRID */}
      {news.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-8">
            {featuredStory && <NewsCard item={featuredStory} featured />}
            <div className="grid sm:grid-cols-2 gap-4">
              {secondaryStories.map(item => <NewsCard key={item.id} item={item} />)}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-gray-200">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                <span className="text-[10px] font-black text-[#111111] uppercase italic tracking-widest">The Wire</span>
                <ChevronRight size={14} className="text-[#CC0000]" />
              </div>
              <div className="divide-y divide-gray-100">
                {remainingStories.slice(0, 10).map((item) => (
                  <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" className="p-4 block hover:bg-gray-50 group">
                    <p className="text-xs font-bold text-[#111111] uppercase leading-tight group-hover:text-[#CC0000]">
                      {item.title}
                    </p>
                    <p className="text-[9px] font-black text-gray-400 uppercase mt-2 italic">
                      {safeFormatDistance(item.timestamp)}
                    </p>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-20 text-center border-2 border-dashed border-gray-200">
          <p className="font-black text-gray-400 uppercase tracking-widest">No Headlines Found</p>
        </div>
      )}
    </div>
  );
}