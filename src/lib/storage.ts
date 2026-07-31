import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';
import { Invoice, Quotation, Client, CompanySettings, UserProfile } from '../types';
import {
  DEFAULT_COMPANY_SETTINGS,
  INITIAL_CLIENTS,
  INITIAL_INVOICES,
  INITIAL_QUOTATIONS,
} from './constants';

const STORAGE_KEYS = {
  INVOICES: 'arws_invoices_v2',
  QUOTATIONS: 'arws_quotations_v2',
  CLIENTS: 'arws_clients_v2',
  SETTINGS: 'arws_settings_v2',
  USER: 'arws_user_v2',
};

// Initial User Profile (no avatar image)
export const DEFAULT_ADMIN_USER: UserProfile = {
  id: 'usr-1',
  name: 'Aarez Syed',
  email: 'aarez@arwebsolutions.com',
  role: 'Admin',
  avatar: '',
};

export const DEFAULT_STAFF_USER: UserProfile = {
  id: 'usr-2',
  name: 'Raiyan Shaikh',
  email: 'raiyan@arwebsolutions.com',
  role: 'Staff',
  avatar: '',
};

// LocalStorage Helper
export const getStoredInvoices = (): Invoice[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INVOICES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify([]));
      return [];
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading invoices from localStorage:', e);
    return [];
  }
};

export const saveInvoices = (invoices: Invoice[]) => {
  localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  window.dispatchEvent(new Event('arws_data_change'));
};

export const getStoredQuotations = (): Quotation[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUOTATIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.QUOTATIONS, JSON.stringify([]));
      return [];
    }
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
};

export const saveQuotations = (quotations: Quotation[]) => {
  localStorage.setItem(STORAGE_KEYS.QUOTATIONS, JSON.stringify(quotations));
  window.dispatchEvent(new Event('arws_data_change'));
};

export const getStoredClients = (): Client[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify([]));
      return [];
    }
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
};

export const saveClients = (clients: Client[]) => {
  localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  window.dispatchEvent(new Event('arws_data_change'));
};

export const getStoredSettings = (): CompanySettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_COMPANY_SETTINGS));
      return DEFAULT_COMPANY_SETTINGS;
    }
    return { ...DEFAULT_COMPANY_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_COMPANY_SETTINGS;
  }
};

export const saveSettings = (settings: CompanySettings) => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  window.dispatchEvent(new Event('arws_data_change'));
};

export const getStoredUser = (): UserProfile => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(DEFAULT_ADMIN_USER));
      return DEFAULT_ADMIN_USER;
    }
    const parsed = JSON.parse(raw);
    // Ensure avatar is cleared if it was an old stock image
    if (parsed.avatar && parsed.avatar.includes('unsplash.com')) {
      parsed.avatar = '';
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(parsed));
    }
    return parsed;
  } catch (e) {
    return DEFAULT_ADMIN_USER;
  }
};

export const saveUser = (user: UserProfile) => {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  window.dispatchEvent(new Event('arws_data_change'));
};

// Supabase Dynamic Client
export const getSupabaseClient = (url?: string, key?: string): SupabaseClient | null => {
  const settings = getStoredSettings();
  const supabaseUrl = url || settings.supabaseUrl || import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = key || settings.supabaseAnonKey || import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http')) {
    try {
      return createSupabaseClient(supabaseUrl, supabaseAnonKey);
    } catch (e) {
      console.warn('Supabase initialization failed:', e);
      return null;
    }
  }
  return null;
};

// Backup Export JSON
export const exportDatabaseBackup = () => {
  const backupData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    invoices: getStoredInvoices(),
    quotations: getStoredQuotations(),
    clients: getStoredClients(),
    settings: getStoredSettings(),
  };

  const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `AR_Web_Solutions_Backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

// Backup Restore JSON
export const restoreDatabaseBackup = (jsonString: string): boolean => {
  try {
    const data = JSON.parse(jsonString);
    if (data.invoices && Array.isArray(data.invoices)) saveInvoices(data.invoices);
    if (data.quotations && Array.isArray(data.quotations)) saveQuotations(data.quotations);
    if (data.clients && Array.isArray(data.clients)) saveClients(data.clients);
    if (data.settings && typeof data.settings === 'object') saveSettings(data.settings);
    return true;
  } catch (err) {
    console.error('Failed to restore backup:', err);
    return false;
  }
};

// Reset All Data (Clear all records to clean zero state)
export const clearAllData = () => {
  localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.QUOTATIONS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_COMPANY_SETTINGS));
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(DEFAULT_ADMIN_USER));
  window.dispatchEvent(new Event('arws_data_change'));
};

// Reset to Initial Sample Data
export const resetToSampleData = () => {
  localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(INITIAL_INVOICES));
  localStorage.setItem(STORAGE_KEYS.QUOTATIONS, JSON.stringify(INITIAL_QUOTATIONS));
  localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(INITIAL_CLIENTS));
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_COMPANY_SETTINGS));
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(DEFAULT_ADMIN_USER));
  window.dispatchEvent(new Event('arws_data_change'));
};
