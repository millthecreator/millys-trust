'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function SignInPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Super Admin Login
      if (
        email.toLowerCase().trim() === 'admin@millystrust.com' &&
        password === 'MillyTrust2026!Secure'
      ) {
        localStorage.setItem(
          'millys_current_user',
          JSON.stringify({
            id: 'super-admin-001',
            name: "Milly's Trust Admin",
            email: 'admin@millystrust.com',
          })
        );
        router.push('/dashboard');
        return;
      }

      // Normal User Login from Supabase
      const { data: user, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .single();

      if (fetchError || !user) {
        setError('Invalid email or password');
        setIsLoading(false);
        return;
      }

      if (user.password !== password) {
        setError('Invalid email or password');
        setIsLoading(false);
        return;
      }

      // Login successful
      localStorage.setItem(
        'millys_current_user',
        JSON.stringify({
          id: user.id,
          name: user.name,
          email: user.email,
        })
      );

      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again later.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation */}
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 text-slate-900">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center">
              <Shield className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-semibold text-2xl tracking-tight">Milly&apos;s Trust</span>
          </Link>

          <Link href="/signup" className="text-sm font-medium text-teal-700 hover:text-teal-800 flex items-center gap-1.5">
            New here? <span className="font-semibold">Create account →</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-teal-600 mb-5 shadow-inner">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-semibold tracking-tighter text-slate-950">Welcome back</h1>
            <p className="text-slate-600 mt-3">Sign in to access your secure digital trust</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl shadow-slate-200/60">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label className="block text-xs font-semibold tracking-widest text-slate-500 mb-1.5">
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  placeholder="you@familyoffice.com"
                  className="w-full border border-slate-300 rounded-2xl px-5 py-3.5 text-base placeholder:text-slate-400"
                  required
                />
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold tracking-widest text-slate-500">PASSWORD</label>
                  <button type="button" className="text-xs text-teal-600 hover:underline">Forgot password?</button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    placeholder="Enter your password"
                    className="w-full border border-slate-300 rounded-2xl px-5 py-3.5 text-base placeholder:text-slate-400 pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-2xl">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-slate-900 hover:bg-black disabled:bg-slate-700 transition-all text-white font-semibold py-4 rounded-2xl text-base flex items-center justify-center gap-2 shadow-lg active:scale-[0.985]"
              >
                {isLoading ? 'Signing you in securely...' : 'Sign In to Dashboard'}
              </button>
            </form>
          </div>

          <div className="text-center mt-8">
            <Link href="/" className="inline-flex items-center text-xs text-slate-500 hover:text-slate-700 gap-1">
              <ArrowLeft className="w-3 h-3" /> Back to homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}