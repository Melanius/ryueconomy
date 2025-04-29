"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // 테마 감지 및 변경사항 감지
  useEffect(() => {
    // 초기 테마 설정
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (prefersDark) {
      setTheme('dark');
    }
    
    // 테마 변경 감지
    const handleThemeChange = (e: any) => {
      if (e.detail?.theme) {
        setTheme(e.detail.theme);
      }
    };
    
    window.addEventListener('themeChange', handleThemeChange);
    
    return () => {
      window.removeEventListener('themeChange', handleThemeChange);
    };
  }, []);

  return (
    <footer className={`border-t ${theme === 'dark' ? 'border-slate-700 bg-slate-900' : 'border-gray-200 bg-background'}`}>
      <div className="container max-w-7xl mx-auto py-5 md:py-6 px-4">
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-display font-semibold gradient-text">류이코노미</h3>
          <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-muted-foreground'}`}>
            암호화폐, 투자 정보, 포트폴리오 공유 및 개발 기록을 담은 블로그입니다.
          </p>
        </div>
        <div className={`mt-4 border-t ${theme === 'dark' ? 'border-slate-700' : 'border-gray-200'} pt-3 text-center text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-muted-foreground'}`}>
          <p>
            © {currentYear} 류이코노미(RyuEconomy)의 작은 한 수. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
} 