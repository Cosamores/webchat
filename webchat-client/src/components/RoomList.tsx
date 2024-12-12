// components/RoomList.tsx
'use client';

import React, { useState, useEffect, useContext } from 'react';
import Button from '@/components/Button';
import { useRouter } from 'next/navigation';
import { ThemeContext } from '@/context/themeContext';
import {
  HiOutlineChatBubbleBottomCenter,
  HiOutlineShare,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineMoon,
  HiOutlineSun,
} from 'react-icons/hi2';
interface Room {
  id: number;
  name: string;
}

interface RoomListProps {
  selectedRoomId: number | null;
  onSelectRoom: (roomId: number | null) => void;
}

const RoomList: React.FC<RoomListProps> = ({ selectedRoomId, onSelectRoom }) => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomName, setRoomName] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState<string>('');
  const router = useRouter();
  useEffect(() => {
    const fetchRooms = async () => {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      if (!token || !userId) {
        setError('Token não encontrado. Faça o login novamente.');
        router.push('/login');
        return;
      }
      console.log('fetchRooms token:', token);
      try {
        const response = await fetch(`http://localhost:3000/rooms/`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: parseInt(userId) }),
        });
        console.log('fetchRooms response:', response);
        if (response.ok) {
          const data = await response.json();
          console.log('fetchRooms data:', data);
          setRooms(data);
        } else if (response.status === 404) {
          console.error('fetchRooms 404:', response);
          setError('Nenhuma sala encontrada.');
        }
        else {
          const errorData = await response.json();
          console.error('fetchRooms error:', errorData);
          setError('Falha ao buscar salas.');
        }
      } catch (error) {
        console.error('fetchRooms catch error:', error);
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
        setError('O nome da sala não pode estar vazio.');
      }
    } catch {
      setError('Falha ao criar sala.');
    }
  };

  const handleJoinRoom = async (roomId: number) => {
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

  const handleShareRoom = (roomId: number) => {
    const roomLink = `${window.location.origin}/rooms?roomId=${roomId}`;
    navigator.clipboard.writeText(roomLink);
    alert('Link da sala copiado para a área de transferência!');
  };

  const handleEditRoom = async (roomId: number) => {
    const newName = prompt('Insira o nome da nova sala');
    if (!newName || newName.trim() === '') {
      setError('O nome da sala não pode estar vazio.');
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:3000/rooms/edit/${roomId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newName }),
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

  const getRoomName = async (roomId: number): Promise<string> => {
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

  const handleDeleteRoom = async (roomId: number) => {
    const roomName = await getRoomName(roomId);
    console.log('roomName:', roomName);
    if (!confirm(`Tem certeza que deseja deletar a sala ${roomName}?`)) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:3000/rooms/delete`, {
        method: 'PUT', // Change to PUT method
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
        setError('Falha ao deletar sala.');
      }
    } catch {
      setError('Falha ao deletar sala.');
    }
  };

  const handleUploadImage = async (roomId: number, file: File) => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('roomId', roomId.toString());
  
    try {
      const response = await fetch('http://localhost:3000/files/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
  
      if (response.ok) {
        const data = await response.json();
        alert('Imagem enviada com sucesso!');
      } else {
        setError('Erro ao enviar imagem.');
      }
    } catch {
      setError('Erro ao enviar imagem.');
    }
  };

  const isRoomSelected = (roomId: number) => selectedRoomId === roomId;

  return (
    <div className="p-4 h-full flex flex-col bg-slate-300 dark:bg-stone-900 dark:border-stone-900 border shadow-lg">
      <div className="mb-4">
        <div className='flex flex-row-reverse flex-1 p-2 my-4 items-center'>
          <Button
            onClick={toggleTheme}
            icon={theme === 'light' ? <HiOutlineMoon /> : <HiOutlineSun />}
            className="p-2 flex-shrink text-yellow-100 dark:text-blue-800 text-bold opacity-50 dark:bg-red-200 border-yellow-300 dark:border-yellow-00 rounded-[50%] border-2 shadow-md dark:shadow-slate-600 shadow-red-800"
          />
          <h2 className="text-xl flex-grow font-bold mb-2">Bem Vindo(a) ao Webchat</h2>
        </div>
        <p>Olá, {user}</p>
        <h3 className="text-lg font-bold mt-2">Gostaria de criar uma nova sala?</h3>
        
      </div>
      {error && <p className="text-red-500">{error}</p>}
      <div className="mb-4 flex flex-col justify-center items-center">
        <input
          type="text"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          placeholder="Insira o nome da sala"
          className="w-full px-4 py-2 border rounded mb-2"
          autoComplete="off" 
          aria-label="Nome da Nova Sala" // Accessibility label
        />
        <Button onClick={handleCreateRoom} label="Criar Sala" className="w-[100%]" />
      </div>
      <div className="flex-grow overflow-y-auto">
        <h3 className="text-lg font-bold my-2">Suas salas disponíveis:</h3>
        {rooms.length > 0 ? (
          <ul>
          {rooms.map((room) => (
            <li
              key={room.id}
              className={`flex flex-col items-center justify-between p-2 rounded cursor-pointer dark:bg-slate-400 mb-2 ${
                isRoomSelected(room.id)
                  ? 'bg-green-200 dark:bg-slate-50 border-2 border-blue-300 dark:border-blue-600 radius-6'
                  : 'bg-white dark:bg-neutral-800'
              }`}
              onClick={() => onSelectRoom(room.id)}
            >
              <span className='w-full rounded p-2 font-bold bg-orange-300 dark:bg-stone-800'>{room.name}</span>
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
          <p>Nenhuma Sala disponível</p>
        )}
      </div>
    </div>
  );
};

export default RoomList;