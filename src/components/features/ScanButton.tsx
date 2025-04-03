
import React from 'react';
import { Camera } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

interface ScanButtonProps {
  className?: string;
  onScan?: () => void;
}

const ScanButton: React.FC<ScanButtonProps> = ({ className, onScan }) => {
  const { toast } = useToast();

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
        "metallic-button p-6 rounded-full flex items-center justify-center",
        "bg-todo-purple text-white shadow-lg",
        "hover:shadow-xl transition-all duration-300 hover:-translate-y-1",
        className
      )}
    >
      <Camera size={32} />
    </button>
  );
};

export default ScanButton;
