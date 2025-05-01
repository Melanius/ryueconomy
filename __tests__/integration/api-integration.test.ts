import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { GET as getPosts } from '@/app/api/posts/route';
import { GET as getCategories } from '@/app/api/stats/categories/route';
import * as notionModule from '@/lib/notion';
import { Post } from '@/types/post';

/**
 * 통합 테스트: API 엔드포인트 간의 상호 작용 테스트
 * 
 * 이 테스트는 여러 API 엔드포인트를 함께 사용하는 시나리오를 시뮬레이션합니다.
 * 예를 들어, 카테고리 통계를 가져온 다음 해당 카테고리의 포스트를 가져오는 경우입니다.
 * 
 * 참고: 이 테스트는 실제 HTTP 서버를 시작하지 않고 API 핸들러 함수를 직접 호출합니다.
 * 실제 HTTP 테스트는 Cypress나 Playwright와 같은 도구를 사용하는 것이 더 적합합니다.
 */

// BlogPost 인터페이스 정의 (notion.ts의 BlogPost 인터페이스와 동일)
interface BlogPost extends Post {
  excerpt: string;
  slug: string;
  image: string;
  featured: boolean;
}

// 차트 데이터 아이템 인터페이스
interface ChartDataItem {
  category: string;
  count: number;
  percentage: number;
  lastUpdated: string;
}

// Notion 모듈 모킹
vi.mock('@/lib/notion', () => ({
  getAllPosts: vi.fn(),
}));

