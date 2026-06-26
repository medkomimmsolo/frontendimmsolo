'use client';

import { motion } from 'motion/react';
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
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={cn(
            "text-sm font-bold tracking-widest uppercase mb-3",
            light ? "text-[#c20000]/60" : "text-[#c20000]"
          )}
        >
          {subtitle}
        </motion.div>
      )}
      
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className={cn(
          "text-3xl md:text-4xl lg:text-5xl font-bold mb-6",
          light ? "text-white" : "text-[#0f172a]"
        )}
        style={{ fontFamily: 'var(--font-poppins), sans-serif' }}
      >
        {title}
      </motion.h2>

      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        whileInView={{ opacity: 1, scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.5 }}
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
