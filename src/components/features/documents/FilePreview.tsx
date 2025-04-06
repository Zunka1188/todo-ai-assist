
import React from 'react';
import { File, FileText, Archive, Image, File as FileIcon, FileSpreadsheet, FileCode } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilePreviewProps {
  file: string | null;
  fileName?: string;
  className?: string;
  showIcon?: boolean;
  fileType?: string;
  fullScreen?: boolean;
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
  fileType: explicitFileType,
  fullScreen = false
}) => {
  const fileType = explicitFileType || 
    (fileName ? getFileTypeFromName(fileName) : 
    file ? getFileTypeFromContent(file) : 'unknown');
  
  if (!file) {
    return (
      <div className={cn("flex items-center justify-center w-full h-32 bg-muted/30 rounded-md border", className)}>
        <FileIcon className="h-10 w-10 text-muted-foreground" />
        <p className="ml-2 text-sm text-muted-foreground">No file selected</p>
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
          className={cn(
            "w-full object-contain", 
            fullScreen ? "max-h-[80vh]" : "max-h-48"
          )}
        />
      </div>
    );
  }

  // For PDF files, embed a PDF viewer
  if (fileType === 'pdf') {
    return (
      <div className={cn("rounded-md overflow-hidden border", className)}>
        <iframe 
          src={`${file}#toolbar=0&navpanes=0`}
          className={cn(
            "w-full bg-white", 
            fullScreen ? "h-[80vh]" : "h-48"
          )}
          title={fileName || "PDF Preview"}
        />
      </div>
    );
  }

  // For text files, show the content in a pre tag
  if (fileType === 'text') {
    return (
      <div className={cn(
        "rounded-md overflow-hidden border bg-muted/20 p-4",
        className
      )}>
        <div className="flex items-center mb-2">
          <FileText size={20} className="text-gray-500 mr-2" />
          {fileName && <p className="text-sm font-medium">{fileName}</p>}
        </div>
        <div className={cn(
          "overflow-auto bg-card p-3 rounded text-sm font-mono", 
          fullScreen ? "max-h-[70vh]" : "max-h-32"
        )}>
          {file.includes("dummy.txt") ? 
            `This is a sample text file.
            
It contains multiple lines of text that can be displayed in the preview.

You can use this for notes, recipes, or any other text-based content.

The preview supports scrolling for longer content.` : file}
        </div>
      </div>
    );
  }

  // For other file types that might be downloadable
  if (fileType === 'word' || fileType === 'excel' || fileType === 'powerpoint') {
    return (
      <div className={cn(
        "flex flex-col p-4 border rounded-md bg-muted/20", 
        className
      )}>
        <div className="flex items-center justify-center mb-4">
          {fileType === 'word' && <FileText size={40} className="text-blue-500" />}
          {fileType === 'excel' && <FileSpreadsheet size={40} className="text-green-500" />}
          {fileType === 'powerpoint' && <FileText size={40} className="text-orange-500" />}
        </div>
        {fileName && <p className="text-sm text-center font-medium mb-2">{fileName}</p>}
        <p className="text-xs text-center text-muted-foreground mb-4">
          {fileType === 'word' ? 'Word Document' : 
           fileType === 'excel' ? 'Excel Spreadsheet' : 
           'PowerPoint Presentation'}
        </p>
        <a 
          href={file} 
          download={fileName || `file.${fileType}`}
          className="bg-primary text-primary-foreground hover:bg-primary/90 py-2 px-4 rounded text-center text-sm"
          target="_blank" 
          rel="noopener noreferrer"
        >
          Download {fileType.charAt(0).toUpperCase() + fileType.slice(1)} File
        </a>
      </div>
    );
  }

  if (fileType === 'code') {
    return (
      <div className={cn(
        "rounded-md overflow-hidden border bg-muted/20 p-4",
        className
      )}>
        <div className="flex items-center mb-2">
          <FileCode size={20} className="text-purple-500 mr-2" />
          {fileName && <p className="text-sm font-medium">{fileName}</p>}
        </div>
        <div className={cn(
          "overflow-auto bg-card p-3 rounded text-sm font-mono", 
          fullScreen ? "max-h-[70vh]" : "max-h-32"
        )}>
          <pre>{file}</pre>
        </div>
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
          {fileType === 'code' && <File size={40} className="text-purple-500" />}
          {fileType === 'archive' && <Archive size={40} className="text-gray-500" />}
          {(fileType === 'unknown' || !fileType) && <File size={40} className="text-gray-500" />}
        </div>
      )}
      {fileName && <p className="text-sm text-center break-all">{fileName}</p>}
      {!fileName && <p className="text-sm text-muted-foreground">File</p>}
      <a 
        href={file} 
        className="mt-4 text-xs text-primary hover:underline"
        target="_blank" 
        rel="noopener noreferrer"
      >
        View Original
      </a>
    </div>
  );
};

export default FilePreview;
