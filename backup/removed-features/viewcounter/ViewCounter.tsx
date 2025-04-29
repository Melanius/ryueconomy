"use client";

import { useEffect, useState } from 'react';
import { FaEye } from 'react-icons/fa';

interface ViewCounterProps {
  slug: string;
  initialViews?: number;
  showCount?: boolean;
}

export default function ViewCounter({ slug, initialViews = 0, showCount = true }: ViewCounterProps) {
  const [views, setViews] = useState(initialViews);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log(`[ViewCounter] Component mounted for slug: ${slug}`);
    console.log(`[ViewCounter] Initial views: ${initialViews}`);

    const incrementViews = async () => {
      if (!slug) {
        setError('슬러그가 없습니다');
        setLoading(false);
        return;
      }
      
      try {
        console.log(`[ViewCounter] Attempting to increment views for slug: ${slug}`);
        const response = await fetch(`/api/views/${slug}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store'
        });

        if (!response.ok) {
          throw new Error(`Failed to increment views: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`[ViewCounter] Successfully incremented views. New count: ${data.views}`);
        
        if (data.success === true) {
          if (typeof data.views === 'number') {
            console.log(`[ViewCounter] 조회수 업데이트: ${initialViews} → ${data.views}`);
            setViews(data.views);
            setError(null);
          } else {
            console.error('[ViewCounter] 응답에 views 값이 없거나 숫자가 아님');
            setError('응답 형식 오류');
          }
        } else {
          console.error('[ViewCounter] API 응답 성공 불가:', data.message || '알 수 없는 오류');
          setError(data.message || '알 수 없는 오류');
        }
      } catch (err) {
        console.error(`[ViewCounter] Error incrementing views:`, err);
        setError('조회수 처리 중 오류 발생');
      } finally {
        setLoading(false);
        console.log(`[ViewCounter] Loading state set to false`);
      }
    };

    incrementViews();

    return () => {
      console.log(`[ViewCounter] Component unmounting for slug: ${slug}`);
    };
  }, [slug, initialViews]);

  if (error) {
    console.error(`[ViewCounter] Rendering error state: ${error}`);
    return (
      <span className="flex items-center text-sm text-muted-foreground group relative">
        <FaEye className="mr-1 h-3 w-3" />
        {views.toLocaleString()}
      </span>
    );
  }

  if (loading) {
    console.log(`[ViewCounter] Rendering loading state`);
    return (
      <span className="flex items-center text-sm text-muted-foreground group relative">
        <FaEye className="mr-1 h-3 w-3" />
        {initialViews.toLocaleString()}
      </span>
    );
  }

  if (!showCount) {
    console.log(`[ViewCounter] View count hidden, not rendering count`);
    return null;
  }

  console.log(`[ViewCounter] Rendering view count: ${views}`);
  return (
    <span className="flex items-center text-sm text-muted-foreground group relative">
      <FaEye className="mr-1 h-3 w-3" />
      {views.toLocaleString()}
    </span>
  );
} 