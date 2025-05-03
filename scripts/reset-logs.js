/**
 * 로그 파일 초기화 스크립트
 * 
 * 이 스크립트는 로그 파일을 초기화하고 기존 로그 파일을 백업합니다.
 * - 기존 로그 파일을 백업 디렉토리로 이동시킵니다.
 * - 새로운 빈 로그 파일을 생성합니다.
 * - BOM이 포함된 UTF-8 인코딩으로 저장됩니다.
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

// 비동기 파일 작업을 위한 프로미스 버전
const copyFile = promisify(fs.copyFile);
const rename = promisify(fs.rename);
const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

// 경로 설정
const rootDir = process.cwd();
const logsDir = path.join(rootDir, 'logs');
const backupDir = path.join(logsDir, 'backup', new Date().toISOString().replace(/:/g, '-'));

// 로그 파일 초기화 함수
async function resetLogs() {
  try {
    console.log('로그 파일 초기화를 시작합니다...');
    
    // 로그 디렉토리 확인 및 생성
    if (!fs.existsSync(logsDir)) {
      console.log('로그 디렉토리를 생성합니다:', logsDir);
      await mkdir(logsDir, { recursive: true });
    }
    
    // 백업 디렉토리 생성
    console.log('백업 디렉토리를 생성합니다:', backupDir);
    await mkdir(backupDir, { recursive: true });
    
    // 로그 디렉토리의 모든 파일 목록 가져오기
    const files = await readdir(logsDir);
    
    // 파일만 백업 (디렉토리 제외)
    for (const file of files) {
      const filePath = path.join(logsDir, file);
      const fileStat = await stat(filePath);
      
      // 파일이고 .log로 끝나면 백업
      if (fileStat.isFile() && file.endsWith('.log')) {
        const backupPath = path.join(backupDir, file);
        console.log(`백업 중: ${file} -> ${backupPath}`);
        
        try {
          // 파일 복사 후 초기화
          await copyFile(filePath, backupPath);
        } catch (err) {
          console.error(`백업 실패: ${file}`, err);
        }
      }
    }
    
    // 기본 로그 파일 생성 (UTF-8 with BOM)
    const logFiles = [
      'app.log',
      'api.log',
      'ssr.log',
      'client.log',
      'notion.log'
    ];
    
    for (const file of logFiles) {
      const filePath = path.join(logsDir, file);
      console.log(`로그 파일 초기화: ${file}`);
      
      // UTF-8 BOM을 포함한 빈 파일 생성
      const bom = '\ufeff'; // UTF-8 BOM
      await writeFile(filePath, bom, { encoding: 'utf8' });
    }
    
    console.log('로그 파일 초기화가 완료되었습니다.');
    console.log('이제 모든 로그 파일이 UTF-8 인코딩으로 저장됩니다.');
    console.log('PowerShell에서 로그 파일을 확인하려면 다음 명령어를 사용하세요:');
    console.log(`Get-Content -Path "${path.join(logsDir, 'app.log')}" -Encoding utf8`);
    
  } catch (error) {
    console.error('로그 초기화 중 오류 발생:', error);
  }
}

// 스크립트 실행
resetLogs(); 