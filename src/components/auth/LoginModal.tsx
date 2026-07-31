import React, { useState } from 'react';
import { UserProfile, UserRole } from '../../types';
import { DEFAULT_ADMIN_USER, DEFAULT_STAFF_USER } from '../../lib/storage';
import { ShieldCheck, UserCheck, Lock, X } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  currentUser: UserProfile;
  onLogin: (user: UserProfile) => void;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  currentUser,
  onLogin,
  onClose,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentUser.role);
  const [email, setEmail] = useState(
    currentUser.role === 'Admin' ? 'aarez@arwebsolutions.com' : 'raiyan@arwebsolutions.com'
  );
  const [password, setPassword] = useState('••••••••');

  if (!isOpen) return null;

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setEmail(role === 'Admin' ? 'aarez@arwebsolutions.com' : 'raiyan@arwebsolutions.com');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole === 'Admin') {
      onLogin(DEFAULT_ADMIN_USER);
    } else {
      onLogin(DEFAULT_STAFF_USER);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-red-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-red-500/20 font-black text-xl">
            AR
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">
            AR Web Solutions Portal
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Sign in or switch role permissions
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => handleRoleSelect('Admin')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              selectedRole === 'Admin'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Admin Mode
          </button>
          <button
            type="button"
            onClick={() => handleRoleSelect('Staff')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              selectedRole === 'Staff'
                ? 'bg-gray-900 dark:bg-white dark:text-gray-900 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Staff Mode
          </button>
        </div>

        {/* Info box for role permissions */}
        <div className="mb-5 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-300">
          {selectedRole === 'Admin' ? (
            <p>
              <strong className="text-red-600 dark:text-red-400">Admin Permissions:</strong> Full control over invoice creation, editing, deletion, client management, analytics, and company settings.
            </p>
          ) : (
            <p>
              <strong className="text-gray-900 dark:text-white">Staff Permissions:</strong> Can create & view invoices, view dashboard & clients. Cannot delete invoices or access master system settings.
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden pr-10"
                required
              />
              <Lock className="w-4 h-4 text-gray-400 absolute right-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-lg shadow-red-500/25 transition-all mt-2"
          >
            Authenticate as {selectedRole}
          </button>
        </form>
      </div>
    </div>
  );
};
