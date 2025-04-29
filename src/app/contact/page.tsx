"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { HiMail, HiPhone, HiLocationMarker } from "react-icons/hi";
import { FaTwitter, FaGithub, FaLinkedin } from "react-icons/fa";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // 여기에 실제 폼 제출 로직 구현
    // 예: 서버에 API 요청 보내기
    
    // 임시로 1초 후 제출 완료 처리
    setTimeout(() => {
      window.alert("메시지가 성공적으로 전송되었습니다!");
      setFormData({ name: '', email: '', subject: '', message: '' });
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8 text-center">Contact</h1>
      <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
        궁금한 점이 있으시거나 협업을 원하시면 아래 양식을 통해 연락주세요. 
        소셜 미디어를 통해서도 연결될 수 있습니다.
      </p>
      
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="bg-card rounded-lg p-6 shadow-sm flex flex-col items-center text-center">
          <div className="bg-primary/10 rounded-full p-4 mb-4">
            <HiMail className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-semibold text-lg mb-2">이메일</h3>
          <p className="text-muted-foreground">
            <a href="mailto:contact@ryueconomy.com" className="hover:text-primary transition-colors">
              contact@ryueconomy.com
            </a>
          </p>
        </div>
        
        <div className="bg-card rounded-lg p-6 shadow-sm flex flex-col items-center text-center">
          <div className="bg-primary/10 rounded-full p-4 mb-4">
            <HiPhone className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-semibold text-lg mb-2">전화번호</h3>
          <p className="text-muted-foreground">
            <a href="tel:+8210XXXXXXXX" className="hover:text-primary transition-colors">
              +82 10-XXXX-XXXX
            </a>
          </p>
        </div>
        
        <div className="bg-card rounded-lg p-6 shadow-sm flex flex-col items-center text-center">
          <div className="bg-primary/10 rounded-full p-4 mb-4">
            <HiLocationMarker className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-semibold text-lg mb-2">위치</h3>
          <p className="text-muted-foreground">
            서울특별시
          </p>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-semibold mb-6">메시지 보내기</h2>
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
        
        <div>
          <h2 className="text-2xl font-semibold mb-6">연결하기</h2>
          <p className="text-muted-foreground mb-6">
            소셜 미디어를 통해 최신 소식을 확인하고 연결해 보세요. 
            암호화폐, 투자, 개발 관련 질문이나 정보 공유를 환영합니다.
          </p>
          
          <div className="space-y-4">
            <Link href="https://twitter.com/ryueconomy" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted transition-colors">
              <FaTwitter className="h-5 w-5 text-[#1DA1F2]" />
              <span>Twitter</span>
            </Link>
            
            <Link href="https://github.com/ryueconomy" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted transition-colors">
              <FaGithub className="h-5 w-5" />
              <span>GitHub</span>
            </Link>
            
            <Link href="https://linkedin.com/in/ryueconomy" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted transition-colors">
              <FaLinkedin className="h-5 w-5 text-[#0077B5]" />
              <span>LinkedIn</span>
            </Link>
          </div>
          
          <div className="mt-8 p-5 bg-muted rounded-lg">
            <h3 className="font-semibold mb-3">운영 시간</h3>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span>월요일 - 금요일:</span>
                <span>9:00 - 18:00</span>
              </li>
              <li className="flex justify-between">
                <span>토요일:</span>
                <span>10:00 - 15:00</span>
              </li>
              <li className="flex justify-between">
                <span>일요일:</span>
                <span>휴무</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 