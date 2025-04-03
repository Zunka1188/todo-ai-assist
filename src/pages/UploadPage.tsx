
import React from 'react';
import { Upload, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '@/components/layout/AppHeader';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

const UploadPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // In a real app, this would process the file
      toast({
        title: "File Selected",
        description: `Processing: ${e.target.files[0].name}`,
      });
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // In a real app, this would process the file
      toast({
        title: "File Dropped",
        description: `Processing: ${e.dataTransfer.files[0].name}`,
      });
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const goBack = () => {
    navigate('/');
  };

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center mb-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={goBack} 
          className="mr-2"
          aria-label="Go back to home"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <AppHeader 
          title="Upload" 
          subtitle="Import images for AI processing"
          className="py-0"
        />
      </div>
      
      <div
        className="border-2 border-dashed border-todo-purple/30 rounded-xl p-10 text-center"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="bg-todo-purple bg-opacity-10 p-5 rounded-full">
            <Upload className="h-10 w-10 text-todo-purple" />
          </div>
          <div className="space-y-2">
            <h3 className="font-medium text-foreground dark:text-white">Upload Files</h3>
            <p className="text-sm text-muted-foreground dark:text-gray-300 max-w-xs mx-auto">
              Drag and drop files here, or click to select files to upload for AI processing
            </p>
          </div>
          <label className="metallic-button cursor-pointer">
            Select Files
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </label>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700">
        <h3 className="font-medium text-foreground dark:text-white mb-4">Supported File Types</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2 text-foreground dark:text-gray-300">
            <p>• Images (JPG, PNG, HEIC)</p>
            <p>• Documents (PDF)</p>
          </div>
          <div className="space-y-2 text-foreground dark:text-gray-300">
            <p>• Screenshots</p>
            <p>• Receipts</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
