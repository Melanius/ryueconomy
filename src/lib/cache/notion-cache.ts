import { logger } from '@/lib/logger';
import { invalidateCache } from './index';

/**
 * 특정 Notion 포스트의 캐시를 무효화합니다.
 * @param pageId 무효화할 Notion 페이지 ID
 */
export async function invalidatePostCache(pageId: string): Promise<void> {
  try {
    logger.info(`포스트 캐시 무효화: ${pageId.substring(0, 8)}...`);
    
    // 해당 페이지 관련 모든 캐시 무효화 (블록, 메타데이터 등)
    await invalidateCache(`post:${pageId}:*`);
    
    // 포스트 메타데이터 캐시 무효화
    await invalidateCache(`post:meta:${pageId}`);
    
    // 포스트 콘텐츠 캐시 무효화
    await invalidateCache(`post:content:${pageId}`);
    
    // 슬러그로 저장된 캐시도 무효화 필요
    // 이 경우 슬러그를 모르기 때문에, 포스트 목록 전체를 무효화하는 것이 안전
    await invalidatePostsCache();
    
    logger.info(`포스트 캐시 무효화 완료: ${pageId.substring(0, 8)}...`);
  } catch (error) {
    logger.error('포스트 캐시 무효화 중 오류 발생', { 
      error: error instanceof Error ? error.message : String(error), 
      pageId 
    });
  }
}

/**
 * 모든 Notion 포스트 목록 캐시를 무효화합니다.
 */
export async function invalidatePostsCache(): Promise<void> {
  try {
    logger.info('포스트 목록 캐시 무효화 시작');
    
    // 포스트 목록 관련 모든 캐시 무효화
    await invalidateCache('posts:*');
    
    // 카테고리별 포스트 목록 캐시 무효화
    await invalidateCache('posts:category:*');
    
    // 태그별 포스트 목록 캐시 무효화
    await invalidateCache('posts:tag:*');
    
    // 아카이브 데이터 캐시 무효화
    await invalidateCache('posts:archive:*');
    
    logger.info('포스트 목록 캐시 무효화 완료');
  } catch (error) {
    logger.error('포스트 목록 캐시 무효화 중 오류 발생', { 
      error: error instanceof Error ? error.message : String(error)
    });
  }
} 