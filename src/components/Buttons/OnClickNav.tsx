"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

interface OnClickNavProps {
  path: string;
  children: React.ReactNode;
}

const OnClickNav = ({ path, children }: OnClickNavProps) => {
  const router = useRouter();

  return (
    <div onClick={() => router.push(path)} className="cursor-pointer">
      {children}
    </div>
  );
};

export default OnClickNav;
