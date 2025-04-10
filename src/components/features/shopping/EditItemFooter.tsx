
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2 } from 'lucide-react';

interface EditItemFooterProps {
  onSave: (e: React.FormEvent) => void;
  onCancel: () => void;
  onDelete?: () => void;
  isSubmitting: boolean;
  isDeleting: boolean;
  isMobile: boolean;
}

const EditItemFooter: React.FC<EditItemFooterProps> = ({
  onSave,
  onCancel,
  onDelete,
  isSubmitting,
  isDeleting,
  isMobile
}) => {
  if (isMobile) {
    return (
      <div className="flex flex-col gap-2 pt-4">
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isSubmitting || isDeleting}
          onClick={onSave}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : 'Save Changes'}
        </Button>
        
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel} 
          disabled={isSubmitting || isDeleting}
          className="w-full"
        >
          Cancel
        </Button>
        
        {onDelete && (
          <Button 
            type="button" 
            variant="destructive" 
            onClick={onDelete}
            disabled={isSubmitting || isDeleting}
            className="w-full flex items-center justify-center gap-1"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Delete
              </>
            )}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="pt-4 flex flex-col sm:flex-row gap-2">
      <div className="flex-1 flex justify-start">
        {onDelete && (
          <Button 
            type="button" 
            variant="destructive" 
            onClick={onDelete}
            disabled={isSubmitting || isDeleting}
            className="flex items-center gap-1"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Delete
              </>
            )}
          </Button>
        )}
      </div>
      <div className="flex gap-2 justify-end">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel} 
          disabled={isSubmitting || isDeleting}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting || isDeleting}
          onClick={onSave}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};

export default EditItemFooter;
