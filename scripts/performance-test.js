/**
 * 성능 테스트 스크립트
 * 
 * 이 스크립트는 API 엔드포인트의 성능을 테스트하여 응답 시간과 처리량을 측정합니다.
 * 
 * 사용법:
 * node scripts/performance-test.js
 * 
 * 선택적 환경 변수:
 * - BASE_URL: 테스트할 API의 기본 URL (기본값: http://localhost:3000)
 * - CONCURRENCY: 동시 요청 수 (기본값: 10)
 * - REQUESTS: 각 테스트별 총 요청 수 (기본값: 100)
 * - VERBOSE: 자세한 출력 여부 (기본값: false)
 * 
 * 예시:
 * BASE_URL=http://localhost:3000 CONCURRENCY=20 REQUESTS=200 node scripts/performance-test.js
 */

const http = require('http');
const https = require('https');
const { performance, PerformanceObserver } = require('perf_hooks');

// 환경 변수 설정
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const CONCURRENCY = parseInt(process.env.CONCURRENCY || '10');
const REQUESTS = parseInt(process.env.REQUESTS || '100');
const VERBOSE = process.env.VERBOSE === 'true';

// 성능 관찰자 설정
const perfObserver = new PerformanceObserver((items) => {
  items.getEntries().forEach((entry) => {
    if (VERBOSE) {
      console.log(`${entry.name}: ${entry.duration.toFixed(2)}ms`);
    }
  });
});
perfObserver.observe({ entryTypes: ['measure'], buffered: true });

// 테스트할 API 엔드포인트 목록
const endpoints = [
  { name: '포스트 목록', path: '/api/posts' },
  { name: '포스트 목록 (인기순)', path: '/api/posts?sortBy=views&sortOrder=desc' },
  { name: '포스트 목록 (카테고리 필터)', path: '/api/posts?category=crypto-morning' },
  { name: '카테고리 통계', path: '/api/stats/categories' },
];

// HTTP/HTTPS 요청 함수
function makeRequest(endpoint) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint.path, BASE_URL);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const startTime = performance.now();
    const req = client.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        performance.mark(`${endpoint.name}-end`);
        performance.measure(endpoint.name, `${endpoint.name}-start`, `${endpoint.name}-end`);
        
        resolve({
          statusCode: res.statusCode,
          duration,
          contentLength: Buffer.byteLength(data, 'utf8')
        });
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    performance.mark(`${endpoint.name}-start`);
  });
}

// 동시 요청 함수
async function runConcurrentRequests(endpoint, concurrency, totalRequests) {
  let completed = 0;
  let results = [];
  let activeRequests = 0;
  
  return new Promise((resolve) => {
    function startRequest() {
      if (completed >= totalRequests) {
        if (activeRequests === 0) {
          resolve(results);
        }
        return;
      }
      
      activeRequests++;
      completed++;
      
      makeRequest(endpoint)
        .then(result => {
          results.push(result);
          activeRequests--;
          startRequest();
        })
        .catch(err => {
          console.error(`오류 (${endpoint.name}):`, err.message);
          results.push({ error: err.message, duration: 0 });
          activeRequests--;
          startRequest();
        });
    }
    
    // 초기 동시 요청 시작
    for (let i = 0; i < Math.min(concurrency, totalRequests); i++) {
      startRequest();
    }
  });
}

// 테스트 결과 표시 함수
function displayResults(endpoint, results) {
  const successfulRequests = results.filter(r => r.statusCode === 200);
  const durations = successfulRequests.map(r => r.duration);
  
  const minDuration = Math.min(...durations);
  const maxDuration = Math.max(...durations);
  const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
  const p95Duration = durations.sort((a, b) => a - b)[Math.floor(durations.length * 0.95)];
  
  const totalBytes = successfulRequests.reduce((sum, r) => sum + r.contentLength, 0);
  const successRate = (successfulRequests.length / results.length) * 100;
  
  console.log(`\n--- ${endpoint.name} (${endpoint.path}) ---`);
  console.log(`총 요청: ${results.length}, 성공: ${successfulRequests.length} (${successRate.toFixed(1)}%)`);
  console.log(`응답 시간: min=${minDuration.toFixed(2)}ms, max=${maxDuration.toFixed(2)}ms, avg=${avgDuration.toFixed(2)}ms, p95=${p95Duration.toFixed(2)}ms`);
  console.log(`처리량: ${(successfulRequests.length / (maxDuration / 1000)).toFixed(2)} req/s`);
  console.log(`총 전송 데이터: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
}

// 메인 테스트 함수
async function runTests() {
  console.log(`성능 테스트 시작`);
  console.log(`기본 URL: ${BASE_URL}`);
  console.log(`동시 요청 수: ${CONCURRENCY}`);
  console.log(`각 테스트별 총 요청 수: ${REQUESTS}`);
  
  const startTime = performance.now();
  
  for (const endpoint of endpoints) {
    console.log(`\n테스트 중: ${endpoint.name} (${endpoint.path})`);
    
    const results = await runConcurrentRequests(endpoint, CONCURRENCY, REQUESTS);
    displayResults(endpoint, results);
    
    // 다음 테스트 전에 잠시 쉬기
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  const endTime = performance.now();
  const totalDuration = (endTime - startTime) / 1000;
  
  console.log(`\n모든 테스트 완료 (총 소요 시간: ${totalDuration.toFixed(2)}초)`);
}

// 테스트 실행
runTests().catch(err => {
  console.error('테스트 실행 중 오류 발생:', err);
  process.exit(1);
});