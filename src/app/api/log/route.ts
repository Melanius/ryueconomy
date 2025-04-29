import { NextResponse } from 'next/server';
import { clientLogger } from '@/lib/logger';

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
    console.error('Error processing client log:', error);
    return NextResponse.json(
      { error: 'Failed to process error log' },
      { status: 500 }
    );
  }
} 