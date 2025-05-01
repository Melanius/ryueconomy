import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/stats/categories/route';
import * as notionModule from '@/lib/notion';
import { Post } from '@/types/post';

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

describe('카테고리 통계 API 테스트', () => {
  // 테스트용 모의 데이터
  const mockPosts: BlogPost[] = [
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
      tags: ['테스트', '포스트'],
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
      category: 'crypto-morning',
      date: '2025-04-01',
      views: 90,
      featured: false,
      image: 'https://example.com/image2.jpg',
      content: '',
      tags: ['테스트', '포스트'],
      author: {
        name: '테스트 작성자',
        image: 'https://example.com/author1.jpg'
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
      tags: ['테스트', '포스트'],
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
      tags: ['투자', '인사이트'],
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
      category: 'invest-insight',
      date: '2025-03-25',
      views: 60,
      featured: false,
      image: 'https://example.com/image5.jpg',
      content: '',
      tags: ['투자', '인사이트'],
      author: {
        name: '테스트 작성자',
        image: 'https://example.com/author2.jpg'
      }
    },
    {
      id: 'post6',
      title: '테스트 포스트 6',
      slug: 'test-post-6',
      excerpt: '테스트 포스트 6 요약',
      category: 'invest-insight',
      date: '2025-03-20',
      views: 50,
      featured: false,
      image: 'https://example.com/image6.jpg',
      content: '',
      tags: ['투자', '인사이트'],
      author: {
        name: '테스트 작성자',
        image: 'https://example.com/author2.jpg'
      }
    },
    {
      id: 'post7',
      title: '테스트 포스트 7',
      slug: 'test-post-7',
      excerpt: '테스트 포스트 7 요약',
      category: 'invest-insight',
      date: '2025-03-15',
      views: 40,
      featured: false,
      image: 'https://example.com/image7.jpg',
      content: '',
      tags: ['투자', '인사이트'],
      author: {
        name: '테스트 작성자',
        image: 'https://example.com/author2.jpg'
      }
    },
    {
      id: 'post8',
      title: '테스트 포스트 8',
      slug: 'test-post-8',
      excerpt: '테스트 포스트 8 요약',
      category: 'real-portfolio',
      date: '2025-03-10',
      views: 30,
      featured: false,
      image: 'https://example.com/image8.jpg',
      content: '',
      tags: ['포트폴리오'],
      author: {
        name: '테스트 작성자',
        image: 'https://example.com/author3.jpg'
      }
    },
    {
      id: 'post9',
      title: '테스트 포스트 9',
      slug: 'test-post-9',
      excerpt: '테스트 포스트 9 요약',
      category: 'code-lab',
      date: '2025-03-05',
      views: 20,
      featured: false,
      image: 'https://example.com/image9.jpg',
      content: '',
      tags: ['코드', '개발'],
      author: {
        name: '테스트 작성자',
        image: 'https://example.com/author3.jpg'
      }
    },
    {
      id: 'post10',
      title: '테스트 포스트 10',
      slug: 'test-post-10',
      excerpt: '테스트 포스트 10 요약',
      category: 'daily-log',
      date: '2025-03-01',
      views: 10,
      featured: false,
      image: 'https://example.com/image10.jpg',
      content: '',
      tags: ['일상'],
      author: {
        name: '테스트 작성자',
        image: 'https://example.com/author3.jpg'
      }
    }
  ];
  
  // 각 테스트 전에 실행
  beforeEach(() => {
    // getAllPosts 모의 구현
    vi.mocked(notionModule.getAllPosts).mockResolvedValue(mockPosts);
  });
  
  // 각 테스트 후에 실행
  afterEach(() => {
    vi.resetAllMocks();
  });
  
  it('카테고리 통계 반환 테스트', async () => {
    const request = new NextRequest('http://localhost:3000/api/stats/categories');
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('categories');
    expect(data).toHaveProperty('chartData');
    expect(data).toHaveProperty('total');
    expect(data).toHaveProperty('meta');
    
    // getAllPosts 호출 확인
    expect(notionModule.getAllPosts).toHaveBeenCalledTimes(1);
    
    // 카테고리 데이터 확인
    expect(data.categories).toHaveProperty('all');
    expect(data.categories).toHaveProperty('crypto-morning');
    expect(data.categories).toHaveProperty('invest-insight');
    expect(data.categories).toHaveProperty('real-portfolio');
    expect(data.categories).toHaveProperty('code-lab');
    expect(data.categories).toHaveProperty('daily-log');
    
    // 전체 게시물 수 확인
    expect(data.total).toBe(10);
    
    // 카테고리별 포스트 수 확인
    expect(data.categories['crypto-morning'].count).toBe(3);
    expect(data.categories['invest-insight'].count).toBe(4);
    expect(data.categories['real-portfolio'].count).toBe(1);
    expect(data.categories['code-lab'].count).toBe(1);
    expect(data.categories['daily-log'].count).toBe(1);
  });
  
  it('메타데이터 포함 확인', async () => {
    const request = new NextRequest('http://localhost:3000/api/stats/categories');
    const response = await GET(request);
    const data = await response.json();
    
    expect(data).toHaveProperty('meta');
    expect(data.meta).toHaveProperty('responseTime');
    expect(data.meta).toHaveProperty('timestamp');
  });
  
  it('오류 처리 테스트', async () => {
    // getAllPosts에서 오류 발생
    vi.mocked(notionModule.getAllPosts).mockRejectedValueOnce(
      new Error('테스트 오류')
    );
    
    const request = new NextRequest('http://localhost:3000/api/stats/categories');
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(500);
    expect(data).toHaveProperty('error');
    expect(data.message).toBe('테스트 오류');
  });
  
  it('백분율 계산 정확성 확인', async () => {
    const request = new NextRequest('http://localhost:3000/api/stats/categories');
    const response = await GET(request);
    const data = await response.json();
    
    // 백분율 합계 확인 (반올림 오차로 인해 정확히 100%가 아닐 수 있음)
    const totalPercentage = data.chartData.reduce(
      (sum: number, item: ChartDataItem) => sum + item.percentage,
      0
    );
    
    expect(totalPercentage).toBeGreaterThanOrEqual(99);
    expect(totalPercentage).toBeLessThanOrEqual(101);
    
    // 개별 카테고리 비율 확인
    const cryptoMorningData = data.chartData.find(
      (item: ChartDataItem) => item.category === 'crypto-morning'
    );
    expect(cryptoMorningData).toHaveProperty('percentage', 30);
    
    const investInsightData = data.chartData.find(
      (item: ChartDataItem) => item.category === 'invest-insight'
    );
    expect(investInsightData).toHaveProperty('percentage', 40);
  });
});
