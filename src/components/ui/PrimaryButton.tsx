import type { ButtonHTMLAttributes } from "react";

export const primaryButtonClassName =
  "rounded-2xl bg-orange-500 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-glow transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60";

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  fullWidth?: boolean;
};

export function PrimaryButton({ className = "", fullWidth, ...props }: PrimaryButtonProps) {
  return (
    <button
      className={`${primaryButtonClassName} ${fullWidth ? "w-full" : ""} ${className}`.trim()}
      {...props}
    />
  );
}
