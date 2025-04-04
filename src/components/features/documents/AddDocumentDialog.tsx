
import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, Camera, Upload, Loader2, Save, Maximize2, Minimize2, File as FileIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
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

interface DocumentItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  tags: string[];
  date: string;
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
  currentCategory = 'Personal',
  categories = ['Personal', 'Work'],
  isEditing = false,
  editItem = null
}) => {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(currentCategory);
  const [tags, setTags] = useState('');
  const [date, setDate] = useState('');
  const [file, setFile] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileType, setFileType] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [fullScreenPreview, setFullScreenPreview] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form when dialog opens/closes or when editing mode changes
  useEffect(() => {
    if (open) {
      if (isEditing && editItem) {
        setTitle(editItem.title);
        setDescription(editItem.description || '');
        setCategory(editItem.category);
        setTags(editItem.tags ? editItem.tags.join(', ') : '');
        setDate(editItem.date);
        setFile(editItem.file || null);
        setFileName(editItem.fileName || '');
        setFileType(editItem.fileType || '');
      } else {
        // New item - reset form
        setTitle('');
        setDescription('');
        setCategory(currentCategory);
        setTags('');
        setDate('');
        setFile(null);
        setFileName('');
        setFileType('');
      }
    }
  }, [open, currentCategory, isEditing, editItem]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }

    const newItem: DocumentItem = {
      id: isEditing && editItem ? editItem.id : Date.now().toString(),
      title,
      description: description || undefined,
      category,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      date: date || new Date().toISOString().split('T')[0],
      file,
      fileName: fileName || undefined,
      fileType: fileType || undefined,
    };

    onAdd(newItem);
    onOpenChange(false);

    toast({
      title: isEditing ? "Item updated" : "Item added",
      description: isEditing 
        ? `${title} has been updated successfully` 
        : `${title} has been added to ${category}`,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
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
          
          // Only trigger AI analysis for images
          if (detectedFileType === 'image') {
            setShowAnalysisModal(true);
          }
        }
      };
      reader.readAsDataURL(selectedFile);
    }
  };
  
  const handleCameraCapture = async () => {
    try {
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      // Create video element
      const video = document.createElement('video');
      video.srcObject = stream;
      
      // Create canvas to capture frame
      const canvas = document.createElement('canvas');
      
      // When video can play, capture a frame
      video.onloadedmetadata = () => {
        video.play();
        
        // Set canvas dimensions
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw video frame to canvas
        const context = canvas.getContext('2d');
        if (context) {
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          // Convert canvas to image data
          const imageData = canvas.toDataURL('image/jpeg');
          setFile(imageData);
          setFileName("camera_capture_" + new Date().toISOString().substring(0, 10) + ".jpg");
          setFileType('image');
          
          // Stop camera stream
          stream.getTracks().forEach(track => track.stop());
          
          // Trigger AI analysis
          setShowAnalysisModal(true);
        }
      };
    } catch (err) {
      console.error('Error accessing camera:', err);
      toast({
        title: "Camera Error",
        description: "Could not access camera. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFileName('');
    setFileType('');
  };

  const toggleFullScreenPreview = () => {
    setFullScreenPreview(!fullScreenPreview);
  };

  const handleAnalysisComplete = (result: AnalysisResult) => {
    // Apply AI analysis results to form fields
    if (result.title) setTitle(result.title);
    if (result.category && categories.includes(result.category)) setCategory(result.category);
    if (result.description) setDescription(result.description);
    if (result.tags) setTags(result.tags.join(', '));
    if (result.date) setDate(result.date);
    
    // Close analysis modal
    setShowAnalysisModal(false);
    
    toast({
      title: "AI Analysis Complete",
      description: "We've pre-filled the form based on your image",
    });
  };

  // If in full screen mode for image preview, show a simplified view
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

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md bg-background text-foreground border-gray-700">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Item" : "Add New Item"}
            </DialogTitle>
            <DialogDescription>
              Add a document, image, or any other file to your collection
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[60vh] pr-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-gray-300">Title*</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter title"
                  required
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-gray-300">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white">
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-gray-300">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter description"
                  rows={3}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags" className="text-gray-300">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g., important, work, personal"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date" className="text-gray-300">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">File</Label>
                {file ? (
                  <div className="relative">
                    <FilePreview 
                      file={file}
                      fileName={fileName}
                      fileType={fileType}
                      className="w-full h-48"
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
                ) : (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
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
                    
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                      onClick={handleCameraCapture}
                      disabled={isUploading}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Take Photo
                    </Button>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="*/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  Supported files: images, PDFs, documents, spreadsheets, and more
                </p>
              </div>

              <div className="pt-4">
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => onOpenChange(false)}
                    className="border-gray-700 text-white hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-todo-purple hover:bg-todo-purple/90"
                  >
                    {isEditing ? (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Update Item
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Item
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </div>
            </form>
          </ScrollArea>
        </DialogContent>
      </Dialog>
      
      <ImageAnalysisModal
        imageData={fileType === 'image' ? file : null}
        isOpen={showAnalysisModal}
        onAnalysisComplete={handleAnalysisComplete}
        onClose={() => setShowAnalysisModal(false)}
      />
    </>
  );
};

export default AddDocumentDialog;
