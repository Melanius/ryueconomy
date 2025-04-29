'use client';

import Link from 'next/link';
import { ChevronDownIcon, ChevronRightIcon, XCircleIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline';
import { Post } from '@/types/post';
import { useState, useEffect } from 'react';
import { NavCategoryId } from '@/contexts/GlobalStateContext';
import { useRouter, useSearchParams } from 'next/navigation';

interface YearData {
  year: string;
  months: {
    month: string;
    count: number;
  }[];
  count: number;
  isOpen?: boolean;
}

interface ArchiveWidgetProps {
  posts: Post[];
  categoryId?: NavCategoryId;
}

export default function ArchiveWidget({ posts, categoryId = 'all' }: ArchiveWidgetProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 컴포넌트 마운트/언마운트 로깅
  useEffect(() => {
    console.log("ArchiveWidget: 컴포넌트 마운트", { categoryId, postsCount: posts.length });
    
    return () => {
      console.log("ArchiveWidget: 컴포넌트 언마운트");
    };
  }, [categoryId, posts.length]);
  
  // Group posts by year and month
  const archiveData = posts.reduce((acc: { [year: string]: { [month: string]: Post[] } }, post: Post) => {
    if (!post.date) return acc;
    
    // Filter by category if provided
    if (categoryId !== 'all' && post.category !== categoryId) return acc;
    
    const postDate = new Date(post.date);
    const year = postDate.getFullYear().toString();
    const month = (postDate.getMonth() + 1).toString().padStart(2, '0');
    
    if (!acc[year]) {
      acc[year] = {};
    }
    
    if (!acc[year][month]) {
      acc[year][month] = [];
    }
    
    acc[year][month].push(post);
    return acc;
  }, {});
  
  // Convert to array format for display
  const initialArchive: YearData[] = Object.keys(archiveData)
    .sort((a, b) => parseInt(b) - parseInt(a)) // Sort years descending
    .map(year => {
      const months = Object.keys(archiveData[year])
        .sort((a, b) => parseInt(b) - parseInt(a)) // Sort months descending
        .map(month => ({
          month,
          count: archiveData[year][month].length
        }));
      
      return {
        year,
        months,
        count: months.reduce((sum, item) => sum + item.count, 0),
        isOpen: false // Initially collapsed
      };
    });
  
  // Set the most recent year (first in the list) to be open by default
  if (initialArchive.length > 0) {
    initialArchive[0].isOpen = true;
  }
  
  const [archive, setArchive] = useState<YearData[]>(initialArchive);
  
  const toggleYear = (yearIndex: number) => {
    console.log("ArchiveWidget: 연도 토글", { yearIndex, year: archive[yearIndex]?.year });
    setArchive(prev => prev.map((year, idx) => {
      if (idx === yearIndex) {
        return { ...year, isOpen: !year.isOpen };
      }
      return year;
    }));
  };

  const handleMonthClick = (year: string, month: string) => {
    console.log("ArchiveWidget: 월 클릭", { year, month, categoryId });
    
    // 현재 URL 파라미터 유지
    const params = new URLSearchParams(searchParams.toString());
    
    // 카테고리 파라미터 설정
    if (categoryId !== 'all') {
      params.set('category', categoryId);
    } else {
      params.delete('category');
    }
    
    // 연도 및 월 파라미터 설정
    params.set('year', year);
    params.set('month', month);
    params.set('page', '1'); // 페이지 1로 초기화
    
    // 라우팅
    router.push(`?${params.toString()}`);
  };
  
  const handleYearClick = (year: string) => {
    console.log("ArchiveWidget: 연도 클릭", { year, categoryId });
    
    // 현재 URL 파라미터 유지
    const params = new URLSearchParams(searchParams.toString());
    
    // 카테고리 파라미터 설정
    if (categoryId !== 'all') {
      params.set('category', categoryId);
    } else {
      params.delete('category');
    }
    
    // 연도 파라미터 설정 및 월 파라미터 제거
    params.set('year', year);
    params.delete('month');
    params.set('page', '1'); // 페이지 1로 초기화
    
    // 라우팅
    router.push(`?${params.toString()}`);
  };
  
  const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ];
  
  if (archive.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 text-sm">
        아카이브 정보가 없습니다.
      </div>
    );
  }
  
  // 총 게시물 수 계산
  const totalPosts = archive.reduce((total, year) => total + year.count, 0);
  
  return (
    <div className="p-1">
      <div className="space-y-2">
        {archive.map((yearData, yearIndex) => (
          <div key={yearData.year} className="border-b border-gray-100 pb-2 last:border-b-0">
            <div 
              className="flex items-center justify-between cursor-pointer hover:text-blue-600 transition-colors py-2"
              onClick={() => toggleYear(yearIndex)}
            >
              <div 
                className="font-medium flex items-center"
                onClick={(e) => {
                  e.stopPropagation();
                  handleYearClick(yearData.year);
                }}
              >
                <span>{yearData.year}년</span>
                <span className="ml-2 text-xs text-gray-500">({yearData.count})</span>
              </div>
              {yearData.isOpen ? (
                <ChevronDownIcon className="h-4 w-4" />
              ) : (
                <ChevronRightIcon className="h-4 w-4" />
              )}
            </div>
            
            {yearData.isOpen && yearData.months.length > 0 && (
              <div className="ml-4 mt-1 space-y-1">
                {yearData.months.map(monthData => (
                  <div
                    key={`${yearData.year}-${monthData.month}`}
                    className="flex items-center justify-between text-sm py-1 hover:text-blue-600 transition-colors cursor-pointer"
                    onClick={() => handleMonthClick(yearData.year, monthData.month)}
                  >
                    <span>{monthNames[parseInt(monthData.month) - 1]}</span>
                    <span className="text-gray-500">({monthData.count})</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 