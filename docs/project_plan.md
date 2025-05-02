# 완료된 개발 작업 기록

## UI 버그 픽스
- CategoryTabs.tsx 파일의 style 속성 충돌 문제 해결 – 완료 2025-05-02 KST
- CSS background/backgroundSize 충돌 오류 수정: background 대신 backgroundImage 사용 – 완료 2025-05-02 KST

## Notion API 및 캐시 구조 개선
- Notion API 순환 참조 제거 및 캐시·API 레이어 분리 (client.ts, transformer.ts, api.ts, cache.ts, index.ts)
- transformer.ts로 데이터 변환(pageToPost) 분리 및 모듈화
- 캐시 레이어 직접 API 호출 및 TTL(Time-To-Live) 최적화

## 로깅 시스템 구현
- Winston 기반 로거 설정 및 logs/api.log, logs/ssr.log, logs/client.log 기록
- API 로깅 미들웨어 및 클라이언트 오류 로깅 유틸리티 구현
- 로그 수집 API 엔드포인트(/api/log) 구현

## 블로그 기능 개발 및 버그 수정
- PostCard, PostsList, PostDetail, PostHeader, PostFooter, PostSidebar, PostComments 컴포넌트 구현
- RelatedPosts 컴포넌트: 썸네일 URL 유효성 검사 및 카테고리별 기본 이미지 지원
- PostsList 및 ArchiveWidget 필터링·페이지네이션 로직 구현 및 오류 수정
- 상세 페이지 무한 루프 문제 해결: 카테고리 스타일 로직 분리 및 조회수 UI 코드 완전 제거 – 완료 2024-06-18 13:30 KST

## 조회수 기능 제거
- 서버 사이드 /api/views 라우트 및 관련 함수 제거 – 완료 2024-06-17 16:25 KST
- 프론트엔드 조회수 UI 및 ViewCounterWrapper/ViewCounter 컴포넌트 제거 – 완료 2024-06-17 16:30 KST
- Post 타입에서 views 필드 제거 – 완료 2025-05-02 KST
- PostCard 및 PostHeader 컴포넌트의 조회수 표시 UI 코드 제거 – 완료 2025-05-02 KST
- 관리자 페이지의 views 모니터링 페이지 제거 – 완료 2025-05-02 KST
- API 라우트 views 폴더 제거 – 완료 2025-05-02 KST
- RecentPosts 컴포넌트 조회수 표시 및 인기 기능 제거 – 완료 2025-05-02 KST
- RelatedPosts 컴포넌트 조회수 표시 제거 – 완료 2025-05-02 KST
- 메인 페이지(app/page.tsx)에서 조회수 및 인기 기능 제거 – 완료 2025-05-02 KST
- 인기 게시물 카드(PostCard.tsx) 조회수 및 인기 표시 제거 – 완료 2025-05-02 KST
- blog/[slug]/page.tsx에서 조회수 관련 UI 코드 완전 제거 – 완료 2024-06-18 13:15 KST

## 카테고리 시스템 개선
- 카테고리 타입 통합 및 NavCategoryId 컨텍스트 구현
- CategoryNav, CategoryTabsWithNavigation, CategoryTabs 컴포넌트 업데이트
- 카테고리 스타일 관련 로직 분리: src/config/categories.ts 유틸리티 파일로 이동 – 완료 2024-06-18 13:00 KST

## UI/스타일 개선
- Contact 페이지 UI 정리 및 메시지 전송 기능 구현
- 메인 배너 및 뉴스레터 섹션 이벤트 로깅, 반응형 디자인 최적화
- Notion 블록 렌더링 로직 개선 (이미지 처리, 들여쓰기, 커스텀 블록 지원)

## 배포 및 최적화
- Next.js 15 및 React 19 호환성 설정 (next.config.js experimental)
- - Next.js experimental 옵션(serverComponentsExternalPackages → serverExternalPackages, reactRoot·webpackDevMiddleware 제거) 수정 – 완료 2024-06-17 16:00 KST
- 개발 서버 자동 포트 할당 스크립트(dev.js) 및 배포 설정
- 리소스별 캐시(TTL) 최적화 및 logs 폴더 HMR 감시 제외 설정
- - RelatedPosts 컴포넌트 dynamic import(ssr: false) 적용 – 완료 2024-06-17 16:15 KST
- RelatedPostsWrapper 컴포넌트 생성 및 page.tsx import 수정 – 완료 2024-06-17 16:20 KST
- blog/[slug]/page.tsx에서 RelatedPostsWrapper 정적 import 및 JSX 변경 적용 – 완료 2024-06-17 16:45 KST
- getRelatedPosts 함수 환경별 로깅 최적화 (개발 환경에서만 로깅) – 완료 2024-06-18 13:20 KST