"use client";

import Link from "next/link";
import Image from "next/image";
import { FaCalendarAlt, FaEye, FaArrowRight, FaChevronRight } from "react-icons/fa";
import { useGlobalState } from "@/contexts/GlobalStateContext";
import { Post, CategoryId } from "@/types/post";
import { useState } from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { getCategoryColor, getCategoryLabel, getCategoryIcon } from "@/config/categories";

// 안전한 이미지 URL인지 확인하는 함수
const isValidImageUrl = (url?: string): boolean => {
  if (!url) return false;
  
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

// Hex color to rgba converter
const hexToRgba = (hex: string, alpha: number = 1) => {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Parse hex values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Return rgba color string
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

interface RecentPostsProps {
  posts: Post[];
}

export default function RecentPosts({ posts }: RecentPostsProps) {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  
  // 1. 현재 선택된 카테고리 가져오기 (글로벌 상태에서)
  const { selectedCategory } = useGlobalState();
  
  // 2. 선택된 카테고리에 따라 포스트 필터링
  const filteredPosts = selectedCategory === 'all' 
    ? posts 
    : posts.filter(post => post.category === selectedCategory);
  
  // 3. 최대 5개 포스트만 표시
  const postsToShow = filteredPosts
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  
  // Check if we have more than 5 filtered posts to show the "more posts" link
  const hasMorePosts = filteredPosts.length > 5;

  if (postsToShow.length === 0) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg text-center">
        <p className="text-gray-500">이 카테고리에 게시물이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {postsToShow.map((post) => {
        const hasValidImage = post.image && isValidImageUrl(post.image) && !imageErrors[post.slug];
        const CategoryIcon = getCategoryIcon(post.category);
        
        return (
          <Link 
            key={post.slug} 
            href={`/blog/${post.slug}`}
            className="block hover:bg-gray-50 rounded-lg transition-colors border border-gray-100 overflow-hidden shadow-sm hover:shadow"
          >
            <div className="flex flex-row items-start sm:items-center p-3 gap-3">
              {/* Thumbnail */}
              <div className="h-20 w-20 sm:h-16 sm:w-16 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                {hasValidImage ? (
                  <div className="relative w-full h-full">
                    <Image 
                      src={post.image!} 
                      alt={post.title} 
                      fill
                      sizes="(max-width: 640px) 80px, 64px"
                      className="object-cover"
                      onError={() => setImageErrors(prev => ({ ...prev, [post.slug]: true }))}
                      unoptimized={post.image?.includes('amazonaws.com')}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-100">
                    <svg className="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                )}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div 
                    className="px-2 py-0.5 rounded-full text-xs flex items-center gap-1"
                    style={{
                      backgroundColor: hexToRgba(getCategoryColor(post.category), 0.1),
                      color: getCategoryColor(post.category),
                    }}
                  >
                    {CategoryIcon && <CategoryIcon className="h-3 w-3" />}
                    {getCategoryLabel(post.category)}
                  </div>
                  
                  {(post.views || 0) > 300 && (
                    <div className="text-amber-600 text-xs font-medium flex items-center">
                      <FaEye className="mr-1 h-3 w-3" />
                      인기
                    </div>
                  )}
                </div>
                
                <h3 className="font-medium text-base line-clamp-2 mb-1 hover:text-blue-600 transition-colors">{post.title}</h3>
                
                <div className="flex items-center text-xs text-gray-500 gap-3">
                  <div className="flex items-center gap-1">
                    <FaCalendarAlt className="h-3 w-3" />
                    {format(new Date(post.date), "yyyy.MM.dd", { locale: ko })}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <FaEye className="h-3 w-3" />
                    {(post.views || 0).toLocaleString()}
                  </div>
                </div>
              </div>
              
              <FaChevronRight className="h-3 w-3 text-gray-400 flex-shrink-0 hidden sm:block" />
            </div>
          </Link>
        );
      })}
      
      {hasMorePosts && (
        <Link 
          href={selectedCategory === 'all' ? '/blog' : `/category/${selectedCategory}`}
          className="flex items-center justify-center mt-4 py-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          더 많은 게시물 보기 <FaArrowRight className="ml-2" />
        </Link>
      )}
    </div>
  );
} 