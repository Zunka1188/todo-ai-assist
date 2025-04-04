
import React from 'react';
import { EllipsisVertical, Repeat } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResponsiveButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  onClick?: () => void;
  onIconClick?: (e: React.MouseEvent) => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  iconSize?: number;
  className?: string;
  iconClassName?: string;
  active?: boolean;
  hideIcon?: boolean;
  // Properties for shopping items
  quantity?: string;
  price?: string; // We'll keep this in the props but not display it
  notes?: string; // We'll keep this in the props but not display it
  repeatOption?: 'none' | 'weekly' | 'monthly';
  imageUrl?: string;
}

const ResponsiveButton = React.forwardRef<HTMLButtonElement, ResponsiveButtonProps>(
  ({ 
    text, 
    onClick, 
    onIconClick, 
    variant = 'default', 
    iconSize = 20, 
    className = '', 
    iconClassName = '',
    active = false,
    hideIcon = false,
    quantity,
    price,
    notes,
    repeatOption,
    imageUrl,
    ...props 
  }, ref) => {
    
    const handleIconClick = (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent button click when clicking the icon
      if (onIconClick) {
        onIconClick(e);
      }
    };

    // Determine if we have details to show
    const hasDetails = quantity || (repeatOption && repeatOption !== 'none');
    
    // Using the exact grocery item widget style per specifications
    return (
      <div style={{
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
                }}>No img</span>
              </div>
            )}
          </div>
          
          {/* Right Column - Product Details */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            marginLeft: '8px',
            flexGrow: 1,
            overflow: 'hidden',
            paddingRight: '8px',
            maxWidth: '176px'
          }}>
            <div style={{
              display: 'flex',
              width: '100%',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{
                fontSize: '16px',
                fontWeight: 'bold',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                marginRight: '4px'
              }}>
                {text}
              </span>
              
              {!hideIcon && (
                <div 
                  onClick={handleIconClick}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: 'auto',
                    borderRadius: '50%',
                    padding: '2px',
                    cursor: 'pointer',
                    flexShrink: 0
                  }}
                  aria-label="More options"
                  role="button"
                  tabIndex={0}
                >
                  <EllipsisVertical 
                    size={iconSize} 
                    style={{ color: 'currentColor' }} 
                  />
                </div>
              )}
            </div>

            {/* Additional Details - Only showing quantity and repeat option - MODIFIED TO REMOVE "Qty:" PREFIX */}
            {hasDetails && (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                width: '100%',
                fontSize: '12px',
                color: '#64748b',
                marginTop: '4px'
              }}>
                {quantity && (
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    {quantity}
                  </span>
                )}
                {repeatOption && repeatOption !== 'none' && (
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <Repeat size={10} style={{ marginRight: '4px' }} />
                    {repeatOption === 'weekly' ? 'Weekly' : 'Monthly'}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Bottom Section: Button (32px height) */}
        <button
          ref={ref}
          onClick={onClick}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '32px',
            backgroundColor: variant === 'default' ? '#28a745' : '#6c757d',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderTop: '1px solid #e2e8f0',
            color: 'white',
            fontWeight: 500,
            fontSize: '14px',
            width: '100%',
            border: 'none',
            cursor: 'pointer'
          }}
          {...props}
        >
          {props.children || "Action"}
        </button>
      </div>
    );
  }
);

ResponsiveButton.displayName = 'ResponsiveButton';

export { ResponsiveButton };
