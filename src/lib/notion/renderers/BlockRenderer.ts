import { ExtendedBlockObjectResponse, RenderOptions } from '../types';
import { RichTextRenderer } from './RichTextRenderer';
import { sanitizeHtmlContent, balanceHtmlTags } from '../utils/sanitizer';

/**
 * 노션 블록 렌더링을 위한 기본 클래스
 */
export class BlockRenderer {
  protected indentLevel: number;
  protected sanitize: boolean;
  protected depth: number;

  /**
   * 
   * @param options 렌더링 옵션
   */
  constructor(options?: RenderOptions) {
    this.indentLevel = options?.indentLevel ?? 0;
    this.sanitize = options?.sanitize ?? true;
    this.depth = options?.depth ?? 0;
  }

  /**
   * 블록 HTML 렌더링
   * @param block 노션 블록
   * @returns HTML 문자열
   */
  render(block: ExtendedBlockObjectResponse): string {
    // 성능 측정 시작
    const startTime = performance.now();
    
    console.log(`[BlockRenderer] 블록 타입: ${block.type}, ID: ${block.id.substring(0, 8)}...`);

    // 들여쓰기 처리 (하위 블록인 경우)
    const indent = this.indentLevel > 0 ? '  '.repeat(this.indentLevel) : '';
    
    // 블록 타입에 따라 적절한 렌더링 메서드 호출
    let html = '';
    
    switch (block.type) {
      case 'paragraph':
        html = this.renderParagraph(block, indent);
        break;
      case 'heading_1':
        html = this.renderHeading1(block, indent);
        break;
      case 'heading_2':
        html = this.renderHeading2(block, indent);
        break;
      case 'heading_3':
        html = this.renderHeading3(block, indent);
        break;
      case 'bulleted_list_item':
        html = this.renderBulletedListItem(block, indent);
        break;
      case 'numbered_list_item':
        html = this.renderNumberedListItem(block, indent);
        break;
      case 'code':
        html = this.renderCode(block, indent);
        break;
      case 'image':
        html = this.renderImage(block, indent);
        break;
      case 'divider':
        html = this.renderDivider(block, indent);
        break;
      case 'quote':
        html = this.renderQuote(block, indent);
        break;
      case 'callout':
        html = this.renderCallout(block, indent);
        break;
      case 'toggle':
        html = this.renderToggle(block, indent);
        break;
      case 'embed':
        html = this.renderEmbed(block, indent);
        break;
      case 'video':
        html = this.renderVideo(block, indent);
        break;
      case 'html':
        html = this.renderHtml(block, indent);
        break;
      case 'table':
        html = this.renderTable(block, indent);
        break;
      case 'to_do':
        html = this.renderToDo(block, indent);
        break;
      default:
        html = this.renderUnsupported(block, indent);
    }
    
    // HTML 정제 (요청된 경우)
    if (this.sanitize) {
      html = sanitizeHtmlContent(html);
      html = balanceHtmlTags(html);
    }
    
    // 성능 측정 종료
    const processTime = performance.now() - startTime;
    if (processTime > 10) {
      console.log(`[BlockRenderer] 블록 처리 시간 (${block.type}): ${processTime.toFixed(2)}ms`);
    }
    
    return html;
  }

  /**
   * 문단 블록 렌더링
   */
  protected renderParagraph(block: ExtendedBlockObjectResponse, indent: string): string {
    const value = (block as any).paragraph;
    const richText = value.rich_text || [];
    const text = RichTextRenderer.render(richText);
    
    // 텍스트가 없는 경우 빈 줄 처리
    if (!text.trim()) {
      return `${indent}<p class="notion-paragraph notion-blank"></p>`;
    }
    
    // 들여쓰기 레벨에 따른 클래스 추가
    if (this.depth > 0) {
      return `${indent}<p class="notion-paragraph notion-indent-${this.depth}">${text}</p>`;
    } else {
      return `${indent}<p class="notion-paragraph">${text}</p>`;
    }
  }

  /**
   * 제목1 블록 렌더링
   */
  protected renderHeading1(block: ExtendedBlockObjectResponse, indent: string): string {
    const value = (block as any).heading_1;
    const richText = value.rich_text || [];
    const text = RichTextRenderer.render(richText);
    return `${indent}<h1 class="notion-h1">${text}</h1>`;
  }

  /**
   * 제목2 블록 렌더링
   */
  protected renderHeading2(block: ExtendedBlockObjectResponse, indent: string): string {
    const value = (block as any).heading_2;
    const richText = value.rich_text || [];
    const text = RichTextRenderer.render(richText);
    return `${indent}<h2 class="notion-h2">${text}</h2>`;
  }

