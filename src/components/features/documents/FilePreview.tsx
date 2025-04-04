
import React from 'react';
import { File, FileText, FileSpreadsheet, Image, FileCode, FileArchive, File as FileIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilePreviewProps {
  file: string | null;
  fileName?: string;
  className?: string;
  showIcon?: boolean;
  fileType?: string;
}

export const getFileTypeFromName = (fileName: string): string => {
  if (!fileName) return 'unknown';
  
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
    case 'bmp':
      return 'image';
    case 'pdf':
      return 'pdf';
    case 'doc':
    case 'docx':
      return 'word';
    case 'xls':
    case 'xlsx':
    case 'csv':
      return 'excel';
    case 'ppt':
    case 'pptx':
      return 'powerpoint';
    case 'txt':
      return 'text';
    case 'html':
    case 'htm':
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
    case 'css':
      return 'code';
    case 'zip':
    case 'rar':
    case 'tar':
    case 'gz':
      return 'archive';
    default:
      return 'unknown';
  }
};

export const getFileTypeFromContent = (fileContent: string): string => {
  if (fileContent.startsWith('data:image/')) {
    return 'image';
  }
  if (fileContent.startsWith('data:application/pdf')) {
    return 'pdf';
  }
  // Add more type detection as needed
  return 'unknown';
};

const FilePreview: React.FC<FilePreviewProps> = ({ 
  file, 
  fileName, 
  className,
  showIcon = true,
  fileType: explicitFileType
}) => {
  const fileType = explicitFileType || 
    (fileName ? getFileTypeFromName(fileName) : 
    file ? getFileTypeFromContent(file) : 'unknown');
  
  if (!file) {
    return (
      <div className={cn("flex items-center justify-center w-full h-32 bg-muted/30 rounded-md border", className)}>
        <FileIcon className="h-10 w-10 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No file selected</p>
      </div>
    );
  }

  // For images, show the image
  if (fileType === 'image') {
    return (
      <div className={cn("relative rounded-md overflow-hidden border", className)}>
        <img 
          src={file} 
          alt={fileName || "Preview"} 
          className="max-h-48 w-full object-contain"
        />
      </div>
    );
  }

  // For other file types, show an icon and the file name
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-4 border rounded-md bg-muted/20", 
      className
    )}>
      {showIcon && (
        <div className="mb-2">
          {fileType === 'pdf' && <FileText size={40} className="text-red-500" />}
          {fileType === 'word' && <FileText size={40} className="text-blue-500" />}
          {fileType === 'excel' && <FileSpreadsheet size={40} className="text-green-500" />}
          {fileType === 'powerpoint' && <FileText size={40} className="text-orange-500" />}
          {fileType === 'text' && <FileText size={40} className="text-gray-500" />}
          {fileType === 'code' && <FileCode size={40} className="text-purple-500" />}
          {fileType === 'archive' && <FileArchive size={40} className="text-gray-500" />}
          {(fileType === 'unknown' || !fileType) && <File size={40} className="text-gray-500" />}
        </div>
      )}
      {fileName && <p className="text-sm text-center break-all">{fileName}</p>}
      {!fileName && <p className="text-sm text-muted-foreground">File</p>}
    </div>
  );
};

export default FilePreview;
