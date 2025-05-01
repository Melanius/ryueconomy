// 카테고리별 통계 API (src/app/api/stats/categories/route.ts)
import { NextRequest, NextResponse } from 'next/server';
import { getAllPosts } from '@/lib/notion';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    logger.info('📥 GET /api/stats/categories 요청 받음');
    
    // 성능 로깅 시작
    const startTime = Date.now();
    
    // 모든 포스트 가져오기
    const posts = await getAllPosts();
    
    // 카테고리별 통계 계산
    const categoryCounts: Record<string, { count: number, lastUpdated: string }> = {
      'all': { 
        count: posts.length, 
        lastUpdated: posts.length > 0 
          ? posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date
          : new Date().toISOString().split('T')[0]
      }
    };
    
    // 각 카테고리별 포스트 수와 최신 업데이트 날짜 계산
    const categories = ['crypto-morning', 'invest-insight', 'real-portfolio', 'code-lab', 'daily-log'];
    categories.forEach(category => {
      const categoryPosts = posts.filter(post => post.category === category);
      const latestPost = categoryPosts.length > 0 
        ? categoryPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
        : null;
        
      categoryCounts[category] = {
        count: categoryPosts.length,
        lastUpdated: latestPost ? latestPost.date : ''
      };
    });
    
    const totalCount = posts.length;
    
    // 각 카테고리별 비율 계산
    const statsWithPercentage = Object.fromEntries(
      Object.entries(categoryCounts).map(([category, data]) => {
        const percentage = category !== 'all' 
          ? Math.round((data.count / totalCount) * 100) 
          : 100;
        
        return [category, { ...data, percentage }];
      })
    );
    
    // 차트 데이터 형식으로 변환
    const chartData = Object.keys(categoryCounts)
      .filter(category => category !== 'all')
      .map(category => ({
        category,
        count: categoryCounts[category].count,
        percentage: Math.round((categoryCounts[category].count / totalCount) * 100),
        lastUpdated: categoryCounts[category].lastUpdated
      }));
    
    // 성능 로깅 종료
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    logger.info(`📤 GET /api/stats/categories 응답 완료: ${responseTime}ms 소요`);
    
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
    logger.error('🔴 /api/stats/categories 오류:', error);
    
    return NextResponse.json(
      { 
        error: '카테고리 통계를 가져오는 중 오류가 발생했습니다.',
        message: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}