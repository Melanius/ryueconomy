"use client";

import React, { useEffect, useState } from 'react';
import { CategoryId } from '@/types/notion';
import CategoryDistributionChart from '../charts/CategoryDistributionChart';
import MonthlyPostsChart from '../charts/MonthlyPostsChart';
import { getCategoryLabel } from '@/styles/category-colors';

// 카테고리별 색상 가져오기
const getCategoryColor = (category: CategoryId): string => {
  const colorMap: Record<CategoryId, string> = {
    'crypto-morning': '#E03E3E',
    'invest-insight': '#FF9F43',
    'real-portfolio': '#0B6BCB',
    'code-lab': '#0F9D58',
    'daily-log': '#F5C400',
    'all': '#4361ee'
  };
  
  return colorMap[category] || '#777';
};

// 통계 데이터 타입
interface CategoryStats {
  count: number;
  percentage: number;
  lastUpdated: string;
}

interface StatsDashboardProps {
  className?: string;
}

// 통계 대시보드 컴포넌트
const StatsDashboard: React.FC<StatsDashboardProps> = ({ 
  className = "" 
}) => {
  const [categoryStats, setCategoryStats] = useState<Record<CategoryId, CategoryStats>>({} as Record<CategoryId, CategoryStats>);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'monthly' | 'categories'>('overview');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/stats/categories');
        
        if (!response.ok) {
          throw new Error('통계 데이터를 가져오는데 실패했습니다.');
        }
        
        const data = await response.json();
        setCategoryStats(data.categories);
        setTotal(data.total);
        setLoading(false);
      } catch (err) {
        console.error('통계 데이터 가져오기 오류:', err);
        setError(err instanceof Error ? err.message : '알 수 없는 오류');
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-lg font-semibold mb-4">게시물 현황 요약</h3>
              
              {loading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              ) : error ? (
                <div className="text-red-500">
                  <p>오류가 발생했습니다</p>
                  <p className="text-sm mt-2">{error}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="font-semibold text-gray-900">
                    전체 게시물: <span className="text-blue-600">{total}개</span>
                  </p>
                  
                  <div className="mt-4 space-y-2">
                    {Object.entries(categoryStats)
                      .filter(([category]) => category !== 'all')
                      .sort((a, b) => b[1].count - a[1].count)
                      .map(([category, stats]) => (
                        <div key={category} className="flex justify-between items-center">
                          <span>{getCategoryLabel(category as CategoryId)}</span>
                          <div className="flex items-center">
                            <span className="mr-2">{stats.count}개</span>
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className="h-2 rounded-full" 
                                style={{ 
                                  width: `${stats.percentage}%`,
                                  backgroundColor: getCategoryColor(category as CategoryId) 
                                }}
                              ></div>
                            </div>
                            <span className="ml-2 text-xs text-gray-500">{stats.percentage}%</span>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
                    최근 업데이트: {
                      categoryStats.all?.lastUpdated 
                        ? new Date(categoryStats.all.lastUpdated).toLocaleDateString()
                        : '데이터 없음'
                    }
                  </div>
                </div>
              )}
            </div>
            
            <CategoryDistributionChart />
          </div>
        );
        
      case 'monthly':
        return <MonthlyPostsChart />;
        
      case 'categories':
        return (
          <div className="space-y-6">
            <CategoryDistributionChart />
            
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-lg font-semibold mb-4">카테고리별 통계</h3>
              
              {loading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              ) : error ? (
                <div className="text-red-500">
                  <p>오류가 발생했습니다</p>
                  <p className="text-sm mt-2">{error}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(categoryStats)
                    .filter(([category]) => category !== 'all')
                    .sort((a, b) => b[1].count - a[1].count)
                    .map(([category, stats]) => (
                      <div 
                        key={category} 
                        className="border rounded-lg p-3"
                        style={{ borderColor: getCategoryColor(category as CategoryId) }}
                      >
                        <h4 
                          className="font-medium mb-2"
                          style={{ color: getCategoryColor(category as CategoryId) }}
                        >
                          {getCategoryLabel(category as CategoryId)}
                        </h4>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500">게시물 수:</span> {stats.count}개
                          </div>
                          <div>
                            <span className="text-gray-500">비율:</span> {stats.percentage}%
                          </div>
                          <div className="col-span-2">
                            <span className="text-gray-500">최근 업데이트:</span> {
                              stats.lastUpdated 
                                ? new Date(stats.lastUpdated).toLocaleDateString()
                                : '데이터 없음'
                            }
                          </div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
      <h2 className="text-xl font-semibold mb-4">블로그 통계 대시보드</h2>
      
      <div className="mb-4 border-b">
        <div className="flex space-x-4">
          <button
            className={`pb-2 px-1 ${
              activeTab === 'overview'
                ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            개요
          </button>
          <button
            className={`pb-2 px-1 ${
              activeTab === 'monthly'
                ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('monthly')}
          >
            월별 추세
          </button>
          <button
            className={`pb-2 px-1 ${
              activeTab === 'categories'
                ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('categories')}
          >
            카테고리 분석
          </button>
        </div>
      </div>
      
      {renderTabContent()}
    </div>
  );
};

export default StatsDashboard;