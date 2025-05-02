'use client';

import Link from "next/link";
import Image from 'next/image';
import { Card } from "@/components/ui/card";
import { BlogPost } from "@/utils/notion";
import { useState, useEffect } from "react";
import { CategoryStyle } from './RelatedPostsWrapper';

// 카테고리별 기본 이미지 URL
const DEFAULT_IMAGES: Record<string, string> = {
  'crypto-morning': '/images/categories/crypto-default.svg',
  'invest-insight': '/images/categories/invest-default.svg',
  'real-portfolio': '/images/categories/portfolio-default.svg',
  'code-lab': '/images/categories/code-default.svg',
  'daily-log': '/images/categories/daily-default.svg',
  'all': '/images/categories/default.svg',
};

interface RelatedPostsProps {
  relatedPosts: BlogPost[];
  categoryStyles: Record<string, CategoryStyle>;
  categoryNames: Record<string, string>;
}

// 카테고리별 스타일 가져오기 (지역 함수)
function getCategoryStyle(category: string, styles: Record<string, CategoryStyle>) {
  return styles[category] || 
    {main: "#4361ee", light: "rgba(67, 97, 238, 0.15)", dark: "rgba(67, 97, 238, 0.4)"};
}

// 카테고리명 가져오기 (지역 함수)
function getCategoryName(category: string, names: Record<string, string>): string {
  return names[category] || category;
}

// 안전한 이미지 URL인지 확인하는 함수
const isValidImageUrl = (url?: string): boolean => {
  if (!url) return false;
  
  // 빈 문자열 체크
  if (url.trim() === '') return false;
  
  // 유효한 URL 형식인지 확인
  try {
    new URL(url);
    return true;
  } catch (e) {
    console.log(`이미지 URL 검증 실패: ${url}`, e);
    return false;
  }
};

export default function RelatedPosts({ relatedPosts, categoryStyles, categoryNames }: RelatedPostsProps) {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  
  // 컴포넌트 마운트 시 이미지 URL을 콘솔에 출력 (디버깅용)
  useEffect(() => {
    console.log('관련 게시물 데이터:', relatedPosts.map(post => ({
      id: post.id,
      title: post.title,
      imageUrl: post.image
    })));
  }, [relatedPosts]);
  
  if (relatedPosts.length === 0) {
    return null;
  }

  return (
    <section className="container max-w-4xl mx-auto py-8 border-t">
      <h2 className="text-2xl font-display font-bold tracking-tight mb-6 gradient-text">관련 게시물</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {relatedPosts.map((relatedPost) => {
          // 이미지 URL이 유효한지 확인
          const hasValidImage = isValidImageUrl(relatedPost.image) && !imageErrors[relatedPost.id];
          
          // 기본 이미지 URL 가져오기 (이미지가 없거나 오류가 있는 경우)
          const imageUrl = hasValidImage ? 
            relatedPost.image : 
            (DEFAULT_IMAGES[relatedPost.category] || DEFAULT_IMAGES['all']);
          
          // 이미지 로딩에 오류 발생 시 콘솔에 로그 남기기
          const handleImageError = () => {
            console.log(`이미지 로딩 실패: ${relatedPost.image} (게시물: ${relatedPost.title})`);
            setImageErrors(prev => ({ ...prev, [relatedPost.id]: true }));
          };
          
          return (
            <Link href={`/blog/${relatedPost.slug}`} key={relatedPost.id}>
              <Card className="h-full overflow-hidden transition-all border card-hover-effect">
                <div className="h-32 relative">
                  <Image 
                    src={imageUrl as string} 
                    alt={relatedPost.title} 
                    fill 
                    sizes="(max-width: 768px) 100vw, 33vw" 
                    className="object-cover"
                    priority={false}
                    onError={handleImageError}
                    unoptimized={imageUrl?.includes('amazonaws.com')}
                  />
                  <div 
                    className="absolute inset-0 opacity-0 hover:opacity-20 transition-opacity duration-300"
                    style={{
                      background: `linear-gradient(135deg, ${getCategoryStyle(relatedPost.category, categoryStyles).dark}, ${getCategoryStyle(relatedPost.category, categoryStyles).light})`
                    }}
                  ></div>
                </div>
                <div className="bg-white">
                  <div 
                    className="p-4 border-b"
                    style={{
                      background: `linear-gradient(to right, ${getCategoryStyle(relatedPost.category, categoryStyles).light}, white)`
                    }}
                  >
                    <div className="flex items-center text-sm text-muted-foreground gap-4 mb-2">
                      <span className="font-medium font-display">
                        {new Date(relatedPost.date).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                        })}
                      </span>

                    </div>
                    <h3 
                      className="font-display font-bold text-lg line-clamp-2"
                      style={{ color: getCategoryStyle(relatedPost.category, categoryStyles).main }}
                    >
                      {relatedPost.title}
                    </h3>
                  </div>
                  <div className="p-4">
                    {relatedPost.excerpt !== "" && (
                      <p className="text-sm line-clamp-2 text-gray-700">{relatedPost.excerpt}</p>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
} 