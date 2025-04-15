import * as React from "react";

import { cn } from "~/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "border-input file:text-foreground placeholder:text-primary-burgundy-80 dark:placeholder:text-primary-beige-80 selection:bg-primary-beige-10 selection:text-primary-beige-10 flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-sm md:text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus:bg-primary-beige dark:focus:bg-primary-accent",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-primary-destructive/20 dark:aria-invalid:ring-primary-destructive/20 aria-invalid:border-primary-destructive",
        "autofill:bg-transparent autofill:text-inherit",
        "[-webkit-autofill]:!bg-transparent [-webkit-autofill]:!text-inherit [-webkit-autofill]:shadow-[0_0_0_30px_transparent_inset]",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
