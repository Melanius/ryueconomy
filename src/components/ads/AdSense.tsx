'use client';

import React, { useEffect, useRef } from 'react';

interface AdSenseProps {
  adClient: string;
  adSlot: string;
  adFormat?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  adStyle?: React.CSSProperties;
  className?: string;
  responsive?: boolean;
}

export default function AdSense({
  adClient,
  adSlot,
  adFormat = 'auto',
  adStyle = {},
  className = '',
  responsive = true,
}: AdSenseProps) {
  const adContainerRef = useRef<HTMLDivElement>(null);
  const adLoaded = useRef(false);

  useEffect(() => {
    // AdSense 스크립트가 이미 로드되었는지 확인
    const hasAdScript = document.querySelector('script[src*="pagead2.googlesyndication.com"]');
    
    // AdSense 스크립트 로드
    if (!hasAdScript) {
      const script = document.createElement('script');
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.setAttribute('data-ad-client', adClient);
      
      document.head.appendChild(script);
      
      script.onload = () => {
        loadAd();
      };
    } else {
      loadAd();
    }
    
    function loadAd() {
      // 이미 광고가 로드되었으면 다시 로드하지 않음
      if (adLoaded.current || !adContainerRef.current) return;
      
      try {
        const adsbygoogle = (window as any).adsbygoogle || [];
        adsbygoogle.push({});
        adLoaded.current = true;
        
        console.log('AdSense 광고 로드 시도:', adSlot);
      } catch (error) {
        console.error('AdSense 광고 로드 실패:', error);
      }
    }
    
    return () => {
      // 컴포넌트 언마운트 시 처리 (필요한 경우)
    };
  }, [adClient, adSlot]);
  
  // 기본 스타일 (반응형 또는 고정형)
  const defaultStyle: React.CSSProperties = responsive
    ? { display: 'block', width: '100%', height: 'auto', minHeight: '90px' }
    : { display: 'inline-block' };
  
  // 최종 스타일 병합
  const finalStyle = { ...defaultStyle, ...adStyle };
  
  return (
    <div ref={adContainerRef} className={`ad-container ${className}`} style={{ overflow: 'hidden', margin: '1rem 0' }}>
      <ins
        className="adsbygoogle"
        style={finalStyle}
        data-ad-client={adClient}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
} 