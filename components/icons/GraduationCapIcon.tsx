
import React from 'react';

const GraduationCapIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c0 1.7.7 3.2 1.9 4.1" />
    <path d="M16.1 21.1A6.8 6.8 0 0 0 22 17v-5" />
    <path d="M4 12v5a2 2 0 0 0 2 2h8" />
  </svg>
);

export default GraduationCapIcon;
