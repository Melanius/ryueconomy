import { NextResponse } from 'next/server';
import { clientLogger } from '@/lib/logger';

// 환경 설정
const isProd = process.env.NODE_ENV === 'production';

export async function POST(request: Request) {
  try {
    const errorData = await request.json();
    
    // 클라이언트 에러 로깅
    clientLogger.error('Client Error', {
      ...errorData,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    // 개발 환경에서만 콘솔에 로깅
    if (!isProd) {
      console.error('Error processing client log:', error);
    }
    
    return NextResponse.json(
      { error: 'Failed to process error log' },
      { status: 500 }
    );
  }
} 