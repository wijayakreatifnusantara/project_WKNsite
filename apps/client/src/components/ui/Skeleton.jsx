import * as React from "react"
import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}) {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-slate-200/40 shadow-neu-inset", className)}
      {...props}
    />
  )
}

export { Skeleton }
