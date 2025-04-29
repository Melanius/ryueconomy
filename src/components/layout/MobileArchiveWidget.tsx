"use client";

import { useState } from 'react';
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import Link from "next/link";
import { FaArchive, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { Post, CategoryId } from '@/types/post';
import { getCategoryLabel } from '@/config/categories';

interface MobileArchiveWidgetProps {
  posts: Post[];
  categoryId?: CategoryId | 'all';
}

export default function MobileArchiveWidget({ posts, categoryId = 'all' }: MobileArchiveWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // 게시물 날짜 기준으로 연도-월 그룹화
  const archiveGroups = posts.reduce((acc: Record<string, Post[]>, post) => {
    const date = new Date(post.date);
    const yearMonth = `${date.getFullYear()}-${date.getMonth() + 1}`;
    
    if (!acc[yearMonth]) {
      acc[yearMonth] = [];
    }
    
    acc[yearMonth].push(post);
    return acc;
  }, {});
  
  // 연도-월 내림차순으로 정렬 (최신순)
  const sortedGroups = Object.keys(archiveGroups).sort().reverse();
  
  // 최근 3개 그룹만 기본 표시 (나머지는 확장 시 표시)
  const displayedGroups = isExpanded ? sortedGroups : sortedGroups.slice(0, 3);
  
  return (
    <div className="pb-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-base flex items-center">
          <FaArchive className="mr-2 text-gray-600" />
          게시물 아카이브
        </h3>
        
        {sortedGroups.length > 3 && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-500 text-sm flex items-center hover:text-blue-700 transition-colors"
            aria-expanded={isExpanded}
            aria-controls="archive-dates"
          >
            {isExpanded ? (
              <>
                접기 <FaChevronUp className="ml-1 h-3 w-3" />
              </>
            ) : (
              <>
                더보기 <FaChevronDown className="ml-1 h-3 w-3" />
              </>
            )}
          </button>
        )}
      </div>
      
      <ul id="archive-dates" className="space-y-2">
        {displayedGroups.map(yearMonth => {
          const [year, month] = yearMonth.split('-');
          const date = new Date(parseInt(year), parseInt(month) - 1);
          const formattedDate = format(date, 'yyyy년 M월', { locale: ko });
          const postsCount = archiveGroups[yearMonth].length;
          
          // 현재 선택된 카테고리에 해당하는 포스트만 필터링
          const filteredPosts = categoryId === 'all' 
            ? archiveGroups[yearMonth] 
            : archiveGroups[yearMonth].filter(post => post.category === categoryId);
          
          // 해당 카테고리에 게시물이 없으면 표시하지 않음
          if (categoryId !== 'all' && filteredPosts.length === 0) {
            return null;
          }
          
          return (
            <li key={yearMonth} className="text-sm">
              <Link 
                href={`/archive/${year}/${month}${categoryId !== 'all' ? `?category=${categoryId}` : ''}`}
                className="block px-3 py-2 rounded-md hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <span>{formattedDate}</span>
                  <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                    {categoryId === 'all' ? postsCount : filteredPosts.length}
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
      
      {!isExpanded && sortedGroups.length > 3 && (
        <div className="mt-2 text-center">
          <button 
            onClick={() => setIsExpanded(true)}
            className="text-blue-500 text-sm inline-flex items-center hover:text-blue-700 transition-colors"
            aria-expanded={false}
          >
            더 많은 기록 보기 <FaChevronDown className="ml-1 h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}