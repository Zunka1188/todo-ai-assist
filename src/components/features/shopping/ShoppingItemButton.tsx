import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check, Repeat, MoreVertical, Maximize2, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useTheme } from '@/hooks/use-theme';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const { isMobile } = useIsMobile();
  
  const bgColor = theme === 'dark' ? '#1E1E1E' : 'white';
  const textColor = theme === 'dark' ? '#E0E0E0' : 'black';
  const borderColor = theme === 'dark' ? '#333333' : '#e2e8f0';
  const secondaryTextColor = theme === 'dark' ? '#B0B0B0' : '#64748b';
  
  const containerWidth = '100%';
  const imageSize = isMobile ? '45px' : '80px';
  const headerHeight = isMobile ? '24px' : '40px';
  const buttonHeight = isMobile ? '24px' : '40px';
  const fontSize = isMobile ? '12px' : '16px';
  const detailsFontSize = isMobile ? '10px' : '15px';
  const iconSize = isMobile ? 10 : 14;
  
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
    <div className="shopping-item-container h-full" style={{
      width: containerWidth,
      border: `2px solid ${borderColor}`,
      borderRadius: '6px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
      backgroundColor: bgColor
    }}>
      <div style={{
        height: headerHeight,
        padding: '0 12px',
        borderBottom: `1px solid ${borderColor}`,
        backgroundColor: bgColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          fontSize: fontSize,
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
      
      <div style={{
        display: 'flex',
        width: '100%'
      }}>
        <div style={{
          width: imageSize,
          height: imageSize,
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
                fontSize: isMobile ? '10px' : '12px',
                color: secondaryTextColor
              }}>No image</span>
            </div>
          )}
        </div>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          width: `calc(100% - ${imageSize})`,
          height: imageSize,
          position: 'relative'
        }}>
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
                    className={isMobile ? "h-6 w-6 p-0" : "h-8 w-8 p-0"}
                    style={{ color: theme === 'dark' ? '#B0B0B0' : undefined }}
                  >
                    <MoreVertical className={isMobile ? "h-4 w-4" : "h-5 w-5"} />
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
          
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            height: isMobile ? '22px' : '30px',
            paddingLeft: '10px',
            paddingRight: '20px'
          }}>
            {quantity && (
              <div className="flex items-center" style={{
                fontSize: detailsFontSize,
                fontWeight: 600,
                color: textColor
              }}>
                <span>{quantity}</span>
              </div>
            )}
          </div>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            height: isMobile ? '22px' : '30px',
            paddingLeft: '10px'
          }}>
            {repeatOption && repeatOption !== 'none' && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                fontSize: isMobile ? '11px' : '14px', 
                fontWeight: 400,
                color: textColor
              }}>
                <Repeat size={iconSize} style={{ marginRight: '4px' }} />
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {repeatOption === 'weekly' ? 'Weekly' : 'Monthly'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div style={{
        height: buttonHeight,
        backgroundColor: completed ? '#6c757d' : '#28A745',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderTop: `1px solid ${borderColor}`,
        color: 'white',
        fontWeight: 600,
        fontSize: isMobile ? '13px' : '15px',
        cursor: 'pointer',
        boxShadow: '0 -2px 4px rgba(0, 0, 0, 0.1)',
        transition: 'background-color 0.2s ease',
        width: '100%'
      }}
      onClick={onClick}
      onMouseOver={(e) => { 
        if (!completed) e.currentTarget.style.backgroundColor = '#23963F'
      }}
      onMouseOut={(e) => { 
        if (!completed) e.currentTarget.style.backgroundColor = '#28A745'
      }}
      >
        {completed ? (
          <>
            <Check size={isMobile ? 14 : 16} style={{ marginRight: '8px' }} />
            <span>Purchased</span>
          </>
        ) : (
          <span>Purchase</span>
        )}
      </div>

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
    </div>
  );
};

export default ShoppingItemButton;
