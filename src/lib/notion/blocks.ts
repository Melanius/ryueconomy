/**
 * 노션 블록 렌더링 로직 - 새로 구현된 버전
 * 
 * 단순하고 유지보수하기 쉬운 구조로 구현
 * - 블록 타입별 렌더링 함수 분리
 * - 재귀 호출 구조 단순화
 * - 명확한 오류 처리 및 로깅
 * - 들여쓰기 관련 문제 해결
 */

import {
  BlockObjectResponse,
  PartialBlockObjectResponse,
  RichTextItemResponse
} from '@notionhq/client/build/src/api-endpoints';
import { notion } from './client';
import { notionLogger, notionLog } from '@/lib/logger';

// 환경 설정
const isProd = process.env.NODE_ENV === 'production';

// HTML 블록을 위한 확장 타입 정의
interface HtmlBlockObjectResponse {
  id: string;
  type: 'html';
  html: {
    rich_text: RichTextItemResponse[];
  };
  created_time: string;
  last_edited_time: string;
  has_children: boolean;
  archived: boolean;
}

// 확장된 블록 타입
export type ExtendedBlockObjectResponse = BlockObjectResponse | HtmlBlockObjectResponse;

/**
 * 특정 블록의 하위 블록들을 가져오는 함수
 */
export async function getBlocks(blockId: string): Promise<BlockObjectResponse[]> {
  try {
    // 프로덕션 환경 또는 개발 환경의 디버그 레벨 로깅 최소화
    if (!isProd) {
      notionLog.debug(`🔍 블록 ${blockId}의 하위 블록 가져오기 시작`);
    }
    
    const blocks: BlockObjectResponse[] = [];
    let startCursor: string | undefined = undefined;
    let hasMore = true;
    
    // 페이지네이션을 처리하면서 모든 하위 블록 가져오기
    while (hasMore) {
      const response = await notion.blocks.children.list({
        block_id: blockId,
        start_cursor: startCursor,
        page_size: 100,
      });
      
      // 유효한 블록만 필터링
      const validBlocks = response.results.filter(
        (block): block is BlockObjectResponse => 'type' in block
      );
      
      blocks.push(...validBlocks);
      
      hasMore = response.has_more;
      startCursor = response.next_cursor ?? undefined;
    }
    
    if (!isProd) {
      notionLog.debug(`✅ 블록 ${blockId}의 하위 블록 ${blocks.length}개 가져오기 완료`);
    }
    return blocks;
  } catch (error) {
    notionLog.error(`❌ 블록 ${blockId} 하위 블록 가져오기 오류:`, error);
    return [];
  }
}

/**
 * 페이지의 모든 블록을 재귀적으로 가져오는 함수
 */
export async function getPageBlocks(pageId: string, maxDepth = 3): Promise<BlockObjectResponse[]> {
  if (!isProd) {
    notionLog.debug(`📄 페이지 ${pageId}의 블록 가져오기 시작 (최대 깊이: ${maxDepth})`);
  }
  
  try {
    // 최상위 블록 가져오기
    const blocks = await getBlocks(pageId);
    
    // 각 블록에 대해 재귀적으로 하위 블록 가져오기
    const populatedBlocks = await populateChildBlocks(blocks, 1, maxDepth);
    
    if (!isProd) {
      notionLog.debug(`📄 페이지 ${pageId}의 블록 가져오기 완료: 총 ${countBlocks(populatedBlocks)}개`);
    }
    return populatedBlocks;
  } catch (error) {
    notionLog.error(`❌ 페이지 ${pageId}의 블록 가져오기 오류:`, error);
    return [];
  }
}

/**
 * 블록의 하위 블록을 재귀적으로 가져오는 함수
 */
async function populateChildBlocks(
  blocks: BlockObjectResponse[],
  currentDepth: number,
  maxDepth: number
): Promise<BlockObjectResponse[]> {
  if (currentDepth > maxDepth) {
    return blocks;
  }
  
  const result: BlockObjectResponse[] = [];
  
  for (const block of blocks) {
    // 블록에 children 속성 추가
    const blockWithChildren = block as BlockObjectResponse & { children?: BlockObjectResponse[] };
    
    // 하위 블록이 있는 경우 가져오기
    if (block.has_children) {
      try {
        const childBlocks = await getBlocks(block.id);
        const populatedChildBlocks = await populateChildBlocks(
          childBlocks,
          currentDepth + 1,
          maxDepth
        );
        
        blockWithChildren.children = populatedChildBlocks;
      } catch (error) {
        notionLog.error(`❌ 블록 ${block.id} 하위 블록 가져오기 오류:`, error);
        blockWithChildren.children = [];
      }
    } else {
      blockWithChildren.children = [];
    }
    
    result.push(blockWithChildren);
  }
  
  return result;
}

/**
 * 블록 트리의 총 블록 수를 계산하는 함수
 */
function countBlocks(blocks: (BlockObjectResponse & { children?: BlockObjectResponse[] })[]): number {
  return blocks.reduce((count, block) => {
    const childCount = block.children?.length 
      ? countBlocks(block.children as (BlockObjectResponse & { children?: BlockObjectResponse[] })[])
      : 0;
    return count + 1 + childCount;
  }, 0);
}

/**
 * 첫 번째 이미지 URL을 찾는 함수
 */
