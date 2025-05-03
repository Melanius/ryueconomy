import winston from 'winston';
import path from 'path';
import fs from 'fs';

// 로그 파일 경로 설정
const logDir = path.join(process.cwd(), 'logs');

// 로그 디렉토리가 없으면 생성
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 환경 설정
const isProd = process.env.NODE_ENV === 'production';

// BOM 추가 함수
const addBOM = winston.format((info) => {
  if (typeof info.message === 'string') {
    // BOM 추가 (UTF-8 인코딩을 명시적으로 표시)
    info.message = `\uFEFF${info.message}`;
  }
  return info;
});

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
    let metaInfo: Record<string, any> = {};
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
  addBOM(),
  safeFormatter
);

// API 로거 설정
export const apiLogger = winston.createLogger({
  // 개발 환경에서는 info, 프로덕션에서는 warn 이상만 로깅
  level: isProd ? 'warn' : 'info',
  format: commonFormat,
  transports: [
    new winston.transports.File({ 
      filename: path.join(logDir, 'api.log'),
      level: isProd ? 'warn' : 'info',
      options: { encoding: 'utf8' }
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
      level: 'error',
      options: { encoding: 'utf8' }
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
      level: 'error',
      options: { encoding: 'utf8' }
    })
  ]
});

// 노션 블록 처리 로거 설정 - 레벨을 warn으로 상향 조정
export const notionLogger = winston.createLogger({
  level: isProd ? 'warn' : 'info',
  format: commonFormat,
  transports: [
    new winston.transports.File({ 
      filename: path.join(logDir, 'notion.log'),
      // 프로덕션 환경에서는 warn 이상만 로깅
      level: isProd ? 'warn' : 'info',
      options: { encoding: 'utf8' }
    })
  ]
});

// 일반 로거 (다양한 용도에 사용 가능)
export const logger = winston.createLogger({
  level: isProd ? 'info' : 'debug',
  format: commonFormat,
  transports: [
    new winston.transports.File({ 
      filename: path.join(logDir, 'app.log'),
      level: isProd ? 'info' : 'debug',
      options: { encoding: 'utf8' }
    })
  ]
});

// 노션 로거용 간편 함수 - 에러 처리 강화 및 안전한 로깅
export const notionLog = {
  info: (message: any, meta?: any) => {
    // 프로덕션 환경에서는 info 레벨 로깅 건너뛰기
    if (isProd) return;
    
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
      // 프로덕션 환경에서는 콘솔 출력 제외
      if (!isProd) {
        console.info(`[NOTION INFO] 로깅 실패: ${typeof message === 'string' ? message : '[직렬화 불가능한 메시지]'}`);
      }
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
      // 프로덕션 환경에서는 콘솔 출력 제외
      if (!isProd) {
        console.error(`[NOTION ERROR] 로깅 실패: ${typeof message === 'string' ? message : '[직렬화 불가능한 메시지]'}`);
      }
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
      // 프로덕션 환경에서는 콘솔 출력 제외
      if (!isProd) {
        console.warn(`[NOTION WARN] 로깅 실패: ${typeof message === 'string' ? message : '[직렬화 불가능한 메시지]'}`);
      }
    }
  },
  
  debug: (message: any, meta?: any) => {
    // 프로덕션 환경에서는 debug 레벨 로깅 건너뛰기
    if (isProd) return;
    
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
      // 프로덕션 환경에서는 콘솔 출력 제외
      if (!isProd) {
        console.debug(`[NOTION DEBUG] 로깅 실패: ${typeof message === 'string' ? message : '[직렬화 불가능한 메시지]'}`);
      }
    }
  }
};

// 개발 환경에서만 콘솔에 로그 출력
if (!isProd) {
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
