
import React, { useState } from 'react';
import { Camera, Upload, ScanBarcode, Send, X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/hooks/use-theme';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface AIFoodAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

type ChatMessage = {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

const AIFoodAssistant: React.FC<AIFoodAssistantProps> = ({ isOpen, onClose }) => {
  const { theme } = useTheme();
  const { isMobile } = useIsMobile();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'How would you like to start your food query?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [activeScanOption, setActiveScanOption] = useState<'camera' | 'upload' | 'barcode' | null>(null);

  const handleClose = () => {
    onClose();
    // Reset scan option when closing
    setActiveScanOption(null);
  };

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages([...messages, newUserMessage]);
    
    // Simulate assistant response
    setTimeout(() => {
      const assistantResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I'll help you with "${input}". What would you like to know?`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantResponse]);
    }, 1000);

    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleOptionClick = (option: 'camera' | 'upload' | 'barcode') => {
    setActiveScanOption(option);
    
    // Add user message indicating their choice
    const actionMap = {
      camera: 'take a picture',
      upload: 'upload an image',
      barcode: 'scan a barcode'
    };
    
    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: `I want to ${actionMap[option]}`,
      timestamp: new Date(),
    };
    
    setMessages([...messages, newUserMessage]);
    
    // This would be where you integrate with your existing functionality
    // For now, we'll just simulate a response
    setTimeout(() => {
      const assistantResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I'm ready to ${actionMap[option]}. This feature will be integrated with your existing scanning functionality.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantResponse]);
    }, 1000);
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent 
        side="left" 
        className={cn(
          "flex flex-col p-0 w-full sm:max-w-md",
          theme === 'dark' ? 'bg-background text-foreground' : 'bg-white'
        )}
        preventNavigateOnClose
      >
        <SheetHeader className="px-4 py-3 border-b">
          <SheetTitle className="text-lg">AI Food Assistant</SheetTitle>
        </SheetHeader>
        
        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={cn(
                "flex max-w-[80%] mb-2 rounded-lg p-3",
                message.role === 'user' 
                  ? "ml-auto bg-primary text-primary-foreground" 
                  : "bg-muted"
              )}
            >
              {message.content}
            </div>
          ))}
        </div>
        
        {/* Action buttons when no scanning option is active */}
        {!activeScanOption && (
          <div className="p-4 space-y-3 border-t">
            <div className="flex gap-2 overflow-x-auto pb-2">
              <Button 
                variant="outline" 
                className="flex items-center gap-2 flex-1"
                onClick={() => handleOptionClick('camera')}
              >
                <Camera className="h-4 w-4" />
                <span>Take a Picture</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex items-center gap-2 flex-1"
                onClick={() => handleOptionClick('upload')}
              >
                <Upload className="h-4 w-4" />
                <span>Upload Image</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex items-center gap-2 flex-1"
                onClick={() => handleOptionClick('barcode')}
              >
                <ScanBarcode className="h-4 w-4" />
                <span>Scan Barcode</span>
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your food query..."
                className="flex-1"
              />
              <Button 
                size="icon" 
                onClick={handleSendMessage}
                disabled={!input.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        
        {/* Show different UI based on active scanning option */}
        {activeScanOption && (
          <div className="p-4 space-y-4 border-t">
            <div className="flex justify-between items-center">
              <span className="font-medium">
                {activeScanOption === 'camera' && 'Take a Picture'}
                {activeScanOption === 'upload' && 'Upload an Image'}
                {activeScanOption === 'barcode' && 'Scan a Barcode'}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setActiveScanOption(null)}
              >
                <X className="h-4 w-4" />
                <span className="ml-2">Cancel</span>
              </Button>
            </div>
            
            {/* Placeholder for actual functionality integration */}
            <div className="bg-muted h-64 rounded-md flex items-center justify-center">
              {activeScanOption === 'camera' && (
                <div className="text-center">
                  <Camera className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                  <p>Camera integration will go here</p>
                </div>
              )}
              
              {activeScanOption === 'upload' && (
                <div className="text-center">
                  <Upload className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                  <p>File upload integration will go here</p>
                </div>
              )}
              
              {activeScanOption === 'barcode' && (
                <div className="text-center">
                  <ScanBarcode className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                  <p>Barcode scanner integration will go here</p>
                </div>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default AIFoodAssistant;
