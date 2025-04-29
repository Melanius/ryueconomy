// 카테고리별 통계 API (src/app/api/stats/categories/route.ts)
import { NextRequest, NextResponse } from 'next/server';
import { getCategoryStats } from '@/lib/cache/notion-cache';

export async function GET(request: NextRequest) {
  try {
    console.log('📥 GET /api/stats/categories 요청 받음');
    
    // 성능 로깅 시작
    const startTime = Date.now();
    
    // 카테고리별 통계 가져오기
    const categoryStats = await getCategoryStats();
    
    // 추가 시각화를 위한 데이터 가공
    const categories = Object.keys(categoryStats);
    const totalCount = categoryStats['all'].count;
    
    // 각 카테고리별 비율 계산
    const statsWithPercentage = Object.fromEntries(
      Object.entries(categoryStats).map(([category, data]) => {
        const percentage = category !== 'all' 
          ? Math.round((data.count / totalCount) * 100) 
          : 100;
        
        return [category, { ...data, percentage }];
      })
    );
    
    // 차트 데이터 형식으로 변환
    const chartData = categories
      .filter(category => category !== 'all')
      .map(category => ({
        category,
        count: categoryStats[category].count,
        percentage: Math.round((categoryStats[category].count / totalCount) * 100),
        lastUpdated: categoryStats[category].lastUpdated
      }));
    
    // 성능 로깅 종료
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log(`📤 GET /api/stats/categories 응답 완료: ${responseTime}ms 소요`);
    
    // 응답 반환
    return NextResponse.json({
      categories: statsWithPercentage,
      chartData,
      total: totalCount,
      meta: {
        responseTime,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('🔴 /api/stats/categories 오류:', error);
    
    return NextResponse.json(
      { 
        error: '카테고리 통계를 가져오는 중 오류가 발생했습니다.',
        message: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}