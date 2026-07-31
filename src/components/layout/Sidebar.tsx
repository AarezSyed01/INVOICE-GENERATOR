import React from 'react';
import { UserProfile } from '../../types';
import {
  LayoutDashboard,
  FileText,
  Users,
  FileSpreadsheet,
  CreditCard,
  BarChart3,
  Settings,
  User,
  LogOut,
  X,
  ShieldCheck,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'invoices'
  | 'clients'
  | 'quotations'
  | 'payments'
  | 'analytics'
  | 'settings'
  | 'profile';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  user: UserProfile;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenLogin: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  user,
  isOpenMobile,
  onCloseMobile,
  onOpenLogin,
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'invoices', label: 'Invoices', icon: <FileText className="w-4 h-4" /> },
    { id: 'clients', label: 'Clients', icon: <Users className="w-4 h-4" /> },
    { id: 'quotations', label: 'Quotations', icon: <FileSpreadsheet className="w-4 h-4" /> },
    { id: 'payments', label: 'Payments', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
    { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-r border-gray-100 dark:border-gray-800/80 p-4 transition-colors">
      {/* Mobile close button */}
      <div className="lg:hidden flex items-center justify-between pb-4 mb-2 border-b border-gray-100 dark:border-gray-800">
        <span className="text-sm font-bold text-gray-900 dark:text-white">Navigation</span>
        <button
          onClick={onCloseMobile}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Primary Navigation List */}
      <nav className="space-y-1 flex-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-red-50 text-red-600 dark:bg-red-950/70 dark:text-red-400 border border-red-100 dark:border-red-900/50 shadow-2xs'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/70 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                    isActive
                      ? 'bg-red-200/60 text-red-700 dark:bg-red-900/80 dark:text-red-300'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Card & Logout / Switch Role */}
      <div className="pt-4 border-t border-gray-100 dark:border-gray-800/80 space-y-2">
        <div className="p-3 rounded-xl bg-gray-50/80 dark:bg-gray-800/50 backdrop-blur-xs border border-gray-100/80 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-lg object-cover shrink-0 ring-1 ring-red-500/30"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-red-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 ring-1 ring-red-500/30 shadow-2xs">
                {user.name ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2) : 'A'}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                {user.name}
              </p>
              <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 truncate flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-red-500 inline" />
                {user.role} Access
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onOpenLogin}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100/70 dark:hover:bg-gray-800/60 hover:text-red-600 rounded-xl transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Switch Role / Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 h-[calc(100vh-61px)] sticky top-[61px]">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative w-64 max-w-xs h-full z-10 animate-slideRight">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
