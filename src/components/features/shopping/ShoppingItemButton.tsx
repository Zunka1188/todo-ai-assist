
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check, Repeat, MoreVertical, Maximize2, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useTheme } from '@/hooks/use-theme';

interface ShoppingItemButtonProps {
  completed: boolean;
  onClick: (e: React.MouseEvent) => void;
  className?: string;
  quantity?: string;
  notes?: string;
  repeatOption?: 'none' | 'weekly' | 'monthly';
  name?: string;
  imageUrl?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onImagePreview?: () => void;
}

const ShoppingItemButton = ({ 
  completed, 
  onClick, 
  className,
  quantity,
  notes,
  repeatOption,
  name,
  imageUrl,
  onEdit,
  onDelete,
  onImagePreview
}: ShoppingItemButtonProps) => {
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const { theme } = useTheme();
  
  const bgColor = theme === 'dark' ? '#1E1E1E' : 'white';
  const textColor = theme === 'dark' ? '#E0E0E0' : 'black';
  const borderColor = theme === 'dark' ? '#333333' : '#e2e8f0';
  const secondaryTextColor = theme === 'dark' ? '#B0B0B0' : '#64748b';
  
  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleImageClick = (e: React.MouseEvent) => {
    if (imageUrl) {
      e.stopPropagation();
      if (onImagePreview) {
        onImagePreview();
      } else {
        setImagePreviewOpen(true);
      }
    }
  };
  
  return (
    <>
      <div className="shopping-item-container" style={{
        width: '240px',
        border: `2px solid ${borderColor}`,
        borderRadius: '6px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
        backgroundColor: bgColor
      }}>
        {/* Top Section: Item Name - 40px height */}
        <div style={{
          height: '40px',
          padding: '0 12px',
          borderBottom: `1px solid ${borderColor}`,
          backgroundColor: bgColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            fontSize: '16px',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            color: textColor,
            textAlign: 'center',
            width: '100%'
          }}>
            {name || "Unnamed Product"}
          </div>
        </div>
        
        {/* Middle Section: Product Image & Details - 80px height */}
        <div style={{
          display: 'flex',
          height: '80px',
          width: '100%'
        }}>
          {/* Left Column - Product Image (80x80px) */}
          <div style={{
            width: '80px',
            height: '80px',
            flexShrink: 0,
            cursor: imageUrl ? 'pointer' : 'default'
          }} onClick={handleImageClick}>
            {imageUrl ? (
              <div 
                style={{
                  width: '100%',
                  height: '100%',
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
                backgroundColor: theme === 'dark' ? '#333333' : '#e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }} aria-hidden="true">
                <span style={{
                  fontSize: '12px',
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
            width: '160px',
            height: '80px',
            position: 'relative'
          }}>
            {/* Menu (⋮) Icon - positioned at top right */}
            {(onEdit || onDelete) && (
              <div style={{
                position: 'absolute',
                top: '5px',
                right: '5px',
                zIndex: 5
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
                          if (onImagePreview) {
                            onImagePreview();
                          } else {
                            setImagePreviewOpen(true);
                          }
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
            
            {/* Quantity Line - centered vertically - MODIFIED TO REMOVE "Qty:" PREFIX */}
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              height: '30px',
              paddingLeft: '10px',
              paddingRight: '20px' // Additional space for the menu icon
            }}>
              {quantity && (
                <div className="flex items-center" style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  color: textColor
                }}>
                  <span>{quantity}</span>
                </div>
              )}
            </div>
            
            {/* Repeat Option Line - centered vertically */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              height: '30px',
              paddingLeft: '10px'
            }}>
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
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Bottom Section: Purchase Button - 40px height */}
        <div style={{
          height: '40px',
          backgroundColor: completed ? '#6c757d' : '#28A745', // Using green color exactly as specified
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
          if (!completed) e.currentTarget.style.backgroundColor = '#28A745' // Back to original green
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
      
      {/* Image Full Screen Preview Dialog - only used if onImagePreview is not provided */}
      {!onImagePreview && (
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
      )}
    </>
  );
};

export default ShoppingItemButton;
