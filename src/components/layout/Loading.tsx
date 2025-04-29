'use client';

import React from 'react';

export default function Loading() {
  return (
    <div className="flex items-center justify-center w-full min-h-[200px]">
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-sm text-gray-500">Loading content...</p>
      </div>
    </div>
  );
} 