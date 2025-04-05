
import React from 'react';
import { useNavigate } from 'react-router-dom';
import ScanButton from '@/components/features/ScanButton';
import { useIsMobile } from '@/hooks/use-mobile';
import HomeHeader from '@/components/features/home/HomeHeader';
import WidgetGrid from '@/components/features/home/WidgetGrid';
import FeatureCardGrid from '@/components/features/home/FeatureCardGrid';
import QuickInfo from '@/components/features/home/QuickInfo';

const Index = () => {
  const navigate = useNavigate();
  const { isMobile } = useIsMobile();

  const handleScan = () => {
    navigate('/scan');
  };

  return (
    <div className="space-y-5 py-3 sm:space-y-6 sm:py-4 w-full">
      {/* Header */}
      <HomeHeader />

      {/* Main scan button */}
      <div className="flex justify-center my-4 sm:my-6">
        <ScanButton 
          className="transform hover:scale-105 transition-transform active:scale-95 touch-manipulation" 
          onScan={handleScan}
        />
      </div>

      {/* Widgets section */}
      <WidgetGrid />

      {/* Feature cards */}
      <FeatureCardGrid />

      {/* Quick info */}
      <QuickInfo className="mt-5 sm:mt-6" />
    </div>
  );
};

export default Index;
