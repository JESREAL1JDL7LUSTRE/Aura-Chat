"use client";

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  return (
    <div>
      <h1 className="text-2xl font-bold text-center mt-10">Landing Page</h1>
      <div className="max-w-md mx-auto mt-8 p-6 bg-white shadow-md rounded-lg">
        <p className="text-center">Welcome to Aura Chat!</p>
        <p className="text-center mt-4">This is a simple chat application built with Next.js and React.</p>
        <span className="block text-center mt-4">
          <Button variant={'ghost'} className='hover:bg-gray-300' onClick={() => router.push('/people-you-may-know')}>Find Friends</Button>
        </span>
      </div>
    </div>
  );
}
