import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { notFound } from "next/navigation";
import { getPostBySlug, getRelatedPosts } from "@/lib/notion";
import { Metadata } from "next";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { FaArrowLeft, FaRegClock, FaTag, FaEye } from "react-icons/fa";
import PostCard from "@/components/cards/PostCard";
import { getCategoryColor, getCategoryLabel } from "@/config/categories";

import { generatePostMetadata } from "@/app/metadata";
import { CategoryId } from "@/types/notion";

// 각 카테고리별 색상 정보
const categoryColors: Record<string, {main: string, light: string, dark: string}> = {
  "crypto-morning": {main: "var(--purple)", light: "var(--purple)15", dark: "var(--purple)40"},
  "invest-insight": {main: "var(--pink)", light: "var(--pink)15", dark: "var(--pink)40"},
  "portfolio": {main: "var(--orange)", light: "var(--orange)15", dark: "var(--orange)40"},
  "code-lab": {main: "var(--teal)", light: "var(--teal)15", dark: "var(--teal)40"},
  "daily": {main: "var(--green)", light: "var(--green)15", dark: "var(--green)40"}
};

// 카테고리별 스타일 가져오기
const getCategoryStyle = (category: string) => {
  return categoryColors[category] || 
    {main: "var(--blue)", light: "var(--blue)15", dark: "var(--blue)40"};
};

export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  // Next.js 15.3.1에서는 params 객체를 await 해야 함
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  const post = await getPostBySlug(id);
  
  if (!post) {
    return {
      title: "포스트를 찾을 수 없습니다",
      description: "요청하신 포스트가 존재하지 않습니다."
    };
  }

  // 포스트 메타데이터 생성
  return generatePostMetadata(
    post.title,
    post.excerpt || `${post.title}에 대한 포스트입니다.`,
    post.category,
    post.image
  );
}

export default async function PostPage(
  { params }: { params: { id: string } }
) {
  // Next.js 15.3.1에서는 params 객체를 await 해야 함
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  // 슬러그 검증
  if (!id || id.trim() === '') {
    notFound();
  }

  const post = await getPostBySlug(id);
  
  if (!post) {
    notFound();
  }

  // 카테고리가 없는 경우 기본값 설정
  const category = post.category || "daily-log";
  
  const relatedPosts = await getRelatedPosts(post.id || "", category);
  const categoryColor = getCategoryColor(category);
  const categoryStyle = getCategoryStyle(category);
  
  const headerStyle = {
    backgroundColor: `${categoryColor}15`,
    borderLeft: `4px solid ${categoryColor}`,
    boxShadow: `0 10px 25px -5px ${categoryColor}30, 0 8px 10px -6px ${categoryColor}20`,
    backgroundImage: `linear-gradient(to right, ${categoryColor}20 0%, ${categoryColor}08 100%)`
  };
  
  const contentStyle = {
    backgroundColor: 'rgba(25, 33, 52, 0.6)',
    borderLeft: `4px solid ${categoryColor}`,
    boxShadow: `0 4px 20px ${categoryColor}30`
  };
  
  const categoryName = getCategoryLabel(category);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 bg-fixed" style={{
      backgroundImage: `
        linear-gradient(to bottom right, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, La0.9)),
        url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='${categoryColor.replace("#", "%23")}' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"),
        url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23${categoryColor.substring(1)}' fill-opacity='0.07'%3E%3Cpath opacity='.5' d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
      `,
      backgroundAttachment: 'fixed',
      backgroundSize: 'auto, 60px 60px, 100px 100px',
    }}>
      <main className="container max-w-5xl mx-auto px-4 pt-6 pb-12">
        {/* 뒤로가기 버튼 */}
        <div className="mb-4 w-24">
          <Link href="/">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 px-4 py-0 text-sm rounded-full flex items-center gap-2 border border-slate-700/70 bg-slate-800/70 backdrop-blur-sm shadow-lg text-slate-300 hover:bg-slate-700 hover:text-white"
              style={{ 
                borderColor: `${categoryColor}30`
              }}
            >
              <FaArrowLeft className="h-4 w-4" />
              <span>이전</span>
            </Button>
          </Link>
        </div>
        
        {/* 포스트 헤더 */}
        <div 
          className="mb-6 p-8 rounded-xl shadow-lg border border-slate-700/50 backdrop-blur-md transition-all duration-300 hover:shadow-xl relative overflow-hidden" 
          style={{
            backgroundColor: 'rgba(25, 33, 52, 0.8)',
            borderLeft: `4px solid ${categoryColor}`
          }}
        >
          {/* 배경 장식 효과 */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
          <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full" style={{ backgroundColor: `${categoryColor}15`, filter: 'blur(40px)' }}></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-blue-500/15 blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <Badge 
                className="gap-1 px-2.5 py-1 rounded-full font-medium text-sm"
                style={{ 
                  backgroundColor: `${categoryColor}20`,
                  color: categoryColor,
                  border: `1px solid ${categoryColor}40`,
                  boxShadow: `0 2px 10px ${categoryColor}30`
                }}
              >
                <FaTag className="h-3 w-3" />
                {categoryName}
              </Badge>
              <span className="text-sm text-slate-300 flex items-center gap-1.5">
                <FaRegClock className="h-3 w-3" />
                {format(new Date(post.date), 'yyyy년 MM월 dd일', { locale: ko })}
              </span>
              <span className="text-sm text-slate-300 flex items-center gap-1.5">
                <FaEye className="h-3 w-3" />
                {(post.views || 0).toLocaleString()}
              </span>
            </div>
            
            <h1 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r"
              style={{ backgroundImage: `linear-gradient(to right, ${categoryColor}, white)` }}
            >
              {post.title}
            </h1>
            <p className="text-lg text-slate-200">{post.excerpt}</p>
            
            <div className="flex items-center mt-6 p-3 rounded-xl border border-slate-700/50 backdrop-blur-sm w-fit bg-slate-800/70">
              <Avatar className="h-10 w-10 mr-3 border-2" style={{borderColor: categoryColor}}>
                <AvatarImage src="/images/avatar.jpg" alt="작성자" />
                <AvatarFallback>RB</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-white">Ryue</p>
                <p className="text-sm text-slate-300">블로그 운영자</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* 포스트 콘텐츠 */}
        <Card className="mb-12 overflow-hidden border-0 transition-all duration-300 hover:shadow-xl rounded-xl backdrop-blur-md border border-slate-700/50 shadow-lg relative" 
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            borderLeft: `4px solid ${categoryColor}`
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r" 
            style={{ 
              backgroundImage: `linear-gradient(to right, ${categoryColor}80, ${categoryColor}20)` 
            }}
          ></div>
          
          <CardContent className="p-8 prose max-w-none prose-headings:text-slate-100 prose-a:text-blue-400 hover:prose-a:text-blue-300 prose-strong:text-white">
            <div className="text-slate-50 leading-relaxed" 
              style={{
                color: 'rgba(255, 255, 255, 0.95)'
              }}
              dangerouslySetInnerHTML={{ __html: post.content || '' }} 
            />
          </CardContent>
        </Card>
        
        {/* 관련 포스트 */}
        {relatedPosts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 pl-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400"
              style={{ borderLeft: `3px solid ${categoryColor}` }}
            >
              관련 포스트
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map(relatedPost => (
                <PostCard key={relatedPost.id} post={relatedPost} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 