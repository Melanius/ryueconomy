
## 서버 PC에 배포하기 위한 제안사항

1. **서버 환경 구성**
   - **Node.js 설치**: Next.js 15.x와 호환되는 최신 Node.js LTS 버전(18.x 이상) 설치
   - **PM2 설치**: 프로세스 매니저로 PM2를 사용하여 애플리케이션 관리 및 무중단 운영 (`npm install -g pm2`)
   - **Nginx 설치**: 웹 서버 및 리버스 프록시로 사용

2. **도메인 설정**
   - 구매한 도메인의 DNS A 레코드를 서버 PC의 IP 주소로 설정
   - 필요한 경우 www 서브도메인 설정 (CNAME 또는 추가 A 레코드)

3. **SSL/TLS 인증서 설치**
   - Let's Encrypt를 통해 무료 SSL 인증서 발급 및 설치
   - Certbot 도구를 사용하여 인증서 자동 갱신 설정
   - Nginx SSL 설정 (https 지원)

4. **배포 프로세스**
   - **소스 코드 설치**: Git을 통해 서버에 코드 클론 또는 압축 파일npx kill-port 3001로 전송
   - **의존성 설치**: `npm install --production` 명령으로 프로덕션 의존성만 설치
   - **빌드**: `npm run build` 명령으로 프로덕션 빌드 생성
   - **실행**: 다음 두 가지 방법 중 선택
     - 옵션 1: PM2로 `npm start` 실행 (`pm2 start npm --name "ryue-blog" -- start`)
     - 옵션 2: standalone 모드로 빌드된 출력물 직접 실행

5. **서버 설정 예시**
   - **Nginx 설정 파일 (예시)**:
   ```
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;

       # HTTP to HTTPS redirect
       location / {
           return 301 https://$host$request_uri;
       }
   }

   server {
       listen 443 ssl http2;
       server_name yourdomain.com www.yourdomain.com;

       ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
       ssl_protocols TLSv1.2 TLSv1.3;
       ssl_prefer_server_ciphers on;
       ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256...';

       # Security headers
       add_header X-Content-Type-Options nosniff;
       add_header X-Frame-Options DENY;
       add_header X-XSS-Protection "1; mode=block";
       add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

       # Static files caching
       location /_next/static/ {
           alias /path/to/your/project/.next/static/;
           expires 365d;
           add_header Cache-Control "public, max-age=31536000, immutable";
       }

       location /public/ {
           alias /path/to/your/project/public/;
           expires 7d;
           add_header Cache-Control "public, max-age=604800";
       }

       # Proxy to Next.js server
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

6. **자동화된 배포 구성 (CI/CD)**
   - 간단한 배포 스크립트 생성 (예: deploy.sh):
   ```bash
   #!/bin/bash
   
   # 저장소에서 최신 코드 가져오기
   git pull
   
   # 의존성 설치
   npm install --production
   
   # 빌드
   npm run build
   
   # 서비스 재시작
   pm2 restart ryue-blog
   ```

7. **백업 및 유지보수 계획**
   - 정기적인 데이터 백업 설정 (logs 폴더, .env 파일 등)
   - 로그 로테이션 설정으로 디스크 공간 관리
   - 서버 모니터링 도구 설치 (예: PM2 모니터링, 간단한 서버 모니터링 스크립트)

8. **데이터베이스 연결 확인**
   - Notion API 연결이 서버 환경에서도 올바르게 작동하는지 확인
   - API 키와 같은 민감한 정보는 환경 변수(.env 파일)를 통해 관리

9. **테스트 및 모니터링**
   - 배포 후 모든 기능이 제대로 작동하는지 테스트
   - 성능 모니터링 설정 (응답 시간, 서버 리소스 사용량 등)
   - 오류 로그 모니터링 (logs 폴더의 로그 파일들 확인)

해당 구성을 사용하면 개인 서버 PC에서 안정적으로 운영할 수 있는 설정이 됩니다. 이는 고가용성 클라우드 설정보다는 단순하지만, 개인 블로그 운영에는 충분합니다. 서버 환경에 따라 세부적인 조정이 필요할 수 있으니 서버 PC의 운영체제 및 하드웨어 사양에 맞게 설정을 조정해주세요.