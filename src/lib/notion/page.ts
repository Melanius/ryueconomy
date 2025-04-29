import {
  PageObjectResponse,
  QueryDatabaseParameters,
} from '@notionhq/client/build/src/api-endpoints';
import { Post as BlogPost, CategoryId } from "@/types/post";
import { notion, databaseId } from './client';
import { fetchPageBlocks, blocksToMarkdown } from './render';
import { ExtendedBlockObjectResponse } from './blocks';

/**
 * 노션 카테고리를 블로그 카테고리 형식으로 변환
 */
function mapNotionCategory(notionCategory: string): CategoryId {
  // 카테고리가 없으면 기본값 반환
  if (!notionCategory || notionCategory === 'Uncategorized') {
    return 'daily-log';
  }

  // 카테고리 이름 정규화 (소문자 변환, 공백 제거)
  const normalizedCategory = notionCategory.toLowerCase().replace(/\s+/g, '-');

  // 카테고리 매핑 정의
  const categoryMap: Record<string, CategoryId> = {
    // 노션 카테고리 이름 : 블로그 카테고리 키
    '크립토모닝': 'crypto-morning',
    '크립토': 'crypto-morning',
    'crypto': 'crypto-morning',
    'crypto-morning': 'crypto-morning',

    '투자인사이트': 'invest-insight',
    '투자-인사이트': 'invest-insight',
    '투자': 'invest-insight',
    'invest': 'invest-insight',
    'invest-insight': 'invest-insight',

    '포트폴리오': 'real-portfolio',
    '리얼포폴': 'real-portfolio',
    'portfolio': 'real-portfolio',
    'real-portfolio': 'real-portfolio',

    '코드랩': 'code-lab',
    '코딩': 'code-lab',
    'code': 'code-lab',
    'code-lab': 'code-lab',

    '데일리로그': 'daily-log',
    '일상': 'daily-log',
    'daily': 'daily-log',
    'daily-log': 'daily-log',
  };

  console.log(`📘 카테고리 매핑: "${notionCategory}" → 정규화: "${normalizedCategory}"`);

  // 매핑된 카테고리 반환 또는 기본값
  const mappedCategory = categoryMap[normalizedCategory] || categoryMap[notionCategory];

  if (mappedCategory) {
    console.log(`📘 매핑 성공: "${notionCategory}" → "${mappedCategory}"`);
    return mappedCategory;
  }

  // 매핑 실패 시, 직접 5개 카테고리 중 하나인지 확인
  const validCategories: CategoryId[] = ['crypto-morning', 'invest-insight', 'real-portfolio', 'code-lab', 'daily-log'];
  if (validCategories.includes(normalizedCategory as CategoryId)) {
    console.log(`📘 유효한 카테고리 발견: "${normalizedCategory}"`);
    return normalizedCategory as CategoryId;
  }

  // 최종적으로 적절한 매핑이 없으면 기본 카테고리 반환
  console.log(`📘 카테고리 매핑 실패: "${notionCategory}" → 기본값 "daily-log" 사용`);
  return 'daily-log';
}

/**
 * 노션 페이지 객체를 Post 인터페이스로 변환
 */
export function pageToPost(page: PageObjectResponse): BlogPost {
  try {
    if (!page || !page.properties) {
        console.error("🔴 Invalid page object received in pageToPost:", page);
        throw new Error("Invalid page object");
    }
    console.log(`📘 페이지 변환 시작: ID ${page.id.substring(0, 8)}...`);

    // 페이지 속성을 콘솔에 출력 (디버깅)
    console.log(`📘 페이지 속성 목록:`, Object.keys(page.properties).map(key => ({
      key,
      type: (page.properties as any)[key]?.type ?? 'unknown' // Check for undefined property
    })));

    // 여기서 Notion 페이지의 프로퍼티를 확인하여 필요한 데이터를 추출
    const titleProperty = page.properties.title || page.properties.Title || page.properties.Name;
    let title = 'Untitled';

    if (titleProperty?.type === 'title' && Array.isArray(titleProperty.title) && titleProperty.title.length > 0) {
      title = titleProperty.title.map(t => t.plain_text).join("").trim();
      if (title === '') {
        title = `Untitled-${page.id.substring(0, 6)}`;
        console.log(`📘 빈 제목 발견: 기본값으로 대체 "${title}"`);
      }
    } else {
      title = `Untitled-${page.id.substring(0, 6)}`;
      console.log(`📘 제목 속성 없음: 기본값 사용 "${title}"`);
    }

    const slugProperty = page.properties.slug || page.properties.Slug;
    let slug = '';

    if (slugProperty?.type === 'rich_text' && Array.isArray(slugProperty.rich_text) && slugProperty.rich_text.length > 0) {
      slug = slugProperty.rich_text.map(t => t.plain_text).join("").trim();
    }

    if (!slug) {
      slug = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');

      if (!slug || slug === '-') {
        slug = `post-${page.id.substring(0, 8)}`;
      }
      console.log(`📘 슬러그 자동 생성: "${title}" → "${slug}"`);
    }

    const excerptProperty = page.properties.excerpt || page.properties.Excerpt;
    const excerpt = (excerptProperty?.type === 'rich_text' && Array.isArray(excerptProperty.rich_text) && excerptProperty.rich_text.length > 0)
      ? excerptProperty.rich_text.map(t => t.plain_text).join("")
      : "";

    const categoryProperty = page.properties.category || page.properties.Category;
    let notionCategory = 'Uncategorized';

    if (categoryProperty?.type === 'select' && categoryProperty.select?.name) {
      notionCategory = categoryProperty.select.name;
    }
    const category = mapNotionCategory(notionCategory);

    const dateProperty = page.properties.date || page.properties.Date || page.properties.Published || page.properties['생성 일시'] || page.properties.Created;
    let date = new Date().toISOString().split('T')[0];

    if (dateProperty?.type === 'date' && dateProperty.date?.start) {
      date = dateProperty.date.start;
    } else if (page.created_time) {
      date = new Date(page.created_time).toISOString().split('T')[0];
      console.log(`📘 날짜 속성 없음, 생성일 사용: ${date}`);
    }

    const viewsProperty = page.properties.views || page.properties.Views;
    let views = 0;
    if (viewsProperty?.type === 'number' && viewsProperty.number !== null) {
      views = viewsProperty.number;
      console.log(`📘 조회수 추출 성공: ${views}`);
    } else {
      console.log(`📘 조회수 속성 (${viewsProperty?.type}) 문제 또는 찾을 수 없음`);
    }

    const featuredProperty = page.properties.featured || page.properties.Featured;
    const featured = (featuredProperty?.type === 'checkbox' && featuredProperty.checkbox) || false;

    let image = '';
    if (page.cover) {
      if (page.cover.type === 'external') image = page.cover.external.url;
      else if (page.cover.type === 'file') image = page.cover.file.url;
    }

    const imageProperty = page.properties.image || page.properties.Image || page.properties.Cover || page.properties.Thumbnail || page.properties.Thurmbnail;
    if (!image && imageProperty?.type === 'url' && imageProperty.url) {
        image = imageProperty.url;
    } else if (!image && imageProperty?.type === 'files' && Array.isArray(imageProperty.files) && imageProperty.files.length > 0) {
        const file = imageProperty.files[0];
        if (file.type === 'external') image = file.external.url;
        else if (file.type === 'file') image = file.file.url;
    }


    console.log(`📘 포스트 변환 완료: "${title}" (${category}), 조회수: ${views}`);

    return {
      id: page.id,
      title,
      slug,
      excerpt,
      category,
      date,
      views,
      featured,
      image,
      content: "", // Content fetched separately
    };
  } catch (error) {
    console.error(`🔴 Error converting page ${page?.id ?? 'UNKNOWN'} to post:`, error);
    // Return a default/error post object
    return {
      id: page?.id ?? 'error-id',
      title: "오류 발생한 게시물",
      slug: page?.id ?? 'error-slug',
      excerpt: `이 게시물(ID: ${page?.id ?? 'UNKNOWN'})을 변환하는 중 오류가 발생했습니다.`,
      category: "daily-log",
      date: new Date().toISOString().split('T')[0],
      views: 0,
      featured: false,
      image: '',
      content: "",
    };
  }
}


