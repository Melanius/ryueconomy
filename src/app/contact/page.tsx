"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FaGithub } from "react-icons/fa";
import { SiThreads } from "react-icons/si";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success?: boolean; message: string } | null>(null);
  const [submitCount, setSubmitCount] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);

  // localStorage에서 제출 횟수 불러오기
  useEffect(() => {
    const storedCount = localStorage.getItem('contact_submit_count');
    if (storedCount) {
      const count = parseInt(storedCount, 10);
      setSubmitCount(count);
      if (count >= 3) {
        setIsBlocked(true);
      }
    }
  }, []);

  const updateSubmitCount = () => {
    const newCount = submitCount + 1;
    setSubmitCount(newCount);
    localStorage.setItem('contact_submit_count', newCount.toString());
    
    if (newCount >= 3) {
      setIsBlocked(true);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 3회 이상 제출 제한 확인
    if (isBlocked) {
      setSubmitResult({
        success: false,
        message: '메시지 제출 횟수 제한에 도달했습니다. 나중에 다시 시도해주세요.'
      });
      return;
    }
    
    setIsSubmitting(true);
    setSubmitResult(null);
    
    try {
      // API 엔드포인트로 데이터 전송
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
      // 성공 시 폼 초기화 및 성공 메시지 표시
      setFormData({ name: '', email: '', subject: '', message: '' });
      setSubmitResult({
      success: true,
      message: data.message || '메시지가 성공적으로 전송되었습니다!'
      });
      // 제출 횟수 업데이트
      updateSubmitCount();
        
            // 알림 창 표시
            window.alert('메시지가 성공적으로 전송되었습니다!');
          } else {
        // 에러 발생 시 에러 메시지 표시
        setSubmitResult({
          success: false,
          message: data.error || '메시지 전송 중 오류가 발생했습니다.'
        });
      }
    } catch (error) {
      console.error('메시지 제출 중 오류:', error);
      setSubmitResult({
        success: false,
        message: '서버 연결 오류가 발생했습니다. 나중에 다시 시도해주세요.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-16">
      {/* 연결하기 섹션을 상단으로 이동 */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold mb-6 text-center">연결하기</h2>
        <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
          소셜 미디어를 통해 최신 소식을 확인하고 연결해 보세요. 
          암호화폐, 투자, 개발 관련 질문이나 정보 공유를 환영합니다.
        </p>
        
        <div className="max-w-md mx-auto space-y-4">
          <Link href="https://www.threads.com/@ryueconomy" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted transition-colors">
            <SiThreads className="h-5 w-5" />
            <span>Threads</span>
          </Link>
          
          <Link href="https://github.com/Melanius" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted transition-colors">
            <FaGithub className="h-5 w-5" />
            <span>GitHub</span>
          </Link>
        </div>
      </div>
      
      {/* 메시지 보내기 섹션을 중앙에 배치 */}
      <div className="max-w-lg mx-auto">
        <h2 className="text-2xl font-semibold mb-6 text-center">메시지 보내기</h2>
        {isBlocked ? (
          <div className="p-4 mb-6 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
            일일 메시지 제출 한도에 도달했습니다. 나중에 다시 시도해주세요.
          </div>
        ) : submitResult ? (
          <div className={`p-4 mb-6 rounded ${submitResult.success ? 'bg-green-100 border border-green-400 text-green-700' : 'bg-red-100 border border-red-400 text-red-700'}`}>
            {submitResult.message}
          </div>
        ) : null}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">이름</label>
            <Input 
              id="name" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              required
              placeholder="홍길동"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">이메일</label>
            <Input 
              id="email" 
              name="email" 
              type="email" 
              value={formData.email} 
              onChange={handleChange} 
              required
              placeholder="example@email.com"
            />
          </div>
          
          <div>
            <label htmlFor="subject" className="block text-sm font-medium mb-1">제목</label>
            <Input 
              id="subject" 
              name="subject" 
              value={formData.subject} 
              onChange={handleChange} 
              required
              placeholder="문의 제목"
            />
          </div>
          
          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-1">메시지</label>
            <Textarea 
              id="message" 
              name="message" 
              value={formData.message} 
              onChange={handleChange} 
              required
              placeholder="내용을 입력해주세요..."
              rows={5}
            />
          </div>
          
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? '전송 중...' : '메시지 보내기'}
          </Button>
        </form>
      </div>
    </div>
  );
}