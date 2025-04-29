import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@notionhq/client';
import { getPostBySlug } from '@/lib/notion';

// Notion 클라이언트 초기화
const notion = new Client({
  auth: process.env.NOTION_TOKEN
});

const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID as string;

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
  
  try {
    const post = await getPostBySlug(slug);
    if (!post) {
      return NextResponse.json({ error: '게시물을 찾을 수 없습니다.' }, { status: 404 });
    }
    
    return NextResponse.json({ views: post.views || 0 });
  } catch (error) {
    console.error(`게시물 조회수 조회 오류 (${slug}):`, error);
    return NextResponse.json({ error: '조회수 조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
  
  if (!NOTION_DATABASE_ID) {
    console.log('NOTION_DATABASE_ID가 설정되지 않아 조회수 업데이트를 건너뜁니다.');
    return NextResponse.json({ success: false, message: 'Notion API 설정이 없습니다.' });
  }
  
  try {
    console.log(`🔍 조회수 증가 요청: slug=${slug}`);
    
    // 게시물 정보 가져오기
    const post = await getPostBySlug(slug);
    if (!post) {
      console.error(`❌ 게시물을 찾을 수 없음: slug=${slug}`);
      return NextResponse.json({ error: '게시물을 찾을 수 없습니다.' }, { status: 404 });
    }
    
    console.log(`✅ 게시물 찾음: id=${post.id}, title=${post.title}, 현재 조회수=${post.views}`);
    
    // 현재 조회수
    const currentViews = post.views || 0;
    const newViews = currentViews + 1;
    
    // Notion 데이터베이스에서 페이지 업데이트
    if (post.id) {
      try {
        console.log(`📡 Notion API 호출: page_id=${post.id}, 새 조회수=${newViews}`);
        
        // 업데이트 전에 페이지 확인
        const pageCheck = await notion.pages.retrieve({ page_id: post.id });
        console.log(`📄 페이지 확인: ${pageCheck.id}`);
        
        // 업데이트 요청
        await notion.pages.update({
          page_id: post.id,
          properties: {
            Views: {
              number: newViews
            }
          }
        });
        
        console.log(`✅ 게시물 [${slug}] 조회수 증가 성공: ${currentViews} → ${newViews}`);
        
        return NextResponse.json({ success: true, views: newViews });
      } catch (updateError) {
        console.error('📛 Notion 페이지 업데이트 오류:', updateError);
        return NextResponse.json({ 
          success: false, 
          message: '페이지 업데이트 중 오류가 발생했습니다',
          error: updateError instanceof Error ? updateError.message : '알 수 없는 오류'
        }, { status: 500 });
      }
    } else {
      console.error(`❌ 게시물 ID가 없음: slug=${slug}`);
      return NextResponse.json({ success: false, message: '게시물 ID가 없습니다.' });
    }
  } catch (error) {
    console.error(`❌ 게시물 조회수 업데이트 오류 (${slug}):`, error);
    return NextResponse.json({ 
      error: '조회수 업데이트 중 오류가 발생했습니다.',
      message: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 });
  }
}