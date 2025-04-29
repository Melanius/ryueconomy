// 캐시 매니저 (src/lib/cache/index.ts)
import { BlogPost } from '@/types/post';
import { CategoryId } from '@/types/notion';

// 캐시 데이터 타입
interface CacheData<T> {
  data: T;
  expiry: number;
}

// 캐시 매니저 클래스
export class CacheManager {
  private static instance: CacheManager;
  private cache: Map<string, CacheData<any>>;
  private defaultTTL: number = 5 * 60 * 1000; // 기본 5분 (밀리초)
  
  private constructor() {
    this.cache = new Map();
    
    // 개발 모드에서는 캐시 상태 로깅
    if (process.env.NODE_ENV === 'development') {
      // 1분마다 캐시 상태 로깅
      setInterval(() => {
        this.logCacheStatus();
      }, 60 * 1000);
    }
  }
  
  // 싱글톤 인스턴스 가져오기
  public static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }
  
  // 캐시에서 데이터 가져오기
  public get<T>(key: string): T | null {
    console.log(`🔍 캐시 조회: ${key}`);
    
    const cachedData = this.cache.get(key);
    
    // 캐시 데이터가 없으면 null 반환
    if (!cachedData) {
      console.log(`❌ 캐시 미스: ${key}`);
      return null;
    }
    
    // 캐시 만료 확인
    if (Date.now() > cachedData.expiry) {
      console.log(`⏰ 캐시 만료: ${key}`);
      this.cache.delete(key);
      return null;
    }
    
    console.log(`✅ 캐시 히트: ${key}`);
    return cachedData.data;
  }
  
  // 캐시에 데이터 저장
  public set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    console.log(`💾 캐시 저장: ${key}, TTL: ${ttl}ms`);
    
    const expiry = Date.now() + ttl;
    this.cache.set(key, { data, expiry });
  }
  
  // 특정 키 캐시 삭제
  public delete(key: string): boolean {
    console.log(`🗑️ 캐시 삭제: ${key}`);
    return this.cache.delete(key);
  }
  
  // 특정 패턴의 키 삭제
  public deleteByPattern(pattern: string): number {
    console.log(`🧹 패턴 기반 캐시 삭제: ${pattern}`);
    
    const regex = new RegExp(pattern);
    let count = 0;
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }
    
    console.log(`🧮 삭제된 캐시 항목: ${count}개`);
    return count;
  }
  
  // 전체 캐시 초기화
  public clear(): void {
    console.log(`🧹 모든 캐시 초기화`);
    this.cache.clear();
  }
  
  // 만료된 캐시 정리
  public cleanExpired(): number {
    console.log(`🧹 만료된 캐시 정리 중...`);
    
    const now = Date.now();
    let count = 0;
    
    for (const [key, value] of this.cache.entries()) {
      if (now > value.expiry) {
        this.cache.delete(key);
        count++;
      }
    }
    
    console.log(`🧮 정리된 만료 캐시: ${count}개`);
    return count;
  }
  
  // 캐시 상태 로깅
  public logCacheStatus(): void {
    const cacheSize = this.cache.size;
    let expiredCount = 0;
    const now = Date.now();
    
    for (const value of this.cache.values()) {
      if (now > value.expiry) {
        expiredCount++;
      }
    }
    
    console.log(`📊 캐시 상태: 총 ${cacheSize}개 항목, 만료된 항목 ${expiredCount}개`);
  }
  
  // 캐시 크기 가져오기
  public size(): number {
    return this.cache.size;
  }
}

// 블로그 관련 캐시 함수
export const CACHE_KEYS = {
  ALL_POSTS: 'all_posts',
  POSTS_BY_CATEGORY: (category: CategoryId) => `posts_by_category:${category}`,
  POST_BY_SLUG: (slug: string) => `post_by_slug:${slug}`,
  POST_BY_ID: (id: string) => `post_by_id:${id}`,
  CATEGORY_STATS: 'category_stats',
};

// 캐시 TTL 설정
export const CACHE_TTL = {
  SHORT: 5 * 60 * 1000,        // 5분
  MEDIUM: 30 * 60 * 1000,      // 30분
  LONG: 3 * 60 * 60 * 1000,    // 3시간
  VERY_LONG: 24 * 60 * 60 * 1000, // 24시간
};

// 캐시 메모이제이션 데코레이터
export function memoize<T>(
  fn: (...args: any[]) => Promise<T>,
  keyGenerator: (...args: any[]) => string,
  ttl: number = CACHE_TTL.MEDIUM
): (...args: any[]) => Promise<T> {
  return async function(...args: any[]): Promise<T> {
    const cache = CacheManager.getInstance();
    const key = keyGenerator(...args);
    
    // 캐시에서 데이터 확인
    const cachedData = cache.get<T>(key);
    if (cachedData !== null) {
      return cachedData;
    }
    
    // 캐시에 없으면 함수 실행
    const result = await fn(...args);
    
    // 결과를 캐시에 저장
    cache.set<T>(key, result, ttl);
    
    return result;
  };
}

// 캐시 무효화 함수
export function invalidateCache(pattern: string): void {
  const cache = CacheManager.getInstance();
  cache.deleteByPattern(pattern);
}

// 캐시 상태 가져오기
export function getCacheStatus(): { size: number, info: string } {
  const cache = CacheManager.getInstance();
  return {
    size: cache.size(),
    info: `현재 캐시에 ${cache.size()}개 항목이 있습니다.`
  };
}

export default CacheManager.getInstance();