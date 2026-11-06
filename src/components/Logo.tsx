interface LogoProps {
  compact?: boolean;
  className?: string;
}

export default function Logo({
  compact = false,
  className = "",
}: LogoProps) {
  return (
    <div
      className={`brand-logo ${compact ? "brand-logo-compact" : ""} ${className}`}
      aria-label="Task Pro Service"
    >
      <svg
        className="brand-logo-symbol"
        width="43"
        height="43"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-hidden="true"
      >
        <rect
          x="5"
          y="13"
          width="38"
          height="29"
          rx="7"
          stroke="#FFD43B"
          strokeWidth="3"
        />
        <path
          d="M17 13V9.5C17 7.567 18.567 6 20.5 6H27.5C29.433 6 31 7.567 31 9.5V13"
          stroke="#FFD43B"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M5 24H17L20 28H28L31 24H43"
          stroke="#FFD43B"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path
          d="M18 34L22 38L31 29"
          stroke="#FFD43B"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {!compact && (
        <span className="brand-logo-text">
          <span className="brand-logo-title">
            TASK <strong>PRO</strong>
          </span>
          <span className="brand-logo-subtitle">SERVICE</span>
        </span>
      )}
    </div>
  );
}