/**
 * app.log 로거 테스트 스크립트
 * 
 * 이 스크립트는 app.log 파일에 한글 로그를 기록하는 테스트를 수행합니다.
 * - 수정된 로거를 사용하여 UTF-8 인코딩으로 로그를 기록합니다.
 * - BOM이 포함되어 PowerShell에서도 한글이 올바르게 표시됩니다.
 */

// 경로 설정
const path = require('path');
const rootDir = process.cwd();
// 올바른 경로로 로거 모듈을 가져오기
const winston = require('winston');
const fs = require('fs');

// 로그 파일 경로 설정
const logDir = path.join(rootDir, 'logs');
const logFile = path.join(logDir, 'app.log');

// BOM 추가 함수
const addBOM = winston.format((info) => {
  if (typeof info.message === 'string') {
    // BOM 추가 (UTF-8 인코딩을 명시적으로 표시)
    info.message = `\uFEFF${info.message}`;
  }
  return info;
});

// 직접 로깅 테스트를 위한 Winston 로거 생성
const testLogger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    addBOM(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: logFile,
      options: { encoding: 'utf8' }
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// 테스트 로그 기록
console.log('===== app.log 로거 테스트 시작 =====');

// 다양한 레벨의 로그 기록
testLogger.debug('앱 디버그 로그 - 한글 테스트');
testLogger.info('앱 정보 로그 - 한글 테스트');
testLogger.warn('앱 경고 로그 - 한글 테스트');
testLogger.error('앱 오류 로그 - 한글 테스트', {
  error: {
    message: '테스트 에러 객체',
    stack: new Error('테스트 에러 객체').stack
  },
  details: {
    koreanData: '한글 데이터',
    englishData: 'English data',
    mixedData: '한글과 English 혼합 데이터',
    numbers: 12345,
    boolean: true,
    specialChars: '!@#$%^&*()_+{}[]|;:\'",.<>/?',
    emoji: '😀 😃 😄 😁 😆'
  }
});

console.log('===== app.log 로거 테스트 완료 =====');
console.log('PowerShell에서 로그 파일을 확인하려면 다음 명령어를 사용하세요:');
console.log('Get-Content -Path "logs/app.log" -Encoding utf8'); 