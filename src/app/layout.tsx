import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { validateNotionConfig } from "@/lib/notion";
import ClientLayout from "@/components/layout/ClientLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "류이코노미(RyuEconomy)의 작은 한 수",
  description: "암호화폐, 투자 정보, 포트폴리오 공유 및 개발 기록을 담은 블로그",
};

// 서버 컴포넌트에서 Notion 설정 검증 실행
validateNotionConfig().catch((err: Error) => {
  console.error('🔴 Notion 설정 검증 중 오류 발생:', err);
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <ClientLayout
        geistSansVariable={geistSans.variable}
        geistMonoVariable={geistMono.variable}
      >
        {children}
      </ClientLayout>
    </html>
  );
}
