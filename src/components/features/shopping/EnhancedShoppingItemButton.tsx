
import React, { forwardRef, KeyboardEvent } from 'react';
import ShoppingItemButton from './ShoppingItemButton';

type EnhancedShoppingItemButtonProps = React.ComponentProps<typeof ShoppingItemButton>;

const EnhancedShoppingItemButton = forwardRef<HTMLButtonElement, EnhancedShoppingItemButtonProps>(
  (props, ref) => {
    const {
      name,
      completed,
      onClick,
      onEdit,
      onDelete,
      onImagePreview,
      quantity,
      repeatOption,
      imageUrl,
      notes,
      readOnly,
      ...rest
    } = props;

    // Generate accessible labels
    const itemStatus = completed ? "completed" : "to buy";
    const buttonLabel = `${name} - ${itemStatus}${quantity ? `, quantity: ${quantity}` : ""}`;
    const editLabel = `Edit ${name} details`;
    const deleteLabel = `Delete ${name} from shopping list`;
    const imageLabel = `View image for ${name}`;

    // Handle keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        onClick?.(e as any);
        e.preventDefault();
      }
    };

    return (
      <ShoppingItemButton
        name={name}
        completed={completed}
        onClick={onClick as any} // Type casting to handle event type mismatch
        onEdit={onEdit}
        onDelete={onDelete}
        onImagePreview={onImagePreview}
        quantity={quantity}
        repeatOption={repeatOption}
        imageUrl={imageUrl}
        notes={notes}
        readOnly={readOnly}
        aria-label={buttonLabel}
        role="listitem"
        aria-pressed={completed}
        data-edit-label={editLabel}
        data-delete-label={deleteLabel}
        data-image-label={imageLabel}
        onKeyDown={handleKeyDown}
        {...rest}
        ref={ref}
      />
    );
  }
);

EnhancedShoppingItemButton.displayName = 'EnhancedShoppingItemButton';

export default EnhancedShoppingItemButton;
