'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

type Webhook = {
  id: string;
  database_id: string;
  url: string;
  active: boolean;
  created_time: string;
};

export default function WebhookAdminPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('');
  
  // 새 Webhook 생성 폼 상태
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [databaseId, setDatabaseId] = useState(process.env.NEXT_PUBLIC_NOTION_DATABASE_ID || '');
  const [creatingWebhook, setCreatingWebhook] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);
  
  // Webhook 목록 로드
  const loadWebhooks = async () => {
    if (!apiKey) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('/api/notion-webhook-admin', {
        headers: {
          'x-api-key': apiKey
        }
      });
      
      setWebhooks(response.data.webhooks || []);
    } catch (err) {
      setError('Webhook 목록을 불러오는 데 실패했습니다.');
      console.error('Webhook 로드 오류:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Webhook 생성
  const createWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey || !newWebhookUrl || !databaseId) {
      setError('API 키, URL, 데이터베이스 ID가 모두 필요합니다.');
      return;
    }
    
    try {
      setCreatingWebhook(true);
      setError(null);
      
      await axios.post(
        '/api/notion-webhook-admin',
        {
          url: newWebhookUrl,
          databaseId
        },
        {
          headers: {
            'x-api-key': apiKey
          }
        }
      );
      
      // 생성 성공 후 폼 초기화 및 목록 새로고침
      setNewWebhookUrl('');
      setCreateSuccess(true);
      loadWebhooks();
      
      // 성공 메시지 3초 후 제거
      setTimeout(() => {
        setCreateSuccess(false);
      }, 3000);
    } catch (err) {
      setError('Webhook 생성에 실패했습니다.');
      console.error('Webhook 생성 오류:', err);
    } finally {
      setCreatingWebhook(false);
    }
  };
  
  // Webhook 삭제
  const deleteWebhook = async (webhookId: string) => {
    if (!apiKey) return;
    
    if (!confirm('이 Webhook을 삭제하시겠습니까?')) {
      return;
    }
    
    try {
      await axios.delete(`/api/notion-webhook-admin?id=${webhookId}`, {
        headers: {
          'x-api-key': apiKey
        }
      });
      
      // 삭제 후 목록 새로고침
      loadWebhooks();
    } catch (err) {
      setError('Webhook 삭제에 실패했습니다.');
      console.error('Webhook 삭제 오류:', err);
    }
  };
  
  // API 키 변경 시 자동으로 Webhook 목록 로드
  useEffect(() => {
    if (apiKey) {
      loadWebhooks();
    }
  }, [apiKey]);
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Notion Webhook 관리</h1>
      
      {/* API 키 입력 폼 */}
      <div className="mb-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">API 인증</h2>
        <div className="flex gap-4">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="관리자 API 키를 입력하세요"
            className="flex-1 p-2 border rounded"
          />
          <button
            onClick={loadWebhooks}
            disabled={!apiKey}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            인증
          </button>
        </div>
      </div>
      
      {/* 오류 메시지 */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">
          {error}
        </div>
      )}
      
      {/* 성공 메시지 */}
      {createSuccess && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded">
          Webhook이 성공적으로 생성되었습니다!
        </div>
      )}
      
      {/* 새 Webhook 생성 폼 */}
      {apiKey && (
        <div className="mb-8 p-4 bg-gray-100 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">새 Webhook 생성</h2>
          <form onSubmit={createWebhook}>
            <div className="mb-4">
              <label className="block mb-2">데이터베이스 ID</label>
              <input
                type="text"
                value={databaseId}
                onChange={(e) => setDatabaseId(e.target.value)}
                placeholder="Notion 데이터베이스 ID"
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">Webhook URL</label>
              <input
                type="url"
                value={newWebhookUrl}
                onChange={(e) => setNewWebhookUrl(e.target.value)}
                placeholder="https://yourdomain.com/api/notion-webhook"
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <button
              type="submit"
              disabled={creatingWebhook || !newWebhookUrl || !databaseId}
              className="px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-300"
            >
              {creatingWebhook ? '생성 중...' : 'Webhook 생성'}
            </button>
          </form>
        </div>
      )}
      
      {/* Webhook 목록 */}
      {apiKey && (
        <div className="bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold p-4 border-b">등록된 Webhook 목록</h2>
          
          {loading ? (
            <div className="p-4 text-center">불러오는 중...</div>
          ) : webhooks.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              등록된 Webhook이 없습니다
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-3 text-left">ID</th>
                    <th className="p-3 text-left">데이터베이스 ID</th>
                    <th className="p-3 text-left">URL</th>
                    <th className="p-3 text-left">상태</th>
                    <th className="p-3 text-left">생성일</th>
                    <th className="p-3 text-left">작업</th>
                  </tr>
                </thead>
                <tbody>
                  {webhooks.map((webhook) => (
                    <tr key={webhook.id} className="border-t">
                      <td className="p-3">{webhook.id.substring(0, 8)}...</td>
                      <td className="p-3">{webhook.database_id.substring(0, 8)}...</td>
                      <td className="p-3 truncate max-w-xs">{webhook.url}</td>
                      <td className="p-3">
                        {webhook.active ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded">활성</span>
                        ) : (
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded">비활성</span>
                        )}
                      </td>
                      <td className="p-3">{new Date(webhook.created_time).toLocaleString()}</td>
                      <td className="p-3">
                        <button
                          onClick={() => deleteWebhook(webhook.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 