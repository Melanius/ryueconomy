/**
 * 노션 블록 처리를 위한 유틸리티 함수들
 */
import { notionLogger } from '@/lib/logger';
import { HtmlTag, ListType } from '../types';

/**
 * 자체 닫힘 태그 목록
 */
export const selfClosingTags = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 
  'link', 'meta', 'param', 'source', 'track', 'wbr'
]);

/**
 * HTML 태그 균형을 확인하고 필요한 닫힘 태그를 추가
 * @param html HTML 문자열
 * @returns 닫힘 태그가 균형있게 추가된 HTML 문자열
 */
export function balanceHtmlTags(html: string): string {
  const tagStack: HtmlTag[] = [];
  const tagRegex = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
  let match;
  let processedHtml = html;
  
  // 모든 태그를 찾아서 처리
  while ((match = tagRegex.exec(html)) !== null) {
    const fullTag = match[0];
    const tagName = match[1].toLowerCase();
    
    // 자체 닫힘 태그는 스택에 추가하지 않음
    if (selfClosingTags.has(tagName)) {
      continue;
    }
    
    // 여는 태그인 경우 스택에 추가
    if (!fullTag.includes('</')) {
      tagStack.push(tagName);
    } 
    // 닫는 태그인 경우 스택에서 제거
    else {
      // 가장 최근에 열린 태그가 현재 닫는 태그와 일치하는지 확인
      const lastOpenTag = tagStack.pop();
      if (lastOpenTag !== tagName) {
        notionLogger.warn(`HTML 태그 불균형 감지: '${tagName}' 닫는 태그를 발견했지만 가장 최근에 열린 태그는 '${lastOpenTag}'입니다.`);
      }
    }
  }
  
  // 닫히지 않은 태그를 역순으로 닫음
  if (tagStack.length > 0) {
    notionLogger.warn(`닫히지 않은 태그 ${tagStack.length}개 발견: ${tagStack.join(', ')}`);
    for (let i = tagStack.length - 1; i >= 0; i--) {
      processedHtml += `</${tagStack[i]}>`;
    }
  }
  
  return processedHtml;
}

/**
 * YouTube 비디오 ID 추출
 * @param url YouTube URL
 * @returns YouTube 비디오 ID 또는 null
 */
export function getYoutubeVideoId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

/**
 * Vimeo 비디오 ID 추출
 * @param url Vimeo URL
 * @returns Vimeo 비디오 ID 또는 null
 */
export function getVimeoVideoId(url: string): string | null {
  const regex = /(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^\/]*\/videos\/|album\/\d+\/video\/|)(\d+)(?:$|\/|\?))/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

/**
 * 문자열 앞뒤의 공백 제거 및 null/undefined 처리
 * @param str 처리할 문자열
 * @returns 처리된 문자열
 */
export function cleanString(str: string | null | undefined): string {
  if (str === null || str === undefined) {
    return '';
  }
  return str.trim();
}

/**
 * 문자열 내의 HTML 특수 문자를 이스케이프 처리
 * @param str 처리할 문자열
 * @returns 이스케이프 처리된 문자열
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * 리스트 타입이 변경되었는지 확인
 * @param prevType 이전 리스트 타입
 * @param newType 새 리스트 타입
 * @returns 타입이 변경되었는지 여부
 */
export function isListTypeChanged(prevType: ListType, newType: ListType): boolean {
  // 둘 다 null이면 변화 없음
  if (prevType === null && newType === null) {
    return false;
  }
  
  // 둘 중 하나만 null이면 변화 있음
  if (prevType === null || newType === null) {
    return true;
  }
  
  // 두 타입 모두 리스트이지만 다른 종류인 경우 변화 있음
  return prevType !== newType;
}

/**
 * 단어 수 계산 (간단한 구현)
 * @param text 텍스트
 * @returns 단어 수
 */
export function countWords(text: string): number {
  // HTML 태그 제거
  const plainText = text.replace(/<[^>]*>/g, ' ');
  
  // 공백을 기준으로 단어 분리하여 빈 문자열 제외하고 계산
  return plainText.split(/\s+/).filter(word => word.length > 0).length;
} 