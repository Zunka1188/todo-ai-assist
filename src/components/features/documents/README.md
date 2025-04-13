
# Documents Feature Components

This directory contains components for the document management feature of the application.

## Components Overview

### DocumentsPageContent

The main content component for the documents page. It handles the display of document lists and search functionality.

**Props:**
- `activeTab`: string - The currently active tab (e.g., 'style', 'shared', 'templates')
- `initialSearch`: string (optional) - Initial search term to filter documents

**Usage:**
```tsx
import DocumentsPageContent from '@/components/features/documents/DocumentsPageContent';

<DocumentsPageContent activeTab="style" initialSearch="" />
```

**Features:**
- Document searching
- Add document functionality
- Document filtering by category
- Document display in list or table view

### DocumentList

Renders a list of documents in either grid or table view.

**Props:**
- `documents`: Document[] - Array of document objects to display
- `onAddDocument`: Function - Handler for adding a new document
- `onEditDocument`: Function - Handler for editing a document
- `onDeleteDocument`: Function - Handler for deleting a document
- `onDownload`: Function - Handler for downloading a document
- `searchTerm`: string - Current search term for highlighting matches
- `viewMode`: "grid" | "table" - Display mode for documents
- `showAddButton`: boolean - Whether to show the add button

**Related Components:**
- DocumentTableView - Table view of documents
- DocumentItemsList - Grid view of documents

## Data Flow

1. DocumentsPage loads and renders DocumentsPageContent with the active tab
2. DocumentsPageContent uses useDocuments hook to fetch and manage documents
3. Documents are filtered based on active tab and search term
4. DocumentList renders the filtered documents in the selected view mode

## States

DocumentsPageContent maintains these states:
- searchTerm: Current search input
- isAddDialogOpen: Controls add document dialog visibility
- filteredDocuments: Documents filtered by tab and search

## Hooks

This component relies on these hooks:
- useDocuments: Provides document data and operations

## Example

```tsx
// In a page component
import DocumentsPageContent from '@/components/features/documents/DocumentsPageContent';

function DocumentsPage() {
  const [activeTab, setActiveTab] = useState('style');
  
  return (
    <DocumentsPageContent activeTab={activeTab} />
  );
}
```
