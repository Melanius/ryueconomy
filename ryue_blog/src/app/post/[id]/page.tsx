import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { notFound } from "next/navigation";

// 임시 데이터 (추후 실제 데이터로 대체)
const posts = [
  {
    id: 1,
    title: "Next.js 15로 개인 블로그 만들기",
    excerpt: "최신 Next.js 15를 활용하여 개인 블로그를 구축하는 방법을 소개합니다.",
    category: "tech",
    date: "2024-04-18",
    views: 120,
    content: `
      <h2>Next.js 15의 주요 기능</h2>
      <p>Next.js 15는 React 애플리케이션 개발을 위한 강력한 프레임워크로, 서버 컴포넌트, 증분적 정적 재생성(ISR), 이미지 최적화 등 다양한 기능을 제공합니다.</p>
      
      <h3>서버 컴포넌트</h3>
      <p>서버 컴포넌트를 사용하면 서버에서 컴포넌트를 렌더링하고 필요한 데이터만 클라이언트로 전송할 수 있습니다. 이는 초기 로딩 시간을 단축시키고 성능을 향상시킵니다.</p>
      
      <h3>App Router</h3>
      <p>새로운 App Router는 파일 시스템 기반 라우팅을 제공하며, 더 직관적인 방식으로 라우팅을 구성할 수 있게 해줍니다.</p>
      
      <h2>블로그 구축하기</h2>
      <p>개인 블로그를 구축할 때는 다음과 같은 요소들을 고려해야 합니다:</p>
      
      <ul>
        <li>콘텐츠 관리 시스템</li>
        <li>반응형 디자인</li>
        <li>SEO 최적화</li>
        <li>성능 최적화</li>
      </ul>
      
      <p>이 포스트에서는 Next.js 15와 관련 도구를 사용하여 개인 블로그를 구축하는 방법에 대해 알아보겠습니다.</p>
    `,
  },
  {
    id: 2,
    title: "봄맞이 여행지 추천",
    excerpt: "따뜻한 봄, 가볍게 다녀올 수 있는 국내 여행지를 소개합니다.",
    category: "travel",
    date: "2024-04-15",
    views: 85,
    content: `
      <h2>봄에 떠나기 좋은 국내 여행지</h2>
      <p>봄은 여행하기 좋은 계절입니다. 춥지도 덥지도 않고, 자연의 아름다움을 만끽할 수 있는 시기죠. 이번 글에서는 봄에 방문하기 좋은 국내 여행지를 소개합니다.</p>
      
      <h3>경주</h3>
      <p>경주는 봄철 벚꽃과 함께 역사적인 명소를 둘러보기 좋은 곳입니다. 특히 보문호수와 대릉원 주변의 벚꽃은 매우 아름답습니다.</p>
      
      <h3>제주도</h3>
      <p>제주도는 봄철 유채꽃과 함께 아름다운 풍경을 즐길 수 있는 곳입니다. 해안가 드라이브와 함께 자연의 아름다움을 느껴보세요.</p>
      
      <h3>여수</h3>
      <p>여수는 아름다운 해안선과 함께 맛있는 음식을 즐길 수 있는 곳입니다. 특히 밤바다는 여수를 방문하는 여행객들에게 빼놓을 수 없는 명소입니다.</p>
      
      <p>이번 봄에는 이런 아름다운 국내 여행지를 방문하여 일상에서 벗어나 새로운 추억을 만들어보는 것은 어떨까요?</p>
    `,
  },
  {
    id: 3,
    title: "최근 읽은 책 리뷰",
    excerpt: "지난 달 읽었던 책들 중에서 인상 깊었던 작품들을 소개합니다.",
    category: "review",
    date: "2024-04-10",
    views: 67,
    content: `
      <h2>2024년 상반기 읽은 책 중 추천하고 싶은 작품들</h2>
      <p>2024년 상반기에 읽었던 책들 중에서 인상 깊었던 몇 가지 작품을 소개합니다. 다양한 장르의 책을 통해 새로운 생각과 관점을 얻을 수 있었습니다.</p>
      
      <h3>"아무튼, 메모"</h3>
      <p>메모의 중요성과 일상 속에서 메모를 활용하는 방법에 대한 책입니다. 작가의 경험을 통해 메모가 가지는 의미와 가치에 대해 생각해볼 수 있었습니다.</p>
      
      <h3>"디 앤서"</h3>
      <p>인공지능이 발달한 미래 사회를 배경으로 한 SF 소설로, 기술 발전에 따른 윤리적 문제와 인간의 본질에 대해 다루고 있습니다. 현실과 맞닿아 있는 내용이 인상적이었습니다.</p>
      
      <h3>"자신의 운명을 사랑하라"</h3>
      <p>니체의 철학을 일상적인 언어로 풀어낸 책입니다. 삶의 의미와 가치에 대한 새로운 시각을 제시하고 있어 많은 생각을 하게 해주었습니다.</p>
      
      <p>각각의 책은 서로 다른 주제와 분위기를 가지고 있지만, 모두 삶에 대한 깊은 통찰을 제공해주었습니다. 여러분도 시간이 된다면 한 번 읽어보시길 추천합니다.</p>
    `,
  },
  {
    id: 4,
    title: "shadcn/ui로 디자인 시스템 구축하기",
    excerpt: "커스터마이징이 쉬운 shadcn/ui를 활용한 디자인 시스템 구축 방법",
    category: "tech",
    date: "2024-04-07",
    views: 42,
    content: `
      <h2>shadcn/ui란?</h2>
      <p>shadcn/ui는 Radix UI를 기반으로 한 재사용 가능한 컴포넌트 모음입니다. 복사-붙여넣기 방식으로 동작하기 때문에, npm 패키지가 아니라 필요한 컴포넌트만 코드베이스에 직접 추가할 수 있습니다.</p>
      
      <h3>shadcn/ui의 장점</h3>
      <p>shadcn/ui의 가장 큰 장점은 커스터마이징이 용이하다는 점입니다. 컴포넌트 코드를 직접 소유하게 되므로, 필요에 따라 자유롭게 수정할 수 있습니다. 또한, 접근성, 키보드 내비게이션 등이 모두 고려되어 있어 사용자 경험이 우수합니다.</p>
      
      <h3>설치 및 사용 방법</h3>
      <p>shadcn/ui는 CLI를 통해 쉽게 설치할 수 있습니다. 'npx shadcn-ui@latest init' 명령어로 초기화한 후, 필요한 컴포넌트를 'npx shadcn-ui@latest add [component-name]' 명령어로 추가할 수 있습니다.</p>
      
      <h2>디자인 시스템 구축하기</h2>
      <p>shadcn/ui를 활용하여 일관된 디자인 시스템을 구축하는 방법을 살펴보겠습니다. 색상, 타이포그래피, 간격 등의 디자인 토큰을 설정하고, 이를 컴포넌트에 적용하여 일관된 UI를 구성할 수 있습니다.</p>
      
      <p>다음 포스트에서는 더 구체적인 예시와 함께 shadcn/ui를 활용한 디자인 시스템 구축 과정을 자세히 알아보겠습니다.</p>
    `,
  },
  {
    id: 5,
    title: "일상 속 작은 행복 찾기",
    excerpt: "바쁜 일상 속에서도 소소한 행복을 발견하는 방법",
    category: "life",
    date: "2024-04-05",
    views: 38,
    content: `
      <h2>바쁜 일상 속 행복 찾기</h2>
      <p>현대인들은 바쁜 일상 속에서 쉽게 행복을 놓치곤 합니다. 하지만 행복은 거창한 것이 아닌, 일상 속 작은 순간들에서 찾을 수 있습니다.</p>
      
      <h3>아침 루틴의 중요성</h3>
      <p>하루의 시작을 어떻게 보내느냐가 그날의 기분을 좌우하는 경우가 많습니다. 아침에 조금 일찍 일어나 명상, 독서, 가벼운 운동 등으로 여유롭게 하루를 시작해보세요.</p>
      
      <h3>감사일기 쓰기</h3>
      <p>하루를 마무리하며 그날 있었던 감사한 일들을 기록해보세요. 작은 일상의 행복들을 인식하고 기록하는 습관은 전반적인 행복감을 높여줍니다.</p>
      
      <h3>취미 활동 즐기기</h3>
      <p>자신만의 취미를 가지고 정기적으로 즐기는 시간을 가져보세요. 취미 활동은 스트레스 해소뿐만 아니라 성취감과 즐거움을 줍니다.</p>
      
      <p>행복은 멀리 있지 않습니다. 일상 속에서 작은 행복을 발견하고 그 순간을 온전히 느끼는 연습을 해보세요. 그렇게 쌓인 작은 행복들이 여러분의 삶을 더 풍요롭게 만들어줄 것입니다.</p>
    `,
  },
];

