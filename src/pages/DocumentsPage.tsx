
import React, { useState } from 'react';
import { ArrowLeft, Upload, Plus, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import AppHeader from '@/components/layout/AppHeader';
import DocumentList from '@/components/features/documents/DocumentList';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DocumentsPage = () => {
  const navigate = useNavigate();
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteCategory, setNoteCategory] = useState('');
  
  const goBack = () => {
    navigate('/');
  };
  
  const createNote = () => {
    // In a real application, we would save this note
    console.log('Creating note:', { title: noteTitle, content: noteContent, category: noteCategory });
    
    // Reset form
    setNoteTitle('');
    setNoteContent('');
    setNoteCategory('');
    
    // Close dialog
    setIsNoteDialogOpen(false);
  };

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center mb-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={goBack} 
          className="mr-2"
          aria-label="Go back to home"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <AppHeader 
          title="Documents" 
          subtitle="Manage your files, photos, and notes"
          className="py-0"
        />
      </div>
      
      <div className="flex gap-2 flex-wrap">
        <Button className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Upload File
        </Button>
        
        <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              New Note
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create a new note</DialogTitle>
              <DialogDescription>
                Add a new note to your collection. Fill out the details below.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="note-title" className="text-right">
                  Title
                </Label>
                <Input
                  id="note-title"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="col-span-3"
                  placeholder="Note title"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="note-category" className="text-right">
                  Category
                </Label>
                <Select 
                  value={noteCategory} 
                  onValueChange={setNoteCategory}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="work">Work</SelectItem>
                    <SelectItem value="travel">Travel</SelectItem>
                    <SelectItem value="cooking">Cooking</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="note-content" className="text-right pt-2">
                  Content
                </Label>
                <Textarea
                  id="note-content"
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="col-span-3"
                  rows={6}
                  placeholder="Write your note here..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={createNote} type="submit">Save Note</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <DocumentList />
    </div>
  );
};

export default DocumentsPage;
