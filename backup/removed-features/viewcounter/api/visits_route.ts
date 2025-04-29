import { Client } from '@notionhq/client';
import { NextResponse } from 'next/server';

// Notion 클라이언트 초기화
const notion = new Client({
  auth: process.env.NOTION_TOKEN
});

const METRICS_DATABASE_ID = process.env.NOTION_METRICS_DATABASE_ID as string;

export async function GET() {
  if (!METRICS_DATABASE_ID) {
    console.log('NOTION_METRICS_DATABASE_ID가 설정되지 않아 메트릭 조회를 건너뜁니다.');
    return NextResponse.json({ visits: 0 }, { status: 200 });
  }

  try {
    // 전체 메트릭 데이터베이스 조회
    const response = await notion.databases.query({
      database_id: METRICS_DATABASE_ID
    });
    
    // "Visit Metric"이라는 이름을 가진 항목 찾기
    const visitMetric = response.results.find(page => {
      try {
        // @ts-ignore - Notion API 타입과의 호환성 문제
        const titleProperty = page.properties.Name.title;
        return titleProperty && titleProperty.length > 0 && 
               titleProperty[0].plain_text === "Visit Metric";
      } catch (e) {
        return false;
      }
    });
    
    // 방문자 수 데이터
    let visits = 0;
    if (visitMetric) {
      try {
        // @ts-ignore (Notion API 타입 호환성)
        visits = visitMetric.properties.Count.number || 0;
      } catch (e) {
        console.error('방문자 수 속성 접근 오류:', e);
      }
    }

    return NextResponse.json({
      visits: visits
    }, { status: 200 });
  } catch (error) {
    console.error('방문자 수 조회 오류:', error);
    return NextResponse.json({ error: '방문자 수 조회 중 오류가 발생했습니다' }, { status: 500 });
  }
}

export async function POST() {
  if (!METRICS_DATABASE_ID) {
    console.log('NOTION_METRICS_DATABASE_ID가 설정되지 않아 방문자 카운트를 건너뜁니다.');
    return NextResponse.json({ visits: 0 }, { status: 200 });
  }

  try {
    // 전체 메트릭 데이터베이스 조회
    const response = await notion.databases.query({
      database_id: METRICS_DATABASE_ID
    });
    
    // "Visit Metric"이라는 이름을 가진 항목 찾기
    const visitMetric = response.results.find(page => {
      try {
        // @ts-ignore - Notion API 타입과의 호환성 문제
        const titleProperty = page.properties.Name.title;
        return titleProperty && titleProperty.length > 0 && 
               titleProperty[0].plain_text === "Visit Metric";
      } catch (e) {
        return false;
      }
    });

    let currentVisits = 0;

    // 기존 데이터가 있으면 업데이트, 없으면 새로 생성
    if (visitMetric) {
      try {
        // @ts-ignore (Notion API 타입 호환성)
        currentVisits = visitMetric.properties.Count.number || 0;
  
        // 방문자 수 증가
        await notion.pages.update({
          page_id: visitMetric.id,
          properties: {
            Count: {
              number: currentVisits + 1
            }
          }
        });
        console.log('방문자 수 증가:', currentVisits + 1);
      } catch (e) {
        console.error('방문자 수 업데이트 오류:', e);
      }
    } else {
      // 새 페이지 생성
      try {
        const newPage = await notion.pages.create({
          parent: {
            database_id: METRICS_DATABASE_ID
          },
          properties: {
            Name: {
              title: [
                {
                  text: {
                    content: "Visit Metric"
                  }
                }
              ]
            },
            Type: {
              select: {
                name: "Visits"
              }
            },
            Count: {
              number: 1
            }
          }
        });
        console.log('새 방문자 메트릭 생성됨');
        currentVisits = 0;
      } catch (e) {
        console.error('방문자 메트릭 생성 오류:', e);
      }
    }

    return NextResponse.json({
      visits: currentVisits + 1
    }, { status: 200 });
  } catch (error) {
    console.error('방문자 수 업데이트 오류:', error);
    return NextResponse.json({ error: '방문자 수 업데이트 중 오류가 발생했습니다' }, { status: 500 });
  }
}