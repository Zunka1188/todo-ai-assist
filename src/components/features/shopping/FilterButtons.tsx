
import React from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useIsMobile } from '@/hooks/use-mobile';

type FilterMode = 'all' | 'one-off' | 'weekly' | 'monthly';

interface FilterButtonsProps {
  activeFilter: FilterMode;
  onFilterChange: (value: FilterMode) => void;
}

const FilterButtons: React.FC<FilterButtonsProps> = ({
  activeFilter,
  onFilterChange,
}) => {
  const { isMobile } = useIsMobile();
  
  // Handle the toggle group value change
  const handleValueChange = (value: string) => {
    if (value) {
      onFilterChange(value as FilterMode);
    }
  };

  return (
    <ToggleGroup
      type="single"
      value={activeFilter}
      onValueChange={handleValueChange}
      className="justify-start"
    >
      <ToggleGroupItem value="all" aria-label="Show all items">
        All
      </ToggleGroupItem>
      <ToggleGroupItem value="one-off" aria-label="Show one-off items">
        One-off
      </ToggleGroupItem>
      <ToggleGroupItem value="weekly" aria-label="Show weekly items">
        Weekly
      </ToggleGroupItem>
      <ToggleGroupItem value="monthly" aria-label="Show monthly items">
        Monthly
      </ToggleGroupItem>
    </ToggleGroup>
  );
};

export default FilterButtons;
