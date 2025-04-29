"use client";

import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getCategoryLabel } from '@/styles/category-colors';
import { CategoryId } from '@/types/notion';

// 차트 데이터 타입 정의
interface CategoryChartData {
  category: CategoryId;
  count: number;
  percentage: number;
  lastUpdated: string;
}

// 카테고리별 색상 지정
const CATEGORY_COLORS = {
  'crypto-morning': '#E03E3E',
  'invest-insight': '#FF9F43',
  'real-portfolio': '#0B6BCB',
  'code-lab': '#0F9D58',
  'daily-log': '#F5C400',
  'all': '#4361ee'
};

// 커스텀 툴팁 컴포넌트
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 shadow-md rounded-md border border-gray-200">
        <p className="font-semibold">{getCategoryLabel(data.category as CategoryId)}</p>
        <p className="text-sm">게시물 수: {data.count}개</p>
        <p className="text-sm">비율: {data.percentage}%</p>
        <p className="text-xs text-gray-500">
          최근 업데이트: {new Date(data.lastUpdated).toLocaleDateString()}
        </p>
      </div>
    );
  }

  return null;
};

// 커스텀 범례 렌더러
const CustomLegend = (props: any) => {
  const { payload } = props;
  
  return (
    <ul className="flex flex-wrap justify-center gap-4 mt-4">
      {payload.map((entry: any, index: number) => (
        <li key={`legend-${index}`} className="flex items-center">
          <div 
            className="w-3 h-3 rounded-full mr-2" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm">
            {getCategoryLabel(entry.value as CategoryId)}
            <span className="ml-1 text-gray-500">
              ({entry.payload.count}개)
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
};

interface CategoryDistributionChartProps {
  className?: string;
}

// 카테고리 분포도 차트 컴포넌트
const CategoryDistributionChart: React.FC<CategoryDistributionChartProps> = ({ 
  className = "" 
}) => {
  const [chartData, setChartData] = useState<CategoryChartData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategoryStats = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/stats/categories');
        
        if (!response.ok) {
          throw new Error('카테고리 통계를 가져오는데 실패했습니다.');
        }
        
        const data = await response.json();
        setChartData(data.chartData);
        setLoading(false);
      } catch (err) {
        console.error('카테고리 통계 가져오기 오류:', err);
        setError(err instanceof Error ? err.message : '알 수 없는 오류');
        setLoading(false);
      }
    };

    fetchCategoryStats();
  }, []);

  if (loading) {
    return (
      <div className={`flex justify-center items-center h-64 ${className}`}>
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-gray-200 h-12 w-12"></div>
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex justify-center items-center h-64 ${className}`}>
        <div className="text-center text-red-500">
          <p>오류가 발생했습니다</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className={`flex justify-center items-center h-64 ${className}`}>
        <p className="text-gray-500">표시할 데이터가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm p-4 ${className}`}>
      <h3 className="text-lg font-semibold mb-4 text-center">카테고리별 게시물 분포</h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            innerRadius={40}
            paddingAngle={5}
            dataKey="count"
            nameKey="category"
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={CATEGORY_COLORS[entry.category] || '#777'} 
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            content={<CustomLegend />}
            layout="horizontal"
            verticalAlign="bottom"
            align="center" 
          />
        </PieChart>
      </ResponsiveContainer>
      
      <div className="mt-4 text-center text-xs text-gray-500">
        전체 게시물 수: {chartData.reduce((sum, item) => sum + item.count, 0)}개
      </div>
    </div>
  );
};

export default CategoryDistributionChart;