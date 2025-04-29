import { NextRequest, NextResponse } from 'next/server';
import { increment } from '@/lib/notion'; // notion.ts에서 직접 increment 함수 가져오기
import { logger } from '@/lib/logger';

// 캐시를 활용한 API 요청 최적화를 위한 Map (메모리 캐시)
const viewsCache = new Map<string, {count: number, timestamp: number}>();

// 개발 환경용 가상 조회수 데이터
const devViewsMap = new Map<string, number>();

// 캐시 만료 시간 (10분)
const CACHE_EXPIRY = 10 * 60 * 1000;

// 조회수 증가 API
export async function POST(request: NextRequest) {
  try {
    // 요청 본문에서 slug 추출
    const body = await request.json();
    const { slug } = body;

    logger.info(`📈 조회수 API 요청 받음: slug="${slug}"`);

    if (!slug) {
      logger.error('📈 조회수 업데이트 실패: slug가 요청에 제공되지 않았습니다.');
      return NextResponse.json(
        { error: '게시물 slug가 필요합니다.' },
        { status: 400 }
      );
    }
    
    // 개발 환경 확인
    const isDev = process.env.NODE_ENV === 'development';
    logger.info(`📈 개발 환경 감지: ${isDev ? '개발 환경' : '프로덕션 환경'}`);
    
    // 개발 환경에서는 가상 조회수 데이터 사용
    if (isDev) {
      let currentViews = devViewsMap.get(slug) || 0;
      currentViews += 1; // 조회수 증가
      devViewsMap.set(slug, currentViews);
      
      logger.info(`📈 [개발환경] 가상 조회수 업데이트: "${slug}", 새 조회수=${currentViews}`);
      
      return NextResponse.json({
        success: true,
        message: '개발환경: 가상 조회수가 업데이트되었습니다.',
        views: currentViews
      });
    }
    
    // 프로덕션 환경에서는 캐시 확인
    const cachedData = viewsCache.get(slug);
    const now = Date.now();
    
    // 캐시가 유효한 경우 캐시된 조회수 반환 (잦은 API 호출 방지)
    if (cachedData && (now - cachedData.timestamp) < CACHE_EXPIRY) {
      logger.info(`📈 캐시에서 조회수 반환: "${slug}", ${cachedData.count}회 조회`);
      return NextResponse.json({
        success: true,
        message: '캐시에서 조회수를 반환했습니다.',
        views: cachedData.count
      });
    }
    
    logger.info(`📈 increment 함수 호출 시작: slug="${slug}"`);
    
    // 직접 increment 함수 호출
    const newViews = await increment(slug);
    
    if (newViews === 0) {
      logger.error(`📈 조회수 업데이트 실패: slug="${slug}"에 대한 increment 실패`);
      return NextResponse.json(
        { error: '조회수 업데이트 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }
    
    logger.info(`📈 조회수 업데이트 성공: slug="${slug}", 새 조회수=${newViews}`);
    
    // 캐시 업데이트
    viewsCache.set(slug, {
      count: newViews,
      timestamp: now
    });

    return NextResponse.json({
      success: true,
      message: '조회수가 성공적으로 업데이트되었습니다.',
      views: newViews
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`📈 조회수 업데이트 중 오류: ${errorMessage}`, error);
    return NextResponse.json(
      { error: '조회수 업데이트 중 서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
