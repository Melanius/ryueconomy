import sanitizeHtml from 'sanitize-html';

// 허용할 HTML 태그 목록
const ALLOWED_TAGS = [
  'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
  'table', 'tr', 'td', 'th', 'thead', 'tbody',
  'a', 'strong', 'em', 'b', 'i', 'u', 'strike', 'del',
  'figure', 'figcaption', 'img', 'iframe', 'video', 'audio',
  'details', 'summary', 'br', 'hr',
];

// 허용할 HTML 속성 목록
const ALLOWED_ATTRS = {
  '*': ['class', 'id', 'data-*'],
  a: ['href', 'target', 'rel'],
  img: ['src', 'alt', 'title', 'loading', 'class'],
  iframe: ['src', 'frameborder', 'allowfullscreen', 'allow', 'loading', 'class', 'width', 'height'],
  video: ['src', 'controls', 'class', 'preload', 'width', 'height'],
  figure: ['class'],
  figcaption: ['class'],
  div: ['class', 'data-*', 'data-color'],
  pre: ['class'],
  code: ['class'],
  span: ['class', 'style'],
};

/**
 * HTML 문자열 정제 함수
 * XSS 방지 및 안전한 HTML 생성을 위해 사용
 */
export function sanitizeHtmlContent(html: string, options?: sanitizeHtml.IOptions): string {
  if (!html) return '';
  
  console.log(`[sanitizeHtml] HTML 정제 시작 (길이: ${html.length})`);
  
  // 기본 옵션에 사용자 옵션 병합
  const sanitizeOptions: sanitizeHtml.IOptions = {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRS,
    transformTags: {
      'a': (tagName, attribs) => {
        // 외부 링크에 보안 속성 추가
        if (attribs.href && !attribs.href.startsWith('/') && !attribs.href.startsWith('#')) {
          return {
            tagName,
            attribs: {
              ...attribs,
              target: '_blank',
              rel: 'noopener noreferrer',
            },
          };
        }
        return { tagName, attribs };
      },
    },
    ...options,
  };

  // HTML 정제 실행
  const sanitized = sanitizeHtml(html, sanitizeOptions);
  
  console.log(`[sanitizeHtml] HTML 정제 완료 (결과 길이: ${sanitized.length})`);
  return sanitized;
}

/**
 * HTML 태그 균형을 맞추는 함수
 * - 열리는 태그와 닫히는 태그의 균형 확인
 * - 불균형한 태그 제거 또는 추가
 */
export function balanceHtmlTags(html: string): string {
  console.log('[balanceHtmlTags] 태그 균형 검사 시작');
  
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
    if (!ALLOWED_TAGS.includes(tagName) && !selfClosingTags.includes(tagName)) {
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
        console.log(`[balanceHtmlTags] 불균형 닫는 태그 발견: ${fullTag}`);
      } else if (tagStack[tagStack.length - 1] !== tagName) {
        // 마지막 여는 태그와 일치하지 않는 닫는 태그 (불균형)
        imbalancedTags.push({tag: tagName, isOpening: false});
        console.log(`[balanceHtmlTags] 일치하지 않는 닫는 태그: ${fullTag}, 예상: ${tagStack[tagStack.length - 1]}`);
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
    console.log(`[balanceHtmlTags] 닫히지 않은 태그 발견: ${unclosedTag}`);
  }
  
  // 불균형 태그 처리
  if (imbalancedTags.length > 0) {
    console.log(`[balanceHtmlTags] ${imbalancedTags.length}개의 불균형 태그 발견, 처리 중...`);
    
    // 독립적인 닫는 태그 제거 (열리지 않은 태그)
    imbalancedTags.filter(item => !item.isOpening).forEach(item => {
      const closingTagPattern = new RegExp(`</${item.tag}[^>]*>`, 'g');
      processedHtml = processedHtml.replace(closingTagPattern, '');
      console.log(`[balanceHtmlTags] 불균형 닫는 태그 제거: ${item.tag}`);
    });
    
    // 특별 처리: 특정 태그에 대해서만 닫는 태그 추가 (필요한 경우)
    const importantTags = ['div', 'figure', 'table', 'ul', 'ol'];
    imbalancedTags.filter(item => item.isOpening && importantTags.includes(item.tag)).forEach(item => {
      processedHtml += `</${item.tag}>`;
      console.log(`[balanceHtmlTags] 닫는 태그 추가: ${item.tag}`);
    });
  }
  
  return processedHtml;
}

/**
 * HTML 문자열에서 고아 태그(여는 태그 없이 닫는 태그만 있는) 제거
 */
export function removeOrphanedClosingTags(html: string, tagName: string): string {
  console.log(`[removeOrphanedClosingTags] '${tagName}' 고아 태그 제거 시작`);
  
  // 태그 카운트를 위한 정규식 패턴
  const openTagPattern = new RegExp(`<${tagName}[^>]*>`, 'g');
  const closeTagPattern = new RegExp(`</${tagName}\\s*>`, 'g');
  
  // 여는 태그와 닫는 태그 카운트
  const openMatches = html.match(openTagPattern) || [];
  const closeMatches = html.match(closeTagPattern) || [];
  
  const openCount = openMatches.length;
  const closeCount = closeMatches.length;
  
  console.log(`[removeOrphanedClosingTags] 태그 균형: ${openCount}개 여는 태그, ${closeCount}개 닫는 태그`);
  
  if (closeCount > openCount) {
    console.log(`[removeOrphanedClosingTags] ${closeCount - openCount}개의 고아 닫는 태그 발견, 제거 중...`);
    
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
    
    console.log(`[removeOrphanedClosingTags] ${foundIndices.length}개의 고아 태그 제거 완료`);
    return processedHtml;
  }
  
  // 균형이 맞는 경우 원래 HTML 반환
  return html;
} 