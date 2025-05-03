// 클라이언트 사이드 에러 로깅을 위한 API 엔드포인트
const LOG_ENDPOINT = '/api/log';

// 프로덕션 환경 여부
const isProd = process.env.NODE_ENV === 'production';

// 에러 로그 전송 함수
async function sendErrorLog(error: any) {
  // 개발 환경에서는 서버로 에러를 전송하지 않음 (콘솔에만 표시)
  if (!isProd) return;
  
  try {
    const errorData = {
      message: error.message || 'Unknown error',
      stack: error.stack,
      type: error.name || 'Error',
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    await fetch(LOG_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(errorData),
    });
  } catch (e) {
    // 서버로 에러 전송 실패 시 콘솔에만 로깅 (중복 로깅 방지)
    if (!isProd) {
      console.error('Error sending error log:', e);
    }
  }
}

// 전역 에러 핸들러 설정
export function setupClientErrorLogging() {
  if (typeof window === 'undefined') return;

  // 일반적인 에러 처리
  window.onerror = function(message, source, lineno, colno, error) {
    // 개발 환경에서만 콘솔에 로깅
    if (!isProd) {
      console.error('Client Error:', { message, source, lineno, colno });
    }
    
    sendErrorLog({
      message: message,
      stack: error?.stack,
      name: error?.name || 'window.onerror',
      source,
      lineno,
      colno
    });
    return false;
  };

  // Promise 에러 처리
  window.addEventListener('unhandledrejection', function(event) {
    // 개발 환경에서만 콘솔에 로깅
    if (!isProd) {
      console.error('Unhandled Promise Rejection:', event.reason);
    }
    
    sendErrorLog({
      message: event.reason?.message || 'Unhandled Promise Rejection',
      stack: event.reason?.stack,
      name: event.reason?.name || 'UnhandledRejection'
    });
  });

  // 콘솔 출력은 개발 환경에서만 수행
  if (!isProd) {
    console.log('Client-side error logging has been set up');
  }
} 