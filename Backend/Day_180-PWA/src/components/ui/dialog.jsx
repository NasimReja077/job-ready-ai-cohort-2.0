import * as DialogPrimitive from "@radix-ui/react-dialog";
import { FiX } from "react-icons/fi";
import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export const DialogContent = ({ className, children, ...props }) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-[fade-up_.2s_ease]" />
    <DialogPrimitive.Content
      className={cn(
        "glass-strong fixed z-50 flex max-h-[92dvh] w-full flex-col overflow-hidden outline-none",
        "bottom-0 left-0 rounded-t-3xl sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl",
        "data-[state=open]:animate-[fade-up_.25s_ease]",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground transition hover:bg-white/10 hover:text-foreground" aria-label="Close">
        <FiX className="size-4" />
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
);

export const DialogHeader = ({ className, ...props }) => <div className={cn("px-6 pt-6 pb-2", className)} {...props} />;
export const DialogTitle = ({ className, ...props }) => (
  <DialogPrimitive.Title className={cn("font-display text-xl font-bold", className)} {...props} />
);
export const DialogDescription = ({ className, ...props }) => (
  <DialogPrimitive.Description className={cn("text-sm text-muted-foreground", className)} {...props} />
);
