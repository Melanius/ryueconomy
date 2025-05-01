import { notion } from '../notionClient';
import { logger } from '../logger';
import crypto from 'crypto';
import axios from 'axios';

// Notion API 기본 URL
const NOTION_API_BASE_URL = 'https://api.notion.com/v1';

/**
 * Webhook 목록 가져오기
 */
export async function getWebhooks() {
  try {
    const response = await axios.get(`${NOTION_API_BASE_URL}/webhooks`, {
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      }
    });
    
    logger.info('Webhook 목록 가져오기 성공', { count: response.data.results.length });
    return response.data.results;
  } catch (error) {
    logger.error('Webhook 목록 가져오기 오류', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    throw error;
  }
}

/**
 * 새 Webhook 생성
 * @param databaseId Notion 데이터베이스 ID
 * @param url Webhook 엔드포인트 URL
 */
export async function createWebhook(databaseId: string, url: string) {
  try {
    const response = await axios.post(
      `${NOTION_API_BASE_URL}/webhooks`,
      {
        database_id: databaseId,
        url: url,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.NOTION_TOKEN}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json'
        }
      }
    );
    
    logger.info('새 Webhook 생성됨', { 
      webhookId: response.data.id,
      url: url,
      databaseId: databaseId
    });
    
    return response.data;
  } catch (error) {
    logger.error('Webhook 생성 오류', { 
      error: error instanceof Error ? error.message : String(error),
      databaseId: databaseId,
      url: url
    });
    throw error;
  }
}

/**
 * Webhook 삭제
 * @param webhookId 삭제할 Webhook ID
 */
export async function deleteWebhook(webhookId: string) {
  try {
    await axios.delete(`${NOTION_API_BASE_URL}/webhooks/${webhookId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN}`,
        'Notion-Version': '2022-06-28'
      }
    });
    
    logger.info('Webhook 삭제됨', { webhookId });
    return true;
  } catch (error) {
    logger.error('Webhook 삭제 오류', { 
      error: error instanceof Error ? error.message : String(error),
      webhookId
    });
    throw error;
  }
}

/**
 * Webhook 시그니처 검증
 * @param signature Notion에서 제공하는 시그니처
 * @param body 요청 본문 (원시 문자열)
 * @param secret Webhook 시크릿
 */
export function verifyWebhookSignature(signature: string, body: string, secret: string): boolean {
  try {
    // HMAC SHA-256 서명 생성
    const hmac = crypto.createHmac('sha256', secret);
    const computedSignature = hmac.update(body).digest('hex');
    
    // 시그니처 비교 (타이밍 공격 방지를 위해 상수 시간 비교 사용)
    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(computedSignature, 'hex')
    );
    
    if (isValid) {
      logger.info('Webhook 시그니처 검증 성공');
    } else {
      logger.warn('Webhook 시그니처 검증 실패');
    }
    
    return isValid;
  } catch (error) {
    logger.error('Webhook 시그니처 검증 오류', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    return false;
  }
} 