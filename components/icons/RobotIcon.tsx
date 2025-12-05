
import React from 'react';

const RobotIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="16" height="12" x="4" y="8" rx="2" />
    <path d="M9 4h6" />
    <path d="M12 4v4" />
    <path d="M12 18v2" />
    <path d="M17 18v2" />
    <path d="M7 18v2" />
    <path d="M8 12h8" />
    <circle cx="10" cy="14" r=".5" fill="currentColor" />
    <circle cx="14" cy="14" r=".5" fill="currentColor" />
  </svg>
);

export default RobotIcon;
