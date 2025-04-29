import winston from 'winston';
import path from 'path';

// 로그 파일 경로 설정
const logDir = path.join(process.cwd(), 'logs');

// 공통 로깅 포맷 함수 
const customFormatter = winston.format.printf(({ level, message, timestamp, ...meta }) => {
  // 메시지가 문자열이 아니거나 undefined인 경우 처리
  let formattedMessage = '';
  if (typeof message === 'string') {
    formattedMessage = message;
  } else if (message === undefined) {
    formattedMessage = '';
  } else {
    // 객체나 배열 등을 JSON으로 변환
    try {
      formattedMessage = JSON.stringify(message);
    } catch (error) {
      formattedMessage = '[로깅 불가능한 객체]';
    }
  }

  // 메타데이터 처리
  let metaStr = '';
  if (Object.keys(meta).length > 0) {
    try {
      metaStr = JSON.stringify(meta);
    } catch (error) {
      metaStr = '[직렬화 불가능한 메타데이터]';
    }
  }

  // 최종 로그 메시지 구성
  return JSON.stringify({
    level,
    message: formattedMessage,
    timestamp,
    ...(metaStr ? { meta: metaStr } : {})
  });
});

// 공통 로그 형식 설정
const commonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  customFormatter
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

// 안전한 로깅 헬퍼 함수 - 개선된 안전 메커니즘
export const safeLog = (logger: any, level: string, message: any, meta?: any) => {
  // 메시지 문자열 확인 및 변환
  let safeMessage: string;
  
  // 메시지가 문자열인지 확인하고 변환
  try {
    if (typeof message === 'string') {
      safeMessage = message;
    } else if (message === null || message === undefined) {
      safeMessage = '[로그 메시지 없음]';
    } else if (typeof message === 'object') {
      try {
        safeMessage = JSON.stringify(message);
      } catch (jsonError) {
        safeMessage = `[직렬화 불가 객체: ${typeof message}]`;
      }
    } else {
      safeMessage = String(message);
    }
  } catch (e) {
    safeMessage = '[로그 메시지 처리 오류]';
    console.error('로그 메시지 처리 중 오류:', e);
  }
  
  // 메타데이터 안전하게 처리
  let safeMeta: any = undefined;
  if (meta !== undefined) {
    try {
      if (typeof meta === 'object' && meta !== null) {
        // 객체를 직접 전달하는 대신 문자열화된 버전 사용
        safeMeta = { data: JSON.stringify(meta) };
      } else {
        safeMeta = { data: String(meta) };
      }
    } catch (e) {
      safeMeta = { error: '메타데이터 처리 불가' };
      console.error('로그 메타데이터 처리 중 오류:', e);
    }
  }
  
  // 로깅 시도
  try {
    // 직접 로그 레벨 메서드 호출 (log 메서드 우회)
    if (safeMeta) {
      // @ts-ignore - 동적 호출
      if (typeof logger[level] === 'function') {
        // @ts-ignore - 동적 호출
        logger[level](safeMessage, safeMeta);
      } else {
        console.error(`로거에 '${level}' 메서드가 없습니다`);
        console.log(`[${level.toUpperCase()}] ${safeMessage}`, safeMeta);
      }
    } else {
      // @ts-ignore - 동적 호출
      if (typeof logger[level] === 'function') {
        // @ts-ignore - 동적 호출
        logger[level](safeMessage);
      } else {
        console.error(`로거에 '${level}' 메서드가 없습니다`);
        console.log(`[${level.toUpperCase()}] ${safeMessage}`);
      }
    }
  } catch (error) {
    console.error(`로깅 오류 (${level}):`, error);
    // 로깅 실패 시 콘솔에 출력
    console.log(`[${level.toUpperCase()}] ${safeMessage}`, safeMeta || '');
  }
};

// 노션 로거용 간편 함수 - 개선된 안전한 로깅 처리
export const notionLog = {
  info: (message: any, meta?: any) => {
    // winston에 직접 전달하기 전에 메시지 확인 및 변환
    const safeMessage = typeof message === 'string' ? message : JSON.stringify(message);
    try {
      if (meta) {
        notionLogger.info(safeMessage, meta);
      } else {
        notionLogger.info(safeMessage);
      }
    } catch (error) {
      console.error('노션 로깅 오류 (info):', error);
      // 긴급 대안: 콘솔에만 출력
      console.info(`[NOTION INFO] ${safeMessage}`);
    }
  },
  error: (message: any, meta?: any) => {
    const safeMessage = typeof message === 'string' ? message : JSON.stringify(message);
    try {
      if (meta) {
        notionLogger.error(safeMessage, meta);
      } else {
        notionLogger.error(safeMessage);
      }
    } catch (error) {
      console.error('노션 로깅 오류 (error):', error);
      console.error(`[NOTION ERROR] ${safeMessage}`);
    }
  },
  warn: (message: any, meta?: any) => {
    const safeMessage = typeof message === 'string' ? message : JSON.stringify(message);
    try {
      if (meta) {
        notionLogger.warn(safeMessage, meta);
      } else {
        notionLogger.warn(safeMessage);
      }
    } catch (error) {
      console.error('노션 로깅 오류 (warn):', error);
      console.warn(`[NOTION WARN] ${safeMessage}`);
    }
  },
  debug: (message: any, meta?: any) => {
    const safeMessage = typeof message === 'string' ? message : JSON.stringify(message);
    try {
      if (meta) {
        notionLogger.debug(safeMessage, meta);
      } else {
        notionLogger.debug(safeMessage);
      }
    } catch (error) {
      console.error('노션 로깅 오류 (debug):', error);
      console.debug(`[NOTION DEBUG] ${safeMessage}`);
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
