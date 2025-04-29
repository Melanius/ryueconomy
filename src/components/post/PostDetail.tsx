'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Post } from '@/types/post';
import CategoryBadge from '@/components/common/CategoryBadge';
import { formatDate } from '@/utils/date';

interface PostDetailProps {
  post: Post;
  className?: string;
}

const PostDetail: React.FC<PostDetailProps> = ({ post, className = '' }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollObserverRef = useRef<IntersectionObserver | null>(null);
  const scrollProgressLoggedRef = useRef<Set<number>>(new Set());

  // 컴포넌트 마운트 시 로깅
  useEffect(() => {
    console.log(`[PostDetail] 컴포넌트 마운트: ${post.id}, 제목: "${post.title}", 카테고리: ${post.category}`);
    
    // 사용자의 게시물 읽기 진행 상황 추적 (스크롤 추적)
    if (contentRef.current) {
      const trackScrollProgress = () => {
        const contentElement = contentRef.current;
        if (!contentElement) return;

        const totalHeight = contentElement.scrollHeight;
        const windowHeight = window.innerHeight;
        const scrollPosition = window.scrollY;
        
        // 스크롤 진행도 계산 (0-100%)
        const scrollPercentage = Math.min(
          100, 
          Math.round(((scrollPosition + windowHeight) / totalHeight) * 100)
        );
        
        // 25%, 50%, 75%, 100% 지점에서 로깅
        const milestones = [25, 50, 75, 100];
        
        milestones.forEach(milestone => {
          if (scrollPercentage >= milestone && !scrollProgressLoggedRef.current.has(milestone)) {
            console.log(`[PostDetail] 게시물 읽기 진행도: ${milestone}%, 포스트: ${post.id}, 제목: "${post.title}"`);
            scrollProgressLoggedRef.current.add(milestone);
          }
        });
      };

      window.addEventListener('scroll', trackScrollProgress);
      
      // 초기 로딩 시 한 번 확인
      trackScrollProgress();
      
      return () => {
        window.removeEventListener('scroll', trackScrollProgress);
      };
    }
    
    return () => {
      console.log(`[PostDetail] 컴포넌트 언마운트: ${post.id}, 제목: "${post.title}"`);
      
      // 관찰자 정리
      if (scrollObserverRef.current) {
        scrollObserverRef.current.disconnect();
      }
    };
  }, [post.id, post.title, post.category]);

  // 이미지 로드 이벤트 핸들러
  const handleImageLoad = useCallback(() => {
    console.log(`[PostDetail] 커버 이미지 로드 완료: ${post.id}, 제목: "${post.title}"`);
  }, [post.id, post.title]);

  // 이미지 로드 에러 이벤트 핸들러
  const handleImageError = useCallback(() => {
    console.error(`[PostDetail] 커버 이미지 로드 실패: ${post.id}, 제목: "${post.title}", 이미지 URL: ${post.coverImage}`);
  }, [post.id, post.title, post.coverImage]);

  return (
    <article className={`max-w-4xl mx-auto ${className}`}>
      {post.coverImage && (
        <div className="relative h-[400px] w-full mb-8 rounded-lg overflow-hidden">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover"
            priority
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        </div>
      )}

      <header className="mb-8">
        <div className="mb-4">
          <CategoryBadge category={post.category} />
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {post.title}
        </h1>

        <div className="flex items-center justify-between text-gray-500">
          <div className="flex items-center space-x-4">
            {post.author && (
              <div className="flex items-center">
                {post.author.image && (
                  <div className="relative h-8 w-8 rounded-full overflow-hidden mr-2">
                    <Image
                      src={post.author.image}
                      alt={post.author.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <span>{post.author.name}</span>
              </div>
            )}
            <time dateTime={post.date}>{formatDate(post.date)}</time>
          </div>
          
          <div className="flex items-center space-x-4">
            <span>조회수 {post.views}</span>
            {post.tags && post.tags.length > 0 && (
              <div className="flex items-center space-x-2">
                {post.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-100 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      <div 
        ref={contentRef}
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content || '' }}
      />
    </article>
  );
};

export default PostDetail; 