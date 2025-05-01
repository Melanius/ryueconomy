# Notion Webhook 설정 가이드

이 문서는 Notion API Webhook을 설정하고 블로그와 연동하는 방법을 설명합니다.

## 개요

Notion Webhook은 Notion 데이터베이스나 페이지의 변경 사항을 실시간으로 감지하여 외부 애플리케이션(이 경우 블로그)에 알려주는 기능입니다. 이를 통해 Notion 데이터베이스가 업데이트되면 블로그의 캐시를 자동으로 무효화하고 최신 컨텐츠를 표시할 수 있습니다.

## 필요 사항

1. Notion API 토큰
2. Notion 데이터베이스 ID
3. 공개 접근 가능한 웹훅 엔드포인트 URL
4. 웹훅 시크릿 키 (보안용)

## 설정 단계

### 1. 환경 변수 설정

`.env.local` 파일에 다음 환경 변수를 추가합니다:

```
NOTION_WEBHOOK_SECRET=your_webhook_secret_here
```

웹훅 시크릿은 임의의 복잡한 문자열이어야 합니다. 다음 명령으로 생성할 수 있습니다:

```bash
openssl rand -base64 32
```

### 2. Notion API 통합에 웹훅 설정

1. [Notion 개발자 포털](https://developers.notion.com/)에 로그인합니다.
2. 통합(Integration)을 선택하고 "Capabilities" 섹션으로 이동합니다.
3. "Webhooks" 기능을 활성화합니다.
4. 웹훅 엔드포인트 URL을 입력합니다:
   - 개발 환경: ngrok 등을 사용하여 로컬 서버를 임시로 공개 URL로 노출
   - 프로덕션 환경: `https://yourdomain.com/api/notion-webhook`

### 3. 웹훅 등록

Notion API를 사용하여 웹훅을 등록합니다. 다음은 curl을 사용한 예시입니다:

```bash
curl -X POST 'https://api.notion.com/v1/webhooks' \
  -H 'Authorization: Bearer YOUR_NOTION_API_KEY' \
  -H 'Content-Type: application/json' \
  -H 'Notion-Version: 2022-06-28' \
  -d '{
    "database_id": "YOUR_DATABASE_ID",
    "url": "https://yourdomain.com/api/notion-webhook",
    "secret": "YOUR_WEBHOOK_SECRET"
  }'
```

### 4. 웹훅 확인

웹훅 등록 후 다음 명령어로 등록된 웹훅 목록을 확인할 수 있습니다:

```bash
curl -X GET 'https://api.notion.com/v1/webhooks' \
  -H 'Authorization: Bearer YOUR_NOTION_API_KEY' \
  -H 'Notion-Version: 2022-06-28'
```

## 웹훅 이벤트 유형

Notion은 다음과 같은 이벤트 유형을 지원합니다:

- `page.created`: 새 페이지가 생성될 때
- `page.updated`: 페이지가 업데이트될 때
- `page.deleted`: 페이지가 삭제될 때
- `block.created`: 블록이 생성될 때
- `block.updated`: 블록이 업데이트될 때
- `block.deleted`: 블록이 삭제될 때
- `database.updated`: 데이터베이스가 업데이트될 때

## 테스트 방법

1. Notion 데이터베이스에서 블로그 포스트를 수정합니다.
2. 서버 로그에서 웹훅 수신 및 처리 내용을 확인합니다.
3. 블로그에서 변경 사항이 반영되었는지 확인합니다.

## 문제 해결

1. **웹훅이 수신되지 않는 경우**
   - 웹훅 URL이 공개적으로 접근 가능한지 확인
   - Notion API 키와 권한 설정 확인
   - 서버 방화벽 설정 확인

2. **인증 오류**
   - 환경 변수 `NOTION_WEBHOOK_SECRET`이 올바르게 설정되었는지 확인
   - Notion에 등록한 시크릿과 서버의 시크릿이 일치하는지 확인

3. **캐시 무효화가 작동하지 않는 경우**
   - 로그를 확인하여 캐시 무효화 함수가 호출되는지 확인
   - 캐시 키 패턴이 올바른지 확인

## 보안 고려 사항

1. 웹훅 URL은 HTTPS를 사용하여 암호화된 통신을 보장해야 합니다.
2. 웹훇 시크릿은 안전하게 보관하고 정기적으로 변경해야 합니다.
3. 웹훅 요청의 시그니처를 검증하여 Notion에서 온 정당한 요청인지 확인해야 합니다.

## 추가 리소스

- [Notion API 웹훅 문서](https://developers.notion.com/reference/webhooks)
- [Notion API 인증 가이드](https://developers.notion.com/docs/authorization) 