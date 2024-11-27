// app/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      router.replace('/rooms'); // Redirect to /rooms if authenticated
    } else {
      router.replace('/login'); // Redirect to /login if not authenticated
    }
  }, [router]);

  return null; // Render nothing as we are redirecting
}