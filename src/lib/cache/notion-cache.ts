// Notion API 캐싱 최적화 (src/lib/cache/notion-cache.ts)
import { BlogPost } from '@/types/post';
import { CategoryId } from '@/types/notion';
import { getAllPosts as getAllPostsOriginal, getPostBySlug as getPostBySlugOriginal } from '@/lib/notion';
import cache, { CACHE_KEYS, CACHE_TTL, memoize, invalidateCache } from './index';

// 모든 포스트 가져오기 (캐시 적용)
export const getAllPosts = memoize(
  getAllPostsOriginal,
  () => CACHE_KEYS.ALL_POSTS,
  CACHE_TTL.MEDIUM // 30분 캐싱
);

// 특정 슬러그로 포스트 가져오기 (캐시 적용)
export const getPostBySlug = memoize(
  getPostBySlugOriginal,
  (slug: string) => CACHE_KEYS.POST_BY_SLUG(slug),
  CACHE_TTL.MEDIUM // 30분 캐싱
);

// 카테고리별 포스트 가져오기 (캐시 적용)
export const getPostsByCategory = memoize(
  async (category: CategoryId): Promise<BlogPost[]> => {
    const allPosts = await getAllPosts();
    
    if (category === 'all') {
      return allPosts;
    }
    
    return allPosts.filter(post => post.category === category);
  },
  (category: CategoryId) => CACHE_KEYS.POSTS_BY_CATEGORY(category),
  CACHE_TTL.MEDIUM // 30분 캐싱
);

// 포스트 무한 스크롤을 위한 페이지네이션 함수
export const getPaginatedPosts = async (
  category: CategoryId = 'all',
  page: number = 1,
  pageSize: number = 10,
  sortBy: 'date' | 'views' = 'date',
  sortOrder: 'asc' | 'desc' = 'desc'
): Promise<{ posts: BlogPost[], hasMore: boolean, total: number }> => {
  // 카테고리별 포스트 가져오기
  const posts = await getPostsByCategory(category);
  
  // 정렬 기준 적용
  const sortedPosts = [...posts].sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    } else if (sortBy === 'views') {
      const viewsA = a.views || 0;
      const viewsB = b.views || 0;
      return sortOrder === 'desc' ? viewsB - viewsA : viewsA - viewsB;
    }
    return 0;
  });
  
  // 페이지네이션 계산
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedPosts = sortedPosts.slice(startIndex, endIndex);
  
  return {
    posts: paginatedPosts,
    hasMore: endIndex < sortedPosts.length,
    total: sortedPosts.length
  };
};

// 관련 포스트 가져오기 (캐시 적용)
export const getRelatedPosts = memoize(
  async (currentSlug: string, category: CategoryId, limit: number = 3): Promise<BlogPost[]> => {
    // 같은 카테고리의 모든 포스트 가져오기
    const categoryPosts = await getPostsByCategory(category);
    
    // 현재 포스트를 제외하고 최근 포스트 중심으로 관련 포스트 반환
    return categoryPosts
      .filter(post => post.slug !== currentSlug)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  },
  (currentSlug: string, category: CategoryId) => `related_posts:${currentSlug}:${category}`,
  CACHE_TTL.MEDIUM // 30분 캐싱
);

// 인기 포스트 가져오기 (캐시 적용)
export const getPopularPosts = memoize(
  async (excludeCategories: CategoryId[] = [], limit: number = 5): Promise<BlogPost[]> => {
    const allPosts = await getAllPosts();
    
    return allPosts
      .filter(post => !excludeCategories.includes(post.category))
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, limit);
  },
  (excludeCategories: CategoryId[], limit: number) => 
    `popular_posts:exclude:${excludeCategories.join('-')}:limit:${limit}`,
  CACHE_TTL.SHORT // 5분 캐싱
);

// 최근 포스트 가져오기 (캐시 적용)
export const getRecentPosts = memoize(
  async (excludeCategories: CategoryId[] = [], limit: number = 5): Promise<BlogPost[]> => {
    const allPosts = await getAllPosts();
    
    return allPosts
      .filter(post => !excludeCategories.includes(post.category))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  },
  (excludeCategories: CategoryId[], limit: number) => 
    `recent_posts:exclude:${excludeCategories.join('-')}:limit:${limit}`,
  CACHE_TTL.SHORT // 5분 캐싱
);

// 포스트 게시 연도별로 그룹화 (아카이브 위젯용)
export const getPostsByYear = memoize(
  async (category: CategoryId = 'all'): Promise<Record<string, BlogPost[]>> => {
    const posts = await getPostsByCategory(category);
    
    const postsByYear: Record<string, BlogPost[]> = {};
    
    posts.forEach(post => {
      const year = new Date(post.date).getFullYear().toString();
      
      if (!postsByYear[year]) {
        postsByYear[year] = [];
      }
      
      postsByYear[year].push(post);
    });
    
    // 연도별로 내림차순 정렬
    return Object.fromEntries(
      Object.entries(postsByYear)
        .map(([year, yearPosts]) => [
          year,
          // 각 연도 내에서는 최신순으로 정렬
          yearPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        ])
        .sort((a, b) => parseInt(b[0]) - parseInt(a[0]))
    );
  },
  (category: CategoryId) => `posts_by_year:${category}`,
  CACHE_TTL.MEDIUM // 30분 캐싱
);

