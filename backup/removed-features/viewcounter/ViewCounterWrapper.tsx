'use client';

import ViewCounter from '@/components/ViewCounter';
import { ReactNode } from 'react';

// ViewCounterWrapper 컴포넌트 - 오류 수정됨
export default function ViewCounterWrapper({
  slug,
  initialViews = 0,
  showCount = true,
  children = null
}: {
  slug: string;
  initialViews: number;
  showCount?: boolean;
  children?: ReactNode;
}) {
  return (
    <>
      <ViewCounter 
        slug={slug}
        initialViews={initialViews}
        showCount={showCount}
      />
      {children && typeof children !== 'function' ? children : null}
    </>
  );
}