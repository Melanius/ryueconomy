import { NextRequest, NextResponse } from 'next/server';
import { fetchPostsByViews } from '@/lib/notion/api';
import { logger } from '@/lib/logger';

// 캐시를 활용한 API 요청 최적화를 위한 Map (메모리 캐시)
const statsCache = new Map<string, {data: any, timestamp: number}>();

// 캐시 만료 시간 (10분)
const CACHE_EXPIRY = 10 * 60 * 1000;

/**
 * 조회수 통계 API
 * 게시물의 조회수 관련 통계 정보를 제공합니다.
 */
export async function GET(request: NextRequest) {
  try {
    // API 키 확인 (인증용, 필요한 경우 주석 해제)
    // const { searchParams } = new URL(request.url);
    // const apiKey = searchParams.get('apiKey');
    // const adminApiKey = process.env.ADMIN_API_KEY;
    
    // if (!apiKey || apiKey !== adminApiKey) {
    //   logger.warn('조회수 통계 API 호출 - 인증 실패');
    //   return NextResponse.json({ 
    //     success: false, 
    //     error: '인증 실패' 
    //   }, { status: 401 });
    // }
    
    // 캐시 키 설정 - 쿼리 파라미터 추가 가능
    const cacheKey = 'views-stats';
    
    // 캐시 확인
    const cachedData = statsCache.get(cacheKey);
    const now = Date.now();
    
    // 캐시가 유효한 경우
    if (cachedData && (now - cachedData.timestamp) < CACHE_EXPIRY) {
      logger.info(`조회수 통계 캐시에서 반환`);
      
      return NextResponse.json({
        success: true,
        cached: true,
        timestamp: new Date(cachedData.timestamp).toISOString(),
        data: cachedData.data
      });
    }
    
    // 캐시가 없거나 만료된 경우 새로 조회
    logger.info(`조회수 통계 새로 조회 시작`);
    
    // 1. 전체 포스트 목록에서 조회수 기준으로 정렬하여 상위 10개 가져오기
    const topViewedPosts = await fetchPostsByViews(10);
    
    // 2. 통계 데이터 생성
    // 전체 조회수 합계, 평균, 최대, 최소 등 계산
    let totalViews = 0;
    let maxViews = 0;
    let minViews = topViewedPosts.length > 0 ? topViewedPosts[0].views : 0;
    
    topViewedPosts.forEach(post => {
      const views = post.views || 0;
      totalViews += views;
      
      if (views > maxViews) {
        maxViews = views;
      }
      
      if (views < minViews) {
        minViews = views;
      }
    });
    
    const avgViews = topViewedPosts.length > 0 
      ? Math.round(totalViews / topViewedPosts.length) 
      : 0;
    
    // 3. 결과 데이터 구성
    const statsData = {
      summary: {
        totalPosts: topViewedPosts.length,
        totalViews,
        averageViews: avgViews,
        maxViews,
        minViews
      },
      topPosts: topViewedPosts.map(post => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        views: post.views || 0,
        category: post.category
      }))
    };
    
    // 4. 캐시 저장
    statsCache.set(cacheKey, {
      data: statsData,
      timestamp: now
    });
    
    logger.info(`조회수 통계 조회 완료: 총 ${totalViews}회 조회, 게시물 ${topViewedPosts.length}개`);
    
    // 5. 결과 반환
    return NextResponse.json({
      success: true,
      cached: false,
      timestamp: new Date().toISOString(),
      data: statsData
    });
  } catch (error) {
    logger.error(`조회수 통계 API 오류:`, error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 });
  }
}
