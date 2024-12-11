// app/(main)/rooms/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/router';
import RequireAuth from '@/components/requiireAuth';
import RoomList from '@/components/RoomList';
import ChatComponent from '@/components/ChatComponent';

export default function Rooms() {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const token = localStorage.getItem('token');

  if (!token) {
    return null;
  }
  return (
    <RequireAuth>
      <div className="flex h-screen">
        <div className="w-1/3 border-r">
          <RoomList selectedRoomId={selectedRoomId} onSelectRoom={setSelectedRoomId} />
        </div>
        <div className="w-2/3">
          {selectedRoomId ? (
            <ChatComponent roomId={selectedRoomId} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-xl">Select a room to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </RequireAuth>
  );
}