'use client';

import dynamic from 'next/dynamic';
import type { BlogPost } from '@/utils/notion';

// 카테고리 스타일 타입 정의
export interface CategoryStyle {
  main: string;
  light: string;
  dark: string;
}

// 클라이언트 전용으로 RelatedPosts 동적 임포트
const RelatedPosts = dynamic(
  () => import('@/components/post/RelatedPosts'),
  { ssr: false }
);

interface RelatedPostsWrapperProps {
  relatedPosts: BlogPost[];
  // 카테고리 스타일 정보 추가
  categoryStyles: Record<string, CategoryStyle>;
  // 카테고리 이름 매핑 추가
  categoryNames: Record<string, string>;
}

export default function RelatedPostsWrapper({ 
  relatedPosts, 
  categoryStyles,
  categoryNames 
}: RelatedPostsWrapperProps) {
  // 모든 필요한 데이터를 클라이언트 컴포넌트에 전달
  return (
    <RelatedPosts 
      relatedPosts={relatedPosts} 
      categoryStyles={categoryStyles}
      categoryNames={categoryNames}
    />
  );
} 