// 포스트 데이터 가져오기 (id를 기준으로)
const getPostById = (id: string) => {
  const postId = parseInt(id, 10);
  return posts.find(post => post.id === postId);
};

type Params = { id: string };

export async function generateMetadata({ params }: { params: Params }) {
  const paramsData = await params;
  const id = paramsData.id;
  const post = getPostById(id);
  
  if (!post) {
    return {
      title: '포스트를 찾을 수 없습니다 - Ryue Blog',
      description: '요청하신 포스트를 찾을 수 없습니다.',
    };
  }
  
  return {
    title: `${post.title} - Ryue Blog`,
    description: post.excerpt,
  };
}

// 관련 게시물 가져오기 (같은 카테고리의 다른 게시물)
const getRelatedPosts = (currentPostId: number, category: string) => {
  return posts
    .filter(post => post.id !== currentPostId && post.category === category)
    .slice(0, 3); // 최대 3개까지만 표시
};

export default async function PostPage({ params }: { params: Params }) {
  const paramsData = await params;
  const id = paramsData.id;
  const post = getPostById(id);
  
  if (!post) {
    notFound();
  }
  
  const relatedPosts = getRelatedPosts(post.id, post.category);
  
  return (
    <div className="pb-16">
      {/* 포스트 헤더 */}
      <div className="bg-primary/5 py-12">
        <div className="container">
          <div className="flex items-center text-sm text-muted-foreground gap-4 mb-3">
            <span>{post.date}</span>
            <span className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              {post.views}
            </span>
            <Link href={`/category/${post.category}`}>
              <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors hover:bg-secondary">
                {post.category}
              </span>
            </Link>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">{post.title}</h1>
          <p className="text-xl text-muted-foreground mt-2">{post.excerpt}</p>
        </div>
      </div>
      
      {/* 포스트 내용 */}
      <article className="container py-8">
        <div className="prose prose-stone mx-auto dark:prose-invert lg:prose-lg">
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>
      </article>
      
      {/* 관련 게시물 */}
      {relatedPosts.length > 0 && (
        <section className="container py-8 border-t">
          <h2 className="text-2xl font-bold tracking-tight mb-6">관련 게시물</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedPosts.map((relatedPost) => (
              <Link href={`/post/${relatedPost.id}`} key={relatedPost.id} className="group">
                <Card className="h-full overflow-hidden transition-all hover:border-primary">
                  <CardHeader>
                    <div className="flex items-center text-sm text-muted-foreground gap-4 mb-1">
                      <span>{relatedPost.date}</span>
                    </div>
                    <CardTitle className="group-hover:text-primary transition-colors">{relatedPost.title}</CardTitle>
                    <CardDescription>{relatedPost.excerpt}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
} 