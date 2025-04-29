import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/stats/categories/route';
import * as notionCache from '@/lib/cache/notion-cache';

// Notion Cache 모듈 모킹
vi.mock('@/lib/cache/notion-cache', () => ({
  getCategoryStats: vi.fn(),
}));

describe('GET /api/stats/categories', () => {
  // 테스트 데이터
  const mockCategoryStats = {
    'all': { count: 10, percentage: 100, lastUpdated: '2025-04-01' },
    'crypto-morning': { count: 3, percentage: 30, lastUpdated: '2025-04-01' },
    'invest-insight': { count: 4, percentage: 40, lastUpdated: '2025-04-01' },
    'real-portfolio': { count: 1, percentage: 10, lastUpdated: '2025-03-15' },
    'code-lab': { count: 1, percentage: 10, lastUpdated: '2025-03-10' },
    'daily-log': { count: 1, percentage: 10, lastUpdated: '2025-02-20' },
  };
  
  // NextRequest 모킹
  const createMockRequest = () => {
    return new NextRequest('http://localhost:3000/api/stats/categories');
  };
  
  // 각 테스트 전에 실행
  beforeEach(() => {
    // getCategoryStats 모의 구현
    vi.mocked(notionCache.getCategoryStats).mockResolvedValue(mockCategoryStats);
  });
  
  // 각 테스트 후에 실행
  afterEach(() => {
    vi.clearAllMocks();
  });
  
  it('should return category statistics', async () => {
    const request = createMockRequest();
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('categories');
    expect(data).toHaveProperty('chartData');
    expect(data).toHaveProperty('total');
    expect(data).toHaveProperty('meta');
    
    // getCategoryStats 호출 확인
    expect(notionCache.getCategoryStats).toHaveBeenCalled();
    
    // 카테고리 데이터 확인
    expect(data.categories).toEqual(mockCategoryStats);
    
    // 차트 데이터 확인
    expect(data.chartData).toHaveLength(5); // 'all' 제외한 5개 카테고리
    expect(data.chartData[0]).toHaveProperty('category');
    expect(data.chartData[0]).toHaveProperty('count');
    expect(data.chartData[0]).toHaveProperty('percentage');
    expect(data.chartData[0]).toHaveProperty('lastUpdated');
    
    // 전체 게시물 수 확인
    expect(data.total).toBe(10);
  });
  
  it('should include metadata in the response', async () => {
    const request = createMockRequest();
    const response = await GET(request);
    const data = await response.json();
    
    expect(data).toHaveProperty('meta');
    expect(data.meta).toHaveProperty('responseTime');
    expect(data.meta).toHaveProperty('timestamp');
  });
  
  it('should handle errors gracefully', async () => {
    // getCategoryStats에서 오류 발생
    vi.mocked(notionCache.getCategoryStats).mockRejectedValue(
      new Error('Test error')
    );
    
    const request = createMockRequest();
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(500);
    expect(data).toHaveProperty('error');
    expect(data.error).toContain('카테고리 통계를 가져오는 중 오류가 발생했습니다');
  });
  
  it('should calculate percentages correctly', async () => {
    const request = createMockRequest();
    const response = await GET(request);
    const data = await response.json();
    
    // 백분율 합계 확인 (반올림 오차로 인해 정확히 100%가 아닐 수 있음)
    const totalPercentage = data.chartData.reduce(
      (sum, item) => sum + item.percentage,
      0
    );
    
    expect(totalPercentage).toBeGreaterThanOrEqual(99);
    expect(totalPercentage).toBeLessThanOrEqual(101);
    
    // 개별 카테고리 비율 확인
    const cryptoMorningData = data.chartData.find(
      item => item.category === 'crypto-morning'
    );
    expect(cryptoMorningData).toHaveProperty('percentage', 30);
    
    const investInsightData = data.chartData.find(
      item => item.category === 'invest-insight'
    );
    expect(investInsightData).toHaveProperty('percentage', 40);
  });
});
