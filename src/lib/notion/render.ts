import { BlockObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { getPageBlocks } from './blocks';
import { ExtendedBlockObjectResponse } from './blocks';
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkHtml from 'remark-html';
import { unified } from 'unified';

/**
 * 페이지의 모든 블록을 가져오는 함수
 */
export async function fetchPageBlocks(pageId: string): Promise<BlockObjectResponse[]> {
  return await getPageBlocks(pageId);
}

/**
 * 리치 텍스트를 HTML로 변환하는 함수
 * 노션의 annotations 속성을 활용하여 서식을 보존합니다
 */
function renderRichTextToHtml(richText: any[]): string {
  if (!richText || richText.length === 0) return '';
  
  return richText.map(text => {
    if (!text) return '';
    
    const content = text.plain_text || '';
    const annotations = text.annotations || {};
    
    let formatted = content;
    
    // 텍스트 스타일 적용
    if (annotations.bold) formatted = `<strong>${formatted}</strong>`;
    if (annotations.italic) formatted = `<em>${formatted}</em>`;
    if (annotations.strikethrough) formatted = `<del>${formatted}</del>`;
    if (annotations.underline) formatted = `<u>${formatted}</u>`;
    if (annotations.code) formatted = `<code>${formatted}</code>`;
    
    // 색상 적용 (기본색이 아닌 경우에만)
    if (annotations.color && annotations.color !== 'default') {
      formatted = `<span class="notion-color-${annotations.color}">${formatted}</span>`;
    }
    
    // 링크 처리
    if (text.href) {
      formatted = `<a href="${text.href}" target="_blank" rel="noopener noreferrer">${formatted}</a>`;
    }
    
    return formatted;
  }).join('');
}

/**
 * 블록 배열을 Markdown+HTML 혼합 문자열로 변환
 * 노션의 블록 구조와 서식을 최대한 보존합니다
 */
export function blocksToMarkdown(blocks: ExtendedBlockObjectResponse[], depth = 0): string {
  let md = '';
  
  // 동일 타입의 연속된 목록 아이템을 묶기 위한 변수
  let listType: string | null = null;
  let listItems = '';
  
  for (const block of blocks) {
    // 들여쓰기 추가 (하위 블록인 경우)
    const indent = depth > 0 ? '  '.repeat(depth) : '';
    
    const { type } = block;
    const value = (block as any)[type];
    
    // 목록 아이템 처리 시작 (이전 목록과 다른 타입이면 기존 목록 종료)
    if ((type === 'bulleted_list_item' || type === 'numbered_list_item') && 
        listType && listType !== type) {
      md += listItems + '\n';
      listItems = '';
    }
    
    // 목록이 아닌 블록이면 기존 목록 종료
    if (type !== 'bulleted_list_item' && type !== 'numbered_list_item' && listItems) {
      md += listItems + '\n';
      listItems = '';
      listType = null;
    }
    
    switch (type) {
      case 'paragraph': {
        // 리치 텍스트를 HTML로 변환하여 마크다운에 포함
        const htmlText = renderRichTextToHtml(value.rich_text);
        
        // 들여쓰기가 있는 경우 div 클래스 추가
        if (depth > 0) {
          md += `${indent}<div class="notion-indent-${depth}">${htmlText}</div>\n\n`;
        } else {
          md += `${htmlText}\n\n`;
        }
        break;
      }
      case 'heading_1': {
        const htmlText = renderRichTextToHtml(value.rich_text);
        md += `<h1 class="notion-h1">${htmlText}</h1>\n\n`;
        break;
      }
      case 'heading_2': {
        const htmlText = renderRichTextToHtml(value.rich_text);
        md += `<h2 class="notion-h2">${htmlText}</h2>\n\n`;
        break;
      }
      case 'heading_3': {
        const htmlText = renderRichTextToHtml(value.rich_text);
        md += `<h3 class="notion-h3">${htmlText}</h3>\n\n`;
        break;
      }
      case 'bulleted_list_item': {
        const htmlText = renderRichTextToHtml(value.rich_text);
        listType = 'bulleted_list_item';
        
        // 목록 시작 태그 추가
        if (!listItems) {
          listItems = `${indent}<ul class="notion-list">\n`;
        }
        
        // 목록 아이템 추가
        listItems += `${indent}  <li class="notion-list-item">${htmlText}`;
        
        // 하위 블록이 있는 경우 처리
        const children = (block as any).children;
        if (Array.isArray(children) && children.length > 0) {
          listItems += '\n' + blocksToMarkdown(children as ExtendedBlockObjectResponse[], depth + 1);
        }
        
        listItems += `</li>\n`;
        break;
      }
      case 'numbered_list_item': {
        const htmlText = renderRichTextToHtml(value.rich_text);
        listType = 'numbered_list_item';
        
        // 목록 시작 태그 추가
        if (!listItems) {
          listItems = `${indent}<ol class="notion-list">\n`;
        }
        
        // 목록 아이템 추가
        listItems += `${indent}  <li class="notion-list-item">${htmlText}`;
        
        // 하위 블록이 있는 경우 처리
        const children = (block as any).children;
        if (Array.isArray(children) && children.length > 0) {
          listItems += '\n' + blocksToMarkdown(children as ExtendedBlockObjectResponse[], depth + 1);
        }
        
        listItems += `</li>\n`;
        break;
      }
      case 'code': {
        const code = renderRichTextToHtml(value.rich_text);
        const lang = value.language || '';
        md += `<pre class="notion-code"><code class="language-${lang}">${code}</code></pre>\n\n`;
        break;
      }
      case 'image': {
        // 이미지 캡션 처리
        const caption = value.caption ? renderRichTextToHtml(value.caption) : '';
        
        // Notion 이미지 블록의 파일 URL 접근 수정
        const url = (value as any).file?.url || (value as any).external?.url || '';
        
        if (caption) {
          md += `<figure class="notion-image-figure">
  <img src="${url}" alt="${caption}" class="notion-image" loading="lazy">
  <figcaption>${caption}</figcaption>
</figure>\n\n`;
        } else {
          md += `<img src="${url}" alt="" class="notion-image" loading="lazy">\n\n`;
        }
        break;
      }
      case 'divider': {
        md += `<hr class="notion-hr">\n\n`;
        break;
      }
      case 'quote': {
        const htmlText = renderRichTextToHtml(value.rich_text);
        md += `<blockquote class="notion-quote">${htmlText}</blockquote>\n\n`;
        break;
      }
      case 'callout': {
        const icon = value.icon?.emoji || '';
        const htmlText = renderRichTextToHtml(value.rich_text);
        const color = value.color || 'default';
        
        md += `<div class="notion-callout" data-color="${color}">
  <div class="notion-callout-icon">${icon}</div>
  <div class="notion-callout-content">${htmlText}</div>
</div>\n\n`;
        break;
      }
      case 'toggle': {
        const summary = renderRichTextToHtml(value.rich_text);
        
        md += `<details class="notion-toggle">
  <summary class="notion-toggle-summary">${summary}</summary>
  <div class="notion-toggle-content">
`;
        
        // 하위 블록이 있다면 재귀적으로 처리 (들여쓰기 레벨 증가)
        const children = (block as any).children;
        if (Array.isArray(children) && children.length > 0) {
          md += blocksToMarkdown(children as ExtendedBlockObjectResponse[], depth + 1);
        }
        
        md += `  </div>
</details>\n\n`;
        
        // 이 블록의 하위 블록은 이미 처리했으므로 아래 재귀 호출에서 처리되지 않도록 플래그 설정
        (block as any).children = [];
        break;
      }
      case 'table': {
        md += `<table class="notion-table">\n`;
        
        // 헤더 여부 확인
        const hasColumnHeader = value.has_column_header;
        
        // 하위 블록(테이블 행)이 있다면 처리
        const children = (block as any).children || [];
        if (Array.isArray(children) && children.length > 0) {
          children.forEach((row, rowIndex) => {
            const isHeader = hasColumnHeader && rowIndex === 0;
            const cells = row.table_row?.cells || [];
            
            md += `  <tr class="notion-table-row">\n`;
            
            cells.forEach((cell: any[]) => {
              const cellContent = cell.length > 0 ? renderRichTextToHtml(cell) : '';
              if (isHeader) {
                md += `    <th class="notion-table-cell">${cellContent}</th>\n`;
              } else {
                md += `    <td class="notion-table-cell">${cellContent}</td>\n`;
              }
            });
            
            md += `  </tr>\n`;
          });
        }
        
        md += `</table>\n\n`;
        
        // 이미 처리한 하위 블록
        (block as any).children = [];
        break;
      }
      case 'to_do': {
        const checked = value.checked;
        const htmlText = renderRichTextToHtml(value.rich_text);
        
        md += `<div class="notion-to-do">
  <input type="checkbox" ${checked ? 'checked' : ''} disabled />
  <span class="notion-to-do-text ${checked ? 'checked' : ''}">${htmlText}</span>
</div>\n\n`;
        break;
      }
      case 'html': {
        // HTML 블록의 원본 삽입
        const html = renderRichTextToHtml(value.rich_text);
        console.log(`[blocksToMarkdown] HTML 블록 처리: ${html.substring(0, 50)}${html.length > 50 ? '...' : ''}`);
        md += html + '\n\n';
        break;
      }
      default: {
        const htmlText = renderRichTextToHtml(value.rich_text);
        if (htmlText) md += htmlText + '\n\n';
        break;
      }
    }
    
    // 하위 children 블록이 있다면 재귀적으로 Markdown 변환 (toggle 타입은 위에서 이미 처리)
    const children = (block as any).children;
    if (Array.isArray(children) && children.length > 0 && type !== 'toggle' && type !== 'table') {
      md += blocksToMarkdown(children as ExtendedBlockObjectResponse[], depth + 1);
    }
  }
  
  // 마지막 목록 처리
  if (listItems) {
    if (listType === 'bulleted_list_item') {
      md += listItems + (depth > 0 ? '  '.repeat(depth) : '') + '</ul>\n\n';
    } else if (listType === 'numbered_list_item') {
      md += listItems + (depth > 0 ? '  '.repeat(depth) : '') + '</ol>\n\n';
    }
  }
  
  return md;
}

/**
 * 마크다운 문자열을 HTML로 변환하는 함수
 * GFM(GitHub Flavored Markdown) 지원 및 보안을 위한 HTML 정제 기능 포함
 */
export async function markdownToHtml(markdown: string): Promise<string> {
  console.log(`[markdownToHtml] 마크다운 변환 시작 - 길이: ${markdown.length}자`);
  const startTime = performance.now();
  
  try {
    // 마크다운이 비어있는 경우 빈 문자열 반환
    if (!markdown || !markdown.trim()) {
      return '';
    }
    
    // 마크다운을 HTML로 변환
    const result = await unified()
      .use(remarkParse) // 마크다운 파싱
      .use(remarkGfm)   // GitHub 호환 마크다운 지원 (표, 체크리스트 등)
      .use(remarkHtml, { sanitize: false }) // HTML로 변환 (sanitize는 별도로 수행)
      .process(markdown);
    
    // HTML 변환 결과 (문자열로 변환)
    const html = result.toString();
    
    // HTML 정제 (보안 위협 요소 제거)
    const sanitizedHtml = sanitizeHtml(html, {
      // 허용할 HTML 태그 목록
      allowedTags: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'a', 'img', 'strong', 'em', 'del', 'blockquote',
        'ul', 'ol', 'li', 'pre', 'code', 'hr',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'br', 'div', 'span'
      ],
      // 허용할 HTML 속성 목록
      allowedAttributes: {
        a: ['href', 'title', 'target', 'rel'],
        img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
        div: ['class', 'id', 'style'],
        span: ['class', 'id', 'style'],
        code: ['class'],
        th: ['scope', 'colspan', 'rowspan'],
        td: ['colspan', 'rowspan']
      },
      // 자동으로 target="_blank"와 rel="noopener noreferrer" 속성 추가 (외부 링크 보안)
      transformTags: {
        'a': function(tagName, attribs) {
          if (attribs.href && attribs.href.startsWith('http')) {
            return {
              tagName: 'a',
              attribs: {
                ...attribs,
                target: '_blank',
                rel: 'noopener noreferrer'
              }
            };
          }
          return { tagName, attribs };
        },
        // 이미지에 lazy loading 속성 추가
        'img': function(tagName, attribs) {
          return {
            tagName: 'img',
            attribs: {
              ...attribs,
              loading: 'lazy'
            }
          };
        }
      }
    });
    
    const processTime = performance.now() - startTime;
    console.log(`[markdownToHtml] 변환 완료 - 처리 시간: ${processTime.toFixed(2)}ms, 결과 길이: ${sanitizedHtml.length}자`);
    
    return sanitizedHtml;
  } catch (error) {
    console.error('[markdownToHtml] 마크다운 변환 오류:', error);
    return `<div class="markdown-error">마크다운 변환 중 오류가 발생했습니다.</div>`;
  }
}

