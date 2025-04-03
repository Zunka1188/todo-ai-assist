
import React, { useState, useEffect } from 'react';
import { Loader2, Check, Edit, X, Save, Calendar, Receipt, ShoppingBag, FileText, Trash2 } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';

// Define the types of items that can be recognized
export type RecognizedItemType = 'invitation' | 'receipt' | 'product' | 'document' | 'unknown';

export interface RecognizedItem {
  type: RecognizedItemType;
  confidence: number;
  data: Record<string, any>;
  imageData?: string;
  // New properties for enhanced recognition
  extractedText?: string;
  detectedObjects?: Array<{
    name: string;
    confidence: number;
    boundingBox?: { x: number, y: number, width: number, height: number };
  }>;
}

// Base form schema with common fields
const baseFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  fileName: z.string().min(1, "Filename is required"),
  saveImage: z.boolean().default(true),
});

// Extended schemas for specific item types
const productFormSchema = baseFormSchema.extend({
  price: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  addToShoppingList: z.boolean().default(false),
  saveToDocuments: z.boolean().default(true),
});

const invitationFormSchema = baseFormSchema.extend({
  date: z.string().optional(),
  time: z.string().optional(),
  location: z.string().optional(),
  organizer: z.string().optional(),
  addToCalendar: z.boolean().default(true),
});

const receiptFormSchema = baseFormSchema.extend({
  store: z.string().optional(),
  date: z.string().optional(),
  total: z.string().optional(),
  items: z.array(z.object({
    name: z.string(),
    price: z.string(),
  })).optional(),
  saveToSpending: z.boolean().default(true),
});

const documentFormSchema = baseFormSchema.extend({
  date: z.string().optional(),
  author: z.string().optional(),
  tags: z.string().optional(),
});

// Combined form schema that conditionally validates based on item type
const formSchema = z.discriminatedUnion('itemType', [
  z.object({ itemType: z.literal('product'), ...productFormSchema.shape }),
  z.object({ itemType: z.literal('invitation'), ...invitationFormSchema.shape }),
  z.object({ itemType: z.literal('receipt'), ...receiptFormSchema.shape }),
  z.object({ itemType: z.literal('document'), ...documentFormSchema.shape }),
  z.object({ itemType: z.literal('unknown'), ...baseFormSchema.shape }),
]);

type FormValues = z.infer<typeof formSchema>;

interface DataRecognitionProps {
  recognizedItem: RecognizedItem | null;
  isProcessing: boolean;
  onSave: (formData: any, originalItem: RecognizedItem) => void;
  onCancel: () => void;
}

