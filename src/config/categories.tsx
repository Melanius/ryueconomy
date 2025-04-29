import React from 'react';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  BriefcaseIcon,
  CodeBracketIcon,
  PencilIcon,
  SparklesIcon,
  BookOpenIcon,
  NewspaperIcon,
  RocketLaunchIcon,
  Squares2X2Icon,
  MoonIcon,
  LightBulbIcon,
  WalletIcon,
  BeakerIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { CategoryId } from '@/types/notion';

// Define the Category interface
interface Category {
  id: CategoryId | 'all';
  label: string;
  icon: React.ElementType;
  color: string;
  description?: string;
  emoji?: string;
  shortDesc?: string;
}

// Define categories array with new category system
export const categories: Category[] = [
  {
    id: 'all',
    label: '전체',
    icon: Squares2X2Icon,
    color: 'text-gray-500',
    description: '모든 카테고리의 글을 확인할 수 있습니다.',
    shortDesc: '모든 컨텐츠'
  },
  {
    id: 'crypto-morning',
    label: '크립토 모닝',
    icon: MoonIcon,
    color: '#E03E3E',
    description: '매일 아침 제공되는 암호화폐 시장 브리핑',
    shortDesc: '암호화폐 시장 모닝 브리핑'
  },
  {
    id: 'invest-insight',
    label: '투자 인사이트',
    icon: LightBulbIcon,
    color: '#FF9F43',
    description: '투자 관련 분석과 인사이트',
    shortDesc: '투자 분석 및 인사이트'
  },
  {
    id: 'real-portfolio',
    label: '실전 포트폴리오',
    icon: WalletIcon,
    color: '#0B6BCB',
    description: '실제 투자 포트폴리오와 성과 분석',
    shortDesc: '실제 포트폴리오 분석'
  },
  {
    id: 'code-lab',
    label: '코드 랩',
    icon: CodeBracketIcon,
    color: '#0F9D58',
    description: '개발 관련 정보와 튜토리얼',
    shortDesc: '개발 및 코딩 관련'
  },
  {
    id: 'daily-log',
    label: '일상 기록',
    icon: CalendarIcon,
    color: '#F5C400',
    description: '일상적인 기록과 생각',
    shortDesc: '일상 기록 및 생각'
  }
];

// Utility function to get a category label by ID
export function getCategoryLabel(categoryId: CategoryId | 'all'): string {
  if (categoryId === 'all') return '전체';
  const category = categories.find(cat => cat.id === categoryId);
  return category?.label || '기타';
}

// Utility function to get a category color by ID
export function getCategoryColor(categoryId: CategoryId | 'all'): string {
  const category = categories.find(cat => cat.id === categoryId);
  return category?.color || 'text-gray-500';
}

// Utility function to get a category icon by ID
export function getCategoryIcon(categoryId: CategoryId | 'all'): React.ElementType {
  const category = categories.find(cat => cat.id === categoryId);
  return category?.icon || Squares2X2Icon;
}

// Utility function to get a complete category by ID
export function getCategory(categoryId: CategoryId): Category | undefined {
  return categories.find(cat => cat.id === categoryId);
}

// Utility function to get a category gradient by ID
export function getCategoryGradient(categoryId: CategoryId | 'all'): string {
  if (categoryId === 'all') return 'from-gray-400 to-gray-600';
  
  switch(categoryId) {
    case 'crypto-morning':
      return 'from-red-500 to-red-700';
    case 'invest-insight':
      return 'from-orange-400 to-orange-600';
    case 'real-portfolio':
      return 'from-blue-500 to-blue-700';
    case 'code-lab':
      return 'from-green-500 to-green-700';
    case 'daily-log':
      return 'from-yellow-500 to-yellow-400';
    default:
      return 'from-gray-500 to-gray-700';
  }
} 