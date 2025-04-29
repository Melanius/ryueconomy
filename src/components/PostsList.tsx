"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Post } from "@/types/post";
import Link from "next/link";
import { EyeIcon } from "@heroicons/react/24/outline";
import { HiDocumentText } from "react-icons/hi";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { getCategoryColor, getCategoryLabel, getCategoryIcon } from "@/config/categories";
import { NavCategoryId } from "@/contexts/GlobalStateContext";
import React from "react";
import ArchiveWidget from "@/components/layout/ArchiveWidget";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface PostsListProps {
  posts: Post[];
  activeCategory: string;
  initialPage?: number;
}

export default function PostsList({ posts, activeCategory, initialPage = 1 }: PostsListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(initialPage);
  
  // 아카이브 필터링 상태
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  // 컴포넌트 마운트/언마운트 로깅
  useEffect(() => {
    console.log("PostsList: 컴포넌트 마운트", { activeCategory, postsCount: posts.length });
    
    return () => {
      console.log("PostsList: 컴포넌트 언마운트");
    };
  }, [activeCategory, posts.length]);
  
  // 카테고리로 필터링된 게시물
  const filteredByCategory = useMemo(() => {
    console.log("PostsList: 카테고리 필터링 실행", { activeCategory, postsCount: posts.length });
    const filtered = activeCategory === 'all' 
      ? posts 
      : posts.filter(post => post.category === activeCategory);
    console.log("PostsList: 카테고리 필터링 결과", { filteredCount: filtered.length });
    return filtered;
  }, [posts, activeCategory]);
  
  // 아카이브 필터링 적용 (연도, 월)
  const filteredPosts = useMemo(() => {
    if (!selectedYear) return filteredByCategory;
    
    console.log("PostsList: 아카이브 필터링 실행", { selectedYear, selectedMonth });
    
    const filtered = filteredByCategory.filter(post => {
      if (!post.date) return false;
      
      const dateParts = post.date.split(/[-\.]/);
      if (dateParts.length < 2) return false;
      
      const year = dateParts[0];
      const month = dateParts[1];
      
      if (selectedYear && year !== selectedYear) return false;
      if (selectedMonth && month !== selectedMonth) return false;
      
      return true;
    });
    
    console.log("PostsList: 아카이브 필터링 결과", { filteredCount: filtered.length });
    return filtered;
  }, [filteredByCategory, selectedYear, selectedMonth]);
  
  // 페이지네이션 계산
  const postsPerPage = 5;
  const totalPosts = filteredPosts.length;
  const totalPages = Math.ceil(totalPosts / postsPerPage);
  
  // 현재 페이지의 게시물 계산
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  
  // 페이지 번호 생성
  const pageNumbers = useMemo(() => {
    const numbers = [];
    for (let i = 1; i <= totalPages; i++) {
      numbers.push(i);
    }
    return numbers;
  }, [totalPages]);
  
  // URL 파라미터에서 페이지 정보 가져오기
  useEffect(() => {
    const pageFromParams = searchParams.get('page');
    if (pageFromParams) {
      const pageNumber = parseInt(pageFromParams);
      console.log("PostsList: URL에서 페이지 로드", { pageNumber });
      setCurrentPage(pageNumber);
    } else {
      setCurrentPage(1);
    }
  }, [searchParams]);
  
  // 카테고리가 변경되면 페이지 및 아카이브 필터 초기화
  useEffect(() => {
    console.log("PostsList: 카테고리 변경 감지", { activeCategory });
    setCurrentPage(1);
    setSelectedYear(null);
    setSelectedMonth(null);
  }, [activeCategory]);
  
  // 페이지 변경 시 URL 업데이트
  const handlePageChange = useCallback((pageNumber: number) => {
    console.log("PostsList: 페이지 변경", { pageNumber, prevPage: currentPage });
    
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', pageNumber.toString());
    
    if (selectedYear) {
      params.set('year', selectedYear);
      
      if (selectedMonth) {
        params.set('month', selectedMonth);
      } else {
        params.delete('month');
      }
    } else {
      params.delete('year');
      params.delete('month');
    }
    
    router.push(`?${params.toString()}`);
    setCurrentPage(pageNumber);
  }, [searchParams, router, currentPage, selectedYear, selectedMonth]);
  
  // 아카이브 선택 처리
  const handleArchiveSelect = useCallback((year: string | null, month: string | null) => {
    console.log("PostsList: 아카이브 선택", { year, month });
    
    setSelectedYear(year);
    setSelectedMonth(month);
    setCurrentPage(1);
    
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1');
    
    if (year) {
      params.set('year', year);
      
      if (month) {
        params.set('month', month);
      } else {
        params.delete('month');
      }
    } else {
      params.delete('year');
      params.delete('month');
    }
    
    router.push(`?${params.toString()}`);
  }, [searchParams, router]);
  
  // 아카이브 타이틀 생성
  const getArchiveTitle = useCallback(() => {
    if (!selectedYear) return "";
    
    if (selectedMonth) {
      const monthNames: Record<string, string> = {
        "01": "1월", "02": "2월", "03": "3월", "04": "4월", 
        "05": "5월", "06": "6월", "07": "7월", "08": "8월",
        "09": "9월", "10": "10월", "11": "11월", "12": "12월"
      };
      return `${selectedYear}년 ${monthNames[selectedMonth] || `${selectedMonth}월`}`;
    }
    
    return `${selectedYear}년`;
  }, [selectedYear, selectedMonth]);
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* 사이드바 - 아카이브 (모바일에서는 숨김) */}
        <div className="hidden md:block md:col-span-1">
          <ArchiveWidget
            posts={posts}
            categoryId={activeCategory}
          />
        </div>
        
        {/* 메인 콘텐츠 - 게시물 목록 */}
        <div className="col-span-1 md:col-span-3">
          <div className="rounded-xl p-6 bg-slate-800/60 backdrop-blur-md shadow-lg border border-blue-500/20 space-y-6 relative overflow-hidden">
            {/* 배경 장식 효과 */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
            <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-blue-500/10 blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-purple-500/10 blur-3xl"></div>
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-700/50 relative z-10">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-lg bg-blue-900/50 border border-blue-500/30 shadow-inner"
                  style={{ 
                    boxShadow: `0 2px 10px ${getCategoryColor(activeCategory as NavCategoryId)}40, inset 0 1px 2px rgba(255,255,255,0.1)` 
                  }}
                >
                  {activeCategory === 'all' ? (
                    <HiDocumentText 
                      className="h-6 w-6 text-blue-400" 
                    />
                  ) : (
                    React.createElement(getCategoryIcon(activeCategory as NavCategoryId), {
                      className: "h-6 w-6",
                      style: { color: getCategoryColor(activeCategory as NavCategoryId) }
                    })
                  )}
                </span>
                <div>
                  <h2 
                    className="text-2xl font-display font-bold tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
                  >
                    {activeCategory === 'all' ? '전체 게시글' : `${getCategoryLabel(activeCategory as NavCategoryId)} 게시글`}
                  </h2>
                  {selectedYear && (
                    <div className="text-sm text-slate-400 mt-1">
                      {selectedYear}년 {selectedMonth ? `${selectedMonth}월` : ''}의 게시글
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 아카이브 필터 타이틀 */}
            {selectedYear && (
              <div className="mb-4 p-4 bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-700/50 shadow-inner">
                <h2 className="text-lg font-bold text-white">
                  {getArchiveTitle()} 아카이브
                </h2>
                <p className="text-sm text-slate-400">
                  총 {filteredPosts.length}개의 게시물이 있습니다.
                </p>
              </div>
            )}

            {/* 게시글 목록 헤더 - 모바일에서는 숨김 */}
            <div className="hidden md:grid md:grid-cols-12 gap-4 text-sm font-medium text-slate-400 px-4 py-2">
              <div className="md:col-span-2 text-center">날짜</div>
              <div className="md:col-span-1 text-center">썸네일</div>
              <div className="md:col-span-2 text-center">카테고리</div>
              <div className="md:col-span-6 text-left">제목</div>
              <div className="md:col-span-1 text-center">조회</div>
            </div>

            {/* 게시글 목록 */}
            {currentPosts.length > 0 ? (
              <div className="space-y-2 relative z-10">
                {currentPosts.map((post) => (
                  <Link 
                    key={post.id} 
                    href={`/post/${post.slug}`} 
                    className="block"
                  >
                    <div className="flex flex-col md:grid md:grid-cols-12 gap-2 md:gap-4 p-3 md:p-4 rounded-lg border border-slate-700/50 hover:shadow-md transition-all hover:bg-slate-700/30 hover:border-blue-500/30 bg-slate-800/40">
                      {/* 모바일 뷰 */}
                      <div className="md:hidden flex items-start">
                        {/* 모바일용 썸네일 */}
                        {post.image ? (
                          <div className="w-14 h-14 flex-shrink-0 rounded-md overflow-hidden mr-3 border border-slate-700/50">
                            <img 
                              src={post.image} 
                              alt={`${post.title} 썸네일`} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-14 h-14 flex-shrink-0 rounded-md bg-slate-700/30 flex items-center justify-center mr-3 border border-slate-700/50">
                            <HiDocumentText className="h-5 w-5" style={{ color: getCategoryColor(post.category as NavCategoryId) }} />
                          </div>
                        )}
                        
                        {/* 모바일 콘텐츠 영역 */}
                        <div className="flex-1 flex flex-col min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-[10px] text-slate-400 truncate mr-2">{post.date}</span>
                            <span 
                              className="text-[10px] font-medium px-1.5 py-0.5 rounded-full truncate"
                              style={{
                                backgroundColor: `${getCategoryColor(post.category as NavCategoryId)}20`,
                                color: getCategoryColor(post.category as NavCategoryId),
                                border: `1px solid ${getCategoryColor(post.category as NavCategoryId)}30`
                              }}
                            >
                              {getCategoryLabel(post.category as NavCategoryId)}
                            </span>
                          </div>
                          
                          <h3 className="font-medium text-sm leading-tight line-clamp-2 text-white hover:text-blue-400 transition-colors">
                            {post.title}
                          </h3>
                          
                          <div className="flex justify-end mt-0.5">
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <EyeIcon className="h-2.5 w-2.5" />
                              {post.views}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* 데스크톱 뷰 - 날짜 */}
                      <div className="hidden md:flex md:col-span-2 text-xs text-slate-400 self-center whitespace-nowrap justify-center items-center">
                        {post.date}
                      </div>
                      
                      {/* 썸네일 이미지 */}
                      <div className="hidden md:flex md:col-span-1 self-center justify-center items-center">
                        {post.image ? (
                          <div className="w-14 h-10 rounded-md overflow-hidden border border-slate-700/50">
                            <img 
                              src={post.image} 
                              alt={`${post.title} 썸네일`} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-14 h-10 rounded-md bg-slate-700/30 flex items-center justify-center border border-slate-700/50">
                            <HiDocumentText className="h-5 w-5" style={{ color: getCategoryColor(post.category as NavCategoryId) }} />
                          </div>
                        )}
                      </div>
                      
                      {/* 카테고리 */}
                      <div className="hidden md:flex md:col-span-2 self-center justify-center items-center">
                        <span 
                          className="text-xs font-medium px-2 py-0.5 rounded-full truncate max-w-full"
                          style={{
                            backgroundColor: `${getCategoryColor(post.category as NavCategoryId)}20`,
                            color: getCategoryColor(post.category as NavCategoryId),
                            border: `1px solid ${getCategoryColor(post.category as NavCategoryId)}30`
                          }}
                        >
                          {getCategoryLabel(post.category as NavCategoryId)}
                        </span>
                      </div>
                      
                      {/* 제목 영역 - 데스크톱 */}
                      <div className="hidden md:block md:col-span-6 self-center text-left">
                        <h3 className="font-medium text-white hover:text-blue-400 transition-colors">
                          {post.title}
                        </h3>
                      </div>
                      
                      {/* 데스크톱 뷰 - 조회수 */}
                      <div className="hidden md:flex md:col-span-1 text-center text-xs text-slate-400 self-center justify-center items-center">
                        {post.views}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <p className="text-slate-400">
                  {selectedYear 
                    ? `${selectedYear}년 ${selectedMonth ? `${selectedMonth}월의 ` : ''}게시물이 없습니다.` 
                    : '게시물이 없습니다.'
                  }
                </p>
              </div>
            )}
            
            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8 space-x-2 relative z-10">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="border-slate-700 bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-300"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                
                {pageNumbers.map((number) => (
                  <Button
                    key={number}
                    variant={currentPage === number ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(number)}
                    className={currentPage === number 
                      ? "bg-blue-600 hover:bg-blue-700 text-white" 
                      : "border-slate-700 bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-300"}
                  >
                    {number}
                  </Button>
                ))}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="border-slate-700 bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-300"
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            {/* 페이지 정보 표시 */}
            {totalPosts > 0 && (
              <div className="text-center text-xs text-slate-500 mt-4 relative z-10">
                총 {totalPosts}개 중 {indexOfFirstPost + 1}-{Math.min(indexOfLastPost, totalPosts)}개 표시
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 