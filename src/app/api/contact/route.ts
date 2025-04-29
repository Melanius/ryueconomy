import { NextRequest, NextResponse } from 'next/server';
import { notion } from '@/lib/notion/client';
import logger from '@/lib/logger';

// 노션 메시지 데이터베이스 ID 가져오기
const messageDbId = process.env.NOTION_MESSAGE_DATABASE_ID;

// 메시지 제출 API
export async function POST(request: NextRequest) {
  try {
    // 요청 본문에서 데이터 추출
    const body = await request.json();
    const { name, email, subject, message } = body;

    // 필수 필드 검증
    if (!name || !email || !subject || !message) {
      logger.error('메시지 제출 실패: 필수 필드가 누락되었습니다.', { name, email, subject });
      return NextResponse.json(
        { error: '모든 필드를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      logger.error('메시지 제출 실패: 이메일 형식이 잘못되었습니다.', { email });
      return NextResponse.json(
        { error: '유효한 이메일 주소를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 메시지 데이터베이스 ID 확인
    if (!messageDbId) {
      logger.error('메시지 제출 실패: NOTION_MESSAGE_DATABASE_ID가 설정되지 않았습니다.');
      return NextResponse.json(
        { error: '서버 설정 오류. 관리자에게 문의하세요.' },
        { status: 500 }
      );
    }

    // 노션 API를 사용하여 메시지 데이터베이스에 항목 추가
    const response = await notion.pages.create({
      parent: {
        database_id: messageDbId,
      },
      properties: {
        name: {
          title: [
            {
              text: {
                content: name
              }
            }
          ]
        },
        email: {
          rich_text: [
            {
              text: {
                content: email
              }
            }
          ]
        },
        title: {
          rich_text: [
            {
              text: {
                content: subject
              }
            }
          ]
        },
        contents: {
          rich_text: [
            {
              text: {
                content: message
              }
            }
          ]
        }
      }
    });

    logger.info('메시지가 성공적으로 제출되었습니다.', { 
      name, 
      email, 
      subject, 
      messageId: response.id 
    });

    return NextResponse.json({
      success: true,
      message: '메시지가 성공적으로 전송되었습니다.'
    });
  } catch (error) {
    logger.error('메시지 제출 중 오류 발생:', error);
    return NextResponse.json(
      { error: '메시지 제출 중 오류가 발생했습니다. 나중에 다시 시도해주세요.' },
      { status: 500 }
    );
  }
}
