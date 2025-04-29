# Notion 통합 설정 가이드

이 가이드는 블로그에서 Notion 데이터베이스를 사용하기 위한 설정 방법을 안내합니다.

## 1. Notion 통합(Integration) 생성하기

1. [Notion 개발자 페이지](https://www.notion.so/my-integrations)에 접속합니다.
2. "새 통합 생성" 또는 "Create new integration" 버튼을 클릭합니다.
3. 통합의 이름을 입력합니다 (예: "내 블로그").
4. 연결할 워크스페이스를 선택합니다.
5. 필요한 기능(Capabilities)을 선택합니다:
   - Content Capabilities: Read, Update, Insert 모두 선택
   - User Capabilities: Read 선택
6. 생성 버튼을 클릭합니다.
7. 생성된 "내부 통합 토큰(Internal Integration Token)"을 복사합니다. 이것이 `NOTION_API_KEY` 값입니다.

## 2. 데이터베이스 연결하기

1. Notion에서 블로그 글을 저장할 데이터베이스 페이지로 이동합니다.
2. 페이지의 오른쪽 상단 '...' 메뉴를 클릭한 후 "연결(Connections)" 메뉴를 선택합니다.
3. 방금 생성한 통합을 찾아 연결합니다.

## 3. 데이터베이스 ID 찾기

1. 데이터베이스가 있는 Notion 페이지를 웹 브라우저에서 열고 URL을 확인합니다.
2. URL이 다음과 같은 형식일 것입니다:
   ```
   https://www.notion.so/workspace-name/databaseID?v=...
   ```
   또는
   ```
   https://www.notion.so/databaseID?v=...
   ```
3. 여기서 `databaseID` 부분이 필요한 값입니다. 
   - 일반적으로 32자리 문자열로, 하이픈으로 구분된 형태입니다 (예: `40b0edd0-4036-43e4-bc96-70f90982f049`).
   - URL에서 하이픈을 포함한 전체 ID를 복사합니다.

## 4. 환경 변수 설정하기

1. 프로젝트의 루트 디렉토리에 `.env.local` 파일이 있는지 확인합니다.
2. 다음 변수들을 추가합니다:

```
NOTION_API_KEY=your_integration_token_here
NOTION_DATABASE_ID=your_database_id_here
```

3. 각각의 변수에 앞에서 복사한 토큰과 데이터베이스 ID를 붙여넣습니다.

## 5. 데이터베이스 구조 요구사항

블로그 포스트 데이터베이스에는 다음 속성(properties)들이 있어야 합니다:

- `Title` (제목): 타입 `title`
- `Slug` (URL 경로): 타입 `rich_text`
- `Content` (내용): 타입 `rich_text` 또는 실제 페이지 내용
- `Excerpt` (발췌): 타입 `rich_text`
- `Category` (카테고리): 타입 `select`
- `Date` (날짜): 타입 `date`
- `Published` (발행 여부): 타입 `checkbox`
- `Featured` (특별 게시물): 타입 `checkbox` (선택사항)
- `Tags` (태그): 타입 `multi_select` (선택사항)
- `Author` (작성자): 타입 `select` 또는 `relation` (선택사항)

## 6. 연결 테스트하기

설정이 완료되면 다음 명령어로 연결을 테스트할 수 있습니다:

```bash
node scripts/check-notion.js
```

성공적으로 연결되면 데이터베이스의 속성과 몇 개의 예시 게시물을 볼 수 있습니다.

## 문제 해결

### 데이터베이스를 찾을 수 없음 오류

다음과 같은 오류가 발생하는 경우:
```
Could not find database with ID: ... Make sure the relevant pages and databases are shared with your integration.
```

1. 데이터베이스 ID가 정확히 복사되었는지 확인합니다.
2. 데이터베이스 페이지와 통합이 제대로 연결되었는지 확인합니다.
3. Notion 페이지에서 우측 상단의 '...' → '연결' 메뉴에서 통합이 추가되어 있어야 합니다.

### API 키 인증 오류

다음과 같은 오류가 발생하는 경우:
```
API token is invalid
```

1. 올바른 API 키를 `.env.local` 파일에 설정했는지 확인합니다.
2. API 키를 복사할 때 앞뒤 공백이 포함되지 않았는지 확인합니다. 