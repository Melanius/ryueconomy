// 최적화된 포스트 API (src/app/api/posts/route.ts)
import { NextRequest, NextResponse } from 'next/server';
import { getPaginatedPosts, getCategoryStats } from '@/lib/cache/notion-cache';
import { CategoryId } from '@/types/notion';

/**
 * 페이지네이션, 정렬, 필터링 기능을 갖춘 포스트 API
 */
export async function GET(request: NextRequest) {
  try {
    console.log('📥 GET /api/posts 요청 받음');
    
    // URL 파라미터 가져오기
    const searchParams = request.nextUrl.searchParams;
    
    // 페이지네이션 파라미터
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    
    // 정렬 파라미터
    const sortBy = (searchParams.get('sortBy') || 'date') as 'date' | 'views';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';
    
    // 필터링 파라미터
    const category = (searchParams.get('category') || 'all') as CategoryId;
    
    // 성능 로깅 시작
    const startTime = Date.now();
    
    // 포스트 가져오기
    const { posts, hasMore, total } = await getPaginatedPosts(
      category,
      page,
      pageSize,
      sortBy,
      sortOrder
    );
    
    // 카테고리 통계 가져오기
    const categoryStats = await getCategoryStats();
    
    // 성능 로깅 종료
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log(`📤 GET /api/posts 응답 완료: ${posts.length}개 포스트, ${responseTime}ms 소요`);
    
    // 응답 반환
    return NextResponse.json({
      page,
      pageSize,
      total,
      hasMore,
      posts,
      categoryStats,
      meta: {
        responseTime,
        timestamp: new Date().toISOString(),
        query: {
          category,
          sortBy,
          sortOrder
        }
      }
    });
  } catch (error) {
    console.error('🔴 /api/posts 오류:', error);
    
    return NextResponse.json(
      { 
        error: '포스트를 가져오는 중 오류가 발생했습니다.',
        message: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}