// src/components/ui/label.tsx
// Reusable Label Component

import { cn } from "@/lib/utils";
import { LabelHTMLAttributes } from "react";

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function Label({ className, required, children, ...props }: LabelProps) {
  return (
    <label
      className={cn("mb-2 block text-sm font-semibold tracking-tight text-slate-800", className)}
      {...props}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}