  /**
   * 제목3 블록 렌더링
   */
  protected renderHeading3(block: ExtendedBlockObjectResponse, indent: string): string {
    const value = (block as any).heading_3;
    const richText = value.rich_text || [];
    const text = RichTextRenderer.render(richText);
    return `${indent}<h3 class="notion-h3">${text}</h3>`;
  }

  /**
   * 글머리 기호 목록 항목 렌더링
   */
  protected renderBulletedListItem(block: ExtendedBlockObjectResponse, indent: string): string {
    const value = (block as any).bulleted_list_item;
    const richText = value.rich_text || [];
    const text = RichTextRenderer.render(richText);
    
    // 기본 목록 아이템 HTML - 마커 클래스 추가
    let html = `${indent}<li class="notion-list-item notion-bulleted-item">${text}`;
    
    // 하위 블록이 있다면 렌더링 (들여쓰기 레벨 증가)
    const children = (block as any).children;
    if (Array.isArray(children) && children.length > 0) {
      // 하위 렌더러 생성 (들여쓰기 레벨 증가)
      const childRenderer = new BlockRenderer({
        indentLevel: this.indentLevel + 2,
        sanitize: false, // 중첩 블록은 마지막에 한 번만 정제
        depth: this.depth + 1
      });
      
      html += '\n' + `${indent}  <ul class="notion-list notion-nested-list notion-bulleted-list">\n`;
      
      for (const child of children) {
        html += `${indent}    ${childRenderer.render(child)}\n`;
      }
      
      html += `${indent}  </ul>`;
    }
    
    html += `</li>`;
    
    return html;
  }

  /**
   * 번호 매기기 목록 항목 렌더링
   */
  protected renderNumberedListItem(block: ExtendedBlockObjectResponse, indent: string): string {
    const value = (block as any).numbered_list_item;
    const richText = value.rich_text || [];
    const text = RichTextRenderer.render(richText);
    
    // 기본 목록 아이템 HTML - 마커 클래스 추가
    let html = `${indent}<li class="notion-list-item notion-numbered-item">${text}`;
    
    // 하위 블록이 있다면 렌더링 (들여쓰기 레벨 증가)
    const children = (block as any).children;
    if (Array.isArray(children) && children.length > 0) {
      // 하위 렌더러 생성 (들여쓰기 레벨 증가)
      const childRenderer = new BlockRenderer({
        indentLevel: this.indentLevel + 2,
        sanitize: false, // 중첩 블록은 마지막에 한 번만 정제
        depth: this.depth + 1
      });
      
      html += '\n' + `${indent}  <ol class="notion-list notion-nested-list notion-numbered-list">\n`;
      
      for (const child of children) {
        html += `${indent}    ${childRenderer.render(child)}\n`;
      }
      
      html += `${indent}  </ol>`;
    }
    
    html += `</li>`;
    
    return html;
  }

  /**
   * 코드 블록 렌더링
   */
  protected renderCode(block: ExtendedBlockObjectResponse, indent: string): string {
    const value = (block as any).code;
    const richText = value.rich_text || [];
    const code = RichTextRenderer.render(richText, false);
    
    const language = value.language || '';
    return `${indent}<pre class="notion-code"><code class="language-${language}">${code}</code></pre>`;
  }

  /**
   * 이미지 블록 렌더링
   */
  protected renderImage(block: ExtendedBlockObjectResponse, indent: string): string {
    try {
      const value = (block as any).image;
      
      // 이미지 URL과 캡션
      const url = (value as any).file?.url || (value as any).external?.url || '';
      const caption = value.caption ? RichTextRenderer.render(value.caption) : '';
      
      // URL 유효성 검사
      if (!url) {
        console.error(`[BlockRenderer] 이미지 URL이 없습니다. 블록 ID: ${block.id}`);
        return `${indent}<div class="notion-image-error">이미지를 찾을 수 없습니다</div>`;
      }
      
      // 캡션이 있으면 figure로 감싸기
      if (caption) {
        return `${indent}<figure class="notion-image-figure">
${indent}  <img src="${url}" alt="${caption}" class="notion-image" loading="lazy">
${indent}  <figcaption class="notion-image-caption">${caption}</figcaption>
${indent}</figure>`;
      } else {
        return `${indent}<img src="${url}" alt="" class="notion-image" loading="lazy">`;
      }
    } catch (error) {
      console.error(`[BlockRenderer] 이미지 블록 렌더링 오류:`, error);
      return `${indent}<div class="notion-image-error">이미지 로딩 오류</div>`;
    }
  }

