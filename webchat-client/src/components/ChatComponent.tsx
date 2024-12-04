// components/ChatComponent.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Button from '@/components/Button';

interface Message {
  sender: { username: string };
  content: string;
}

interface ChatComponentProps {
  roomId: string;
}

const ChatComponent: React.FC<ChatComponentProps> = ({ roomId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const ws = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!roomId) {
      setError('Room ID is required');
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
          console.error('Failed to fetch messages');
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();

    return () => {
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
    };
  }, [roomId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (ws.current && input.trim()) {
      ws.current.send(JSON.stringify({ type: 'text', content: input }));
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {error && <p className="text-red-500">{error}</p>}
      <div className="flex-grow overflow-y-auto p-4">
        {messages.map((message, index) => (
          <div key={index} className="mb-2">
            <span className="font-semibold mr-2">{message.sender.username}:</span>
            <span>{message.content}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 bg-white dark:bg-neutral-800 flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSendMessage();
            }
          }}
          placeholder="Type your message..."
          className="flex-grow px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary mr-2"
        />
        <Button onClick={handleSendMessage} label="Send" />
      </div>
    </div>
  );
};

export default ChatComponent;