import { NextRequest, NextResponse } from 'next/server';
import { getWebhooks, createWebhook, deleteWebhook } from '@/lib/notion/webhooks';
import { logger } from '@/lib/logger';

/**
 * Webhook 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    // API 키 보안 검증
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Webhook 목록 가져오기
    const webhooks = await getWebhooks();
    
    return NextResponse.json({
      success: true,
      webhooks
    });
  } catch (error) {
    logger.error('Webhook 관리자 API 오류 (GET)', {
      error: error instanceof Error ? error.message : String(error)
    });
    
    return NextResponse.json({
      error: 'Webhook 목록 조회 실패',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

/**
 * 새 Webhook 생성
 */
export async function POST(request: NextRequest) {
  try {
    // API 키 보안 검증
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // 요청 본문 파싱
    const body = await request.json();
    const { databaseId, url } = body;
    
    // 필수 파라미터 확인
    if (!databaseId || !url) {
      return NextResponse.json({
        error: 'Bad Request',
        message: 'databaseId와 url은 필수 파라미터입니다.'
      }, { status: 400 });
    }
    
    // Webhook 생성
    const webhook = await createWebhook(databaseId, url);
    
    return NextResponse.json({
      success: true,
      webhook
    });
  } catch (error) {
    logger.error('Webhook 관리자 API 오류 (POST)', {
      error: error instanceof Error ? error.message : String(error)
    });
    
    return NextResponse.json({
      error: 'Webhook 생성 실패',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

/**
 * Webhook 삭제
 */
export async function DELETE(request: NextRequest) {
  try {
    // API 키 보안 검증
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // URL에서 Webhook ID 추출
    const url = new URL(request.url);
    const webhookId = url.searchParams.get('id');
    
    // Webhook ID 확인
    if (!webhookId) {
      return NextResponse.json({
        error: 'Bad Request',
        message: 'Webhook ID가 필요합니다.'
      }, { status: 400 });
    }
    
    // Webhook 삭제
    await deleteWebhook(webhookId);
    
    return NextResponse.json({
      success: true,
      message: `Webhook ${webhookId} 삭제 완료`
    });
  } catch (error) {
    logger.error('Webhook 관리자 API 오류 (DELETE)', {
      error: error instanceof Error ? error.message : String(error)
    });
    
    return NextResponse.json({
      error: 'Webhook 삭제 실패',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 