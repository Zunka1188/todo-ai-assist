
import React from 'react';
import { FileText, Maximize2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DocumentItem } from './types';
import { getTypeIcon } from './utils/iconHelpers';
import { useIsMobile } from '@/hooks/use-mobile';

interface DocumentItemsListProps {
  items: DocumentItem[];
  onEdit: (item: DocumentItem) => void;
  onDelete: (id: string) => void;
  onViewImage: (imageUrl: string) => void;
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
    return date.toLocaleDateString('en-GB');
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
                      onViewImage(item.content);
                    }}
                    aria-label="View full screen"
                  >
                    <Maximize2 className="h-4 w-4 text-white" />
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
                    <FileText className="h-4 w-4 text-white" />
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
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 15 15"
                      fill="currentColor"
                      className="h-4 w-4 text-white"
                    >
                      <path
                        d="M5.5 1C5.22386 1 5 1.22386 5 1.5C5 1.77614 5.22386 2 5.5 2H9.5C9.77614 2 10 1.77614 10 1.5C10 1.22386 9.77614 1 9.5 1H5.5ZM3 3.5C3 3.22386 3.22386 3 3.5 3H11.5C11.7761 3 12 3.22386 12 3.5C12 3.77614 11.7761 4 11.5 4H3.5C3.22386 4 3 3.77614 3 3.5ZM3.5 5C3.22386 5 3 5.22386 3 5.5C3 5.77614 3.22386 6 3.5 6H4V12C4 12.5523 4.44772 13 5 13H10C10.5523 13 11 12.5523 11 12V6H11.5C11.7761 6 12 5.77614 12 5.5C12 5.22386 11.7761 5 11.5 5H3.5ZM5 6H10V12H5V6Z"
                        fillRule="evenodd"
                        clipRule="evenodd"
                      />
                    </svg>
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
                      <FileText className="h-4 w-4" />
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
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 15 15"
                        fill="currentColor"
                        className="h-4 w-4"
                      >
                        <path
                          d="M5.5 1C5.22386 1 5 1.22386 5 1.5C5 1.77614 5.22386 2 5.5 2H9.5C9.77614 2 10 1.77614 10 1.5C10 1.22386 9.77614 1 9.5 1H5.5ZM3 3.5C3 3.22386 3.22386 3 3.5 3H11.5C11.7761 3 12 3.22386 12 3.5C12 3.77614 11.7761 4 11.5 4H3.5C3.22386 4 3 3.77614 3 3.5ZM3.5 5C3.22386 5 3 5.22386 3 5.5C3 5.77614 3.22386 6 3.5 6H4V12C4 12.5523 4.44772 13 5 13H10C10.5523 13 11 12.5523 11 12V6H11.5C11.7761 6 12 5.77614 12 5.5C12 5.22386 11.7761 5 11.5 5H3.5ZM5 6H10V12H5V6Z"
                          fillRule="evenodd"
                          clipRule="evenodd"
                        />
                      </svg>
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
