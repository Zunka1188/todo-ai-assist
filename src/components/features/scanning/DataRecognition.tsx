
import React, { useState, useEffect } from 'react';
import { Loader2, Check, Edit, X, Save } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Define the types of items that can be recognized
export type RecognizedItemType = 'invitation' | 'receipt' | 'product' | 'document' | 'unknown';

export interface RecognizedItem {
  type: RecognizedItemType;
  confidence: number;
  data: Record<string, any>;
  imageData?: string;
}

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  date: z.string().optional(),
  location: z.string().optional(),
  price: z.string().optional(),
  category: z.string().optional(),
  fileName: z.string().min(1, "Filename is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface DataRecognitionProps {
  recognizedItem: RecognizedItem | null;
  isProcessing: boolean;
  onSave: (formData: FormValues, originalItem: RecognizedItem) => void;
  onCancel: () => void;
}

const DataRecognition: React.FC<DataRecognitionProps> = ({
  recognizedItem,
  isProcessing,
  onSave,
  onCancel
}) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      date: "",
      location: "",
      price: "",
      category: "",
      fileName: "",
    },
  });

  // Update form when recognized item changes
  useEffect(() => {
    if (recognizedItem) {
      const { data, type } = recognizedItem;
      
      // Generate a unique filename based on type and current date
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const autoFileName = `${type}-${timestamp}.jpg`;
      
      // Set form values based on recognized item type
      switch (type) {
        case 'invitation':
          form.reset({
            title: data.title || "",
            description: data.notes || "",
            date: data.date || "",
            location: data.location || "",
            fileName: autoFileName
          });
          break;
        case 'receipt':
          form.reset({
            title: data.store || "Receipt",
            description: `Total: ${data.total || ""}`,
            date: data.date || "",
            price: data.total || "",
            fileName: autoFileName
          });
          break;
        case 'product':
          form.reset({
            title: data.name || "",
            description: "",
            price: data.price || "",
            category: data.category || "",
            fileName: autoFileName
          });
          break;
        case 'document':
          form.reset({
            title: data.title || "Document",
            description: data.content || "",
            date: data.date || "",
            fileName: autoFileName
          });
          break;
        default:
          form.reset({
            title: "Untitled Item",
            description: "",
            fileName: autoFileName
          });
      }
    }
  }, [recognizedItem, form]);

  const handleSubmit = (data: FormValues) => {
    if (!recognizedItem) return;
    
    // Show saving toast
    toast({
      title: "Saving item...",
      description: "Your scanned item is being saved."
    });
    
    // Pass form data to parent component
    onSave(data, recognizedItem);
    
    // Reset editing state
    setIsEditing(false);
  };

  if (isProcessing) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 text-todo-purple animate-spin mb-2" />
          <p className="text-center text-muted-foreground">
            Processing image and recognizing data...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!recognizedItem) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Recognition Failed</AlertTitle>
        <AlertDescription>
          We couldn't recognize any data from the image. Please try again with a clearer image or enter the data manually.
        </AlertDescription>
      </Alert>
    );
  }

  const { type, confidence, data } = recognizedItem;
  const confidencePercentage = Math.round(confidence * 100);
  
  const getTypeIcon = () => {
    switch (type) {
      case 'invitation': return 'Calendar';
      case 'receipt': return 'Receipt';
      case 'product': return 'ShoppingBag';
      case 'document': return 'FileText';
      default: return 'File';
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case 'invitation': return 'bg-purple-100 text-todo-purple';
      case 'receipt': return 'bg-green-100 text-green-700';
      case 'product': return 'bg-blue-100 text-blue-700';
      case 'document': return 'bg-amber-100 text-amber-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={cn("p-2 rounded-full mr-3", getTypeColor())}>
            <span className="text-sm font-medium">{getTypeIcon()}</span>
          </div>
          <div>
            <h3 className="font-medium text-lg">
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </h3>
            <p className="text-sm text-muted-foreground">
              Confidence: {confidencePercentage}%
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? <X className="h-4 w-4 mr-1" /> : <Edit className="h-4 w-4 mr-1" />}
          {isEditing ? "Cancel Edit" : "Edit"}
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter title" 
                    {...field} 
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {(type === 'invitation' || type === 'receipt' || type === 'document') && (
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter date" 
                      {...field} 
                      disabled={!isEditing}
                      className={!isEditing ? "bg-gray-50" : ""}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          )}

          {(type === 'invitation') && (
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter location" 
                      {...field} 
                      disabled={!isEditing}
                      className={!isEditing ? "bg-gray-50" : ""}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          )}

          {(type === 'product' || type === 'receipt') && (
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter price" 
                      {...field} 
                      disabled={!isEditing}
                      className={!isEditing ? "bg-gray-50" : ""}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          )}

          {type === 'product' && (
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter category" 
                      {...field} 
                      disabled={!isEditing}
                      className={!isEditing ? "bg-gray-50" : ""}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Enter description" 
                    {...field} 
                    rows={3}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fileName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>File Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter file name" 
                    {...field} 
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="flex gap-3 pt-2">
            <Button 
              type="submit" 
              className="flex-1 bg-todo-purple hover:bg-todo-purple/90"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Item
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1"
              onClick={onCancel}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default DataRecognition;
