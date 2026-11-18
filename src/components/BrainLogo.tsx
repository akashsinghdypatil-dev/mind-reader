interface BrainLogoProps {
  className?: string;
}

export function BrainLogo({ className = 'w-8 h-8' }: BrainLogoProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="brainGrad" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="55%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
      </defs>
      <rect
        x="2"
        y="2"
        width="36"
        height="36"
        rx="10"
        className="fill-slate-900/90 dark:fill-[#091226]"
        stroke="url(#brainGrad)"
        strokeWidth="1.5"
      />
      {/* Left & Right Brain Hemispheres */}
      <path
        d="M19.5 11.5C16.2 11.5 13.8 13.4 13.5 16C11.7 16.5 10.5 18.2 10.5 20.1C10.5 22 11.7 23.6 13.4 24.2C13.8 26.8 16.2 28.5 19.5 28.5V11.5Z"
        stroke="url(#brainGrad)"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M20.5 11.5C23.8 11.5 26.2 13.4 26.5 16C28.3 16.5 29.5 18.2 29.5 20.1C29.5 22 28.3 23.6 26.6 24.2C26.2 26.8 23.8 28.5 20.5 28.5V11.5Z"
        stroke="url(#brainGrad)"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      {/* Neural Connection Nodes */}
      <circle cx="15.5" cy="17.5" r="1.4" fill="#38BDF8" />
      <circle cx="15.5" cy="23" r="1.4" fill="#06B6D4" />
      <circle cx="24.5" cy="17.5" r="1.4" fill="#38BDF8" />
      <circle cx="24.5" cy="23" r="1.4" fill="#06B6D4" />
      <path
        d="M15.5 17.5L20 20L24.5 17.5M15.5 23L20 20L24.5 23"
        stroke="#38BDF8"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
