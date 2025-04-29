import Link from "next/link";
import { Card } from "@/components/ui/card";
import { notFound } from "next/navigation";
import { getPostBySlug, getAllPosts, BlogPost } from "@/utils/notion";
import { getPageContentAndThumbnail } from '@/lib/notion/blocks';
import type { Metadata, ResolvingMetadata } from "next";


// 각 카테고리별 색상 정보 (src/config/categories.tsx와 일치)
const categoryColors: Record<string, {main: string, light: string, dark: string}> = {
  "crypto-morning": {main: "#E03E3E", light: "rgba(224, 62, 62, 0.15)", dark: "rgba(224, 62, 62, 0.4)"},
  "invest-insight": {main: "#FF9F43", light: "rgba(255, 159, 67, 0.15)", dark: "rgba(255, 159, 67, 0.4)"},
  "real-portfolio": {main: "#0B6BCB", light: "rgba(11, 107, 203, 0.15)", dark: "rgba(11, 107, 203, 0.4)"},
  "code-lab": {main: "#0F9D58", light: "rgba(15, 157, 88, 0.15)", dark: "rgba(15, 157, 88, 0.4)"},
  "daily-log": {main: "#F5C400", light: "rgba(245, 196, 0, 0.15)", dark: "rgba(245, 196, 0, 0.4)"}
};

// 카테고리별 스타일 가져오기
const getCategoryStyle = (category: string) => {
  return categoryColors[category] || 
    {main: "#4361ee", light: "rgba(67, 97, 238, 0.15)", dark: "rgba(67, 97, 238, 0.4)"};
};

// 카테고리명 가져오기
const getCategoryName = (category: string): string => {
  const categoryMap: Record<string, string> = {
    "crypto-morning": "크립토 모닝",
    "invest-insight": "투자 인사이트",
    "real-portfolio": "실전 포트폴리오",
    "code-lab": "코드 랩",
    "daily-log": "일상 기록"
  };
  
  return categoryMap[category] || category;
};

export async function generateStaticParams() {
  const posts = await getAllPosts();
  
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

// Next.js 15에 맞게 수정된 metadata 생성 함수
export async function generateMetadata(
  props: { params: { slug: string } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  // 비동기 params 처리
  const { params } = props;
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
  // 부모 메타데이터 가져오기
  const parentMetadata = await parent;
  
  try {
    const post = await getPostBySlug(slug);
    
    if (!post) {
      return {
        title: '포스트를 찾을 수 없습니다 - 류이코노미 (RyuEcomomy)',
        description: '요청하신 포스트를 찾을 수 없습니다.',
      };
    }
    
    // 메타데이터 구성
    return {
      title: `${post.title} - 류이코노미 (RyuEcomomy)`,
      description: post.excerpt || post.title,
      openGraph: {
        title: post.title,
        description: post.excerpt || post.title,
        images: post.image ? [post.image] : undefined,
        type: 'article',
      }
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: '오류 발생 - 류이코노미 (RyuEcomomy)',
      description: '메타데이터를 생성하는 중 오류가 발생했습니다.',
    };
  }
}

// 관련 게시물 가져오기 (같은 카테고리의 다른 게시물)
const getRelatedPosts = async (currentSlug: string, category: string) => {
  const allPosts = await getAllPosts();
  return allPosts
    .filter(post => post.slug !== currentSlug && post.category === category)
    .slice(0, 3); // 최대 3개까지만 표시
};

// 블로그 포스트 페이지
export default async function BlogPostPage(props: { params: { slug: string } }) {
  // 비동기 params 처리
  const { params } = props;
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
  try {
    const post = await getPostBySlug(slug);
    
    if (!post) {
      notFound();
    }
    
    // Notion 블록을 직접 HTML로 변환 (단일 함수 사용)
    const { content } = await getPageContentAndThumbnail(post.id);
    
    const relatedPosts = await getRelatedPosts(slug, post.category);
    const categoryStyle = getCategoryStyle(post.category);
    
    // 날짜 형식 변환
    const formattedDate = new Date(post.date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    
    return (
      <div className="pb-16">
        {/* 포스트 헤더 */}
        <div 
          className="py-12 shadow-sm" 
          style={{
            background: `linear-gradient(135deg, ${categoryStyle.dark}, ${categoryStyle.light})`
          }}
        >
          <div className="container max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden relative">
              <div 
                className="absolute top-0 left-0 w-full h-1" 
                style={{ background: `linear-gradient(to right, ${categoryStyle.main}, transparent)` }}
              ></div>
              <div className="p-6 sm:p-8 text-center">
                <div className="flex items-center text-sm text-muted-foreground gap-4 mb-4 justify-center">
                  <span className="font-display font-medium">{formattedDate}</span>
                  <Link href={`/category/${post.category}`}>
                    <span 
                      className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold font-display category-badge"
                      style={{ 
                        backgroundColor: `${categoryStyle.light}`, 
                        color: categoryStyle.main
                      }}
                    >
                      {getCategoryName(post.category)}
                    </span>
                  </Link>

                </div>
                <h1 
                  className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-5"
                  style={{ color: `${categoryStyle.main}` }}
                >
                  {post.title}
                </h1>
                {post.excerpt !== "" && (
                  <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">{post.excerpt}</p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* 포스트 내용 */}
        <article className="py-8">
          <div className="container max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden relative">
              <div 
                className="absolute top-0 left-0 w-full h-1" 
                style={{ background: `linear-gradient(to right, ${categoryStyle.main}, transparent)` }}
              ></div>
              <div className="p-6 sm:p-8"
                  style={{ background: `linear-gradient(to bottom, white, ${categoryStyle.light}05)` }}>
                {/* Notion 블록 렌더링 결과 */}
                <div 
                  className="notion-content" 
                  style={{ whiteSpace: 'normal', display: 'flex', flexDirection: 'column', gap: '0.75em' }} 
                  dangerouslySetInnerHTML={{ __html: content }} 
                />
              </div>
            </div>
          </div>
        </article>
        
        {/* 관련 게시물 */}
        {relatedPosts.length > 0 && (
          <section className="container max-w-4xl mx-auto py-8 border-t">
            <h2 className="text-2xl font-display font-bold tracking-tight mb-6 gradient-text">관련 게시물</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link href={`/blog/${relatedPost.slug}`} key={relatedPost.id}>
                  <Card className="h-full overflow-hidden transition-all border card-hover-effect">
                    <div 
                      className="h-32" 
                      style={{
                        background: `linear-gradient(135deg, ${getCategoryStyle(relatedPost.category).dark}, ${getCategoryStyle(relatedPost.category).light})`
                      }}
                    ></div>
                    <div className="bg-white">
                      <div 
                        className="p-4 border-b"
                        style={{
                          background: `linear-gradient(to right, ${getCategoryStyle(relatedPost.category).light}, white)`
                        }}
                      >
                        <div className="flex items-center text-sm text-muted-foreground gap-4 mb-2">
                          <span className="font-medium font-display">
                            {new Date(relatedPost.date).toLocaleDateString('ko-KR', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                            })}
                          </span>
                        </div>
                        <h3 
                          className="font-display font-bold text-lg line-clamp-2"
                          style={{ color: getCategoryStyle(relatedPost.category).main }}
                        >
                          {relatedPost.title}
                        </h3>
                      </div>
                      <div className="p-4">
                        {relatedPost.excerpt !== "" && (
                          <p className="text-sm line-clamp-2 text-gray-700">{relatedPost.excerpt}</p>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  } catch (error) {
    console.error('Error rendering blog post:', error);
    notFound();
  }
}