/**
 * HTML 콘텐츠를 처리하는 함수
 * 직접 HTML 입력에 대한 정제 및 보안 처리
 */
export function processHtmlContent(html: string): string {
  console.log(`[processHtmlContent] HTML 처리 - 길이: ${html.length}자, 내용 미리보기: "${html.substring(0, 50)}${html.length > 50 ? '...' : ''}"`);
  
  if (!html || !html.trim()) {
    return '';
  }
  
  try {
    // HTML 정제 (보안 위협 요소 제거)
    const sanitizedHtml = sanitizeHtml(html, {
      // 허용할 HTML 태그 목록 (마크다운보다 더 많은 태그 허용)
      allowedTags: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'a', 'img', 'strong', 'em', 'del', 'blockquote',
        'ul', 'ol', 'li', 'pre', 'code', 'hr',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'br', 'div', 'span',
        'figure', 'figcaption', 'picture', 'source',
        'section', 'article', 'header', 'footer',
        'details', 'summary', 'iframe', 'video', 'audio',
        'mark', 'time', 'small', 'sup', 'sub'
      ],
      // 허용할 HTML 속성 목록
      allowedAttributes: {
        a: ['href', 'title', 'target', 'rel', 'class', 'id'],
        img: ['src', 'alt', 'title', 'width', 'height', 'loading', 'class'],
        iframe: ['src', 'width', 'height', 'frameborder', 'allowfullscreen', 'loading', 'class'],
        video: ['src', 'controls', 'width', 'height', 'poster', 'preload', 'class'],
        audio: ['src', 'controls', 'preload', 'class'],
        div: ['class', 'id', 'style'],
        span: ['class', 'id', 'style'],
        figure: ['class', 'id'],
        figcaption: ['class'],
        section: ['class', 'id'],
        article: ['class', 'id'],
        '*': ['class']  // 모든 태그에 class 속성 허용
      },
      // 자동으로 안전한 속성 추가
      transformTags: {
        'a': function(tagName, attribs) {
          if (attribs.href && attribs.href.startsWith('http')) {
            return {
              tagName: 'a',
              attribs: {
                ...attribs,
                target: '_blank',
                rel: 'noopener noreferrer'
              }
            };
          }
          return { tagName, attribs };
        },
        // 이미지에 lazy loading 및 오류 처리 속성 추가
        'img': function(tagName, attribs) {
          return {
            tagName: 'img',
            attribs: {
              ...attribs,
              loading: 'lazy',
              onerror: "this.onerror=null; this.src='/images/placeholder.jpg'; console.error('이미지 로드 실패:', this.src);"
            }
          };
        },
        // iframe에 lazy loading 속성 추가
        'iframe': function(tagName, attribs) {
          return {
            tagName: 'iframe',
            attribs: {
              ...attribs,
              loading: 'lazy'
            }
          };
        }
      }
    });
    
    return sanitizedHtml;
  } catch (error) {
    console.error('[processHtmlContent] HTML 처리 오류:', error);
    return `<div class="html-error">HTML 처리 중 오류가 발생했습니다.</div>`;
  }
} 