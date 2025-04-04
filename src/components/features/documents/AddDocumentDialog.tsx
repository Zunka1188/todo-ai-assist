
import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, Camera, Upload, Loader2, Save, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
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
import ImageAnalysisModal from './ImageAnalysisModal';
import { AnalysisResult } from '@/utils/imageAnalysis';

interface DocumentItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  tags: string[];
  date: string;
  image?: string | null;
}

interface AddDocumentDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (item: DocumentItem) => void;
  currentCategory: string;
  categories: string[];
  isEditing?: boolean;
  editItem?: DocumentItem | null;
}

const AddDocumentDialog: React.FC<AddDocumentDialogProps> = ({
  open,
  onClose,
  onAdd,
  currentCategory,
  categories,
  isEditing = false,
  editItem = null
}) => {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(currentCategory);
  const [tags, setTags] = useState('');
  const [date, setDate] = useState('');
  const [image, setImage] = useState<string | null>(null);
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
        setImage(editItem.image || null);
      } else {
        // New item - reset form
        setTitle('');
        setDescription('');
        setCategory(currentCategory);
        setTags('');
        setDate('');
        setImage(null);
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
      image,
    };

    onAdd(newItem);
    onClose();

    toast({
      title: isEditing ? "Item updated" : "Item added",
      description: isEditing 
        ? `${title} has been updated successfully` 
        : `${title} has been added to ${category}`,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const imageData = event.target.result as string;
          setImage(imageData);
          setIsUploading(false);
          // Trigger AI analysis
          setShowAnalysisModal(true);
        }
      };
      reader.readAsDataURL(file);
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
          setImage(imageData);
          
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

  const handleRemoveImage = () => {
    setImage(null);
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
  if (fullScreenPreview && image) {
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
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center overflow-auto">
          <img 
            src={image} 
            alt="Full screen preview" 
            className="max-h-full max-w-full object-contain"
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-md bg-background text-foreground border-gray-700">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Item" : "Add New Item"}
            </DialogTitle>
          </DialogHeader>

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
              <Label className="text-gray-300">Image</Label>
              {image ? (
                <div className="relative">
                  <img 
                    src={image} 
                    alt="Preview" 
                    className="w-full h-48 object-contain border rounded-md border-gray-700"
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70 text-white"
                      onClick={toggleFullScreenPreview}
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={handleRemoveImage}
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
                    Upload Image
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
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
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
          </form>
        </DialogContent>
      </Dialog>
      
      <ImageAnalysisModal
        imageData={image}
        isOpen={showAnalysisModal}
        onAnalysisComplete={handleAnalysisComplete}
        onClose={() => setShowAnalysisModal(false)}
      />
    </>
  );
};

export default AddDocumentDialog;
