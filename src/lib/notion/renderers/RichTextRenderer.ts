import { RichTextItemResponse } from '@notionhq/client/build/src/api-endpoints';

/**
 * 노션 리치텍스트 렌더링을 위한 클래스
 */
export class RichTextRenderer {
  /**
   * 리치텍스트 배열을 HTML로 변환
   * @param richTextItems 리치텍스트 아이템 배열
   * @param applyFormatting 서식 적용 여부 (기본값: true)
   * @returns HTML 문자열
   */
  static render(richTextItems: RichTextItemResponse[] = [], applyFormatting: boolean = true): string {
    if (!richTextItems || richTextItems.length === 0) {
      return '';
    }
    
    // 로그 추가: 텍스트 항목 수 및 첫 번째 항목 확인
    console.log(`[RichTextRenderer] ${richTextItems.length}개 텍스트 항목 처리 시작...`);
    
    return richTextItems.map(text => {
      if (!text) return '';
      
      // 텍스트 콘텐츠 가져오기
      const content = text.plain_text || '';
      if (!content) return '';
      
      // 이모지나 특수 문자를 그대로 유지하는지 확인
      console.log(`[RichTextRenderer] 텍스트 콘텐츠 처리:`, content.substring(0, 50) + (content.length > 50 ? '...' : ''));
      
      // HTML 특수 문자 이스케이프 (이모지는 보존)
      let formattedText = this.escapeHtml(content);
      
      // 스타일 적용이 요청된 경우에만 포맷팅
      if (applyFormatting && text.annotations) {
        formattedText = this.applyAnnotations(formattedText, text.annotations);
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
   * @param text 원본 텍스트
   * @returns 이스케이프된 텍스트
   */
  static escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * 텍스트에 노션 어노테이션 적용
   * @param text 텍스트
   * @param annotations 어노테이션 객체
   * @returns 서식이 적용된 HTML
   */
  private static applyAnnotations(text: string, annotations: any): string {
    let formattedText = text;
    
    if (annotations.bold) {
      formattedText = `<strong>${formattedText}</strong>`;
    }
    if (annotations.italic) {
      formattedText = `<em>${formattedText}</em>`;
    }
    if (annotations.strikethrough) {
      formattedText = `<del>${formattedText}</del>`;
    }
    if (annotations.underline) {
      formattedText = `<u>${formattedText}</u>`;
    }
    if (annotations.code) {
      formattedText = `<code>${formattedText}</code>`;
    }
    
    // 색상 처리 (있는 경우)
    if (annotations.color && annotations.color !== 'default') {
      formattedText = `<span class="notion-${annotations.color}">${formattedText}</span>`;
    }
    
    return formattedText;
  }
} 