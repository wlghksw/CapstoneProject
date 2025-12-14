import React from "react";

const BookFilledIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 512 512"
    fill="currentColor"
  >
    <path d="M64 96c0-17.7 14.3-32 32-32h128c17.7 0 32 14.3 32 32v320c0 5.9-3.2 11.3-8.3 14.1-5.1 2.8-11.4 2.7-16.4-.3C211.4 416.3 176.8 408 144 408H96c-17.7 0-32-14.3-32-32V96z"/>
    <path d="M448 96v280c0 17.7-14.3 32-32 32h-48c-32.8 0-67.4 8.3-87.3 21.8-5 3-11.3 3.1-16.4.3-5.1-2.8-8.3-8.2-8.3-14.1V96c0-17.7 14.3-32 32-32h128c17.7 0 32 14.3 32 32z"/>
  </svg>
);

export default BookFilledIcon;
