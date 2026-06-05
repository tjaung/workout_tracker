import { cn } from '@lib/cn'

interface DeadliftIconProps {
  className?: string
}

export function DeadliftIcon({ className }: DeadliftIconProps) {
  return (
    <svg
      className={cn('deadlift-loader h-auto overflow-visible', className)}
      viewBox="0 0 120 100"
      fill="none"
      aria-hidden="true"
    >
      <line
        className="deadlift-floor"
        x1="14"
        y1="88"
        x2="106"
        y2="88"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />

      <g className="deadlift-frame deadlift-frame-low">
        <g className="deadlift-pose">
          <circle cx="60" cy="32" r="8" fill="currentColor" />
          <line x1="60" y1="42" x2="60" y2="55" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
          <line x1="55" y1="55" x2="51" y2="67" stroke="currentColor" strokeWidth="9" strokeLinecap="round" />
          <line x1="51" y1="67" x2="50" y2="77" stroke="currentColor" strokeWidth="9" strokeLinecap="round" />
          <line x1="65" y1="55" x2="69" y2="67" stroke="currentColor" strokeWidth="9" strokeLinecap="round" />
          <line x1="69" y1="67" x2="70" y2="77" stroke="currentColor" strokeWidth="9" strokeLinecap="round" />
        </g>

        <g className="deadlift-bar">
          <line x1="30" y1="72" x2="90" y2="72" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
          <rect x="18" y="63" width="9" height="20" rx="2" fill="currentColor" />
          <rect x="29" y="60" width="7" height="26" rx="2" fill="currentColor" />
          <rect x="93" y="63" width="9" height="20" rx="2" fill="currentColor" />
          <rect x="84" y="60" width="7" height="26" rx="2" fill="currentColor" />
        </g>

        <g className="deadlift-arms">
          <line x1="56" y1="43" x2="46" y2="69" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
          <line x1="64" y1="43" x2="74" y2="69" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
        </g>
      </g>

      <g className="deadlift-frame deadlift-frame-high">
        <g className="deadlift-pose">
          <circle cx="60" cy="29" r="8" fill="currentColor" />
          <line x1="60" y1="39" x2="60" y2="55" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
          <line x1="55" y1="55" x2="51" y2="77" stroke="currentColor" strokeWidth="9" strokeLinecap="round" />
          <line x1="65" y1="55" x2="69" y2="77" stroke="currentColor" strokeWidth="9" strokeLinecap="round" />
        </g>

        <g className="deadlift-bar">
          <line x1="30" y1="56" x2="90" y2="56" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
          <rect x="18" y="47" width="9" height="20" rx="2" fill="currentColor" />
          <rect x="29" y="44" width="7" height="26" rx="2" fill="currentColor" />
          <rect x="93" y="47" width="9" height="20" rx="2" fill="currentColor" />
          <rect x="84" y="44" width="7" height="26" rx="2" fill="currentColor" />
        </g>

        <g className="deadlift-arms">
          <line x1="56" y1="41" x2="48" y2="56" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
          <line x1="64" y1="41" x2="72" y2="56" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  )
}
