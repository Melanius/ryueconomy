import React from 'react';
import { NavCategoryId } from '@/contexts/GlobalStateContext';
import { 
  FaBitcoin, FaChartLine, FaBriefcase, 
  FaCode, FaBookOpen, FaGlobe 
} from 'react-icons/fa';

interface CategoryIconProps {
  category: NavCategoryId;
  size?: number;
  className?: string;
}

// 카테고리별 아이콘 매핑
const categoryIcons = {
  'all': FaGlobe,
  'crypto-morning': FaBitcoin,
  'invest-insight': FaChartLine,
  'real-portfolio': FaBriefcase,
  'code-lab': FaCode,
  'daily-log': FaBookOpen
};

export default function CategoryIcon({ category, size = 20, className = '' }: CategoryIconProps) {
  console.log(`CategoryIcon 렌더링: category=${category}, size=${size}`);
  
  const IconComponent = categoryIcons[category];
  
  if (!IconComponent) {
    console.warn(`알 수 없는 카테고리 아이콘: ${category}`);
    return null;
  }
  
  return <IconComponent size={size} className={className} />;
} 