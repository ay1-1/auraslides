import React from 'react';

interface LogoProps {
  className?: string;
  onClick?: () => void;
}

export default function Logo({ className = "h-8 sm:h-9 w-auto", onClick }: LogoProps) {
  return (
    <div 
      className={`flex items-center gap-3 cursor-pointer select-none ${className}`} 
      onClick={onClick}
      id="auraslides-brand-logo"
    >
      <img
        src="/images/logo-default.svg"
        alt="AuraSlides"
        className="h-full w-auto object-contain max-w-[200px]"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}
