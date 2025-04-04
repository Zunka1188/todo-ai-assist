
import React from 'react';
import { 
  File, FileText, FileSpreadsheet, FileCode, 
  Image, FileArchive, Shirt, ChefHat, 
  Plane, Dumbbell, FileBox
} from 'lucide-react';
import { DocumentCategory } from '../types';

export const getCategoryIcon = (category: DocumentCategory) => {
  switch (category) {
    case 'style':
      return <Shirt className="h-5 w-5 text-blue-500" />;
    case 'recipes':
      return <ChefHat className="h-5 w-5 text-green-500" />;
    case 'travel':
      return <Plane className="h-5 w-5 text-amber-500" />;
    case 'fitness':
      return <Dumbbell className="h-5 w-5 text-purple-500" />;
    case 'files':
      return <FileArchive className="h-5 w-5 text-gray-500" />;
    case 'work':
      return <FileBox className="h-5 w-5 text-blue-600" />;
    case 'other':
    default:
      return <FileText className="h-5 w-5 text-gray-500" />;
  }
};

export const getFileTypeIcon = (fileType: string) => {
  switch (fileType) {
    case 'pdf':
      return <FileText className="h-5 w-5 text-red-500" />;
    case 'word':
      return <FileText className="h-5 w-5 text-blue-500" />;
    case 'excel':
      return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
    case 'image':
      return <Image className="h-5 w-5 text-purple-500" />;
    case 'code':
      return <FileCode className="h-5 w-5 text-yellow-500" />;
    case 'archive':
      return <FileArchive className="h-5 w-5 text-gray-500" />;
    default:
      return <File className="h-5 w-5 text-gray-500" />;
  }
};

export const getTypeIcon = (type: 'image' | 'note') => {
  return type === 'image' 
    ? <Image className="h-5 w-5 text-blue-500" /> 
    : <FileText className="h-5 w-5 text-green-500" />;
};
