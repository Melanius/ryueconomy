import { Client } from "@notionhq/client";
import { logger } from "./logger";

// 환경 변수에서 Notion API 토큰 및 데이터베이스 ID 가져오기
const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

// 로깅 추가
if (!NOTION_TOKEN) {
  logger.error("NOTION_TOKEN 환경 변수가 설정되지 않았습니다.");
}

if (!NOTION_DATABASE_ID) {
  logger.error("NOTION_DATABASE_ID 환경 변수가 설정되지 않았습니다.");
}

// Notion 클라이언트 인스턴스 생성
export const notion = new Client({
  auth: NOTION_TOKEN,
});

// 데이터베이스 ID export
export const databaseId = NOTION_DATABASE_ID || ""; 