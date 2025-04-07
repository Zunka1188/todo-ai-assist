import React from 'react';
import { File, FileText, Archive, Image, File as FileIcon, FileSpreadsheet, FileCode, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

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

  const handleDownload = () => {
    try {
      const link = window.document.createElement('a');
      link.href = file;
      link.download = fileName || `download.${fileType}`;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      
      toast.success(`Downloading ${fileName || "file"}`);
    } catch (error) {
      console.error("Download error:", error);
      toast.error("There was a problem downloading your file. Please try again.");
    }
  };

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
        {fullScreen && (
          <div className="absolute bottom-4 right-4">
            <Button 
              onClick={handleDownload}
              className="bg-black/40 hover:bg-black/60 text-white"
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (fileType === 'pdf') {
    return (
      <div className={cn("relative rounded-md overflow-hidden border", className)}>
        <iframe 
          src={file}
          className={cn(
            "w-full bg-white", 
            fullScreen ? "h-[80vh]" : "h-48"
          )}
          title={fileName || "PDF Preview"}
        />
        {fullScreen && (
          <div className="absolute bottom-4 right-4">
            <Button 
              onClick={handleDownload}
              className="bg-black/40 hover:bg-black/60 text-white"
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (fileType === 'text') {
    return (
      <div className={cn(
        "rounded-md overflow-hidden border bg-muted/20 p-4 relative",
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
        {fullScreen && (
          <div className="absolute bottom-4 right-4">
            <Button 
              onClick={handleDownload}
              className="bg-primary/90 hover:bg-primary text-white"
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (fileType === 'excel' || fileType === 'word' || fileType === 'powerpoint') {
    return (
      <div className={cn(
        "flex flex-col p-6 border rounded-md bg-muted/20 relative", 
        className
      )}>
        <div className="flex flex-col items-center justify-center mb-4">
          {fileType === 'word' && <FileText size={60} className="text-blue-500 mb-4" />}
          {fileType === 'excel' && <FileSpreadsheet size={60} className="text-green-500 mb-4" />}
          {fileType === 'powerpoint' && <FileText size={60} className="text-orange-500 mb-4" />}
          
          {fileName && <p className="text-center font-medium mb-2">{fileName}</p>}
          <p className="text-sm text-center text-muted-foreground mb-6">
            {fileType === 'word' ? 'Word Document' : 
             fileType === 'excel' ? 'Excel Spreadsheet' : 
             'PowerPoint Presentation'}
          </p>
          
          <div className="w-full max-w-xs">
            <Button 
              onClick={handleDownload}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Download className="mr-2 h-4 w-4" />
              Download {fileType.charAt(0).toUpperCase() + fileType.slice(1)} File
            </Button>
          </div>
          
          {fileType === 'excel' && (
            <div className="mt-6 border rounded-md overflow-hidden w-full max-w-lg">
              <div className="bg-green-100 p-2 text-xs font-medium text-center border-b">
                Sample Excel Content Preview
              </div>
              <div className="overflow-x-auto">
                <table className="w-full bg-white text-sm">
                  <thead>
                    <tr className="bg-green-50 border-b">
                      <th className="p-2 border-r text-left">Product</th>
                      <th className="p-2 border-r text-right">Quantity</th>
                      <th className="p-2 border-r text-right">Price</th>
                      <th className="p-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-2 border-r">Item A</td>
                      <td className="p-2 border-r text-right">3</td>
                      <td className="p-2 border-r text-right">$25.00</td>
                      <td className="p-2 text-right">$75.00</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 border-r">Item B</td>
                      <td className="p-2 border-r text-right">5</td>
                      <td className="p-2 border-r text-right">$10.00</td>
                      <td className="p-2 text-right">$50.00</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 border-r">Item C</td>
                      <td className="p-2 border-r text-right">2</td>
                      <td className="p-2 border-r text-right">$15.00</td>
                      <td className="p-2 text-right">$30.00</td>
                    </tr>
                    <tr className="bg-green-50">
                      <td className="p-2 border-r font-medium text-right" colSpan={3}>Grand Total:</td>
                      <td className="p-2 text-right font-medium">$155.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (fileType === 'code') {
    return (
      <div className={cn(
        "rounded-md overflow-hidden border bg-muted/20 p-4 relative",
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
        {fullScreen && (
          <div className="absolute bottom-4 right-4">
            <Button 
              onClick={handleDownload}
              className="bg-primary/90 hover:bg-primary text-white"
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-6 border rounded-md bg-muted/20 relative", 
      className
    )}>
      {showIcon && (
        <div className="mb-4">
          {fileType === 'archive' && <Archive size={60} className="text-yellow-500" />}
          {(fileType === 'unknown' || !fileType) && <File size={60} className="text-gray-500" />}
        </div>
      )}
      {fileName && <p className="text-center break-all font-medium mb-4">{fileName}</p>}
      {!fileName && <p className="text-center text-muted-foreground mb-4">Unknown File</p>}
      
      <Button 
        onClick={handleDownload}
        className="mt-2 bg-primary text-primary-foreground hover:bg-primary/90"
      >
        <Download className="mr-2 h-4 w-4" />
        Download File
      </Button>
    </div>
  );
};

export default FilePreview;
