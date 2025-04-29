// scripts/dev.js
// 사용 가능한 포트를 찾아서 Next.js 개발 서버를 실행합니다.
const { spawn } = require('child_process');
const net = require('net');

// 포트가 사용 중인지 확인하는 함수
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.once('error', () => {
      // 포트가 사용 중이면 false 반환
      resolve(false);
    });
    
    server.once('listening', () => {
      // 포트를 사용할 수 있으면 서버를 닫고 true 반환
      server.close();
      resolve(true);
    });
    
    server.listen(port);
  });
}

// 여러 포트를 확인하고 사용 가능한 첫 번째 포트를 반환
async function findAvailablePort(ports) {
  for (const port of ports) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  // 모든 포트가 사용 중인 경우 랜덤 포트 반환 (0은 자동 할당)
  return 0;
}

async function startDevServer() {
  try {
    // 포트 목록에서 사용 가능한 포트 찾기
    const port = await findAvailablePort([3000, 3001, 3002]);
    
    console.log(`Starting Next.js on port ${port === 0 ? 'random' : port}`);
    
    // Next.js 개발 서버 실행
    const nextDev = spawn('npx', ['next', 'dev', '--port', port.toString()], { 
      stdio: 'inherit',
      shell: true
    });
    
    nextDev.on('error', (err) => {
      console.error('Failed to start Next.js dev server:', err);
      process.exit(1);
    });
    
    // 프로세스 종료 시 Next.js 서버도 종료
    process.on('SIGINT', () => {
      nextDev.kill('SIGINT');
    });
    
    process.on('SIGTERM', () => {
      nextDev.kill('SIGTERM');
    });
    
  } catch (error) {
    console.error('Error starting dev server:', error);
    process.exit(1);
  }
}

startDevServer(); 