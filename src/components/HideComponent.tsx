"use client";
import { usePathname } from 'next/navigation';
import React from 'react';

interface HideComponentProps {
  path: string;
  children?: React.ReactNode;
}

const HideComponent = ({ path, children }: HideComponentProps) => {
  const pathname = usePathname();
  
  // Hide component if current path starts with the specified path
  if (pathname.startsWith(path)) {
    return null;
  }
  
  return <>{children}</>;
};

export default HideComponent;