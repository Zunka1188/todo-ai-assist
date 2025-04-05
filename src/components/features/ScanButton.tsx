import React from 'react';
import { Camera, Scan } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';

interface ScanButtonProps {
  className?: string;
  onScan?: () => void;
  isProcessing?: boolean;
  label?: string;
  scanMode?: 'product' | 'receipt' | 'invitation' | 'document';
}

const ScanButton: React.FC<ScanButtonProps> = ({ 
  className, 
  onScan, 
  isProcessing = false,
  label,
  scanMode
}) => {
  const { toast } = useToast();
  const { isMobile } = useIsMobile();
  const navigate = useNavigate();

  const handleScan = () => {
    if (isProcessing) return;
    
    if (scanMode) {
      sessionStorage.setItem('preferredScanMode', scanMode);
      toast({
        title: `${scanMode.charAt(0).toUpperCase() + scanMode.slice(1)} Scan Mode`,
        description: `Activating scanner in ${scanMode} detection mode...`,
      });
    } else {
      toast({
        title: "Camera Activated",
        description: "Scanning for items...",
      });
    }
    
    if (onScan) {
      onScan();
    } else {
      navigate('/scan');
    }
  };

  return (
    <button
      onClick={handleScan}
      disabled={isProcessing}
      className={cn(
        "rounded-full flex items-center justify-center",
        "bg-todo-purple text-white shadow-lg touch-action-manipulation",
        "hover:shadow-xl transition-all duration-300 active:scale-95",
        "focus:outline-none focus:ring-2 focus:ring-todo-purple focus:ring-opacity-50",
        isProcessing ? "opacity-70 cursor-not-allowed" : "",
        isMobile ? "p-4 min-h-[56px] min-w-[56px]" : "p-6",
        className
      )}
      aria-label={label || "Scan with camera"}
    >
      {scanMode ? (
        <div className="flex items-center">
          <Scan size={isMobile ? 20 : 24} className="mr-2" />
          {label || (scanMode.charAt(0).toUpperCase() + scanMode.slice(1))}
        </div>
      ) : (
        <>
          <Camera size={isMobile ? 22 : 28} />
          {label && <span className="ml-2">{label}</span>}
        </>
      )}
    </button>
  );
};

export default ScanButton;