  /**
   * 구분선 블록 렌더링
   */
  protected renderDivider(block: ExtendedBlockObjectResponse, indent: string): string {
    return `${indent}<hr class="notion-hr">`;
  }

  /**
   * 인용 블록 렌더링
   */
  protected renderQuote(block: ExtendedBlockObjectResponse, indent: string): string {
    const value = (block as any).quote;
    const richText = value.rich_text || [];
    const text = RichTextRenderer.render(richText);
    return `${indent}<blockquote class="notion-quote">${text}</blockquote>`;
  }

  /**
   * 콜아웃 블록 렌더링
   */
  protected renderCallout(block: ExtendedBlockObjectResponse, indent: string): string {
    const value = (block as any).callout;
    const icon = value.icon?.emoji || '';
    const richText = value.rich_text || [];
    const text = RichTextRenderer.render(richText);
    const color = value.color || 'default';
    
    return `${indent}<div class="notion-callout" data-color="${color}">
${indent}  <div class="notion-callout-icon">${icon}</div>
${indent}  <div class="notion-callout-content">${text}</div>
${indent}</div>`;
  }

  /**
   * 토글 블록 렌더링
   */
  protected renderToggle(block: ExtendedBlockObjectResponse, indent: string): string {
    const value = (block as any).toggle;
    const richText = value.rich_text || [];
    const summary = RichTextRenderer.render(richText);
    
    let html = `${indent}<details class="notion-toggle">
${indent}  <summary class="notion-toggle-summary">${summary}</summary>
${indent}  <div class="notion-toggle-content">`;
    
    // 하위 블록이 있다면 재귀적으로 렌더링 (들여쓰기 레벨 증가)
    const children = (block as any).children;
    if (Array.isArray(children) && children.length > 0) {
      // 하위 렌더러 생성 (들여쓰기 레벨 증가)
      const childRenderer = new BlockRenderer({
        indentLevel: this.indentLevel + 2,
        sanitize: false, // 중첩 블록은 마지막에 한 번만 정제
        depth: this.depth + 1
      });
      
      html += '\n';
      for (const child of children) {
        html += `${indent}    ${childRenderer.render(child)}\n`;
      }
    }
    
    html += `${indent}  </div>
${indent}</details>`;
    
    return html;
  }

  /**
   * 임베드 블록 렌더링
   */
  protected renderEmbed(block: ExtendedBlockObjectResponse, indent: string): string {
    try {
      const value = (block as any).embed;
      const url = value.url || '';
      // iframe 삽입 시 보안 위험 주의
      return `${indent}<div class="notion-embed">
${indent}  <iframe src="${url}" frameborder="0" allowfullscreen class="notion-embed-iframe" loading="lazy"></iframe>
${indent}</div>`;
    } catch (error) {
      console.error(`[BlockRenderer] 임베드 블록 렌더링 오류:`, error);
      return `${indent}<div class="notion-embed-error">외부 콘텐츠를 불러올 수 없습니다</div>`;
    }
  }

  /**
   * HTML 블록 렌더링
   */
  protected renderHtml(block: ExtendedBlockObjectResponse, indent: string): string {
    console.log(`[BlockRenderer] HTML 블록 처리 중...`);
    const value = (block as any).html;
    const richText = value.rich_text || [];
    const rawHtml = RichTextRenderer.render(richText);
    
    if (!rawHtml.trim()) {
      console.log(`[BlockRenderer] 비어있는 HTML 블록 발견, 빈 문단으로 처리`);
      return `${indent}<p></p>`;
    } else {
      console.log(`[BlockRenderer] HTML 직접 렌더링: ${rawHtml.substring(0, 50)}...`);
      return rawHtml; // HTML 직접 반환 (신뢰할 수 있는 소스일 경우)
    }
  }

  /**
   * TODO 블록 렌더링
   */
  protected renderToDo(block: ExtendedBlockObjectResponse, indent: string): string {
    const value = (block as any).to_do;
    const checked = value.checked || false;
    const richText = value.rich_text || [];
    const text = RichTextRenderer.render(richText);
    
    return `${indent}<div class="notion-to-do">
${indent}  <input type="checkbox" ${checked ? 'checked' : ''} disabled />
${indent}  <span class="notion-to-do-text ${checked ? 'notion-to-do-checked' : ''}">${text}</span>
${indent}</div>`;
  }

