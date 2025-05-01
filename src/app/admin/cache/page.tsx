'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/layouts/AdminLayout';

// 캐시 모니터링 페이지
export default function CacheMonitoringPage() {
  const router = useRouter();
  
  // 상태 관리
  const [cacheStatus, setCacheStatus] = useState<{
    success: boolean;
    status: string;
    size: number;
    timestamp: string;
  } | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pattern, setPattern] = useState('*');
  const [invalidateLoading, setInvalidateLoading] = useState(false);
  const [invalidateResult, setInvalidateResult] = useState<{
    success: boolean;
    message: string;
    invalidatedCount: number;
  } | null>(null);
  const [apiKey, setApiKey] = useState('');
  
  // 캐시 상태 가져오기
  const fetchCacheStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/cache');
      
      if (!response.ok) {
        throw new Error(`API 응답 오류: ${response.status}`);
      }
      
      const data = await response.json();
      setCacheStatus(data);
    } catch (err) {
      console.error('캐시 상태 가져오기 오류:', err);
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
    } finally {
      setLoading(false);
    }
  };
  
  // 캐시 무효화
  const invalidateCache = async () => {
    try {
      setInvalidateLoading(true);
      setInvalidateResult(null);
      
      const response = await fetch(`/api/cache?apiKey=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pattern }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API 응답 오류: ${response.status}`);
      }
      
      const data = await response.json();
      setInvalidateResult(data);
      
      // 무효화 성공 시 상태 새로고침
      if (data.success) {
        await fetchCacheStatus();
      }
    } catch (err) {
      console.error('캐시 무효화 오류:', err);
      setInvalidateResult({
        success: false,
        message: err instanceof Error ? err.message : '알 수 없는 오류',
        invalidatedCount: 0,
      });
    } finally {
      setInvalidateLoading(false);
    }
  };
  
  // 페이지 로드 시 캐시 상태 가져오기
  useEffect(() => {
    fetchCacheStatus();
    
    // 자동 새로고침 (30초마다)
    const interval = setInterval(fetchCacheStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  // 자동 새로고침 처리
  const handleRefresh = () => {
    fetchCacheStatus();
  };
  
  // 패턴 변경 처리
  const handlePatternChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPattern(e.target.value);
  };
  
  // API 키 변경 처리
  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value);
  };
  
  // 무효화 폼 제출 처리
  const handleInvalidateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    invalidateCache();
  };
  
  return (
    <AdminLayout title="캐시 모니터링">
      <div className="space-y-8">
        {/* 캐시 상태 섹션 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">캐시 상태</h2>
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={handleRefresh}
              disabled={loading}
            >
              {loading ? '불러오는 중...' : '새로고침'}
            </button>
          </div>
          
          {error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <p>오류: {error}</p>
            </div>
          ) : loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : cacheStatus ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded">
                  <h3 className="text-sm text-gray-500">상태</h3>
                  <p className={`text-lg font-medium ${
                    cacheStatus.status.includes('경고') 
                      ? 'text-red-600' 
                      : cacheStatus.status.includes('주의') 
                        ? 'text-yellow-600' 
                        : 'text-green-600'
                  }`}>
                    {cacheStatus.status}
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded">
                  <h3 className="text-sm text-gray-500">캐시 크기</h3>
                  <p className="text-lg font-medium">
                    {cacheStatus.size} 개 항목
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded">
                <h3 className="text-sm text-gray-500">마지막 갱신 시간</h3>
                <p className="text-lg font-medium">
                  {new Date(cacheStatus.timestamp).toLocaleString('ko-KR')}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">캐시 상태를 불러올 수 없습니다.</p>
          )}
        </div>
        
        {/* 캐시 무효화 섹션 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">캐시 무효화</h2>
          
          <form onSubmit={handleInvalidateSubmit} className="space-y-4">
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
                API 키
              </label>
              <input
                type="password"
                id="apiKey"
                value={apiKey}
                onChange={handleApiKeyChange}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                관리자 API 키를 입력하세요 (환경 변수에 설정된 ADMIN_API_KEY 값).
              </p>
            </div>
            
            <div>
              <label htmlFor="pattern" className="block text-sm font-medium text-gray-700 mb-1">
                무효화 패턴
              </label>
              <input
                type="text"
                id="pattern"
                value={pattern}
                onChange={handlePatternChange}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                무효화할 캐시 키 패턴을 입력하세요. '*'는 와일드카드로 사용됩니다. 예: 'posts:*', 'post:123', '*'
              </p>
            </div>
            
            <div>
              <button
                type="submit"
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-red-300"
                disabled={invalidateLoading || !apiKey}
              >
                {invalidateLoading ? '처리 중...' : '캐시 무효화 실행'}
              </button>
            </div>
          </form>
          
          {invalidateResult && (
            <div className={`mt-4 p-4 rounded ${
              invalidateResult.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              <p>
                {invalidateResult.success 
                  ? `성공: ${invalidateResult.message}` 
                  : `오류: ${invalidateResult.message}`}
              </p>
            </div>
          )}
        </div>
        
        {/* 캐시 사용 가이드 섹션 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">캐시 사용 가이드</h2>
          
          <div className="space-y-4 text-gray-700">
            <p>
              이 페이지에서는 Notion API 호출 결과를 저장하는 캐시 시스템을 모니터링하고 관리할 수 있습니다.
            </p>
            
            <div>
              <h3 className="text-lg font-medium mb-2">캐시 상태 확인</h3>
              <p>
                현재 캐시에 저장된 항목 수와 상태를 확인할 수 있습니다. 캐시 크기가 너무 커지면 주의나 경고 메시지가 표시됩니다.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">캐시 무효화</h3>
              <p>
                특정 패턴의 캐시를 강제로 삭제할 수 있습니다. 이 기능은 다음과 같은 상황에서 유용합니다:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Notion 데이터가 변경되었지만 웹사이트에 반영되지 않을 때</li>
                <li>캐시 오류가 발생하여 잘못된 데이터가 표시될 때</li>
                <li>캐시 크기가 너무 커서 성능 이슈가 발생할 때</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">주요 캐시 패턴</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li><code className="bg-gray-100 px-1 py-0.5 rounded">posts:*</code> - 모든 포스트 목록 캐시</li>
                <li><code className="bg-gray-100 px-1 py-0.5 rounded">post:*</code> - 개별 포스트 캐시</li>
                <li><code className="bg-gray-100 px-1 py-0.5 rounded">recent:*</code> - 최신 포스트 목록 캐시</li>
                <li><code className="bg-gray-100 px-1 py-0.5 rounded">popular:*</code> - 인기 포스트 목록 캐시</li>
                <li><code className="bg-gray-100 px-1 py-0.5 rounded">categories:*</code> - 카테고리 정보 캐시</li>
                <li><code className="bg-gray-100 px-1 py-0.5 rounded">*</code> - 모든 캐시</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
