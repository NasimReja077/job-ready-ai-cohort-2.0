import { cn } from "@/lib/utils";

export const Badge = ({ className, ...props }) => (
  <span
    className={cn("inline-flex items-center gap-1 rounded-full border border-border bg-white/5 px-2 py-0.5 text-[11px] font-medium text-muted-foreground", className)}
    {...props}
  />
);
