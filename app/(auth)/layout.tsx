import Link from "next/link";
import MoosLogo from "@/components/marketing/MoosLogo";
import AuthNavHint from "@/components/auth/AuthNavHint";
import AuthRightPanel from "@/components/auth/AuthRightPanel";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid grid-cols-2 max-[900px]:grid-cols-1 bg-bg text-ink font-sans antialiased">
      {/* LEFT — form panel */}
      <div className="relative flex flex-col bg-bg overflow-y-auto min-h-screen max-[900px]:min-h-svh">
        {/* Subtle grid texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-70"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(15,17,8,0.025) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,17,8,0.025) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            maskImage: "radial-gradient(ellipse at 50% 0%, black 0%, transparent 70%)",
            WebkitMaskImage: "radial-gradient(ellipse at 50% 0%, black 0%, transparent 70%)",
          }}
        />

        {/* Top nav */}
        <div className="relative z-10 flex items-center justify-between px-14 py-9 max-[600px]:px-5 max-[600px]:py-6">
          <Link href="/" className="flex items-center gap-2.25">
            <MoosLogo size={26} />
            <span className="font-bold text-[18px] tracking-[-0.02em] text-ink">usemoos</span>
          </Link>
          <AuthNavHint />
        </div>

        {/* Centered form */}
        <div className="relative z-10 flex-1 flex items-center justify-center px-14 pb-12 max-[600px]:px-5 max-[600px]:pb-8">
          <div className="w-full max-w-100">{children}</div>
        </div>
      </div>

      {/* RIGHT — brand panel (hidden ≤ 900px) */}
      <AuthRightPanel />
    </div>
  );
}
