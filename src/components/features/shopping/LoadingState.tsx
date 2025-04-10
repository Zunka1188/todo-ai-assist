
import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingState: React.FC = () => {
  return (
    <div className="w-full flex items-center justify-center p-12 min-h-[30vh]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
};

export default LoadingState;