  /**
   * 테이블 블록 렌더링
   */
  protected renderTable(block: ExtendedBlockObjectResponse, indent: string): string {
    try {
      const value = (block as any).table;
      // 컬럼 헤더 여부
      const hasColumnHeader = value.has_column_header || false;
      
      let html = `${indent}<table class="notion-table">`;
      
      // 테이블 행 처리
      const children = (block as any).children || [];
      if (Array.isArray(children) && children.length > 0) {
        children.forEach((row, rowIndex) => {
          const isHeader = hasColumnHeader && rowIndex === 0;
          const cells = row.table_row?.cells || [];
          
          html += `\n${indent}  <tr class="notion-table-row">`;
          
          cells.forEach((cell: any[]) => {
            const cellContent = cell.length > 0 ? RichTextRenderer.render(cell) : '';
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
      return html;
    } catch (error) {
      console.error(`[BlockRenderer] 테이블 블록 렌더링 오류:`, error);
      return `${indent}<div class="notion-table-error">테이블을 렌더링할 수 없습니다</div>`;
    }
  }

  /**
   * 비디오 블록 렌더링
   */
  protected renderVideo(block: ExtendedBlockObjectResponse, indent: string): string {
    try {
      const value = (block as any).video;
      const url = (value as any).file?.url || (value as any).external?.url || '';
      if (!url) {
        console.error(`[BlockRenderer] 비디오 URL이 없습니다. 블록 ID: ${block.id}`);
        return `${indent}<div class="notion-video-error">비디오를 찾을 수 없습니다</div>`;
      }
      
      // YouTube 또는 Vimeo 임베드 처리
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const videoId = this.getYoutubeVideoId(url);
        if (videoId) {
          return `${indent}<div class="notion-video notion-video-youtube">
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
          return `${indent}<div class="notion-video-error">유효하지 않은 YouTube URL</div>`;
        }
      } else if (url.includes('vimeo.com')) {
        const videoId = this.getVimeoVideoId(url);
        if (videoId) {
          return `${indent}<div class="notion-video notion-video-vimeo">
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
          return `${indent}<div class="notion-video-error">유효하지 않은 Vimeo URL</div>`;
        }
      } else {
        // 일반 비디오 파일
        return `${indent}<div class="notion-video">
${indent}  <video 
${indent}    controls 
${indent}    src="${url}" 
${indent}    class="notion-video-player"
${indent}    preload="metadata">
${indent}  </video>
${indent}</div>`;
      }
    } catch (error) {
      console.error(`[BlockRenderer] 비디오 블록 렌더링 오류:`, error);
      return `${indent}<div class="notion-video-error">비디오 로딩 오류</div>`;
    }
  }

  /**
   * 지원하지 않는 블록 타입 렌더링
   */
  protected renderUnsupported(block: ExtendedBlockObjectResponse, indent: string): string {
    try {
      console.warn(`[BlockRenderer] 지원하지 않는 블록 타입: ${block.type}`, block);
      
      // rich_text가 있으면 렌더링
      const value = (block as any)[block.type];
      const richText = value?.rich_text;
      if (Array.isArray(richText) && richText.length > 0) {
        const text = RichTextRenderer.render(richText);
        return `${indent}<div class="notion-unsupported" data-type="${block.type}">${text}</div>`;
      } else {
        return `${indent}<div class="notion-unsupported" data-type="${block.type}"></div>`;
      }
    } catch (error) {
      console.error(`[BlockRenderer] 알 수 없는 블록 타입 ${block.type} 렌더링 오류:`, error);
      return `${indent}<div class="notion-error">지원하지 않는 블록 타입: ${block.type}</div>`;
    }
  }

  /**
   * YouTube URL에서 비디오 ID 추출
   */
  private getYoutubeVideoId(url: string): string | null {
    console.log(`[getYoutubeVideoId] YouTube URL 분석: ${url}`);
    
    if (!url) return null;
    
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/, // 다른 파라미터와 함께 있는 경우
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        console.log(`[getYoutubeVideoId] 비디오 ID 추출 성공: ${match[1]}`);
        return match[1];
      }
    }
    
    console.log(`[getYoutubeVideoId] 비디오 ID를 찾을 수 없음: ${url}`);
    return null;
  }

  /**
   * Vimeo URL에서 비디오 ID 추출
   */
  private getVimeoVideoId(url: string): string | null {
    console.log(`[getVimeoVideoId] Vimeo URL 분석: ${url}`);
    
    if (!url) return null;
    
    const patterns = [
      /vimeo\.com\/([0-9]+)/,
      /player\.vimeo\.com\/video\/([0-9]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        console.log(`[getVimeoVideoId] 비디오 ID 추출 성공: ${match[1]}`);
        return match[1];
      }
    }
    
    console.log(`[getVimeoVideoId] 비디오 ID를 찾을 수 없음: ${url}`);
    return null;
  }
} 