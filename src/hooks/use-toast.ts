
// This file forwards exports from other components
import { useToast as useToastOriginal, toast } from "@/components/ui/toast";

export { toast };
export const useToast = useToastOriginal;
