import { CategoryId, Post } from '@/types/post';
import { getAllPosts as getNotionPosts } from '@/lib/notion';

// lib/notion.ts에서 모든 게시물을 가져오는 함수
export async function getAllPosts(): Promise<Post[]> {
  // 노션 API를 통해 게시물 가져오기
  return getNotionPosts();
}

// 특정 카테고리의 게시물만 가져오는 함수
export async function getPostsByCategory(category: CategoryId): Promise<Post[]> {
  const allPosts = await getAllPosts();
  return category === 'all' 
    ? allPosts 
    : allPosts.filter(post => post.category === category);
}

// 인기 게시물 가져오기 (조회수 기준)
export async function getPopularPosts(limit: number = 5): Promise<Post[]> {
  const allPosts = await getAllPosts();
  return [...allPosts]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, limit);
}

// 최신 게시물 가져오기 (날짜 기준)
export async function getRecentPosts(limit: number = 5): Promise<Post[]> {
  const allPosts = await getAllPosts();
  return [...allPosts]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

export function filterPostsByCategory(posts: Post[], category: CategoryId | 'all'): Post[] {
  console.log(`포스트 필터링: 카테고리=${category}, 총 ${posts.length}개`);
  
  if (category === 'all') {
    return posts;
  }
  
  return posts.filter(post => post.category === category);
}

export function getCategoryStats(posts: Post[]): Record<CategoryId | 'all', number> {
  const stats = {
    all: posts.length,
    'crypto-morning': 0,
    'invest-insight': 0,
    'real-portfolio': 0,
    'code-lab': 0,
    'daily-log': 0
  };

  posts.forEach(post => {
    if (post.category in stats) {
      stats[post.category as CategoryId]++;
    }
  });

  return stats;
}

export function getPopularCategories(posts: Post[], limit: number = 5): CategoryId[] {
  const stats = getCategoryStats(posts);
  
  // 'all' 카테고리를 제외하고 정렬
  const sortedCategories = (Object.entries(stats) as [CategoryId | 'all', number][])
    .filter(([category]) => category !== 'all')
    .sort(([, countA], [, countB]) => countB - countA)
    .map(([category]) => category as CategoryId);

  return sortedCategories.slice(0, limit);
}

export function getRelatedPosts(currentPost: Post, allPosts: Post[], limit: number = 3): Post[] {
  return allPosts
    .filter(post => 
      post.id !== currentPost.id && 
      post.category === currentPost.category
    )
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);
} 