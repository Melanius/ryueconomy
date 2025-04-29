"use client";

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import CategoryTabs from './CategoryTabs';
import { NavCategoryId } from '@/contexts/GlobalStateContext';
import { useGlobalState } from '@/contexts/GlobalStateContext';
import { useEffect } from 'react';

interface CategoryTabsWithNavigationProps {
  activeCategory?: NavCategoryId;
  categoryPostCounts?: Partial<Record<string, number>>;
}

export default function CategoryTabsWithNavigation({ 
  activeCategory = 'all',
  categoryPostCounts = {} 
}: CategoryTabsWithNavigationProps) {
  const router = useRouter();
  const pathname = usePathname() || '/';
  const searchParams = useSearchParams();
  
  // 전역 상태 컨텍스트에서 카테고리 상태 가져오기
  const { selectedCategory, setSelectedCategory } = useGlobalState();
  
  // URL에서 카테고리 파라미터 가져오기
  const paramCategory = searchParams?.get("category");
  
  // 실제 사용할 카테고리 결정 (URL 파라미터 우선)
  const displayCategory = (paramCategory || activeCategory) as NavCategoryId;
  
  // URL 파라미터와 전역 상태 동기화
  useEffect(() => {
    // URL 파라미터 또는 활성 카테고리가 변경되면 전역 상태 업데이트
    if (displayCategory !== selectedCategory) {
      setSelectedCategory(displayCategory);
    }
  }, [displayCategory, selectedCategory, setSelectedCategory]);
  
  // 카테고리 변경 시 적절한 URL로 네비게이션
  const handleCategoryChange = (category: NavCategoryId) => {
    // 현재 경로에 따라 기본 URL 결정
    let baseUrl = '/';
    if (pathname.includes('/blog')) {
      baseUrl = '/blog';
    } else if (pathname.includes('/archive')) {
      baseUrl = '/archive';
    }
    
    // 카테고리가 'all'이면 쿼리 파라미터 없이 기본 URL로, 아니면 category 쿼리 파라미터 추가
    const targetUrl = category === 'all' 
      ? baseUrl 
      : `${baseUrl}?category=${category}`;
    
    // 전역 상태 업데이트
    setSelectedCategory(category);
    
    // 라우터가 준비되었을 때만 네비게이션
    if (router) {
      router.push(targetUrl);
    }
  };

  return (
    <CategoryTabs 
      displayCategory={displayCategory} 
      setDisplayCategory={handleCategoryChange}
      showCategorySummary={false}
      categoryPostCounts={categoryPostCounts}
    />
  );
} 