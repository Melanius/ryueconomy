"use client";

import React, { useEffect, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { getCategoryLabel } from '@/styles/category-colors';
import { CategoryId } from '@/types/notion';

// 월별 게시물 데이터 타입
interface MonthData {
  month: string;
  count: number;
  category?: CategoryId;
}

// 월 이름 변환 함수
const getMonthName = (monthStr: string): string => {
  const months = [
    "1월", "2월", "3월", "4월", "5월", "6월",
    "7월", "8월", "9월", "10월", "11월", "12월"
  ];
  
  const monthIndex = parseInt(monthStr) - 1;
  return months[monthIndex] || monthStr;
};

// 커스텀 툴팁 컴포넌트
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 shadow-md rounded-md border border-gray-200">
        <p className="font-semibold">{getMonthName(label)}</p>
        {payload.map((entry: any, index: number) => (
          <p key={`tooltip-${index}`} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}개
          </p>
        ))}
      </div>
    );
  }

  return null;
};

interface MonthlyPostsChartProps {
  className?: string;
  year?: string;
  showCategories?: boolean;
}

// 카테고리 색상 정의
const CATEGORY_COLORS = {
  'crypto-morning': '#E03E3E',
  'invest-insight': '#FF9F43',
  'real-portfolio': '#0B6BCB',
  'code-lab': '#0F9D58',
  'daily-log': '#F5C400',
  'all': '#4361ee'
};

// 월별 게시물 차트 컴포넌트
const MonthlyPostsChart: React.FC<MonthlyPostsChartProps> = ({
  className = "",
  year = new Date().getFullYear().toString(),
  showCategories = true
}) => {
  const [chartData, setChartData] = useState<MonthData[]>([]);
  const [categoryData, setCategoryData] = useState<Record<CategoryId, MonthData[]>>({} as Record<CategoryId, MonthData[]>);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>(year);
  const [availableYears, setAvailableYears] = useState<string[]>([]);

  // 연도 변경 핸들러
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(e.target.value);
  };

  // 데이터 가져오기
  useEffect(() => {
    const fetchMonthlyData = async () => {
      try {
        setLoading(true);
        
        // 데이터 가져오기
        const response = await fetch('/api/posts?pageSize=1000');
        
        if (!response.ok) {
          throw new Error('월별 게시물 데이터를 가져오는데 실패했습니다.');
        }
        
        const data = await response.json();
        const posts = data.posts;
        
        // 연도별 데이터 처리
        const yearData: Record<string, Record<string, number>> = {};
        const categoryYearData: Record<CategoryId, Record<string, Record<string, number>>> = {
          'crypto-morning': {},
          'invest-insight': {},
          'real-portfolio': {},
          'code-lab': {},
          'daily-log': {}
        };
        
        // 사용 가능한 연도 추출
        const years = new Set<string>();
        
        posts.forEach((post: any) => {
          const postDate = new Date(post.date);
          const postYear = postDate.getFullYear().toString();
          const postMonth = (postDate.getMonth() + 1).toString().padStart(2, '0');
          const category = post.category as CategoryId;
          
          // 사용 가능한 연도 추가
          years.add(postYear);
          
          // 전체 연도별 데이터
          if (!yearData[postYear]) {
            yearData[postYear] = {};
          }
          
          if (!yearData[postYear][postMonth]) {
            yearData[postYear][postMonth] = 0;
          }
          
          yearData[postYear][postMonth]++;
          
          // 카테고리별 연도 데이터
          if (!categoryYearData[category][postYear]) {
            categoryYearData[category][postYear] = {};
          }
          
          if (!categoryYearData[category][postYear][postMonth]) {
            categoryYearData[category][postYear][postMonth] = 0;
          }
          
          categoryYearData[category][postYear][postMonth]++;
        });
        
        // 연도 목록 정렬
        setAvailableYears(Array.from(years).sort().reverse());
        
        // 차트 데이터 형식으로 변환
        const formatChartData = (yearMonthData: Record<string, number>): MonthData[] => {
          // 모든 월 초기화 (데이터가 없는 월도 0으로 표시)
          const monthsData: MonthData[] = [];
          
          for (let i = 1; i <= 12; i++) {
            const month = i.toString().padStart(2, '0');
            monthsData.push({
              month,
              count: yearMonthData[month] || 0
            });
          }
          
          return monthsData;
        };
        
        // 선택한 연도의 데이터 설정
        if (yearData[selectedYear]) {
          setChartData(formatChartData(yearData[selectedYear]));
          
          // 카테고리별 데이터 설정
          const categoryMonthData: Record<CategoryId, MonthData[]> = {} as Record<CategoryId, MonthData[]>;
          
          Object.entries(categoryYearData).forEach(([category, yearMonthData]) => {
            if (yearMonthData[selectedYear]) {
              categoryMonthData[category as CategoryId] = formatChartData(yearMonthData[selectedYear]);
            } else {
              // 데이터가 없는 경우 0으로 초기화
              categoryMonthData[category as CategoryId] = Array.from({ length: 12 }, (_, i) => ({
                month: (i + 1).toString().padStart(2, '0'),
                count: 0,
                category: category as CategoryId
              }));
            }
          });
          
          setCategoryData(categoryMonthData);
        } else {
          // 선택한 연도의 데이터가 없는 경우 빈 배열 설정
          setChartData([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('월별 게시물 데이터 가져오기 오류:', err);
        setError(err instanceof Error ? err.message : '알 수 없는 오류');
        setLoading(false);
      }
    };

    fetchMonthlyData();
  }, [selectedYear]);

  if (loading) {
    return (
      <div className={`flex justify-center items-center h-64 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
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

  return (
    <div className={`bg-white rounded-lg shadow-sm p-4 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">월별 게시물 추세</h3>
        
        <select 
          value={selectedYear} 
          onChange={handleYearChange}
          className="px-2 py-1 border rounded text-sm"
        >
          {availableYears.map(year => (
            <option key={year} value={year}>{year}년</option>
          ))}
        </select>
      </div>
      
      {chartData.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">{selectedYear}년 데이터가 없습니다.</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="month" 
              tickFormatter={getMonthName}
              fontSize={12} 
            />
            <YAxis allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            {showCategories ? (
              Object.entries(categoryData).map(([category, data]) => (
                <Bar
                  key={category}
                  name={getCategoryLabel(category as CategoryId)}
                  dataKey="count"
                  fill={CATEGORY_COLORS[category as CategoryId] || '#777'}
                  data={data}
                  stackId="a"
                />
              ))
            ) : (
              <Bar
                dataKey="count"
                fill="#4361ee"
                name="게시물 수"
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      )}
      
      <div className="mt-4 text-center text-xs text-gray-500">
        {selectedYear}년 게시물 수: {chartData.reduce((sum, item) => sum + item.count, 0)}개
      </div>
    </div>
  );
};

export default MonthlyPostsChart;