
import React, { useRef, useEffect, useState } from 'react';
import { ArrowLeft, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import AppHeader from '@/components/layout/AppHeader';
import ShoppingList from '@/components/features/shopping/ShoppingList';
import { useIsMobile } from '@/hooks/use-mobile';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Slider } from '@/components/ui/slider';

const ShoppingPage = () => {
  const navigate = useNavigate();
  const { isMobile, orientation } = useIsMobile();
  const contentRef = useRef<HTMLDivElement>(null);
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);

  const goBack = () => {
    navigate('/');
  };

  useEffect(() => {
    // Get initial dimensions
    if (contentRef.current) {
      const content = contentRef.current;
      const updateDimensions = () => {
        setContentHeight(content.scrollHeight);
        setViewportHeight(window.innerHeight);
      };

      updateDimensions();

      // Add scroll event listener to update slider position
      const handleScroll = () => {
        const maxScroll = content.scrollHeight - window.innerHeight;
        if (maxScroll <= 0) return; // Avoid division by zero
        
        const currentScroll = content.scrollTop;
        const percentage = (currentScroll / maxScroll) * 100;
        setScrollPercentage(percentage);
      };

      content.addEventListener('scroll', handleScroll);
      window.addEventListener('resize', updateDimensions);

      return () => {
        content.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', updateDimensions);
      };
    }
  }, []);

  // Handle slider change
  const handleSliderChange = (value: number[]) => {
    if (contentRef.current) {
      const maxScroll = contentRef.current.scrollHeight - window.innerHeight;
      const scrollTo = (value[0] / 100) * maxScroll;
      
      contentRef.current.scrollTo({
        top: scrollTo,
        behavior: 'smooth'
      });
    }
  };

  // Only show slider if content exceeds viewport
  const showSlider = contentHeight > viewportHeight;

  return (
    <div className="flex h-screen">
      {showSlider && !isMobile && (
        <div className="flex flex-col justify-center px-2 py-8">
          <Slider
            value={[scrollPercentage]}
            onValueChange={handleSliderChange}
            orientation="vertical"
            className="h-[70vh]"
            min={0}
            max={100}
            step={1}
          />
        </div>
      )}
      
      <div 
        ref={contentRef}
        className="flex flex-col pb-20 sm:pb-0 py-1 sm:py-4 px-2 sm:px-6 md:px-8 container mx-auto max-w-4xl overflow-y-auto hide-scrollbar smooth-scroll"
      >
        <div className="flex items-center justify-between mb-1 md:mb-4 sticky top-0 z-10 bg-background/80 backdrop-blur-sm py-2">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={goBack} 
              className="mr-2 md:mr-3 h-9 w-9 md:h-10 md:w-10"
              aria-label="Go back to home"
            >
              <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
            <AppHeader 
              title="Shopping" 
              subtitle="Track what you need to buy"
              className="py-0"
            />
          </div>
          {!isMobile && <ThemeToggle />}
        </div>
        <div className="w-full flex-1 mt-2">
          <ShoppingList />
        </div>
      </div>
    </div>
  );
};

export default ShoppingPage;
