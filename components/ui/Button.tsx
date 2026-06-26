import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-sm text-sm font-semibold ring-offset-white transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-imm-red-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-[#c20000] text-white hover:bg-[#a30000] shadow-sm hover:shadow-md hover:shadow-imm-red-600/20",
        primary: "bg-[#c20000] text-white hover:bg-[#a30000] shadow-sm hover:shadow-md hover:shadow-imm-red-600/20",
        secondary: "bg-white text-[#0f172a] hover:bg-slate-200 shadow-sm",
        accent: "bg-[#fcd34d] text-white hover:bg-[#fcd34d] shadow-sm",
        destructive: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
        outline: "border-2 border-[#0f172a]/10 bg-transparent hover:border-imm-red-600 hover:bg-[#c20000]/5 hover:text-[#c20000] text-[#0f172a]/90",
        ghost: "hover:bg-white hover:text-[#c20000] text-[#0f172a]/90",
        link: "text-[#c20000] underline-offset-4 hover:underline",
        white: "bg-white text-[#c20000] hover:bg-white shadow-md hover:shadow-lg hover:shadow-black/5",
        "outline-white": "border-2 border-white/30 bg-transparent text-white hover:bg-white/10 hover:border-white backdrop-blur-sm",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
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
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