describe('API 통합 테스트', () => {
  // 모의 데이터
  let mockPosts: BlogPost[];
  
  // 각 테스트 세트 전에 실행
  beforeAll(() => {
    // 테스트 데이터 설정
    mockPosts = [
      {
        id: 'post1',
        title: '테스트 포스트 1',
        slug: 'test-post-1',
        excerpt: '테스트 포스트 1 요약',
        category: 'crypto-morning',
        date: '2025-04-01',
        views: 100,
        featured: false,
        image: 'https://example.com/image1.jpg',
        content: '',
        tags: ['테스트', '크립토'],
        author: {
          name: '테스트 작성자',
          image: 'https://example.com/author1.jpg'
        }
      },
      {
        id: 'post2',
        title: '테스트 포스트 2',
        slug: 'test-post-2',
        excerpt: '테스트 포스트 2 요약',
        category: 'invest-insight',
        date: '2025-04-02',
        views: 50,
        featured: true,
        image: 'https://example.com/image2.jpg',
        content: '',
        tags: ['투자', '인사이트'],
        author: {
          name: '테스트 작성자',
          image: 'https://example.com/author2.jpg'
        }
      },
      {
        id: 'post3',
        title: '테스트 포스트 3',
        slug: 'test-post-3',
        excerpt: '테스트 포스트 3 요약',
        category: 'crypto-morning',
        date: '2025-03-30',
        views: 80,
        featured: false,
        image: 'https://example.com/image3.jpg',
        content: '',
        tags: ['크립토', '분석'],
        author: {
          name: '테스트 작성자',
          image: 'https://example.com/author1.jpg'
        }
      },
      {
        id: 'post4',
        title: '테스트 포스트 4',
        slug: 'test-post-4',
        excerpt: '테스트 포스트 4 요약',
        category: 'invest-insight',
        date: '2025-03-28',
        views: 70,
        featured: true,
        image: 'https://example.com/image4.jpg',
        content: '',
        tags: ['투자', '시장분석'],
        author: {
          name: '테스트 작성자',
          image: 'https://example.com/author2.jpg'
        }
      },
      {
        id: 'post5',
        title: '테스트 포스트 5',
        slug: 'test-post-5',
        excerpt: '테스트 포스트 5 요약',
        category: 'real-portfolio',
        date: '2025-03-25',
        views: 30,
        featured: false,
        image: 'https://example.com/image5.jpg',
        content: '',
        tags: ['포트폴리오', '리뷰'],
        author: {
          name: '테스트 작성자',
          image: 'https://example.com/author3.jpg'
        }
      },
      {
        id: 'post6',
        title: '테스트 포스트 6',
        slug: 'test-post-6',
        excerpt: '테스트 포스트 6 요약',
        category: 'code-lab',
        date: '2025-03-15',
        views: 20,
        featured: false,
        image: 'https://example.com/image6.jpg',
        content: '',
        tags: ['코드', '개발'],
        author: {
          name: '테스트 작성자',
          image: 'https://example.com/author3.jpg'
        }
      },
      {
        id: 'post7',
        title: '테스트 포스트 7',
        slug: 'test-post-7',
        excerpt: '테스트 포스트 7 요약',
        category: 'daily-log',
        date: '2025-03-10',
        views: 10,
        featured: false,
        image: 'https://example.com/image7.jpg',
        content: '',
        tags: ['일상'],
        author: {
          name: '테스트 작성자',
          image: 'https://example.com/author3.jpg'
        }
      }
    ];
    
    // Notion 모듈 모킹
    vi.mocked(notionModule.getAllPosts).mockResolvedValue(mockPosts);
  });
  
  // 각 테스트 세트 후에 실행
  afterAll(() => {
    vi.restoreAllMocks();
  });
  
  it('카테고리 통계를 가져온 다음 해당 카테고리의 포스트 가져오기', async () => {
    // 1. 먼저 카테고리 통계 가져오기
    const categoriesRequest = new NextRequest('http://localhost:3000/api/stats/categories');
    const categoriesResponse = await getCategories(categoriesRequest);
    const categoriesData = await categoriesResponse.json();
    
    // 카테고리 통계 확인
    expect(categoriesResponse.status).toBe(200);
    expect(categoriesData).toHaveProperty('categories');
    expect(categoriesData).toHaveProperty('chartData');
    
    // 최대 포스트 수를 가진 카테고리 찾기
    const maxPostsCategory = categoriesData.chartData.reduce(
      (max: ChartDataItem, current: ChartDataItem) => (current.count > max.count ? current : max),
      { count: 0 } as ChartDataItem
    );
    
    // 2. 가장 많은 포스트가 있는 카테고리의 포스트 가져오기
    const postsRequest = new NextRequest(
      `http://localhost:3000/api/posts?category=${maxPostsCategory.category}`
    );
    const postsResponse = await getPosts(postsRequest);
    const postsData = await postsResponse.json();
    
    // 포스트 데이터 확인
    expect(postsResponse.status).toBe(200);
    expect(postsData).toHaveProperty('posts');
    expect(postsData).toHaveProperty('total');
    
    // 해당 카테고리에 맞는 포스트만 반환되었는지 확인
    expect(postsData.posts.every(
      (post: BlogPost) => post.category === maxPostsCategory.category
    )).toBe(true);
    
    // 포스트 수와 카테고리 통계가 일치하는지 확인
    expect(postsData.total).toBe(maxPostsCategory.count);
  });
  
  it('다양한 정렬 옵션으로 포스트 가져오기', async () => {
    // 1. 날짜순 내림차순 (최신순)
    const dateDescRequest = new NextRequest(
      'http://localhost:3000/api/posts?sortBy=date&sortOrder=desc'
    );
    const dateDescResponse = await getPosts(dateDescRequest);
    const dateDescData = await dateDescResponse.json();
    
    // 2. 조회수순 내림차순 (인기순)
    const viewsDescRequest = new NextRequest(
      'http://localhost:3000/api/posts?sortBy=views&sortOrder=desc'
    );
    const viewsDescResponse = await getPosts(viewsDescRequest);
    const viewsDescData = await viewsDescResponse.json();
    
    // 정렬 결과 확인
    expect(dateDescData.posts[0].date).toBe('2025-04-02'); // 최신 날짜
    expect(viewsDescData.posts[0].views).toBe(100); // 최다 조회수
    
    // 메타데이터에 정렬 정보가 제대로 포함되어 있는지 확인
    expect(dateDescData.meta.query).toHaveProperty('sortBy', 'date');
    expect(dateDescData.meta.query).toHaveProperty('sortOrder', 'desc');
    
    expect(viewsDescData.meta.query).toHaveProperty('sortBy', 'views');
    expect(viewsDescData.meta.query).toHaveProperty('sortOrder', 'desc');
  });
  
  it('페이지네이션 파라미터 처리 확인', async () => {
    // 페이지 2, 페이지당 2개 항목 요청
    const paginationRequest = new NextRequest(
      'http://localhost:3000/api/posts?page=2&pageSize=2'
    );
    const paginationResponse = await getPosts(paginationRequest);
    const paginationData = await paginationResponse.json();
    
    // 페이지네이션 정보 확인
    expect(paginationData).toHaveProperty('page', 2);
    expect(paginationData).toHaveProperty('pageSize', 2);
    expect(paginationData.posts.length).toBeLessThanOrEqual(2);
    
    // 전체 포스트 수에 맞게 페이지네이션 적용되었는지 확인
    expect(paginationData.total).toBe(mockPosts.length);
  });
  
  it('여러 필터 조건 조합', async () => {
    // 카테고리, 정렬, 페이지네이션이 모두 적용된 요청
    const complexRequest = new NextRequest(
      'http://localhost:3000/api/posts?category=crypto-morning&sortBy=views&sortOrder=desc&page=1&pageSize=10'
    );
    const complexResponse = await getPosts(complexRequest);
    const complexData = await complexResponse.json();
    
    // 응답 확인
    expect(complexResponse.status).toBe(200);
    
    // 필터 및 정렬 결과 확인
    expect(complexData.posts.every(
      (post: BlogPost) => post.category === 'crypto-morning'
    )).toBe(true);
    
    // 정렬 확인 (조회수 내림차순)
    if (complexData.posts.length >= 2) {
      expect(complexData.posts[0].views).toBeGreaterThanOrEqual(complexData.posts[1].views);
    }
    
    // 메타데이터에 모든 필터 정보가 제대로 포함되어 있는지 확인
    expect(complexData.meta.query).toHaveProperty('category', 'crypto-morning');
    expect(complexData.meta.query).toHaveProperty('sortBy', 'views');
    expect(complexData.meta.query).toHaveProperty('sortOrder', 'desc');
  });
  
  it('카테고리 통계와 포스트 데이터 일관성 확인', async () => {
    // 카테고리 통계 가져오기
    const categoriesRequest = new NextRequest('http://localhost:3000/api/stats/categories');
    const categoriesResponse = await getCategories(categoriesRequest);
    const categoriesData = await categoriesResponse.json();
    
    // 각 카테고리의 포스트 데이터 가져오기
    for (const categoryItem of categoriesData.chartData) {
      const category = categoryItem.category;
      
      // 해당 카테고리의 포스트 요청
      const postsRequest = new NextRequest(
        `http://localhost:3000/api/posts?category=${category}`
      );
      const postsResponse = await getPosts(postsRequest);
      const postsData = await postsResponse.json();
      
      // 카테고리 통계의 개수와 실제 포스트 수가 일치하는지 확인
      expect(postsData.total).toBe(categoryItem.count);
      
      // 모든 포스트가 해당 카테고리에 속하는지 확인
      const correctCategory = postsData.posts.every(
        (post: BlogPost) => post.category === category
      );
      expect(correctCategory).toBe(true);
    }
  });
  
  it('통계 및 필터링 API 성능 비교', async () => {
    // 카테고리 통계 API 성능 측정
    const categoriesStartTime = performance.now();
    const categoriesRequest = new NextRequest('http://localhost:3000/api/stats/categories');
    const categoriesResponse = await getCategories(categoriesRequest);
    const categoriesEndTime = performance.now();
    const categoriesResponseTime = categoriesEndTime - categoriesStartTime;
    
    // 포스트 API 성능 측정
    const postsStartTime = performance.now();
    const postsRequest = new NextRequest('http://localhost:3000/api/posts');
    const postsResponse = await getPosts(postsRequest);
    const postsEndTime = performance.now();
    const postsResponseTime = postsEndTime - postsStartTime;
    
    // 필터링된 포스트 API 성능 측정
    const filteredStartTime = performance.now();
    const filteredRequest = new NextRequest(
      'http://localhost:3000/api/posts?category=crypto-morning'
    );
    const filteredResponse = await getPosts(filteredRequest);
    const filteredEndTime = performance.now();
    const filteredResponseTime = filteredEndTime - filteredStartTime;
    
    // 모든 API 응답이 성공적인지 확인
    expect(categoriesResponse.status).toBe(200);
    expect(postsResponse.status).toBe(200);
    expect(filteredResponse.status).toBe(200);
    
    // 모든 API가 응답 시간을 메타데이터에 포함하는지 확인
    const categoriesData = await categoriesResponse.json();
    const postsData = await postsResponse.json();
    const filteredData = await filteredResponse.json();
    
    expect(categoriesData.meta).toHaveProperty('responseTime');
    expect(postsData.meta).toHaveProperty('responseTime');
    expect(filteredData.meta).toHaveProperty('responseTime');
  });
});
