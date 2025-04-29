'use client';

import { ViewCounter } from './ViewCounter';

interface ViewCounterWrapperProps {
  slug: string;
}

// 클라이언트 컴포넌트 래퍼
export default function ViewCounterWrapper({ slug }: ViewCounterWrapperProps) {
  return (
    <ViewCounter 
      slug={slug} 
      onViewCount={(views) => {
        // 개발 환경에서는 로그 출력하지 않음
        if (process.env.NODE_ENV === 'production') {
          console.log(`게시물 ${slug}의 조회수가 ${views}로 업데이트됨`);
        }
      }}
    />
  );
}