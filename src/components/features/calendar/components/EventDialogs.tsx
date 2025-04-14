
import React from 'react';
import EventFormDialog from '../dialogs/EventFormDialog';
import EventViewDialogExtension from '../dialogs/EventViewDialogExtension';
import FullScreenPreview from '../../documents/FullScreenPreview';
import InviteDialog from '../dialogs/InviteDialog';
import RSVPDialog from '../dialogs/RSVPDialog';
import { Event } from '../types/event';

interface EventDialogsProps {
  isFileUploaderOpen: boolean;
  effectiveCreateDialogOpen: boolean;
  isEditMode: boolean;
  isViewDialogOpen: boolean;
  selectedEvent: Event | null;
  eventToShare: Event | null;
  previewItem: any;
  isImagePreviewOpen: boolean;
  shareDialogOpen: boolean;
  rsvpDialogOpen: boolean;
  setIsFileUploaderOpen: (open: boolean) => void;
  effectiveSetCreateDialogOpen: (open: boolean) => void;
  setIsEditMode: (isEdit: boolean) => void;
  setIsViewDialogOpen: (open: boolean) => void;
  setIsImagePreviewOpen: (open: boolean) => void;
  setPreviewItem: (item: any) => void;
  setShareDialogOpen: (open: boolean) => void;
  setRsvpDialogOpen: (open: boolean) => void;
  handleSaveEvent: (event: Event) => void;
  handleDeleteEvent: (id: string) => void;
  handleViewToEdit: () => void;
  handleOpenImagePreview: (event: any) => void;
  handleShareEvent: (event: Event) => void;
  handleRSVP: (event: Event) => void;
  handleShareLink: (link: string) => void;
  submitRSVP: (status: 'yes' | 'no' | 'maybe', name: string) => void;
}

const EventDialogs: React.FC<EventDialogsProps> = ({
  isFileUploaderOpen,
  effectiveCreateDialogOpen,
  isEditMode,
  isViewDialogOpen,
  selectedEvent,
  eventToShare,
  previewItem,
  isImagePreviewOpen,
  shareDialogOpen,
  rsvpDialogOpen,
  setIsFileUploaderOpen,
  effectiveSetCreateDialogOpen,
  setIsEditMode,
  setIsViewDialogOpen,
  setIsImagePreviewOpen,
  setPreviewItem,
  setShareDialogOpen,
  setRsvpDialogOpen,
  handleSaveEvent,
  handleDeleteEvent,
  handleViewToEdit,
  handleOpenImagePreview,
  handleShareEvent,
  handleRSVP,
  handleShareLink,
  submitRSVP
}) => {
  return (
    <>
      <EventFormDialog
        isOpen={(effectiveCreateDialogOpen || isEditMode) && !isFileUploaderOpen && !isViewDialogOpen}
        setIsOpen={(open) => {
          effectiveSetCreateDialogOpen(open);
          if (!open) setIsEditMode(false);
        }}
        onSubmit={handleSaveEvent}
        selectedEvent={selectedEvent}
        isEditMode={isEditMode}
        onDeleteEvent={handleDeleteEvent}
      />
      
      <EventViewDialogExtension
        isOpen={isViewDialogOpen && !isFileUploaderOpen}
        setIsOpen={setIsViewDialogOpen}
        selectedEvent={selectedEvent}
        onEdit={handleViewToEdit}
        onDelete={handleDeleteEvent}
        onViewImage={handleOpenImagePreview}
        onShare={handleShareEvent}
        onRSVP={handleRSVP}
      />
      
      <FullScreenPreview 
        item={previewItem}
        onClose={() => {
          setIsImagePreviewOpen(false);
          setPreviewItem(null);
        }}
        readOnly={false}
      />

      <InviteDialog
        isOpen={shareDialogOpen}
        setIsOpen={setShareDialogOpen}
        event={eventToShare}
        onShareLink={handleShareLink}
      />
      
      <RSVPDialog
        isOpen={rsvpDialogOpen}
        setIsOpen={setRsvpDialogOpen}
        event={eventToShare}
        onRSVP={submitRSVP}
      />
    </>
  );
};

export default EventDialogs;
