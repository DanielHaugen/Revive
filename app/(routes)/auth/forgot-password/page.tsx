'use client'; // For client-side functionality

import { useState } from 'react';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [emailValid, setEmailValid] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  // Function to validate email format
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateEmail(email)) {
      // Simulate an API request to send reset link
      console.log('Requesting password reset for:', email);
      setSubmitted(true);
    } else {
      setEmailValid(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto p-6 bg-white shadow-md rounded mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center">Forgot Password</h2>

      {!submitted ? (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 mb-2">
              Enter your email address:
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailValid(true); // Reset validation error on input change
              }}
              onBlur={() => setEmailValid(validateEmail(email))}
              className={`border p-2 w-full ${
                !emailValid ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="you@example.com"
              required
            />
            {!emailValid && email && (
              <p className="text-red-500 text-sm mt-1">
                Please enter a valid email address.
              </p>
            )}
          </div>

          <button
            type="submit"
            className={`w-full py-2 mt-4 text-white rounded ${
              email && validateEmail(email)
                ? 'bg-blue-500 hover:bg-blue-600'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
            disabled={!email || !validateEmail(email)}
          >
            Send Reset Link
          </button>
        </form>
      ) : (
        <p className="text-green-500 text-center">
          If an account with that email exists, a password reset link has been
          sent.
        </p>
      )}
    </div>
  );
};

export default ForgotPasswordPage;
