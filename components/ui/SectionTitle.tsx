'use client';

import { cn } from '@/lib/utils';

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  alignment?: 'left' | 'center' | 'right';
  className?: string;
  light?: boolean;
}

export function SectionTitle({
  title,
  subtitle,
  alignment = 'center',
  className,
  light = false
}: SectionTitleProps) {
  return (
    <div 
      className={cn(
        "mb-12 md:mb-16",
        alignment === 'center' && "text-center",
        alignment === 'right' && "text-right",
        className
      )}
    >
      {subtitle && (
        <div
         
         
         
          className={cn(
            "text-sm font-bold tracking-widest uppercase mb-3",
            light ? "text-[#c20000]/60" : "text-[#c20000]"
          )}
        >
          {subtitle}
        </div>
      )}
      
      <h2
       
       
       
       
        className={cn(
          "text-3xl md:text-4xl lg:text-5xl font-bold mb-6",
          light ? "text-white" : "text-[#0f172a]"
        )}
        style={{ fontFamily: 'var(--font-poppins), sans-serif' }}
      >
        {title}
      </h2>

      <div
       
       
       
       
        className={cn(
          "h-1 rounded-full",
          alignment === 'center' && "mx-auto w-24",
          alignment === 'right' && "ml-auto w-24",
          alignment === 'left' && "w-24",
          light 
            ? "bg-white/20" 
            : "bg-gradient-to-r from-imm-red-600 to-imm-red-400"
        )}
      />
    </div>
  );
}