// 포스트 게시 월별로 그룹화 (아카이브 위젯용)
export const getPostsByMonth = memoize(
  async (year: string, category: CategoryId = 'all'): Promise<Record<string, BlogPost[]>> => {
    const posts = await getPostsByCategory(category);
    
    // 특정 연도의 포스트만 필터링
    const yearPosts = posts.filter(post => {
      const postYear = new Date(post.date).getFullYear().toString();
      return postYear === year;
    });
    
    const postsByMonth: Record<string, BlogPost[]> = {};
    
    yearPosts.forEach(post => {
      const month = new Date(post.date).getMonth() + 1; // 0-11 월을 1-12로 변환
      const monthKey = month.toString().padStart(2, '0'); // 01, 02, ...
      
      if (!postsByMonth[monthKey]) {
        postsByMonth[monthKey] = [];
      }
      
      postsByMonth[monthKey].push(post);
    });
    
    // 월별로 내림차순 정렬
    return Object.fromEntries(
      Object.entries(postsByMonth)
        .map(([month, monthPosts]) => [
          month,
          // 각 월 내에서는 최신순으로 정렬
          monthPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        ])
        .sort((a, b) => parseInt(b[0]) - parseInt(a[0]))
    );
  },
  (year: string, category: CategoryId) => `posts_by_month:${year}:${category}`,
  CACHE_TTL.MEDIUM // 30분 캐싱
);

// 특정 연도/월 포스트 가져오기
export const getPostsByYearMonth = memoize(
  async (
    year: string, 
    month: string, 
    category: CategoryId = 'all'
  ): Promise<BlogPost[]> => {
    const posts = await getPostsByCategory(category);
    
    // 특정 연도/월의 포스트만 필터링
    return posts.filter(post => {
      const postDate = new Date(post.date);
      const postYear = postDate.getFullYear().toString();
      const postMonth = (postDate.getMonth() + 1).toString().padStart(2, '0');
      
      return postYear === year && postMonth === month;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },
  (year: string, month: string, category: CategoryId) => 
    `posts_by_year_month:${year}:${month}:${category}`,
  CACHE_TTL.MEDIUM // 30분 캐싱
);

// 카테고리별 통계 가져오기
export const getCategoryStats = memoize(
  async (): Promise<Record<CategoryId, { count: number, lastUpdated: string }>> => {
    const allPosts = await getAllPosts();
    
    const stats: Record<CategoryId, { count: number, lastUpdated: string }> = {
      'all': { count: allPosts.length, lastUpdated: '' },
      'crypto-morning': { count: 0, lastUpdated: '' },
      'invest-insight': { count: 0, lastUpdated: '' },
      'real-portfolio': { count: 0, lastUpdated: '' },
      'code-lab': { count: 0, lastUpdated: '' },
      'daily-log': { count: 0, lastUpdated: '' }
    };
    
    // 카테고리별로 포스트 수 계산 및 최신 업데이트 날짜 찾기
    allPosts.forEach(post => {
      const category = post.category as CategoryId;
      
      // 카테고리별 포스트 수 증가
      if (stats[category]) {
        stats[category].count++;
        
        // 최신 업데이트 날짜 업데이트
        const postDate = new Date(post.date).getTime();
        const currentLastUpdated = stats[category].lastUpdated 
          ? new Date(stats[category].lastUpdated).getTime() 
          : 0;
        
        if (postDate > currentLastUpdated || !stats[category].lastUpdated) {
          stats[category].lastUpdated = post.date;
        }
      }
      
      // 전체 카테고리의 최신 업데이트 날짜 업데이트
      const postDate = new Date(post.date).getTime();
      const allLastUpdated = stats['all'].lastUpdated 
        ? new Date(stats['all'].lastUpdated).getTime() 
        : 0;
      
      if (postDate > allLastUpdated || !stats['all'].lastUpdated) {
        stats['all'].lastUpdated = post.date;
      }
    });
    
    return stats;
  },
  () => CACHE_KEYS.CATEGORY_STATS,
  CACHE_TTL.MEDIUM // 30분 캐싱
);

// 캐시 무효화 함수들
export const invalidateAllCache = (): void => {
  invalidateCache('.*'); // 모든 캐시 삭제
};

export const invalidatePostsCache = (): void => {
  invalidateCache(CACHE_KEYS.ALL_POSTS);
  invalidateCache('posts_by_category:.*');
  invalidateCache('posts_by_year:.*');
  invalidateCache('posts_by_month:.*');
  invalidateCache('posts_by_year_month:.*');
  invalidateCache('related_posts:.*');
  invalidateCache('popular_posts:.*');
  invalidateCache('recent_posts:.*');
  invalidateCache(CACHE_KEYS.CATEGORY_STATS);
};

export const invalidatePostCache = (slug: string): void => {
  invalidateCache(CACHE_KEYS.POST_BY_SLUG(slug));
  invalidatePostsCache(); // 연관된 모든 포스트 캐시도 삭제
};