/**
 * 노션 블록 처리 모듈
 * 
 * 이 모듈은 노션 API에서 블록을 가져오고, HTML로 변환하는 기능을 제공합니다.
 * 리팩토링된 코드로 기존 구현을 점진적으로 대체합니다.
 */
import { notion } from '../client';
import { BlockObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { BlockRenderer, RichTextRenderer } from '../renderers';
import { ExtendedBlockObjectResponse, ListType } from '../types';
import { removeOrphanedClosingTags } from '../utils/sanitizer';

/**
 * 특정 블록의 하위 블록들을 가져오는 함수
 */
export async function getBlocks(blockId: string): Promise<BlockObjectResponse[]> {
  try {
    console.log(`🔍 블록 ${blockId}의 하위 블록 가져오기 시작`);
    
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
    
    console.log(`✅ 블록 ${blockId}의 하위 블록 ${blocks.length}개 가져오기 완료`);
    return blocks;
  } catch (error) {
    console.error(`❌ 블록 ${blockId} 하위 블록 가져오기 오류:`, error);
    return [];
  }
}

/**
 * 페이지의 모든 블록을 재귀적으로 가져오는 함수
 */
export async function getPageBlocks(pageId: string, maxDepth = 3): Promise<BlockObjectResponse[]> {
  console.log(`📄 페이지 ${pageId}의 블록 가져오기 시작 (최대 깊이: ${maxDepth})`);
  
  try {
    // 최상위 블록 가져오기
    const blocks = await getBlocks(pageId);
    
    // 각 블록에 대해 재귀적으로 하위 블록 가져오기
    const populatedBlocks = await populateChildBlocks(blocks, 1, maxDepth);
    
    console.log(`📄 페이지 ${pageId}의 블록 가져오기 완료: 총 ${countBlocks(populatedBlocks)}개`);
    return populatedBlocks;
  } catch (error) {
    console.error(`❌ 페이지 ${pageId}의 블록 가져오기 오류:`, error);
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
        console.error(`❌ 블록 ${block.id} 하위 블록 가져오기 오류:`, error);
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
  console.log(`🔍 페이지 ${pageId}의 컨텐츠 및 썸네일 가져오기 시작`);
  const startTime = Date.now();

  try {
    // 모든 블록 가져오기
    const blocks = await getPageBlocks(pageId);

    if (!blocks || blocks.length === 0) {
      console.warn(`⚠️ 페이지 ${pageId}에서 블록을 찾을 수 없습니다.`);
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
         console.log(`🖼️ 페이지 커버 이미지를 썸네일로 사용: ${thumbnail.substring(0, 50)}...`);
      } else {
         console.log(`🖼️ 페이지 커버 이미지가 없거나 유효하지 않음. 본문 첫 이미지를 썸네일로 사용.`);
      }
    } catch (error) {
      console.error(`❌ 페이지 ${pageId} 커버 이미지 가져오기 오류:`, error);
    }

    // 블록을 HTML로 변환
    console.log(`🔄 블록을 HTML로 변환 시작: ${blocks.length}개 최상위 블록`);
    let content = renderBlocksToHtmlWithListHandling(blocks as (BlockObjectResponse & { children?: BlockObjectResponse[] })[]);

    // 최종 가공: 모든 독립적인 figure 태그 제거
    content = removeOrphanedClosingTags(content, 'figure');

    const endTime = Date.now();
    const totalTime = (endTime - startTime) / 1000;

    console.log(`⏱️ 총 소요 시간: ${totalTime.toFixed(2)}초`);
    console.log(`📊 생성된 HTML 길이: ${content.length} 글자`);

    return { content, thumbnail, image };
  } catch (error) {
    console.error(`❌ 페이지 ${pageId} 컨텐츠 변환 오류:`, error);
    return {
      content: `<p class="text-red-500">오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}</p>`,
      thumbnail: '',
      image: ''
    };
  }
}

/**
 * 블록 배열을 HTML로 변환하며 리스트 그룹화 처리
 */
export function renderBlocksToHtmlWithListHandling(blocks: (BlockObjectResponse & { children?: BlockObjectResponse[] })[]): string {
  let html = '';
  let currentListTag: ListType = null;
  let listItems = '';
  
  // 디버깅을 위한 블록 정보 로깅
  console.log(`[renderBlocksToHtmlWithListHandling] 총 ${blocks.length}개 블록 처리 시작`);
  
  // 렌더러 초기화
  const renderer = new BlockRenderer();
  
  blocks.forEach((block, index) => {
    const blockType = block.type;
    const isListItem = blockType === 'bulleted_list_item' || blockType === 'numbered_list_item';
    const listType = blockType === 'bulleted_list_item' ? 'bulleted_list_item' : (blockType === 'numbered_list_item' ? 'numbered_list_item' : null);
    
    if (isListItem) {
      // 리스트 아이템의 경우
      if (currentListTag !== listType) {
        // 이전 리스트가 있으면 닫기
        if (currentListTag) {
          html += `</${currentListTag === 'bulleted_list_item' ? 'ul' : 'ol'}>\n`;
        }
        
        // 새 리스트 시작 - 클래스 개선
        const listClass = listType === 'bulleted_list_item' ? 'notion-list notion-bulleted-list' : 'notion-list notion-numbered-list';
        html += `<${listType === 'bulleted_list_item' ? 'ul' : 'ol'} class="${listClass}">\n`;
        currentListTag = listType;
      }
      
      // 리스트 아이템 추가
      listItems += renderer.render(block as ExtendedBlockObjectResponse);
    } else {
      // 리스트 아이템이 아닌 경우
      if (currentListTag) {
        // 진행 중인 리스트가 있으면 리스트 아이템 추가 후 리스트 닫기
        html += listItems + `</${currentListTag === 'bulleted_list_item' ? 'ul' : 'ol'}>\n`;
        currentListTag = null;
        listItems = '';
      }
      
      // 일반 블록 추가
      html += renderer.render(block as ExtendedBlockObjectResponse) + '\n';
    }
  });
  
  // 마지막 리스트 닫기
  if (currentListTag) {
    html += listItems + `</${currentListTag === 'bulleted_list_item' ? 'ul' : 'ol'}>\n`;
  }
  
  return html;
}

/**
 * 블록을 HTML로 변환하는 함수
 */
export function renderBlocksToHtml(blocks: (BlockObjectResponse & { children?: BlockObjectResponse[] })[]): string {
  const renderer = new BlockRenderer();
  const html = blocks
    .map(block => renderer.render(block as ExtendedBlockObjectResponse))
    .join('\n');
  return html;
} 