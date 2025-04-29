"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { getCategoryLabel } from '@/styles/category-colors';
import { CategoryId } from '@/types/notion';

export interface FilterOptions {
  category?: CategoryId;
  sortBy?: 'date' | 'views';
  sortOrder?: 'asc' | 'desc';
  year?: string;
  month?: string;
  search?: string;
}

interface PostFiltersProps {
  onFilterChange?: (filters: FilterOptions) => void;
  initialFilters?: FilterOptions;
  className?: string;
  showCategoryFilter?: boolean;
  showSortOptions?: boolean;
  showDateFilters?: boolean;
  showSearchFilter?: boolean;
}

const PostFilters: React.FC<PostFiltersProps> = ({
  onFilterChange,
  initialFilters = {},
  className = "",
  showCategoryFilter = true,
  showSortOptions = true,
  showDateFilters = true,
  showSearchFilter = true
}) => {
  // URL 파라미터 가져오기
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  
  // 필터 상태 초기화
  const [filters, setFilters] = useState<FilterOptions>({
    category: (searchParams.get('category') as CategoryId) || initialFilters.category || 'all',
    sortBy: (searchParams.get('sortBy') as 'date' | 'views') || initialFilters.sortBy || 'date',
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || initialFilters.sortOrder || 'desc',
    year: searchParams.get('year') || initialFilters.year || '',
    month: searchParams.get('month') || initialFilters.month || '',
    search: searchParams.get('search') || initialFilters.search || ''
  });
  
  // 사용 가능한 연도 목록 (최근 5년)
  const currentYear = new Date().getFullYear();
  const availableYears = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());
  
  // 월 목록
  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));

  // 필터 변경 처리
  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    // 월이 선택되었는데 연도가 없으면 현재 연도 자동 선택
    if (key === 'month' && value && !filters.year) {
      setFilters(prev => ({
        ...prev,
        [key]: value,
        year: currentYear.toString()
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        [key]: value
      }));
    }
  };
  
  // URL 파라미터 업데이트
  useEffect(() => {
    // URL 파라미터 구성
    const params = new URLSearchParams();
    
    // 필터 값이 있는 경우에만 파라미터 추가
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });
    
    // 외부 콜백이 있으면 호출
    if (onFilterChange) {
      onFilterChange(filters);
    }
    
    // URL 업데이트 (사용자가 필터 변경 시에만)
    const url = `${pathname}?${params.toString()}`;
    router.push(url, { scroll: false });
    
  }, [filters, pathname, router, onFilterChange]);

  // 필터 초기화
  const handleReset = () => {
    setFilters({
      category: 'all',
      sortBy: 'date',
      sortOrder: 'desc',
      year: '',
      month: '',
      search: ''
    });
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm p-4 ${className}`}>
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div className="space-y-4 w-full">
          <h3 className="text-lg font-semibold">필터 옵션</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 카테고리 필터 */}
            {showCategoryFilter && (
              <div>
                <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-1">
                  카테고리
                </label>
                <select
                  id="category-filter"
                  value={filters.category || 'all'}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="all">전체</option>
                  <option value="crypto-morning">크립토 모닝</option>
                  <option value="invest-insight">투자 인사이트</option>
                  <option value="real-portfolio">실전 포트폴리오</option>
                  <option value="code-lab">코드 랩</option>
                  <option value="daily-log">일상 기록</option>
                </select>
              </div>
            )}
            
            {/* 정렬 옵션 */}
            {showSortOptions && (
              <>
                <div>
                  <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 mb-1">
                    정렬 기준
                  </label>
                  <select
                    id="sort-by"
                    value={filters.sortBy || 'date'}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="date">날짜</option>
                    <option value="views">조회수</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="sort-order" className="block text-sm font-medium text-gray-700 mb-1">
                    정렬 순서
                  </label>
                  <select
                    id="sort-order"
                    value={filters.sortOrder || 'desc'}
                    onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="desc">내림차순</option>
                    <option value="asc">오름차순</option>
                  </select>
                </div>
              </>
            )}
            
            {/* 날짜 필터 */}
            {showDateFilters && (
              <>
                <div>
                  <label htmlFor="year-filter" className="block text-sm font-medium text-gray-700 mb-1">
                    연도
                  </label>
                  <select
                    id="year-filter"
                    value={filters.year || ''}
                    onChange={(e) => handleFilterChange('year', e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="">전체 연도</option>
                    {availableYears.map(year => (
                      <option key={year} value={year}>{year}년</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="month-filter" className="block text-sm font-medium text-gray-700 mb-1">
                    월
                  </label>
                  <select
                    id="month-filter"
                    value={filters.month || ''}
                    onChange={(e) => handleFilterChange('month', e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    disabled={!filters.year}
                  >
                    <option value="">전체 월</option>
                    {months.map(month => (
                      <option key={month} value={month}>
                        {parseInt(month)}월
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
            
            {/* 검색 필터 */}
            {showSearchFilter && (
              <div className={showDateFilters ? 'lg:col-span-3 mt-2' : ''}>
                <label htmlFor="search-filter" className="block text-sm font-medium text-gray-700 mb-1">
                  검색
                </label>
                <div className="flex">
                  <input
                    id="search-filter"
                    type="text"
                    value={filters.search || ''}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="검색어를 입력하세요"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-end">
          <button
            onClick={handleReset}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            필터 초기화
          </button>
        </div>
      </div>
      
      {/* 활성화된 필터 표시 */}
      <div className="mt-4 flex flex-wrap gap-2">
        {filters.category && filters.category !== 'all' && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            카테고리: {getCategoryLabel(filters.category as CategoryId)}
            <button 
              onClick={() => handleFilterChange('category', 'all')} 
              className="ml-1.5 text-blue-400 hover:text-blue-600"
            >
              ✕
            </button>
          </span>
        )}
        
        {filters.sortBy && filters.sortBy !== 'date' && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            정렬: {filters.sortBy === 'views' ? '조회수' : '날짜'}
            <button 
              onClick={() => handleFilterChange('sortBy', 'date')} 
              className="ml-1.5 text-blue-400 hover:text-blue-600"
            >
              ✕
            </button>
          </span>
        )}
        
        {filters.sortOrder && filters.sortOrder !== 'desc' && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            순서: 오름차순
            <button 
              onClick={() => handleFilterChange('sortOrder', 'desc')} 
              className="ml-1.5 text-blue-400 hover:text-blue-600"
            >
              ✕
            </button>
          </span>
        )}
        
        {filters.year && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            연도: {filters.year}년
            <button 
              onClick={() => handleFilterChange('year', '')} 
              className="ml-1.5 text-blue-400 hover:text-blue-600"
            >
              ✕
            </button>
          </span>
        )}
        
        {filters.month && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            월: {parseInt(filters.month)}월
            <button 
              onClick={() => handleFilterChange('month', '')} 
              className="ml-1.5 text-blue-400 hover:text-blue-600"
            >
              ✕
            </button>
          </span>
        )}
        
        {filters.search && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            검색: {filters.search}
            <button 
              onClick={() => handleFilterChange('search', '')} 
              className="ml-1.5 text-blue-400 hover:text-blue-600"
            >
              ✕
            </button>
          </span>
        )}
      </div>
    </div>
  );
};

export default PostFilters;