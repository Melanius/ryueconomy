/**
 * 통합된 Notion 클라이언트 모듈
 * 이 파일은 Notion API 클라이언트를 초기화하고 필요한 설정을 관리합니다.
 * 모든 Notion 관련 파일은 이 클라이언트를 사용해야 합니다.
 */
import { Client } from '@notionhq/client';
import { notionLog } from '../logger';

// 환경 변수에서 Notion API 토큰 및 데이터베이스 ID 가져오기
const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

// 환경 변수 검증 및 로깅
if (!NOTION_TOKEN) {
  notionLog.warn("⚠️ NOTION_TOKEN 환경 변수가 설정되지 않았습니다.");
  console.warn("⚠️ NOTION_TOKEN 환경 변수가 설정되지 않았습니다.");
}

if (!NOTION_DATABASE_ID) {
  notionLog.warn("⚠️ NOTION_DATABASE_ID 환경 변수가 설정되지 않았습니다.");
  console.warn("⚠️ NOTION_DATABASE_ID 환경 변수가 설정되지 않았습니다.");
}

// 안전한 방식으로 Notion 클라이언트 초기화
let notionClient: Client;
let databaseId: string = NOTION_DATABASE_ID || "";

try {
  // Notion API 클라이언트 초기화
  notionClient = new Client({
    auth: NOTION_TOKEN || '', // 토큰이 없으면 빈 문자열 사용 (에러는 발생하지만 코드는 계속 실행)
  });
  
  notionLog.info("✅ Notion 클라이언트 초기화 완료");
  notionLog.info(`   Database ID: ${databaseId ? databaseId.substring(0, 8) + '...' : '설정 안됨'}`);
} catch (error) {
  notionLog.error('🔴 Notion 클라이언트 초기화 오류:', error);
  
  // 오류 발생 시에도 앱이 작동할 수 있도록 빈 클라이언트 생성
  // 실제 호출 시 오류가 발생하겠지만, 앱 자체는 시작됨
  notionClient = new Client({ auth: '' });
}

// 클라이언트 및 설정 내보내기
export const notion = notionClient;
export { databaseId };

// Notion 연결 테스트 함수 (선택적 사용)
export async function testNotionConnection(): Promise<boolean> {
  try {
    if (!databaseId) {
      notionLog.error("데이터베이스 ID가 설정되지 않아 Notion 연결 테스트를 건너뜁니다.");
      return false;
    }
    
    // 데이터베이스 정보 요청으로 연결 테스트
    const response = await notion.databases.retrieve({
      database_id: databaseId,
    });
    
    notionLog.info(`✅ Notion 연결 테스트 성공: ${response.title[0]?.plain_text || 'Untitled'} 데이터베이스`);
    return true;
  } catch (error) {
    notionLog.error('🔴 Notion 연결 테스트 실패:', error);
    return false;
  }
}

// 환경 변수 설정 상태 유효성 확인 함수
export function validateNotionConfig(): { isValid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  if (!NOTION_TOKEN) {
    issues.push("NOTION_TOKEN 환경 변수가 설정되지 않았습니다.");
  }
  
  if (!NOTION_DATABASE_ID) {
    issues.push("NOTION_DATABASE_ID 환경 변수가 설정되지 않았습니다.");
  }
  
  return {
    isValid: issues.length === 0,
    issues,
  };
}
