import CategoryTabs from "@/components/layout/CategoryTabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

// 임시 데이터 (추후 실제 데이터로 대체)
const allPosts = [
  {
    id: 1,
    title: "Next.js 15로 개인 블로그 만들기",
    excerpt: "최신 Next.js 15를 활용하여 개인 블로그를 구축하는 방법을 소개합니다.",
    category: "tech",
    date: "2024-04-18",
    views: 120,
  },
  {
    id: 2,
    title: "봄맞이 여행지 추천",
    excerpt: "따뜻한 봄, 가볍게 다녀올 수 있는 국내 여행지를 소개합니다.",
    category: "travel",
    date: "2024-04-15",
    views: 85,
  },
  {
    id: 3,
    title: "최근 읽은 책 리뷰",
    excerpt: "지난 달 읽었던 책들 중에서 인상 깊었던 작품들을 소개합니다.",
    category: "review",
    date: "2024-04-10",
    views: 67,
  },
  {
    id: 4,
    title: "shadcn/ui로 디자인 시스템 구축하기",
    excerpt: "커스터마이징이 쉬운 shadcn/ui를 활용한 디자인 시스템 구축 방법",
    category: "tech",
    date: "2024-04-07",
    views: 42,
  },
  {
    id: 5,
    title: "일상 속 작은 행복 찾기",
    excerpt: "바쁜 일상 속에서도 소소한 행복을 발견하는 방법",
    category: "life",
    date: "2024-04-05",
    views: 38,
  },
];

// 카테고리 정보
const categories = {
  all: { name: "전체", description: "모든 게시물을 확인하세요." },
  tech: { name: "기술", description: "프로그래밍 및 IT 관련 포스트" },
  life: { name: "일상", description: "일상 생활과 관련된 이야기" },
  review: { name: "리뷰", description: "다양한 제품과 경험에 대한 리뷰" },
  travel: { name: "여행", description: "여행 경험과 추천 장소" },
};

type Params = { id: string };

export async function generateMetadata({ params }: { params: Params }) {
  const paramsData = await params;
  const id = paramsData.id;
  const category = categories[id as keyof typeof categories] || { name: id, description: "" };
  
  return {
    title: `${category.name} - Ryue Blog`,
    description: category.description,
  };
}

export default async function CategoryPage({ params }: { params: Params }) {
  const paramsData = await params;
  const categoryId = paramsData.id;
  const category = categories[categoryId as keyof typeof categories];
  
  // 카테고리에 해당하는 게시물만 필터링 (전체 카테고리인 경우 모든 게시물 표시)
  const filteredPosts = categoryId === 'all' 
    ? allPosts 
    : allPosts.filter(post => post.category === categoryId);

  return (
    <div className="pb-16">
      {/* 카테고리 탭 */}
      <CategoryTabs activeCategory={categoryId} />
      
      {/* 카테고리 헤더 */}
      <div className="bg-primary/5 py-12">
        <div className="container">
          <h1 className="text-4xl font-bold tracking-tight">{category?.name || categoryId}</h1>
          {category?.description && (
            <p className="text-muted-foreground mt-2 text-lg">{category.description}</p>
          )}
        </div>
      </div>
      
      {/* 게시물 목록 */}
      <section className="container py-8">
        <div className="grid grid-cols-1 gap-6">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <Link href={`/post/${post.id}`} key={post.id} className="group">
                <Card className="overflow-hidden transition-all hover:border-primary">
                  <div className="flex flex-col md:flex-row">
                    <div className="relative md:w-1/4 h-48 md:h-auto bg-muted">
                      {/* 이미지 자리 (추후 실제 이미지로 대체) */}
                      <div className="absolute inset-0 bg-gradient-to-b from-blue-100/30 to-blue-50/10 group-hover:from-blue-100/40 group-hover:to-blue-50/20 transition-all" />
                    </div>
                    <div className="md:w-3/4">
                      <CardHeader>
                        <div className="flex items-center text-sm text-muted-foreground gap-4 mb-1">
                          <span>{post.date}</span>
                          <span className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye">
                              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                            {post.views}
                          </span>
                        </div>
                        <CardTitle className="group-hover:text-primary transition-colors">{post.title}</CardTitle>
                        <CardDescription>{post.excerpt}</CardDescription>
                      </CardHeader>
                      <CardFooter>
                        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors">
                          {post.category}
                        </div>
                      </CardFooter>
                    </div>
                  </div>
                </Card>
              </Link>
            ))
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">아직 게시물이 없습니다</h3>
              <p className="text-muted-foreground">
                이 카테고리에 게시물이 추가되면 여기에 표시됩니다.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
} 