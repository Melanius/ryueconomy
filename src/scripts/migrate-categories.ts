import { CategoryId } from '../types/notion';
import { config } from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { Client } from '@notionhq/client';

// 환경 변수 로드 - .env.local 파일을 명시적으로 로드
const envPath = path.resolve(process.cwd(), '.env.local');
console.log(`환경 변수 파일 경로: ${envPath}`);
console.log(`파일 존재 여부: ${fs.existsSync(envPath)}`);

config({ path: envPath });

// 환경 변수 확인 출력
console.log('환경 변수 확인:');
console.log(`NOTION_TOKEN 설정됨: ${process.env.NOTION_TOKEN ? 'Yes' : 'No'}`);
console.log(`NOTION_DATABASE_ID 설정됨: ${process.env.NOTION_DATABASE_ID ? 'Yes' : 'No'}`);

// 환경 변수에서 값을 가져옵니다
const notionToken = process.env.NOTION_TOKEN;
const databaseId = process.env.NOTION_DATABASE_ID;

// Notion 클라이언트 직접 초기화
const notion = new Client({
  auth: notionToken,
});

// 카테고리 매핑 정의
const categoryMapping: Record<string, CategoryId> = {
  // 투자/금융 관련
  'investment': 'invest-insight',
  'finance': 'invest-insight',
  'stock': 'invest-insight',
  'trading': 'invest-insight',
  
  // 크립토 관련
  'crypto': 'crypto-morning',
  'blockchain': 'crypto-morning',
  'bitcoin': 'crypto-morning',
  'cryptocurrency': 'crypto-morning',
  
  // 포트폴리오 관련
  'portfolio': 'real-portfolio',
  'project': 'real-portfolio',
  'work': 'real-portfolio',
  'showcase': 'real-portfolio',
  
  // 개발 관련
  'development': 'code-lab',
  'programming': 'code-lab',
  'coding': 'code-lab',
  'tech': 'code-lab',
  'tutorial': 'code-lab',
  
  // 일상 관련
  'daily': 'daily-log',
  'life': 'daily-log',
  'thoughts': 'daily-log',
  'journal': 'daily-log',
  'blog': 'daily-log'
};

async function migrateCategories() {
  try {
    console.log('카테고리 마이그레이션 시작...');
    
    if (!databaseId) {
      throw new Error('NOTION_DATABASE_ID가 설정되지 않았습니다.');
    }

    if (!notionToken) {
      throw new Error('NOTION_TOKEN이 설정되지 않았습니다.');
    }

    // 데이터베이스의 모든 페이지 가져오기
    const response = await notion.databases.query({
      database_id: databaseId,
    });

    console.log(`총 ${response.results.length}개의 페이지를 처리합니다.`);
    
    let updated = 0;
    let skipped = 0;
    const errors: Array<{id: string, error: string}> = [];

    // 각 페이지의 카테고리 업데이트
    for (const page of response.results) {
      try {
        const pageId = page.id;
        // @ts-ignore - Notion API 타입 문제 해결
        const currentCategory = page.properties?.Category?.select?.name || '';
        
        console.log(`페이지 처리 중: ${pageId} (현재 카테고리: ${currentCategory})`);

        // 현재 카테고리에 해당하는 새 카테고리 찾기
        const newCategory = categoryMapping[currentCategory.toLowerCase()];

        if (newCategory && currentCategory !== newCategory) {
          // 카테고리 업데이트
          await notion.pages.update({
            page_id: pageId,
            properties: {
              Category: {
                select: {
                  name: newCategory
                }
              }
            }
          });
          
          console.log(`✅ 카테고리 업데이트 완료: ${currentCategory} → ${newCategory}`);
          updated++;
        } else {
          console.log(`ℹ️ 업데이트 불필요: ${currentCategory}`);
          skipped++;
        }
      } catch (error) {
        console.error(`❌ 페이지 처리 중 오류 발생:`, error);
        errors.push({
          id: page.id,
          error: error instanceof Error ? error.message : '알 수 없는 오류'
        });
      }
    }

    // 결과 출력
    console.log('\n마이그레이션 완료:');
    console.log(`- 업데이트된 페이지: ${updated}`);
    console.log(`- 건너뛴 페이지: ${skipped}`);
    console.log(`- 오류 발생: ${errors.length}`);

    if (errors.length > 0) {
      console.log('\n오류 목록:');
      errors.forEach(({id, error}) => {
        console.log(`- ${id}: ${error}`);
      });
    }

  } catch (error) {
    console.error('마이그레이션 중 오류 발생:', error);
    process.exit(1);
  }
}

// 스크립트 실행
migrateCategories(); 