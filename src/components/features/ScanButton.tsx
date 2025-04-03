
import React from 'react';
import { Camera } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface ScanButtonProps {
  className?: string;
  onScan?: () => void;
  isProcessing?: boolean;
  label?: string;
}

const ScanButton: React.FC<ScanButtonProps> = ({ 
  className, 
  onScan, 
  isProcessing = false,
  label
}) => {
  const { toast } = useToast();
  const { isMobile } = useIsMobile();

  const handleScan = () => {
    if (isProcessing) return;
    
    // In a real app, this would trigger the camera
    toast({
      title: "Camera Activated",
      description: "Scanning for items...",
    });
    
    if (onScan) {
      onScan();
    }
  };

  return (
    <button
      onClick={handleScan}
      disabled={isProcessing}
      className={cn(
        "metallic-button rounded-full flex items-center justify-center",
        "bg-todo-purple text-white shadow-lg touch-action-manipulation",
        "hover:shadow-xl transition-all duration-300 active:scale-95",
        "focus:outline-none focus:ring-2 focus:ring-todo-purple focus:ring-opacity-50",
        isProcessing ? "opacity-70 cursor-not-allowed" : "",
        isMobile ? "p-4 min-h-[60px] min-w-[60px]" : "p-6",
        className
      )}
      aria-label={label || "Scan with camera"}
    >
      <Camera size={isMobile ? 24 : 32} />
      {label && <span className="ml-2">{label}</span>}
    </button>
  );
};

export default ScanButton;
