import React, { useState, useEffect, useCallback } from 'react';
import {
  Invoice,
  Quotation,
  Client,
  CompanySettings,
  UserProfile,
} from './types';
import {
  getStoredInvoices,
  saveInvoices,
  getStoredQuotations,
  saveQuotations,
  getStoredClients,
  saveClients,
  getStoredSettings,
  saveSettings,
  getStoredUser,
  saveUser,
  DEFAULT_ADMIN_USER,
  DEFAULT_STAFF_USER,
} from './lib/storage';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { InvoiceList } from './components/invoices/InvoiceList';
import { InvoiceForm } from './components/invoices/InvoiceForm';
import { InvoicePreview } from './components/invoices/InvoicePreview';
import { QuotationList } from './components/quotations/QuotationList';
import { ClientList } from './components/clients/ClientList';
import { ClientModal } from './components/clients/ClientModal';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { PaymentsView } from './components/payments/PaymentsView';
import { SettingsView } from './components/settings/SettingsView';
import { ProfileView } from './components/profile/ProfileView';
import { LoginModal } from './components/auth/LoginModal';
import { ShortcutsModal } from './components/ui/ShortcutsModal';
import { ConfirmModal } from './components/ui/ConfirmModal';
import { ToastContainer, ToastMessage } from './components/ui/Toast';
import { Search, X, FileText, Users, Plus } from 'lucide-react';
import { generateInvoiceNumber } from './lib/utils';

