'use client';

import dynamic from 'next/dynamic';
import type { BlogPost } from '@/utils/notion';

// 클라이언트 전용으로 RelatedPosts 동적 임포트
const RelatedPosts = dynamic(
  () => import('@/components/post/RelatedPosts'),
  { ssr: false }
);

interface RelatedPostsWrapperProps {
  relatedPosts: BlogPost[];
}

export default function RelatedPostsWrapper({ relatedPosts }: RelatedPostsWrapperProps) {
  return <RelatedPosts relatedPosts={relatedPosts} />;
} 