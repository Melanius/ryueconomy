"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

interface PaginationProps {
  totalItems: number;
  currentPage: number;
  pageSize: number;
  className?: string;
  maxPageButtons?: number;
  showPageSize?: boolean;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  totalItems,
  currentPage,
  pageSize,
  className = "",
  maxPageButtons = 5,
  showPageSize = true,
  onPageChange,
  onPageSizeChange
}) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // 전체 페이지 수 계산
  const totalPages = Math.ceil(totalItems / pageSize);
  
  // 현재 페이지 범위에 맞춰 조정
  const safeCurrentPage = Math.max(1, Math.min(currentPage, totalPages));
  
  // 표시할 페이지 버튼 결정
  const getPageButtons = (): number[] => {
    // 전체 페이지가 최대 버튼 수보다 적으면 모든 페이지 표시
    if (totalPages <= maxPageButtons) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    // 중간 페이지 계산
    const middlePoint = Math.floor(maxPageButtons / 2);
    
    // 시작 페이지 계산
    let startPage = safeCurrentPage - middlePoint;
    
    // 시작 페이지가 1보다 작으면 1로 조정
    if (startPage < 1) {
      startPage = 1;
    }
    
    // 끝 페이지 계산
    let endPage = startPage + maxPageButtons - 1;
    
    // 끝 페이지가 전체 페이지를 초과하면 조정
    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxPageButtons + 1);
    }
    
    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  };
  
  // 페이지 URL 생성
  const createPageUrl = (page: number): string => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    return `${pathname}?${params.toString()}`;
  };
  
  // 페이지 크기 URL 생성
  const createPageSizeUrl = (size: number): string => {
    const params = new URLSearchParams(searchParams);
    params.set('pageSize', size.toString());
    params.set('page', '1'); // 페이지 크기 변경시 첫 페이지로 이동
    return `${pathname}?${params.toString()}`;
  };
  
  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    if (onPageChange) {
      onPageChange(page);
    }
  };
  
  // 페이지 크기 변경 핸들러
  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(e.target.value);
    if (onPageSizeChange) {
      onPageSizeChange(newSize);
    }
  };
  
  // 페이지가 1개밖에 없으면 페이지네이션 표시하지 않음
  if (totalPages <= 1) {
    return null;
  }
  
  // 페이지 버튼 목록
  const pageButtons = getPageButtons();
  
  return (
    <div className={`flex flex-col sm:flex-row justify-between items-center mt-8 ${className}`}>
      {/* 페이지 정보 */}
      <div className="text-sm text-gray-700 mb-4 sm:mb-0">
        <span className="font-medium">{safeCurrentPage}</span> 페이지
        <span className="mx-1">/</span>
        <span className="font-medium">{totalPages}</span> 페이지
        <span className="mx-1">·</span>
        총 <span className="font-medium">{totalItems}</span>개 항목
      </div>
      
      {/* 페이지 크기 선택 */}
      {showPageSize && (
        <div className="flex items-center mb-4 sm:mb-0 mx-4">
          <label htmlFor="page-size" className="text-sm text-gray-700 mr-2">
            페이지당 표시:
          </label>
          <select
            id="page-size"
            value={pageSize}
            onChange={handlePageSizeChange}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
          >
            <option value="10">10개</option>
            <option value="20">20개</option>
            <option value="30">30개</option>
            <option value="50">50개</option>
          </select>
        </div>
      )}
      
      {/* 페이지네이션 버튼 */}
      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
        {/* 이전 페이지 버튼 */}
        {safeCurrentPage > 1 ? (
          <Link
            href={createPageUrl(safeCurrentPage - 1)}
            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            onClick={() => handlePageChange(safeCurrentPage - 1)}
          >
            <span className="sr-only">이전</span>
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </Link>
        ) : (
          <span className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-gray-100 text-sm font-medium text-gray-400 cursor-not-allowed">
            <span className="sr-only">이전</span>
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </span>
        )}
        
        {/* 첫 페이지 버튼 (시작 페이지가 1이 아닌 경우) */}
        {pageButtons[0] > 1 && (
          <>
            <Link
              href={createPageUrl(1)}
              className={`relative inline-flex items-center px-4 py-2 border ${
                safeCurrentPage === 1
                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
              } text-sm font-medium`}
              onClick={() => handlePageChange(1)}
            >
              1
            </Link>
            
            {/* 건너뛰는 표시 (첫 페이지와 시작 페이지 사이가 2 이상 차이나는 경우) */}
            {pageButtons[0] > 2 && (
              <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                ...
              </span>
            )}
          </>
        )}
        
        {/* 페이지 버튼 */}
        {pageButtons.map(page => (
          <Link
            key={page}
            href={createPageUrl(page)}
            className={`relative inline-flex items-center px-4 py-2 border ${
              safeCurrentPage === page
                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
            } text-sm font-medium`}
            onClick={() => handlePageChange(page)}
          >
            {page}
          </Link>
        ))}
        
        {/* 마지막 페이지 버튼 (끝 페이지가 전체 페이지보다 작은 경우) */}
        {pageButtons[pageButtons.length - 1] < totalPages && (
          <>
            {/* 건너뛰는 표시 (끝 페이지와 마지막 페이지 사이가 2 이상 차이나는 경우) */}
            {pageButtons[pageButtons.length - 1] < totalPages - 1 && (
              <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                ...
              </span>
            )}
            
            <Link
              href={createPageUrl(totalPages)}
              className={`relative inline-flex items-center px-4 py-2 border ${
                safeCurrentPage === totalPages
                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
              } text-sm font-medium`}
              onClick={() => handlePageChange(totalPages)}
            >
              {totalPages}
            </Link>
          </>
        )}
        
        {/* 다음 페이지 버튼 */}
        {safeCurrentPage < totalPages ? (
          <Link
            href={createPageUrl(safeCurrentPage + 1)}
            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            onClick={() => handlePageChange(safeCurrentPage + 1)}
          >
            <span className="sr-only">다음</span>
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </Link>
        ) : (
          <span className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-gray-100 text-sm font-medium text-gray-400 cursor-not-allowed">
            <span className="sr-only">다음</span>
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </span>
        )}
      </nav>
    </div>
  );
};

export default Pagination;