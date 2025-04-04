
export type DocumentCategory = 'other' | 'style' | 'recipes' | 'travel' | 'fitness' | 'files' | 'work';

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

export const CATEGORIES: DocumentCategory[] = ['style', 'recipes', 'travel', 'fitness', 'work', 'other', 'files'];
