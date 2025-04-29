'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { CategoryId } from '@/types/notion';

// 네비게이션에서 사용할 카테고리 타입 (all 포함)
export type NavCategoryId = CategoryId | 'all';

// 전역 상태 타입 정의
interface GlobalState {
  selectedCategory: NavCategoryId;
  setSelectedCategory: (category: NavCategoryId) => void;
}

// 기본 상태 값 설정
const defaultState: GlobalState = {
  selectedCategory: 'all',
  setSelectedCategory: () => {},
};

// 컨텍스트 생성
const GlobalStateContext = createContext<GlobalState>(defaultState);

// 컨텍스트 훅
export const useGlobalState = () => useContext(GlobalStateContext);

// 프로바이더 컴포넌트
export const GlobalStateProvider = ({ children }: { children: ReactNode }) => {
  const [selectedCategory, setSelectedCategory] = useState<NavCategoryId>('all');

  const value = {
    selectedCategory,
    setSelectedCategory,
  };

  return (
    <GlobalStateContext.Provider value={value}>
      {children}
    </GlobalStateContext.Provider>
  );
}; 