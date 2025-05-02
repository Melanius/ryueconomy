"use client";

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { categories } from "@/config/categories";
import { NavCategoryId } from '@/contexts/GlobalStateContext';
import { categoryColors } from '@/styles/category-colors';
import { CategoryId } from '@/types/notion';

// Hex color to rgba converter
const hexToRgba = (hex: string, alpha: number = 1) => {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Parse hex values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Return rgba color string
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// 간단하게 배경색 클래스를 반환합니다
const getBgClass = (categoryId: NavCategoryId): string => {
  if (!categoryId) return 'bg-gray-500';
  
  // 각 카테고리 ID에 맞는 CSS 색상 반환
  const color = (categoryId: NavCategoryId): string => {
    switch(categoryId) {
      case 'all': return 'linear-gradient(90deg, #A78BFA, #EC4899)';
      case 'crypto-morning': return 'linear-gradient(90deg, #E03E3E, #e05e5e)';
      case 'invest-insight': return 'linear-gradient(90deg, #FF9F43, #ffb976)';
      case 'real-portfolio': return 'linear-gradient(90deg, #0B6BCB, #3c8de0)';
      case 'code-lab': return 'linear-gradient(90deg, #0F9D58, #35c278)';
      case 'daily-log': return 'linear-gradient(90deg, #F5C400, #FFD700)';
      default: return 'linear-gradient(90deg, #3B82F6, #60a5fa)';
    }
  };
  
  return color(categoryId);
};

interface CategoryTabsProps {
  displayCategory: NavCategoryId;
  setDisplayCategory: (category: NavCategoryId) => void;
  showCategorySummary?: boolean;
  categoryPostCounts?: Partial<Record<string, number>>;
}

export default function CategoryTabs({
  displayCategory,
  setDisplayCategory,
  showCategorySummary = true,
  categoryPostCounts = {},
}: CategoryTabsProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  return (
    <div className="relative mb-4">
      {/* 모바일 뷰 */}
      <div className="block sm:hidden overflow-x-auto pb-2">
        <div className="flex space-x-2 px-4">
          {categories.map((category) => {
            const isActive = displayCategory === category.id;
            const count = categoryPostCounts?.[category.id] || 0;
            
            return (
              <button
              key={category.id}
              onClick={() => setDisplayCategory(category.id as NavCategoryId)}
              className={cn(
              'flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
              isActive ? 'text-white shadow-sm' : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700'
              )}
              style={isActive ? { backgroundImage: getBgClass(category.id as NavCategoryId), backgroundSize: '100% 100%' } : {}}
                aria-current={isActive ? 'page' : undefined}
                data-category={category.id}
              >
                <div className="flex items-center">
                  <category.icon className="h-4 w-4 mr-1.5" />
                  <span>{category.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 데스크톱 뷰 */}
      <div className="hidden sm:flex flex-row justify-center">
        <div className="flex rounded-full bg-zinc-100 p-1 text-zinc-500 dark:bg-zinc-800/90 dark:text-zinc-400">
          <div className="flex space-x-1">
            {categories.map((item) => {
              const isActive = displayCategory === item.id;
              const isHovered = hoveredCategory === item.id;
              const count = categoryPostCounts?.[item.id] || 0;
              const bgClass = getBgClass(item.id as NavCategoryId);
              
              return (
                <TooltipProvider key={item.id}>
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setDisplayCategory(item.id as NavCategoryId)}
                        onMouseEnter={() => setHoveredCategory(item.id)}
                        onMouseLeave={() => setHoveredCategory(null)}
                        className={cn(
                          'flex h-8 items-center gap-2 rounded-full px-3 text-sm font-medium transition-all duration-200 ease-in-out',
                          isActive ? 'text-white shadow-sm' : '',
                          isHovered && !isActive ? 'text-white' : '',
                          !isActive && !isHovered ? 'hover:bg-zinc-200 dark:hover:bg-zinc-700' : ''
                        )}
                        style={(isActive || isHovered) ? {
                          backgroundImage: getBgClass(item.id as NavCategoryId),
                          backgroundSize: '100% 100%'
                        } : {}}
                        aria-current={isActive ? 'page' : undefined}
                        data-category={item.id}
                      >
                        <div className="flex items-center">
                          <item.icon className="h-4 w-4 mr-1.5" />
                          <span className="flex items-center gap-1">
                            {item.label}
                          </span>
                        </div>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-white dark:bg-zinc-800 border dark:border-zinc-700">
                      <div className="flex flex-col gap-1 p-1">
                        <div className="flex items-center gap-2">
                          <span role="img" aria-label={item.description}>
                            {item.emoji}
                          </span>
                          <span className="font-medium">{item.label}</span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {item.description}
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
} 