"use client";

import { useEffect } from 'react';

export default function VisitorCounter() {
  useEffect(() => {
    // 페이지 처음 로드 시 한 번만 호출하여 방문자 수 증가
    const incrementVisits = async () => {
      try {
        // 방문자 수 증가 API 호출
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