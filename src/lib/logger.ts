import winston from 'winston';
import path from 'path';

// 로그 파일 경로 설정
const logDir = path.join(process.cwd(), 'logs');

// 안전한 로깅 포맷 함수 - 에러 처리 강화
const safeFormatter = winston.format.printf(({ level, message, timestamp, ...meta }) => {
  try {
    // 메시지가 문자열이 아니거나 undefined인 경우 안전하게 변환
    let formattedMessage = '';
    
    if (typeof message === 'string') {
      formattedMessage = message;
    } else if (message === undefined || message === null) {
      formattedMessage = '';
    } else {
      // 객체, 배열 등을 안전하게 JSON으로 변환
      try {
        formattedMessage = JSON.stringify(message);
      } catch (error) {
        formattedMessage = '[직렬화 불가능한 객체]';
      }
    }
    
    // 메타데이터 처리 - 직렬화 오류 방지
    let metaInfo = {};
    if (Object.keys(meta).length > 0) {
      try {
        // 각 메타데이터 항목을 안전하게 문자열로 변환
        Object.keys(meta).forEach(key => {
          try {
            if (meta[key] instanceof Error) {
              metaInfo[key] = {
                message: meta[key].message,
                stack: meta[key].stack
              };
            } else if (typeof meta[key] === 'object' && meta[key] !== null) {
              metaInfo[key] = JSON.stringify(meta[key]);
            } else {
              metaInfo[key] = meta[key];
            }
          } catch (err) {
            metaInfo[key] = '[직렬화 불가능한 메타데이터]';
          }
        });
      } catch (error) {
        metaInfo = { error: '[메타데이터 처리 오류]' };
      }
    }
    
    // 최종 로그 메시지 반환
    return `[${timestamp}] [${level}]: ${formattedMessage} ${
      Object.keys(metaInfo).length > 0 ? JSON.stringify(metaInfo) : ''
    }`;
  } catch (error) {
    // 로깅 과정에서 오류 발생 시 기본 메시지 반환
    return `[${timestamp}] [${level}]: [로깅 처리 오류] 원본 메시지 직렬화 실패`;
  }
});

// 공통 로그 형식 설정
const commonFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  safeFormatter
);

// API 로거 설정
export const apiLogger = winston.createLogger({
  level: 'info',
  format: commonFormat,
  transports: [
    new winston.transports.File({ 
      filename: path.join(logDir, 'api.log'),
      level: 'info'
    })
  ]
});

// SSR 로거 설정
export const ssrLogger = winston.createLogger({
  level: 'error',
  format: commonFormat,
  transports: [
    new winston.transports.File({ 
      filename: path.join(logDir, 'ssr.log'),
      level: 'error'
    })
  ]
});

// 클라이언트 로거 설정 (서버에서 클라이언트 로그를 저장하기 위한 설정)
export const clientLogger = winston.createLogger({
  level: 'error',
  format: commonFormat,
  transports: [
    new winston.transports.File({ 
      filename: path.join(logDir, 'client.log'),
      level: 'error'
    })
  ]
});

// 노션 블록 처리 로거 설정
export const notionLogger = winston.createLogger({
  level: 'info',
  format: commonFormat,
  transports: [
    new winston.transports.File({ 
      filename: path.join(logDir, 'notion.log'),
      level: 'info'
    })
  ]
});

// 일반 로거 (다양한 용도에 사용 가능)
export const logger = winston.createLogger({
  level: 'info',
  format: commonFormat,
  transports: [
    new winston.transports.File({ 
      filename: path.join(logDir, 'app.log'),
      level: 'info'
    })
  ]
});

// 노션 로거용 간편 함수 - 에러 처리 강화 및 안전한 로깅
export const notionLog = {
  info: (message: any, meta?: any) => {
    try {
      // 메시지 안전 처리
      const safeMessage = typeof message === 'string' ? message : 
                          message === undefined || message === null ? '[메시지 없음]' : 
                          JSON.stringify(message);
      
      if (meta) {
        notionLogger.info(safeMessage, meta);
      } else {
        notionLogger.info(safeMessage);
      }
    } catch (error) {
      // 로깅 실패 시 콘솔에 출력
      console.info(`[NOTION INFO] 로깅 실패: ${typeof message === 'string' ? message : '[직렬화 불가능한 메시지]'}`);
      console.error('로깅 오류:', error);
    }
  },
  
  error: (message: any, meta?: any) => {
    try {
      // 에러 객체 특별 처리
      let safeMessage = '';
      if (message instanceof Error) {
        safeMessage = `에러: ${message.message}`;
        // meta가 없으면 새로 생성, 있으면 stack 추가
        meta = meta ? { ...meta, stack: message.stack } : { stack: message.stack };
      } else {
        safeMessage = typeof message === 'string' ? message : 
                      message === undefined || message === null ? '[메시지 없음]' : 
                      JSON.stringify(message);
      }
      
      if (meta) {
        notionLogger.error(safeMessage, meta);
      } else {
        notionLogger.error(safeMessage);
      }
    } catch (error) {
      console.error(`[NOTION ERROR] 로깅 실패: ${typeof message === 'string' ? message : '[직렬화 불가능한 메시지]'}`);
      console.error('로깅 오류:', error);
    }
  },
  
  warn: (message: any, meta?: any) => {
    try {
      const safeMessage = typeof message === 'string' ? message : 
                          message === undefined || message === null ? '[메시지 없음]' : 
                          JSON.stringify(message);
      
      if (meta) {
        notionLogger.warn(safeMessage, meta);
      } else {
        notionLogger.warn(safeMessage);
      }
    } catch (error) {
      console.warn(`[NOTION WARN] 로깅 실패: ${typeof message === 'string' ? message : '[직렬화 불가능한 메시지]'}`);
      console.error('로깅 오류:', error);
    }
  },
  
  debug: (message: any, meta?: any) => {
    try {
      const safeMessage = typeof message === 'string' ? message : 
                          message === undefined || message === null ? '[메시지 없음]' : 
                          JSON.stringify(message);
      
      if (meta) {
        notionLogger.debug(safeMessage, meta);
      } else {
        notionLogger.debug(safeMessage);
      }
    } catch (error) {
      console.debug(`[NOTION DEBUG] 로깅 실패: ${typeof message === 'string' ? message : '[직렬화 불가능한 메시지]'}`);
      console.error('로깅 오류:', error);
    }
  }
};

// 개발 환경에서는 콘솔에도 로그 출력
if (process.env.NODE_ENV !== 'production') {
  const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  );

  [apiLogger, ssrLogger, clientLogger, notionLogger, logger].forEach(loggerInstance => {
    loggerInstance.add(new winston.transports.Console({
      format: consoleFormat
    }));
  });
}
