// 카테고리별 색상 정보
export const categoryColors: Record<string, {main: string, light: string, dark: string}> = {
  "crypto-morning": {main: "#E03E3E", light: "rgba(224, 62, 62, 0.15)", dark: "rgba(224, 62, 62, 0.4)"},
  "invest-insight": {main: "#FF9F43", light: "rgba(255, 159, 67, 0.15)", dark: "rgba(255, 159, 67, 0.4)"},
  "real-portfolio": {main: "#0B6BCB", light: "rgba(11, 107, 203, 0.15)", dark: "rgba(11, 107, 203, 0.4)"},
  "code-lab": {main: "#0F9D58", light: "rgba(15, 157, 88, 0.15)", dark: "rgba(15, 157, 88, 0.4)"},
  "daily-log": {main: "#F5C400", light: "rgba(245, 196, 0, 0.15)", dark: "rgba(245, 196, 0, 0.4)"}
};

// 카테고리별 스타일 가져오기
export const getCategoryStyle = (category: string) => {
  return categoryColors[category] || 
    {main: "#4361ee", light: "rgba(67, 97, 238, 0.15)", dark: "rgba(67, 97, 238, 0.4)"};
};

// 카테고리명 가져오기
export const getCategoryName = (category: string): string => {
  const categoryMap: Record<string, string> = {
    "crypto-morning": "크립토 모닝",
    "invest-insight": "투자 인사이트",
    "real-portfolio": "실전 포트폴리오",
    "code-lab": "코드 랩",
    "daily-log": "일상 기록"
  };
  
  return categoryMap[category] || category;
};
