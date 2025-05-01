/**
 * Notion API 통합 인터페이스 (재설계)
 * 
 * 이 파일은 Notion API 관련 모든 함수를 외부에 노출합니다.
 * 순환 참조 문제를 해결하기 위해 구조가 재설계되었습니다.
 */

// Notion 클라이언트 및 설정 export
import { notion, databaseId } from './client';

// 캐시 레이어의 모든 함수 export (외부에서 사용할 주요 API)
import {
  fetchAllPosts as getAllPosts,
  fetchPostBySlug as getPostBySlug,
  fetchPostsByCategory as getPostsByCategory,
  fetchRelatedPosts as getRelatedPosts,
  fetchBlocks as getBlocks,
  fetchPopularPosts as getPopularPosts,
  fetchRecentPosts as getRecentPosts,
  incrementViewCount
} from './api';

// 데이터 변환 유틸리티 함수 export
import { pageToPost } from './transformer';

// 전체 기능 export
export {
  // 클라이언트 및 설정
  notion,
  databaseId,
  
  // 캐시 지원 함수 (주요 API 호출)
  getAllPosts,
  getPostBySlug,
  getPostsByCategory,
  getRelatedPosts,
  getPopularPosts,
  getRecentPosts,
  getBlocks,
  incrementViewCount,
  
  // 데이터 변환 유틸리티
  pageToPost,
};

// 환경 변수 설정을 통한 캐시 비활성화 방법 문서화
/**
 * 캐시 비활성화 방법:
 * .env.local 파일에 DISABLE_NOTION_CACHE=true 추가
 * 
 * 재귀 호출 방지 설정:
 * .env.local 파일에 MAX_RECURSION_DEPTH=3 추가 (기본값)
 */
