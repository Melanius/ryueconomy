"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useGlobalState } from '@/contexts/GlobalStateContext';
import { NavCategoryId } from '@/contexts/GlobalStateContext';
import { categories } from '@/config/categories';
import { useEffect } from 'react';

const CategoryNav: React.FC = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { selectedCategory, setSelectedCategory } = useGlobalState();

  // 카테고리 내비게이션은 메인 페이지와 블로그 페이지에서만 표시
  if (pathname !== "/" && pathname !== "/blog") {
    return null;
  }

  // 전역 상태 업데이트
  useEffect(() => {
    console.log("CategoryNav: 전역 상태 업데이트", { selectedCategory, searchParamCategory: searchParams.get("category") });
    const searchParamCategory = searchParams.get("category") as NavCategoryId | null;
    
    if (searchParamCategory && searchParamCategory !== selectedCategory) {
      setSelectedCategory(searchParamCategory as NavCategoryId);
    }
  }, [searchParams, selectedCategory, setSelectedCategory]);

  const handleCategoryClick = (categoryId: NavCategoryId) => {
    console.log("CategoryNav: 카테고리 클릭", { categoryId });
    setSelectedCategory(categoryId);
  };

  return (
    <nav className="mb-8 sticky top-0 z-10 px-4 py-2 -mx-4 bg-white/80 backdrop-blur-sm dark:bg-black/80 rounded-lg">
      <ul className="flex overflow-x-auto whitespace-nowrap py-2 space-x-3 scrollbar-hide">
        {categories.map((category) => {
          const isActive = selectedCategory === category.id;
          const Icon = category.icon;
          
          return (
            <li key={category.id} className="flex-none">
              <Link 
                href={category.id === 'all' ? '/' : `/category/${category.id}`}
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                  isActive 
                    ? 'bg-gray-800 text-white dark:bg-white dark:text-gray-900'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
                onClick={(e) => {
                  if (category.id === selectedCategory) {
                    e.preventDefault();
                    return;
                  }
                  console.log(`카테고리 클릭: ${category.id}, 라벨: ${category.label}`);
                  handleCategoryClick(category.id as NavCategoryId);
                }}
              >
                <Icon className="h-4 w-4 mr-1.5" />
                <span>{category.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default CategoryNav; 