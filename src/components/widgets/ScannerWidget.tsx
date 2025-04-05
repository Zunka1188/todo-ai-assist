
import React from 'react';
import { Scan } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const ScannerWidget = () => {
  const navigate = useNavigate();
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border dark:border-gray-700">
      <div className="flex flex-col items-center justify-center space-y-3">
        <div className="bg-todo-purple bg-opacity-10 p-4 rounded-full">
          <Scan className="h-8 w-8 text-todo-purple" />
        </div>
        <h3 className="font-medium text-lg">Smart Scanner</h3>
        <p className="text-sm text-muted-foreground text-center">
          Scan and automatically process documents, receipts, and more
        </p>
        <Button 
          onClick={() => navigate('/scan')}
          className="w-full bg-todo-purple hover:bg-todo-purple/90"
        >
          Open Scanner
        </Button>
      </div>
    </div>
  );
};

export default ScannerWidget;
