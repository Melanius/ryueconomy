import { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/notion';
import { categories } from '@/config/categories';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://ryueconomy.com';
  
  // 기본 페이지 경로
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
  ];
  
  // 카테고리 경로 생성
  const categoryRoutes = categories.map((category) => ({
    url: `${baseUrl}/?category=${category.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));
  
  // 포스트 경로 생성
  const posts = await getAllPosts();
  const postRoutes = posts.map((post) => ({
    url: `${baseUrl}/post/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));
  
  // 모든 경로 결합
  return [...staticRoutes, ...categoryRoutes, ...postRoutes];
} 