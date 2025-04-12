declare module 'react' {
  export const useState: <T>(initialState: T | (() => T)) => [T, (newState: T | ((prevState: T) => T)) => void];
  export const useEffect: (effect: () => void | (() => void), deps?: any[]) => void;
  export const useRef: <T>(initialValue: T) => { current: T };
  export const createRef: <T>() => { current: T | null };
  export const createElement: any;
  export const Fragment: any;
  export type FC<P = {}> = (props: P) => JSX.Element | null;
  export type ReactNode = any;
  export type SVGProps<T> = any;
  export type ChangeEvent<T> = { target: T };
  export type CSSProperties = {
    [key: string]: string | number | undefined;
  };
  export default {
    useState,
    useEffect,
    useRef,
    createRef,
    createElement,
    Fragment
  };
}

declare module 'lucide-react' {
  import { FC, SVGProps } from 'react';
  export interface IconProps extends SVGProps<SVGSVGElement> {
    size?: number | string;
    color?: string;
    strokeWidth?: number;
  }
  export const Search: FC<IconProps>;
  export const Plus: FC<IconProps>;
  export const X: FC<IconProps>;
  export const AlertTriangle: FC<IconProps>;
  export const Trash2: FC<IconProps>;
  export const Camera: FC<IconProps>;
  export const Pencil: FC<IconProps>;
  export const ChevronLeft: FC<IconProps>;
  export const ChevronRight: FC<IconProps>;
  export const Clock: FC<IconProps>;
  export const AlertCircle: FC<IconProps>;
  export const MapPin: FC<IconProps>;
}

declare module '@/components/ui/*' {
  import { FC, ReactNode } from 'react';
  
  export interface ButtonProps {
    variant?: 'default' | 'destructive' | 'outline' | 'ghost';
    size?: 'default' | 'sm' | 'lg';
    children: ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
  }
  
  export interface InputProps {
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    className?: string;
    id?: string;
  }
  
  export interface DialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: ReactNode;
  }
  
  export interface SpinnerProps {
    size?: 'sm' | 'default' | 'lg';
    className?: string;
  }
  
  export const Button: FC<ButtonProps>;
  export const Input: FC<InputProps>;
  export const Dialog: FC<DialogProps>;
  export const DialogContent: FC<{ children: ReactNode; className?: string }>;
  export const DialogHeader: FC<{ children: ReactNode }>;
  export const DialogTitle: FC<{ children: ReactNode }>;
  export const DialogFooter: FC<{ children: ReactNode; className?: string }>;
  export const Spinner: FC<SpinnerProps>;
  export const Alert: FC<{ variant?: string; className?: string; children: ReactNode }>;
  export const AlertTitle: FC<{ children: ReactNode }>;
  export const AlertDescription: FC<{ children: ReactNode; className?: string }>;
  export const Label: FC<{ htmlFor?: string; children: ReactNode }>;
  export const Select: FC<{ value?: string; onValueChange?: (value: string) => void; children: ReactNode }>;
  export const SelectTrigger: FC<{ children: ReactNode }>;
  export const SelectValue: FC<{ placeholder?: string }>;
  export const SelectContent: FC<{ children: ReactNode }>;
  export const SelectItem: FC<{ value: string; children: ReactNode }>;
  export const Tabs: FC<{ value?: string; onValueChange?: (value: string) => void; className?: string; children: ReactNode }>;
  export const TabsList: FC<{ children: ReactNode }>;
  export const TabsTrigger: FC<{ value: string; children: ReactNode }>;
  export const TabsContent: FC<{ value: string; className?: string; children: ReactNode }>;
}

declare module '@/hooks/use-local-storage' {
  export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void];
}

declare module 'react-router-dom' {
  export const useNavigate: () => (to: string | { search: string }, options?: { replace?: boolean }) => void;
  export const useLocation: () => { search: string; pathname: string };
}
