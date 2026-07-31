import React, { useState } from 'react';
import { CompanySettings } from '../../types';
import { exportDatabaseBackup, restoreDatabaseBackup, resetToSampleData, clearAllData } from '../../lib/storage';
import {
  Settings,
  Building2,
  Upload,
  CreditCard,
  Database,
  RefreshCw,
  Save,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface SettingsViewProps {
  settings: CompanySettings;
  onSaveSettings: (settings: CompanySettings) => void;
  onToast: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  onToast,
}) => {
  const [formData, setFormData] = useState<CompanySettings>({ ...settings });

  const handleChange = (field: keyof CompanySettings, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhoneChange = (index: number, val: string) => {
    const phones = [...formData.phones];
    phones[index] = val;
    setFormData((prev) => ({ ...prev, phones }));
  };

  // Logo Upload Handler
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, logoUrl: reader.result as string }));
      onToast('success', 'Logo Uploaded', 'Company logo image updated.');
    };
    reader.readAsDataURL(file);
  };

  // Signature Upload Handler
  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, signatureUrl: reader.result as string }));
      onToast('success', 'Signature Uploaded', 'Authorized signature updated.');
    };
    reader.readAsDataURL(file);
  };

  // Restore File JSON Handler
  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const ok = restoreDatabaseBackup(reader.result as string);
      if (ok) {
        onToast('success', 'Database Restored', 'Successfully imported database backup.');
      } else {
        onToast('error', 'Restore Failed', 'Invalid JSON backup file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    onToast('success', 'Settings Saved', 'Company settings updated successfully.');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Company & System Settings
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Configure AR Web Solutions branding, payment info, tax rates, and database backups
          </p>
        </div>

        <button
          type="submit"
          className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-500/25 transition-all self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      {/* Company Information */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Building2 className="w-4 h-4 text-red-600" /> Company Identity
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Company Name
            </label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => handleChange('companyName', e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Company Tagline
            </label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => handleChange('tagline', e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Primary Phone (Aarez Syed)
            </label>
            <input
              type="text"
              value={formData.phones[0] || ''}
              onChange={(e) => handlePhoneChange(0, e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Secondary Phone (Raiyan Shaikh)
            </label>
            <input
              type="text"
              value={formData.phones[1] || ''}
              onChange={(e) => handlePhoneChange(1, e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Official Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Website URL
            </label>
            <input
              type="text"
              value={formData.website}
              onChange={(e) => handleChange('website', e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Company GSTIN Number
            </label>
            <input
              type="text"
              value={formData.gstNumber}
              onChange={(e) => handleChange('gstNumber', e.target.value.toUpperCase())}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-mono text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Default GST Rate (%)
            </label>
            <input
              type="number"
              value={formData.defaultGstPercentage}
              onChange={(e) => handleChange('defaultGstPercentage', Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Logo & Signature Assets Upload */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Upload className="w-4 h-4 text-red-600" /> Logo & Authorized Signature
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 space-y-3 text-center">
            <p className="text-xs font-bold text-gray-800 dark:text-gray-200">Company Logo</p>
            {formData.logoUrl ? (
              <img src={formData.logoUrl} alt="Logo" className="h-16 mx-auto object-contain rounded-lg" />
            ) : (
              <div className="w-12 h-12 bg-red-600 text-white font-black text-xl flex items-center justify-center rounded-xl mx-auto shadow-md">
                AR
              </div>
            )}
            <label className="inline-block px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-all">
              Upload Custom Logo
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            </label>
          </div>

          <div className="p-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 space-y-3 text-center">
            <p className="text-xs font-bold text-gray-800 dark:text-gray-200">Authorized Signature</p>
            {formData.signatureUrl ? (
              <img src={formData.signatureUrl} alt="Signature" className="h-12 mx-auto object-contain" />
            ) : (
              <div className="h-12 flex items-center justify-center italic font-serif text-lg font-bold text-gray-700 dark:text-gray-300">
                Aarez Syed
              </div>
            )}
            <label className="inline-block px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-all">
              Upload Stamp / Signature
              <input type="file" accept="image/*" onChange={handleSignatureUpload} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      {/* Bank & UPI Details */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-red-600" /> Bank Account & UPI Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Bank Name
            </label>
            <input
              type="text"
              value={formData.bankName}
              onChange={(e) => handleChange('bankName', e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Account Holder Name
            </label>
            <input
              type="text"
              value={formData.accountHolder}
              onChange={(e) => handleChange('accountHolder', e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Account Number
            </label>
            <input
              type="text"
              value={formData.accountNumber}
              onChange={(e) => handleChange('accountNumber', e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-mono text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              IFSC Code
            </label>
            <input
              type="text"
              value={formData.ifsc}
              onChange={(e) => handleChange('ifsc', e.target.value.toUpperCase())}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-mono text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              UPI ID (for QR Code)
            </label>
            <input
              type="text"
              value={formData.upiId}
              onChange={(e) => handleChange('upiId', e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-mono text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Backup & Restore Data */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-red-600" /> Database Backup & Recovery
        </h3>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={exportDatabaseBackup}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-gray-700 hover:bg-black text-white font-bold text-xs rounded-xl shadow-md transition-all"
          >
            <Database className="w-4 h-4" />
            <span>Download JSON Backup</span>
          </button>

          <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-800 dark:text-gray-200 font-bold text-xs rounded-xl cursor-pointer transition-all">
            <Upload className="w-4 h-4" />
            <span>Restore JSON Backup</span>
            <input type="file" accept=".json" onChange={handleRestoreFile} className="hidden" />
          </label>

          <button
            type="button"
            onClick={() => {
              if (confirm('Clear all data completely? This will wipe all invoices, quotations, and clients.')) {
                clearAllData();
                onToast('info', 'All Data Cleared', 'Database reset to empty state.');
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md shadow-red-500/20 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Clear All Data</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (confirm('Reset database to default sample invoices & clients?')) {
                resetToSampleData();
                onToast('info', 'Reset Complete', 'Database reset to sample data.');
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-950/60 hover:bg-red-200 text-red-600 dark:text-red-400 font-bold text-xs rounded-xl transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Load Seed Demo Data</span>
          </button>
        </div>
      </div>
    </form>
  );
};
