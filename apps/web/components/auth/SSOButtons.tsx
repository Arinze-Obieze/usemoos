"use client";
import { FcGoogle } from "react-icons/fc";
import { Button } from "@/components/ui/button";

const MicrosoftIcon = () => (
  <svg viewBox="0 0 24 24" width={18} height={18} aria-hidden="true" className="shrink-0">
    <rect x="2" y="2" width="9.5" height="9.5" fill="#F25022" />
    <rect x="12.5" y="2" width="9.5" height="9.5" fill="#7FBA00" />
    <rect x="2" y="12.5" width="9.5" height="9.5" fill="#00A4EF" />
    <rect x="12.5" y="12.5" width="9.5" height="9.5" fill="#FFB900" />
  </svg>
);

const providers = [
  { provider: "oauth_google" as const, icon: <FcGoogle size={18} />, label: "Google" },
  { provider: "oauth_microsoft" as const, icon: <MicrosoftIcon />, label: "Microsoft" },
] as const;

interface SSOButtonsProps {
  onSelect: (provider: "oauth_google" | "oauth_microsoft") => void;
  disabled?: boolean;
}

export function SSOButtons({ onSelect, disabled }: SSOButtonsProps) {
  return (
    <div className="grid grid-cols-2 gap-2 mb-6">
      {providers.map(({ provider, icon, label }) => (
        <Button
          key={provider}
          type="button"
          variant="outline"
          disabled={disabled}
          onClick={() => onSelect(provider)}
        >
          {icon}
          {label}
        </Button>
      ))}
    </div>
  );
}
