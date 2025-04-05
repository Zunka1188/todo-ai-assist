
import React from 'react';
import { Camera, Scan, FileText, Calendar, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';

interface ScanButtonProps {
  className?: string;
  onScan?: () => void;
  isProcessing?: boolean;
  label?: string;
  scanMode?: 'product' | 'receipt' | 'invitation' | 'document' | 'shopping' | 'barcode' | 'smart';
  size?: 'default' | 'lg' | 'sm';
  variant?: 'default' | 'primary' | 'outline';
}

const ScanButton: React.FC<ScanButtonProps> = ({ 
  className, 
  onScan, 
  isProcessing = false,
  label,
  scanMode = 'smart',
  size = 'default',
  variant = 'default'
}) => {
  const { toast } = useToast();
  const { isMobile } = useIsMobile();
  const navigate = useNavigate();

  const handleScan = () => {
    if (isProcessing) return;
    
    // Store the scan mode and return path
    sessionStorage.setItem('preferredScanMode', scanMode);
      
    let toastTitle = "Smart Scanner Activated";
    let toastDescription = "Looking for products and barcodes...";
    
    switch(scanMode) {
      case 'product':
        toastTitle = "Product Scan";
        toastDescription = "Point camera at a product";
        break;
      case 'barcode':
        toastTitle = "Barcode Scan";
        toastDescription = "Aligning with barcode...";
        break;
      case 'receipt':
        toastTitle = "Receipt Scan";
        toastDescription = "Capturing expense information";
        break;
      case 'invitation':
        toastTitle = "Invitation Scan";
        toastDescription = "Capturing event details";
        break;
      case 'document':
        toastTitle = "Document Scan";
        toastDescription = "Capturing document content";
        break;
      case 'shopping':
        toastTitle = "Shopping Item Scan";
        toastDescription = "Add items to your shopping list";
        break;
      case 'smart':
      default:
        // Already set default values above
        break;
    }
    
    toast({
      title: toastTitle,
      description: toastDescription,
    });
    
    if (onScan) {
      onScan();
    } else {
      // Navigate to the scan page by default
      navigate('/scan');
    }
  };

  const getScanIcon = () => {
    switch(scanMode) {
      case 'barcode':
        return <Scan size={isMobile ? 22 : 28} />;
      case 'product':
        return <ShoppingBag size={isMobile ? 22 : 28} />;
      case 'receipt':
        return <FileText size={isMobile ? 22 : 28} />;
      case 'invitation':
        return <Calendar size={isMobile ? 22 : 28} />;
      case 'document':
        return <FileText size={isMobile ? 22 : 28} />;
      case 'shopping':
        return <ShoppingBag size={isMobile ? 22 : 28} />;
      case 'smart':
      default:
        return <Camera size={isMobile ? 24 : 32} />;
    }
  };

  const getSizeClasses = () => {
    switch(size) {
      case 'lg':
        return isMobile ? "p-5 min-h-[70px] min-w-[70px]" : "p-7";
      case 'sm':
        return "p-3 min-h-[50px] min-w-[50px]";
      default:
        return isMobile ? "p-4 min-h-[60px] min-w-[60px]" : "p-6";
    }
  };

  const getVariantClasses = () => {
    switch(variant) {
      case 'primary':
        return "bg-secondary text-primary shadow-sm";
      case 'outline':
        return "bg-transparent border-2 border-primary text-primary shadow-sm";
      default:
        return "bg-todo-purple text-white shadow-lg";
    }
  };

  return (
    <button
      onClick={handleScan}
      disabled={isProcessing}
      className={cn(
        "rounded-full flex items-center justify-center",
        "touch-action-manipulation",
        "hover:shadow-xl transition-all duration-300 active:scale-95",
        "focus:outline-none focus:ring-2 focus:ring-todo-purple focus:ring-opacity-50",
        isProcessing ? "opacity-70 cursor-not-allowed" : "",
        getSizeClasses(),
        getVariantClasses(),
        className
      )}
      aria-label={label || "Scan with camera"}
    >
      {scanMode && label ? (
        <div className="flex items-center">
          {getScanIcon()}
          <span className="ml-2">{label}</span>
        </div>
      ) : label ? (
        <div className="flex items-center">
          <Camera size={isMobile ? 22 : 28} />
          <span className="ml-2">{label}</span>
        </div>
      ) : (
        getScanIcon()
      )}
    </button>
  );
};

export default ScanButton;