export default function App() {
  // State
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [invoices, setInvoices] = useState<Invoice[]>(getStoredInvoices());
  const [quotations, setQuotations] = useState<Quotation[]>(getStoredQuotations());
  const [clients, setClients] = useState<Client[]>(getStoredClients());
  const [settings, setSettings] = useState<CompanySettings>(getStoredSettings());
  const [user, setUser] = useState<UserProfile>(getStoredUser());

  // UI Modes
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modals & Overlays
  const [isInvoiceFormOpen, setIsInvoiceFormOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Delete Confirm Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback(
    (type: 'success' | 'error' | 'info', title: string, description?: string) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      setToasts((prev) => [...prev, { id, type, title, description }]);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Listen to local storage data changes
  useEffect(() => {
    const handleDataChange = () => {
      setInvoices(getStoredInvoices());
      setQuotations(getStoredQuotations());
      setClients(getStoredClients());
      setSettings(getStoredSettings());
      setUser(getStoredUser());
    };

    window.addEventListener('arws_data_change', handleDataChange);
    return () => window.removeEventListener('arws_data_change', handleDataChange);
  }, []);

  // Apply dark mode class to html document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Global Keyboard Shortcuts (Ctrl+N, Ctrl+Q, Ctrl+K, Ctrl+D)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setEditingInvoice(null);
        setIsInvoiceFormOpen(true);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        setActiveTab('dashboard');
      } else if (e.key === 'Escape') {
        setIsInvoiceFormOpen(false);
        setPreviewInvoice(null);
        setIsClientModalOpen(false);
        setIsShortcutsModalOpen(false);
        setIsLoginModalOpen(false);
        setIsSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Invoice Handlers
  const handleSaveInvoice = (invoice: Invoice, saveClientToDb?: Client) => {
    let nextInvoices = [...invoices];
    const index = nextInvoices.findIndex((inv) => inv.id === invoice.id);
    if (index >= 0) {
      nextInvoices[index] = invoice;
    } else {
      nextInvoices.unshift(invoice);
    }

    saveInvoices(nextInvoices);
    setInvoices(nextInvoices);

    // Save Client to Database if requested
    if (saveClientToDb) {
      let nextClients = [...clients];
      const clientIndex = nextClients.findIndex((c) => c.id === saveClientToDb.id);
      if (clientIndex >= 0) {
        nextClients[clientIndex] = saveClientToDb;
      } else {
        nextClients.unshift(saveClientToDb);
      }
      saveClients(nextClients);
      setClients(nextClients);
    }

    setIsInvoiceFormOpen(false);
    setEditingInvoice(null);
  };

  const handleDuplicateInvoice = (invoice: Invoice) => {
    const duplicated: Invoice = {
      ...invoice,
      id: `inv-${Date.now()}`,
      invoiceNumber: generateInvoiceNumber(invoices, settings.invoicePrefix),
      date: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      status: 'Pending',
      advanceReceived: 0,
      remainingBalance: invoice.grandTotal,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const next = [duplicated, ...invoices];
    saveInvoices(next);
    setInvoices(next);
    addToast('success', 'Invoice Duplicated', `Created duplicate invoice ${duplicated.invoiceNumber}`);
  };

  const handleDeleteInvoice = (id: string) => {
    if (user.role !== 'Admin') {
      addToast('error', 'Permission Denied', 'Only Admin can delete invoices.');
      return;
    }

    const inv = invoices.find((i) => i.id === id);
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Invoice?',
      message: `Are you sure you want to delete invoice ${inv?.invoiceNumber || ''}? This action cannot be undone.`,
      onConfirm: () => {
        const next = invoices.filter((i) => i.id !== id);
        saveInvoices(next);
        setInvoices(next);
        addToast('success', 'Invoice Deleted', 'Invoice removed from database.');
      },
    });
  };

  // Quotation Handlers
  const handleConvertQuotationToInvoice = (quotation: Quotation) => {
    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: generateInvoiceNumber(invoices, settings.invoicePrefix),
      quotationNumber: quotation.quotationNumber,
      date: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      status: 'Pending',
      currency: quotation.currency,
      currencySymbol: quotation.currencySymbol,
      client: quotation.client,
      services: quotation.services,
      subtotal: quotation.subtotal,
      discountType: quotation.discountType,
      discountValue: quotation.discountValue,
      discountTotal: quotation.discountTotal,
      gstTotal: 0,
      roundOff: 0,
      grandTotal: quotation.grandTotal,
      advanceReceived: 0,
      remainingBalance: quotation.grandTotal,
      paymentMode: 'Bank Transfer',
      bankDetails: {
        bankName: settings.bankName,
        accountHolder: settings.accountHolder,
        accountNumber: settings.accountNumber,
        ifsc: settings.ifsc,
        upiId: settings.upiId,
        showPaymentInfoInPrint: true,
      },
      notes: settings.defaultNotes,
      termsAndConditions: quotation.termsAndConditions,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: user.name,
    };

    // Update Quotation Status to Converted
    const updatedQuotations = quotations.map((q) =>
      q.id === quotation.id ? { ...q, status: 'Converted' as const, convertedInvoiceId: newInvoice.id } : q
    );
    saveQuotations(updatedQuotations);
    setQuotations(updatedQuotations);

    // Open editing view for new converted invoice
    setEditingInvoice(newInvoice);
    setIsInvoiceFormOpen(true);
    addToast('success', 'Converted to Invoice', `Draft invoice created from quotation ${quotation.quotationNumber}`);
  };

  const handleDeleteQuotation = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Quotation?',
      message: 'Are you sure you want to delete this quotation proposal?',
      onConfirm: () => {
        const next = quotations.filter((q) => q.id !== id);
        saveQuotations(next);
        setQuotations(next);
        addToast('success', 'Quotation Deleted', 'Removed quotation record.');
      },
    });
  };

  // Client Handlers
  const handleSaveClient = (client: Client) => {
    let nextClients = [...clients];
    const index = nextClients.findIndex((c) => c.id === client.id);
    if (index >= 0) {
      nextClients[index] = client;
    } else {
      nextClients.unshift(client);
    }
    saveClients(nextClients);
    setClients(nextClients);
    addToast('success', 'Client Saved', `Updated client ${client.businessName || client.name}`);
  };

  const handleDeleteClient = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Client?',
      message: 'Are you sure you want to delete this client profile from directory?',
      onConfirm: () => {
        const next = clients.filter((c) => c.id !== id);
        saveClients(next);
        setClients(next);
        addToast('success', 'Client Deleted', 'Client removed from directory.');
      },
    });
  };

  // Settings Handler
  const handleSaveSettings = (newSettings: CompanySettings) => {
    saveSettings(newSettings);
    setSettings(newSettings);
  };

  // User Auth Handler
  const handleLogin = (newUser: UserProfile) => {
    saveUser(newUser);
    setUser(newUser);
    addToast('info', 'Role Switched', `Logged in as ${newUser.name} (${newUser.role})`);
  };

  // Search Results
  const searchResults = searchQuery.trim()
    ? invoices.filter(
        (i) =>
          i.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          i.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (i.client.businessName && i.client.businessName.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col font-sans transition-colors selection:bg-red-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        settings={settings}
        user={user}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((prev) => !prev)}
        onOpenNewInvoice={() => {
          setEditingInvoice(null);
          setIsInvoiceFormOpen(true);
        }}
        onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
      />

      <div className="flex flex-1 max-w-7xl w-full mx-auto">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setIsInvoiceFormOpen(false);
          }}
          user={user}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          onOpenLogin={() => setIsLoginModalOpen(true)}
        />

        {/* Main Content View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto min-w-0">
          {/* Active Invoice Editor Form (Overrides standard tabs when open) */}
          {isInvoiceFormOpen ? (
            <InvoiceForm
              initialInvoice={editingInvoice}
              existingInvoices={invoices}
              clients={clients}
              settings={settings}
              onSaveInvoice={handleSaveInvoice}
              onCancel={() => {
                setIsInvoiceFormOpen(false);
                setEditingInvoice(null);
              }}
              onPreview={(inv) => setPreviewInvoice(inv)}
              onToast={addToast}
            />
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardView
                  invoices={invoices}
                  clients={clients}
                  settings={settings}
                  userRole={user.role}
                  onNewInvoice={() => {
                    setEditingInvoice(null);
                    setIsInvoiceFormOpen(true);
                  }}
                  onNewClient={() => {
                    setEditingClient(null);
                    setIsClientModalOpen(true);
                  }}
                  onNewQuote={() => setActiveTab('quotations')}
                  onViewInvoice={(inv) => setPreviewInvoice(inv)}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                  onToast={addToast}
                />
              )}

              {activeTab === 'invoices' && (
                <InvoiceList
                  invoices={invoices}
                  userRole={user.role}
                  settings={settings}
                  onNewInvoice={() => {
                    setEditingInvoice(null);
                    setIsInvoiceFormOpen(true);
                  }}
                  onViewInvoice={(inv) => setPreviewInvoice(inv)}
                  onEditInvoice={(inv) => {
                    setEditingInvoice(inv);
                    setIsInvoiceFormOpen(true);
                  }}
                  onDuplicateInvoice={handleDuplicateInvoice}
                  onDeleteInvoice={handleDeleteInvoice}
                  onToast={addToast}
                />
              )}

              {activeTab === 'clients' && (
                <ClientList
                  clients={clients}
                  invoices={invoices}
                  onAddClient={() => {
                    setEditingClient(null);
                    setIsClientModalOpen(true);
                  }}
                  onEditClient={(c) => {
                    setEditingClient(c);
                    setIsClientModalOpen(true);
                  }}
                  onDeleteClient={handleDeleteClient}
                  onToast={addToast}
                />
              )}

              {activeTab === 'quotations' && (
                <QuotationList
                  quotations={quotations}
                  invoices={invoices}
                  clients={clients}
                  settings={settings}
                  userRole={user.role}
                  onNewQuotation={() => {
                    // Create quick default quotation
                    const newQt: Quotation = {
                      id: `qt-${Date.now()}`,
                      quotationNumber: `ARWS-QT-2026-${(quotations.length + 1).toString().padStart(3, '0')}`,
                      date: new Date().toISOString().slice(0, 10),
                      validUntil: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
                      status: 'Sent',
                      currency: 'INR',
                      currencySymbol: '₹',
                      client: clients[0] || {
                        id: 'c1',
                        name: 'New Client',
                        businessName: 'Business Proposal',
                        email: 'info@client.com',
                        phone: '+91 9876543210',
                        address: 'Mumbai',
                        city: 'Mumbai',
                        state: 'Maharashtra',
                        country: 'India',
                        pinCode: '400001',
                        createdAt: new Date().toISOString(),
                      },
                      services: [
                        {
                          id: 'srv-qt1',
                          serviceName: 'Custom Web Application',
                          description: 'Complete full-stack React solution.',
                          quantity: 1,
                          unitPrice: 120000,
                          discount: 10000,
                          amount: 110000,
                        },
                      ],
                      subtotal: 120000,
                      discountType: 'fixed',
                      discountValue: 10000,
                      discountTotal: 10000,
                      gstTotal: 0,
                      grandTotal: 110000,
                      notes: 'Estimate valid for 30 days.',
                      termsAndConditions: settings.defaultTerms,
                      createdAt: new Date().toISOString(),
                    };
                    saveQuotations([newQt, ...quotations]);
                    addToast('success', 'Quotation Created', `Created proposal ${newQt.quotationNumber}`);
                  }}
                  onConvertQuotationToInvoice={handleConvertQuotationToInvoice}
                  onDeleteQuotation={handleDeleteQuotation}
                  onToast={addToast}
                />
              )}

              {activeTab === 'payments' && (
                <PaymentsView invoices={invoices} settings={settings} onToast={addToast} />
              )}

              {activeTab === 'analytics' && (
                <AnalyticsView
                  invoices={invoices}
                  clients={clients}
                  settings={settings}
                  onToast={addToast}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsView
                  settings={settings}
                  onSaveSettings={handleSaveSettings}
                  onToast={addToast}
                />
              )}

              {activeTab === 'profile' && (
                <ProfileView user={user} onOpenLoginModal={() => setIsLoginModalOpen(true)} />
              )}
            </>
          )}
        </main>
      </div>

      {/* Invoice Preview Printable Modal */}
      {previewInvoice && (
        <InvoicePreview
          invoice={previewInvoice}
          settings={settings}
          onClose={() => setPreviewInvoice(null)}
          onToast={addToast}
        />
      )}

      {/* Client Edit / Create Modal */}
      <ClientModal
        isOpen={isClientModalOpen}
        client={editingClient}
        onSave={handleSaveClient}
        onClose={() => setIsClientModalOpen(false)}
      />

      {/* Global Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 max-w-xl w-full shadow-2xl relative">
            <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-3">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search invoice number or client name..."
                className="w-full text-sm font-semibold text-gray-900 dark:text-white bg-transparent outline-hidden"
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 max-h-80 overflow-y-auto space-y-2">
              {searchResults.length === 0 ? (
                <p className="text-xs text-gray-400 py-8 text-center">
                  {searchQuery ? 'No matching invoices found.' : 'Type to search invoices & clients...'}
                </p>
              ) : (
                searchResults.map((inv) => (
                  <div
                    key={inv.id}
                    onClick={() => {
                      setPreviewInvoice(inv);
                      setIsSearchOpen(false);
                    }}
                    className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div>
                      <p className="text-xs font-mono font-bold text-red-600 dark:text-red-400">
                        {inv.invoiceNumber}
                      </p>
                      <p className="text-xs font-bold text-gray-900 dark:text-white">
                        {inv.client.businessName || inv.client.name}
                      </p>
                    </div>
                    <span className="text-xs font-black text-gray-900 dark:text-white">
                      ₹{inv.grandTotal.toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Role / Auth Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        currentUser={user}
        onLogin={handleLogin}
        onClose={() => setIsLoginModalOpen(false)}
      />

      {/* Shortcuts Modal */}
      <ShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
