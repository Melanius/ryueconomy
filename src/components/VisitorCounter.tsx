"use client";

import { useEffect } from 'react';

export default function VisitorCounter() {
  useEffect(() => {
    // 페이지 처음 로드 시 한 번만 호출하여 방문자 수 증가
    const incrementVisits = async () => {
      try {
        // 개발 환경에서 콘솔 로그만 출력하고 API는 호출하지 않음
        if (process.env.NODE_ENV === 'development') {
          console.log('[개발환경] 방문자 수 증가 요청 생략');
          return; // 개발 환경에서는 API 호출 생략
        }
        
        // 방문자 수 증가 API 호출 (프로덕션 환경에서만)
        await fetch('/api/visits', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        console.error('방문자 수 증가 오류:', error);
      }
    };

    // 페이지가 처음 로드될 때만 방문자 수 증가
    incrementVisits();
  }, []);

  // 눈에 보이지 않는 컴포넌트 반환
  return null;
} 