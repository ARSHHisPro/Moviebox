import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselProps {
  title: string;
  subtitle?: string;
  icon?: React.ElementType;
  actionButton?: React.ReactNode;
  children: React.ReactNode;
}

export const Carousel: React.FC<CarouselProps> = ({ title, subtitle, icon: Icon, actionButton, children }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const scrollAmount = containerRef.current.clientWidth * 0.75;
      containerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="relative my-8">
      
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 mb-5">
        <div>
          <div className="flex items-center gap-3">
            {Icon && <Icon className="w-5 h-5 text-[#00d2ff]" />}
            <h2 className="text-lg sm:text-xl font-bold tracking-tight uppercase text-white flex items-center gap-3">
              {title}
              <div className="h-[2px] w-12 bg-[#00d2ff]" />
            </h2>
          </div>
          {subtitle && <p className="text-xs text-white/50 mt-1 font-medium">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-2">
          {actionButton}
          <div className="hidden sm:flex items-center gap-1.5 ml-2">
            <button
              onClick={() => scroll('left')}
              className="p-2 rounded-full border border-white/5 bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all active:scale-95 cursor-pointer"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2 rounded-full border border-white/5 bg-white/10 text-white hover:bg-white/20 transition-all active:scale-95 cursor-pointer"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex gap-4 overflow-x-auto scrollbar-none px-4 sm:px-6 lg:px-8 py-2 scroll-smooth"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {children}
      </div>
    </section>
  );
};
