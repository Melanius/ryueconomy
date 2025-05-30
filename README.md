# 류이코노미 (RyuEconomy) 블로그

Next.js와 Notion API를 활용한 개인 블로그 프로젝트입니다.

## 기능

- Notion API를 통한 콘텐츠 관리
- 카테고리별 글 분류
- 반응형 디자인
- 마크다운 지원
- 포스트 조회수 추적

## 기술 스택

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- Notion API

## 시작하기

### 필수 사항

- Node.js 18.0.0 이상
- Notion API 키 및 데이터베이스 ID

### 설치

1. 레포지토리 클론

```bash
git clone https://github.com/yourusername/ryue-blog.git
cd ryue-blog
```

2. 의존성 설치

```bash
npm install
```

3. `.env.local` 파일 설정

```
NOTION_API_KEY=your_notion_api_key_here
NOTION_DATABASE_ID=your_notion_database_id_here
```

4. 개발 서버 실행

```bash
npm run dev
```

## Notion 데이터베이스 설정

1. Notion에서 새 데이터베이스 생성
2. 다음 속성들을 추가:
   - `Title` (제목): 포스트 제목
   - `Excerpt` (발췌): 포스트 요약
   - `Category` (카테고리): Select 타입 (crypto-morning, invest-insight, real-portfolio, code-lab, daily-log)
   - `Date` (날짜): Date 타입
   - `Views` (조회수): Number 타입
   - `Slug` (슬러그): Text 타입
   - `Published` (발행 여부): Checkbox 타입

3. Notion 통합 생성:
   - [Notion Developers](https://developers.notion.com)에서 새 통합 생성
   - 통합 토큰을 `.env.local` 파일의 `NOTION_API_KEY`에 입력
   - 데이터베이스 ID를 `.env.local` 파일의 `NOTION_DATABASE_ID`에 입력
   - 데이터베이스에 통합을 공유하여 접근 권한 부여

## 카테고리 시스템

블로그는 다음과 같은 카테고리 시스템을 사용합니다:

- `crypto-morning`: 크립토 모닝 브리핑 및 암호화폐 시장 정보
- `invest-insight`: 투자 분석 및 인사이트
- `real-portfolio`: 실전 포트폴리오 관리 및 성과 분석
- `code-lab`: 개발 관련 정보 및 튜토리얼
- `daily-log`: 일상 기록 및 생각

### 카테고리 마이그레이션

기존 카테고리를 새 시스템으로 마이그레이션하려면:

```bash
# 마이그레이션 스크립트 실행
npm run migrate-categories
```

이 스크립트는 다음 카테고리 매핑을 사용하여 변환합니다:
- 투자/금융 관련 (`investment`, `finance`, `stock`, `trading` 등) → `invest-insight`
- 크립토 관련 (`crypto`, `blockchain`, `bitcoin` 등) → `crypto-morning`
- 포트폴리오 관련 (`portfolio`, `project`, `work` 등) → `real-portfolio`
- 개발 관련 (`development`, `programming`, `coding` 등) → `code-lab`
- 일상 관련 (`daily`, `life`, `thoughts` 등) → `daily-log`

## 로깅 시스템

블로그는 다음 위치에 로그 파일을 생성합니다:
- `logs/api.log`: API 요청/응답 로깅
- `logs/ssr.log`: 서버 사이드 렌더링 오류 로깅
- `logs/client.log`: 클라이언트 사이드 에러 로깅
- `logs/app.log`: 애플리케이션 일반 로깅
- `logs/notion.log`: Notion API 관련 로깅

### 로그 관리

로그 파일 초기화 및 테스트를 위한 스크립트가 제공됩니다:

```bash
# 로그 파일 초기화 (기존 로그는 backup 폴더로 이동)
npm run logs:reset

# 로깅 시스템 테스트
npm run logs:test

# 앱 로거 테스트 (한글 포함)
npm run logs:app-test
```

### PowerShell에서 로그 읽기

Windows PowerShell에서 로그 파일의 한글을 올바르게 표시하려면 다음 명령어를 사용하세요:

```powershell
# UTF-8 인코딩으로 로그 파일 읽기
Get-Content -Path "logs/app.log" -Encoding utf8
```

### 개발/프로덕션 환경의 로깅 레벨

- 개발 환경: 디버그(debug) 레벨 이상의 모든 로그 기록
- 프로덕션 환경: 정보(info) 또는 경고(warn) 레벨 이상의 로그만 기록
  - `api.log`: warn 이상 (프로덕션에서)
  - `notion.log`: warn 이상 (프로덕션에서)
  - `app.log`: info 이상 (프로덕션에서)
  - `ssr.log`, `client.log`: error 레벨만 기록

## 라이선스

MIT
#   r y u e c o n o m y 
 
 