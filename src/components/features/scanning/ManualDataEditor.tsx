
import React from 'react';
import { RecognizedItemType } from './DataRecognition';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar, Receipt, List, FileText } from 'lucide-react';

interface ManualDataEditorProps {
  initialData: any;
  itemType: RecognizedItemType;
  onDataChange: (data: any) => void;
  onTypeChange: (type: RecognizedItemType) => void;
}

const ManualDataEditor: React.FC<ManualDataEditorProps> = ({
  initialData,
  itemType,
  onDataChange,
  onTypeChange,
}) => {
  // Create a handler for each type of field
  const handleTextChange = (field: string, value: string) => {
    onDataChange({
      ...initialData,
      [field]: value
    });
  };

  // Render different form fields based on the selected type
  const renderTypeSpecificFields = () => {
    switch (itemType) {
      case 'invitation':
        return (
          <div className="space-y-3">
            <div>
              <Label htmlFor="title">Event Title</Label>
              <Input 
                id="title"
                value={initialData.title || ''}
                onChange={(e) => handleTextChange('title', e.target.value)}
                placeholder="Enter event title"
              />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input 
                id="date"
                type="date"
                value={initialData.date || ''}
                onChange={(e) => handleTextChange('date', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="time">Time</Label>
              <Input 
                id="time"
                type="time"
                value={initialData.time || ''}
                onChange={(e) => handleTextChange('time', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input 
                id="location"
                value={initialData.location || ''}
                onChange={(e) => handleTextChange('location', e.target.value)}
                placeholder="Enter location"
              />
            </div>
            <div>
              <Label htmlFor="organizer">Organizer</Label>
              <Input 
                id="organizer"
                value={initialData.organizer || ''}
                onChange={(e) => handleTextChange('organizer', e.target.value)}
                placeholder="Enter organizer"
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea 
                id="notes"
                value={initialData.notes || ''}
                onChange={(e) => handleTextChange('notes', e.target.value)}
                placeholder="Enter additional notes"
              />
            </div>
          </div>
        );
        
      case 'receipt':
        return (
          <div className="space-y-3">
            <div>
              <Label htmlFor="store">Store Name</Label>
              <Input 
                id="store"
                value={initialData.store || ''}
                onChange={(e) => handleTextChange('store', e.target.value)}
                placeholder="Enter store name"
              />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input 
                id="date"
                type="date"
                value={initialData.date || ''}
                onChange={(e) => handleTextChange('date', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="total">Total Amount</Label>
              <Input 
                id="total"
                value={initialData.total || ''}
                onChange={(e) => handleTextChange('total', e.target.value)}
                placeholder="Enter total amount"
              />
            </div>
            <div>
              <Label htmlFor="items">Items (optional)</Label>
              <Textarea 
                id="items"
                value={initialData.itemsText || ''}
                onChange={(e) => handleTextChange('itemsText', e.target.value)}
                placeholder="Enter items (one per line)"
              />
            </div>
          </div>
        );
        
      case 'product':
        return (
          <div className="space-y-3">
            <div>
              <Label htmlFor="name">Product Name</Label>
              <Input 
                id="name"
                value={initialData.name || ''}
                onChange={(e) => handleTextChange('name', e.target.value)}
                placeholder="Enter product name"
              />
            </div>
            <div>
              <Label htmlFor="price">Price</Label>
              <Input 
                id="price"
                value={initialData.price || ''}
                onChange={(e) => handleTextChange('price', e.target.value)}
                placeholder="Enter price"
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Input 
                id="category"
                value={initialData.category || ''}
                onChange={(e) => handleTextChange('category', e.target.value)}
                placeholder="Enter category"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description"
                value={initialData.description || ''}
                onChange={(e) => handleTextChange('description', e.target.value)}
                placeholder="Enter description"
              />
            </div>
          </div>
        );
        
      case 'document':
        return (
          <div className="space-y-3">
            <div>
              <Label htmlFor="title">Document Title</Label>
              <Input 
                id="title"
                value={initialData.title || ''}
                onChange={(e) => handleTextChange('title', e.target.value)}
                placeholder="Enter document title"
              />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input 
                id="date"
                type="date"
                value={initialData.date || ''}
                onChange={(e) => handleTextChange('date', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea 
                id="content"
                value={initialData.content || ''}
                onChange={(e) => handleTextChange('content', e.target.value)}
                placeholder="Enter document content"
                className="min-h-[100px]"
              />
            </div>
            <div>
              <Label htmlFor="author">Author (optional)</Label>
              <Input 
                id="author"
                value={initialData.author || ''}
                onChange={(e) => handleTextChange('author', e.target.value)}
                placeholder="Enter author"
              />
            </div>
          </div>
        );
        
      default:
        return (
          <div className="space-y-3">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title"
                value={initialData.title || ''}
                onChange={(e) => handleTextChange('title', e.target.value)}
                placeholder="Enter title"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description"
                value={initialData.description || ''}
                onChange={(e) => handleTextChange('description', e.target.value)}
                placeholder="Enter description"
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Label htmlFor="item-type" className="min-w-[120px]">Item Type:</Label>
        <Select 
          value={itemType} 
          onValueChange={(value) => onTypeChange(value as RecognizedItemType)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select item type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="invitation" className="flex items-center">
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-todo-purple" />
                <span>Event/Invitation</span>
              </div>
            </SelectItem>
            <SelectItem value="receipt">
              <div className="flex items-center">
                <Receipt className="mr-2 h-4 w-4 text-green-600" />
                <span>Receipt</span>
              </div>
            </SelectItem>
            <SelectItem value="product">
              <div className="flex items-center">
                <List className="mr-2 h-4 w-4 text-blue-600" />
                <span>Product</span>
              </div>
            </SelectItem>
            <SelectItem value="document">
              <div className="flex items-center">
                <FileText className="mr-2 h-4 w-4 text-amber-600" />
                <span>Document</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-gray-50 p-4 rounded-md">
        {renderTypeSpecificFields()}
      </div>
    </div>
  );
};

export default ManualDataEditor;
