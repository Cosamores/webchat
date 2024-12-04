// components/RoomList.tsx
'use client';

import React, { useState, useEffect, useContext } from 'react';
import Button from '@/components/Button';
import { ThemeContext } from '@/context/themeContext';
import {
  HiOutlineChatBubbleBottomCenter,
  HiOutlineShare,
  HiOutlinePencilSquare,
  HiOutlineTrash,
} from 'react-icons/hi2';
interface Room {
  id: string;
  name: string;
}

interface RoomListProps {
  selectedRoomId: string | null;
  onSelectRoom: (roomId: string | null) => void;
}

const RoomList: React.FC<RoomListProps> = ({ selectedRoomId, onSelectRoom }) => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomName, setRoomName] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState<string>('');

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
          setError('Falha ao buscar salas.');
        }
      } catch {
        setError('Falha ao buscar salas.');
      }
    };
    fetchRooms();

    setUser(localStorage.getItem('username') || '');
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
        const newRoomData = await response.json();
        const newRoom = newRoomData.room;
        setRooms((prev) => [...prev, newRoom]);
      } else {
        setError('Erro ao criar sala.');
      }
    } catch {
      setError('Falha ao criar sala.');
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
        onSelectRoom(roomId);
      } else {
        setError('Erro ao entrar na sala.');
      }
    } catch {
      setError('Erro ao entrar na sala.');
    }
  };

  const handleShareRoom = (roomId: string) => {
    const roomLink = `${window.location.origin}/rooms?roomId=${roomId}`;
    navigator.clipboard.writeText(roomLink);
    alert('Link da sala copiado para a área de transferência!');
  };

  const handleEditRoom = async (roomId: string) => {
    const newName = prompt('Insira o nome da nova sala');
    if (!newName || newName.trim() === '') return <div>O nome da sala não pode estar vazio.</div>;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:3000/rooms/edit', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomId, newName }),
      });
      if (response.ok) {
        const updatedRoomData = await response.json();
        const updatedRoom = updatedRoomData.room;
        setRooms((prev) =>
          prev.map((room) => (room.id === roomId ? { ...room, name: updatedRoom.name } : room))
        );
      } else {
        setError('Erro ao editar nome da sala.');
      }
    } catch {
      setError('Erro ao editar nome da sala.');
    }
  };

  const getRoomName = async (roomId: string): Promise<string> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:3000/rooms/name/${roomId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (response.ok) {
      const data = await response.json();
      return data.name;
    } else {
      throw new Error('Failed to fetch room name');
    }
  };


  const handleDeleteRoom = async (roomId: string) => {
    getRoomName(roomId).then((name) => {
      setRoomName(name);
      console.log(name);
      if (!confirm(`Tem certeza que deseja deletar a sala ${name}`)) return;
      
      const token = localStorage.getItem('token');
      fetch(`http://localhost:3000/rooms/delete`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomId }),
      }).then(response => {
        if (response.ok) {
          setRooms((prev) => prev.filter((room) => room.id !== roomId));
          if (selectedRoomId === roomId) {
            onSelectRoom(null);
          }
        } else {
          setError('Failed to delete room.');
        }
      }).catch(() => {
        setError('Failed to delete room.');
      });
    });

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:3000/rooms/delete`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomId }),
      });
      if (response.ok) {
        setRooms((prev) => prev.filter((room) => room.id !== roomId));
        if (selectedRoomId === roomId) {
          onSelectRoom(null);
        }
      } else {
        setError('Failed to delete room.');
      }
    } catch {
      setError('Failed to delete room.');
    }
  };

  const isRoomSelected = (roomId: string) => selectedRoomId === roomId;

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">Rooms</h2>
        <p>Hello, {user}</p>
        <Button
          onClick={toggleTheme}
          label={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          className="mt-2"
        />
      </div>
      {error && <p className="text-red-500">{error}</p>}
      <div className="mb-4">
        <input
          type="text"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          placeholder="Enter new room name"
          className="w-full px-4 py-2 border rounded mb-2"
        />
        <Button onClick={handleCreateRoom} label="Create Room" className="w-full" />
      </div>
      <div className="flex-grow overflow-y-auto">
        {rooms.length > 0 ? (
          <ul>
          {rooms.map((room) => (
            <li
              key={room.id}
              className={`flex flex-col items-center justify-between p-2 rounded cursor-pointer mb-2 ${
                isRoomSelected(room.id)
                  ? 'bg-gray-200'
                  : 'bg-white dark:bg-neutral-800'
              }`}
              onClick={() => onSelectRoom(room.id)}
            >
              <span className='w-full rounded p-2 font-bold bg-orange-300'>{room.name}</span>
              <div className="flex space-x-1">
                <Button
                  onClick={() => handleJoinRoom(room.id)}
                  icon={<HiOutlineChatBubbleBottomCenter />}
                />
                <Button
                  onClick={() => handleShareRoom(room.id)}
                  icon={<HiOutlineShare />}
                />
                <Button
                  onClick={() => handleEditRoom(room.id)}
                  icon={<HiOutlinePencilSquare />}
                />
                <Button
                  onClick={() => handleDeleteRoom(room.id)}
                  icon={<HiOutlineTrash />}
                />
              </div>
            </li>
          ))}
        </ul>
        ) : (
          <p>No rooms available.</p>
        )}
      </div>
    </div>
  );
};

export default RoomList;