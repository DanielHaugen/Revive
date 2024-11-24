'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Reset errors on each submit attempt

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      const { token } = data;

      // Store the token securely (use httpOnly cookies for better security in production)
      document.cookie = `token=${token}; path=/; Secure; SameSite=Strict`;

      router.push('/'); // Redirect to home or dashboard
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded"
        >
          Log In
        </button>
      </form>
      <div className="w-full text-center m-2">
        <Link
          href="/auth/forgot-password"
          className="mt-1 text-blue-600 hover:underline"
        >
          Forgot password?
        </Link>
      </div>
      <div className="text-center m-2">
        Don't have an account?
        <Link
          href="/auth/register"
          className="ml-1 text-blue-600 font-medium hover:underline"
        >
          Sign Up
        </Link>
      </div>
    </div>
  );
}
