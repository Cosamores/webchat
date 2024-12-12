// app/(main)/rooms/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RequireAuth from '@/components/requiireAuth';
import RoomList from '@/components/RoomList';
import ChatComponent from '@/components/ChatComponent';
import Button from '@/components/Button';

export default function Rooms() {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      router.replace('/login');
    } else {
      setToken(storedToken);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    router.replace('/login');
  };

  if (!token) {
    return null;
  }

  return (
    <RequireAuth>
      <div className="flex h-screen">
        <div className="w-1/3 border-r">
          <RoomList selectedRoomId={selectedRoomId ? parseInt(selectedRoomId) : null} onSelectRoom={roomId => setSelectedRoomId(roomId ? roomId.toString() : null)} />
        </div>
        <div className="lg:w-2/3 sm:w-auto">
          {selectedRoomId ? (
            <ChatComponent roomId={parseInt(selectedRoomId)} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-xl p-4">Selecione uma sala para começar a conversar</p>
            </div>
          )}
        </div>
        <div className="absolute top-4 right-4">
          <Button onClick={handleLogout} label="Sair" className='rounded-[50%] border-l-indigo-500 border-r-indigo-400 box-border p-3 border-l-4 border-r-2 text-yellow-500 dark:bg-blue-300 bg-blue-800 dark:bg-opacity-20 bg-opacity-[80%]'/>
        </div>
      </div>
    </RequireAuth>
  );
}