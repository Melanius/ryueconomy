/**
 * Notion API 직접 호출 모듈
 * 순수하게 API 호출만 담당하며, 데이터 변환과 캐싱 로직은 포함하지 않습니다.
 */
import { 
  PageObjectResponse,
  BlockObjectResponse, 
  PartialBlockObjectResponse
} from '@notionhq/client/build/src/api-endpoints';
import { notion, databaseId } from './client';
import { notionLog } from '../logger';
import { Post } from '@/types/post';
import { CategoryId } from '@/types/notion';
import { pageToPost } from './transformer';

// 재귀 호출 방지 로직 제거: trackApiCall과 releaseApiCall을 단순화
function trackApiCall(_functionName: string): boolean {
  return true;
}

function releaseApiCall(_functionName: string): void {
  // no-op
}

/**
 * 모든 게시물 가져오기 (순수 API 호출)
 */
export async function fetchAllPosts(): Promise<Post[]> {
  const functionName = 'fetchAllPosts';
  
  // 재귀 호출 방지
  if (!trackApiCall(functionName)) {
    return []; // 빈 배열 반환하여 무한 루프 방지
  }
  
  try {
    notionLog.info("🔍 API: 데이터베이스에서 모든 포스트 직접 가져오기 시작...");
    
    // 데이터베이스 ID 확인
    if (!databaseId) {
      notionLog.error("데이터베이스 ID가 설정되지 않았습니다.");
      return [];
    }
    
    // 데이터베이스에서 모든 페이지 가져오기
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        and: [
          {
            property: "Published",
            checkbox: {
              equals: true,
            },
          },
        ],
      },
      sorts: [
        {
          property: "Date",
          direction: "descending",
        },
      ],
      page_size: 100, // 최대 100개 (더 많은 경우 페이지네이션 필요)
    });
    
    // 유효한 게시물 수 로깅
    notionLog.info(`🔍 API: 데이터베이스에서 ${response.results.length}개 페이지 찾음`);
    
    // 각 페이지를 Post 객체로 변환
    const posts = response.results
      .filter(page => page.object === 'page')
      .map(page => pageToPost(page as PageObjectResponse));
    
    notionLog.info(`🔍 API: 총 ${posts.length}개 포스트 변환 완료 (직접 API 호출)`);
    
    return posts;
  } catch (error) {
    notionLog.error("API Error fetching all posts:", error);
    
    // 오류 발생 시 빈 배열 반환
    return [];
  } finally {
    // 호출 종료 처리
    releaseApiCall(functionName);
  }
}

/**
 * slug로 특정 게시물만 가져오기 (순수 API 호출)
 */
export async function fetchPostBySlug(slug: string): Promise<Post | null> {
  const functionName = 'fetchPostBySlug';
  
  // 재귀 호출 방지
  if (!trackApiCall(functionName)) {
    return null; // null 반환하여 무한 루프 방지
  }
  
  try {
    if (!slug) {
      notionLog.warn('🔍 API: 유효하지 않은 slug로 포스트 가져오기 시도');
      return null;
    }
    
    notionLog.info(`🔍 API: Slug로 단일 포스트 직접 가져오기 시작: ${slug}`);
    
    // 데이터베이스 ID 확인
    if (!databaseId) {
      notionLog.error("데이터베이스 ID가 설정되지 않았습니다.");
      return null;
    }
    
    // 데이터베이스에서 해당 slug를 가진 페이지만 쿼리
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        and: [
          {
            property: "Slug",
            rich_text: {
              equals: slug,
            },
          },
          {
            property: "Published",
            checkbox: {
              equals: true,
            },
          },
        ],
      },
      page_size: 1, // 하나만 가져옴
    });
    
    // 결과가 없으면 null 반환
    if (response.results.length === 0) {
      notionLog.info(`🔍 API: Slug에 해당하는 포스트 없음: ${slug}`);
      return null;
    }
    
    // 페이지를 Post 객체로 변환
    const post = pageToPost(response.results[0] as PageObjectResponse);
    notionLog.info(`🔍 API: Slug로 포스트 가져오기 성공: ${slug} (id: ${post.id.substring(0, 8)}...)`);
    
    return post;
  } catch (error) {
    notionLog.error(`API Error fetching post by slug: ${slug}`, error);
    return null;
  } finally {
    // 호출 종료 처리
    releaseApiCall(functionName);
  }
}

/**
 * 카테고리로 게시물 필터링하여 가져오기 (순수 API 호출)
 */
