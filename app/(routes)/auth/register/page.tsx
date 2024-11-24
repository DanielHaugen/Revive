'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import PasswordStrengthIndicator from '@/ui/auth/PasswordStrengthIndicator';
import PasswordRequirements from '@/ui/auth/PasswordRequirements';
import Link from 'next/link';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRequirements, setShowRequirements] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Registration failed or user already exists');
      }

      router.push('/auth/login');
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const minCharacters = 8;
  // Password requirements validation logic
  const requirements = [
    { test: (pw: string) => pw.length >= minCharacters },
    { test: (pw: string) => /[A-Z]/.test(pw) },
    { test: (pw: string) => /[a-z]/.test(pw) },
    { test: (pw: string) => /\d/.test(pw) },
    { test: (pw: string) => /[!@#$%^&*]/.test(pw) },
  ];

  const isPasswordValid = useMemo(
    () => requirements.every((req) => req.test(password)),
    [password]
  );

  // Email validation logic using a regular expression
  const isEmailValid = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    [email]
  );

  // Form overall validity check
  const isFormValid =
    email.trim() !== '' &&
    isEmailValid &&
    isPasswordValid &&
    password === confirmPassword;

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Register</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email input */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setEmailTouched(true)} // Set touched on blur
          className={`border p-2 w-full ${
            emailTouched && !isEmailValid && email ? 'border-red-500' : ''
          }`}
        />
        {/* Show message only if the email is invalid and the user has blurred the field */}
        {emailTouched && !isEmailValid && email && (
          <p className="text-red-500 text-sm">
            Please enter a valid email address
          </p>
        )}

        <div className="relative mb-4">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setShowRequirements(true)}
            onBlur={() => setShowRequirements(false)}
            className="border p-2 w-full pr-10" // Space for the button
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)} // Toggle visibility
            className="absolute inset-y-0 right-2 flex items-center text-gray-600"
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        <PasswordStrengthIndicator
          password={password}
          minCharacters={minCharacters}
        />
        {/* Show password requirements when focused */}
        {showRequirements && (
          <PasswordRequirements
            password={password}
            minCharacters={minCharacters}
          />
        )}

        {/* Confirm password input */}
        <input
          type={showPassword ? 'text' : 'password'}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={`border p-2 w-full mb-4 ${
            password !== confirmPassword && confirmPassword
              ? 'border-red-500'
              : ''
          }`}
        />
        {password !== confirmPassword && confirmPassword && (
          <p className="text-red-500 text-sm">Passwords do not match</p>
        )}
        <button
          type="submit"
          className={`w-full py-2 mt-4 text-white rounded ${
            isFormValid
              ? 'bg-green-500 hover:bg-green-600 duration-200'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
          disabled={!isFormValid}
        >
          Register
        </button>
      </form>

      <div className="text-center m-2">
        Already have an account?
        <Link
          href="/auth/login"
          className="ml-1 text-blue-600 font-medium hover:underline"
        >
          Login
        </Link>
      </div>
    </div>
  );
}
