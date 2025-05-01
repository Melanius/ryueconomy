import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/posts/route';
import * as notionModule from '@/lib/notion';
import { Post } from '@/types/post';

// BlogPost 인터페이스 정의 (notion.ts의 BlogPost 인터페이스와 동일)
interface BlogPost extends Post {
  excerpt: string;
  slug: string;
  image: string;
  featured: boolean;
}

// Notion 모듈 모킹
vi.mock('@/lib/notion', () => ({
  getAllPosts: vi.fn(),
}));

describe('포스트 API 테스트', () => {
  // 모의 데이터
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
  ];
  
  // 각 테스트 전에 실행
  beforeEach(() => {
    // 모의 함수 초기화
    vi.mocked(notionModule.getAllPosts).mockResolvedValue(mockPosts);
  });
  
  // 각 테스트 후에 실행
  afterEach(() => {
    vi.resetAllMocks();
  });
  
  it('기본 요청 처리 테스트', async () => {
    // NextRequest 객체 생성
    const req = new NextRequest('http://localhost:3000/api/posts');
    
    // API 핸들러 호출
    const response = await GET(req);
    const data = await response.json();
    
    // 응답 검증
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('posts');
    expect(data.posts).toHaveLength(2);
    expect(data).toHaveProperty('total', 2);
    expect(data).toHaveProperty('hasMore', false);
    
    // 함수 호출 확인
    expect(notionModule.getAllPosts).toHaveBeenCalledTimes(1);
  });
  
  it('카테고리 필터링 테스트', async () => {
    // 특정 카테고리 요청
    const req = new NextRequest('http://localhost:3000/api/posts?category=crypto-morning');
    
    // API 핸들러 호출
    const response = await GET(req);
    const data = await response.json();
    
    // 응답 검증
    expect(response.status).toBe(200);
    expect(data.posts).toHaveLength(1);
    expect(data.posts[0].category).toBe('crypto-morning');
    expect(data.total).toBe(1);
  });
  
  it('페이지네이션 테스트', async () => {
    // 페이지 크기를 1로 지정
    const req = new NextRequest('http://localhost:3000/api/posts?pageSize=1');
    
    // API 핸들러 호출
    const response = await GET(req);
    const data = await response.json();
    
    // 응답 검증
    expect(response.status).toBe(200);
    expect(data.posts).toHaveLength(1);
    expect(data.hasMore).toBe(true);
    expect(data.pageSize).toBe(1);
  });
  
  it('정렬 테스트 - 조회수 내림차순', async () => {
    // 조회수 내림차순 정렬 요청
    const req = new NextRequest('http://localhost:3000/api/posts?sortBy=views&sortOrder=desc');
    
    // API 핸들러 호출
    const response = await GET(req);
    const data = await response.json();
    
    // 응답 검증
    expect(response.status).toBe(200);
    expect(data.posts[0].views).toBe(100);
    expect(data.posts[1].views).toBe(50);
  });
  
  it('오류 처리 테스트', async () => {
    // 오류 상황 시뮬레이션
    vi.mocked(notionModule.getAllPosts).mockRejectedValueOnce(new Error('테스트 오류'));
    
    // NextRequest 객체 생성
    const req = new NextRequest('http://localhost:3000/api/posts');
    
    // API 핸들러 호출
    const response = await GET(req);
    const data = await response.json();
    
    // 응답 검증
    expect(response.status).toBe(500);
    expect(data).toHaveProperty('error');
    expect(data.message).toBe('테스트 오류');
  });
});
