
/**
 * Bundle optimization utilities
 * 
 * This file provides utilities for optimizing bundles and managing assets.
 * It works in conjunction with the code splitting utilities.
 */

import { logger } from './logger';

/**
 * Load a script dynamically
 * @param src Script source URL
 * @param async Whether to load the script asynchronously
 * @param defer Whether to defer script loading
 */
export function loadScript(
  src: string, 
  async: boolean = true, 
  defer: boolean = true
): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = async;
    script.defer = defer;
    
    script.onload = () => {
      logger.log(`[BundleOptimization] Script loaded: ${src}`);
      resolve();
    };
    
    script.onerror = (error) => {
      logger.error(`[BundleOptimization] Failed to load script: ${src}`, error);
      reject(error);
    };
    
    document.head.appendChild(script);
  });
}

/**
 * Preconnect to origins for resources that will be needed
 * @param origins Array of origins to preconnect to
 * @param crossOrigin Whether the connection is cross-origin
 */
export function preconnectToOrigins(
  origins: string[], 
  crossOrigin: boolean = true
): void {
  origins.forEach(origin => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = origin;
    if (crossOrigin) {
      link.crossOrigin = 'anonymous';
    }
    document.head.appendChild(link);
  });
  
  logger.log(`[BundleOptimization] Preconnected to origins: ${origins.join(', ')}`);
}

/**
 * Preload critical assets
 * @param assets Array of asset URLs to preload
 * @param type Asset type (e.g., 'image', 'style', 'script')
 */
export function preloadAssets(
  assets: string[], 
  type: 'image' | 'style' | 'script' | 'font' = 'image'
): void {
  assets.forEach(asset => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = asset;
    link.as = type;
    
    if (type === 'font') {
      link.crossOrigin = 'anonymous';
    }
    
    document.head.appendChild(link);
  });
  
  logger.log(`[BundleOptimization] Preloaded ${assets.length} ${type} assets`);
}

/**
 * Dynamically import a module with controlled priority
 * @param importFunc Function that imports the module
 * @param priority Whether to load with high priority
 */
export function importWithPriority<T>(
  importFunc: () => Promise<T>,
  priority: 'high' | 'low' = 'high'
): Promise<T> {
  // For modern browsers that support loading priority
  if ('connection' in navigator && (navigator as any).connection?.saveData) {
    // If the user is in data saver mode, always use low priority
    priority = 'low';
  }
  
  if (priority === 'low' && 'requestIdleCallback' in window) {
    return new Promise(resolve => {
      (window as any).requestIdleCallback(() => {
        importFunc().then(resolve);
      });
    });
  }
  
  return importFunc();
}

/**
 * Initialize bundle optimizations
 * @param options Configuration options
 */
export function initBundleOptimizations(options: {
  preconnect?: string[];
  preloadImages?: string[];
  preloadFonts?: string[];
  preloadScripts?: string[];
  preloadStyles?: string[];
  enableIntersectionLoading?: boolean;
}): void {
  logger.log('[BundleOptimization] Initializing bundle optimizations');
  
  // Preconnect to origins
  if (options.preconnect && options.preconnect.length > 0) {
    preconnectToOrigins(options.preconnect);
  }
  
  // Preload assets
  if (options.preloadImages && options.preloadImages.length > 0) {
    preloadAssets(options.preloadImages, 'image');
  }
  
  if (options.preloadFonts && options.preloadFonts.length > 0) {
    preloadAssets(options.preloadFonts, 'font');
  }
  
  if (options.preloadScripts && options.preloadScripts.length > 0) {
    preloadAssets(options.preloadScripts, 'script');
  }
  
  if (options.preloadStyles && options.preloadStyles.length > 0) {
    preloadAssets(options.preloadStyles, 'style');
  }
  
  // Setup intersection observer based lazy loading
  if (options.enableIntersectionLoading && 'IntersectionObserver' in window) {
    setupIntersectionBasedLoading();
  }
  
  logger.log('[BundleOptimization] Bundle optimizations initialized');
}

/**
 * Setup intersection observer based lazy loading for images and iframes
 */
function setupIntersectionBasedLoading(): void {
  const lazyLoadElements = document.querySelectorAll('[data-lazy-src], [data-lazy-srcset]');
  
  if (lazyLoadElements.length === 0) return;
  
  const lazyLoadObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target as HTMLImageElement | HTMLIFrameElement;
        
        if (element.dataset.lazySrc) {
          element.src = element.dataset.lazySrc;
          delete element.dataset.lazySrc;
        }
        
        if (element.dataset.lazySrcset) {
          element.srcset = element.dataset.lazySrcset;
          delete element.dataset.lazySrcset;
        }
        
        observer.unobserve(element);
      }
    });
  });
  
  lazyLoadElements.forEach(element => {
    lazyLoadObserver.observe(element);
  });
  
  logger.log(`[BundleOptimization] Set up lazy loading for ${lazyLoadElements.length} elements`);
}
