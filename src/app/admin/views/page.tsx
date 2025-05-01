'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import Link from 'next/link';
import { CategoryId } from '@/types/notion';

// 조회수 통계 데이터 인터페이스
interface ViewsStats {
  summary: {
    totalPosts: number;
    totalViews: number;
    averageViews: number;
    maxViews: number;
    minViews: number;
  };
  topPosts: {
    id: string;
    title: string;
    slug: string;
    views: number;
    category: CategoryId;
  }[];
}

// 조회수 모니터링 페이지
export default function ViewsMonitoringPage() {
  // 상태 관리
  const [statsData, setStatsData] = useState<ViewsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  
  // 통계 데이터 가져오기
  const fetchViewsStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/views/stats');
      
      if (!response.ok) {
        throw new Error(`API 응답 오류: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setStatsData(result.data);
        setLastUpdated(result.timestamp);
      } else {
        throw new Error(result.error || '알 수 없는 오류');
      }
    } catch (err) {
      console.error('조회수 통계 가져오기 오류:', err);
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
    } finally {
      setLoading(false);
    }
  };
  
  // 페이지 로드 시 데이터 가져오기
  useEffect(() => {
    fetchViewsStats();
    
    // 5분마다 자동 새로고침
    const interval = setInterval(fetchViewsStats, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // 카테고리 한글명 매핑
  const getCategoryName = (category: CategoryId): string => {
    const categoryMap: Record<CategoryId, string> = {
      'crypto-morning': '크립토 모닝',
      'invest-insight': '투자 인사이트',
      'real-portfolio': '포트폴리오',
      'code-lab': '코드 랩',
      'daily-log': '데일리 로그',
    };
    
    return categoryMap[category] || category;
  };
  
  // 통계 카드 컴포넌트
  const StatCard = ({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) => (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
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
    </div>
  );
  
  return (
    <AdminLayout title="조회수 모니터링">
      <div className="space-y-8">
        {/* 상단 액션 버튼 */}
        <div className="flex justify-between">
          <div className="flex space-x-4">
            <button
              onClick={fetchViewsStats}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading}
            >
              {loading ? '로딩 중...' : '새로고침'}
            </button>
          </div>
          {lastUpdated && (
            <div className="text-sm text-gray-500">
              마지막 업데이트: {new Date(lastUpdated).toLocaleString('ko-KR')}
            </div>
          )}
        </div>
        
        {/* 오류 메시지 */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">오류: {error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* 로딩 중 표시 */}
        {loading && !statsData && (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        {/* 통계 카드 */}
        {statsData && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="총 게시물 수"
              value={statsData.summary.totalPosts}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              }
            />
            
            <StatCard
              title="총 조회수"
              value={statsData.summary.totalViews}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              }
            />
            
            <StatCard
              title="평균 조회수"
              value={statsData.summary.averageViews}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
            />
            
            <StatCard
              title="최고 조회수"
              value={statsData.summary.maxViews}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              }
            />
          </div>
        )}
        
        {/* 인기 게시물 테이블 */}
        {statsData && (
          <div className="flex flex-col mt-8">
            <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          제목
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          카테고리
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          조회수
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          링크
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {statsData.topPosts.map((post) => (
                        <tr key={post.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {post.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {post.slug}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {getCategoryName(post.category)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {post.views}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Link href={`/post/${post.slug}`} className="text-blue-600 hover:text-blue-900" target="_blank">
                              게시물 보기
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* 조회수 최적화 가이드 */}
        <div className="bg-white shadow rounded-lg overflow-hidden mt-8">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">조회수 시스템 최적화 가이드</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>
                조회수 시스템은 Notion API를 통해 작동하며, 다음과 같은 방식으로 최적화되어 있습니다:
              </p>
            </div>
            <div className="mt-3">
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-500">
                <li>서버 사이드 캐싱으로 Notion API 호출 최소화 (10분간 캐시)</li>
                <li>사용자별 로컬 스토리지 기반 중복 카운팅 방지 (12시간 간격)</li>
                <li>동일 세션에서 API 호출 최소화를 위한 메모리 캐시 활용</li>
                <li>비정상적인 접근 패턴 감지 (개발 예정)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
