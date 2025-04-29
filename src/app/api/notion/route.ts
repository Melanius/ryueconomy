import { NextResponse } from 'next/server';
import { Client } from '@notionhq/client';
import { DatabaseObjectResponse, PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';

// API 라우트 핸들러
export async function GET() {
  try {
    const notionApiKey = process.env.NOTION_API_KEY;
    const notionDatabaseId = process.env.NOTION_DATABASE_ID;
    
    // 환경 변수 검증
    if (!notionApiKey || !notionDatabaseId) {
      return NextResponse.json({ 
        error: 'Notion API 키 또는 데이터베이스 ID가 설정되지 않았습니다.',
        apiKeyExists: !!notionApiKey,
        databaseIdExists: !!notionDatabaseId,
        databaseIdValue: notionDatabaseId ? `${notionDatabaseId.substring(0, 4)}...` : null
      }, { status: 500 });
    }

    // Notion 클라이언트 초기화
    const notion = new Client({ auth: notionApiKey });
    
    // 데이터베이스 정보 가져오기 시도
    const dbInfo = await notion.databases.retrieve({
      database_id: notionDatabaseId
    }) as DatabaseObjectResponse;

    // 데이터베이스 컨텐츠 쿼리 시도 (테스트)
    const dbContent = await notion.databases.query({
      database_id: notionDatabaseId,
      page_size: 3 // 샘플 데이터 몇 개만 가져오기
    });

    // 타입 안전성을 위해 결과를 PageObjectResponse로 캐스팅
    const pages = dbContent.results as PageObjectResponse[];

    return NextResponse.json({
      success: true,
      dbInfo: {
        id: dbInfo.id,
        title: dbInfo.title?.[0]?.plain_text || '제목 없음',
        lastEditedTime: dbInfo.last_edited_time,
        properties: Object.keys(dbInfo.properties)
      },
      sampleData: pages.map(page => ({
        id: page.id,
        properties: page.properties
      }))
    });
  } catch (error) {
    console.error('Notion API 에러:', error);
    return NextResponse.json({ 
      error: 'Notion API 연결 오류',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 