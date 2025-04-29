'use client';

import React, { useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Post } from '@/types/post';
import CategoryBadge from '@/components/common/CategoryBadge';
import { formatDate } from '@/utils/date';

interface PostSidebarProps {
  recentPosts: Post[];
  popularPosts: Post[];
  categories: Array<{
    id: string;
    name: string;
    count: number;
  }>;
  className?: string;
}

const PostSidebar: React.FC<PostSidebarProps> = ({
  recentPosts,
  popularPosts,
  categories,
  className = ''
}) => {
  // 컴포넌트 마운트 시 로깅
  useEffect(() => {
    console.log(`[PostSidebar] 컴포넌트 마운트: 최근 포스트 ${recentPosts.length}개, 인기 포스트 ${popularPosts.length}개, 카테고리 ${categories.length}개`);
    
    return () => {
      console.log('[PostSidebar] 컴포넌트 언마운트');
    };
  }, [recentPosts.length, popularPosts.length, categories.length]);

  // 최근 포스트 클릭 이벤트 핸들러
  const handleRecentPostClick = useCallback((post: Post) => {
    console.log(`[PostSidebar] 최근 포스트 클릭: ${post.id}, 제목: "${post.title}", 카테고리: ${post.category}`);
  }, []);

  // 인기 포스트 클릭 이벤트 핸들러
  const handlePopularPostClick = useCallback((post: Post) => {
    console.log(`[PostSidebar] 인기 포스트 클릭: ${post.id}, 제목: "${post.title}", 조회수: ${post.views}`);
  }, []);

  // 카테고리 클릭 이벤트 핸들러
  const handleCategoryClick = useCallback((category: {id: string, name: string, count: number}) => {
    console.log(`[PostSidebar] 카테고리 클릭: ${category.id}, 이름: "${category.name}", 게시물 수: ${category.count}`);
  }, []);

  return (
    <aside className={`space-y-8 ${className}`}>
      {/* 최근 포스트 */}
      <section>
        <h2 className="text-xl font-bold mb-4">최근 포스트</h2>
        <div className="space-y-4">
          {recentPosts.map(post => (
            <Link 
              key={post.id} 
              href={`/post/${post.id}`}
              className="block group"
              onClick={() => handleRecentPostClick(post)}
            >
              <article className="border-b border-gray-200 pb-4 last:border-0">
                <h3 className="text-base font-medium group-hover:text-blue-600 mb-1">
                  {post.title}
                </h3>
                <div className="flex items-center text-sm text-gray-500">
                  <CategoryBadge category={post.category} className="mr-2" />
                  <time>{formatDate(post.date)}</time>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>

      {/* 인기 포스트 */}
      <section>
        <h2 className="text-xl font-bold mb-4">인기 포스트</h2>
        <div className="space-y-4">
          {popularPosts
            .filter(post => post.category !== 'code-lab' && post.category !== 'daily-log')
            .map(post => (
              <Link 
                key={post.id} 
                href={`/post/${post.id}`}
                className="block group"
                onClick={() => handlePopularPostClick(post)}
              >
                <article className="border-b border-gray-200 pb-4 last:border-0">
                  <h3 className="text-base font-medium group-hover:text-blue-600 mb-1">
                    {post.title}
                  </h3>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <CategoryBadge category={post.category} />
                    <span>조회수 {post.views}</span>
                  </div>
                </article>
              </Link>
            ))}
        </div>
      </section>

      {/* 카테고리 */}
      <section>
        <h2 className="text-xl font-bold mb-4">카테고리</h2>
        <div className="space-y-2">
          {categories.map(category => (
            <Link 
              key={category.id} 
              href={`/category/${category.id}`}
              className="flex items-center justify-between group"
              onClick={() => handleCategoryClick(category)}
            >
              <span className="text-gray-600 group-hover:text-blue-600">
                {category.name}
              </span>
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {category.count}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </aside>
  );
};

export default PostSidebar; 