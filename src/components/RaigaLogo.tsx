interface RaigaLogoProps {
  size?: number;
  showWordmark?: boolean;
  className?: string;
}

export default function RaigaLogo({
  size = 28,
  showWordmark = true,
  className = "",
}: RaigaLogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        {/* Left vertical pillar */}
        <rect x="6.5" y="5.5" width="4.4" height="21" rx="2.2" fill="currentColor" />
        {/* Detached geometric upper bowl */}
        <path
          d="M13.2 5.5H18.2A6.25 6.25 0 0 1 18.2 18H13.2V13.8H18.2A2.05 2.05 0 0 0 18.2 9.7H13.2V5.5Z"
          fill="currentColor"
        />
        {/* Signature teal diagonal leg */}
        <path
          d="M17.2 20.2L23 24.6"
          className="stroke-teal-600 transition-transform duration-300 group-hover:translate-x-[0.6px] group-hover:translate-y-[0.4px] dark:stroke-teal-400"
          strokeWidth="4.4"
          strokeLinecap="round"
        />
      </svg>

      {showWordmark && (
        <span className="font-display text-base font-bold uppercase tracking-[0.14em] leading-none">
          RAIGA
        </span>
      )}
    </span>
  );
}

