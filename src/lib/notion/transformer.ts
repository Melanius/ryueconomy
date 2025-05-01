/**
 * Notion 데이터 변환 모듈
 * Notion API에서 받은 데이터를 애플리케이션에서 사용할 형식으로 변환합니다.
 */
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { notionLog } from '../logger';
import { Post } from '@/types/post';
import { CategoryId } from '@/types/notion';

/**
 * 페이지 객체를 Post 인터페이스로 변환하는 함수
 */
export function pageToPost(page: PageObjectResponse): Post {
  try {
    notionLog.info(`📄 페이지 변환 시작: ID ${page.id.substring(0, 8)}...`);
    
    // 페이지 속성을 콘솔에 출력 (디버깅)
    notionLog.info(`📄 페이지 속성 목록:`, Object.keys(page.properties).map(key => ({
      key,
      type: (page.properties as any)[key].type
    })));
    
    // 여기서 Notion 페이지의 프로퍼티를 확인하여 필요한 데이터를 추출
    const titleProperty = page.properties.title || page.properties.Title || page.properties.Name;
    let title = 'Untitled';
    
    if (titleProperty?.type === 'title' && titleProperty.title.length > 0) {
      title = titleProperty.title.map(t => t.plain_text).join("").trim();
      // 제목이 빈 문자열인 경우 기본값 사용
      if (title === '') {
        title = `Untitled-${page.id.substring(0, 6)}`;
        notionLog.info(`📄 빈 제목 발견: 기본값으로 대체 "${title}"`);
      }
    } else {
      title = `Untitled-${page.id.substring(0, 6)}`;
      notionLog.info(`📄 제목 속성 없음: 기본값 사용 "${title}"`);
    }
    
    const slugProperty = page.properties.slug || page.properties.Slug;
    let slug = '';
    
    if (slugProperty?.type === 'rich_text' && slugProperty.rich_text.length > 0) {
      slug = slugProperty.rich_text.map(t => t.plain_text).join("").trim();
    }
    
    // 슬러그가 없거나 빈 문자열인 경우 제목에서 생성
    if (!slug) {
      slug = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // 특수문자 제거
        .replace(/\s+/g, '-')     // 공백을 하이픈으로 변경
        .replace(/-+/g, '-');     // 중복 하이픈 제거
      
      // 슬러그가 여전히 비어있다면 ID 사용
      if (!slug || slug === '-') {
        slug = `post-${page.id.substring(0, 8)}`;
      }
      
      notionLog.info(`📄 슬러그 자동 생성: "${title}" → "${slug}"`);
    }
    
    const excerptProperty = page.properties.excerpt || page.properties.Excerpt;
    const excerpt = excerptProperty?.type === 'rich_text' && excerptProperty.rich_text.length > 0
      ? excerptProperty.rich_text.map(t => t.plain_text).join("") 
      : ""; // 발췌문이 없으면 빈 문자열 사용
    
    const categoryProperty = page.properties.category || page.properties.Category;
    let notionCategory = 'Uncategorized';
    
    if (categoryProperty?.type === 'select' && categoryProperty.select?.name) {
      notionCategory = categoryProperty.select.name;
    }
    
    // 노션 카테고리를 블로그 카테고리로 매핑
    const category = mapNotionCategory(notionCategory);
    
    const dateProperty = page.properties.date || page.properties.Date || page.properties.Published || page.properties['생성 일시'] || page.properties.Created;
    let date = new Date().toISOString().split('T')[0]; // 기본값은 오늘 날짜
    
    if (dateProperty?.type === 'date' && dateProperty.date?.start) {
      date = dateProperty.date.start;
    } else if (page.created_time) {
      // 날짜 속성이 없으면 생성일 사용
      date = new Date(page.created_time).toISOString().split('T')[0];
      notionLog.info(`📄 날짜 속성 없음, 생성일 사용: ${date}`);
    }
    
    // Views 속성 처리
    const viewsProperty = page.properties.views || page.properties.Views;
    notionLog.info(`📄 조회수 속성 처리:`, viewsProperty ? JSON.stringify(viewsProperty) : 'undefined');
    
    let views = 0;
    if (viewsProperty) {
      if (viewsProperty.type === 'number') {
        views = viewsProperty.number !== null ? viewsProperty.number : 0;
        notionLog.info(`📄 조회수 추출 성공: ${views}`);
      } else {
        notionLog.info(`📄 조회수 속성이 number 타입이 아님: ${viewsProperty.type}`);
      }
    } else {
      notionLog.info(`📄 조회수 속성을 찾을 수 없음`);
    }
    
    const featuredProperty = page.properties.featured || page.properties.Featured;
    const featured = featuredProperty?.type === 'checkbox' 
      ? featuredProperty.checkbox || false 
      : false;
    
    // 썸네일 이미지 URL 체크 (노션 페이지 커버 이미지가 있는 경우)
    let image = '';
    
    // 페이지 커버 이미지가 있는 경우
    if (page.cover) {
      if (page.cover.type === 'external') {
        image = page.cover.external.url;
      } else if (page.cover.type === 'file') {
        image = page.cover.file.url;
      }
    }
    
    // 이미지 속성이 직접 있는 경우
    const imageProperty = page.properties.image || page.properties.Image || page.properties.Cover || page.properties.Thumbnail;
    if (!image && imageProperty?.type === 'url') {
      image = imageProperty.url || '';
    } else if (!image && imageProperty?.type === 'files' && imageProperty.files.length > 0) {
      const file = imageProperty.files[0];
      if (file.type === 'external') {
        image = file.external.url;
      } else if (file.type === 'file') {
        image = file.file.url;
      }
    }
    
    notionLog.info(`📄 포스트 변환 완료: "${title}" (${category}), 조회수: ${views}, 이미지: ${image ? '있음' : '없음'}`);
    
    return {
      id: page.id,
      title,
      slug,
      excerpt,
      category,
      date,
      views,
      featured,
      image, // 썸네일 이미지 URL 추가
      content: "", // 컨텐츠는 별도로 가져와야 함
      author: { name: "Ryue" }, // 기본 작성자 정보 설정
      tags: [], // 기본 빈 태그 배열 설정
    };
  } catch (error) {
    notionLog.error("Error converting page to post:", error);
    notionLog.error("Problem page ID:", page.id);
    
    // 오류가 발생해도 기본 포스트 객체 반환
    return {
      id: page.id,
      title: "오류 발생한 게시물",
      slug: page.id,
      excerpt: "이 게시물을 변환하는 중 오류가 발생했습니다.",
      category: "daily-log" as CategoryId,
      date: new Date().toISOString().split('T')[0],
      views: 0,
      featured: false,
      content: "",
      author: { name: "Ryue" }, // 기본 작성자 정보 설정
      tags: [], // 기본 빈 태그 배열 설정
      image: "", // 이미지 속성 추가
    };
  }
}

/**
 * 노션 카테고리를 블로그 카테고리 형식으로 변환
 */
function mapNotionCategory(notionCategory: string): CategoryId {
  notionLog.info(`Mapping Notion category: ${notionCategory}`);
  
  switch (notionCategory.toLowerCase()) {
    case 'portfolio':
    case 'project':
    case 'work':
    case 'showcase':
    case 'real-portfolio':
      return 'real-portfolio';
      
    case 'code-lab':
    case 'tutorial':
    case 'guide':
    case 'how-to':
    case 'development':
      return 'code-lab';
      
    case 'daily':
    case 'daily-log':
    case 'log':
    case 'diary':
    case 'journal':
      return 'daily-log';
      
    case 'crypto':
    case 'crypto-morning':
    case 'cryptocurrency':
    case 'market':
    case 'trading':
      return 'crypto-morning';
      
    default:
      notionLog.info(`No direct mapping found for category: ${notionCategory}, using default`);
      return 'invest-insight';
  }
}
