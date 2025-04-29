import { Metadata } from 'next';

// 기본 메타데이터 정의
export const defaultMetadata: Metadata = {
  title: '류이코노미 (RyuEconomy) - 투자와 코딩을 위한 개인 블로그',
  description: '암호화폐, 주식 투자부터 코딩 개발 일지까지 공유하는 개인 블로그입니다.',
  keywords: '투자, 암호화폐, 블록체인, 주식, 개발, 코딩, 개인블로그',
  authors: [{ name: 'Ryu', url: 'https://ryueconomy.com' }],
  creator: 'Ryu',
  publisher: 'RyuEconomy',
  robots: 'index, follow',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  metadataBase: new URL('https://ryueconomy.com'),
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://ryueconomy.com',
    title: '류이코노미 (RyuEconomy) - 투자와 코딩을 위한 개인 블로그',
    description: '암호화폐, 주식 투자부터 코딩 개발 일지까지 공유하는 개인 블로그입니다.',
    siteName: '류이코노미 (RyuEconomy)',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: '류이코노미 (RyuEconomy)',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '류이코노미 (RyuEconomy) - 투자와 코딩을 위한 개인 블로그',
    description: '암호화폐, 주식 투자부터 코딩 개발 일지까지 공유하는 개인 블로그입니다.',
    images: ['/og-image.jpg'],
    creator: '@ryueconomy',
  },
};

// 카테고리별 메타데이터 생성 함수
export function generateCategoryMetadata(category: string): Metadata {
  const categoryTitles: Record<string, string> = {
    'crypto-morning': '크립토모닝 - 암호화폐 시장 동향과 뉴스',
    'invest-insight': '투자 인사이트 - 투자 전략과 시장 분석',
    'real-portfolio': '현실 포폴 - 실제 투자 포트폴리오 공개',
    'code-lab': '코드랩 - 프로그래밍과 웹 개발',
    'daily-log': '마이로그 - 일상 기록',
  };

  const categoryDescriptions: Record<string, string> = {
    'crypto-morning': '암호화폐 시장 동향과 주요 뉴스를 매일 모닝 브리핑으로 정리한 글 모음입니다.',
    'invest-insight': '투자 전략과 시장 분석, 자산 관리에 대한 인사이트를 공유하는 콘텐츠 모음입니다.',
    'real-portfolio': '실제 투자 포트폴리오와 매매 기록을 공개하는 콘텐츠 모음입니다.',
    'code-lab': '프로그래밍과 웹 개발에 관한 튜토리얼과 프로젝트를 소개하는 콘텐츠 모음입니다.',
    'daily-log': '일상 기록과 생각을 정리한 개인적인 일기 모음입니다.',
  };

  const title = categoryTitles[category] || defaultMetadata.title || '';
  const description = categoryDescriptions[category] || (defaultMetadata.description as string);

  return {
    ...defaultMetadata,
    title: title ? `${title} | 류이코노미` : defaultMetadata.title,
    description: description,
    openGraph: {
      ...defaultMetadata.openGraph,
      title: title ? `${title} | 류이코노미` : defaultMetadata.openGraph?.title || '',
      description: description,
    },
    twitter: {
      ...defaultMetadata.twitter,
      title: title ? `${title} | 류이코노미` : defaultMetadata.twitter?.title || '',
      description: description,
    },
  };
}

// 포스트 메타데이터 생성 함수
export function generatePostMetadata(title: string, description: string, category: string, image?: string): Metadata {
  return {
    ...defaultMetadata,
    title: `${title} | 류이코노미`,
    description: description,
    openGraph: {
      ...defaultMetadata.openGraph,
      title: `${title} | 류이코노미`,
      description: description,
      type: 'article',
      images: image ? [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ] : defaultMetadata.openGraph?.images,
    },
    twitter: {
      ...defaultMetadata.twitter,
      title: `${title} | 류이코노미`,
      description: description,
      images: image ? [image] : defaultMetadata.twitter?.images,
    },
  };
} 