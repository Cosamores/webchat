// components/ChatComponent.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Button from '@/components/Button';

interface Message {
  sender: { username: string };
  content: string;
  type: 'text' | 'image';
  fileUrl?: string;
  created_at: string;
}

interface ChatComponentProps {
  roomId: string;
}

const ChatComponent: React.FC<ChatComponentProps> = ({ roomId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!roomId) {
      setError('Room_ID é requerido para esta página.');
      return;
    }

    const fetchMessages = async () => {
      try {
        const response = await fetch(`http://localhost:3000/messages/room/${roomId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setMessages(data);
          scrollToBottom();
        } else {
          console.error('Failed to fetch messages', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();

    // Implement polling to fetch messages every 5 seconds
    const interval = setInterval(fetchMessages, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [roomId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (input.trim() || selectedFile) {
      if (selectedFile) {
        await handleUploadImage(selectedFile);
      } else {
        const message = { type: 'text', content: input };
        try {
          const token = localStorage.getItem('token');
          const response = await fetch('http://localhost:3000/messages/create', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ...message, roomId }),
          });

          if (response.ok) {
            const newMessage = await response.json();
            setMessages((prev) => [...prev, newMessage.data]);
            scrollToBottom();
            setInput('');
          } else {
            setError('Erro ao enviar mensagem.');
          }
        } catch {
          setError('Erro ao enviar mensagem.');
        }
      }
    }
  };

  const handleUploadImage = async (file: File) => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('roomId', roomId);
    formData.append('type', 'image');

    try {
      const response = await fetch('http://localhost:3000/messages/create', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        // Image message will be received via polling
        setImagePreview(null);
        setSelectedFile(null);
      } else {
        setError('Erro ao enviar imagem.');
      }
    } catch {
      setError('Erro ao enviar imagem.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const closeModal = () => {
    setImagePreview(null);
    setSelectedFile(null);
  };

  return (
    <div className="flex flex-col h-full">
      {error && <p className="text-red-500">{error}</p>}
      <div className="flex-grow overflow-y-auto p-4">
        {messages.map((message, index) => (
          <div key={index} className="mb-2 flex items-start">
            <span className="font-semibold m-2 p-2 text-blue-600">{message.sender.username}:</span>
            {message.type === 'image' ? (
              <div className='flex flex-col '>                
              <span className='text-[10px] text-gray-500'>{new Date(message.created_at).toLocaleString()}</span>
                <img
                  alt="Image"
                  className="max-w-xs max-h-xs rounded-lg border"
                  src={`http://localhost:3000${message.fileUrl}`} // Ensure this path matches static serving
                />
              </div>
            ) : (
              <div className='flex flex-col justify-start items-start p-2'>
                <span className='text-[10px] text-gray-500'>{new Date(message.created_at).toLocaleString()}</span>
                <span className="text-gray-800 text-xl dark:text-gray-200">{message.content}</span>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 bg-blue-200 dark:bg-blue-900 flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => {
        if (e.key === 'Enter') {
          handleSendMessage();
        }
          }}
          placeholder="Digite sua mensagem..."
          className="dark:bg-slate-900 dark:text-white flex-grow px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary mr-2"
        />
        <input
          type="file"
          title="Escolha uma imagem"
          onChange={handleFileChange}
          className="mr-2 p-2 border rounded flex-shrink"
        />
        <Button onClick={handleSendMessage} label="Enviar" />
      </div>
      {imagePreview && (
        <div className="fixed bottom-20 right-4 bg-white p-4 rounded shadow-lg z-50">
          <img src={imagePreview} alt="Preview" className="mb-4 max-w-xs max-h-xs" />
          <button onClick={closeModal} className="text-red-500">Fechar</button>
        </div>
      )}
    </div>
  );
};

export default ChatComponent;