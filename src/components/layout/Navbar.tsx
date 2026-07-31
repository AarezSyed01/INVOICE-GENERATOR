import React from 'react';
import { CompanySettings, UserProfile } from '../../types';
import { Logo } from '../ui/Logo';
import {
  Search,
  Plus,
  Moon,
  Sun,
  Keyboard,
  ShieldCheck,
  UserCheck,
  Menu,
} from 'lucide-react';

interface NavbarProps {
  settings: CompanySettings;
  user: UserProfile;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenNewInvoice: () => void;
  onOpenShortcuts: () => void;
  onOpenLogin: () => void;
  onOpenSearch: () => void;
  onToggleMobileSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  user,
  darkMode,
  onToggleDarkMode,
  onOpenNewInvoice,
  onOpenShortcuts,
  onOpenLogin,
  onOpenSearch,
  onToggleMobileSidebar,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800/80 px-4 sm:px-6 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Mobile Menu Toggle & Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 rounded-xl transition-all"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Logo settings={settings} size="md" />
        </div>

        {/* Center: Global Search Trigger */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-gray-50/80 dark:bg-gray-800/60 backdrop-blur-xs border border-gray-200/80 dark:border-gray-700/60 text-xs text-gray-500 dark:text-gray-400 hover:border-red-300 dark:hover:border-red-900/80 transition-all cursor-pointer group shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors" />
              <span>Search invoices, clients...</span>
            </div>
            <kbd className="px-1.5 py-0.5 text-[10px] font-semibold bg-white/80 dark:bg-gray-700/80 border border-gray-200 dark:border-gray-600 rounded-md text-gray-600 dark:text-gray-300 shadow-2xs">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Right Action Icons & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* New Invoice CTA */}
          <button
            onClick={onOpenNewInvoice}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md shadow-red-500/20 transition-all active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Invoice</span>
          </button>

          {/* Role Badge Button */}
          <button
            onClick={onOpenLogin}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              user.role === 'Admin'
                ? 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400'
                : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
            }`}
            title="Switch User Role"
          >
            {user.role === 'Admin' ? (
              <ShieldCheck className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
            ) : (
              <UserCheck className="w-3.5 h-3.5" />
            )}
            <span>{user.role}</span>
          </button>

          {/* Shortcuts Trigger */}
          <button
            onClick={onOpenShortcuts}
            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
            title="Keyboard Shortcuts"
          >
            <Keyboard className="w-4 h-4" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User Profile Avatar */}
          <button
            onClick={onOpenLogin}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
            title="Switch User / Account"
          >
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-lg object-cover ring-2 ring-red-500/20"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-red-600 text-white font-extrabold text-xs flex items-center justify-center ring-2 ring-red-500/20 shadow-2xs">
                {user.name ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2) : 'A'}
              </div>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
