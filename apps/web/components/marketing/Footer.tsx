import Image from "next/image";

const productLinks = [
  { label: "Overview", href: "#product" },
  { label: "Integrations", href: "#integrations" },
  { label: "How it works", href: "#how" },
  { label: "Changelog", href: "/changelog" },
  { label: "Roadmap", href: "/roadmap" },
];

const companyLinks = [
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "mailto:hello@usemoos.com" },
];

const trustLinks = [
  { label: "Security", href: "#security" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "DPA", href: "/dpa" },
  { label: "Status", href: "/status" },
];

function LinkColumn({
  title,
  links,
  className,
}: {
  title: string;
  links: { label: string; href: string }[];
  className?: string;
}) {
  return (
    <div className={className}>
      <h5 className="font-mono text-[11px] tracking-[0.1em] uppercase text-dim mb-4 font-medium">
        {title}
      </h5>
      <ul className="flex flex-col gap-2.5 max-[600px]:gap-2 max-[600px]:items-center">
        {links.map((l) => (
          <li key={l.label}>
            <a
              href={l.href}
              className="text-[14px] text-ink-2 transition-colors duration-150 hover:text-ink max-[600px]:text-[13.5px]"
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="wrap pt-16 pb-8 max-[600px]:pt-12 max-[600px]:pb-6">
        <div className="grid grid-cols-[1.6fr_1fr_1fr_1fr] gap-10 mb-12 max-[900px]:grid-cols-2 max-[900px]:gap-8 max-[600px]:grid-cols-2 max-[600px]:gap-[30px_22px] max-[600px]:mb-8 max-[440px]:gap-[26px_18px] [&>*]:min-w-0">
          <div className="max-[600px]:col-span-full">
            <div className="flex items-center gap-2.5 max-[600px]:justify-center">
              <Image
                src="/assets/usemoos-icon.svg"
                width={36}
                height={36}
                alt=""
                aria-hidden="true"
                style={{ filter: "brightness(0) invert(1)" }}
              />
              <span className="font-bold text-[20px] tracking-[-0.02em]">
                usemoos
              </span>
            </div>
            <p className="text-[14px] text-muted max-w-[30ch] mt-4 leading-[1.5] max-[600px]:text-[13.5px] max-[600px]:max-w-[34ch] max-[600px]:mx-auto max-[600px]:mt-3">
              The centralized intelligence layer for organizational knowledge.
              Built for teams that have outgrown the wiki.
            </p>
          </div>

          <LinkColumn title="Product" links={productLinks} />
          <LinkColumn title="Company" links={companyLinks} />
          <LinkColumn
            title="Trust"
            links={trustLinks}
            className="max-[440px]:col-span-full max-[440px]:[&_ul]:grid max-[440px]:[&_ul]:grid-cols-2 max-[440px]:[&_ul]:gap-x-[18px] max-[440px]:[&_ul]:gap-y-2 max-[440px]:[&_ul]:items-center max-[440px]:[&_ul]:justify-items-center"
          />
        </div>

        <div
          className="text-[clamp(140px,22vw,320px)] tracking-[-0.06em] font-bold leading-[0.85] my-[30px] text-center select-none whitespace-nowrap bg-clip-text text-transparent overflow-hidden max-[600px]:text-[clamp(58px,16vw,96px)] max-[600px]:tracking-[-0.05em] max-[600px]:leading-[0.9] max-[600px]:my-[2px] max-[600px]:mb-[22px] max-[440px]:text-[clamp(52px,15vw,76px)]"
          style={{
            backgroundImage:
              "linear-gradient(180deg, var(--line-2) 0%, transparent 90%)",
          }}
        >
          usemoos
        </div>

        <div className="pt-6 border-t border-line flex justify-between items-center font-mono text-[13px] text-muted max-[600px]:flex-col max-[600px]:gap-[14px] max-[600px]:items-center max-[600px]:text-center max-[600px]:text-[12px] max-[600px]:pt-5">
          <span>© 2026 usemoos, Inc.</span>
          <div className="flex gap-5 max-[600px]:w-full max-[600px]:grid max-[600px]:grid-cols-2 max-[600px]:gap-[10px_16px] max-[600px]:justify-items-center">
            <a href="https://x.com/usemoos" className="hover:text-ink">
              Twitter / X
            </a>
            <a
              href="https://www.linkedin.com/company/usemoos"
              className="hover:text-ink"
            >
              LinkedIn
            </a>
            <a
              href="mailto:hello@usemoos.com"
              className="hover:text-ink max-[600px]:col-span-full"
            >
              hello@usemoos.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
