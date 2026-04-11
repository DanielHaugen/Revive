'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-toastify';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const logoutToastFired = useRef(false);

  useEffect(() => {
    if (searchParams.get('logout') === '1' && !logoutToastFired.current) {
      logoutToastFired.current = true;
      toast.success('You have been logged out.');
    }
  }, [searchParams]);

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
      toast.success('Successfully logged in!');
    } catch (err) {
      toast.error(`${err}`);
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
          className="form-input"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="form-input"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors duration-200"
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
