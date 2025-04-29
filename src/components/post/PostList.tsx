'use client';

import React, { useEffect } from 'react';
import { Post } from '@/types/post';
import PostCard from './PostCard';

interface PostListProps {
  posts: Post[];
  className?: string;
}

const PostList: React.FC<PostListProps> = ({ posts, className = '' }) => {
  // 컴포넌트 마운트 및 포스트 데이터 변경 시 로깅
  useEffect(() => {
    console.log(`[PostList] 컴포넌트 마운트: 총 ${posts.length}개의 포스트 로드됨`);
    
    // 카테고리별 포스트 수 로깅
    const categoryCounts: Record<string, number> = {};
    posts.forEach(post => {
      categoryCounts[post.category] = (categoryCounts[post.category] || 0) + 1;
    });
    
    console.log('[PostList] 카테고리별 포스트 수:', categoryCounts);
    
    return () => {
      console.log('[PostList] 컴포넌트 언마운트');
    };
  }, [posts]);

  // 게시물이 없을 때 로깅
  if (posts.length === 0) {
    console.log('[PostList] 표시할 포스트가 없음');
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">작성된 포스트가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};

export default PostList; 