import CategoryTabs from "@/components/layout/CategoryTabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HiArrowRight } from "react-icons/hi2";
import { getAllPosts } from "@/lib/notion";
import { Post } from "@/types/post";
import { CategoryId } from "@/types/notion";
import { getCategoryLabel, getCategoryColor, getCategoryIcon, getCategoryGradient } from "@/config/categories";
import { CalendarIcon } from "@heroicons/react/24/outline";
import { 
  HiChartBar, 
  HiCurrencyDollar, 
  HiBriefcase, 
  HiCode, 
  HiPencil, 
  HiDocumentText,
  HiViewGrid
} from "react-icons/hi";
import PostsList from "@/components/PostsList";
import { Metadata } from "next";
import { defaultMetadata, generateCategoryMetadata } from "@/app/metadata";
import { Suspense } from 'react';
import React, { useState } from 'react';
import { notFound } from 'next/navigation';
import Loading from '@/components/layout/Loading';
import CategoryTabsWithNavigation from '@/components/layout/CategoryTabsWithNavigation';
import { FaCalendarAlt, FaArrowRight, FaTag, FaChevronRight, FaChartLine, FaArchive } from "react-icons/fa";
import PostCard from '@/components/cards/PostCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import Image from "next/image";
import RecentPosts from "@/components/RecentPosts";
import MobileArchiveWidget from '@/components/layout/MobileArchiveWidget';
import ArchiveWidget from "@/components/layout/ArchiveWidget";

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

// 동적 메타데이터 생성
export async function generateMetadata({ searchParams }: { searchParams: { category?: string } }): Promise<Metadata> {
  // Next.js 15에서는 searchParams를 await 해야 함
  const resolvedSearchParams = await searchParams;
  const category = typeof resolvedSearchParams.category === 'string' ? resolvedSearchParams.category : 'all';
  
  if (category === 'all') {
    return defaultMetadata;
  }
  
  return generateCategoryMetadata(category as CategoryId);
}

const getCategoryBackground = (category: CategoryId): string => {
  const color = getCategoryColor(category);
  return `linear-gradient(135deg, ${hexToRgba(color, 0.25)}, ${hexToRgba(color, 0.1)})`;
};

// 카테고리 별 그라데이션 설정 함수 제거 (config/categories.tsx로 이동됨)

type HomeProps = {
  searchParams: { 
    category?: string;
    page?: string;
  };
};

