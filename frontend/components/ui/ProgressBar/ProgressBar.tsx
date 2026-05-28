import styles from "./ProgressBar.module.css";

interface ProgressBarProps {
  value: number;       /* 0 à max */
  max?: number;
  label?: string;
  showValue?: boolean;
  color?: "primary" | "secondary" | "tertiary";
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}

const colorMap = {
  primary:   styles.colorPrimary,
  secondary: styles.colorSecondary,
  tertiary:  styles.colorTertiary,
};

const sizeMap = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
};

export function ProgressBar({
  value,
  max = 100,
  label,
  showValue = true,
  color = "primary",
  size = "md",
  animated = true,
}: ProgressBarProps) {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={styles.wrap}>
      {(label || showValue) && (
        <div className={styles.header}>
          {label && <span className={styles.label}>{label}</span>}
          {showValue && (
            <span className={styles.value}>
              {value} / {max}
            </span>
          )}
        </div>
      )}

      <div
        className={[styles.track, sizeMap[size]].join(" ")}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemax={max}
        aria-label={label}
      >
        <div
          className={[
            styles.fill,
            colorMap[color],
            animated ? styles.animated : "",
          ].join(" ")}
          style={{ width: `${pct}%` }}
        >
          {/* Reflet lumineux */}
          <span className={styles.sheen} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}