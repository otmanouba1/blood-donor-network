import * as React from "react"

import { cn } from "@/components/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 shadow-sm transition-all duration-200 outline-none",
        "focus:border-red-300 focus:ring-2 focus:ring-red-100",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-slate-900",
        className
      )}
      {...props}
    />
  )
}

export { Input }
