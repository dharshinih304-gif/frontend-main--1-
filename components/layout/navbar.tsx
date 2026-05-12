'use client';

import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Bell, Search, Menu, User as UserIcon, Sun, Moon, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';

export function Navbar({ toggleSidebar }: { toggleSidebar: () => void }) {
  const { user, logout } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <header className="nav-glass h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-white/10 shadow-sm">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 rounded-xl transition-all"
        >
          <Menu className="w-5 h-5 text-slate-900 dark:text-slate-100" />
        </button>
        <div className="relative hidden md:block w-72 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-accent transition-colors" />
          <input 
            type="text" 
            placeholder="Search everything..." 
            className="w-full pl-11 pr-4 py-2.5 bg-slate-100/80 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-accent focus:bg-white dark:focus:bg-slate-800 outline-none transition-all shadow-inner"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={toggleTheme}
          className="p-2 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 rounded-xl transition-all shadow-sm"
        >
          {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
        </button>
        
        <button className="p-2 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 rounded-xl transition-all relative">
          <Bell className="w-5 h-5 text-slate-900 dark:text-slate-100" />
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />
        </button>

        <div className="h-8 w-[1px] bg-slate-200 dark:bg-white/10 mx-1" />

        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden lg:block">
            <p className="text-sm font-black leading-none text-slate-900 dark:text-white uppercase tracking-tight">{user?.name || 'User'}</p>
            <p className="text-[10px] text-slate-600 dark:text-slate-300 mt-1 font-black uppercase tracking-[0.2em]">{user?.role || 'User'}</p>
          </div>
          
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-accent to-blue-500 flex items-center justify-center text-white font-black border-2 border-slate-200 dark:border-white/10 shadow-lg shadow-accent/20 ring-2 ring-transparent group-hover:ring-accent transition-all">
            {user?.name?.charAt(0) || <UserIcon className="w-5 h-5" />}
          </div>

          <button 
            onClick={() => {
              console.log('Navbar Logout Clicked');
              logout();
            }}
            className="ml-2 px-5 py-2.5 bg-slate-900 dark:bg-red-500 text-white hover:opacity-90 active:scale-95 rounded-2xl transition-all shadow-xl shadow-slate-900/10 dark:shadow-red-500/10 flex items-center gap-2 text-[11px] font-black tracking-widest"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">SIGN OUT</span>
          </button>
        </div>
      </div>
    </header>
  );
}
