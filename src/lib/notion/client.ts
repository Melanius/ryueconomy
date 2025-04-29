import { Client } from '@notionhq/client';

// Notion API 클라이언트 초기화
// process.env.NOTION_TOKEN 환경 변수에서 API 토큰을 가져옵니다.
const notionToken = process.env.NOTION_TOKEN;

// Notion 클라이언트 설정 안전하게 처리
if (!notionToken) {
  console.warn("⚠️ WARNING: NOTION_TOKEN 환경 변수가 설정되지 않았습니다. 기본값을 사용합니다.");
}

// Notion 데이터베이스 ID 가져오기
const notionDatabaseId = process.env.NOTION_DATABASE_ID || '1dce6bc2212780799918dcc0ee2b8f84';

if (!process.env.NOTION_DATABASE_ID) {
  console.warn("⚠️ WARNING: NOTION_DATABASE_ID 환경 변수가 설정되지 않았습니다. 기본값을 사용합니다.");
}

// export를 try/catch 밖으로 이동
let notionClient;
let databaseId = notionDatabaseId;

try {
  // Notion API 클라이언트 초기화 시도
  notionClient = new Client({
    auth: notionToken || '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', // .env.local의 토큰 사용
  });
  
  console.log("✅ Notion 클라이언트 초기화 시도 완료");
  console.log(`   - Database ID: ${databaseId ? databaseId.substring(0, 8) + '...' : '설정 안됨'}`); 
} catch (error) {
  console.error('🔴 Notion 클라이언트 초기화 오류:', error);
  // 오류 발생 시 기본 클라이언트 생성
  notionClient = new Client({ auth: 'fallback_token_for_recovery' });
}

// 외부로 내보낼 변수 설정
export const notion = notionClient;
export { databaseId };

console.log("✅ Notion 클라이언트 초기화 완료")
