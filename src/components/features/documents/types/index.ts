
import { DocumentFile } from '../types';

// Add the missing type definitions
export type ViewMode = 'grid' | 'list' | 'table';

export interface DocumentFilters {
  category?: string;
  dateRange?: {
    from: Date;
    to: Date;
  } | null;
  searchTerm?: string;
}

export interface AddDocDialogItem {
  id: string;
  name: string;
  type: string;
  size: number;
  category: string;
  createdAt: Date;
  file?: File;
}

// Re-export other types from the parent file
export * from '../types';
