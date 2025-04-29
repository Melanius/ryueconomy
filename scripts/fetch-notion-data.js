// Fetch and save Notion database data for debugging and development
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { Client } = require('@notionhq/client');

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  console.log(`Loading environment from ${envPath}`);
  dotenv.config({ path: envPath });
} else {
  console.log('No .env.local file found, trying default .env');
  dotenv.config();
}

// Set up Notion client
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const databaseId = process.env.NOTION_DATABASE_ID;

// Ensure output directory exists
const outputDir = path.resolve(process.cwd(), '.notion-data');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Helper to save data to a JSON file
function saveToJson(filename, data) {
  const filePath = path.join(outputDir, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`Saved data to ${filePath}`);
  return filePath;
}

// Fetch database structure
async function fetchDatabaseStructure() {
  console.log('Fetching database structure...');
  
  try {
    const database = await notion.databases.retrieve({
      database_id: databaseId,
    });
    
    const structure = {
      id: database.id,
      title: database.title[0]?.plain_text || 'Untitled',
      properties: Object.entries(database.properties).map(([name, prop]) => ({
        name,
        type: prop.type,
        options: prop.type === 'select' ? prop.select.options : undefined,
        multiOptions: prop.type === 'multi_select' ? prop.multi_select.options : undefined,
      })),
    };
    
    const filePath = saveToJson('database-structure.json', structure);
    return { success: true, filePath, structure };
  } catch (error) {
    console.error('Error fetching database structure:', error);
    return { success: false, error };
  }
}

// Fetch pages from the database
async function fetchPages(limit = 10) {
  console.log(`Fetching up to ${limit} pages...`);
  
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      page_size: limit,
    });
    
    // Save full page data
    saveToJson('pages-raw.json', response.results);
    
    // Save simplified page data
    const simplifiedPages = response.results.map(page => {
      try {
        // Extract title from common property names
        const title = extractTitle(page);
        
        // Extract other common properties
        return {
          id: page.id,
          title,
          url: page.url,
          created_time: page.created_time,
          last_edited_time: page.last_edited_time,
          propertyNames: Object.keys(page.properties),
        };
      } catch (err) {
        console.error('Error processing page:', err);
        return { id: page.id, error: err.message };
      }
    });
    
    const filePath = saveToJson('pages-simplified.json', simplifiedPages);
    console.log(`Successfully fetched ${response.results.length} pages`);
    return { success: true, filePath, count: response.results.length };
  } catch (error) {
    console.error('Error fetching pages:', error);
    return { success: false, error };
  }
}

// Helper to extract title from a page
function extractTitle(page) {
  // Look for common title property names
  const titleProps = ['title', 'Title', 'Name', 'name'];
  
  for (const propName of titleProps) {
    const prop = page.properties[propName];
    if (prop && prop.type === 'title' && prop.title.length > 0) {
      return prop.title.map(t => t.plain_text).join('');
    }
  }
  
  return 'Untitled';
}

// Fetch page content for a specific page
async function fetchPageContent(pageId) {
  console.log(`Fetching content for page ${pageId}...`);
  
  try {
    const blocks = await notion.blocks.children.list({
      block_id: pageId,
    });
    
    const filePath = saveToJson(`page-content-${pageId.substring(0, 8)}.json`, blocks.results);
    return { success: true, filePath, blockCount: blocks.results.length };
  } catch (error) {
    console.error(`Error fetching content for page ${pageId}:`, error);
    return { success: false, error };
  }
}

// Main function
async function main() {
  console.log('Starting Notion data export...');
  
  // Check environment variables
  if (!process.env.NOTION_TOKEN) {
    console.error('❌ NOTION_TOKEN environment variable is not set');
    process.exit(1);
  }
  
  if (!process.env.NOTION_DATABASE_ID) {
    console.error('❌ NOTION_DATABASE_ID environment variable is not set');
    process.exit(1);
  }
  
  // Export database structure
  const dbResult = await fetchDatabaseStructure();
  if (!dbResult.success) {
    console.error('Failed to fetch database structure, stopping');
    process.exit(1);
  }
  
  // Export pages
  const pagesResult = await fetchPages(5); // Limit to 5 pages for safety
  if (!pagesResult.success) {
    console.error('Failed to fetch pages, stopping');
    process.exit(1);
  }
  
  // If we have pages, get content for the first one
  if (pagesResult.count > 0) {
    try {
      const pages = require(path.join(outputDir, 'pages-simplified.json'));
      if (pages && pages.length > 0) {
        const firstPageId = pages[0].id;
        await fetchPageContent(firstPageId);
      }
    } catch (error) {
      console.error('Error processing page content:', error);
    }
  }
  
  console.log('\n✅ Notion data export completed successfully');
  console.log(`Data saved to: ${outputDir}`);
}

// Run the script
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 