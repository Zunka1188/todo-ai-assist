import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}
const SearchInput = ({
  value,
  onChange,
  placeholder = 'Search...',
  className
}: SearchInputProps) => {
  return <div className={`relative ${className}`}>
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input type="search" placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} className="pl-9 py-0 my-[11px]" />
    </div>;
};
export default SearchInput;