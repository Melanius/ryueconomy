import { NextResponse } from 'next/server';
import { getAllPosts } from '@/lib/notion';

export async function GET() {
  try {
    // 노션에서 모든 게시물 가져오기
    const posts = await getAllPosts();
    
    // 카테고리별 분류
    const categorizedPosts: Record<string, any[]> = {
      'crypto-morning': [],
      'invest-insight': [],
      'real-portfolio': [],
      'code-lab': [],
      'daily-log': [],
      'unknown': []
    };
    
    // 각 게시물을 카테고리별로 분류
    posts.forEach(post => {
      if (post.category && categorizedPosts[post.category]) {
        categorizedPosts[post.category].push({
          id: post.id,
          title: post.title,
          category: post.category,
          slug: post.slug,
          date: post.date
        });
      } else {
        categorizedPosts['unknown'].push({
          id: post.id,
          title: post.title,
          originalCategory: post.category,
          slug: post.slug,
          date: post.date
        });
      }
    });
    
    return NextResponse.json({
      success: true,
      totalPosts: posts.length,
      postsByCategory: Object.entries(categorizedPosts).map(([category, posts]) => ({
        category,
        count: posts.length,
        posts: posts.slice(0, 3) // 각 카테고리별로 3개까지만 표시
      })),
      firstPost: posts.length > 0 ? posts[0] : null
    });
  } catch (error) {
    console.error('Notion 디버그 API 오류:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 