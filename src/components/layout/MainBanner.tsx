'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface MainBannerProps {
  title?: string;
  subtitle?: string;
  showAd?: boolean;
  adClient?: string;
  adSlot?: string;
}

export function MainBanner({
  title = "RYUE's Blog",
  subtitle = "A place for thoughts, ideas, and experiments",
  showAd = false,
  adClient,
  adSlot,
}: MainBannerProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('[MainBanner] Component mounted');
    
    if (showAd && adClient && adSlot) {
      console.log('[MainBanner] Loading AdSense script...');
      // Load Google AdSense script
      const script = document.createElement('script');
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`;
      script.async = true;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);

      // Set loading to false after a delay to simulate ad loading
      const timer = setTimeout(() => {
        console.log('[MainBanner] Ad loaded');
        setLoading(false);
      }, 1000);

      return () => {
        console.log('[MainBanner] Component unmounting, cleaning up...');
        clearTimeout(timer);
        // Remove the script when component unmounts
        if (document.head.contains(script)) {
          document.head.removeChild(script);
          console.log('[MainBanner] AdSense script removed');
        }
      };
    } else {
      setLoading(false);
    }
  }, [showAd, adClient, adSlot]);

  const handleBlogClick = useCallback(() => {
    console.log('[MainBanner] Blog link clicked');
  }, []);

  const handleNewsletterClick = useCallback(() => {
    console.log('[MainBanner] Newsletter section clicked');
    // TODO: Implement newsletter subscription logic
  }, []);

  return (
    <div className="w-full mb-8">
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-slate-800 dark:to-slate-900">
        <div className="flex flex-col md:flex-row items-center justify-between p-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center md:text-left mb-4 md:mb-0"
          >
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{title}</h2>
            <p className="text-slate-700 dark:text-slate-300">{subtitle}</p>
            <div className="mt-4">
              <Link 
                href="/blog" 
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                onClick={handleBlogClick}
              >
                Go to Blog →
              </Link>
            </div>
          </motion.div>

          {showAd && adClient && adSlot ? (
            <div className="w-full md:w-[336px] h-[280px] bg-white dark:bg-slate-800 rounded-lg overflow-hidden shadow-sm">
              {loading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Loading ad...</p>
                </div>
              ) : (
                <ins
                  className="adsbygoogle"
                  style={{ display: 'block' }}
                  data-ad-client={adClient}
                  data-ad-slot={adSlot}
                  data-ad-format="auto"
                  data-full-width-responsive="true"
                />
              )}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm cursor-pointer"
              onClick={handleNewsletterClick}
            >
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Get notified of new updates!
                <br />
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Subscribe to my newsletter.
                </span>
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
} 