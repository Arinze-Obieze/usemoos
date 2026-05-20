interface MoosLogoProps {
  size?: number;
  variant?: "dark" | "light";
}

export default function MoosLogo({
  size = 26,
  variant = "dark",
}: MoosLogoProps) {
  const stroke = variant === "light" ? "#FBFAF6" : "#0F1108";
  return (
    <svg viewBox="0 0 60 60" width={size} height={size} aria-hidden="true">
      <path
        d="M30 9 C18 9 9 14 9 30 C9 46 18 51 30 51"
        fill="none"
        stroke={stroke}
        strokeWidth="4.4"
        strokeLinecap="round"
      />
      <path
        d="M30 9 C42 9 51 14 51 30 C51 46 42 51 30 51"
        fill="none"
        stroke={stroke}
        strokeWidth="4.4"
        strokeLinecap="round"
      />
      <path
        d="M30 17 L33 28 L42 30 L33 32 L30 43 L27 32 L18 30 L27 28 Z"
        fill="#C8FF7B"
        stroke={stroke}
        strokeWidth="1.2"
      />
    </svg>
  );
}
