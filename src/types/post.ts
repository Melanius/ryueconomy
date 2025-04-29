/**
 * 블로그 포스트 인터페이스
 */
import { CategoryId } from './notion';

export interface Category {
  id: CategoryId | 'all';
  label: string;
  icon: React.ComponentType;
  color: string;
}

export interface Author {
  name: string;
  image?: string;
  bio?: string;
}

export interface Post {
  id: string;
  title: string;
  date: string;
  author: Author;
  category: CategoryId;
  content: string;
  tags: string[];
  views?: number;
  slug?: string;
  excerpt?: string;
  featured?: boolean;
  image?: string;
} 