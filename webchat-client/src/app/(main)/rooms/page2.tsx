// app/(main)/rooms/page.tsx
'use client';

import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeContext } from '@/context/themeContext';
import RequireAuth from '@/components/requiireAuth';
import Button from '@/components/Button';

export default function Rooms() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const router = useRouter();
  const [rooms, setRooms] = useState<any[]>([]);
  const [roomName, setRoomName] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>();

  useEffect(() => {
    const fetchRooms = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('http://localhost:3000/rooms', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setRooms(data);
        } else {
          setError('Failed to fetch rooms');
        }
      } catch {
        setError('Failed to fetch rooms');
      }
    };
    fetchRooms();

    setUser(localStorage.getItem('username'));
  }, []);

  const handleCreateRoom = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:3000/rooms/create', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: roomName }),
      });
      if (response.ok) {
        setRoomName('');
        const newRoom = await response.json();
        setRooms((prev) => [...prev, newRoom.room]);
      } else {
        setError('Failed to create room');
      }
    } catch {
      setError('Failed to create room');
    }
  };

  const handleJoinRoom = async (roomId: string) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:3000/rooms/join', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomId }),
      });
      if (response.ok) {
        router.push(`/chat?roomId=${roomId}`);
      } else {
        setError('Failed to join room');
      }
    } catch {
      setError('Failed to join room');
    }
  };

  const handleCopyLink = (roomId: string) => {
    const roomLink = `${window.location.origin}/chat?roomId=${roomId}`;
    navigator.clipboard.writeText(roomLink);
    alert('Room link copied to clipboard');
  };

  return (
    <RequireAuth>
      <div className="min-h-screen bg-base text-neutral dark:bg-dark dark:text-base">
        <div className="container mx-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Rooms</h1>
            <h2>Olá {user}</h2>
            <Button onClick={toggleTheme} label={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`} />
          </div>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <div className="mb-6">
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Enter room name"
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary mb-2"
            />
            <Button onClick={handleCreateRoom} label="Create Room" className="w-full" />
          </div>
          <div>
            {rooms.length > 0 ? (
              <ul>
                {rooms.map((room) => (
                  <li
                    key={room.id}
                    className="flex items-center justify-between bg-white dark:bg-neutral-800 p-4 rounded mb-2 shadow"
                  >
                    <span>{room.name}</span>
                    <div className="flex space-x-2">
                      <Button onClick={() => handleJoinRoom(room.id)} label="Join" />
                      <Button onClick={() => handleCopyLink(room.id)} label="Copy Link" />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No rooms available.</p>
            )}
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}