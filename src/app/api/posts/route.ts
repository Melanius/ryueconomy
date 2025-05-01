// 최적화된 포스트 API (src/app/api/posts/route.ts)
import { NextRequest, NextResponse } from 'next/server';
import { getAllPosts } from '@/lib/notion';
import { CategoryId } from '@/types/notion';
import { logger } from '@/lib/logger';

/**
 * 페이지네이션, 정렬, 필터링 기능을 갖춘 포스트 API
 */
export async function GET(request: NextRequest) {
  try {
    logger.info('📥 GET /api/posts 요청 받음');
    
    // URL 파라미터 가져오기
    const searchParams = request.nextUrl.searchParams;
    
    // 페이지네이션 파라미터
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    
    // 정렬 파라미터
    const sortBy = (searchParams.get('sortBy') || 'date') as 'date' | 'views';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';
    
    // 필터링 파라미터
    const category = (searchParams.get('category') || 'all');
    
    // 성능 로깅 시작
    const startTime = Date.now();
    
    // 모든 포스트 가져오기
    const allPosts = await getAllPosts();
    
    // 카테고리 필터링
    const filteredPosts = category === 'all' 
      ? allPosts 
      : allPosts.filter(post => post.category === category);
    
    // 정렬 적용
    const sortedPosts = [...filteredPosts].sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      } else if (sortBy === 'views') {
        const viewsA = a.views || 0;
        const viewsB = b.views || 0;
        return sortOrder === 'desc' ? viewsB - viewsA : viewsA - viewsB;
      }
      return 0;
    });
    
    // 페이지네이션 적용
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedPosts = sortedPosts.slice(startIndex, endIndex);
    const hasMore = endIndex < sortedPosts.length;
    const total = sortedPosts.length;
    
    // 카테고리 통계 계산
    const categoryCount: Record<string, number> = {
      'all': allPosts.length,
      'crypto-morning': allPosts.filter(post => post.category === 'crypto-morning').length,
      'invest-insight': allPosts.filter(post => post.category === 'invest-insight').length,
      'real-portfolio': allPosts.filter(post => post.category === 'real-portfolio').length,
      'code-lab': allPosts.filter(post => post.category === 'code-lab').length,
      'daily-log': allPosts.filter(post => post.category === 'daily-log').length,
    };
    
    // 성능 로깅 종료
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    logger.info(`📤 GET /api/posts 응답 완료: ${paginatedPosts.length}개 포스트, ${responseTime}ms 소요`);
    
    // 응답 반환
    return NextResponse.json({
      page,
      pageSize,
      total,
      hasMore,
      posts: paginatedPosts,
      categoryStats: categoryCount,
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
    logger.error('🔴 /api/posts 오류:', error);
    
    return NextResponse.json(
      { 
        error: '포스트를 가져오는 중 오류가 발생했습니다.',
        message: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}