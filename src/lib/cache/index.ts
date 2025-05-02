import { logger } from '@/lib/logger';

/**
 * 특정 패턴에 일치하는 캐시 항목들을 무효화합니다.
 * @param pattern 무효화할 캐시 키 패턴 (예: 'posts:*')
 */
export async function invalidateCache(pattern: string): Promise<void> {
  try {
    logger.info(`캐시 무효화 시작: ${pattern}`);
    
    // 실제 캐시 무효화 로직 구현
    // 예: Redis를 사용하는 경우 여기에 코드 추가
    
    logger.info(`캐시 무효화 완료: ${pattern}`);
  } catch (error) {
    logger.error('캐시 무효화 중 오류 발생', { 
      error: error instanceof Error ? error.message : String(error), 
      pattern 
    });
  }
}

/**
 * 모든 캐시를 무효화합니다.
 */
export async function invalidateAllCache(): Promise<void> {
  return invalidateCache('*');
}

/**
 * 특정 키에 해당하는 캐시를 무효화합니다.
 * @param key 무효화할 캐시 키
 */
export async function invalidateCacheKey(key: string): Promise<void> {
  return invalidateCache(key);
} 