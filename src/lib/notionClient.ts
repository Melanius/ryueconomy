import { Client } from '@notionhq/client';

// Notion API 클라이언트 초기화
export const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

// Notion 데이터베이스 ID 설정
export const databaseId = process.env.NOTION_DATABASE_ID;
export const metricsDbId = process.env.NOTION_METRICS_DATABASE_ID; 