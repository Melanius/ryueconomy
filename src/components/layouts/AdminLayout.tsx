'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

// 네비게이션 링크 컴포넌트
interface NavLinkProps {
  href: string;
  currentPath: string | null;
  children: ReactNode;
}

function NavLink({ href, currentPath, children }: NavLinkProps) {
  const isActive = currentPath === href || 
                  (href !== '/' && currentPath?.startsWith(href));
  
  return (
    <Link
      href={href}
      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
        isActive
          ? 'border-blue-500 text-gray-900'
          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
      }`}
    >
      {children}
    </Link>
  );
}

// 모바일 네비게이션 링크 컴포넌트
interface MobileNavLinkProps {
  href: string;
  currentPath: string | null;
  children: ReactNode;
  onClick: () => void;
}

function MobileNavLink({ href, currentPath, children, onClick }: MobileNavLinkProps) {
  const isActive = currentPath === href || 
                  (href !== '/' && currentPath?.startsWith(href));
  
  return (
    <Link
      href={href}
      className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
        isActive
          ? 'bg-blue-50 border-blue-500 text-blue-700'
          : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
      }`}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // 사이드바 토글
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  // 링크 클릭 시 사이드바 닫기
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* 상단 네비게이션 */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              {/* 모바일 메뉴 버튼 */}
              <button
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:hidden"
                onClick={toggleSidebar}
              >
                <span className="sr-only">메뉴 열기</span>
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              
              {/* 로고 */}
              <Link href="/admin" className="flex-shrink-0 flex items-center">
                <span className="text-lg font-bold text-gray-900">관리자 패널</span>
              </Link>
              
              {/* 데스크톱 네비게이션 링크 */}
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <NavLink href="/admin" currentPath={pathname}>
                  대시보드
                </NavLink>
                <NavLink href="/" currentPath={pathname}>
                  블로그 홈
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      </nav>
      
      {/* 모바일 사이드바 */}
      <div
        className={`fixed inset-0 z-40 flex transform transition-transform ease-in-out duration-300 sm:hidden ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* 반투명 배경 오버레이 */}
        <div
          className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity ${
            isSidebarOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={toggleSidebar}
        ></div>
        
        {/* 사이드바 내용 */}
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="pt-5 pb-4 px-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-lg font-bold">관리자 패널</span>
              </div>
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                onClick={toggleSidebar}
              >
                <span className="sr-only">메뉴 닫기</span>
                <svg
                  className="h-6 w-6 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            
            {/* 모바일 네비게이션 링크 */}
            <div className="mt-5">
              <nav className="px-2 space-y-1">
                <MobileNavLink
                  href="/admin"
                  currentPath={pathname}
                  onClick={closeSidebar}
                >
                  대시보드
                </MobileNavLink>
                <MobileNavLink
                  href="/"
                  currentPath={pathname}
                  onClick={closeSidebar}
                >
                  블로그 홈
                </MobileNavLink>
              </nav>
            </div>
          </div>
        </div>
      </div>
      
      {/* 메인 콘텐츠 */}
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">{title}</h1>
          
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
