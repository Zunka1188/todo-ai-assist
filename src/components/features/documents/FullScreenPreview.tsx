
import React from 'react';
import { X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FilePreview from './FilePreview';
import { DocumentFile, DocumentItem } from './types';

interface FullScreenPreviewProps {
  item: DocumentFile | DocumentItem | null;
  onClose: () => void;
}

const FullScreenPreview: React.FC<FullScreenPreviewProps> = ({ 
  item, 
  onClose
}) => {
  if (!item) return null;

  // Handle different item types (DocumentFile vs DocumentItem)
  const getFileUrl = () => {
    if ('fileUrl' in item) return item.fileUrl;
    if ('file' in item) return item.file;
    if ('content' in item && item.type === 'image') return item.content;
    return null;
  };

  const getTitle = () => {
    return item.title;
  };

  const getFileType = () => {
    if ('fileType' in item) return item.fileType;
    if ('type' in item) return item.type;
    return undefined;
  };
  
  const fileUrl = getFileUrl();
  const fileType = getFileType();
  const isDownloadable = fileUrl && (
    fileType === 'pdf' || 
    fileType === 'word' || 
    fileType === 'excel' || 
    fileType === 'powerpoint' || 
    fileType === 'text'
  );

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex flex-col">
      <div className="flex justify-between items-center p-4 bg-background/10 backdrop-blur-sm">
        <div className="text-white font-medium">{getTitle()}</div>
        <div className="flex items-center gap-2">
          {isDownloadable && (
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => {
                if (fileUrl) {
                  const a = document.createElement('a');
                  a.href = fileUrl;
                  a.download = getTitle();
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                }
              }}
              aria-label="Download file"
            >
              <Download className="h-5 w-5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={onClose}
            aria-label="Close preview"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center overflow-auto p-4">
        {('content' in item && item.type === 'note') ? (
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-medium mb-4">{item.title}</h2>
            <p className="whitespace-pre-wrap">{item.content}</p>
            {item.tags && item.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {item.tags.map((tag, index) => (
                  <span key={index} className="bg-muted px-2 py-1 text-xs rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <FilePreview
            file={getFileUrl()}
            fileName={getTitle()}
            fileType={getFileType()}
            className="max-w-full max-h-full bg-white rounded-lg"
            fullScreen={true}
          />
        )}
      </div>
    </div>
  );
};

export default FullScreenPreview;
