import { Metadata } from 'next';
import { getAllPosts } from '@/lib/notion';
import { Post } from '@/types/post';
import PostsList from '@/components/PostsList';
import CategoryTabsWithNavigation from '@/components/layout/CategoryTabsWithNavigation';
import { Suspense } from 'react';
import { NavCategoryId } from '@/contexts/GlobalStateContext';

export const metadata: Metadata = {
  title: '블로그 | Ryue\'s Blog',
  description: '프로그래밍, 투자, 크립토 등 다양한 주제에 대한 블로그 글을 읽어보세요.',
};

export default async function BlogPage() {
  let posts: Post[] = [];
  
  try {
    posts = await getAllPosts();
    
    // Sort posts by date (newest first)
    posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error('Error fetching posts:', error);
  }
  
  // Count posts by category
  const categoryCounts = posts.reduce((acc: { [category: string]: number }, post) => {
    const category = post.category || 'undefined';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});
  
  // Prepare for CategoryTabs component
  const categoryPostCounts: Partial<Record<NavCategoryId, number>> = {};
  Object.entries(categoryCounts).forEach(([category, count]) => {
    categoryPostCounts[category as NavCategoryId] = count;
  });
  
  // Set total posts count
  categoryPostCounts['all'] = posts.length;
  
  // Get featured posts
  const featuredPosts = posts.filter(post => post.featured).slice(0, 3);
  
  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">블로그</h1>
          <p className="text-gray-600">
            프로그래밍, 투자, 크립토 등 다양한 주제에 대한 글을 읽어보세요.
          </p>
        </div>
        
        <Suspense fallback={<div>Loading categories...</div>}>
          <CategoryTabsWithNavigation 
            activeCategory="all" 
            categoryPostCounts={categoryPostCounts}
          />
        </Suspense>
        
        {featuredPosts.length > 0 && (
          <div className="my-8">
            <h2 className="text-xl font-bold mb-4">추천 포스트</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredPosts.map(post => (
                <div key={post.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  {post.image && (
                    <div className="aspect-video w-full overflow-hidden">
                      <img 
                        src={post.image} 
                        alt={post.title} 
                        className="w-full h-full object-cover transition-transform hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-bold line-clamp-2 mb-2">
                      <a href={`/blog/${post.slug}`} className="hover:text-blue-600">
                        {post.title}
                      </a>
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {new Date(post.date).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100">
                        {post.category}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="my-8">
          <h2 className="text-xl font-bold mb-4">최신 포스트</h2>
          <Suspense fallback={<div>Loading posts...</div>}>
            <PostsList posts={posts} activeCategory="all" />
          </Suspense>
        </div>
      </div>
    </main>
  );
} 