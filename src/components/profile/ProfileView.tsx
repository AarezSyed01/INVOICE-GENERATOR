import React from 'react';
import { UserProfile } from '../../types';
import { ShieldCheck, Mail, UserCheck, Lock, Sparkles } from 'lucide-react';

interface ProfileViewProps {
  user: UserProfile;
  onOpenLoginModal: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, onOpenLoginModal }) => {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-red-600 via-red-500 to-black" />

        <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-24 h-24 rounded-2xl object-cover ring-4 ring-red-500/20 shadow-lg"
            />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 text-white font-black text-2xl flex items-center justify-center ring-4 ring-red-500/20 shadow-lg shrink-0">
              {user.name ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2) : 'A'}
            </div>
          )}

          <div className="text-center sm:text-left space-y-1 flex-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">{user.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900">
                {user.role}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center sm:justify-start gap-1">
              <Mail className="w-3.5 h-3.5 text-red-500" /> {user.email}
            </p>
            <p className="text-xs text-gray-400 pt-1">
              AR Web Solutions Team • Authorization Granted
            </p>
          </div>

          <button
            onClick={onOpenLoginModal}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-500/25 transition-all"
          >
            Switch Role / User
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-red-600" /> Active Role Permissions ({user.role})
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-700 dark:text-gray-300">
          <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex items-center gap-2">
            <span className="text-emerald-500 font-bold">✓</span> Create Invoices & Quotations
          </div>
          <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex items-center gap-2">
            <span className="text-emerald-500 font-bold">✓</span> View Dashboard & Revenue Charts
          </div>
          <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex items-center gap-2">
            <span className="text-emerald-500 font-bold">✓</span> Manage Client Directory
          </div>
          <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex items-center gap-2">
            {user.role === 'Admin' ? (
              <span className="text-emerald-500 font-bold">✓ Delete Invoices & System Settings</span>
            ) : (
              <span className="text-red-500 font-bold">✕ Delete Invoices (Admin Only)</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
