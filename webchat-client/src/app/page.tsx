// app/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      router.replace('/rooms');
    } else {
      const allowedPaths = ['/login', '/register'];
      if (!allowedPaths.includes(window.location.pathname)) {
      router.replace('/login');
      }
    }
  }, [router]);

  return null;
}