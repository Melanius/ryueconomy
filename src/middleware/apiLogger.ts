import { NextApiRequest, NextApiResponse } from 'next';
import { apiLogger } from '@/lib/logger';

export function withApiLogger(handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const start = Date.now();
    
    try {
      // 요청 로깅
      apiLogger.info('API Request', {
        method: req.method,
        url: req.url,
        query: req.query,
        body: req.body,
        headers: req.headers
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
      res.end = function(chunk: any) {
        const duration = Date.now() - start;
        apiLogger.info('API Response', {
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          duration: `${duration}ms`,
          response: responseBody || chunk
        });
        return originalEnd.call(this, chunk);
      };

      res.send = function(chunk: any) {
        responseBody = chunk;
        return originalSend.call(this, chunk);
      };

      await handler(req, res);
    } catch (error) {
      const duration = Date.now() - start;
      apiLogger.error('API Error', {
        method: req.method,
        url: req.url,
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  };
} 