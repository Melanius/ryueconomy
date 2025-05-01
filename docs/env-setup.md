# 환경 변수 설정 가이드

이 문서는 블로그 프로젝트에 필요한 환경 변수 설정 방법을 설명합니다.

## 필수 환경 변수

프로젝트의 `.env.local` 파일에 다음 환경 변수를 설정해야 합니다:

```
# Notion API 설정
NOTION_TOKEN=your_notion_api_token
NOTION_DATABASE_ID=your_notion_database_id
NOTION_MESSAGE_DATABASE_ID=your_notion_message_database_id

# Webhook 설정
NOTION_WEBHOOK_SECRET=your_webhook_secret_key
ADMIN_API_KEY=your_admin_api_key_for_webhook_management

# 사이트 설정
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 환경 변수 설명

### Notion API 설정

- `NOTION_TOKEN`: Notion API 통합(Integration)에서 발급받은 API 토큰
- `NOTION_DATABASE_ID`: 블로그 포스트를 저장하는 Notion 데이터베이스 ID
- `NOTION_MESSAGE_DATABASE_ID`: 문의사항을 저장하는 Notion 데이터베이스 ID

### Webhook 설정

- `NOTION_WEBHOOK_SECRET`: Notion Webhook 시크릿 키 (아래 생성 방법 참조)
- `ADMIN_API_KEY`: Webhook 관리 페이지에 접근하기 위한 관리자 API 키

### 사이트 설정

- `NEXT_PUBLIC_SITE_URL`: 사이트 URL (개발 환경에서는 `http://localhost:3000` 사용)

## 안전한 시크릿 키 생성 방법

Webhook 시크릿 키와 관리자 API 키는 충분히 복잡하고 무작위로 생성되어야 합니다. 터미널에서 다음 명령어를 사용하여 안전한 키를 생성할 수 있습니다:

```bash
# Linux/macOS 환경
openssl rand -base64 32

# Windows PowerShell 환경
$bytes = New-Object Byte[] 32
$rand = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rand.GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

## 환경 변수 적용

1. 프로젝트 루트 폴더에 `.env.local` 파일 생성
2. 위 환경 변수를 파일에 추가하고 각각의 값을 설정
3. 개발 서버 재시작:
   ```bash
   npm run dev
   ```

## 주의사항

- `.env.local` 파일은 Git에 커밋하지 마세요 (기본적으로 `.gitignore`에 포함됨)
- 프로덕션 환경에서는 환경 변수를 호스팅 서비스의 설정에 직접 구성하세요
- API 키와 시크릿 값은 안전하게 보관하고, 정기적으로 갱신하는 것이 좋습니다 