/**
 * Notion 설정 및 연결 유효성 검사
 */
export async function validateNotionConfig(): Promise<boolean> {
  console.log("🔄 Notion 설정 유효성 검사 시작...");
  if (!process.env.NOTION_TOKEN) {
    console.error("🔴 환경 변수 NOTION_TOKEN이 설정되지 않았습니다.");
    return false;
  }
  if (!databaseId) {
    console.error("🔴 환경 변수 NOTION_DATABASE_ID가 설정되지 않았습니다.");
    return false;
  }

  try {
    // 데이터베이스 정보 가져오기 시도
    console.log(`📡 데이터베이스 정보 조회 시도 (ID: ${databaseId.substring(0, 8)}...)`);
    const dbInfo = await notion.databases.retrieve({ database_id: databaseId });
    console.log(`✅ 데이터베이스 연결 성공: "${(dbInfo as any).title?.[0]?.plain_text ?? '제목 없음'}"`);

    // 페이지 하나 가져오기 시도 (존재하는 경우)
    console.log("📡 샘플 페이지 조회 시도...");
    const response = await notion.databases.query({
      database_id: databaseId,
      page_size: 1,
    });
    if (response.results.length > 0) {
      console.log(`✅ 샘플 페이지 조회 성공 (ID: ${response.results[0].id.substring(0, 8)}...)`);
    } else {
      console.warn("⚠️ 데이터베이스에 페이지가 없습니다. 연결은 확인되었지만 테스트는 제한적입니다.");
    }

    console.log("✅ Notion 설정 유효성 검사 통과");
    return true;
  } catch (error) {
    console.error("🔴 Notion 연결 또는 데이터베이스 접근 중 오류 발생:", error);
    return false;
  }
}

/**
 * Notion 연결 테스트 함수 (validateNotionConfig 사용)
 */
async function testNotionConnection() {
  console.log("\\n--- Notion 연결 테스트 시작 ---");
  const isValid = await validateNotionConfig();
  if (isValid) {
    console.log("✅ Notion 연결 및 기본 설정이 유효합니다.");
  } else {
    console.error("❌ Notion 연결 또는 설정에 문제가 있습니다. 환경 변수 및 데이터베이스 ID를 확인하세요.");
  }
  console.log("--- Notion 연결 테스트 종료 ---\\n");
}

// 서버 시작 시 또는 필요 시 연결 테스트 호출
// testNotionConnection();


/**
 * ID로 특정 포스트 가져오기
 */
export async function getPostById(id: string): Promise<BlogPost | null> {
  try {
    console.log(`🔎 ID로 포스트 조회 시작: ${id}`);
    const page = await notion.pages.retrieve({ page_id: id });
    if (!page) {
        console.warn(`⚠️ ID ${id}에 해당하는 페이지를 찾을 수 없습니다.`);
        return null;
    }
    const post = pageToPost(page as PageObjectResponse);
    console.log(`✅ ID ${id} 포스트 조회 성공: "${post.title}"`);
    return post;
  } catch (error) {
    console.error(`🔴 ID ${id} 포스트 조회 오류:`, error);
    return null;
  }
}

