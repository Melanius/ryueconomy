/**
 * 노션 블록 처리를 위한 타입 정의
 */
import { BlockObjectResponse, RichTextItemResponse } from '@notionhq/client/build/src/api-endpoints';

/**
 * HTML 블록 객체 응답 인터페이스
 */
export interface HtmlBlockObjectResponse extends Omit<BlockObjectResponse, 'type'> {
  type: 'html';
  html: {
    content: string;
  };
}

/**
 * 확장된 블록 객체 응답 타입
 * - 표준 노션 API 응답 타입에 HTML 블록 등 확장 타입 추가
 */
export type ExtendedBlockObjectResponse = BlockObjectResponse | HtmlBlockObjectResponse;

/**
 * 리스트 타입 정의
 */
export type ListType = 'bulleted_list_item' | 'numbered_list_item' | null;

/**
 * HTML 태그 명칭 타입
 */
export type HtmlTag = string;

/**
 * 페이지 블록 옵션 인터페이스
 */
export interface PageBlockOptions {
  maxDepth?: number;
  withChildren?: boolean;
  parseImages?: boolean;
}

/**
 * 노션 API 페이지 옵션
 */
export interface NotionAPIPageOptions {
  withBlocks?: boolean;
  maxBlockDepth?: number;
}

/**
 * 블록 렌더링 결과 인터페이스
 */
export interface BlockRenderResult {
  html: string;
  images: string[];
  wordCount: number;
}

/**
 * 노션 리치 텍스트의 스타일 속성 타입
 */
export interface RichTextStyle {
  bold?: boolean;
  italic?: boolean;
  strikethrough?: boolean;
  underline?: boolean;
  code?: boolean;
  color?: string;
  href?: string;
}

/**
 * 노션 리치 텍스트 항목 확장 타입
 * - 스타일 정보를 추가로 포함
 */
export type RichTextItemWithStyle = RichTextItemResponse & {
  style?: RichTextStyle;
}; 