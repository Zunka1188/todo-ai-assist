
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check, Repeat } from 'lucide-react';

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
  imageUrl
}: ShoppingItemButtonProps) => {
  // Determine if we need to show additional info
  const hasAdditionalInfo = quantity || price || notes || (repeatOption && repeatOption !== 'none');
  
  return (
    <div className="shopping-item-container" style={{
      width: '240px',
      height: '96px',
      border: '2px solid var(--border-color, #e2e8f0)',
      borderRadius: '6px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      backgroundColor: 'var(--bg-color, white)'
    }}>
      {/* Top Section: Product Image & Details (64px height) */}
      <div style={{
        display: 'flex',
        height: '64px',
        width: '100%'
      }}>
        {/* Left Column - Product Image (48x48px with 8px margin) */}
        <div style={{
          width: '48px',
          height: '48px',
          margin: '8px',
          flexShrink: 0
        }}>
          {imageUrl ? (
            <div 
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '4px',
                backgroundImage: `url(${imageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                border: '1px solid #e2e8f0'
              }}
              aria-hidden="true"
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              borderRadius: '4px',
              backgroundColor: '#e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }} aria-hidden="true">
              <span style={{
                fontSize: '10px',
                color: '#64748b'
              }}>No image</span>
            </div>
          )}
        </div>
        
        {/* Right Column - Product Details (with 8px gap from image) */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          marginLeft: '8px',
          overflow: 'hidden',
          maxWidth: '176px' // Adjusted for the smaller width (240px - 48px - 8px - 8px)
        }}>
          {/* Product Name */}
          <div style={{
            fontSize: '16px',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {name || "Unnamed Product"}
          </div>
          
          {/* Additional Details */}
          {hasAdditionalInfo && (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              fontSize: '12px',
              color: '#64748b',
              marginTop: '4px'
            }}>
              {quantity && (
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  Qty: {quantity}
                </span>
              )}
              {price && (
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  ${price}
                </span>
              )}
              {repeatOption && repeatOption !== 'none' && (
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <Repeat size={10} style={{ marginRight: '4px' }} />
                  {repeatOption === 'weekly' ? 'Weekly' : 'Monthly'}
                </span>
              )}
              {notes && (
                <div style={{
                  width: '100%',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {notes}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Bottom Section: Purchase Button (32px height) */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '32px',
        backgroundColor: completed ? '#6c757d' : '#28a745',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderTop: '1px solid #e2e8f0',
        color: 'white',
        fontWeight: 500,
        fontSize: '14px',
        cursor: 'pointer'
      }}
      onClick={onClick}
      >
        {completed ? (
          <>
            <Check size={14} style={{ marginRight: '8px' }} />
            <span>Purchased</span>
          </>
        ) : (
          <span>Purchase</span>
        )}
      </div>
    </div>
  );
};

export default ShoppingItemButton;
