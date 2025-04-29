"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // 페이지 로드 시 현재 테마 상태 확인
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else if (prefersDark) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    }
  }, []);

  // 테마 변경 함수
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    
    // HTML 요소에 dark 클래스 토글
    document.documentElement.classList.toggle("dark");
    
    // 로컬 스토리지에 테마 저장
    localStorage.setItem("theme", newTheme);
    
    // 커스텀 이벤트 발생
    window.dispatchEvent(new CustomEvent('themeChange', { detail: { theme: newTheme } }));
    
    // 콘솔에 테마 변경 로그
    console.log(`🎨 테마 변경: ${newTheme} 모드로 전환됨`);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={theme === "light" ? "다크 모드로 전환" : "라이트 모드로 전환"}
      title={theme === "light" ? "다크 모드로 전환" : "라이트 모드로 전환"}
      className="h-9 w-9 rounded-full"
    >
      {theme === "light" ? (
        <MoonIcon className="h-5 w-5" />
      ) : (
        <SunIcon className="h-5 w-5" />
      )}
      <span className="sr-only">
        {theme === "light" ? "다크 모드로 전환" : "라이트 모드로 전환"}
      </span>
    </Button>
  );
}
