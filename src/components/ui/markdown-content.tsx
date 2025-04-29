'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';

interface MarkdownContentProps {
  content: string;
}

export default function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <div className="prose prose-stone prose-headings:font-display prose-headings:font-bold mx-auto lg:prose-lg prose-headings:text-primary">
      <ReactMarkdown
        rehypePlugins={[
          rehypeRaw,
          rehypeSanitize,
          rehypeSlug,
        ]}
        remarkPlugins={[remarkGfm]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
} 