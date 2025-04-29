'use client';

import Link from "next/link";
import Image from 'next/image';
import { Card } from "@/components/ui/card";
import { BlogPost } from "@/utils/notion";

interface RelatedPostsProps {
  relatedPosts: BlogPost[];
  getCategoryStyle: (category: string) => {
    main: string;
    light: string;
    dark: string;
  };
  getCategoryName: (category: string) => string;
}

export default function RelatedPosts({ 
  relatedPosts, 
  getCategoryStyle,
  getCategoryName
}: RelatedPostsProps) {
  // 이미지 로드 오류 처리 함수
  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement>, 
    category: string
  ) => {
    console.error(`이미지 로드 오류: ${e.currentTarget.src}`);
    const target = e.currentTarget;
    target.style.display = 'none';
    if (target.parentElement) {
      target.parentElement.style.background = 
        `linear-gradient(135deg, ${getCategoryStyle(category).dark}, ${getCategoryStyle(category).light})`;
    }
  };
  
  if (relatedPosts.length === 0) {
    return null;
  }

  return (
    <section className="container max-w-4xl mx-auto py-8 border-t">
      <h2 className="text-2xl font-display font-bold tracking-tight mb-6 gradient-text">관련 게시물</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {relatedPosts.map((relatedPost) => (
          <Link href={`/blog/${relatedPost.slug}`} key={relatedPost.id}>
            <Card className="h-full overflow-hidden transition-all border card-hover-effect">
              <div className="h-32 relative">
                {relatedPost.image ? (
                  <Image 
                    src={relatedPost.image} 
                    alt={relatedPost.title} 
                    fill 
                    sizes="(max-width: 768px) 100vw, 33vw" 
                    className="object-cover"
                    priority={false}
                    onError={(e) => handleImageError(e, relatedPost.category)}
                  />
                ) : (
                  <div 
                    className="h-32" 
                    style={{
                      background: `linear-gradient(135deg, ${getCategoryStyle(relatedPost.category).dark}, ${getCategoryStyle(relatedPost.category).light})`
                    }}
                  ></div>
                )}
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
        ))}
      </div>
    </section>
  );
} 