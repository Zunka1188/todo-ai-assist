import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, Upload, Loader2, Save, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from '@/components/ui/scroll-area';
import ImageAnalysisModal from './ImageAnalysisModal';
import { AnalysisResult } from '@/utils/imageAnalysis';
import FilePreview, { getFileTypeFromName } from './FilePreview';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';

interface DocumentItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  tags: string[];
  date: string;
  addedDate: string;
  file?: string | null;
  fileName?: string;
  fileType?: string;
}

interface AddDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (item: DocumentItem) => void;
  currentCategory?: string;
  categories?: string[];
  isEditing?: boolean;
  editItem?: DocumentItem | null;
}

const AddDocumentDialog: React.FC<AddDocumentDialogProps> = ({
  open,
  onOpenChange,
  onAdd,
  currentCategory = 'style',
  categories = [],
  isEditing = false,
  editItem = null
}) => {
  const { toast } = useToast();
  const { isMobile } = useIsMobile();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(currentCategory);
  const [tags, setTags] = useState('');
  const [file, setFile] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileType, setFileType] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [fullScreenPreview, setFullScreenPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setError(null);
      
      if (isEditing && editItem) {
        setTitle(editItem.title);
        setDescription(editItem.description || '');
        setCategory(editItem.category);
        setTags(editItem.tags ? editItem.tags.join(', ') : '');
        setFile(editItem.file || null);
        setFileName(editItem.fileName || '');
        setFileType(editItem.fileType || '');
      } else {
        setTitle('');
        setDescription('');
        setCategory(currentCategory);
        setTags('');
        setFile(null);
        setFileName('');
        setFileType('');
      }
    }
  }, [open, currentCategory, isEditing, editItem]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!title.trim() && !file) {
      setError("Please enter a title or add an image/file.");
      toast({
        title: "Input Required",
        description: "Please enter a title or add an image/file.",
        variant: "destructive",
      });
      return;
    }

    const today = new Date().toISOString().split('T')[0];

    const newItem: DocumentItem = {
      id: isEditing && editItem ? editItem.id : Date.now().toString(),
      title: title.trim() || (fileName ? fileName : 'Untitled Document'),
      description: description || undefined,
      category,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      date: today, // We always use today's date now
      addedDate: editItem?.addedDate || today,
      file,
      fileName: fileName || undefined,
      fileType: fileType || undefined,
    };

    try {
      onAdd(newItem);
      onOpenChange(false);

      toast({
        title: isEditing ? "Document updated" : "Document added",
        description: isEditing 
          ? `${newItem.title} has been updated successfully` 
          : `${newItem.title} has been added to ${getCategoryDisplayName(category)}`,
      });
    } catch (err) {
      console.error("Error saving document:", err);
      setError("Failed to save document. Please try again.");
      toast({
        title: "Error",
        description: "Failed to save document. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setError(null);
    
    if (!selectedFile) return;
    
    const maxSizeMB = 10;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    
    if (selectedFile.size > maxSizeBytes) {
      setError(`File size exceeds ${maxSizeMB}MB limit`);
      toast({
        title: "File too large",
        description: `The selected file exceeds the ${maxSizeMB}MB limit.`,
        variant: "destructive"
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    
    setIsUploading(true);
    setFileName(selectedFile.name);
    
    const detectedFileType = getFileTypeFromName(selectedFile.name);
    setFileType(detectedFileType);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const fileData = event.target.result as string;
        setFile(fileData);
        setIsUploading(false);
        
        if (['image', 'pdf', 'document'].includes(detectedFileType)) {
          setShowAnalysisModal(true);
        }
      }
    };
    
    reader.onerror = () => {
      setIsUploading(false);
      setError("Failed to read file. Please try again.");
      toast({
        title: "Error",
        description: "Failed to read file. Please try again.",
        variant: "destructive"
      });
    };
    
    reader.readAsDataURL(selectedFile);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFileName('');
    setFileType('');
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toggleFullScreenPreview = () => {
    setFullScreenPreview(!fullScreenPreview);
  };

  const handleAnalysisComplete = (result: AnalysisResult) => {
    if (result.title) setTitle(result.title);
    
    if (result.category) {
      const lowerCaseCategory = result.category.toLowerCase();
      if (categories.some(cat => cat.toLowerCase() === lowerCaseCategory)) {
        setCategory(lowerCaseCategory);
      }
    }
    
    if (result.description) setDescription(result.description);
    if (result.tags) setTags(result.tags.join(', '));
    
    setShowAnalysisModal(false);
    
    toast({
      title: "AI Analysis Complete",
      description: "We've pre-filled the form based on your file",
    });
  };

  const getCategoryDisplayName = (cat: string): string => {
    return cat.charAt(0).toUpperCase() + cat.slice(1);
  };

  if (fullScreenPreview && file && fileType === 'image') {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        <div className="p-4 flex justify-between items-center bg-black/80">
          <Button 
            variant="ghost" 
            size="icon"
            className="text-white" 
            onClick={toggleFullScreenPreview}
          >
            <Minimize2 className="h-6 w-6" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            className="text-white" 
            onClick={() => onOpenChange(false)}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center overflow-auto">
          <img 
            src={file} 
            alt="Full screen preview" 
            className="max-h-full max-w-full object-contain"
          />
        </div>
      </div>
    );
  }

  const dialogContent = (
    <>
      <div className={isMobile ? "pb-4 space-y-4" : "space-y-4"}>
        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title*</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter title"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="file">File</Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  Upload File
                </Button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="*/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Supported files: images, PDFs, documents, spreadsheets, and more (max 10MB)
              </p>
            </div>
            
            {file && (
              <div className="relative mt-2">
                <FilePreview 
                  file={file}
                  fileName={fileName}
                  fileType={fileType}
                  className="max-h-48 w-full"
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  {fileType === 'image' && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70 text-white"
                      onClick={toggleFullScreenPreview}
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={handleRemoveFile}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {getCategoryDisplayName(cat)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
              rows={3}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., important, work, personal"
            />
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {isMobile ? (
        <Drawer open={open} onOpenChange={onOpenChange}>
          <DrawerContent className="max-h-[90vh] overflow-hidden">
            <DrawerHeader className="px-4 py-2">
              <DrawerTitle>{isEditing ? "Edit Document" : "Add New Document"}</DrawerTitle>
            </DrawerHeader>
            
            <ScrollArea 
              className="p-4 pt-0 flex-1 overflow-auto max-h-[65vh]" 
              scrollRef={scrollRef}
              style={{ WebkitOverflowScrolling: 'touch', paddingBottom: '100px' }}
            >
              {dialogContent}
              <div className="h-16"></div>
            </ScrollArea>
            
            <DrawerFooter className="px-4 py-2 gap-2 border-t mt-auto">
              <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                className="w-full bg-todo-purple hover:bg-todo-purple/90"
                disabled={isUploading || (!title.trim() && !file)}
              >
                {isEditing ? "Save Changes" : "Add Document"}
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent 
            className="sm:max-w-md max-h-[90vh] overflow-hidden bg-background text-foreground border-gray-700"
            preventNavigateOnClose={true}
          >
            <DialogHeader>
              <DialogTitle>
                {isEditing ? "Edit Document" : "Add New Document"}
              </DialogTitle>
              <DialogDescription>
                Add a document, image, or any other file to your collection
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="max-h-[calc(90vh-10rem)] pr-4" scrollRef={scrollRef}>
              <form onSubmit={handleSubmit} className="space-y-4">
                {dialogContent}
                
                <div className="pt-4">
                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => onOpenChange(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-todo-purple hover:bg-todo-purple/90"
                      disabled={isUploading || (!title.trim() && !file)}
                    >
                      {isEditing ? (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Update Document
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Document
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </div>
              </form>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
      
      <ImageAnalysisModal
        imageData={file}
        fileName={fileName}
        isOpen={showAnalysisModal}
        onAnalysisComplete={handleAnalysisComplete}
        onClose={() => setShowAnalysisModal(false)}
      />
    </>
  );
};

export default AddDocumentDialog;