export function findFirstImage(blocks: (BlockObjectResponse & { children?: BlockObjectResponse[] })[]): string {
  for (const block of blocks) {
    if (block.type === 'image') {
      const image = (block as any).image;
      if (image?.file?.url) {
        return image.file.url;
      } else if (image?.external?.url) {
        return image.external.url;
      }
    }
    
    // 하위 블록 검색
    if (block.children?.length) {
      const imageUrl = findFirstImage(block.children as (BlockObjectResponse & { children?: BlockObjectResponse[] })[]);
      if (imageUrl) {
        return imageUrl;
      }
    }
  }
  
  return '';
}

/**
 * 페이지 컨텐츠 및 썸네일 가져오기
 */
export async function getPageContentAndThumbnail(pageId: string): Promise<{ content: string, thumbnail: string, image: string }> {
  notionLog.info(`🔍 페이지 ${pageId}의 컨텐츠 및 썸네일 가져오기 시작`);
  const startTime = Date.now();
  
  try {
    // 모든 블록 가져오기
    const blocks = await getPageBlocks(pageId);
    
    if (!blocks || blocks.length === 0) {
      notionLog.warn(`⚠️ 페이지 ${pageId}에서 블록을 찾을 수 없습니다.`);
      return { content: '<p>컨텐츠를 불러올 수 없습니다.</p>', thumbnail: '', image: '' };
    }
    
    // 첫 번째 이미지 찾기
    let image = findFirstImage(blocks as (BlockObjectResponse & { children?: BlockObjectResponse[] })[]);
    let thumbnail = image;
    
    // 커버 이미지가 있으면 우선 사용
    try {
      const page = await notion.pages.retrieve({ page_id: pageId });
      if (page && 'cover' in page && page.cover) {
        if ('external' in page.cover && page.cover.external?.url) {
          thumbnail = page.cover.external.url;
        } else if ('file' in page.cover && page.cover.file?.url) {
          thumbnail = page.cover.file.url;
        }
        notionLog.info(`🖼️ 페이지 커버 이미지를 썸네일로 사용: ${thumbnail.substring(0, 50)}...`);
      } else {
        notionLog.info(`🖼️ 페이지 커버 이미지가 없거나 유효하지 않음. 본문 첫 이미지를 썸네일로 사용.`);
      }
    } catch (error) {
      notionLog.error(`❌ 페이지 ${pageId} 커버 이미지 가져오기 오류:`, error);
    }
    
    // 블록을 HTML로 변환
    notionLog.info(`🔄 블록을 HTML로 변환 시작: ${blocks.length}개 최상위 블록`);
    let content = renderBlocksToHtmlWithListHandling(blocks as (BlockObjectResponse & { children?: BlockObjectResponse[] })[]);

    // 최종 가공: 모든 독립적인 figure 태그 제거
    // 1. 닫는 태그가 독립적으로 나타나는 경우 (닫는 태그만 있고 여는 태그 없음)
    content = removeOrphanedClosingTags(content, 'figure');

    // 2. 불필요한 figure 태그 텍스트 제거 (이스케이프된 텍스트 형태)
    content = content.replace(/&lt;\/figure&gt;/g, '');
    content = content.replace(/&lt;figure&gt;/g, '');
    content = content.replace(/<\/figure>/g, ''); // 텍스트로 존재하는 닫는 태그 제거
    content = content.replace(/([^<]|^)\/figure>/g, '$1'); // '/'로 시작하는 변형된 형태 제거

    // 3. 추가 처리: 텍스트로 된 HTML 태그를 실제 HTML로 변환
    // HTML 문법이 추정되는 패턴 감지 및 처리
    if (content.includes('&lt;figure') || content.includes('&lt;img')) {
      // 개발 환경에서만 디버그 레벨 로깅
      if (!isProd) {
        notionLogger.debug('📌 HTML 태그가 텍스트로 감지됨, 실제 HTML로 변환 시도');
      }
      
      // HTML 엔티티 디코딩
      content = content
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'")
        .replace(/&#x2F;/g, "/")
        .replace(/&#39;/g, "'");
        
      // 개발 환경에서만 디버그 레벨 로깅
      if (!isProd) {
        notionLogger.debug('✅ HTML 엔티티 디코딩 완료');
      }
    }

    const endTime = Date.now();
    const totalTime = (endTime - startTime) / 1000;
    
    notionLog.info(`⏱️ 총 소요 시간: ${totalTime.toFixed(2)}초`);
    notionLog.info(`📊 생성된 HTML 길이: ${content.length} 글자`);
    
    return { content, thumbnail, image };
  } catch (error) {
    notionLog.error(`❌ 페이지 ${pageId} 컨텐츠 변환 오류:`, error);
    return {
      content: `<p class="text-red-500">오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}</p>`,
      thumbnail: '',
      image: ''
    };
  }
}

/**
 * 블록을 HTML로 변환하는 메인 함수
 */
export function renderBlocksToHtml(blocks: (BlockObjectResponse & { children?: BlockObjectResponse[] })[]): string {
  const html = blocks.map(block => renderBlock(block as ExtendedBlockObjectResponse & { children?: ExtendedBlockObjectResponse[] })).join('');
  return html;
}

/**
 * 리치 텍스트 항목들을 HTML로 변환
 */
function renderRichText(richTextItems: any[] = [], applyFormatting: boolean = true): string {
  if (!richTextItems || richTextItems.length === 0) {
    return '';
  }
  
  // 로그 추가: 텍스트 항목 수 및 첫 번째 항목 확인
  notionLog.info(`[renderRichText] ${richTextItems.length}개 텍스트 항목 처리 시작...`);
  
  return richTextItems.map(text => {
    if (!text) return '';
    
    // 텍스트 콘텐츠 가져오기 (plain_text 또는 text.content)
    const content = text.plain_text || (text.text && text.text.content) || '';
    if (!content) return '';
    
    // 이모지나 특수 문자를 그대로 유지하는지 확인
    notionLog.info(`[renderRichText] 텍스트 콘텐츠: ${content.substring(0, 50) + (content.length > 50 ? '...' : '')}`);
    
    // HTML 특수 문자 이스케이프 (이모지는 보존)
    let formattedText = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    
    // 스타일 적용이 요청된 경우에만 포맷팅
    if (applyFormatting && text.annotations) {
      if (text.annotations.bold) {
        formattedText = `<strong>${formattedText}</strong>`;
      }
      if (text.annotations.italic) {
        formattedText = `<em>${formattedText}</em>`;
      }
      if (text.annotations.strikethrough) {
        formattedText = `<del>${formattedText}</del>`;
      }
      if (text.annotations.underline) {
        formattedText = `<u>${formattedText}</u>`;
      }
      if (text.annotations.code) {
        formattedText = `<code>${formattedText}</code>`;
      }
      
      // 색상 처리 (있는 경우)
      if (text.annotations.color && text.annotations.color !== 'default') {
        formattedText = `<span class="notion-${text.annotations.color}">${formattedText}</span>`;
      }
    }
    
    // 링크 처리 (포맷팅 여부와 상관없이 링크는 항상 처리)
    if (applyFormatting && text.href) {
      formattedText = `<a href="${text.href}" target="_blank" rel="noopener noreferrer">${formattedText}</a>`;
    }
    
    return formattedText;
  }).join('');
}

/**
 * HTML 특수 문자 이스케이프
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * HTML 내용을 안전하게 정제하는 함수
 * - 잘못된 HTML 태그 구조 수정
 * - 독립적인 닫는 태그 제거
 * - 불균형한 태그 처리
 */
function sanitizeHtml(html: string): string {
  // 로그 기록
  notionLog.info('[sanitizeHtml] 원본 HTML 처리 시작: ' + html.substring(0, 100) + (html.length > 100 ? '...' : ''));
  
  // 0. 텍스트로 작성된 HTML 태그 처리 (예: &lt;figure&gt;)
  let sanitized = html.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  
  // 1. 독립적인 닫는 태그 제거 (</tag>)
  sanitized = sanitized.replace(/<\/[a-zA-Z][a-zA-Z0-9]*\s*>/g, (match) => {
    notionLog.info(`[sanitizeHtml] 독립 닫는 태그 제거: ${match}`);
    return '';
  });
  
  // 2. 빈 태그 정리 (<tag></tag> -> <tag />)
  sanitized = sanitized.replace(/<([a-zA-Z][a-zA-Z0-9]*)[^>]*><\/\1\s*>/g, '<$1 />');
  
  // 3. 특수한 경우: figure와 관련된 문제 특별 처리
  if (sanitized.includes('</figure>') && !sanitized.includes('<figure')) {
    notionLog.info('[sanitizeHtml] 불균형 figure 태그 발견: 닫는 태그 제거');
    sanitized = sanitized.replace(/<\/figure\s*>/g, '');
  }
  
  // 4. XSS 방지: script 태그 제거
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // 5. 태그 균형 검사 및 복구
  sanitized = balanceHtmlTags(sanitized);
  
  // 6. 텍스트로 남아있는 HTML 태그 처리
  sanitized = handlePlainTextTags(sanitized);
  
  // 처리 결과 로그
  notionLog.info('[sanitizeHtml] 정제된 HTML: ' + sanitized.substring(0, 100) + (sanitized.length > 100 ? '...' : ''));
  
  return sanitized;
}

/**
 * 텍스트 내 HTML 태그처럼 보이는 내용 처리
 * - 이미 파싱된 태그가 아닌 경우에만 변환
 */
function handlePlainTextTags(html: string): string {
  // HTML 파서를 시뮬레이션하여 텍스트 영역 식별
  const parts: {isTag: boolean, content: string}[] = [];
  let insideTag = false;
  let current = '';
  
  for (let i = 0; i < html.length; i++) {
    const char = html[i];
    
    if (char === '<') {
      // 태그 시작
      if (current) {
        parts.push({isTag: insideTag, content: current});
        current = '';
      }
      insideTag = true;
      current += char;
    } else if (char === '>' && insideTag) {
      // 태그 종료
      current += char;
      parts.push({isTag: true, content: current});
      current = '';
      insideTag = false;
    } else {
      current += char;
    }
  }
  
  if (current) {
    parts.push({isTag: insideTag, content: current});
  }
  
  // 텍스트 부분에서만 < > 문자 이스케이프
  return parts.map(part => {
    if (!part.isTag) {
      // </figure> 텍스트가 포함된 경우 특별 처리
      if (part.content.includes('</figure>')) {
        notionLog.info('[handlePlainTextTags] 텍스트 내 닫는 figure 태그 발견, 제거');
        return part.content.replace(/\<\/figure\>/g, '');
      }
      
      // 일반 텍스트 내 < > 문자 이스케이프
      return part.content
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }
    return part.content;
  }).join('');
}

/**
 * HTML 태그 균형을 맞추는 함수
 * - 열리는 태그와 닫히는 태그의 균형 확인
 * - 불균형한 태그 제거 또는 추가
 */
function balanceHtmlTags(html: string): string {
  notionLog.info('[balanceHtmlTags] 태그 균형 검사 시작');
  
  // 허용할 태그 목록 (자체 닫기 태그 제외)
  const allowedTags = [
    'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
    'table', 'tr', 'td', 'th', 'thead', 'tbody',
    'a', 'strong', 'em', 'b', 'i', 'u', 'strike', 'del',
    'figure', 'figcaption', 'img', 'iframe', 'video', 'audio'
  ];
  
  // 자체 닫는 태그 (닫는 태그가 필요없는 태그)
  const selfClosingTags = ['img', 'br', 'hr', 'input', 'meta', 'link'];
  
  // 태그 스택 (열린 태그를 추적)
  const tagStack: string[] = [];
  
  // 정규식으로 모든 태그 찾기
  const tagPattern = /<\/?([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g;
  
  // 태그 균형 분석
  let match;
  let processedHtml = html;
  let imbalancedTags: {tag: string, isOpening: boolean}[] = [];
  
  while ((match = tagPattern.exec(html)) !== null) {
    const fullTag = match[0];
    const tagName = match[1].toLowerCase();
    const isClosingTag = fullTag.startsWith('</');
    const isSelfClosing = selfClosingTags.includes(tagName) || fullTag.endsWith('/>');
    
    // 무시할 태그라면 건너뛰기
    if (!allowedTags.includes(tagName) && !selfClosingTags.includes(tagName)) {
      continue;
    }
    
    if (!isClosingTag && !isSelfClosing) {
      // 여는 태그 스택에 추가
      tagStack.push(tagName);
    } else if (isClosingTag) {
      // 닫는 태그 처리
      if (tagStack.length === 0) {
        // 닫는 태그인데 스택이 비어있으면 불균형 (제거 대상)
        imbalancedTags.push({tag: tagName, isOpening: false});
        notionLog.info(`[balanceHtmlTags] 불균형 닫는 태그 발견: ${fullTag}`);
      } else if (tagStack[tagStack.length - 1] !== tagName) {
        // 마지막 여는 태그와 일치하지 않는 닫는 태그 (불균형)
        imbalancedTags.push({tag: tagName, isOpening: false});
        notionLog.info(`[balanceHtmlTags] 일치하지 않는 닫는 태그: ${fullTag}, 예상: ${tagStack[tagStack.length - 1]}`);
      } else {
        // 정상적인 닫는 태그
        tagStack.pop();
      }
    }
  }
  
  // 닫히지 않은 태그 처리
  for (let i = tagStack.length - 1; i >= 0; i--) {
    const unclosedTag = tagStack[i];
    imbalancedTags.push({tag: unclosedTag, isOpening: true});
    notionLog.info(`[balanceHtmlTags] 닫히지 않은 태그 발견: ${unclosedTag}`);
  }
  
  // 불균형 태그 처리
  if (imbalancedTags.length > 0) {
    notionLog.info(`[balanceHtmlTags] ${imbalancedTags.length}개의 불균형 태그 발견, 처리 중...`);
    
    // 독립적인 닫는 태그 제거 (열리지 않은 태그)
    imbalancedTags.filter(item => !item.isOpening).forEach(item => {
      const closingTagPattern = new RegExp(`</${item.tag}[^>]*>`, 'g');
      processedHtml = processedHtml.replace(closingTagPattern, '');
      notionLog.info(`[balanceHtmlTags] 불균형 닫는 태그 제거: ${item.tag}`);
    });
    
    // 특별 처리: 특정 태그에 대해서만 닫는 태그 추가 (필요한 경우)
    const importantTags = ['div', 'figure', 'table', 'ul', 'ol'];
    imbalancedTags.filter(item => item.isOpening && importantTags.includes(item.tag)).forEach(item => {
      processedHtml += `</${item.tag}>`;
      notionLog.info(`[balanceHtmlTags] 닫는 태그 추가: ${item.tag}`);
    });
  }
  
  return processedHtml;
}

/**
 * YouTube URL에서 비디오 ID를 추출하는 함수
 */
function getYoutubeVideoId(url: string): string | null {
  notionLog.info(`[getYoutubeVideoId] YouTube URL 분석: ${url}`);
  
  if (!url) return null;
  
  // 다양한 YouTube URL 패턴 처리
  // 1. youtube.com/watch?v=VIDEO_ID
  // 2. youtu.be/VIDEO_ID
  // 3. youtube.com/embed/VIDEO_ID
  // 4. youtube.com/v/VIDEO_ID
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/, // 다른 파라미터와 함께 있는 경우
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      notionLog.info(`[getYoutubeVideoId] 비디오 ID 추출 성공: ${match[1]}`);
      return match[1];
    }
  }
  
  notionLog.info(`[getYoutubeVideoId] 비디오 ID를 찾을 수 없음: ${url}`);
  return null;
}

/**
 * Vimeo URL에서 비디오 ID를 추출하는 함수
 */
function getVimeoVideoId(url: string): string | null {
  notionLog.info(`[getVimeoVideoId] Vimeo URL 분석: ${url}`);
  
  if (!url) return null;
  
  // 다양한 Vimeo URL 패턴 처리
  // 1. vimeo.com/VIDEO_ID
  // 2. player.vimeo.com/video/VIDEO_ID
  
  const patterns = [
    /vimeo\.com\/([0-9]+)/,
    /player\.vimeo\.com\/video\/([0-9]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      notionLog.info(`[getVimeoVideoId] 비디오 ID 추출 성공: ${match[1]}`);
      return match[1];
    }
  }
  
  notionLog.info(`[getVimeoVideoId] 비디오 ID를 찾을 수 없음: ${url}`);
  return null;
}

/**
 * 개별 블록을 HTML로 렌더링하는 함수
 * 노션 블록 구조를 분석하여 HTML 구조로 변환합니다
 */
function renderBlock(block: ExtendedBlockObjectResponse, depth = 0): string {
  notionLog.info(`[renderBlock] 블록 타입: ${block.type}, ID: ${block.id.substring(0, 8)}...`);
  const startTime = performance.now();
  
  const { type } = block;
  const value = (block as any)[type];
  
  // 들여쓰기 처리 (하위 블록인 경우)
  const indent = depth > 0 ? '  '.repeat(depth) : '';
  
  // 블록 타입별 HTML 생성
  let html = '';
  
  switch (type) {
    case 'html': {
      // HTML 블록은 직접 내용을 반환 (보안 주의: 신뢰할 수 있는 콘텐츠만 허용)
      notionLog.info(`[renderBlock] HTML 블록 처리 중...`);
      const richText = value.rich_text || [];
      const rawHtml = renderRichText(richText);
      
      if (!rawHtml.trim()) {
        notionLog.info(`[renderBlock] 비어있는 HTML 블록 발견, 빈 문단으로 처리`);
        html = `<p></p>`;
      } else {
        notionLog.info(`[renderBlock] HTML 직접 렌더링: ${rawHtml.substring(0, 50)}...`);
        html = rawHtml; // HTML 직접 반환 (신뢰할 수 있는 소스일 경우)
      }
      break;
    }
    case 'paragraph': {
      const richText = value.rich_text || [];
      const text = renderRichText(richText);
      
      // 텍스트가 없는 경우 빈 줄 처리
      if (!text.trim()) {
        html = `${indent}<p class="notion-paragraph notion-blank"></p>`;
        break;
      }
      
      // 들여쓰기 레벨에 따른 클래스 추가
      if (depth > 0) {
        html = `${indent}<p class="notion-paragraph notion-indent-${depth}">${text}</p>`;
      } else {
        html = `${indent}<p class="notion-paragraph">${text}</p>`;
      }
      break;
    }
    case 'heading_1': {
      const richText = value.rich_text || [];
      const text = renderRichText(richText);
      html = `${indent}<h1 class="notion-h1">${text}</h1>`;
      break;
    }
    case 'heading_2': {
      const richText = value.rich_text || [];
      const text = renderRichText(richText);
      html = `${indent}<h2 class="notion-h2">${text}</h2>`;
      break;
    }
    case 'heading_3': {
      const richText = value.rich_text || [];
      const text = renderRichText(richText);
      html = `${indent}<h3 class="notion-h3">${text}</h3>`;
      break;
    }
    case 'bulleted_list_item': {
      const richText = value.rich_text || [];
      const text = renderRichText(richText);
      
      // 기본 목록 아이템 HTML - 마커 클래스 추가
      html = `${indent}<li class="notion-list-item notion-bulleted-item">${text}`;
      
      // 하위 블록이 있다면 렌더링 (들여쓰기 레벨 증가)
      const children = (block as any).children;
      if (Array.isArray(children) && children.length > 0) {
        html += '\n' + `${indent}  <ul class="notion-list notion-nested-list notion-bulleted-list">\n`;
        
        for (const child of children) {
          // 중첩 목록은 한 단계 더 들여쓰기
          html += `${indent}    ${renderBlock(child, depth + 2)}\n`;
        }
        
        html += `${indent}  </ul>`;
      }
      
      html += `</li>`;
      
      break;
    }
    case 'numbered_list_item': {
      const richText = value.rich_text || [];
      const text = renderRichText(richText);
      
      // 기본 목록 아이템 HTML - 마커 클래스 추가
      html = `${indent}<li class="notion-list-item notion-numbered-item">${text}`;
      
      // 하위 블록이 있다면 렌더링 (들여쓰기 레벨 증가)
      const children = (block as any).children;
      if (Array.isArray(children) && children.length > 0) {
        html += '\n' + `${indent}  <ol class="notion-list notion-nested-list notion-numbered-list">\n`;
        
        for (const child of children) {
          // 중첩 목록은 한 단계 더 들여쓰기
          html += `${indent}    ${renderBlock(child, depth + 2)}\n`;
        }
        
        html += `${indent}  </ol>`;
      }
      
      html += `</li>`;
      
      break;
    }
    case 'code': {
      const richText = value.rich_text || [];
      const code = escapeHtml(renderRichText(richText, false)); // 코드 블록 내 HTML 이스케이프
      const language = value.language || '';
      html = `${indent}<pre class="notion-code"><code class="language-${language}">${code}</code></pre>`;
      break;
    }
    case 'image': {
      try {
        // 이미지 URL과 캡션
        const url = (value as any).file?.url || (value as any).external?.url || '';
        const caption = value.caption ? renderRichText(value.caption) : '';
        
        // URL 유효성 검사
        if (!url) {
          notionLog.error(`[renderBlock] 이미지 URL이 없습니다. 블록 ID: ${block.id}`);
          html = `${indent}<div class="notion-image-error">이미지를 찾을 수 없습니다</div>`;
          break;
        }
        
        // 캡션이 있으면 figure로 감싸기
        if (caption) {
          html = `${indent}<figure class="notion-image-figure">
${indent}  <img src="${url}" alt="${caption}" class="notion-image" loading="lazy">
${indent}  <figcaption class="notion-image-caption">${caption}</figcaption>
${indent}</figure>`;
        } else {
          html = `${indent}<img src="${url}" alt="" class="notion-image" loading="lazy">`;
        }
      } catch (error) {
        notionLog.error(`[renderBlock] 이미지 블록 렌더링 오류:`, error);
        html = `${indent}<div class="notion-image-error">이미지 로딩 오류</div>`;
      }
      break;
    }
    case 'divider': {
      html = `${indent}<hr class="notion-hr">`;
      break;
    }
    case 'quote': {
      const richText = value.rich_text || [];
      const text = renderRichText(richText);
      html = `${indent}<blockquote class="notion-quote">${text}</blockquote>`;
      break;
    }
    case 'callout': {
      const icon = value.icon?.emoji || '';
      const richText = value.rich_text || [];
      const text = renderRichText(richText);
      const color = value.color || 'default';
      
      html = `${indent}<div class="notion-callout" data-color="${color}">
${indent}  <div class="notion-callout-icon">${icon}</div>
${indent}  <div class="notion-callout-content">${text}</div>
${indent}</div>`;
      break;
    }
    case 'embed': {
      try {
        const url = value.url || '';
        // iframe 삽입 시 보안 위험 주의
        html = `${indent}<div class="notion-embed">
${indent}  <iframe src="${url}" frameborder="0" allowfullscreen class="notion-embed-iframe" loading="lazy"></iframe>
${indent}</div>`;
      } catch (error) {
        notionLog.error(`[renderBlock] 임베드 블록 렌더링 오류:`, error);
        html = `${indent}<div class="notion-embed-error">외부 콘텐츠를 불러올 수 없습니다</div>`;
      }
      break;
    }
    case 'table': {
      try {
        // 컬럼 헤더 여부
        const hasColumnHeader = value.has_column_header || false;
        
        html = `${indent}<table class="notion-table">`;
        
        // 테이블 행 처리
        const children = (block as any).children || [];
        if (Array.isArray(children) && children.length > 0) {
          children.forEach((row, rowIndex) => {
            const isHeader = hasColumnHeader && rowIndex === 0;
            const cells = row.table_row?.cells || [];
            
            html += `\n${indent}  <tr class="notion-table-row">`;
            
            cells.forEach((cell: any[]) => {
              const cellContent = cell.length > 0 ? renderRichText(cell) : '';
              if (isHeader) {
                html += `\n${indent}    <th class="notion-table-cell">${cellContent}</th>`;
              } else {
                html += `\n${indent}    <td class="notion-table-cell">${cellContent}</td>`;
              }
            });
            
            html += `\n${indent}  </tr>`;
          });
        }
        
        html += `\n${indent}</table>`;
      } catch (error) {
        notionLog.error(`[renderBlock] 테이블 블록 렌더링 오류:`, error);
        html = `${indent}<div class="notion-table-error">테이블을 렌더링할 수 없습니다</div>`;
      }
      break;
    }
    case 'to_do': {
      const checked = value.checked || false;
      const richText = value.rich_text || [];
      const text = renderRichText(richText);
      
      html = `${indent}<div class="notion-to-do">
${indent}  <input type="checkbox" ${checked ? 'checked' : ''} disabled />
${indent}  <span class="notion-to-do-text ${checked ? 'notion-to-do-checked' : ''}">${text}</span>
${indent}</div>`;
      break;
    }
    case 'toggle': {
      const richText = value.rich_text || [];
      const summary = renderRichText(richText);
      
      html = `${indent}<details class="notion-toggle">
${indent}  <summary class="notion-toggle-summary">${summary}</summary>
${indent}  <div class="notion-toggle-content">`;
      
      // 하위 블록이 있다면 재귀적으로 렌더링 (들여쓰기 레벨 증가)
      const children = (block as any).children;
      if (Array.isArray(children) && children.length > 0) {
        html += '\n';
        for (const child of children) {
          html += `${indent}    ${renderBlock(child, depth + 2)}\n`;
        }
      }
      
      html += `${indent}  </div>
${indent}</details>`;
      break;
    }
    case 'video': {
      try {
        const url = (value as any).file?.url || (value as any).external?.url || '';
        if (!url) {
          notionLogger.error(`[renderBlock] 비디오 URL이 없습니다. 블록 ID: ${block.id}`);
          html = `${indent}<div class="notion-video-error">비디오를 찾을 수 없습니다</div>`;
          break;
        }
        
        // YouTube 또는 Vimeo 임베드 처리
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
          const videoId = getYoutubeVideoId(url);
          if (videoId) {
            html = `${indent}<div class="notion-video notion-video-youtube">
${indent}  <iframe 
${indent}    width="100%" 
${indent}    height="315" 
${indent}    src="https://www.youtube.com/embed/${videoId}" 
${indent}    frameborder="0" 
${indent}    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
${indent}    allowfullscreen
${indent}    loading="lazy">
${indent}  </iframe>
${indent}</div>`;
          } else {
            html = `${indent}<div class="notion-video-error">유효하지 않은 YouTube URL</div>`;
          }
        } else if (url.includes('vimeo.com')) {
          const videoId = getVimeoVideoId(url);
          if (videoId) {
            html = `${indent}<div class="notion-video notion-video-vimeo">
${indent}  <iframe 
${indent}    src="https://player.vimeo.com/video/${videoId}" 
${indent}    width="100%" 
${indent}    height="315" 
${indent}    frameborder="0" 
${indent}    allow="autoplay; fullscreen; picture-in-picture" 
${indent}    allowfullscreen
${indent}    loading="lazy">
${indent}  </iframe>
${indent}</div>`;
          } else {
            html = `${indent}<div class="notion-video-error">유효하지 않은 Vimeo URL</div>`;
          }
        } else {
          // 일반 비디오 파일
          html = `${indent}<div class="notion-video">
${indent}  <video 
${indent}    controls 
${indent}    src="${url}" 
${indent}    class="notion-video-player"
${indent}    preload="metadata">
${indent}  </video>
${indent}</div>`;
        }
      } catch (error) {
        notionLogger.error(`[renderBlock] 비디오 블록 렌더링 오류:`, error);
        html = `${indent}<div class="notion-video-error">비디오 로딩 오류</div>`;
      }
      break;
    }
    default: {
      // 지원하지 않는 블록 타입
      try {
        notionLog.warn(`[renderBlock] 지원하지 않는 블록 타입: ${type}`, block);
        
        // rich_text가 있으면 렌더링
        const richText = (value as any)?.rich_text;
        if (Array.isArray(richText) && richText.length > 0) {
          const text = renderRichText(richText);
          html = `${indent}<div class="notion-unsupported" data-type="${type}">${text}</div>`;
        } else {
          html = `${indent}<div class="notion-unsupported" data-type="${type}"></div>`;
        }
      } catch (error) {
        notionLog.error(`[renderBlock] 알 수 없는 블록 타입 ${type} 렌더링 오류:`, error);
        html = `${indent}<div class="notion-error">지원하지 않는 블록 타입: ${type}</div>`;
      }
    }
  }
  
  const processTime = performance.now() - startTime;
  if (processTime > 10) {
    notionLog.info(`[renderBlock] 블록 처리 시간 (${block.type}): ${processTime.toFixed(2)}ms`);
  }
  
  return html;
}

/**
 * 블록 배열을 HTML로 변환하며 리스트 그룹화 처리
 */
export function renderBlocksToHtmlWithListHandling(blocks: (BlockObjectResponse & { children?: BlockObjectResponse[] })[]): string {
  let html = '';
  let currentListTag: 'ul' | 'ol' | null = null;
  let listItems = '';
  
  // 디버깅을 위한 블록 정보 로깅 - 안전하게 처리
  try {
    console.info(`[renderBlocksToHtmlWithListHandling] 총 ${blocks.length}개 블록 처리 시작`);
  } catch (error) {
    console.error('블록 처리 시작 로깅 오류:', error);
  }
  
  // 블록 데이터 순회하며, figure 관련 블록 식별
  let hasFigureIssue = false;
  const problematicBlocks: any[] = [];
  
  blocks.forEach((block, index) => {
    // 블록 내용 로깅 (첫 10개와 마지막 10개만) - 안전하게 로깅
    if (index < 10 || index >= blocks.length - 10) {
      try {
        console.info(`[Block ${index}] Type: ${block.type || 'unknown'}, ID: ${block.id || 'unknown'}`);
        
        // 의심되는 블록 확인 (이미지 블록과 HTML 블록)
        if (block.type === 'image' || 
            (block as any).type === 'html' || 
            (typeof block.type === 'string' && block.type.includes('figure'))) {
          // 의심 블록 JSON 안전하게 처리
          let blockJson = '{"블록_정보_직렬화_실패"}';
          try {
            blockJson = JSON.stringify(block).substring(0, 300);
          } catch (jsonError) {
            console.error('블록 JSON 변환 오류:', jsonError);
          }
          console.info(`[의심 블록 ${index}] 상세: ${blockJson}`);
          
          // 텍스트에 figure 관련 내용 포함 여부 확인 - 안전하게 접근
          let hasFigureContent = false;
          try {
            if ((block as any).type === 'html' && 
                (block as any).html?.rich_text?.some((text: any) => 
                  text.plain_text?.includes('figure') || 
                  text.plain_text?.includes('</figure>')
                )) {
              hasFigureContent = true;
            }
          } catch (textError) {
            console.error('텍스트 검색 오류:', textError);
          }
          
          if (hasFigureContent) {
            hasFigureIssue = true;
            try {
              problematicBlocks.push({index, blockId: block.id});
            } catch (arrayError) {
              console.error('문제 블록 추가 오류:', arrayError);
            }
            console.info(`[문제 발견] 블록 ${index}에 figure 관련 HTML 텍스트 포함`);
          }
        }
      } catch (blockError) {
        console.error(`블록 ${index} 처리 중 오류:`, blockError);
      }
    }
    
    const blockType = block.type;
    const isListItem = blockType === 'bulleted_list_item' || blockType === 'numbered_list_item';
    const listType = blockType === 'bulleted_list_item' ? 'ul' : 'ol';
    
    if (isListItem) {
      // 리스트 아이템의 경우
      if (currentListTag !== listType) {
        // 이전 리스트가 있으면 닫기
        if (currentListTag) {
          html += `</${currentListTag}>\n`;
        }
        
        // 새 리스트 시작 - 클래스 개선
        const listClass = listType === 'ul' ? 'notion-list notion-bulleted-list' : 'notion-list notion-numbered-list';
        html += `<${listType} class="${listClass}">\n`;
        currentListTag = listType;
      }
      
      // 리스트 아이템 추가
      listItems += renderBlock(block as ExtendedBlockObjectResponse & { children?: ExtendedBlockObjectResponse[] });
    } else {
      // 리스트 아이템이 아닌 경우
      if (currentListTag) {
        // 진행 중인 리스트가 있으면 리스트 아이템 추가 후 리스트 닫기
        html += listItems + `</${currentListTag}>\n`;
        currentListTag = null;
        listItems = '';
      }
      
      // 일반 블록 추가
      const renderedBlock = renderBlock(block as ExtendedBlockObjectResponse & { children?: ExtendedBlockObjectResponse[] });
      
      // </figure> 텍스트 직접 제거 (최후의 수단)
      if (renderedBlock.includes('</figure>') && !renderedBlock.includes('<figure')) {
        notionLog.info(`[교정 적용] 블록 ${index}에서 독립적인 </figure> 태그 제거`);
        html += renderedBlock.replace(/<\/figure>/g, '');
      } else {
        html += renderedBlock;
      }
      
      // 각 블록 사이에 줄바꿈 추가
      html += '\n';
    }
  });
  
  // 마지막 리스트 닫기
  if (currentListTag) {
    html += listItems + `</${currentListTag}>\n`;
  }
  
  // 문제 발견 시 요약 로깅 - 안전하게 처리
  if (hasFigureIssue) {
    try {
      // 문제가 있는 블록 ID 목록 안전하게 추출
      let problemIdsText = '알 수 없음';
      try {
        const problemIds = problematicBlocks.map(p => p.blockId || 'unknown').filter(Boolean);
        problemIdsText = problemIds.join(', ');
      } catch (mapError) {
        console.error('문제 ID 맵핑 오류:', mapError);
      }
      
      console.info(`[figure 문제 감지] ${problematicBlocks.length}개 블록에서 문제 발견. 문제 ID: ${problemIdsText}`);
    } catch (summaryError) {
      console.error('figure 문제 요약 로깅 오류:', summaryError);
    }
  }
  
  // 최종 결과에서 독립적인 </figure> 태그 한 번 더 제거 (비상 처리)
  let cleanedHtml = html;
  try {
    cleanedHtml = html.replace(/<\/figure>\s*(?!<)/g, '');
    console.info('독립적인 figure 태그 제거 완료');
  } catch (cleanError) {
    console.error('HTML 정리 중 오류:', cleanError);
    // 오류 발생 시 원본 HTML 그대로 반환
  }
  
  return cleanedHtml;
}

/**
 * HTML 문자열에서 고아 태그(여는 태그 없이 닫는 태그만 있는) 제거
 */
function removeOrphanedClosingTags(html: string, tagName: string): string {
  notionLog.info(`🔍 '${tagName}' 고아 태그 제거 시작`);
  
  // 태그 카운트를 위한 정규식 패턴
  const openTagPattern = new RegExp(`<${tagName}[^>]*>`, 'g');
  const closeTagPattern = new RegExp(`</${tagName}\\s*>`, 'g');
  
  // 여는 태그와 닫는 태그 카운트
  const openMatches = html.match(openTagPattern) || [];
  const closeMatches = html.match(closeTagPattern) || [];
  
  const openCount = openMatches.length;
  const closeCount = closeMatches.length;
  
  notionLog.info(`📊 태그 균형: ${openCount}개 여는 태그, ${closeCount}개 닫는 태그`);
  
  if (closeCount > openCount) {
    notionLog.info(`⚠️ ${closeCount - openCount}개의 고아 닫는 태그 발견, 제거 중...`);
    
    // 모든 닫는 태그를 찾아서 균형 맞추기
    let processedHtml = html;
    let currentOpenCount = openCount;
    
    // 닫는 태그를 찾을 때마다 처리
    let match;
    let tempHtml = processedHtml;
    const foundIndices: number[] = [];
    
    while ((match = closeTagPattern.exec(tempHtml)) !== null) {
      if (currentOpenCount <= 0) {
        // 고아 태그 발견
        foundIndices.push(match.index);
      } else {
        // 정상적인 닫는 태그
        currentOpenCount--;
      }
    }
    
    // 고아 태그 제거 (뒤에서부터 제거해서 인덱스 변화 최소화)
    for (let i = foundIndices.length - 1; i >= 0; i--) {
      const index = foundIndices[i];
      processedHtml = processedHtml.substring(0, index) + 
                     processedHtml.substring(index + `</${tagName}>`.length);
    }
    
    notionLog.info(`✅ ${foundIndices.length}개의 고아 태그 제거 완료`);
    return processedHtml;
  }
  
  // 균형이 맞는 경우 원래 HTML 반환
  return html;
}