'use client';

import React, { useCallback, useEffect } from 'react';
import Image from 'next/image';
import { Post } from '@/types/post';
import CategoryBadge from '@/components/common/CategoryBadge';
import { formatDate } from '@/utils/date';

interface PostHeaderProps {
  post: Post;
  className?: string;
}

const PostHeader: React.FC<PostHeaderProps> = ({ post, className = '' }) => {
  // 컴포넌트 마운트 시 로깅
  useEffect(() => {
    console.log(`[PostHeader] 컴포넌트 마운트: ${post.id}, 제목: "${post.title}", 카테고리: ${post.category}`);
    
    // 포스트 메타데이터 로깅
    const metaData = {
      id: post.id,
      title: post.title,
      category: post.category,
      date: post.date,

      tags: post.tags,
      hasCoverImage: !!post.coverImage,
      hasAuthor: !!post.author
    };
    
    console.log('[PostHeader] 포스트 메타데이터:', metaData);
    
    return () => {
      console.log(`[PostHeader] 컴포넌트 언마운트: ${post.id}, 제목: "${post.title}"`);
    };
  }, [post]);

  // 이미지 로드 이벤트 핸들러
  const handleImageLoad = useCallback(() => {
    console.log(`[PostHeader] 커버 이미지 로드 완료: ${post.id}, 제목: "${post.title}"`);
  }, [post.id, post.title]);

  // 이미지 로드 에러 이벤트 핸들러
  const handleImageError = useCallback(() => {
    console.error(`[PostHeader] 커버 이미지 로드 실패: ${post.id}, 제목: "${post.title}", 이미지 URL: ${post.coverImage}`);
  }, [post.id, post.title, post.coverImage]);

  // 태그 클릭 이벤트 핸들러
  const handleTagClick = useCallback((tag: string) => {
    console.log(`[PostHeader] 태그 클릭: ${tag}, 포스트: ${post.id}, 제목: "${post.title}"`);
  }, [post.id, post.title]);

  return (
    <header className={`mb-8 ${className}`}>
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

          {post.tags && post.tags.length > 0 && (
            <div className="flex items-center space-x-2">
              {post.tags.map(tag => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-gray-100 text-sm rounded-full cursor-pointer hover:bg-gray-200"
                  onClick={() => handleTagClick(tag)}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default PostHeader; 