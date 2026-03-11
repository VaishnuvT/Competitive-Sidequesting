import type { ButtonHTMLAttributes } from "react";

export const secondaryButtonClassName =
  "rounded-2xl border border-orange-200 bg-white px-4 py-2.5 text-center text-sm font-semibold text-slate-700 transition hover:border-orange-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60";

type SecondaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  fullWidth?: boolean;
};

export function SecondaryButton({ className = "", fullWidth, ...props }: SecondaryButtonProps) {
  return (
    <button
      className={`${secondaryButtonClassName} ${fullWidth ? "w-full" : ""} ${className}`.trim()}
      {...props}
    />
  );
}
