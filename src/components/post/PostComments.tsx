'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { formatDate } from '@/utils/date';

interface Comment {
  id: string;
  content: string;
  author: {
    name: string;
    image?: string;
  };
  date: string;
  likes: number;
  replies?: Comment[];
}

interface PostCommentsProps {
  postId: string;
  comments: Comment[];
  className?: string;
}

const PostComments: React.FC<PostCommentsProps> = ({
  postId,
  comments,
  className = ''
}) => {
  // 컴포넌트 마운트 시 로깅
  useEffect(() => {
    console.log(`[PostComments] 컴포넌트 마운트: postId=${postId}, 댓글 수: ${comments.length}개`);
    
    return () => {
      console.log(`[PostComments] 컴포넌트 언마운트: postId=${postId}`);
    };
  }, [postId, comments.length]);
  
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 댓글 내용 변경 이벤트 핸들러
  const handleCommentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewComment(e.target.value);
    
    if (e.target.value.length % 20 === 0 && e.target.value.length > 0) {
      console.log(`[PostComments] 댓글 작성 중: ${e.target.value.length}자 입력, postId=${postId}`);
    }
  }, [postId]);

  // 댓글 제출 이벤트 핸들러
  const handleSubmitComment = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    console.log(`[PostComments] 댓글 작성 시도: postId=${postId}, 댓글 길이: ${newComment.length}자`);
    
    try {
      setIsSubmitting(true);
      
      // TODO: API 호출로 댓글 저장
      await new Promise(resolve => setTimeout(resolve, 1000)); // 임시 지연
      
      console.log(`[PostComments] 댓글 작성 완료: postId=${postId}`);
      setNewComment('');
    } catch (error) {
      console.error(`[PostComments] 댓글 작성 실패: postId=${postId}`, error);
      alert('댓글 작성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  }, [postId, newComment, isSubmitting]);

  // 좋아요 클릭 이벤트 핸들러
  const handleLikeClick = useCallback((commentId: string) => {
    console.log(`[PostComments] 좋아요 클릭: commentId=${commentId}, postId=${postId}`);
    // TODO: API 호출로 좋아요 처리
  }, [postId]);

  // 답글 클릭 이벤트 핸들러
  const handleReplyClick = useCallback((commentId: string) => {
    console.log(`[PostComments] 답글 클릭: commentId=${commentId}, postId=${postId}`);
    // TODO: 답글 창 표시 또는 API 호출
  }, [postId]);

  // 프로필 이미지 로드 이벤트 핸들러
  const handleProfileImageLoad = useCallback((authorName: string) => {
    console.log(`[PostComments] 프로필 이미지 로드 완료: ${authorName}, postId=${postId}`);
  }, [postId]);

  // 프로필 이미지 로드 에러 이벤트 핸들러
  const handleProfileImageError = useCallback((authorName: string) => {
    console.error(`[PostComments] 프로필 이미지 로드 실패: ${authorName}, postId=${postId}`);
  }, [postId]);

  const renderComment = (comment: Comment, isReply = false) => (
    <article 
      key={comment.id}
      className={`p-4 ${isReply ? 'ml-8 border-l' : 'border-b'} border-gray-200`}
    >
      <div className="flex items-start space-x-3">
        {comment.author.image ? (
          <div className="relative h-10 w-10 rounded-full overflow-hidden">
            <Image
              src={comment.author.image}
              alt={comment.author.name}
              fill
              className="object-cover"
              onLoad={() => handleProfileImageLoad(comment.author.name)}
              onError={() => handleProfileImageError(comment.author.name)}
            />
          </div>
        ) : (
          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500 text-sm">
              {comment.author.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-medium">{comment.author.name}</span>
            <span className="text-sm text-gray-500">
              {formatDate(comment.date)}
            </span>
          </div>
          
          <p className="text-gray-700 mb-2">{comment.content}</p>
          
          <div className="flex items-center space-x-4 text-sm">
            <button 
              className="text-gray-500 hover:text-blue-600"
              onClick={() => handleLikeClick(comment.id)}
            >
              좋아요 {comment.likes > 0 && `(${comment.likes})`}
            </button>
            <button 
              className="text-gray-500 hover:text-blue-600"
              onClick={() => handleReplyClick(comment.id)}
            >
              답글
            </button>
          </div>
        </div>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4">
          {comment.replies.map(reply => renderComment(reply, true))}
        </div>
      )}
    </article>
  );

  return (
    <section className={`mt-12 ${className}`}>
      <h2 className="text-2xl font-bold mb-8">댓글</h2>

      {/* 댓글 작성 폼 */}
      <form onSubmit={handleSubmitComment} className="mb-8">
        <textarea
          value={newComment}
          onChange={handleCommentChange}
          placeholder="댓글을 작성해주세요..."
          className="w-full p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
        />
        <div className="mt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '작성 중...' : '댓글 작성'}
          </button>
        </div>
      </form>

      {/* 댓글 목록 */}
      <div className="space-y-4">
        {comments.length > 0 ? (
          comments.map(comment => renderComment(comment))
        ) : (
          <p className="text-center text-gray-500 py-8">
            아직 작성된 댓글이 없습니다.
          </p>
        )}
      </div>
    </section>
  );
};

export default PostComments; 