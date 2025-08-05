import * as React from "react";

export function CalendarIcon({ className = "", ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={`w-5 h-5 ${className}`}
      {...props}
    >
      <rect x="3" y="4" width="18" height="18" rx="2" fill="white"/>
      <path
        stroke="#fff"
        strokeWidth="1.5"
        d="M8 2v4M16 2v4M3 8h18M5 12h2m2 0h2m2 0h2m-8 4h2m2 0h2"
      />
      <rect x="3" y="4" width="18" height="18" rx="2" stroke="#fff" strokeWidth="1.5"/>
    </svg>
  );
}

export default CalendarIcon;
