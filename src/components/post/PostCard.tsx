'use client';

import React, { useCallback, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Post } from '@/types/post';
import CategoryBadge from '@/components/common/CategoryBadge';
import { formatDate } from '@/utils/date';
import { NavCategoryId } from '@/contexts/GlobalStateContext';

interface PostCardProps {
  post: Post;
  className?: string;
}

const PostCard: React.FC<PostCardProps> = ({ post, className = '' }) => {
  // 컴포넌트 마운트 시 로깅
  useEffect(() => {
    console.log(`[PostCard] 컴포넌트 마운트: ${post.id}, 제목: "${post.title}", 카테고리: ${post.category}`);
    
    return () => {
      console.log(`[PostCard] 컴포넌트 언마운트: ${post.id}, 제목: "${post.title}"`);
    };
  }, [post.id, post.title, post.category]);

  // 포스트 클릭 이벤트 핸들러
  const handlePostClick = useCallback(() => {
    console.log(`[PostCard] 포스트 클릭: ${post.id}, 제목: "${post.title}", 카테고리: ${post.category}`);
    // 추가 분석 코드를 여기에 넣을 수 있습니다 (예: GA 추적)
  }, [post.id, post.title, post.category]);

  // 이미지 로드 이벤트 핸들러
  const handleImageLoad = useCallback(() => {
    console.log(`[PostCard] 이미지 로드 완료: ${post.id}, 제목: "${post.title}"`);
  }, [post.id, post.title]);

  // 이미지 로드 에러 이벤트 핸들러
  const handleImageError = useCallback(() => {
    console.error(`[PostCard] 이미지 로드 실패: ${post.id}, 제목: "${post.title}", 이미지 URL: ${post.image}`);
  }, [post.id, post.title, post.image]);

  return (
    <Link href={`/post/${post.id}`} onClick={handlePostClick}>
      <article 
        className={`group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md ${className}`}
      >
        {post.image && (
          <div className="relative h-48 w-full overflow-hidden">
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-200 group-hover:scale-105"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          </div>
        )}
        
        <div className="flex flex-1 flex-col justify-between p-6">
          <div className="flex-1">
            <div className="mb-3">
              <CategoryBadge category={post.category as NavCategoryId} />
            </div>
            
            <h3 className="mb-2 text-xl font-semibold leading-tight text-gray-900 group-hover:text-blue-600">
              {post.title}
            </h3>
            
            {post.excerpt && (
              <p className="mb-4 text-sm text-gray-500 line-clamp-2">
                {post.excerpt}
              </p>
            )}
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {formatDate(post.date)}
            </div>
            

          </div>
        </div>
      </article>
    </Link>
  );
};

export default PostCard; 