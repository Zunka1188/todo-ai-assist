
import React, { useState, useEffect } from 'react';
import { Check, AlertCircle, RefreshCw, Edit, ShoppingBag, Calendar, FileText, Receipt, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FeedbackComponent from './FeedbackComponent';

export type RecognizedItemType = 'invitation' | 'receipt' | 'product' | 'document' | 'unknown';

export interface RecognizedItem {
  type: RecognizedItemType;
  confidence: number;
  data: any;
  imageData?: string;
  extractedText?: string;
  detectedObjects?: Array<{name: string, confidence: number}>;
}

interface DataRecognitionProps {
  recognizedItem: RecognizedItem | null;
  isProcessing: boolean;
  onSave: (formData: any, originalItem: RecognizedItem) => void;
  onCancel: () => void;
  onChangeCategory?: () => void;
  showAddToShoppingList?: boolean;
  showAddToCalendar?: boolean;
  showSaveToDocuments?: boolean;
}

const DataRecognition: React.FC<DataRecognitionProps> = ({
  recognizedItem,
  isProcessing,
  onSave,
  onCancel,
  onChangeCategory,
  showAddToShoppingList = false,
  showAddToCalendar = false,
  showSaveToDocuments = false
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [keepImage, setKeepImage] = useState(true);
  const [addToShoppingList, setAddToShoppingList] = useState(false);
  const [addToCalendar, setAddToCalendar] = useState(false);
  const [saveToDocuments, setSaveToDocuments] = useState(false);
  const [saveToSpending, setSaveToSpending] = useState(false);
  const [isValidated, setIsValidated] = useState(true);
  
  useEffect(() => {
    if (recognizedItem) {
      // Different fields based on recognized item type
      switch (recognizedItem.type) {
        case 'invitation':
          setTitle(recognizedItem.data.title || '');
          setDate(recognizedItem.data.date || '');
          setTime(recognizedItem.data.time || '');
          setLocation(recognizedItem.data.location || '');
          setDescription(recognizedItem.data.notes || '');
          setAddToCalendar(true);
          break;
        case 'receipt':
          setTitle(recognizedItem.data.store || 'Receipt');
          setDate(recognizedItem.data.date || '');
          setPrice(recognizedItem.data.total || '');
          setCategory(recognizedItem.data.category || '');
          setDescription('');
          setSaveToSpending(true);
          break;
        case 'product':
          setTitle(recognizedItem.data.name || '');
          setPrice(recognizedItem.data.price || '');
          setCategory(recognizedItem.data.category || '');
          setDescription(recognizedItem.data.description || '');
          setAddToShoppingList(true);
          break;
        case 'document':
          setTitle(recognizedItem.data.title || '');
          setDate(recognizedItem.data.date || '');
          setCategory(recognizedItem.data.type || '');
          setDescription(recognizedItem.data.content || '');
          setSaveToDocuments(true);
          break;
        default:
          setTitle(recognizedItem.data.title || '');
          setDescription(recognizedItem.data.description || '');
          break;
      }
    }
  }, [recognizedItem]);
  
  // Logic specific to item type
  let recognizedTypeDisplay = '';
  let typeIcon = null;
  
  switch (recognizedItem?.type) {
    case 'invitation':
      recognizedTypeDisplay = 'Event/Invitation';
      typeIcon = <Calendar className="h-5 w-5 text-blue-500" />;
      break;
    case 'receipt':
      recognizedTypeDisplay = 'Receipt';
      typeIcon = <Receipt className="h-5 w-5 text-green-500" />;
      break;
    case 'product':
      recognizedTypeDisplay = 'Product';
      typeIcon = <ShoppingBag className="h-5 w-5 text-purple-500" />;
      break;
    case 'document':
      recognizedTypeDisplay = 'Document';
      typeIcon = <FileText className="h-5 w-5 text-yellow-500" />;
      break;
    default:
      recognizedTypeDisplay = 'Item';
      typeIcon = <AlertCircle className="h-5 w-5 text-gray-500" />;
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!title.trim()) {
      setIsValidated(false);
      return;
    }
    
    const formData = {
      title,
      description,
      date,
      time,
      location,
      price,
      category,
      keepImage,
      addToShoppingList,
      addToCalendar,
      saveToDocuments,
      saveToSpending,
      itemType: recognizedItem?.type
    };
    
    onSave(formData, recognizedItem!);
  };
  
  // Don't render anything if we don't have a recognized item
  if (!recognizedItem) return null;
  
  return (
    <div className="space-y-4">
      <div className="bg-background border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="bg-primary/10 p-2 rounded-full">
            {typeIcon}
          </div>
          <div className="flex-1">
            <h3 className="font-medium">Detected {recognizedTypeDisplay}</h3>
            <p className="text-xs text-muted-foreground">
              AI confidence: {(recognizedItem.confidence * 100).toFixed(0)}%
            </p>
          </div>
          {onChangeCategory && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onChangeCategory}
              className="h-8 text-xs flex items-center"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Change
            </Button>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isValidated && (
            <Alert variant="destructive">
              <AlertDescription>
                Please provide a title before saving.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-3">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title"
                value={title} 
                onChange={e => setTitle(e.target.value)}
                placeholder="Enter title"
                className={!isValidated && !title.trim() ? "border-red-500" : ""}
              />
            </div>
            
            {(recognizedItem.type === 'invitation' || recognizedItem.type === 'document' || recognizedItem.type === 'receipt') && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input 
                    id="date"
                    type="date"
                    value={date} 
                    onChange={e => setDate(e.target.value)}
                    placeholder="Enter date"
                  />
                </div>
                
                {recognizedItem.type === 'invitation' && (
                  <div>
                    <Label htmlFor="time">Time</Label>
                    <Input 
                      id="time"
                      type="time"
                      value={time} 
                      onChange={e => setTime(e.target.value)}
                      placeholder="Enter time"
                    />
                  </div>
                )}
                
                {recognizedItem.type === 'receipt' && (
                  <div>
                    <Label htmlFor="price">Total Amount</Label>
                    <Input 
                      id="price"
                      value={price} 
                      onChange={e => setPrice(e.target.value)}
                      placeholder="Enter amount"
                    />
                  </div>
                )}
              </div>
            )}
            
            {recognizedItem.type === 'invitation' && (
              <div>
                <Label htmlFor="location">Location</Label>
                <Input 
                  id="location"
                  value={location} 
                  onChange={e => setLocation(e.target.value)}
                  placeholder="Enter location"
                />
              </div>
            )}
            
            {(recognizedItem.type === 'product') && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input 
                    id="price"
                    value={price} 
                    onChange={e => setPrice(e.target.value)}
                    placeholder="Enter price"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="groceries">Groceries</SelectItem>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="clothing">Clothing</SelectItem>
                      <SelectItem value="household">Household</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            
            {(recognizedItem.type === 'product' || recognizedItem.type === 'document' || recognizedItem.type === 'invitation') && (
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description"
                  value={description} 
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Enter description"
                  rows={3}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="keep-image" 
                  checked={keepImage}
                  onCheckedChange={(checked) => setKeepImage(checked as boolean)}
                />
                <Label htmlFor="keep-image">Save image with item</Label>
              </div>
              
              {(recognizedItem.type === 'product' || showAddToShoppingList) && (
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="shopping-list" 
                    checked={addToShoppingList}
                    onCheckedChange={(checked) => setAddToShoppingList(checked as boolean)}
                  />
                  <Label htmlFor="shopping-list">Add to shopping list</Label>
                </div>
              )}
              
              {(recognizedItem.type === 'invitation' || showAddToCalendar) && (
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="calendar" 
                    checked={addToCalendar}
                    onCheckedChange={(checked) => setAddToCalendar(checked as boolean)}
                  />
                  <Label htmlFor="calendar">Add to calendar</Label>
                </div>
              )}
              
              {(recognizedItem.type === 'document' || showSaveToDocuments) && (
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="documents" 
                    checked={saveToDocuments}
                    onCheckedChange={(checked) => setSaveToDocuments(checked as boolean)}
                  />
                  <Label htmlFor="documents">Save to documents</Label>
                </div>
              )}
              
              {recognizedItem.type === 'receipt' && (
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="spending" 
                    checked={saveToSpending}
                    onCheckedChange={(checked) => setSaveToSpending(checked as boolean)}
                  />
                  <Label htmlFor="spending">Save to expenses</Label>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-between pt-2">
            <Button 
              type="button" 
              variant="outline"
              onClick={onCancel}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isProcessing}
              className="gap-2"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Save
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
      
      {/* Feedback component for AI detection */}
      <FeedbackComponent 
        detectionType={recognizedItem.type}
        detectionLabel={recognizedTypeDisplay}
        detectionResult={recognizedItem}
        minimal={true}
        className="mt-2"
      />
    </div>
  );
};

export default DataRecognition;
