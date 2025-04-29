'use client';

import React, { useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Post } from '@/types/post';
import { FaTwitter, FaFacebook, FaLink } from 'react-icons/fa';

interface PostFooterProps {
  post: Post;
  relatedPosts?: Post[];
  className?: string;
}

const PostFooter: React.FC<PostFooterProps> = ({ 
  post, 
  relatedPosts = [], 
  className = '' 
}) => {
  // 컴포넌트 마운트 시 로깅
  useEffect(() => {
    console.log(`[PostFooter] 컴포넌트 마운트: ${post.id}, 제목: "${post.title}", 관련 포스트: ${relatedPosts.length}개`);
    
    if (relatedPosts.length > 0) {
      console.log('[PostFooter] 관련 포스트 목록:', relatedPosts.map(p => ({ id: p.id, title: p.title })));
    }
    
    return () => {
      console.log(`[PostFooter] 컴포넌트 언마운트: ${post.id}, 제목: "${post.title}"`);
    };
  }, [post, relatedPosts]);

  // 공유 이벤트 핸들러
  const handleShare = useCallback((platform: 'twitter' | 'facebook' | 'link') => {
    const url = window.location.href;
    const title = post.title;

    console.log(`[PostFooter] 공유 시도: 플랫폼 "${platform}", 포스트: ${post.id}, 제목: "${post.title}"`);

    switch (platform) {
      case 'twitter':
        try {
          window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
            '_blank'
          );
          console.log(`[PostFooter] Twitter 공유 성공: ${post.id}`);
        } catch (error) {
          console.error(`[PostFooter] Twitter 공유 실패:`, error);
        }
        break;
      case 'facebook':
        try {
          window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
            '_blank'
          );
          console.log(`[PostFooter] Facebook 공유 성공: ${post.id}`);
        } catch (error) {
          console.error(`[PostFooter] Facebook 공유 실패:`, error);
        }
        break;
      case 'link':
        try {
          navigator.clipboard.writeText(url).then(() => {
            console.log(`[PostFooter] 링크 복사 성공: ${url}`);
            alert('링크가 복사되었습니다.');
          }).catch(error => {
            console.error(`[PostFooter] 링크 복사 실패:`, error);
            alert('링크 복사에 실패했습니다.');
          });
        } catch (error) {
          console.error(`[PostFooter] 링크 복사 시도 중 오류:`, error);
        }
        break;
    }
  }, [post.id, post.title]);

  // 관련 포스트 클릭 이벤트 핸들러
  const handleRelatedPostClick = useCallback((relatedPost: Post) => {
    console.log(`[PostFooter] 관련 포스트 클릭: ${relatedPost.id}, 제목: "${relatedPost.title}", 원본 포스트: ${post.id}`);
  }, [post.id]);

  return (
    <footer className={`mt-12 ${className}`}>
      {/* 공유 버튼 */}
      <div className="flex justify-center space-x-4 mb-8">
        <button
          onClick={() => handleShare('twitter')}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          aria-label="Twitter에 공유하기"
        >
          <FaTwitter className="w-5 h-5 text-gray-600" />
        </button>
        <button
          onClick={() => handleShare('facebook')}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          aria-label="Facebook에 공유하기"
        >
          <FaFacebook className="w-5 h-5 text-gray-600" />
        </button>
        <button
          onClick={() => handleShare('link')}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          aria-label="링크 복사하기"
        >
          <FaLink className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* 관련 포스트 */}
      {relatedPosts.length > 0 && (
        <div className="border-t border-gray-200 pt-8">
          <h2 className="text-2xl font-bold mb-6">관련 포스트</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedPosts.map(relatedPost => (
              <Link 
                key={relatedPost.id} 
                href={`/post/${relatedPost.id}`}
                className="block group"
                onClick={() => handleRelatedPostClick(relatedPost)}
              >
                <article className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600">
                    {relatedPost.title}
                  </h3>
                  {relatedPost.excerpt && (
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {relatedPost.excerpt}
                    </p>
                  )}
                </article>
              </Link>
            ))}
          </div>
        </div>
      )}
    </footer>
  );
};

export default PostFooter; 