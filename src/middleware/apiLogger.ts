import { NextApiRequest, NextApiResponse } from 'next';
import { apiLogger } from '@/lib/logger';

// 민감한 헤더 목록
const SENSITIVE_HEADERS = [
  'authorization',
  'cookie',
  'set-cookie',
  'x-auth-token',
  'x-api-key',
];

// 로깅 환경 설정
const isProd = process.env.NODE_ENV === 'production';

// 헤더에서 민감 정보 제거
function sanitizeHeaders(headers: any) {
  const sanitized = { ...headers };
  Object.keys(sanitized).forEach(key => {
    if (SENSITIVE_HEADERS.includes(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
    }
  });
  return sanitized;
}

// 요청/응답 본문 최적화
function optimizeLogBody(body: any) {
  // 프로덕션 환경에서는 요약 정보만 로깅
  if (isProd && body) {
    if (typeof body === 'object') {
      // 키만 포함하고 값은 생략
      return `Object with keys: [${Object.keys(body).join(', ')}]`;
    }
    if (typeof body === 'string' && body.length > 100) {
      return `${body.substring(0, 100)}... (${body.length} characters)`;
    }
  }
  return body;
}

export function withApiLogger(handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const start = Date.now();
    const url = req.url || '';
    const method = req.method || 'UNKNOWN';
    
    try {
      // 요청 로깅 - 최적화
      apiLogger.info('API Request', {
        method,
        url,
        query: req.query,
        body: isProd ? optimizeLogBody(req.body) : req.body,
        headers: sanitizeHeaders(req.headers)
      });

      // 원본 응답 메서드들을 저장
      const originalJson = res.json;
      const originalEnd = res.end;
      const originalSend = res.send;
      let responseBody: any;

      // json 메서드 오버라이드
      res.json = function(body: any) {
        responseBody = body;
        return originalJson.call(this, body);
      };

      // 응답 전송 전에 로깅
      res.end = function(chunk: any, encoding?: any, callback?: () => void) {
        const duration = Date.now() - start;
        apiLogger.info('API Response', {
          method,
          url,
          statusCode: res.statusCode,
          duration: `${duration}ms`,
          response: isProd ? optimizeLogBody(responseBody || chunk) : (responseBody || chunk)
        });
        return originalEnd.call(this, chunk, encoding, callback);
      };

      res.send = function(chunk: any) {
        responseBody = chunk;
        return originalSend.call(this, chunk);
      };

      await handler(req, res);
    } catch (error) {
      const duration = Date.now() - start;
      apiLogger.error('API Error', {
        method,
        url,
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  };
} 