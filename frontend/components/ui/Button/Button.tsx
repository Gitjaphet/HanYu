import React from "react";
import { Loader2 } from "lucide-react";
import styles from "./Button.module.css";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size    = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
}

const variantClass: Record<Variant, string> = {
  primary:   styles.primary,
  secondary: styles.secondary,
  outline:   styles.outline,
  ghost:     styles.ghost,
  danger:    styles.danger,
};

const sizeClass: Record<Size, string> = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
};

export function Button({
  variant   = "primary",
  size      = "md",
  isLoading = false,
  icon,
  iconRight,
  fullWidth = false,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        styles.btn,
        variantClass[variant],
        sizeClass[size],
        fullWidth ? styles.fullWidth : "",
        className,
      ].join(" ")}
      disabled={disabled || isLoading}
      {...props}
    >
      {/* Ripple */}
      <span className={styles.ripple} aria-hidden="true" />

      {isLoading
        ? <Loader2 size={16} className={styles.spinner} aria-hidden="true" />
        : icon && <span className={styles.iconLeft} aria-hidden="true">{icon}</span>
      }

      <span>{children}</span>

      {!isLoading && iconRight && (
        <span className={styles.iconRight} aria-hidden="true">{iconRight}</span>
      )}
    </button>
  );
}