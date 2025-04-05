
import React from 'react';
import { EllipsisVertical, Repeat } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { WidgetWrapper } from '@/components/widgets/WidgetsIndex';

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
  price?: string; 
  notes?: string; 
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
    const { isMobile } = useIsMobile();
    
    // Scale dimensions for mobile only (70% of original)
    const containerWidth = isMobile ? '168px' : '240px';
    const containerHeight = isMobile ? '67px' : '96px';
    const topSectionHeight = isMobile ? '45px' : '64px';
    const bottomSectionHeight = isMobile ? '22px' : '32px';
    const imageSize = isMobile ? '34px' : '48px';
    const margin = isMobile ? '5px' : '8px';
    const fontSize = isMobile ? '13px' : '16px';
    const detailsFontSize = isMobile ? '10px' : '12px';
    const adjustedIconSize = isMobile ? iconSize * 0.7 : iconSize;
    
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
        width: containerWidth,
        height: containerHeight,
        border: '2px solid var(--border-color, #e2e8f0)',
        borderRadius: '6px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        backgroundColor: 'var(--bg-color, white)'
      }} className={cn("bg-card", className)}>
        {/* Top Section: Product Image & Details */}
        <div style={{
          display: 'flex',
          height: topSectionHeight,
          width: '100%'
        }}>
          {/* Left Column - Product Image */}
          <div style={{
            width: imageSize,
            height: imageSize,
            margin: margin,
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
                  fontSize: isMobile ? '8px' : '10px',
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
            marginLeft: margin,
            flexGrow: 1,
            overflow: 'hidden',
            paddingRight: margin,
            maxWidth: `calc(${containerWidth} - ${imageSize} - ${margin} * 3)`
          }}>
            <div style={{
              display: 'flex',
              width: '100%',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{
                fontSize: fontSize,
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
                    size={adjustedIconSize} 
                    style={{ color: 'currentColor' }} 
                  />
                </div>
              )}
            </div>

            {/* Additional Details - Only showing quantity and repeat option */}
            {hasDetails && (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: isMobile ? '5px' : '8px',
                width: '100%',
                fontSize: detailsFontSize,
                color: '#64748b',
                marginTop: isMobile ? '2px' : '4px'
              }}>
                {quantity && (
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    {quantity}
                  </span>
                )}
                {repeatOption && repeatOption !== 'none' && (
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <Repeat size={isMobile ? 8 : 10} style={{ marginRight: '4px' }} />
                    {repeatOption === 'weekly' ? 'Weekly' : 'Monthly'}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Bottom Section: Button */}
        <button
          ref={ref}
          onClick={onClick}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: bottomSectionHeight,
            backgroundColor: variant === 'default' ? '#28a745' : '#6c757d',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderTop: '1px solid #e2e8f0',
            color: 'white',
            fontWeight: 500,
            fontSize: isMobile ? '12px' : '14px',
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
