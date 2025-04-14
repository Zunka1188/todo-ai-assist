
import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  CalendarDays,
  AlignLeft,
  DollarSign,
  Clock
} from 'lucide-react';
import { SortOption } from './useShoppingItems';

interface SortingMenuDropdownProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

const SortingMenuDropdown: React.FC<SortingMenuDropdownProps> = ({ value, onChange }) => {
  const getSortLabel = (option: SortOption): string => {
    switch (option) {
      case 'nameAsc': return 'Name (A-Z)';
      case 'nameDesc': return 'Name (Z-A)';
      case 'dateAsc': return 'Date (Oldest)';
      case 'dateDesc': return 'Date (Newest)';
      case 'priceAsc': return 'Price (Low-High)';
      case 'priceDesc': return 'Price (High-Low)';
      case 'newest': return 'Recently Added';
      case 'oldest': return 'Oldest Added';
      default: return 'Sort';
    }
  };
  
  const getSortIcon = (option: SortOption): JSX.Element => {
    switch (option) {
      case 'nameAsc':
      case 'nameDesc':
        return <AlignLeft className="h-4 w-4" />;
      case 'dateAsc':
      case 'dateDesc':
        return <CalendarDays className="h-4 w-4" />;
      case 'priceAsc':
      case 'priceDesc':
        return <DollarSign className="h-4 w-4" />;
      case 'newest':
      case 'oldest':
        return <Clock className="h-4 w-4" />;
      default:
        return <ArrowUpDown className="h-4 w-4" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1 h-9 text-xs">
          {getSortIcon(value)}
          <span className="hidden sm:inline">Sort:</span>
          <span className="max-w-[85px] truncate">{getSortLabel(value)}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Sort By</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => onChange('nameAsc')}
          className="flex items-center justify-between"
        >
          <span className="flex items-center gap-2">
            <AlignLeft className="h-4 w-4" />
            Name (A-Z)
          </span>
          {value === 'nameAsc' && <ArrowUp className="h-3 w-3" />}
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => onChange('nameDesc')}
          className="flex items-center justify-between"
        >
          <span className="flex items-center gap-2">
            <AlignLeft className="h-4 w-4" />
            Name (Z-A)
          </span>
          {value === 'nameDesc' && <ArrowDown className="h-3 w-3" />}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => onChange('newest')}
          className="flex items-center justify-between"
        >
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Recently Added
          </span>
          {value === 'newest' && <ArrowDown className="h-3 w-3" />}
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => onChange('oldest')}
          className="flex items-center justify-between"
        >
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Oldest Added
          </span>
          {value === 'oldest' && <ArrowUp className="h-3 w-3" />}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => onChange('priceAsc')}
          className="flex items-center justify-between"
        >
          <span className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Price (Low-High)
          </span>
          {value === 'priceAsc' && <ArrowUp className="h-3 w-3" />}
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => onChange('priceDesc')}
          className="flex items-center justify-between"
        >
          <span className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Price (High-Low)
          </span>
          {value === 'priceDesc' && <ArrowDown className="h-3 w-3" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SortingMenuDropdown;
