import React from 'react';
import { AIDetectionMode } from '@/services/aiDetectionService';

interface SmartScannerCaptureProps {
  preferredMode?: AIDetectionMode;
  onSaveSuccess?: (data: any) => void;
  onClose?: () => void; // Add this prop to the interface
}

const SmartScannerCapture: React.FC<SmartScannerCaptureProps> = ({
  preferredMode = 'auto',
  onSaveSuccess,
  onClose
}) => {
  // Component implementation
  // ...

  return (
    // Component rendering
    // ...
  );
};

export default SmartScannerCapture;
