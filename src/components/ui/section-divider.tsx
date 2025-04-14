
import React from 'react';
import { Separator } from '@/components/ui/separator';

interface SectionDividerProps {
  className?: string;
}

const SectionDivider: React.FC<SectionDividerProps> = ({ className = "" }) => {
  return (
    <div className={`py-4 ${className}`}>
      <Separator />
    </div>
  );
};

export default SectionDivider;
