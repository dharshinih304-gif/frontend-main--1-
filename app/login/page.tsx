'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Ship, Lock, Mail, ChevronRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0f172a] overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-accent/5 dark:bg-accent/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-slate-800/5 dark:bg-slate-800/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md p-10 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-white/10 rounded-[40px] shadow-2xl mx-4">
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-slate-900 dark:bg-accent rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-slate-900/20 dark:shadow-accent/20">
            <Ship className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight text-center uppercase">Sellamsoft</h1>
          <p className="text-slate-600 dark:text-slate-300 mt-4 text-center font-bold tracking-tight">Vessel Inspection Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <label className="block text-[10px] font-black text-slate-600 dark:text-slate-400 mb-2 ml-1 uppercase tracking-widest">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-accent transition-colors" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-accent focus:bg-white dark:focus:bg-slate-800 transition-all outline-none text-slate-900 dark:text-white font-bold placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-inner"
                required
              />
            </div>
          </div>

          <div className="relative">
            <label className="block text-[10px] font-black text-slate-600 dark:text-slate-400 mb-2 ml-1 uppercase tracking-widest">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-accent transition-colors" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-accent focus:bg-white dark:focus:bg-slate-800 transition-all outline-none text-slate-900 dark:text-white font-bold placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-inner"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-slate-900 dark:bg-accent hover:opacity-90 text-white rounded-2xl font-black text-xs tracking-widest uppercase transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group shadow-2xl shadow-slate-900/20 dark:shadow-accent/20"
          >
            {isLoading ? 'Authenticating...' : 'Sign In'}
            {!isLoading && <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-slate-200 dark:border-white/5 text-center">
          <p className="text-slate-500 dark:text-slate-400 text-[11px] font-bold tracking-tight">
            Need access? <span className="text-accent hover:underline cursor-pointer font-black">Contact Administration</span>
          </p>
        </div>
      </div>
    </div>
  );
}
