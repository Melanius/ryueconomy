// 클라이언트 사이드 에러 로깅을 위한 API 엔드포인트
const LOG_ENDPOINT = '/api/log';

// 에러 로그 전송 함수
async function sendErrorLog(error: any) {
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
    console.error('Error sending error log:', e);
  }
}

// 전역 에러 핸들러 설정
export function setupClientErrorLogging() {
  if (typeof window === 'undefined') return;

  // 일반적인 에러 처리
  window.onerror = function(message, source, lineno, colno, error) {
    console.error('Client Error:', { message, source, lineno, colno });
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
    console.error('Unhandled Promise Rejection:', event.reason);
    sendErrorLog({
      message: event.reason?.message || 'Unhandled Promise Rejection',
      stack: event.reason?.stack,
      name: event.reason?.name || 'UnhandledRejection'
    });
  });

  console.log('Client-side error logging has been set up');
} 