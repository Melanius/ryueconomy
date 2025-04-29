import { Client } from '@notionhq/client';

// Notion API 클라이언트 초기화
// process.env.NOTION_TOKEN 환경 변수에서 API 토큰을 가져옵니다.
const notionToken = process.env.NOTION_TOKEN;
if (!notionToken) {
  console.error("🔴 FATAL: NOTION_TOKEN 환경 변수가 설정되지 않았습니다. Notion API에 접근할 수 없습니다.");
  // 실제 운영 환경에서는 여기서 에러를 throw 하거나 애플리케이션을 중단시키는 것이 좋습니다.
  // throw new Error("NOTION_TOKEN is not set in environment variables.");
}

export const notion = new Client({
  auth: notionToken,
});

// Notion 데이터베이스 ID 가져오기
// process.env.NOTION_DATABASE_ID 환경 변수에서 블로그 포스트 데이터베이스 ID를 가져옵니다.
export const databaseId = process.env.NOTION_DATABASE_ID;
if (!databaseId) {
  console.error("🔴 FATAL: NOTION_DATABASE_ID 환경 변수가 설정되지 않았습니다. 데이터베이스에 접근할 수 없습니다.");
  // throw new Error("NOTION_DATABASE_ID is not set in environment variables.");
}

// (선택 사항) 메트릭스 또는 다른 데이터베이스 ID (이전에 언급된 metricsDbId)
// 만약 다른 데이터베이스도 사용한다면, 해당 ID도 환경 변수에서 가져옵니다.
export const metricsDbId = process.env.NOTION_METRICS_DB_ID;
if (metricsDbId) {
   console.log("📊 Metrics Database ID 로드됨:", metricsDbId.substring(0, 8) + "...");
} else {
   // console.warn("⚠️ NOTION_METRICS_DB_ID 환경 변수가 설정되지 않았습니다. (선택 사항)");
}

console.log("✅ Notion 클라이언트 초기화 완료");
console.log(`   - Database ID: ${databaseId ? databaseId.substring(0, 8) + '...' : '설정 안됨'}`);
// console.log(`   - Token: ${notionToken ? '설정됨' : '설정 안됨'}`); // 토큰은 로그에 남기지 않는 것이 좋습니다.
