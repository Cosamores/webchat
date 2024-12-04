// app/(main)/chat/page.tsx *old chat page*
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import RequireAuth from '@/components/requiireAuth';
import Button from '@/components/Button';

export default function Chat() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = searchParams.get('roomId');
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  
  const ws = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  
  useEffect(() => {
    if (!roomId) {
      router.replace('/rooms');
      return;
    }
  
    const token = localStorage.getItem('token');
    console.log('Connecting to WebSocket');
    console.log('Token:', token);
    console.log('Room ID:', roomId)
    ws.current = new WebSocket(`ws://localhost:3000/?token=${token}&roomId=${roomId}`);
  
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prev) => [...prev, data]);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    ws.current.onopen = () => {
      console.log('Connected to WebSocket');
    };

    ws.current.onerror = (event) => {
      console.error('WebSocket error:', event);
      setError('WebSocket connection error');
    };
    
    ws.current.onclose = (event) => {
      console.warn('WebSocket closed:', event);
      setError('WebSocket connection closed');
    };

    const fetchMessages = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`http://localhost:3000/messages/room/${roomId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          console.log("Mensagens da sala: ", data)
          setMessages(data);
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
  }, [roomId, router]);

  const handleSendMessage = () => {
    if (ws.current && input.trim()) {
      ws.current.send(JSON.stringify({ type: 'text', content: input }));
      setInput('');
    }
  };

  return (
    <RequireAuth>
      <div className="flex flex-col min-h-screen bg-base text-neutral dark:bg-dark dark:text-base">
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
    </RequireAuth>
  );
}