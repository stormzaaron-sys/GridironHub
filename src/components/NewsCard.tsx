import { useState, useEffect } from 'react';
import { Play, Clock, X, Newspaper, PlayCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { NewsItem } from '../models/types';
import { cn } from '../utils/cn';

interface NewsCardProps {
  item: NewsItem;
  compact?: boolean;
  featured?: boolean;
}

const getSafeTimeAgo = (timestamp: string | undefined | null) => {
  if (!timestamp) return 'Recently';
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return 'Recently';
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return 'Recently';
  }
};

export function NewsCard({ item, compact = false, featured = false }: NewsCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [imageError, setImageError] = useState(false);

  const hasVideo = item.type === 'video' || !!item.videoUrl;
  const hasImage = item.imageUrl && !imageError;

  const handleClick = () => setShowModal(true);
  const timeAgo = getSafeTimeAgo(item.timestamp);

  // ============ COMPACT VERSION (for home/sidebar) ============
  if (compact) {
    return (
      <>
        <button
          onClick={handleClick}
          className="w-full flex items-center gap-3 p-3 bg-white border border-gray-200 hover:border-[#CC0000] transition-all group text-left shadow-sm"
        >
          <div className="relative flex-shrink-0 w-20 h-14 bg-gray-100 overflow-hidden">
            {hasImage ? (
              <img src={item.imageUrl} alt="" className="w-full h-full object-cover" onError={() => setImageError(true)} />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-50">
                <Newspaper size={16} className="text-gray-300" />
              </div>
            )}
            {hasVideo && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <PlayCircle size={16} className="text-white fill-[#CC0000]" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            {/* FORCE text-[#111111] to ensure it shows against white background */}
            <p className="text-[#111111] font-black text-[11px] uppercase italic leading-tight line-clamp-2 group-hover:text-[#CC0000]">
              {item.title}
            </p>
            <span className="text-[9px] font-bold text-gray-400 uppercase mt-1 block tracking-tighter">{timeAgo}</span>
          </div>
        </button>
        {showModal && <NewsModal item={item} onClose={() => setShowModal(false)} />}
      </>
    );
  }

  // ============ FEATURED LARGE CARD (MSU THOMPSON FIX) ============
  if (featured) {
    return (
      <>
        <button onClick={handleClick} className="w-full relative group text-left border-b-8 border-[#CC0000] overflow-hidden bg-black">
          <div className="aspect-[21/9] relative">
            {hasImage ? (
              <img src={item.imageUrl} alt="" className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" />
            ) : (
              <div className="w-full h-full bg-[#111111]" />
            )}
            {/* The Gradient ensures contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-[#CC0000] text-white text-[10px] font-black px-2 py-0.5 uppercase italic tracking-[0.2em]">
                  {item.category || 'Lead Story'}
                </span>
                {hasVideo && <span className="bg-white text-black text-[10px] font-black px-2 py-0.5 uppercase italic">Analysis Video</span>}
              </div>
              
              {/* VITAL FIX: Added headline-visible class and inline style white force */}
              <h2 
                style={{ color: 'white' }}
                className="headline-visible text-3xl md:text-5xl font-display font-black text-white uppercase italic tracking-tighter leading-[0.9] group-hover:text-gray-200"
              >
                {item.title}
              </h2>
              
              <p className="text-gray-300 text-sm mt-4 font-bold uppercase tracking-widest flex items-center gap-2">
                <Clock size={14} className="text-[#CC0000]" /> {timeAgo} — {item.source}
              </p>
            </div>
          </div>
        </button>
        {showModal && <NewsModal item={item} onClose={() => setShowModal(false)} />}
      </>
    );
  }

  // ============ DEFAULT CARD STYLE ============
  return (
    <>
      <button onClick={handleClick} className="w-full bg-white border border-gray-200 group text-left hover:border-black transition-all">
        <div className="relative aspect-video bg-gray-100 overflow-hidden">
          {hasImage ? (
            <img src={item.imageUrl} alt="" className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50"><Newspaper size={32} className="text-gray-200" /></div>
          )}
          {hasVideo && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
              <div className="bg-[#CC0000] p-3 text-white transform group-hover:scale-110 transition-transform">
                <Play size={20} className="fill-current" />
              </div>
            </div>
          )}
          <div className="absolute top-0 left-0 bg-[#111111] text-white text-[9px] font-black px-2 py-1 uppercase italic tracking-widest z-10">
            {item.category || 'NFL'}
          </div>
        </div>

        <div className="p-4">
          <h3 className="text-lg font-display font-black text-[#111111] uppercase italic tracking-tighter leading-tight group-hover:text-[#CC0000]">
            {item.title}
          </h3>
          <p className="text-xs text-gray-500 font-bold uppercase mt-3 tracking-tighter flex items-center justify-between">
            <span>{timeAgo}</span>
            <span className="text-[#CC0000]">{item.source}</span>
          </p>
        </div>
      </button>
      {showModal && <NewsModal item={item} onClose={() => setShowModal(false)} />}
    </>
  );
}

