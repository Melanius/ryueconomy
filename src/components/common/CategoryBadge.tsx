import React from 'react';
import { NavCategoryId } from '@/contexts/GlobalStateContext';
import CategoryIcon from './CategoryIcon';
import { getCategoryLabel } from '@/config/categories';

interface CategoryBadgeProps {
  category: NavCategoryId;
  showIcon?: boolean;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

// 카테고리별 배경색 매핑
const CategoryColorMap: Record<NavCategoryId, string> = {
  'all': 'bg-gray-500 text-white',
  'crypto-morning': 'bg-yellow-500 text-white',
  'invest-insight': 'bg-blue-500 text-white',
  'real-portfolio': 'bg-green-500 text-white',
  'code-lab': 'bg-purple-500 text-white',
  'daily-log': 'bg-red-500 text-white'
};

export default function CategoryBadge({ 
  category, 
  showIcon = true, 
  showLabel = true,
  size = 'md' 
}: CategoryBadgeProps) {
  console.log(`카테고리 배지 렌더링: category=${category}, size=${size}`);

  // 사이즈별 스타일 설정
  const sizeClasses = {
    'sm': 'text-xs py-0.5 px-1.5',
    'md': 'text-sm py-1 px-2',
    'lg': 'text-base py-1.5 px-3'
  };

  return (
    <span className={`inline-flex items-center rounded-full ${CategoryColorMap[category]} ${sizeClasses[size]}`}>
      {showIcon && <CategoryIcon category={category} size={size === 'sm' ? 12 : size === 'md' ? 16 : 20} className="mr-1" />}
      {showLabel && <span>{getCategoryLabel(category)}</span>}
    </span>
  );
}
