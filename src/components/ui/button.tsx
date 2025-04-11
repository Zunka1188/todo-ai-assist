
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98]",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:scale-[0.98]",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground active:scale-[0.98]",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:scale-[0.98]",
        ghost: "hover:bg-accent hover:text-accent-foreground active:bg-accent/80",
        link: "text-primary underline-offset-4 hover:underline",
        primary: "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98]", // Added primary variant
        
        // Semantic variants for better naming consistency
        active: "bg-green-500 text-white hover:bg-green-600 active:bg-green-700 active:scale-[0.98]",
        completed: "bg-gray-400 text-white hover:bg-gray-500 active:bg-gray-600 active:scale-[0.98]",
        purple: "bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800 active:scale-[0.98]",
        purchase: "bg-[#28a745] text-white hover:bg-[#218838] active:bg-[#1e7e34] active:scale-[0.98]",
        
        // Legacy variants - kept for backward compatibility
        green: "bg-green-500 text-white hover:bg-green-600 active:bg-green-700 active:scale-[0.98]",
        gray: "bg-gray-400 text-white hover:bg-gray-500 active:bg-gray-600 active:scale-[0.98]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        purchase: "h-8 rounded-none px-3 py-0", // Making it exactly 32px height with no rounding and no padding
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
        aria-disabled={props.disabled}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
