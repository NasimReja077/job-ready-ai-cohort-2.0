import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { FiCheck } from "react-icons/fi";
import { cn } from "@/lib/utils";

export const Checkbox = ({ className, ...props }) => (
  <CheckboxPrimitive.Root
    className={cn(
      "peer grid size-5 shrink-0 place-items-center rounded-full border-2 border-white/30 outline-none transition focus-visible:ring-2 focus-visible:ring-ring/60 data-[state=checked]:border-transparent data-[state=checked]:bg-gradient-to-br data-[state=checked]:from-violet-500 data-[state=checked]:to-cyan-500",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator>
      <FiCheck className="size-3 text-white" strokeWidth={3.5} />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
);
