
import { ToastProvider as HookToastProvider, useToast } from "@/hooks/use-toast";
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";

// This component must be a child of ToastProvider from use-toast.ts
function ToastList() {
  const { toasts } = useToast();
  
  return (
    <>
      {toasts.map(function ({
        id,
        title,
        description,
        action,
        ...props
      }) {
        return (
          <Toast key={id} {...props}>
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && (
              <ToastDescription>{description}</ToastDescription>
            )}
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </>
  );
}

export function Toaster() {
  return (
    <HookToastProvider>
      <ToastProvider>
        <ToastList />
      </ToastProvider>
    </HookToastProvider>
  );
}
