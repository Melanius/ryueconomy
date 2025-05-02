'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import Link from 'next/link';

// 대시보드 카드 컴포넌트
interface DashboardCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  color: string;
}

function DashboardCard({ title, value, description, icon, color }: DashboardCardProps) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 rounded-md p-3 ${color}`}>
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-medium text-gray-900">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-5 py-3">
        <div className="text-sm text-gray-500">{description}</div>
      </div>
    </div>
  );
}

// 관리자 대시보드 페이지
export default function AdminDashboard() {
  // 리소스 카드 목록
  const resourceCards = [
    {
      title: '조회수 모니터링',
      description: '게시물의 조회수 통계를 모니터링합니다.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      color: 'bg-green-500',
      link: '/admin/views'
    },
    {
      title: '블로그 홈',
      description: '블로그 메인 페이지로 이동합니다.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      color: 'bg-green-500',
      link: '/'
    }
  ];
  
  return (
    <AdminLayout title="관리자 대시보드">
      <div className="space-y-8">
        {/* 상태 카드 섹션 */}
        <div>
          <h2 className="text-xl font-semibold mb-4">시스템 상태</h2>
          
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {/* 서버 상태 카드 */}
            <DashboardCard
              title="서버 상태"
              value="정상"
              description="서버가 정상적으로 실행 중입니다."
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2H5z" />
                </svg>
              }
              color="bg-green-500"
            />
            
            {/* Notion API 상태 카드 */}
            <DashboardCard
              title="Notion API 상태"
              value="연결됨"
              description="Notion API와 정상적으로 연결되어 있습니다."
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              color="bg-indigo-500"
            />
          </div>
        </div>
        
        {/* 리소스 카드 섹션 */}
        <div>
          <h2 className="text-xl font-semibold mb-4">관리 옵션</h2>
          
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {resourceCards.map((card, index) => (
              <Link href={card.link} key={index} className="block">
                <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 rounded-md p-3 ${card.color}`}>
                        {card.icon}
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <h3 className="text-lg font-medium text-gray-900">{card.title}</h3>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-5 py-3">
                    <div className="text-sm text-gray-500">{card.description}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
        
        {/* 관리자 가이드 섹션 */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">관리자 가이드</h3>
            <div className="mt-4 text-sm text-gray-500">
              <p className="mb-2">
                이 관리자 패널에서는 블로그의 다양한 기능들을 관리할 수 있습니다.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>조회수 모니터링</strong>: 블로그 게시물의 조회수를 확인하고 분석합니다.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