export async function fetchPostsByCategory(category: CategoryId): Promise<Post[]> {
  const functionName = 'fetchPostsByCategory';
  
  // 재귀 호출 방지
  if (!trackApiCall(functionName)) {
    return []; // 빈 배열 반환하여 무한 루프 방지
  }
  
  try {
    notionLog.info(`🔍 API: 카테고리별 포스트 직접 가져오기 시작: ${category}`);
    
    // 데이터베이스 ID 확인
    if (!databaseId) {
      notionLog.error("데이터베이스 ID가 설정되지 않았습니다.");
      return [];
    }
    
    // 데이터베이스에서 해당 카테고리 페이지만 쿼리
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        and: [
          {
            property: "Category",
            select: {
              equals: category,
            },
          },
          {
            property: "Published",
            checkbox: {
              equals: true,
            },
          },
        ],
      },
      sorts: [
        {
          property: "Date",
          direction: "descending",
        },
      ],
      page_size: 100,
    });
    
    // 결과 로깅
    notionLog.info(`🔍 API: 카테고리 '${category}'에서 ${response.results.length}개 페이지 찾음`);
    
    // 각 페이지를 Post 객체로 변환
    const posts = response.results
      .filter(page => page.object === 'page')
      .map(page => pageToPost(page as PageObjectResponse));
    
    notionLog.info(`🔍 API: 카테고리별 포스트 변환 완료: ${posts.length}개`);
    
    return posts;
  } catch (error) {
    notionLog.error(`API Error fetching posts by category: ${category}`, error);
    return [];
  } finally {
    // 호출 종료 처리
    releaseApiCall(functionName);
  }
}

/**
 * 관련 게시물을 위한 최적화된 함수 (유사 카테고리의 다른 게시물 가져오기)
 */
export async function fetchRelatedPosts(currentSlug: string, category: CategoryId, limit: number = 3): Promise<Post[]> {
  const functionName = 'fetchRelatedPosts';
  
  // 재귀 호출 방지
  if (!trackApiCall(functionName)) {
    return []; // 빈 배열 반환하여 무한 루프 방지
  }
  
  try {
    if (!currentSlug || !category) {
      notionLog.warn('🔍 API: 유효하지 않은 slug 또는 카테고리로 관련 포스트 가져오기 시도');
      return [];
    }
    
    notionLog.info(`🔍 API: 관련 포스트 직접 가져오기 시작: ${currentSlug}, 카테고리=${category}`);
    
    // 데이터베이스 ID 확인
    if (!databaseId) {
      notionLog.error("데이터베이스 ID가 설정되지 않았습니다.");
      return [];
    }
    
    // 같은 카테고리, 다른 slug의 게시물 가져오기
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        and: [
          {
            property: "Category",
            select: {
              equals: category,
            },
          },
          {
            property: "Slug",
            rich_text: {
              does_not_equal: currentSlug,
            },
          },
          {
            property: "Published",
            checkbox: {
              equals: true,
            },
          },
        ],
      },
      sorts: [
        {
          property: "Date",
          direction: "descending",
        },
      ],
      page_size: limit,
    });
    
    // 결과 로깅
    notionLog.info(`🔍 API: 관련 포스트로 ${response.results.length}개 페이지 찾음`);
    
    // 각 페이지를 Post 객체로 변환
    const posts = response.results
      .filter(page => page.object === 'page')
      .map(page => pageToPost(page as PageObjectResponse));
    
    notionLog.info(`🔍 API: 관련 포스트 변환 완료: ${posts.length}개`);
    
    return posts;
  } catch (error) {
    notionLog.error(`API Error fetching related posts: ${category}, ${currentSlug}`, error);
    return [];
  } finally {
    // 호출 종료 처리
    releaseApiCall(functionName);
  }
}

/**
 * 블록 컨텐츠 가져오기 (순수 API 호출)
 */
export async function fetchBlocks(blockId: string): Promise<(BlockObjectResponse | PartialBlockObjectResponse)[]> {
  const functionName = 'fetchBlocks';
  
  // 재귀 호출 방지
  if (!trackApiCall(functionName)) {
    return []; // 빈 배열 반환하여 무한 루프 방지
  }
  
  try {
    if (!blockId) {
      notionLog.warn('🔍 API: 유효하지 않은 blockId로 블록 컨텐츠 가져오기 시도');
      return [];
    }
    
    notionLog.info(`🔍 API: 블록 컨텐츠 직접 가져오기 시작: ${blockId.substring(0, 8)}...`);
    
    const { results } = await notion.blocks.children.list({
      block_id: blockId,
      page_size: 100,
    });
    
    notionLog.info(`🔍 API: 블록 컨텐츠 가져오기 성공: ${results.length}개 블록`);
    
    return results;
  } catch (error) {
    notionLog.error(`API Error fetching blocks: ${blockId}`, error);
    return [];
  } finally {
    // 호출 종료 처리
    releaseApiCall(functionName);
  }
}

