import React from 'react';
import { DocumentFile } from './types';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Maximize2, FileText, Image, File, Archive } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface DocumentTableViewProps {
  documents: DocumentFile[];
  onEdit: (document: DocumentFile) => void;
  onDelete: (id: string) => void;
  onFullScreen: (document: DocumentFile) => void;
}

const DocumentTableView: React.FC<DocumentTableViewProps> = ({
  documents,
  onEdit,
  onDelete,
  onFullScreen
}) => {
  const { isMobile } = useIsMobile();
  
  // Format ISO date string to European format (DD/MM/YYYY)
  const formatDateEuropean = (dateString: string): string => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Get file icon based on file type
  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return <FileText className="h-4 w-4 text-red-500" />;
      case 'image':
        return <Image className="h-4 w-4 text-blue-500" />;
      case 'word':
      case 'text':
        return <FileText className="h-4 w-4 text-blue-400" />;
      case 'excel':
        return <FileText className="h-4 w-4 text-green-500" />;
      case 'archive':
        return <Archive className="h-4 w-4 text-yellow-500" />;
      default:
        return <File className="h-4 w-4 text-gray-500" />;
    }
  };

  // Get file type display text
  const getFileTypeDisplay = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return 'PDF File';
      case 'image':
        return 'Image File';
      case 'word':
        return 'Word Document';
      case 'text':
        return 'Text File';
      case 'excel':
        return 'Excel Spreadsheet';
      case 'archive':
        return 'Archive File';
      default:
        return 'Unknown File';
    }
  };

  // Mock file sizes since we don't have real file sizes in the data
  const getRandomFileSize = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return `${Math.floor(Math.random() * 5) + 1} MB`;
      case 'image':
        return `${Math.floor(Math.random() * 4) + 1} MB`;
      case 'word':
        return `${Math.floor(Math.random() * 2) + 1} MB`;
      case 'text':
        return `${Math.floor(Math.random() * 100) + 10} KB`;
      case 'excel':
        return `${Math.floor(Math.random() * 3) + 1} MB`;
      default:
        return `${Math.floor(Math.random() * 5) + 1} MB`;
    }
  };

  if (documents.length === 0) {
    return (
      <div className="flex justify-center items-center p-8">
        <p className="text-muted-foreground">No files found</p>
      </div>
    );
  }

  // Mobile View
  if (isMobile) {
    return (
      <div className="space-y-3">
        {documents.map((doc) => (
          <Card 
            key={doc.id} 
            className="p-3 hover:bg-accent/20 transition-colors cursor-pointer"
            onClick={() => onFullScreen(doc)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="shrink-0">
                  {getFileIcon(doc.fileType)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{doc.title}</h3>
                  <div className="text-xs text-muted-foreground">
                    <p className="truncate mt-1">{getFileTypeDisplay(doc.fileType)} • {getRandomFileSize(doc.fileType)}</p>
                    <p className="mt-1">{formatDateEuropean(doc.date)}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 ml-2 shrink-0">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onFullScreen(doc);
                  }}
                  aria-label="View full screen"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(doc);
                  }}
                  aria-label="Edit document"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 hover:bg-red-100 hover:text-red-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(doc.id);
                  }}
                  aria-label="Delete document"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  // Desktop View (Table Layout)
  return (
    <Card className="overflow-hidden border rounded-md">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-accent/70 bg-muted/50">
            <TableHead className="w-[40%]">Name</TableHead>
            <TableHead className="w-[25%]">Date modified</TableHead>
            <TableHead className="w-[20%]">Type</TableHead>
            <TableHead className="w-[10%]">Size</TableHead>
            <TableHead className="w-[5%]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => (
            <TableRow 
              key={doc.id} 
              className="hover:bg-accent/40 cursor-pointer"
              onClick={() => onFullScreen(doc)}
            >
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {getFileIcon(doc.fileType)}
                  <span>{doc.title}</span>
                </div>
              </TableCell>
              <TableCell>{formatDateEuropean(doc.date)}</TableCell>
              <TableCell>{getFileTypeDisplay(doc.fileType)}</TableCell>
              <TableCell>{getRandomFileSize(doc.fileType)}</TableCell>
              <TableCell>
                <div className="flex items-center space-x-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onFullScreen(doc);
                    }}
                    aria-label="View full screen"
                  >
                    <Maximize2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(doc);
                    }}
                    aria-label="Edit document"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 hover:bg-red-100 hover:text-red-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(doc.id);
                    }}
                    aria-label="Delete document"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};

export default DocumentTableView;
