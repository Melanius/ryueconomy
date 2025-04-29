"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { BlogPost } from '@/types/post';
import { CategoryId } from '@/types/notion';
import Link from 'next/link';
import PostFilters, { FilterOptions } from '@/components/filters/PostFilters';
import Pagination from '@/components/pagination/Pagination';
import { getCategoryLabel } from '@/styles/category-colors';

// 블로그 포스트 목록 페이지
function PostContent() {
  // 검색 파라미터 가져오기
  const searchParams = useSearchParams();
  
  // 포스트 상태
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [totalPosts, setTotalPosts] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState<number>(
    parseInt(searchParams.get('page') || '1')
  );
  const [pageSize, setPageSize] = useState<number>(
    parseInt(searchParams.get('pageSize') || '12')
  );
  
  // 필터링 상태
  const [filters, setFilters] = useState<FilterOptions>({
    category: (searchParams.get('category') as CategoryId) || 'all',
    sortBy: (searchParams.get('sortBy') as 'date' | 'views') || 'date',
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    year: searchParams.get('year') || '',
    month: searchParams.get('month') || '',
    search: searchParams.get('search') || ''
  });
  
  // 포스트 데이터 가져오기
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        
        // URL 파라미터 구성
        const params = new URLSearchParams();
        params.set('page', currentPage.toString());
        params.set('pageSize', pageSize.toString());
        
        // 필터 값이 있는 경우에만 파라미터 추가
        Object.entries(filters).forEach(([key, value]) => {
          if (value) {
            params.set(key, value);
          }
        });
        
        // API 호출
        const response = await fetch(`/api/posts?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('포스트를 가져오는데 실패했습니다.');
        }
        
        const data = await response.json();
        
        // 데이터 설정
        setPosts(data.posts);
        setTotalPosts(data.total);
        setLoading(false);
      } catch (err) {
        console.error('포스트 가져오기 오류:', err);
        setError(err instanceof Error ? err.message : '알 수 없는 오류');
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, [currentPage, pageSize, filters]);
  
  // 필터 변경 핸들러
  const handleFilterChange = (newFilters: FilterOptions) => {
    // 필터 변경 시 첫 페이지로 이동
    setCurrentPage(1);
    setFilters(newFilters);
  };
  
  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // 페이지 상단으로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // 페이지 크기 변경 핸들러
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };
  
  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">모든 게시물</h1>
        <p className="text-gray-600">
          {filters.category && filters.category !== 'all' 
            ? `${getCategoryLabel(filters.category as CategoryId)} 카테고리의 게시물입니다.`
            : '모든 게시물을 확인하세요.'}
        </p>
      </div>
      
      {/* 필터 컴포넌트 */}
      <PostFilters 
        initialFilters={filters}
        onFilterChange={handleFilterChange}
        className="mb-8"
      />
      
      {/* 로딩 상태 */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: pageSize }, (_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p className="font-medium">오류가 발생했습니다</p>
          <p className="mt-1">{error}</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">게시물이 없습니다.</p>
          <p className="text-gray-500 mt-2">다른 필터 조건으로 검색해보세요.</p>
        </div>
      ) : (
        <>
          {/* 검색 결과 정보 */}
          <div className="mb-4 text-sm text-gray-500">
            총 {totalPosts}개의 게시물 중 {posts.length}개 표시 중
          </div>
          
          {/* 포스트 목록 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {posts.map((post) => (
              <Link href={`/blog/${post.slug}`} key={post.id}>
                <Card className="h-full overflow-hidden transition-all border hover:shadow-md">
                  <div 
                    className="h-48 bg-cover bg-center" 
                    style={{ 
                      backgroundImage: post.image 
                        ? `url(${post.image})` 
                        : 'url(/images/placeholder.jpg)' 
                    }}
                  ></div>
                  <div className="p-4">
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <span className="mr-3">{new Date(post.date).toLocaleDateString()}</span>
                      <span 
                        className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ 
                          backgroundColor: getCategoryColor(post.category as CategoryId, 'light'),
                          color: getCategoryColor(post.category as CategoryId, 'main')
                        }}
                      >
                        {getCategoryLabel(post.category as CategoryId)}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold mb-2 line-clamp-2">{post.title}</h2>
                    {post.excerpt && (
                      <p className="text-gray-600 line-clamp-2">{post.excerpt}</p>
                    )}
                    <div className="flex justify-between items-center mt-3 text-sm">
                      <span className="text-gray-500">조회수: {post.views || 0}</span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
          
          {/* 페이지네이션 */}
          <Pagination
            totalItems={totalPosts}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </>
      )}
    </div>
  );
}

// 메인 컴포넌트에 Suspense 경계 추가
export default function PostsPage() {
  return (
    <Suspense fallback={<div className="container max-w-6xl mx-auto px-4 py-8">게시물을 불러오는 중...</div>}>
      <PostContent />
    </Suspense>
  );
}

// 카테고리 색상 가져오기 유틸리티 함수
function getCategoryColor(category: CategoryId, type: 'main' | 'light' | 'dark' = 'main'): string {
  const colorMap: Record<CategoryId, { main: string, light: string, dark: string }> = {
    'crypto-morning': {main: '#E03E3E', light: 'rgba(224, 62, 62, 0.15)', dark: 'rgba(224, 62, 62, 0.4)'},
    'invest-insight': {main: '#FF9F43', light: 'rgba(255, 159, 67, 0.15)', dark: 'rgba(255, 159, 67, 0.4)'},
    'real-portfolio': {main: '#0B6BCB', light: 'rgba(11, 107, 203, 0.15)', dark: 'rgba(11, 107, 203, 0.4)'},
    'code-lab': {main: '#0F9D58', light: 'rgba(15, 157, 88, 0.15)', dark: 'rgba(15, 157, 88, 0.4)'},
    'daily-log': {main: '#F5C400', light: 'rgba(245, 196, 0, 0.15)', dark: 'rgba(245, 196, 0, 0.4)'},
    'all': {main: '#4361ee', light: 'rgba(67, 97, 238, 0.15)', dark: 'rgba(67, 97, 238, 0.4)'},
  };
  
  return colorMap[category]?.[type] || colorMap['all'][type];
}