import CategoryTabs from "@/components/layout/CategoryTabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { getAllPosts } from "@/lib/notion";
import { CalendarIcon, EyeIcon } from "@heroicons/react/24/outline";
import { notFound } from "next/navigation";
import { Post } from "@/types/post";

// 카테고리 정보
const categories = {
  all: { name: "전체", description: "모든 게시물을 확인하세요." },
  "crypto-morning": { name: "크립토모닝", description: "암호화폐 일일 아침시황" },
  "invest-insight": { name: "투자 인사이트", description: "암호화폐뿐 아니라 다양한 투자 정보 공유" },
  "real-portfolio": { name: "현실 포폴", description: "실제 투자 일지 공유" },
  "code-lab": { name: "코드랩", description: "코딩 개발하며 기록 남기기" },
  "daily-log": { name: "마이로그", description: "하루 일기 작성" },
};

// 카테고리 스타일 (색상)
const categoryColors: Record<string, string> = {
  "crypto-morning": "var(--purple)",
  "invest-insight": "var(--pink)",
  "real-portfolio": "var(--orange)",
  "code-lab": "var(--teal)",
  "daily-log": "var(--green)",
};

const getCategoryColor = (category: string): string => {
  return categoryColors[category] || "var(--blue)";
};

type Params = { id: string };

export async function generateMetadata({ params }: { params: Params }) {
  const paramsData = await params;
  const id = paramsData.id;
  
  // 유효한 카테고리 ID인지 확인
  if (!id || !['all', 'crypto-morning', 'invest-insight', 'real-portfolio', 'code-lab', 'daily-log'].includes(id)) {
    return {
      title: '카테고리를 찾을 수 없습니다 - 류이코노미 (RyuEcomomy)',
      description: '유효하지 않은 카테고리입니다.',
    };
  }
  
  const category = categories[id as keyof typeof categories];
  
  return {
    title: `${category.name} - 류이코노미 (RyuEcomomy)`,
    description: category.description,
  };
}

export default async function CategoryPage({ params }: { params: Params }) {
  const paramsData = await params;
  const categoryId = paramsData.id;
  
  // 유효한 카테고리 ID인지 확인
  if (!categoryId || !['all', 'crypto-morning', 'invest-insight', 'real-portfolio', 'code-lab', 'daily-log'].includes(categoryId)) {
    notFound();
  }
  
  const category = categories[categoryId as keyof typeof categories];
  
  // 노션에서 글 가져오기
  let posts: Post[] = [];
  try {
    posts = await getAllPosts();
    console.log(`카테고리 페이지(${categoryId}): 가져온 게시물 수:`, posts.length);
  } catch (error) {
    console.error(`카테고리 페이지(${categoryId}): 데이터 가져오기 실패:`, error);
  }
  
  // 카테고리에 해당하는 게시물만 필터링 (전체 카테고리인 경우 모든 게시물 표시)
  const filteredPosts = categoryId === 'all' 
    ? posts 
    : posts.filter(post => post.category === categoryId);
  
  // 날짜 기준으로 정렬
  const sortedPosts = filteredPosts.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="min-h-screen bg-background">
      {/* 카테고리 탭 */}
      <CategoryTabs activeCategory={categoryId} showCategorySummary={false} />
      
      {/* 카테고리 헤더 */}
      <div className="bg-gradient-to-r from-slate-100 via-white to-slate-50 py-8 md:py-10 border-b relative z-10">
        <div className="container px-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            {(() => {
              const Icon = (() => {
                switch (categoryId) {
                  case "crypto-morning": return require("react-icons/hi").HiChartBar;
                  case "invest-insight": return require("react-icons/hi").HiCurrencyDollar;
                  case "real-portfolio": return require("react-icons/hi").HiBriefcase;
                  case "code-lab": return require("react-icons/hi").HiCode;
                  case "daily-log": return require("react-icons/hi").HiPencil;
                  default: return require("react-icons/hi").HiDocumentText;
                }
              })();
              return (
                <span 
                  className="p-3 rounded-md"
                  style={{ 
                    backgroundColor: `${getCategoryColor(categoryId)}15`,
                    boxShadow: `0 2px 8px ${getCategoryColor(categoryId)}20`
                  }}
                >
                  <Icon 
                    className="h-8 w-8" 
                    style={{ color: getCategoryColor(categoryId) }}
                  />
                </span>
              );
            })()}
            <div>
              <h1 className="text-4xl font-bold tracking-tight font-display"
                  style={{ color: categoryId !== 'all' ? getCategoryColor(categoryId) : 'inherit' }}>
                {category?.name || categoryId}
              </h1>
              {category?.description && (
                <p className="text-muted-foreground mt-2 text-lg">{category.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* 게시물 목록 */}
      <section className="container py-6 px-4 max-w-7xl mx-auto relative z-10">
        <div className="p-6 bg-white/80 backdrop-blur-sm shadow-sm rounded-xl">
          <div className="grid grid-cols-1 gap-6">
            {sortedPosts.length > 0 ? (
              sortedPosts.map((post) => (
                <article
                  key={post.slug}
                  className="flex flex-col space-y-2.5 border rounded-lg bg-white shadow hover:shadow-md transition px-4 py-6"
                >
                  <Link href={`/post/${post.slug}`}>
                    <span className="text-xs font-medium flex items-center justify-start">
                      <span
                        className="mr-2 h-2 w-2 rounded-full"
                        style={{ backgroundColor: getCategoryColor(post.category) }}
                      />
                      {categories[post.category as keyof typeof categories]?.name || post.category}
                      <span className="text-muted-foreground mx-2">·</span>
                      <span className="text-muted-foreground">
                        {post.date}
                      </span>
                    </span>
                    <h2 className="mt-2 text-2xl font-bold">{post.title}</h2>
                    {post.excerpt && (
                      <p className="mt-2 text-muted-foreground line-clamp-3">
                        {post.excerpt}
                      </p>
                    )}
                  </Link>
                </article>
              ))
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold mb-3">해당 카테고리의 게시물이 없습니다</h3>
                <p className="text-muted-foreground">다른 카테고리를 확인해보세요.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
} 