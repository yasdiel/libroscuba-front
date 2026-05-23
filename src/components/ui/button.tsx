import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:opacity-50 min-h-12 px-4",
  {
    variants: {
      variant: {
        default: "bg-brand text-paper shadow-sm hover:bg-brand-dark",
        secondary: "bg-paper text-gray-900 border border-gray-200 hover:bg-paper-dark",
        destructive: "bg-red-800 text-paper hover:bg-red-900",
        ghost: "hover:bg-paper-dark text-gray-700",
        outline: "border-2 border-brand text-brand hover:bg-brand-light",
      },
      size: {
        default: "h-12 px-5",
        sm: "h-10 px-3 text-xs",
        lg: "h-14 px-6 text-base",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
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
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }



