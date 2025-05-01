const { chromium } = require('playwright');

(async () => {
  console.log('브라우저를 시작합니다...');
  const browser = await chromium.launch({ headless: false });
  console.log('새 페이지를 엽니다...');
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('Google로 이동합니다...');
  await page.goto('https://www.google.com');
  console.log('페이지 제목:', await page.title());
  
  // 스크린샷 찍기
  await page.screenshot({ path: 'screenshot.png' });
  console.log('스크린샷을 저장했습니다: screenshot.png');
  
  // 5초 기다림
  console.log('5초 동안 기다립니다...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  console.log('브라우저를 종료합니다...');
  await browser.close();
  console.log('테스트 완료!');
})().catch(err => {
  console.error('에러 발생:', err);
  process.exit(1);
});
