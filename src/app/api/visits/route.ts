import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

// 방문자 수 증가 API
export async function POST(request: NextRequest) {
  try {
    logger.info(`🚶 방문자 카운터 API 요청 받음`);
    
    // 개발 환경에서는 더미 응답 반환
    if (process.env.NODE_ENV === 'development') {
      logger.info(`🚶 [개발환경] 방문자 수 증가 요청 처리됨`);
      return NextResponse.json({
        success: true,
        message: '개발환경: 방문자 수가 처리되었습니다.',
        visits: 100
      });
    }
    
    // 프로덕션에서는 실제 방문자 수 증가 로직 구현
    // 여기에 Notion 또는 데이터베이스 업데이트 코드 추가
    
    logger.info(`🚶 방문자 수 증가 성공`);
    
    return NextResponse.json({
      success: true,
      message: '방문자 수가 성공적으로 업데이트되었습니다.',
      visits: 100 // 실제 구현 시 실제 방문자 수로 대체
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`🚶 방문자 수 업데이트 중 오류: ${errorMessage}`, error);
    return NextResponse.json(
      { error: '방문자 수 업데이트 중 서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 