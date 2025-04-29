import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/posts/route';
import * as notionCache from '@/lib/cache/notion-cache';

// Notion Cache 모듈 모킹
vi.mock('@/lib/cache/notion-cache', () => ({
  getPaginatedPosts: vi.fn(),
  getCategoryStats: vi.fn(),
}));

describe('GET /api/posts', () => {
  // 테스트 데이터
  const mockPosts = [
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
    },
  ];
  
  const mockCategoryStats = {
    'all': { count: 10, percentage: 100, lastUpdated: '2025-04-01' },
    'crypto-morning': { count: 3, percentage: 30, lastUpdated: '2025-04-01' },
    'invest-insight': { count: 4, percentage: 40, lastUpdated: '2025-04-01' },
    'real-portfolio': { count: 1, percentage: 10, lastUpdated: '2025-03-15' },
    'code-lab': { count: 1, percentage: 10, lastUpdated: '2025-03-10' },
    'daily-log': { count: 1, percentage: 10, lastUpdated: '2025-02-20' },
  };
  
  // NextRequest 모킹
  const createMockRequest = (params = {}) => {
    const url = new URL('http://localhost:3000/api/posts');
    
    // URL 파라미터 추가
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, String(value));
    });
    
    return new NextRequest(url);
  };
  
  // 각 테스트 전에 실행
  beforeEach(() => {
    // getPaginatedPosts 모의 구현
    vi.mocked(notionCache.getPaginatedPosts).mockResolvedValue({
      posts: mockPosts,
      hasMore: false,
      total: mockPosts.length,
    });
    
    // getCategoryStats 모의 구현
    vi.mocked(notionCache.getCategoryStats).mockResolvedValue(mockCategoryStats);
  });
  
  // 각 테스트 후에 실행
  afterEach(() => {
    vi.clearAllMocks();
  });
  
  it('should return posts with default parameters', async () => {
    const request = createMockRequest();
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('posts');
    expect(data).toHaveProperty('page', 1);
    expect(data).toHaveProperty('pageSize', 10);
    expect(data).toHaveProperty('total');
    expect(data).toHaveProperty('hasMore');
    expect(data).toHaveProperty('categoryStats');
    
    // getPaginatedPosts 호출 확인
    expect(notionCache.getPaginatedPosts).toHaveBeenCalledWith(
      'all', 1, 10, 'date', 'desc'
    );
    
    // getCategoryStats 호출 확인
    expect(notionCache.getCategoryStats).toHaveBeenCalled();
  });
  
  it('should use pagination parameters from URL', async () => {
    const request = createMockRequest({
      page: 2,
      pageSize: 20,
    });
    
    await GET(request);
    
    // getPaginatedPosts 호출 확인
    expect(notionCache.getPaginatedPosts).toHaveBeenCalledWith(
      'all', 2, 20, 'date', 'desc'
    );
  });
  
  it('should use filtering parameters from URL', async () => {
    const request = createMockRequest({
      category: 'crypto-morning',
      sortBy: 'views',
      sortOrder: 'asc',
    });
    
    await GET(request);
    
    // getPaginatedPosts 호출 확인
    expect(notionCache.getPaginatedPosts).toHaveBeenCalledWith(
      'crypto-morning', 1, 10, 'views', 'asc'
    );
  });
  
  it('should handle errors gracefully', async () => {
    // getPaginatedPosts에서 오류 발생
    vi.mocked(notionCache.getPaginatedPosts).mockRejectedValue(
      new Error('Test error')
    );
    
    const request = createMockRequest();
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(500);
    expect(data).toHaveProperty('error');
    expect(data.error).toContain('포스트를 가져오는 중 오류가 발생했습니다');
  });
  
  it('should include metadata in the response', async () => {
    const request = createMockRequest();
    const response = await GET(request);
    const data = await response.json();
    
    expect(data).toHaveProperty('meta');
    expect(data.meta).toHaveProperty('responseTime');
    expect(data.meta).toHaveProperty('timestamp');
    expect(data.meta).toHaveProperty('query');
    
    // 쿼리 파라미터 확인
    expect(data.meta.query).toHaveProperty('category', 'all');
    expect(data.meta.query).toHaveProperty('sortBy', 'date');
    expect(data.meta.query).toHaveProperty('sortOrder', 'desc');
  });
});