/**
 * Slug로 특정 포스트 가져오기
 */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    console.log(`🔎 Slug로 포스트 조회 시작: "${slug}"`);
    if (!databaseId) {
        console.error("🔴 getPostBySlug: NOTION_DATABASE_ID가 설정되지 않았습니다.");
        return null;
    }
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: 'Slug', // 노션의 실제 Slug 속성 이름
        rich_text: {
          equals: slug,
        },
      },
      page_size: 1, // 슬러그는 고유해야 함
    });

    if (response.results.length === 0) {
      console.warn(`⚠️ Slug "${slug}"에 해당하는 포스트를 찾을 수 없습니다.`);
      return null;
    }

    const page = response.results[0] as PageObjectResponse;
    const post = pageToPost(page);
    console.log(`✅ Slug "${slug}" 포스트 조회 성공: "${post.title}"`);

    // 상세 컨텐츠 변환: 블록을 마크다운으로 변환
    let contentMd = '';
    try {
      const blocks = await fetchPageBlocks(page.id);
      contentMd = blocksToMarkdown(blocks as ExtendedBlockObjectResponse[]);
    } catch (err) {
      console.error(`🔌 컨텐츠 변환 오류 for page ${page.id}:`, err);
    }

    return {
      id: page.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      category: post.category,
      date: post.date,
      views: post.views,
      featured: post.featured,
      image: post.image,
      content: contentMd,
    };
  } catch (error) {
    console.error(`🔴 Slug "${slug}" 포스트 조회 오류:`, error);
    return null;
  }
}


/**
 * 모든 포스트 목록 가져오기
 */
export async function getAllPosts(): Promise<BlogPost[]> {
  try {
    console.log("🔄 모든 포스트 목록 조회 시작...");
    if (!databaseId) {
      console.error("🔴 getAllPosts: NOTION_DATABASE_ID가 설정되지 않았습니다.");
      return [];
    }

    const query: QueryDatabaseParameters = {
      database_id: databaseId,
      filter: {
        property: 'Published', // 노션의 'Published' 체크박스 속성 이름
        checkbox: {
          equals: true,
        },
      },
      sorts: [
        {
          property: 'Date', // 노션의 'Date' 날짜 속성 이름
          direction: 'descending',
        },
      ],
    };

    console.log("📡 Notion API 호출: databases.query");
    const response = await notion.databases.query(query);
    console.log(`📊 Notion API 응답: ${response.results.length}개 페이지 수신`);

    const posts: BlogPost[] = [];
    for (const page of response.results) {
        try {
            // 더 구체적인 타입 체크
            if (!page || typeof page !== 'object') {
                console.warn('⚠️ 유효하지 않은 페이지 객체 발견, 건너뜁니다.');
                continue;
            }

            if (!('properties' in page) || !page.properties) {
                console.warn(`⚠️ 페이지 속성을 찾을 수 없음 (ID: ${(page as any).id ?? 'unknown'}), 건너뜁니다.`);
                continue;
            }

            // 이제 page가 PageObjectResponse 타입임을 확신할 수 있음
            const post = pageToPost(page as PageObjectResponse);
            posts.push(post);
        } catch (error) {
            console.error('🔴 페이지 변환 중 오류 발생:', error);
            if (page && 'id' in page) {
                console.error('문제가 발생한 페이지 ID:', page.id);
            }
            // 오류가 발생해도 계속 진행
            continue;
        }
    }


    // 유효성 검사 및 필터링 (선택적)
    const validPosts = posts.filter(post => {
      let isValid = true;
      if (!post.title || post.title === 'Untitled' || post.title === '오류 발생한 게시물') {
        console.warn(`⚠️ 유효하지 않은 제목의 포스트 건너뜀: ID ${post.id}`);
        isValid = false;
      }
      if (!post.slug) {
         console.warn(`⚠️ 슬러그 없는 포스트 건너뜀: ID ${post.id}, Title "${post.title}"`);
         isValid = false;
      }
      if (!post.date) {
         console.warn(`⚠️ 날짜 없는 포스트 건너뜀: ID ${post.id}, Title "${post.title}"`);
         isValid = false;
      }
      return isValid;
    });

    console.log(`📘 전체 포스트 수: ${posts.length}, 유효한 포스트 수: ${validPosts.length}`);

    // 카테고리별 분류 로깅
    const categories: Record<string, number> = {};
    validPosts.forEach(post => {
      categories[post.category] = (categories[post.category] || 0) + 1;
    });

    console.log("📘 카테고리별 게시물 수:");
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`   - ${category}: ${count}개`);
    });

    return validPosts;
  } catch (error) {
    console.error("🔴 모든 포스트 목록 조회 오류:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.stack);
    }
    return []; // 오류 발생 시 빈 배열 반환
  }
} 