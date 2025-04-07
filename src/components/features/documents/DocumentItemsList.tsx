
import React from 'react';
import { FileText, Maximize2, Share2, Download, Trash2, Pencil } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DocumentItem } from './types';
import { getTypeIcon } from './utils/iconHelpers';
import { useIsMobile } from '@/hooks/use-mobile';
import ShareButton from '@/components/features/shared/ShareButton';
import { toast } from 'sonner';

interface DocumentItemsListProps {
  items: DocumentItem[];
  onEdit: (item: DocumentItem) => void;
  onDelete: (id: string) => void;
  onViewImage: (item: DocumentItem) => void;
  formatDateRelative: (date: Date) => string;
}

const DocumentItemsList: React.FC<DocumentItemsListProps> = ({
  items,
  onEdit,
  onDelete,
  onViewImage,
  formatDateRelative
}) => {
  const { isMobile } = useIsMobile();

  // Format date to European style (DD/MM/YYYY)
  const formatDateEuropean = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  
  // Handle download for document items
  const handleDownload = (item: DocumentItem) => {
    if (item.type === 'image' || item.file) {
      const url = item.type === 'image' ? item.content : item.file;
      if (!url) {
        toast.error("No file available to download");
        return;
      }
      
      const a = document.createElement('a');
      a.href = url;
      a.download = item.fileName || item.title || 'document';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast.success(`Downloading: ${item.title}`);
    } else {
      toast.error("No downloadable content available");
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-medium">No items found</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Add your first item to get started
        </p>
      </div>
    );
  }
  
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Card 
          key={item.id}
          className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onEdit(item)}
        >
          <CardContent className="p-0">
            {item.type === 'image' ? (
              <div className="relative">
                <img 
                  src={item.content} 
                  alt={item.title} 
                  className="w-full h-48 object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                  <h3 className="font-medium text-white truncate">{item.title}</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {item.tags.map((tag, i) => (
                      <span 
                        key={i}
                        className="text-xs bg-black/20 text-white px-2 py-0.5 rounded-full truncate"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center text-xs text-white/80 mt-1.5">
                    <span>{formatDateEuropean(item.date)}</span>
                    <span className="mx-0.5">•</span>
                    <span>Added {formatDateRelative(item.addedDate)}</span>
                  </div>
                </div>
                <div className="absolute top-2 right-2 flex gap-1">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-9 w-9 p-0 bg-black/20 hover:bg-black/40 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewImage(item);
                    }}
                    aria-label="View full screen"
                  >
                    <Maximize2 className="h-4 w-4 text-white" />
                  </Button>
                  
                  <ShareButton
                    size="sm"
                    className="h-9 w-9 p-0 bg-black/20 hover:bg-black/40 rounded-full"
                    title={`Check out: ${item.title}`}
                    text={item.title}
                    fileUrl={item.content}
                    onClick={(e) => e.stopPropagation()}
                    itemId={item.id}
                    aria-label="Share item"
                  >
                    <Share2 className="h-4 w-4 text-white" />
                  </ShareButton>
                  
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-9 w-9 p-0 bg-black/20 hover:bg-black/40 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(item);
                    }}
                    aria-label="Download item"
                  >
                    <Download className="h-4 w-4 text-white" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-9 w-9 p-0 bg-black/20 hover:bg-black/40 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(item);
                    }}
                    aria-label="Edit item"
                  >
                    <Pencil className="h-4 w-4 text-white" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-9 w-9 p-0 bg-black/20 hover:bg-red-500 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item.id);
                    }}
                    aria-label="Delete item"
                  >
                    <Trash2 className="h-4 w-4 text-white" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{item.title}</h3>
                    <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{item.content}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.tags.map((tag, i) => (
                        <span 
                          key={i}
                          className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full truncate"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground mt-2">
                      <span>{formatDateEuropean(item.date)}</span>
                      <span className="mx-0.5">•</span>
                      <span>Added {formatDateRelative(item.addedDate)}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 ml-2 shrink-0">
                    <ShareButton
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0"
                      title={`Check out: ${item.title}`}
                      text={item.content}
                      onClick={(e) => e.stopPropagation()}
                      itemId={item.id}
                      aria-label="Share item"
                    >
                      <Share2 className="h-4 w-4" />
                    </ShareButton>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(item);
                      }}
                      aria-label="Download item"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(item);
                      }}
                      aria-label="Edit item"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(item.id);
                      }}
                      aria-label="Delete item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DocumentItemsList;
