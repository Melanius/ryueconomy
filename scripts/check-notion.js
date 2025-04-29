// Check Notion API configuration and connection
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  console.log(`Loading environment from ${envPath}`);
  dotenv.config({ path: envPath });
} else {
  console.log('No .env.local file found, trying default .env');
  dotenv.config();
}

const { Client } = require('@notionhq/client');

async function checkNotionConfig() {
  console.log('Checking Notion API configuration...');
  
  // Check environment variables
  const apiKey = process.env.NOTION_API_KEY;
  const databaseId = process.env.NOTION_DATABASE_ID;
  
  console.log('Environment variables loaded:', Object.keys(process.env).filter(key => key.startsWith('NOTION_')));
  
  if (!apiKey) {
    console.error('❌ NOTION_API_KEY is not set in environment variables');
    return false;
  } else {
    console.log('✅ NOTION_API_KEY is set');
  }
  
  if (!databaseId) {
    console.error('❌ NOTION_DATABASE_ID is not set in environment variables');
    return false;
  } else {
    console.log('✅ NOTION_DATABASE_ID is set:', databaseId.substring(0, 4) + '...');
  }
  
  // Initialize Notion client
  const notion = new Client({ auth: apiKey });
  
  // Test connection
  try {
    console.log('Testing Notion API connection...');
    const database = await notion.databases.retrieve({ database_id: databaseId });
    
    console.log('✅ Successfully connected to Notion database');
    console.log('Database title:', database.title[0]?.plain_text || 'Untitled');
    
    // Check database properties
    console.log('\nDatabase properties:');
    const properties = database.properties;
    Object.entries(properties).forEach(([key, prop]) => {
      console.log(`- ${key} (${prop.type})`);
    });
    
    // Get sample data
    console.log('\nFetching sample data...');
    const response = await notion.databases.query({
      database_id: databaseId,
      page_size: 3,
    });
    
    console.log(`✅ Successfully retrieved ${response.results.length} pages`);
    
    if (response.results.length > 0) {
      console.log('\nFirst page properties:');
      const page = response.results[0];
      const pageTitle = page.properties.title?.title[0]?.plain_text || 
                       page.properties.Name?.title[0]?.plain_text || 
                       'Untitled';
      console.log(`- ID: ${page.id}`);
      console.log(`- Title: ${pageTitle}`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error connecting to Notion API:', error.message);
    console.error('Full error:', error);
    return false;
  }
}

// Run the check
checkNotionConfig()
  .then(success => {
    if (success) {
      console.log('\n✨ Notion configuration is valid and working!');
      process.exit(0);
    } else {
      console.error('\n❌ Notion configuration check failed');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  }); 