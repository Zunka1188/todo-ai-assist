
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RecognizedProduce } from './ProduceScanner';

interface EditProduceDialogProps {
  item: RecognizedProduce | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: RecognizedProduce) => void;
}

const EditProduceDialog: React.FC<EditProduceDialogProps> = ({
  item,
  isOpen,
  onClose,
  onSave,
}) => {
  const [editedItem, setEditedItem] = useState<RecognizedProduce | null>(item);
  
  // Update local state when the item prop changes
  React.useEffect(() => {
    setEditedItem(item);
  }, [item]);
  
  if (!editedItem) return null;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('nutrition.')) {
      const nutritionField = name.split('.')[1];
      setEditedItem({
        ...editedItem,
        nutritionData: {
          ...editedItem.nutritionData,
          [nutritionField]: parseFloat(value) || 0,
        },
      });
    } else if (name === 'price' || name === 'weightGrams') {
      setEditedItem({
        ...editedItem,
        [name]: parseFloat(value) || null,
      });
    } else {
      setEditedItem({
        ...editedItem,
        [name]: value,
      });
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editedItem) {
      onSave(editedItem);
    }
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Produce Information</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                value={editedItem.name}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="confidence" className="text-right">
                Confidence %
              </Label>
              <Input
                id="confidence"
                name="confidence"
                type="number"
                min="0"
                max="1"
                step="0.01"
                value={editedItem.confidence}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Price ($)
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={editedItem.price || ''}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="weightGrams" className="text-right">
                Weight (g)
              </Label>
              <Input
                id="weightGrams"
                name="weightGrams"
                type="number"
                min="0"
                value={editedItem.weightGrams || ''}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            
            {editedItem.nutritionData && (
              <>
                <div className="border-t pt-3 mt-2">
                  <h4 className="font-medium mb-2">Nutrition (per 100g)</h4>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="nutrition.calories" className="text-right">
                    Calories
                  </Label>
                  <Input
                    id="nutrition.calories"
                    name="nutrition.calories"
                    type="number"
                    min="0"
                    value={editedItem.nutritionData.calories}
                    onChange={handleChange}
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="nutrition.protein" className="text-right">
                    Protein (g)
                  </Label>
                  <Input
                    id="nutrition.protein"
                    name="nutrition.protein"
                    type="number"
                    min="0"
                    step="0.1"
                    value={editedItem.nutritionData.protein}
                    onChange={handleChange}
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="nutrition.carbs" className="text-right">
                    Carbs (g)
                  </Label>
                  <Input
                    id="nutrition.carbs"
                    name="nutrition.carbs"
                    type="number"
                    min="0"
                    step="0.1"
                    value={editedItem.nutritionData.carbs}
                    onChange={handleChange}
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="nutrition.fat" className="text-right">
                    Fat (g)
                  </Label>
                  <Input
                    id="nutrition.fat"
                    name="nutrition.fat"
                    type="number"
                    min="0"
                    step="0.1"
                    value={editedItem.nutritionData.fat}
                    onChange={handleChange}
                    className="col-span-3"
                  />
                </div>
              </>
            )}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProduceDialog;
