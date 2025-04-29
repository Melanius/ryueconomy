import { NextResponse } from 'next/server';
import { Client } from '@notionhq/client';
import { DatabaseObjectResponse, PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';

export async function GET() {
  try {
    const notionApiKey = process.env.NOTION_API_KEY;
    const notionDatabaseId = process.env.NOTION_DATABASE_ID;
    
    // Check for required environment variables
    if (!notionApiKey || !notionDatabaseId) {
      return NextResponse.json({ 
        error: 'Notion API key or database ID is missing',
        apiKeyExists: !!notionApiKey,
        databaseIdExists: !!notionDatabaseId
      }, { status: 500 });
    }

    // Initialize Notion client
    const notion = new Client({ auth: notionApiKey });
    
    // Test database connection
    try {
      const database = await notion.databases.retrieve({
        database_id: notionDatabaseId
      }) as DatabaseObjectResponse;
      
      // Get database structure
      const properties = Object.entries(database.properties).map(([name, prop]) => ({
        name,
        type: prop.type
      }));
      
      // Try to query some pages
      const pages = await notion.databases.query({
        database_id: notionDatabaseId,
        page_size: 5
      });
      
      // Format response
      return NextResponse.json({
        success: true,
        database: {
          id: database.id,
          title: 'title' in database && database.title.length > 0 
            ? database.title[0].plain_text 
            : 'Untitled',
          propertiesCount: properties.length,
          properties
        },
        pages: {
          count: pages.results.length,
          sample: pages.results.slice(0, 3).map((page) => {
            const pageObj = page as PageObjectResponse;
            const title = pageObj.properties.title?.type === 'title' 
              ? pageObj.properties.title.title.map(t => t.plain_text).join('') 
              : (pageObj.properties.Title?.type === 'title' 
                ? pageObj.properties.Title.title.map(t => t.plain_text).join('') 
                : 'Untitled');
            
            return {
              id: pageObj.id,
              title,
              lastEdited: pageObj.last_edited_time
            };
          })
        }
      });
      
    } catch (dbError) {
      console.error('Notion database access error:', dbError);
      return NextResponse.json({ 
        error: 'Failed to access Notion database',
        message: dbError instanceof Error ? dbError.message : String(dbError),
        databaseId: notionDatabaseId
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Notion API error:', error);
    return NextResponse.json({ 
      error: 'Error connecting to Notion API',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 