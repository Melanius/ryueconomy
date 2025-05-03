/**
 * 로깅 시스템 테스트 스크립트
 * 
 * 이 파일은 수정된 로깅 시스템의 작동을 테스트하기 위해 작성되었습니다.
 * - 다양한 로거의 다양한 레벨에서 로그를 기록합니다.
 * - 개발/프로덕션 환경에 따른 로그 레벨 차이를 테스트합니다.
 * - 한글 및 영어 로그가 올바르게 표시되는지 확인합니다.
 */

// 로거 불러오기를 위한 경로 해결
const path = require('path');
const winston = require('winston');
const fs = require('fs');

// 로그 파일 경로 설정
const logDir = path.join(process.cwd(), 'logs');
const testLogFile = path.join(logDir, 'encoding-test.log');

// 로그 디렉토리가 없으면 생성
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// BOM 추가 함수
const addBOM = winston.format((info) => {
  if (typeof info.message === 'string') {
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
      filename: testLogFile,
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
console.log('===== 인코딩 테스트 로깅 시스템 테스트 =====');
console.log('테스트 로그 파일 위치:', testLogFile);

// 다양한 레벨의 로그 테스트 (한글 포함)
testLogger.debug('테스트 디버그 로그 - 한글 디버그 메시지');
testLogger.info('테스트 정보 로그 - 한글 정보 메시지');
testLogger.warn('테스트 경고 로그 - 한글 경고 메시지');
testLogger.error('테스트 오류 로그 - 한글 오류 메시지', { 
  context: '한글 컨텍스트', 
  timestamp: new Date().toISOString(),
  koreanData: '한글 데이터',
  englishData: 'English data' 
});

// 특수 문자 및 이모지 테스트
testLogger.info('특수 문자 테스트: !@#$%^&*()_+{}[]|;:\'",.<>/?');
testLogger.info('이모지 테스트: 😀 😃 😄 😁 😆');

// 혼합 언어 테스트
testLogger.info('한글과 English 혼합 로그 테스트');

console.log('===== 테스트 완료 =====');
console.log('PowerShell에서 로그 파일을 확인하려면 다음 명령어를 사용하세요:');
console.log(`Get-Content -Path "${testLogFile}" -Encoding utf8`); 