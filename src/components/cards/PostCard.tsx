'use client';

import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { FaCalendarAlt } from 'react-icons/fa';
import { getCategoryColor, getCategoryLabel, getCategoryGradient, getCategoryIcon } from '@/config/categories';
import { Post } from '@/types/post';
import { CategoryId } from '@/types/notion';
import { useState } from 'react';

// Hex color to rgba converter
const hexToRgba = (hex: string, alpha: number = 1) => {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Parse hex values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Return rgba color string
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

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

// 카테고리별 기본 이미지 URL
const DEFAULT_IMAGES: Record<string, string> = {
  'crypto-morning': '/images/categories/crypto-default.svg',
  'invest-insight': '/images/categories/invest-default.svg',
  'real-portfolio': '/images/categories/portfolio-default.svg',
  'code-lab': '/images/categories/code-default.svg',
  'daily-log': '/images/categories/daily-default.svg',
  'all': '/images/categories/default.svg',
};

type PostCardProps = {
  post: Post;
  hideCategory?: boolean;
  isMobileCompact?: boolean; // 모바일 모드에서 컴팩트 디자인 사용 여부
};

export default function PostCard({ post, hideCategory = false, isMobileCompact = false }: PostCardProps) {
  const [imageError, setImageError] = useState(false);
  
  const {
    slug,
    title,
    date,
    views = 0,
    category = 'all',
    excerpt,
    image,
    featured = false, // isPopular 대신 featured 사용
  } = post;

  const categoryColor = getCategoryColor(category);
  const categoryLabel = getCategoryLabel(category);
  const categoryGradient = getCategoryGradient(category);
  const CategoryIcon = getCategoryIcon(category);
  
  // 이미지 URL이 유효한지 확인
  const hasValidImage = isValidImageUrl(image) && !imageError;
  
  // 기본 이미지 URL 가져오기 (이미지가 없거나 오류가 있는 경우)
  const imageUrl = hasValidImage ? (image as string) : (DEFAULT_IMAGES[category] || DEFAULT_IMAGES['all']);

  return (
    <Link
      href={`/blog/${slug}`}
      className="group flex flex-col bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300"
    >
      {/* Category gradient top border */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${categoryGradient}`} />

      {/* 모바일 화면에서 컴팩트 디자인 (가로 배치) */}
      {isMobileCompact && (
        <div className="flex flex-row sm:hidden p-4 gap-3">
          {/* 썸네일 이미지 - 모바일에서만 보임 */}
          <div className="relative h-24 w-24 rounded-lg overflow-hidden shadow-sm flex-shrink-0">
            <Image
              src={imageUrl}
              alt={title}
              fill
              sizes="96px"
              className="object-cover"
              onError={() => setImageError(true)}
              unoptimized={imageUrl?.includes('amazonaws.com')} 
            />
          </div>
          
          {/* 컨텐츠 */}
          <div className="flex-1">
            {/* 카테고리 정보 */}
            {!hideCategory && (
              <div className="flex items-center gap-1.5 mb-2">
                <div
                  className="px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1"
                  style={{
                    backgroundColor: hexToRgba(categoryColor, 0.1),
                    color: categoryColor
                  }}
                >
                  {CategoryIcon && <CategoryIcon className="h-3 w-3" />}
                  {categoryLabel}
                </div>

              </div>
            )}
            
            {/* 제목 */}
            <h3 className="font-bold text-base line-clamp-2 group-hover:text-blue-600 transition-colors mb-2">
              {title}
            </h3>
            
            {/* 날짜 및 조회수 */}
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <div className="flex items-center">
                <FaCalendarAlt className="mr-1 h-2.5 w-2.5" />
                {format(new Date(date), 'yyyy.MM.dd', { locale: ko })}
              </div>

            </div>
          </div>
        </div>
      )}
      
      {/* 데스크톱 화면 디자인 (세로 배치) */}
      <div className={`hidden sm:flex flex-col h-full p-5 ${isMobileCompact ? '' : 'flex'}`}>
        {/* 카테고리 및 날짜 정보 */}
        <div className="flex items-center justify-between mb-3">
          {!hideCategory && (
            <div className="flex items-center gap-1.5">
              <div
                className="px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1"
                style={{
                  backgroundColor: hexToRgba(categoryColor, 0.1),
                  color: categoryColor
                }}
              >
                {CategoryIcon && <CategoryIcon className="h-3 w-3" />}
                {categoryLabel}
              </div>

            </div>
          )}
          
          <div className="flex items-center space-x-3 text-xs text-gray-500">
            <div className="flex items-center">
              <FaCalendarAlt className="mr-1 h-3 w-3" />
              {format(new Date(date), 'yyyy.MM.dd', { locale: ko })}
            </div>

          </div>
        </div>
        
        {/* 썸네일 이미지 - 항상 표시 */}
        <div className="relative aspect-[3/2] mb-4 rounded-lg overflow-hidden shadow-sm group-hover:shadow">
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-105"
            onError={() => setImageError(true)}
            unoptimized={imageUrl?.includes('amazonaws.com')} 
          />
          
          {/* Overlay gradient on hover */}
          <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 bg-gradient-to-b ${categoryGradient}`} />
        </div>

        {/* 제목 */}
        <h3 className="font-bold text-lg mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
          {title}
        </h3>
        

      </div>
    </Link>
  );
} 