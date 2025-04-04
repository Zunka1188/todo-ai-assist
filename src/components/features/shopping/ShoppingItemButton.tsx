
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check, Repeat, MoreVertical, Maximize2, Edit, Trash2, ChevronDown } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useTheme } from '@/hooks/use-theme';

interface ShoppingItemButtonProps {
  completed: boolean;
  onClick: (e: React.MouseEvent) => void;
  className?: string;
  quantity?: string;
  price?: string;
  notes?: string;
  repeatOption?: 'none' | 'weekly' | 'monthly';
  name?: string;
  imageUrl?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

const ShoppingItemButton = ({ 
  completed, 
  onClick, 
  className,
  quantity,
  price,
  notes,
  repeatOption,
  name,
  imageUrl,
  onEdit,
  onDelete
}: ShoppingItemButtonProps) => {
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const { theme } = useTheme();
  
  // Determine background and text colors based on theme
  const bgColor = theme === 'dark' ? '#1E1E1E' : 'white';
  const textColor = theme === 'dark' ? '#E0E0E0' : 'black';
  const borderColor = theme === 'dark' ? '#333333' : '#e2e8f0';
  const secondaryTextColor = theme === 'dark' ? '#B0B0B0' : '#64748b';
  
  // Handle dropdown click without triggering the parent button
  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Handle image click to show full-screen preview
  const handleImageClick = (e: React.MouseEvent) => {
    if (imageUrl) {
      e.stopPropagation();
      setImagePreviewOpen(true);
    }
  };
  
  return (
    <>
      <div className="shopping-item-container" style={{
        width: '240px',
        height: '128px', // Increased height to accommodate the item name at top
        border: `2px solid ${borderColor}`,
        borderRadius: '6px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
        backgroundColor: bgColor
      }}>
        {/* Top Section: Item Name (new) */}
        <div style={{
          padding: '8px 12px',
          borderBottom: `1px solid ${borderColor}`,
          backgroundColor: bgColor
        }}>
          <div style={{
            fontSize: '16px',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            color: textColor
          }}>
            {name || "Unnamed Product"}
          </div>
        </div>
        
        {/* Middle Section: Product Image & Details */}
        <div style={{
          display: 'flex',
          flex: 1,
          width: '100%'
        }}>
          {/* Left Column - Product Image (48x48px with 8px margin) */}
          <div style={{
            width: '48px',
            height: '48px',
            margin: '8px',
            flexShrink: 0,
            cursor: imageUrl ? 'pointer' : 'default'
          }} onClick={handleImageClick}>
            {imageUrl ? (
              <div 
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '4px',
                  backgroundImage: `url(${imageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  border: `1px solid ${borderColor}`
                }}
                aria-hidden="true"
              />
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                borderRadius: '4px',
                backgroundColor: theme === 'dark' ? '#333333' : '#e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }} aria-hidden="true">
                <span style={{
                  fontSize: '10px',
                  color: secondaryTextColor
                }}>No image</span>
              </div>
            )}
          </div>
          
          {/* Right Column - Product Details with structured alignment */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            marginLeft: '8px',
            flex: 1,
            padding: '8px 0',
            gap: '6px', // Equal spacing between lines (4-6px as requested)
          }}>
            {/* First line: Qty & Price - Bold and larger (14-16px) */}
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              paddingRight: '12px'
            }}>
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '15px',
                fontWeight: 600,
                color: textColor
              }}>
                {quantity && (
                  <div className="flex items-center">
                    <span>Qty: {quantity}</span>
                    <ChevronDown size={14} className="ml-1 opacity-70" />
                  </div>
                )}
                {price && quantity && (
                  <span className="mx-2">•</span>
                )}
                {price && (
                  <span>${price}</span>
                )}
              </div>
              
              {/* Three-dot Menu - Always visible and right-aligned */}
              {(onEdit || onDelete) && (
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                }}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={handleDropdownClick}>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 p-0"
                        style={{ color: theme === 'dark' ? '#B0B0B0' : undefined }}
                      >
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      align="end"
                      style={{ 
                        zIndex: 100,
                        backgroundColor: theme === 'dark' ? '#333333' : 'white',
                        border: `1px solid ${theme === 'dark' ? '#555555' : '#e2e8f0'}`,
                        minWidth: '150px',
                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.3)'
                      }}
                    >
                      {imageUrl && (
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.preventDefault();
                            setImagePreviewOpen(true);
                          }}
                          className={theme === 'dark' ? 'text-zinc-200 hover:bg-zinc-800' : ''}
                        >
                          <Maximize2 className="mr-2 h-4 w-4" />
                          View Image
                        </DropdownMenuItem>
                      )}
                      {onEdit && (
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.preventDefault();
                            onEdit();
                          }}
                          className={theme === 'dark' ? 'text-zinc-200 hover:bg-zinc-800' : ''}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      {onDelete && (
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.preventDefault();
                            onDelete();
                          }}
                          className={theme === 'dark' ? 'text-zinc-200 hover:bg-zinc-800' : ''}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
            
            {/* Second line: Repeat Frequency - Same size, lighter weight */}
            {repeatOption && repeatOption !== 'none' && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                fontSize: '14px', 
                fontWeight: 400,
                color: textColor
              }}>
                <Repeat size={14} style={{ marginRight: '4px' }} />
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {repeatOption === 'weekly' ? 'Weekly' : 'Monthly'}
                  <ChevronDown size={14} className="ml-1 opacity-70" />
                </span>
              </div>
            )}
            
            {/* Third line: Notes - Smallest font (12px) */}
            {notes && (
              <div style={{
                fontSize: '12px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                color: secondaryTextColor
              }}>
                {notes}
              </div>
            )}
          </div>
        </div>
        
        {/* Bottom Section: Purchase Button - Full width, increased height, shadow for depth */}
        <div style={{
          height: '36px', // Increased height to 36px as requested
          backgroundColor: completed ? '#6c757d' : '#3B9E47', // Using the green color specified
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderTop: `1px solid ${borderColor}`,
          color: 'white',
          fontWeight: 600,
          fontSize: '15px',
          cursor: 'pointer',
          boxShadow: '0 -2px 4px rgba(0, 0, 0, 0.1)',
          transition: 'background-color 0.2s ease',
          width: '100%'
        }}
        onClick={onClick}
        onMouseOver={(e) => { 
          if (!completed) e.currentTarget.style.backgroundColor = '#23963F' // Darker green on hover
        }}
        onMouseOut={(e) => { 
          if (!completed) e.currentTarget.style.backgroundColor = '#3B9E47' // Back to original green
        }}
        >
          {completed ? (
            <>
              <Check size={16} style={{ marginRight: '8px' }} />
              <span>Purchased</span>
            </>
          ) : (
            <span>Purchase</span>
          )}
        </div>
      </div>
      
      {/* Image Full Screen Preview Dialog */}
      <Dialog open={imagePreviewOpen} onOpenChange={setImagePreviewOpen}>
        <DialogContent className={`max-w-4xl p-0 overflow-hidden ${theme === 'dark' ? 'bg-zinc-900 border-zinc-700' : 'bg-white'}`}>
          <div className="relative w-full h-full max-h-[80vh] flex items-center justify-center">
            {imageUrl && (
              <img 
                src={imageUrl} 
                alt={name || "Product image"} 
                className="max-w-full max-h-full object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ShoppingItemButton;
