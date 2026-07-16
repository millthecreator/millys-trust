'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, ArrowLeft, Eye, EyeOff, Check } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function SignUpPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [verificationStep, setVerificationStep] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: formData.email.toLowerCase().trim(),
        options: {
          data: {
            full_name: formData.fullName.trim(),
          }
        }
      });

      if (error) {
        setError(error.message);
        setIsLoading(false);
        return;
      }

      setVerificationStep(true);
      setIsLoading(false);

    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const handleVerification = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email: formData.email.toLowerCase().trim(),
        token: verificationCode,
        type: 'signup'
      });

      if (error) {
        setError(error.message);
        setIsLoading(false);
        return;
      }

      // Create user in our custom users table
      await supabase.from('users').insert({
        name: formData.fullName.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
      });

      setSuccess(true);

      setTimeout(() => {
        router.push('/signin?registered=true');
      }, 1500);

    } catch (err) {
      setError('Verification failed. Please try again.');
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="mx-auto w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
            <Check className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-4xl font-semibold text-white tracking-tight mb-3">Account Created</h1>
          <p className="text-emerald-400 text-lg">You can now sign in.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 text-slate-900">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center">
              <Shield className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-semibold text-2xl tracking-tight">Milly&apos;s Trust</span>
          </Link>
          <Link href="/signin" className="text-sm font-medium text-teal-700 hover:text-teal-800 flex items-center gap-1.5">
            Already have an account? <span className="font-semibold">Sign in →</span>
          </Link>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-teal-600 mb-5 shadow-inner">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-semibold tracking-tighter text-slate-950">
              {verificationStep ? 'Verify Your Email' : 'Create your account'}
            </h1>
            <p className="text-slate-600 mt-3">
              {verificationStep 
                ? 'Enter the 6-digit code sent to your email' 
                : 'Join thousands protecting their financial legacy'}
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl shadow-slate-200/60">
            {!verificationStep ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold tracking-widest text-slate-500 mb-1.5">FULL LEGAL NAME</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Alexandra Rivera"
                    className="w-full border border-slate-300 rounded-2xl px-5 py-3.5 text-base placeholder:text-slate-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold tracking-widest text-slate-500 mb-1.5">EMAIL ADDRESS</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@familyoffice.com"
                    className="w-full border border-slate-300 rounded-2xl px-5 py-3.5 text-base placeholder:text-slate-400"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-5">
                  <div>
                    <label className="block text-xs font-semibold tracking-widest text-slate-500 mb-1.5">PASSWORD</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Create a strong password"
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
                    <p className="text-[10px] text-slate-400 mt-1.5 px-1">Minimum 8 characters</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold tracking-widest text-slate-500 mb-1.5">CONFIRM PASSWORD</label>
                    <div className="relative">
                      <input
                        type={showConfirm ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Re-enter your password"
                        className="w-full border border-slate-300 rounded-2xl px-5 py-3.5 text-base placeholder:text-slate-400 pr-12"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-2xl flex items-start gap-2">
                    <div className="mt-0.5">⚠️</div>
                    <div>{error}</div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 bg-slate-900 hover:bg-black disabled:bg-slate-700 transition-all text-white font-semibold py-4 rounded-2xl text-base flex items-center justify-center gap-2 shadow-lg active:scale-[0.985]"
                >
                  {isLoading ? 'Sending code...' : 'Create Account'}
                </button>
              </form>
            ) : (
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold tracking-widest text-slate-500 mb-1.5">VERIFICATION CODE</label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    className="w-full border border-slate-300 rounded-2xl px-5 py-3.5 text-base placeholder:text-slate-400 text-center tracking-widest text-2xl"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-2xl flex items-start gap-2">
                    <div className="mt-0.5">⚠️</div>
                    <div>{error}</div>
                  </div>
                )}

                <button
                  onClick={handleVerification}
                  disabled={isLoading || verificationCode.length !== 6}
                  className="w-full mt-2 bg-slate-900 hover:bg-black disabled:bg-slate-700 transition-all text-white font-semibold py-4 rounded-2xl text-base flex items-center justify-center gap-2 shadow-lg active:scale-[0.985]"
                >
                  {isLoading ? 'Verifying...' : 'Verify Email & Create Account'}
                </button>

                <button
                  onClick={() => setVerificationStep(false)}
                  className="w-full text-slate-500 hover:text-slate-700 text-sm"
                >
                  Back to signup
                </button>
              </div>
            )}
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