export default async function Home({ searchParams }: HomeProps) {
  // Next.js 15에서는 searchParams를 await 해야 함
  const resolvedSearchParams = await searchParams;
  const activeCategory = (resolvedSearchParams.category || 'all') as CategoryId;
  const currentPage = parseInt(resolvedSearchParams.page || '1', 10);
  
  // 노션에서 최신 글 가져오기
  let allPosts: Post[] = [];
  let error = null;
  
  try {
    allPosts = await getAllPosts();
  } catch (err) {
    console.error('홈페이지: Notion 데이터 가져오기 실패:', err);
    error = err instanceof Error ? err.message : '알 수 없는 오류';
  }
  
  // 카테고리별 게시물 수 계산
  const categoryPostCounts = allPosts.reduce((counts: Partial<Record<CategoryId, number>>, post) => {
    const category = post.category as CategoryId;
    if (category) {
      counts[category] = (counts[category] || 0) + 1;
    }
    return counts;
  }, {});
  
  // 전체 게시물 수 추가
  categoryPostCounts['all'] = allPosts.length;
  
  // 선택된 카테고리에 따라 게시물 필터링
  const filteredPosts = activeCategory === 'all' 
    ? allPosts 
    : allPosts.filter(post => post.category === activeCategory);
  
  // '전체' 카테고리에서는 인기 글, 다른 카테고리에서는 최신 글 3개 선택
  // 인기 게시물에서 '코드 랩'과 '일상 기록' 카테고리 제외
  const topPosts = activeCategory === 'all'
    ? filteredPosts.filter(post => post.featured).slice(0, 3)
    : [...filteredPosts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3); // 최신 글 (날짜 기준)
  
  // 페이지네이션 설정
  const POSTS_PER_PAGE = 5;
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  
  // 현재 페이지에 표시할 게시물 계산
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const paginatedPosts = [...filteredPosts]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(startIndex, endIndex);
  
  // 카테고리 정보
  const categoryColor = getCategoryColor(activeCategory);
  const CategoryIcon = getCategoryIcon(activeCategory);

  return (
    <div className="container mx-auto pb-10 pt-6">
      {/* Category Navigation - 모바일에서는 숨기기 */}
      <div className="hidden sm:block">
        <CategoryTabsWithNavigation />
      </div>

      {/* Popular Posts section - 전체 페이지에서만 표시 */}
      {activeCategory === 'all' && (
        <div className="container max-w-6xl mx-auto px-4 mb-8 mt-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <span className="text-amber-500 mr-2">🔥</span>
            인기 게시물
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {topPosts.slice(0, 3).map((post) => (
              <PostCard 
                key={post.slug} 
                post={post} 
                hideCategory={false} 
                isMobileCompact={true} 
              />
            ))}
          </div>
        </div>
      )}

      {/* Recent Posts section - 카테고리 페이지에서만 표시 */}
      {activeCategory !== 'all' && (
        <div className="container max-w-6xl mx-auto px-4 mb-8 mt-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <span className="text-blue-500 mr-2">📝</span>
            최신 게시물
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredPosts
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 3)
              .map((post) => (
                <PostCard 
                  key={post.slug} 
                  post={post} 
                  hideCategory={false} 
                  isMobileCompact={true} 
                />
              ))}
          </div>
        </div>
      )}

      {/* All Posts section */}
      <div className="container max-w-6xl mx-auto px-4 mt-8">
        {/* 전체 게시글 영역 - 데스크톱에서는 좌측에 아카이브 위젯, 우측에 게시글 목록 */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* 아카이브 위젯 - 데스크톱에서만 표시 */}
          <div className="hidden lg:block lg:w-1/4">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <span className="mr-2 text-gray-700">🗃️</span>
              아카이브
            </h2>
            <div className="bg-white rounded-xl shadow border border-gray-100 p-4 h-fit">
              <ArchiveWidget posts={allPosts} categoryId={activeCategory} />
            </div>
          </div>
          
          {/* 게시글 목록 */}
          <div className="lg:w-3/4">
            {/* 전체 게시글 섹션 제목 - 위치 변경 */}
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <span className="mr-2 text-blue-600">📋</span>
              {activeCategory === "all" ? "전체 게시글" : `${getCategoryLabel(activeCategory)} 게시글`}
            </h2>
            {paginatedPosts.length > 0 ? (
              <div className="bg-white rounded-xl overflow-hidden shadow border border-gray-100 mb-6">
                {paginatedPosts.map((post, index) => (
                  <div key={post.slug} className={`p-3 ${index !== paginatedPosts.length - 1 ? 'border-b border-gray-100' : ''}`}>
                    <Link href={`/blog/${post.slug}`} className="flex items-start sm:items-center gap-4 hover:bg-gray-50 p-2 rounded-lg transition-colors">
                      {/* Thumbnail - 모바일에서는 작게 변경 */}
                      <div className="h-20 w-20 sm:h-16 sm:w-16 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                        {post.image && isValidImageUrl(post.image) ? (
                          <div className="relative w-full h-full">
                            <Image 
                              src={post.image} 
                              alt={post.title} 
                              fill
                              sizes="(max-width: 640px) 80px, 64px"
                              className="object-cover"
                              unoptimized={post.image?.includes('amazonaws.com')}
                            />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full bg-gray-100">
                            <HiDocumentText className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div 
                            className="px-2 py-0.5 rounded-full text-xs flex items-center"
                            style={{
                              backgroundColor: hexToRgba(getCategoryColor(post.category || 'all'), 0.1),
                              color: getCategoryColor(post.category || 'all'),
                            }}
                          >
                            {getCategoryLabel(post.category || 'all')}
                          </div>
                          

                        </div>
                        
                        <h3 className="font-medium text-base line-clamp-2 mb-1 hover:text-blue-600 transition-colors">{post.title}</h3>
                        
                        <div className="flex items-center text-xs text-gray-500 gap-3">
                          <div className="flex items-center gap-1">
                            <FaCalendarAlt className="h-3 w-3" />
                            {format(new Date(post.date), "yyyy.MM.dd", { locale: ko })}
                          </div>

                        </div>
                      </div>
                      
                      <FaChevronRight className="h-3 w-3 text-gray-400 flex-shrink-0 hidden sm:block" />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 bg-gray-50 rounded-xl text-center mb-6">
                <p className="text-gray-500">이 카테고리에 게시물이 없습니다.</p>
              </div>
            )}
            
            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-6 space-x-2" role="navigation" aria-label="페이지 네비게이션">
                {/* 이전 페이지 버튼 */}
                {currentPage > 1 && (
                  <Link
                    href={`/?${new URLSearchParams({
                      ...(activeCategory !== 'all' ? { category: activeCategory } : {}),
                      page: (currentPage - 1).toString()
                    }).toString()}`}
                    className="px-3 py-2 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
                    scroll={false}
                  >
                    <span>&laquo; 이전</span>
                  </Link>
                )}
                
                {/* 페이지 번호 */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <Link
                    key={page}
                    href={`/?${new URLSearchParams({
                      ...(activeCategory !== 'all' ? { category: activeCategory } : {}),
                      page: page.toString()
                    }).toString()}`}
                    className={`px-3 py-2 rounded-md ${
                      currentPage === page
                        ? 'bg-blue-500 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    } transition-colors`}
                    scroll={false}
                  >
                    {page}
                  </Link>
                ))}
                
                {/* 다음 페이지 버튼 */}
                {currentPage < totalPages && (
                  <Link
                    href={`/?${new URLSearchParams({
                      ...(activeCategory !== 'all' ? { category: activeCategory } : {}),
                      page: (currentPage + 1).toString()
                    }).toString()}`}
                    className="px-3 py-2 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
                    scroll={false}
                  >
                    <span>다음 &raquo;</span>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* 모바일용 아카이브 위젯 - 하단에 표시 */}
        <div className="lg:hidden mt-8">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <span className="mr-2 text-gray-700" aria-hidden="true">📁️</span>
            아카이브
          </h2>
          <div className="bg-white rounded-xl shadow border border-gray-100 p-4">
            <MobileArchiveWidget posts={allPosts} categoryId={activeCategory} />
          </div>
        </div>
      </div>
    </div>
  );
}
