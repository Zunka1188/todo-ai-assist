
import React from 'react';
import AppHeader from '@/components/layout/AppHeader';
import ScanningOptions from '@/components/features/scanning/ScanningOptions';

const ScanPage = () => {
  return (
    <div className="space-y-6 py-4">
      <AppHeader 
        title="Scan & Capture" 
        subtitle="Capture and process information with AI"
      />
      <ScanningOptions />
    </div>
  );
};

export default ScanPage;
