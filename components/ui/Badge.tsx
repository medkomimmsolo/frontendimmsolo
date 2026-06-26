import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-sm border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-imm-red-500 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#c20000] text-white hover:bg-[#a30000]",
        secondary:
          "border-transparent bg-white text-[#0f172a] hover:bg-slate-200",
        accent:
          "border-transparent bg-[#fcd34d] text-white hover:bg-[#fcd34d]",
        destructive:
          "border-transparent bg-red-600 text-white hover:bg-red-700",
        outline: "text-[#0f172a] border-[#0f172a]/10",
        
        // Status specific badges
        draft: "border-transparent bg-white text-[#0f172a]/80",
        published: "border-transparent bg-[#c20000]/5 text-[#c20000]",
        archived: "border-transparent bg-white text-[#0f172a]/70",
        upcoming: "border-transparent bg-blue-50 text-blue-600",
        ongoing: "border-transparent bg-[#fcd34d]/10 text-[#fcd34d]",
        completed: "border-transparent bg-emerald-50 text-emerald-600",
        cancelled: "border-transparent bg-red-50 text-red-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
