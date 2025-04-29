// 블로그 통계 페이지 (src/app/stats/page.tsx)
import React from 'react';
import { Metadata } from 'next';
import StatsDashboard from '@/components/dashboard/StatsDashboard';

// 메타데이터
export const metadata: Metadata = {
  title: '블로그 통계 | 류이코노미(RyuEconomy)',
  description: '류이코노미 블로그의 통계와 분석을 확인하세요. 카테고리별 게시물 분포, 월별 게시물 추세 등 다양한 통계 정보를 제공합니다.',
};

export default function StatsPage() {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">블로그 통계</h1>
        <p className="text-gray-600">
          류이코노미 블로그의 통계와 분석 정보입니다.
        </p>
      </div>
      
      <StatsDashboard className="mb-8" />
      
      <div className="bg-white rounded-lg shadow-sm p-4 mt-8">
        <h2 className="text-xl font-semibold mb-4">통계 정보 안내</h2>
        <p className="text-gray-600 mb-4">
          이 페이지에서는 류이코노미 블로그의 다양한 통계 정보를 확인할 수 있습니다.
          카테고리별 게시물 분포, 월별 게시물 추세 등을 시각적으로 확인할 수 있습니다.
        </p>
        <p className="text-gray-600">
          통계 데이터는 자동으로 수집되며, 일정 시간 간격으로 업데이트됩니다.
          최근 게시물 현황과 동향을 파악하는데 도움이 되길 바랍니다.
        </p>
      </div>
    </div>
  );
}