// ============ NEWS MODAL (BROADCAST TAKEOVER) ============

function NewsModal({ item, onClose }: { item: NewsItem; onClose: () => void }) {
  const hasVideo = item.type === 'video' || !!item.videoUrl;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#111111]/95 backdrop-blur-md p-0 md:p-8" onClick={onClose}>
      <div className="relative w-full max-w-5xl bg-white h-full md:h-auto max-h-screen md:max-h-[90vh] overflow-hidden flex flex-col border-t-8 border-[#CC0000]" onClick={e => e.stopPropagation()}>
        
        {/* Header Bar */}
        <div className="bg-[#111111] text-white px-6 py-3 flex justify-between items-center shrink-0">
          <span className="text-[10px] font-black uppercase italic tracking-[0.3em] text-white">ESPN Full Coverage</span>
          <button onClick={onClose} className="text-white hover:text-[#CC0000] transition-colors"><X size={24} /></button>
        </div>

        <div className="overflow-y-auto">
          {/* Visual Header */}
          {hasVideo && item.videoUrl ? (
            <div className="aspect-video bg-black">
              <video src={item.videoUrl} controls autoPlay className="w-full h-full" poster={item.imageUrl} />
            </div>
          ) : (
            <div className="h-48 md:h-80 relative bg-black">
              {item.imageUrl && <img src={item.imageUrl} className="w-full h-full object-cover opacity-60" />}
              <div className="absolute inset-0 flex flex-col justify-end p-8 bg-gradient-to-t from-white via-transparent to-transparent">
                 <span className="bg-[#CC0000] text-white text-xs font-black px-3 py-1 uppercase italic w-fit mb-2 tracking-widest">
                    Breaking
                 </span>
              </div>
            </div>
          )}

          {/* Article Body */}
          <div className="p-8 md:p-12">
            <h1 className="text-4xl md:text-6xl font-display font-black text-[#111111] uppercase italic tracking-tighter leading-[0.85] mb-6">
              {item.title}
            </h1>

            <div className="flex items-center gap-4 border-y border-gray-100 py-4 mb-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <span>By {item.author || 'ESPN Staff'}</span>
              <span className="text-[#CC0000]">•</span>
              <span>{getSafeTimeAgo(item.timestamp)}</span>
            </div>

            <div className="prose prose-slate max-w-none">
              <p className="text-xl font-bold text-[#111111] italic leading-snug border-l-4 border-[#CC0000] pl-6 mb-8">
                {item.description}
              </p>
              {item.content && (
                <div className="text-gray-700 leading-relaxed text-lg" dangerouslySetInnerHTML={{ __html: item.content }} />
              )}
            </div>

            <div className="mt-12 flex flex-col sm:flex-row gap-4">
              <a href={item.url} target="_blank" rel="noopener noreferrer" 
                 className="flex-1 bg-[#CC0000] text-white py-4 px-8 text-center font-display font-black uppercase italic tracking-tighter text-xl hover:bg-black transition-all">
                Read Full Story on ESPN.com
              </a>
              <button onClick={onClose} className="px-8 py-4 border-2 border-black font-black uppercase italic tracking-tighter hover:bg-gray-100 text-black">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}