import { NextResponse } from 'next/server';
import { increment } from '@/lib/notion';
import { apiLogger } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    const { slug } = await request.json();
    
    if (!slug) {
      apiLogger.error('[API] views/increment: Missing slug parameter');
      return NextResponse.json({ error: 'Missing slug parameter' }, { status: 400 });
    }

    apiLogger.info(`[API] views/increment: Incrementing view count for slug: ${slug}`);
    const views = await increment(slug);
    apiLogger.info(`[API] views/increment: Successfully updated views for ${slug} to ${views}`);

    return NextResponse.json({ views });
  } catch (error) {
    apiLogger.error('[API] views/increment: Error updating view count:', error);
    return NextResponse.json(
      { error: 'Failed to update view count' },
      { status: 500 }
    );
  }
}