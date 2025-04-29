import { BlockObjectResponse, RichTextItemResponse } from '@notionhq/client/build/src/api-endpoints';

// HTML 블록을 위한 확장 타입 정의
export interface HtmlBlockObjectResponse {
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

// 블록 렌더링 옵션
export interface RenderOptions {
  indentLevel?: number;
  sanitize?: boolean;
  depth?: number;
}

// 렌더링된 결과
export interface RenderResult {
  html: string;
  metadata?: {
    hasImages?: boolean;
    firstImageUrl?: string;
    hasCode?: boolean;
    blockCount?: number;
  };
}

// 리스트 타입 정의
export type ListType = 'bulleted_list_item' | 'numbered_list_item' | null; 