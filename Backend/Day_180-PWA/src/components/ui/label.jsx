import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "@/lib/utils";

export const Label = ({ className, ...props }) => (
  <LabelPrimitive.Root className={cn("text-xs font-medium uppercase tracking-wider text-muted-foreground", className)} {...props} />
);
