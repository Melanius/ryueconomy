import { getAllPosts as getAllPostsFromLib, getPostBySlug as getPostBySlugFromLib } from '@/lib/notion';
import { Post } from '@/types/post';

export interface BlogPost extends Post {}

export const getAllPosts = getAllPostsFromLib;
export const getPostBySlug = getPostBySlugFromLib; 