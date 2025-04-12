
import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = 'Loading documents...', 
  size = 'medium',
  className = ''
}) => {
  const iconSize = size === 'small' ? 'h-6 w-6' : size === 'large' ? 'h-12 w-12' : 'h-8 w-8';
  const textSize = size === 'small' ? 'text-sm' : size === 'large' ? 'text-lg' : 'text-base';
  
  return (
    <div className={`flex justify-center items-center h-full w-full min-h-[200px] ${className}`}>
      <div className="text-center">
        <Loader2 className={`${iconSize} animate-spin mx-auto mb-4 text-primary`} />
        <p className={`${textSize} text-muted-foreground`}>{message}</p>
      </div>
    </div>
  );
};

export default LoadingState;
