import { CategoryId } from '@/types/notion';

interface CategoryColors {
  bg: string;    // 배경색 클래스
  text: string;  // 텍스트색 클래스
  hover: string; // 호버 효과 클래스
  border: string; // 테두리 색상 클래스
  icon: string;  // 아이콘 색상
  gradient: {    // 그라데이션 색상
    from: string;
    to: string;
  };
}

type CategoryColorMap = Record<CategoryId, CategoryColors>;

export const categoryColors: CategoryColorMap = {
  'crypto-morning': {
    bg: 'bg-red-100',
    text: 'text-red-700',
    hover: 'hover:bg-red-200',
    border: 'border-red-300',
    icon: 'text-red-600',
    gradient: {
      from: 'from-red-600',
      to: 'to-red-400'
    }
  },
  'invest-insight': {
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    hover: 'hover:bg-orange-200',
    border: 'border-orange-300',
    icon: 'text-orange-600',
    gradient: {
      from: 'from-orange-600',
      to: 'to-amber-400'
    }
  },
  'real-portfolio': {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    hover: 'hover:bg-blue-200',
    border: 'border-blue-300',
    icon: 'text-blue-600',
    gradient: {
      from: 'from-blue-600',
      to: 'to-blue-400'
    }
  },
  'code-lab': {
    bg: 'bg-green-100',
    text: 'text-green-700',
    hover: 'hover:bg-green-200',
    border: 'border-green-300',
    icon: 'text-green-600',
    gradient: {
      from: 'from-green-600',
      to: 'to-emerald-400'
    }
  },
  'daily-log': {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    hover: 'hover:bg-yellow-200',
    border: 'border-yellow-400',
    icon: 'text-yellow-700',
    gradient: {
      from: 'from-yellow-600',
      to: 'to-yellow-400'
    }
  },
  'all': {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    hover: 'hover:bg-gray-200',
    border: 'border-gray-300',
    icon: 'text-gray-600',
    gradient: {
      from: 'from-gray-600',
      to: 'to-gray-400'
    }
  }
};

// 카테고리 레이블 가져오기
export const getCategoryLabel = (category: CategoryId): string => {
  const labelMap: Record<CategoryId, string> = {
    'crypto-morning': '크립토 모닝',
    'invest-insight': '투자 인사이트',
    'real-portfolio': '실전 포트폴리오',
    'code-lab': '코드랩',
    'daily-log': '데일리 로그',
    'all': '전체'
  };
  
  return labelMap[category] || category;
};

// 카테고리별 설명 가져오기
export const getCategoryDescription = (category: CategoryId): string => {
  const descriptionMap: Record<CategoryId, string> = {
    'crypto-morning': '매일 아침 업데이트되는 암호화폐 시장 동향 및 주요 뉴스',
    'invest-insight': '투자 전략, 시장 분석, 경제 트렌드 인사이트',
    'real-portfolio': '실제 투자 포트폴리오 공유 및 성과 분석',
    'code-lab': '개발, 프로그래밍, 기술 관련 글',
    'daily-log': '일상 기록 및 개인적인 생각',
    'all': '모든 카테고리의 글'
  };
  
  return descriptionMap[category] || '';
}; 