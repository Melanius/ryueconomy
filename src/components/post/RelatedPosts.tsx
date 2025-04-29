'use client';

import Link from "next/link";
import Image from 'next/image';
import { Card } from "@/components/ui/card";
import { BlogPost } from "@/utils/notion";
import { useState } from "react";

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
  getCategoryStyle: (category: string) => {
    main: string;
    light: string;
    dark: string;
  };
  getCategoryName: (category: string) => string;
}

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

export default function RelatedPosts({ 
  relatedPosts, 
  getCategoryStyle,
  getCategoryName
}: RelatedPostsProps) {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  
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
          const imageUrl = hasValidImage && relatedPost.image ? 
            relatedPost.image : 
            (DEFAULT_IMAGES[relatedPost.category] || DEFAULT_IMAGES['all']);
          
          return (
            <Link href={`/blog/${relatedPost.slug}`} key={relatedPost.id}>
              <Card className="h-full overflow-hidden transition-all border card-hover-effect">
                <div className="h-32 relative">
                  <Image 
                    src={imageUrl} 
                    alt={relatedPost.title} 
                    fill 
                    sizes="(max-width: 768px) 100vw, 33vw" 
                    className="object-cover"
                    priority={false}
                    onError={() => setImageErrors(prev => ({ ...prev, [relatedPost.id]: true }))}
                    unoptimized={imageUrl?.includes('amazonaws.com')}
                  />
                  <div 
                    className="absolute inset-0 opacity-0 hover:opacity-20 transition-opacity duration-300"
                    style={{
                      background: `linear-gradient(135deg, ${getCategoryStyle(relatedPost.category).dark}, ${getCategoryStyle(relatedPost.category).light})`
                    }}
                  ></div>
                </div>
                <div className="bg-white">
                  <div 
                    className="p-4 border-b"
                    style={{
                      background: `linear-gradient(to right, ${getCategoryStyle(relatedPost.category).light}, white)`
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
                      {/* 관련 게시물 조회수 표시 (선택적) */}
                      <span className="text-xs">
                        조회수: {relatedPost.views || 0}
                      </span>
                    </div>
                    <h3 
                      className="font-display font-bold text-lg line-clamp-2"
                      style={{ color: getCategoryStyle(relatedPost.category).main }}
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