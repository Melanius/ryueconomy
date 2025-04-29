import {
  RichTextItemResponse,
  BlockObjectResponse,
} from '@notionhq/client/build/src/api-endpoints';

/**
 * 블록 타입별 카운트 (디버깅용)
 */
export function countBlockTypes(blocks: any[], countObj: Record<string, number>): void {
  if (!blocks || !Array.isArray(blocks)) return;

  blocks.forEach(block => {
    if (!block || !block.type) return;

    countObj[block.type] = (countObj[block.type] || 0) + 1;

    // 하위 블록 재귀 호출
    if ((block as BlockObjectResponse).has_children) {
      // Check if children are already populated in the block object (e.g., from getAllPageBlocks)
      const children = (block as any).children;
      if (children && Array.isArray(children) && children.length > 0) {
        countBlockTypes(children, countObj);
      } else {
        // If not populated, log potential issue but don't fetch here
        // console.debug(`Block ${block.id} has children, but they are not populated in countBlockTypes.`);
      }
    }
  });
}


/**
 * 첫 번째 이미지 URL 찾기
 */
export function findFirstImage(blocks: any[]): string {
  if (!blocks || !Array.isArray(blocks)) return '';

  for (const block of blocks) {
    if (!block) continue;

    if (block.type === 'image') {
      const img = (block as any).image;
      if (img?.file?.url) return img.file.url;
      if (img?.external?.url) return img.external.url;
    }

    // 하위 블록 재귀 탐색
    if ((block as BlockObjectResponse).has_children) {
      const children = (block as any).children;
      if (children && Array.isArray(children) && children.length > 0) {
        const url = findFirstImage(children);
        if (url) return url;
      }
    }
  }
  return '';
}

/**
 * HTML 이스케이프
 */
export function escapeHTML(text: string): string {
  if (typeof text !== 'string') return '';
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * 문자열이 Emoji인지 확인
 */
export function isEmoji(str: string): boolean {
  if (typeof str !== 'string') return false;
  const regex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u;
  return regex.test(str);
} 