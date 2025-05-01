import { NextRequest, NextResponse } from 'next/server';
import { invalidateCache } from '@/lib/cache/index';
import { logger } from '@/lib/logger';
import { verifyWebhookSignature } from '@/lib/notion/webhooks';
import { invalidatePostCache, invalidatePostsCache } from '@/lib/cache/notion-cache';

// Webhook 시크릿 키 (환경 변수에서 가져옴)
const WEBHOOK_SECRET = process.env.NOTION_WEBHOOK_SECRET;

/**
 * Notion Webhook 엔드포인트
 * 
 * Notion의 데이터베이스 변경 사항을 수신하고 적절한 캐시를 무효화합니다.
 * https://developers.notion.com/reference/webhooks
 */
export async function POST(request: NextRequest) {
  // 요청 시작 시간 기록
  const startTime = Date.now();
  
  try {
    // 요청 헤더에서 Notion-Signature 확인
    const signature = request.headers.get('notion-signature');
    
    // 시크릿 키 확인
    if (!WEBHOOK_SECRET) {
      logger.warn('Webhook 시크릿 키가 설정되지 않음');
      return NextResponse.json({ error: 'Webhook 시크릿이 구성되지 않음' }, { status: 500 });
    }
    
    // 시그니처 누락 확인
    if (!signature) {
      logger.warn('Webhook 시그니처 누락됨');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // 요청 본문 텍스트로 가져오기 (클론해서 사용하지 않으면 body를 두 번 읽을 수 없음)
    const requestClone = request.clone();
    const bodyText = await requestClone.text();
    
    // 시그니처 검증
    const isValidSignature = verifyWebhookSignature(signature, bodyText, WEBHOOK_SECRET);
    
    if (!isValidSignature) {
      logger.warn('Webhook 시그니처 유효하지 않음');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
    
    // 요청 본문 파싱 (원래 request 객체 사용)
    const body = await request.json();
    
    // 이벤트 타입 확인
    const eventType = body.type;
    logger.info(`Notion Webhook 수신: ${eventType}`, { eventType });
    
    // 페이지/블록 ID 추출
    const pageId = body.page?.id;
    const databaseId = body.database?.id;
    
    // 이벤트 타입에 따라 처리
    switch (eventType) {
      case 'block.created':
      case 'block.updated':
      case 'block.deleted':
        // 블록 변경은 해당 페이지의 캐시만 무효화
        if (pageId) {
          logger.info(`블록 변경 감지: ${pageId.substring(0, 8)}...`, { pageId, eventType });
          await invalidatePostCache(pageId);
        }
        break;
        
      case 'page.created':
        // 새 페이지 생성 시 전체 포스트 목록 캐시 무효화
        logger.info(`새 페이지 생성 감지: ${pageId.substring(0, 8)}...`, { pageId });
        await invalidatePostsCache();
        // 관련 게시물 캐시도 명시적으로 무효화
        await invalidateCache('posts:related:*');
        break;
        
      case 'page.updated':
        // 페이지 업데이트 시 해당 페이지 캐시와 목록 캐시 무효화
        logger.info(`페이지 업데이트 감지: ${pageId.substring(0, 8)}...`, { pageId });
        await invalidatePostCache(pageId);
        // 관련 게시물 캐시도 명시적으로 무효화
        await invalidateCache('posts:related:*');
        break;
        
      case 'page.deleted':
        // 페이지 삭제 시 전체 포스트 목록 캐시 무효화
        logger.info(`페이지 삭제 감지: ${pageId.substring(0, 8)}...`, { pageId });
        await invalidatePostsCache();
        // 관련 게시물 캐시도 명시적으로 무효화
        await invalidateCache('posts:related:*');
        break;
        
      case 'database.updated':
        // 데이터베이스 업데이트 시 모든 캐시 무효화
        logger.info(`데이터베이스 업데이트 감지: ${databaseId.substring(0, 8)}...`, { databaseId });
        await invalidateCache('*');
        break;
        
      default:
        logger.info(`처리되지 않은 이벤트 타입: ${eventType}`);
    }
    
    // 처리 시간 계산
    const processingTime = Date.now() - startTime;
    
    // 성공 응답 반환
    return NextResponse.json({ 
      success: true, 
      message: `${eventType} 이벤트 처리 완료`,
      processingTime: `${processingTime}ms`
    });
    
  } catch (error) {
    // 오류 로깅
    logger.error('Notion Webhook 처리 오류', { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // 오류 응답 반환
    return NextResponse.json({ 
      error: 'Webhook 처리 중 오류 발생',
      message: error instanceof Error ? error.message : String(error)
    }, { 
      status: 500 
    });
  }
} 