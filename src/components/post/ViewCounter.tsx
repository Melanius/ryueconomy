'use client';

import { useEffect, useState } from 'react';

interface ViewCounterProps {
  slug: string;
  onViewCount?: (views: number) => void; // 조회수 변경 시 콜백 함수
}

/**
 * 게시물 조회수를 증가시키는 컴포넌트
 * 페이지 로드 시 자동으로 API를 호출하여 조회수를 증가시킵니다.
 */
export function ViewCounter({ slug, onViewCount }: ViewCounterProps) {
  // 조회수 상태 관리
  const [views, setViews] = useState<number | null>(null);
  const [isError, setIsError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // 페이지 로드 시 한 번만 실행
    const incrementViews = async () => {
      // slug가 없으면 실행하지 않음
      if (!slug) {
        console.error('ViewCounter: slug가 제공되지 않았습니다.');
        setIsError(true);
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        setIsError(false);
        
        // 개발 환경에서는 조회수 증가 API를 호출하지 않음
        const isDev = process.env.NODE_ENV === 'development';
        
        if (isDev) {
          console.log(`[개발환경] 게시물 조회수 증가 요청 생략: ${slug}`);
          setViews(100); // 개발 환경에서는 임의의 조회수 사용
          setIsLoading(false);
          
          // 콜백 실행
          if (onViewCount) {
            onViewCount(100);
          }
          return;
        }
        
        // 프로덕션 환경에서만 실행되는 코드
        // 로컬 스토리지 키
        const storageKey = `post-viewed-${slug}`;
        
        // 사용자가 이미 이 게시물을 봤는지 확인
        const viewedRecently = localStorage.getItem(storageKey);
        const lastViewTime = viewedRecently ? parseInt(viewedRecently, 10) : 0;
        const now = Date.now();
        const timeSinceLastView = now - lastViewTime;
        
        // 12시간(43,200,000ms) 내에 중복 조회 방지
        if (viewedRecently && timeSinceLastView < 43_200_000) {
          console.log(`이미 최근에 조회한 게시물입니다: ${slug}, 마지막 조회 후 ${Math.floor(timeSinceLastView / 60000)}분 경과`);
          
          // 이미 최근에 본 게시물이라도 조회수는 조회해야 함
          try {
            const viewResponse = await fetch('/api/views', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ slug }),
            });
            
            if (!viewResponse.ok) {
              throw new Error(`API 응답 실패: ${viewResponse.status}`);
            }
            
            const viewData = await viewResponse.json();
            console.log(`게시물 조회수 데이터 수신: ${slug}, ${viewData.views}회`);
            
            if (viewData.views) {
              setViews(viewData.views);
              onViewCount?.(viewData.views); // 콜백 실행
            }
          } catch (e) {
            console.error(`조회수 받기 오류 (${slug}):`, e);
          }
          
          setIsLoading(false);
          return;
        }
        
        // 조회수 증가 API 호출
        console.log(`게시물 조회수 증가 요청: ${slug}`);
        const response = await fetch('/api/views', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ slug }),
        });

        if (!response.ok) {
          throw new Error(`API 응답 실패: ${response.status}`);
        }

        const data = await response.json();

        console.log(`게시물 조회수 업데이트 결과: ${slug}, 성공=${data.success}, 조회수=${data.views}`);
        
        if (data.success) {
          // 조회수 상태 업데이트
          setViews(data.views);
          // 콜백 함수 호출 (부모 컴포넌트에 조회수 전달)
          if (onViewCount) {
            onViewCount(data.views);
          }
          // 현재 시간 기록 (중복 조회 방지용)
          localStorage.setItem(storageKey, now.toString());
          console.log(`로컬 스토리지 조회 기록 저장: ${slug}, 시간=${now}`);
        } else {
          console.error(`게시물 조회수 업데이트 실패: ${data.error || '알 수 없는 오류'}`);
          setIsError(true);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error(`게시물 조회수 업데이트 중 오류 (${slug}):`, error);
        setIsError(true);
        setIsLoading(false);
      }
    };

    incrementViews();
  }, [slug, onViewCount]); // slug나 onViewCount가 변경될 때 실행

  // UI를 반환하지 않는 경우
  return null;
}