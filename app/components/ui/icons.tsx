export function CloseIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M15 5L5 15M5 5L15 15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TagIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="24"
      height="28"
      viewBox="0 0 24 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M22.5 14V6C22.5 3.5 21 2 18.5 2H5.5C3 2 1.5 3.5 1.5 6V14C1.5 15.5 2.1 16.6 3 17.3C3.8 17.9 5 18 5.5 18H6.5V22C6.5 24 7.8 25.5 9.5 26H10.5C11.3 26 12 25.7 12.5 25.2L18.5 19.2C19.5 18.2 22.5 16.2 22.5 14Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.5 11H6.51"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PlusIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M10 4V16M4 10H16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function EditIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M13.5 2.5C13.8 2.2 14.2 2 14.6 2H15C16.1 2 17 2.9 17 4C17 4.3 16.9 4.6 16.7 4.9L16.5 5.2L11.8 9.8L11.6 10C10.9 10.6 10.1 10.9 9.3 10.9H8.3L8.5 9.2C8.6 8.4 8.9 7.6 9.5 6.9L9.7 6.7L13.5 2.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.6 6.5L11.5 2.4M9 11L2 18V22H6L13 15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TrashIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M3.5 6H16.5M8.5 3V6H11.5V3M6 6V17C6 18.1 6.9 19 8 19H12C13.1 19 14 18.1 14 17V6M9 9V15M11 9V15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
