// app/(auth)/register/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';

export default function Register() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:3000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (response.ok) {
        router.push('/login');
      } else {
        const data = await response.json();
        setError(data.error || 'Não foi possível completar o cadastro');
      }
    } catch {
      setError('Não foi possível completar o cadastro');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-base text-neutral dark:bg-dark dark:text-base">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-stone-800 p-6 rounded shadow-md w-full max-w-sm">
      <h1 className="text-3xl font-bold mb-4 p-1">Crie sua conta</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="mb-4">
          <label htmlFor="username" className="block mb-1">Nome de usuário</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full dark:bg-stone-700 dark:color-white px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block mb-1">Senha</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full dark:bg-stone-700 dark:color-white px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="m-2 flex flex-col justify-center items-center ">
        <Button type="submit" label="Criar conta" className="w-full" onClick={()=>handleSubmit} />
        <button type="button" onClick={() => router.push('http://localhost:3001/login')} className="mt-4 pt-2">Já tem conta? Clique aqui para entrar.</button>
      </div>
      </form>
    </div>
  );
}