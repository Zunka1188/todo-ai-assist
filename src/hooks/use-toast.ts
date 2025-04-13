
// This file forwards exports from the shadcn toast component
import { Toast, ToastActionElement, ToastProps } from "@/components/ui/toast";
import { useToast as useToastHook } from "@/components/ui/toast"

// Re-export the toast types
export type { 
  Toast,
  ToastActionElement,
  ToastProps
};

// Create and export the toast function
export const toast = ({ ...props }) => {
  const { toast } = useToastHook();
  return toast(props);
};

// Export the useToast hook
export const useToast = useToastHook;