/**
 * 조회수 증가 함수 (순수 API 호출)
 */
export async function incrementViewCount(slug: string): Promise<number> {
  const functionName = 'incrementViewCount';
  
  // 재귀 호출 방지
  if (!trackApiCall(functionName)) {
    return 0; // 0 반환하여 무한 루프 방지
  }
  
  try {
    if (!slug) {
      notionLog.warn('🔍 API: 유효하지 않은 slug로 조회수 증가 시도');
      return 0;
    }
    
    notionLog.info(`🔍 API: 조회수 증가 시작: ${slug}`);
    
    // 데이터베이스 ID 확인
    if (!databaseId) {
      notionLog.error("데이터베이스 ID가 설정되지 않았습니다.");
      return 0;
    }
    
    // 1. 먼저 해당 slug의 페이지 ID를 찾음
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: "Slug",
        rich_text: {
          equals: slug,
        },
      },
    });
    
    if (response.results.length === 0) {
      notionLog.warn(`🔍 API: 조회수 증가 실패: Slug에 해당하는 페이지 없음 - ${slug}`);
      return 0;
    }
    
    const page = response.results[0] as PageObjectResponse;
    const pageId = page.id;
    
    // 2. 현재 조회수 확인
    const viewsProperty = page.properties.Views || page.properties.views;
    let currentViews = 0;
    
    if (viewsProperty && viewsProperty.type === 'number') {
      currentViews = viewsProperty.number !== null ? viewsProperty.number : 0;
    }
    
    // 3. 조회수 증가
    const newViews = currentViews + 1;
    
    // 4. 업데이트된 조회수 저장
    await notion.pages.update({
      page_id: pageId,
      properties: {
        Views: {
          number: newViews,
        },
      },
    });
    
    notionLog.info(`🔍 API: 조회수 증가 완료: ${slug} (${currentViews} → ${newViews})`);
    
    return newViews;
  } catch (error) {
    notionLog.error(`API Error incrementing view count: ${slug}`, error);
    return 0;
  } finally {
    // 호출 종료 처리
    releaseApiCall(functionName);
  }
}

/**
 * 조회수 기준으로 정렬된 포스트 목록 가져오기 (순수 API 호출)
 */
export async function fetchPopularPosts(limit: number = 10): Promise<Post[]> {
  const functionName = 'fetchPopularPosts';
  
  // 재귀 호출 방지
  if (!trackApiCall(functionName)) {
    return []; // 빈 배열 반환하여 무한 루프 방지
  }
  
  try {
    notionLog.info(`🔍 API: 인기 포스트 가져오기 시작 (limit=${limit})`);
    
    // 호출 전달
    const allPosts = await fetchAllPosts();
    
    // 조회수 기준 내림차순 정렬 후 limit 개수만큼 반환
    const sortedPosts = [...allPosts]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, limit);
    
    notionLog.info(`🔍 API: 인기 포스트 ${sortedPosts.length}개 정렬 완료`);
    
    return sortedPosts;
  } catch (error) {
    notionLog.error("API Error fetching popular posts:", error);
    return [];
  } finally {
    // 호출 종료 처리
    releaseApiCall(functionName);
  }
}

/**
 * 최근 게시물 가져오기 (순수 API 호출)
 */
export async function fetchRecentPosts(limit: number = 5): Promise<Post[]> {
  const functionName = 'fetchRecentPosts';
  
  // 재귀 호출 방지
  if (!trackApiCall(functionName)) {
    return []; // 빈 배열 반환하여 무한 루프 방지
  }
  
  try {
    notionLog.info(`🔍 API: 최근 포스트 가져오기 시작 (limit=${limit})`);
    
    // 전체 포스트 가져오기
    const allPosts = await fetchAllPosts();
    
    // 날짜 기준 내림차순 정렬 후 limit 개수만큼 반환
    const recentPosts = [...allPosts]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
    
    notionLog.info(`🔍 API: 최근 포스트 ${recentPosts.length}개 가져오기 완료`);
    
    return recentPosts;
  } catch (error) {
    notionLog.error(`API Error fetching recent posts:`, error);
    return [];
  } finally {
    // 호출 종료 처리
    releaseApiCall(functionName);
  }
}
