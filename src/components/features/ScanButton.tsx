
import React from 'react';
import { Camera } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface ScanButtonProps {
  className?: string;
  onScan?: () => void;
}

const ScanButton: React.FC<ScanButtonProps> = ({ className, onScan }) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleScan = () => {
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
      className={cn(
        "metallic-button p-4 sm:p-6 rounded-full flex items-center justify-center",
        "bg-todo-purple text-white shadow-lg touch-action-manipulation",
        "hover:shadow-xl transition-all duration-300 active:scale-95",
        isMobile ? "min-h-[60px] min-w-[60px]" : "",
        className
      )}
    >
      <Camera size={isMobile ? 28 : 32} />
    </button>
  );
};

export default ScanButton;
