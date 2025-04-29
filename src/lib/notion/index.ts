// src/lib/notion/index.ts
// This file re-exports the core functionalities from the refactored modules.

// Export client instance and IDs (if needed externally)
export { notion, databaseId, metricsDbId } from './client';

// Export utility functions
export { countBlockTypes, escapeHTML, isEmoji } from './utils';

// Export page fetching and processing functions
export {
  pageToPost,
  validateNotionConfig,
  // testNotionConnection is internal, not exported
  getPostById,
  getPostBySlug,
  getAllPosts
} from './page';

// Export block fetching and rendering functions
export {
  getBlocks, // Get direct children of a block
  getPageBlocks, // Get all blocks for a page recursively
  getPageContentAndThumbnail, // High-level function for page content
  renderBlocksToHtml, // Render blocks to HTML
  renderBlocksToHtmlWithListHandling, // Render blocks with list handling
  findFirstImage, // Find first image in blocks
  // Internal functions are not exported
} from './blocks';

// Optionally, re-export types if they are defined within these modules
// and needed externally. Currently, types like BlogPost and CategoryId
// are imported from '@/types/post'. Notion API types are imported directly. 