const DataRecognition: React.FC<DataRecognitionProps> = ({
  recognizedItem,
  isProcessing,
  onSave,
  onCancel
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showExtractedText, setShowExtractedText] = useState(false);
  const [currentItemType, setCurrentItemType] = useState<RecognizedItemType>('unknown');
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      itemType: 'unknown',
      title: "",
      description: "",
      fileName: "",
      saveImage: true,
    },
  });

  // Update form when recognized item changes
  useEffect(() => {
    if (recognizedItem) {
      const { data, type } = recognizedItem;
      setCurrentItemType(type);
      
      // Generate a unique filename based on type and current date
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const autoFileName = `${type}-${timestamp}.jpg`;
      
      // Set form values based on recognized item type
      switch (type) {
        case 'invitation':
          form.reset({
            itemType: 'invitation',
            title: data.title || "",
            description: data.notes || "",
            date: data.date || "",
            time: data.time || "",
            location: data.location || "",
            organizer: data.organizer || "",
            fileName: autoFileName,
            saveImage: true,
            addToCalendar: true,
          });
          break;
        case 'receipt':
          form.reset({
            itemType: 'receipt',
            title: data.store || "Receipt",
            description: data.items?.map((item: any) => `${item.name}: ${item.price}`).join('\n') || "",
            store: data.store || "",
            date: data.date || "",
            total: data.total || "",
            fileName: autoFileName,
            saveImage: true,
            saveToSpending: true,
          });
          break;
        case 'product':
          form.reset({
            itemType: 'product',
            title: data.name || "",
            description: data.description || "",
            price: data.price || "",
            category: data.category || "",
            brand: data.brand || "",
            fileName: autoFileName,
            saveImage: true,
            addToShoppingList: true,
            saveToDocuments: false,
          });
          break;
        case 'document':
          form.reset({
            itemType: 'document',
            title: data.title || "Document",
            description: data.content || "",
            date: data.date || "",
            author: data.author || "",
            tags: "",  // Initialize with empty tags
            fileName: autoFileName,
            saveImage: true,
          });
          break;
        default:
          form.reset({
            itemType: 'unknown',
            title: "Untitled Item",
            description: "",
            fileName: autoFileName,
            saveImage: true,
          });
      }
    }
  }, [recognizedItem, form]);

  // Function to handle type change manually
  const handleTypeChange = (newType: RecognizedItemType) => {
    if (!recognizedItem) return;
    
    setCurrentItemType(newType);
    
    // Get current form values to preserve what user has entered
    const currentValues = form.getValues();
    
    // Reset form with the new item type but preserve common fields
    switch (newType) {
      case 'invitation':
        form.reset({
          itemType: 'invitation',
          title: currentValues.title,
          description: currentValues.description,
          date: "",
          time: "",
          location: "",
          organizer: "",
          fileName: currentValues.fileName,
          saveImage: currentValues.saveImage,
          addToCalendar: true,
        });
        break;
      case 'receipt':
        form.reset({
          itemType: 'receipt',
          title: currentValues.title,
          description: currentValues.description,
          store: "",
          date: "",
          total: "",
          fileName: currentValues.fileName,
          saveImage: currentValues.saveImage,
          saveToSpending: true,
        });
        break;
      case 'product':
        form.reset({
          itemType: 'product',
          title: currentValues.title,
          description: currentValues.description,
          price: "",
          category: "",
          brand: "",
          fileName: currentValues.fileName,
          saveImage: currentValues.saveImage,
          addToShoppingList: true,
          saveToDocuments: false,
        });
        break;
      case 'document':
        form.reset({
          itemType: 'document',
          title: currentValues.title,
          description: currentValues.description,
          date: "",
          author: "",
          tags: "",
          fileName: currentValues.fileName,
          saveImage: currentValues.saveImage,
        });
        break;
      default:
        form.reset({
          itemType: 'unknown',
          title: currentValues.title,
          description: currentValues.description,
          fileName: currentValues.fileName,
          saveImage: currentValues.saveImage,
        });
    }
    
    // Show toast about changing the item type
    toast({
      title: "Item Type Changed",
      description: `The item type has been changed to ${newType}. Please fill in any additional details.`,
    });
    
    // Auto-enable editing when changing type
    setIsEditing(true);
  };

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

  // Helper function to navigate to a specific page based on form values
  const handleActionClick = (action: string) => {
    const formData = form.getValues();
    
    switch (action) {
      case 'shopping':
        // Create a pre-filled shopping item
        const shoppingItem = {
          name: formData.title,
          description: formData.description,
          price: formData.itemType === 'product' ? formData.price : undefined,
        };
        // Store in session storage (in a real app, would use a proper state management system)
        sessionStorage.setItem('newShoppingItem', JSON.stringify(shoppingItem));
        navigate('/shopping');
        break;
      case 'calendar':
        // Create a pre-filled calendar event
        const calendarEvent = {
          title: formData.title,
          description: formData.description,
          date: formData.itemType === 'invitation' ? formData.date : undefined,
          time: formData.itemType === 'invitation' ? formData.time : undefined,
          location: formData.itemType === 'invitation' ? formData.location : undefined,
        };
        // Store in session storage (in a real app, would use a proper state management system)
        sessionStorage.setItem('newCalendarEvent', JSON.stringify(calendarEvent));
        navigate('/calendar');
        break;
      case 'spending':
        // Create a pre-filled receipt
        const receipt = {
          title: formData.title,
          store: formData.itemType === 'receipt' ? formData.store : undefined,
          date: formData.itemType === 'receipt' ? formData.date : undefined,
          total: formData.itemType === 'receipt' ? formData.total : undefined,
        };
        // Store in session storage (in a real app, would use a proper state management system)
        sessionStorage.setItem('newReceipt', JSON.stringify(receipt));
        navigate('/spending');
        break;
      case 'documents':
        // Create a pre-filled document
        const document = {
          title: formData.title,
          content: formData.description,
          date: formData.itemType === 'document' ? formData.date : undefined,
          author: formData.itemType === 'document' ? formData.author : undefined,
        };
        // Store in session storage (in a real app, would use a proper state management system)
        sessionStorage.setItem('newDocument', JSON.stringify(document));
        navigate('/documents');
        break;
    }
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

  const { type, confidence, data, extractedText, detectedObjects } = recognizedItem;
  const confidencePercentage = Math.round(confidence * 100);
  
  const getTypeIcon = () => {
    switch (currentItemType) {
      case 'invitation': return <Calendar className="h-5 w-5" />;
      case 'receipt': return <Receipt className="h-5 w-5" />;
      case 'product': return <ShoppingBag className="h-5 w-5" />;
      case 'document': return <FileText className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getTypeColor = () => {
    switch (currentItemType) {
      case 'invitation': return 'bg-purple-100 text-todo-purple';
      case 'receipt': return 'bg-green-100 text-green-700';
      case 'product': return 'bg-blue-100 text-blue-700';
      case 'document': return 'bg-amber-100 text-amber-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Function to get action buttons based on the current item type
  const getActionButtons = () => {
    const buttons = [];
    
    switch (currentItemType) {
      case 'invitation':
        buttons.push(
          <Button 
            key="calendar"
            variant="outline" 
            className="flex items-center"
            onClick={() => handleActionClick('calendar')}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Add to Calendar
          </Button>
        );
        break;
      case 'receipt':
        buttons.push(
          <Button 
            key="spending"
            variant="outline" 
            className="flex items-center"
            onClick={() => handleActionClick('spending')}
          >
            <Receipt className="h-4 w-4 mr-2" />
            Track Expense
          </Button>
        );
        break;
      case 'product':
        buttons.push(
          <Button 
            key="shopping"
            variant="outline" 
            className="flex items-center mr-2"
            onClick={() => handleActionClick('shopping')}
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            Add to Shopping
          </Button>
        );
        break;
      case 'document':
        buttons.push(
          <Button 
            key="documents"
            variant="outline" 
            className="flex items-center"
            onClick={() => handleActionClick('documents')}
          >
            <FileText className="h-4 w-4 mr-2" />
            View in Documents
          </Button>
        );
        break;
    }
    
    return buttons;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={cn("p-2 rounded-full mr-3", getTypeColor())}>
            {getTypeIcon()}
          </div>
          <div>
            <h3 className="font-medium text-lg">
              {currentItemType.charAt(0).toUpperCase() + currentItemType.slice(1)}
            </h3>
            <p className="text-sm text-muted-foreground">
              Confidence: {confidencePercentage}%
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          {extractedText && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExtractedText(!showExtractedText)}
            >
              {showExtractedText ? "Hide Text" : "Show Text"}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? <X className="h-4 w-4 mr-1" /> : <Edit className="h-4 w-4 mr-1" />}
            {isEditing ? "Cancel Edit" : "Edit"}
          </Button>
        </div>
      </div>

      {showExtractedText && extractedText && (
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md text-sm font-mono max-h-32 overflow-y-auto">
          <p className="whitespace-pre-wrap">{extractedText}</p>
        </div>
      )}
      
      {isEditing && (
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
          <FormLabel>Change Item Type</FormLabel>
          <div className="flex flex-wrap gap-2 mt-1">
            <Badge 
              variant={currentItemType === 'product' ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => handleTypeChange('product')}
            >
              <ShoppingBag className="h-3 w-3 mr-1" /> Product
            </Badge>
            <Badge 
              variant={currentItemType === 'receipt' ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => handleTypeChange('receipt')}
            >
              <Receipt className="h-3 w-3 mr-1" /> Receipt
            </Badge>
            <Badge 
              variant={currentItemType === 'invitation' ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => handleTypeChange('invitation')}
            >
              <Calendar className="h-3 w-3 mr-1" /> Invitation
            </Badge>
            <Badge 
              variant={currentItemType === 'document' ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => handleTypeChange('document')}
            >
              <FileText className="h-3 w-3 mr-1" /> Document
            </Badge>
          </div>
        </div>
      )}

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
                    className={!isEditing ? "bg-gray-50 dark:bg-gray-800" : ""}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Conditional fields based on item type */}
          {currentItemType === 'product' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Brand name" 
                          {...field} 
                          disabled={!isEditing}
                          className={!isEditing ? "bg-gray-50 dark:bg-gray-800" : ""}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
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
                          className={!isEditing ? "bg-gray-50 dark:bg-gray-800" : ""}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      disabled={!isEditing}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className={!isEditing ? "bg-gray-50 dark:bg-gray-800" : ""}>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Groceries">Groceries</SelectItem>
                        <SelectItem value="Electronics">Electronics</SelectItem>
                        <SelectItem value="Clothing">Clothing</SelectItem>
                        <SelectItem value="Home">Home</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </>
          )}

          {currentItemType === 'invitation' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="YYYY-MM-DD" 
                          {...field} 
                          disabled={!isEditing}
                          className={!isEditing ? "bg-gray-50 dark:bg-gray-800" : ""}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="HH:MM AM/PM" 
                          {...field} 
                          disabled={!isEditing}
                          className={!isEditing ? "bg-gray-50 dark:bg-gray-800" : ""}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
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
                        className={!isEditing ? "bg-gray-50 dark:bg-gray-800" : ""}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="organizer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organizer</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Event organizer" 
                        {...field} 
                        disabled={!isEditing}
                        className={!isEditing ? "bg-gray-50 dark:bg-gray-800" : ""}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </>
          )}

          {currentItemType === 'receipt' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="store"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Store</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Store name" 
                          {...field} 
                          disabled={!isEditing}
                          className={!isEditing ? "bg-gray-50 dark:bg-gray-800" : ""}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="YYYY-MM-DD" 
                          {...field} 
                          disabled={!isEditing}
                          className={!isEditing ? "bg-gray-50 dark:bg-gray-800" : ""}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="total"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Amount</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Total amount" 
                        {...field} 
                        disabled={!isEditing}
                        className={!isEditing ? "bg-gray-50 dark:bg-gray-800" : ""}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </>
          )}

          {currentItemType === 'document' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="YYYY-MM-DD" 
                          {...field} 
                          disabled={!isEditing}
                          className={!isEditing ? "bg-gray-50 dark:bg-gray-800" : ""}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="author"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Author</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Document author" 
                          {...field} 
                          disabled={!isEditing}
                          className={!isEditing ? "bg-gray-50 dark:bg-gray-800" : ""}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags (comma separated)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="work, contract, important" 
                        {...field} 
                        disabled={!isEditing}
                        className={!isEditing ? "bg-gray-50 dark:bg-gray-800" : ""}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </>
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
                    className={!isEditing ? "bg-gray-50 dark:bg-gray-800" : ""}
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
                    className={!isEditing ? "bg-gray-50 dark:bg-gray-800" : ""}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="saveImage"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={!isEditing}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Save original image</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Store the original image along with the extracted data
                  </p>
                </div>
              </FormItem>
            )}
          />

          {/* Type-specific checkboxes */}
          {currentItemType === 'product' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="addToShoppingList"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!isEditing}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Add to Shopping List</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Add this product to your shopping list
                      </p>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="saveToDocuments"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!isEditing}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Save to Documents</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Save product details to your documents
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          )}

          {currentItemType === 'invitation' && (
            <FormField
              control={form.control}
              name="addToCalendar"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={!isEditing}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Add to Calendar</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Add this event to your calendar
                    </p>
                  </div>
                </FormItem>
              )}
            />
          )}

          {currentItemType === 'receipt' && (
            <FormField
              control={form.control}
              name="saveToSpending"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={!isEditing}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Save to Spending</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Track this receipt in your spending records
                    </p>
                  </div>
                </FormItem>
              )}
            />
          )}

          <div className="flex flex-col md:flex-row gap-3 pt-2">
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
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </form>
      </Form>

      {!isEditing && (
        <div className="flex flex-wrap gap-2 mt-4">
          {getActionButtons()}
        </div>
      )}

      {detectedObjects && detectedObjects.length > 0 && (
        <div className="mt-4 border-t pt-4">
          <h4 className="text-sm font-medium mb-2">Detected Objects</h4>
          <div className="flex flex-wrap gap-2">
            {detectedObjects.map((object, index) => (
              <Badge key={index} variant="secondary">
                {object.name} ({Math.round(object.confidence * 100)}%)
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Preview Functionality Reminder */}
      <Alert variant="default" className="bg-todo-purple/5 border-todo-purple/20">
        <Check className="h-4 w-4 text-todo-purple" />
        <AlertTitle className="text-todo-purple">Recognition Complete</AlertTitle>
        <AlertDescription className="text-muted-foreground">
          Review the extracted data, make any necessary adjustments, and save to complete the process.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default DataRecognition;
