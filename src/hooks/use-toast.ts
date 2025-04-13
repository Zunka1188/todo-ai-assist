
// This file implements a custom useToast hook from the shadcn Toast component
import * as React from "react";
import {
  Toast,
  ToastActionElement,
  ToastProps,
  ToastProvider,
  ToastViewport
} from "@/components/ui/toast";

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 1000000;

type ToastContextType = {
  toasts: ToasterToast[];
  addToast: (toast: Omit<ToasterToast, "id">) => string;
  updateToast: (id: string, toast: Partial<ToasterToast>) => void;
  dismissToast: (id: string) => void;
  removeToast: (id: string) => void;
};

export const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = React.useContext(ToastContext);

  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return {
    toast: context.addToast,
    dismiss: context.dismissToast,
    toasts: context.toasts,
  };
}

export function ToastProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [toasts, setToasts] = React.useState<ToasterToast[]>([]);

  const addToast = React.useCallback(
    (toast: Omit<ToasterToast, "id">) => {
      const id = crypto.randomUUID();

      setToasts((toasts) => {
        const newToasts = [
          { id, ...toast },
          ...toasts.filter(
            (t) => t.description !== toast.description || t.title !== toast.title
          ),
        ].slice(0, TOAST_LIMIT);

        return newToasts;
      });

      return id;
    },
    []
  );

  const updateToast = React.useCallback(
    (id: string, toast: Partial<ToasterToast>) => {
      setToasts((toasts) =>
        toasts.map((t) => (t.id === id ? { ...t, ...toast } : t))
      );
    },
    []
  );

  const dismissToast = React.useCallback((id: string) => {
    setToasts((toasts) =>
      toasts.map((t) =>
        t.id === id ? { ...t, dismissed: true } : t
      )
    );
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((toasts) => toasts.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        updateToast,
        dismissToast,
        removeToast,
      }}
    >
      {children}
    </ToastContext.Provider>
  );
}

// Simple function to create a toast using the hook
export const toast = (props: Omit<ToasterToast, "id">) => {
  const { toast } = useToast();
  return toast(props);
};

// Re-export the toast types
export type { 
  Toast,
  ToastActionElement,
  ToastProps
};
