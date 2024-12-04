// components/RequireAuth.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface RequireAuthProps {
  children: React.ReactNode;
}

export default function RequireAuth({ children }: RequireAuthProps) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
    }
  }, [router]);

  return <>{children}</>;
}