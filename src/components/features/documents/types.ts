
export type DocumentCategory = 'style' | 'recipes' | 'travel' | 'fitness' | 'events' | 'other' | 'files';

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

// Removing this export so it uses the memoized version in useDocuments
// export const CATEGORIES: DocumentCategory[] = ['style', 'recipes', 'travel', 'fitness', 'events', 'other', 'files'];
