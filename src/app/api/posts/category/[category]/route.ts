// 카테고리별 포스트 API (src/app/api/posts/category/[category]/route.ts)
import { NextRequest, NextResponse } from 'next/server';
import { getPostsByCategory } from '@/lib/cache/notion-cache';
import { CategoryId } from '@/types/notion';

export async function GET(
  request: NextRequest,
  { params }: { params: { category: string } }
) {
  try {
    console.log(`📥 GET /api/posts/category/${params.category} 요청 받음`);
    
    const { category } = params;
    
    // 카테고리 유효성 검사
    const validCategories = ['all', 'crypto-morning', 'invest-insight', 'real-portfolio', 'code-lab', 'daily-log'];
    
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: '유효하지 않은 카테고리입니다.' },
        { status: 400 }
      );
    }
    
    // URL 파라미터 가져오기
    const searchParams = request.nextUrl.searchParams;
    
    // 정렬 파라미터 (기본값: 최신순)
    const sortBy = searchParams.get('sortBy') || 'date';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    // 성능 로깅 시작
    const startTime = Date.now();
    
    // 카테고리별 포스트 가져오기
    const posts = await getPostsByCategory(category as CategoryId);
    
    // 정렬 적용
    const sortedPosts = [...posts].sort((a, b) => {
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
    
    // 성능 로깅 종료
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log(`📤 GET /api/posts/category/${category} 응답 완료: ${sortedPosts.length}개 포스트, ${responseTime}ms 소요`);
    
    // 응답 반환
    return NextResponse.json({
      category,
      posts: sortedPosts,
      total: sortedPosts.length,
      meta: {
        responseTime,
        timestamp: new Date().toISOString(),
        query: {
          sortBy,
          sortOrder
        }
      }
    });
  } catch (error) {
    console.error(`🔴 /api/posts/category/${params.category} 오류:`, error);
    
    return NextResponse.json(
      { 
        error: '카테고리별 포스트를 가져오는 중 오류가 발생했습니다.',
        message: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}