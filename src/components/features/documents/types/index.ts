
// Document management types

export type DocumentCategory = 'style' | 'recipes' | 'travel' | 'fitness' | 'events' | 'other' | 'files';
export type ExtendedDocumentCategory = DocumentCategory | 'all';
export type ViewMode = 'grid' | 'list' | 'table';

export interface DocumentItem {
  id: string;
  title: string;
  category: DocumentCategory;
  type: 'image' | 'note';
  content: string;
  tags: string[];
  date: Date;
  addedDate: Date;
  file?: string | null;
  fileName?: string;
  fileType?: string;
}

export interface DocumentFile {
  id: string;
  title: string;
  category: DocumentCategory;
  date: string;
  fileType?: string;
  fileUrl?: string;
}

export interface DocumentsState {
  items: DocumentItem[];
  files: DocumentFile[];
  selectedDocument: DocumentFile | null;
  isLoading: boolean;
  error: string | null;
  viewMode: ViewMode;
  searchTerm: string;
  currentCategory: DocumentCategory | 'all';
  isAddDialogOpen: boolean;
  isEditDialogOpen: boolean;
  isImageAnalysisOpen: boolean;
  isFullScreenPreviewOpen: boolean;
}

export interface DocumentFilters {
  searchTerm?: string;
  category?: DocumentCategory | 'all';
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  fileTypes?: string[];
}

export interface AddDocDialogItem {
  id: string;
  title: string;
  category: DocumentCategory | string;
  tags: string[];
  date: string;
  addedDate: string;
  description?: string;
  file?: string | null;
  fileName?: string;
  fileType?: string;
  type?: 'image' | 'note';
  content?: string;
}

export const CATEGORIES: DocumentCategory[] = ['style', 'recipes', 'travel', 'fitness', 'events', 'other', 'files'];

// Type guard functions
export function isDocumentCategory(value: string): value is DocumentCategory {
  return CATEGORIES.includes(value as DocumentCategory);
}

export function isViewMode(value: string): value is ViewMode {
  return ['grid', 'list', 'table'].includes(value);
}
