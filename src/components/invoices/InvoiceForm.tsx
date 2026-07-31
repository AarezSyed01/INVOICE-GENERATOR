import React, { useState, useEffect, useMemo } from 'react';
import {
  Invoice,
  Client,
  ServiceItem,
  CompanySettings,
  InvoiceStatus,
  PaymentMode,
} from '../../types';
import { SERVICE_TEMPLATES } from '../../lib/constants';
import { generateInvoiceNumber, formatCurrency } from '../../lib/utils';
import {
  Plus,
  Trash2,
  Copy,
  Save,
  Eye,
  Building2,
  Sparkles,
  ArrowLeft,
  UserCheck,
  Check,
} from 'lucide-react';

interface InvoiceFormProps {
  initialInvoice?: Invoice | null;
  existingInvoices: Invoice[];
  clients: Client[];
  settings: CompanySettings;
  onSaveInvoice: (invoice: Invoice, saveClientToDb?: Client) => void;
  onCancel: () => void;
  onPreview: (invoice: Invoice) => void;
  onToast: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({
  initialInvoice,
  existingInvoices,
  clients,
  settings,
  onSaveInvoice,
  onCancel,
  onPreview,
  onToast,
}) => {
  // Form State
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10)
  );
  const [status, setStatus] = useState<InvoiceStatus>('Pending');
  const [currency, setCurrency] = useState(settings.defaultCurrency || 'INR');
  const [currencySymbol, setCurrencySymbol] = useState(settings.defaultCurrencySymbol || '₹');

  // Client State
  const [selectedClientId, setSelectedClientId] = useState('');
  const [clientName, setClientName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('India');
  const [pinCode, setPinCode] = useState('');
  const [saveClientToDatabase, setSaveClientToDatabase] = useState(true);

  // Services State
  const [services, setServices] = useState<ServiceItem[]>([
    {
      id: 'srv-init-1',
      serviceName: 'Business Website',
      description: 'Corporate website design with dynamic features and mobile responsive layout.',
      quantity: 1,
      unitPrice: 35000,
      discount: 0,
      gstPercentage: settings.defaultGstPercentage || 18,
      amount: 41300,
    },
  ]);

  // Overall Discounts & Financials
  const [discountType, setDiscountType] = useState<'fixed' | 'percentage'>('fixed');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [advanceReceived, setAdvanceReceived] = useState<number>(0);

  // Payment Details
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('Bank Transfer');
  const [showPaymentInfoInPrint, setShowPaymentInfoInPrint] = useState(true);

  // Notes & Terms
  const [notes, setNotes] = useState(settings.defaultNotes);
  const [terms, setTerms] = useState(settings.defaultTerms);

  // Initialize values on mount or when initialInvoice changes
  useEffect(() => {
    if (initialInvoice) {
      setInvoiceNumber(initialInvoice.invoiceNumber);
      setDate(initialInvoice.date);
      setDueDate(initialInvoice.dueDate);
      setStatus(initialInvoice.status);
      setCurrency(initialInvoice.currency);
      setCurrencySymbol(initialInvoice.currencySymbol);

      setClientName(initialInvoice.client.name);
      setBusinessName(initialInvoice.client.businessName);
      setGstNumber(initialInvoice.client.gstNumber);
      setEmail(initialInvoice.client.email);
      setPhone(initialInvoice.client.phone);
      setAddress(initialInvoice.client.address);
      setCity(initialInvoice.client.city);
      setState(initialInvoice.client.state);
      setCountry(initialInvoice.client.country);
      setPinCode(initialInvoice.client.pinCode);

      setServices(initialInvoice.services);
      setDiscountType(initialInvoice.discountType);
      setDiscountValue(initialInvoice.discountValue);
      setAdvanceReceived(initialInvoice.advanceReceived);
      setPaymentMode(initialInvoice.paymentMode);
      setNotes(initialInvoice.notes);
      setTerms(initialInvoice.termsAndConditions);
      setShowPaymentInfoInPrint(initialInvoice.bankDetails?.showPaymentInfoInPrint ?? true);
    } else {
      setInvoiceNumber(generateInvoiceNumber(existingInvoices, settings.invoicePrefix));
    }
  }, [initialInvoice, existingInvoices, settings]);

  // Select Client Autocomplete Handler
  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId);
    const target = clients.find((c) => c.id === clientId);
    if (target) {
      setClientName(target.name);
      setBusinessName(target.businessName);
      setGstNumber(target.gstNumber);
      setEmail(target.email);
      setPhone(target.phone);
      setAddress(target.address);
      setCity(target.city);
      setState(target.state);
      setCountry(target.country);
      setPinCode(target.pinCode);
      onToast('info', 'Client Auto-Filled', `Populated details for ${target.businessName || target.name}`);
    }
  };

  // Service Row Actions
  const handleAddService = () => {
    const newItem: ServiceItem = {
      id: `srv-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      serviceName: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      gstPercentage: settings.defaultGstPercentage || 18,
      amount: 0,
    };
    setServices([...services, newItem]);
  };

  const handleDuplicateService = (index: number) => {
    const source = services[index];
    const duplicated: ServiceItem = {
      ...source,
      id: `srv-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      serviceName: `${source.serviceName} (Copy)`,
    };
    const next = [...services];
    next.splice(index + 1, 0, duplicated);
    setServices(next);
  };

  const handleDeleteService = (index: number) => {
    if (services.length === 1) {
      onToast('error', 'Cannot Remove', 'At least one service is required.');
      return;
    }
    setServices(services.filter((_, i) => i !== index));
  };

  const handleServiceChange = (index: number, field: keyof ServiceItem, value: any) => {
    const next = [...services];
    const item = { ...next[index], [field]: value };

    // Auto-recalculate line item amount
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    const itemDisc = Number(item.discount) || 0;
    const gstPct = Number(item.gstPercentage) || 0;

    const basePriceAfterDiscount = Math.max(0, price - itemDisc);
    const itemSubtotal = basePriceAfterDiscount * qty;
    const itemGst = (itemSubtotal * gstPct) / 100;
    item.amount = Math.round((itemSubtotal + itemGst) * 100) / 100;

    next[index] = item;
    setServices(next);
  };

  // Template Quick Select
  const handleApplyTemplate = (index: number, templateId: string) => {
    const tmpl = SERVICE_TEMPLATES.find((t) => t.id === templateId);
    if (!tmpl) return;

    handleServiceChange(index, 'serviceName', tmpl.name);
    handleServiceChange(index, 'description', tmpl.description);
    handleServiceChange(index, 'unitPrice', tmpl.suggestedPrice);
    handleServiceChange(index, 'gstPercentage', tmpl.defaultGst);
  };

  // Financial Calculations Engine
  const calculations = useMemo(() => {
    let rawSubtotal = 0;
    let itemDiscounts = 0;
    let gstTotal = 0;

    services.forEach((s) => {
      const qty = Number(s.quantity) || 0;
      const price = Number(s.unitPrice) || 0;
      const disc = Number(s.discount) || 0;
      const gstPct = Number(s.gstPercentage) || 0;

      const base = price * qty;
      const discAmt = disc * qty;
      const netBase = Math.max(0, base - discAmt);
      const gst = (netBase * gstPct) / 100;

      rawSubtotal += base;
      itemDiscounts += discAmt;
      gstTotal += gst;
    });

    let globalDiscount = 0;
    if (discountType === 'percentage') {
      globalDiscount = (rawSubtotal * (Number(discountValue) || 0)) / 100;
    } else {
      globalDiscount = Number(discountValue) || 0;
    }

    const totalDiscount = itemDiscounts + globalDiscount;
    const netSubtotal = Math.max(0, rawSubtotal - globalDiscount);
    const unroundedGrand = netSubtotal + gstTotal;
    const grandTotal = Math.round(unroundedGrand);
    const roundOff = Math.round((grandTotal - unroundedGrand) * 100) / 100;
    const remainingBalance = Math.max(0, grandTotal - (Number(advanceReceived) || 0));

    return {
      subtotal: rawSubtotal,
      discountTotal: totalDiscount,
      gstTotal,
      roundOff,
      grandTotal,
      remainingBalance,
    };
  }, [services, discountType, discountValue, advanceReceived]);

  // Handle Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!invoiceNumber.trim()) {
      onToast('error', 'Validation Error', 'Invoice Number is required.');
      return;
    }

    if (!clientName.trim() && !businessName.trim()) {
      onToast('error', 'Validation Error', 'Please enter Client Name or Business Name.');
      return;
    }

    if (services.length === 0 || !services[0].serviceName) {
      onToast('error', 'Validation Error', 'Please add at least one valid service item.');
      return;
    }

    // Check Duplicate Invoice Number if creating new
    if (!initialInvoice) {
      const isDuplicate = existingInvoices.some(
        (inv) => inv.invoiceNumber.toLowerCase() === invoiceNumber.trim().toLowerCase()
      );
      if (isDuplicate) {
        onToast('error', 'Duplicate Number', `Invoice number ${invoiceNumber} already exists!`);
        return;
      }
    }

    const clientObj: Client = {
      id: selectedClientId || `cli-${Date.now()}`,
      name: clientName,
      businessName: businessName,
      email: email,
      phone: phone,
      gstNumber: gstNumber,
      address: address,
      city: city,
      state: state,
      country: country,
      pinCode: pinCode,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    const invoiceObj: Invoice = {
      id: initialInvoice ? initialInvoice.id : `inv-${Date.now()}`,
      invoiceNumber: invoiceNumber.trim(),
      date,
      dueDate,
      status,
      currency,
      currencySymbol,
      client: clientObj,
      services,
      subtotal: calculations.subtotal,
      discountType,
      discountValue: Number(discountValue) || 0,
      discountTotal: calculations.discountTotal,
      gstTotal: calculations.gstTotal,
      roundOff: calculations.roundOff,
      grandTotal: calculations.grandTotal,
      advanceReceived: Number(advanceReceived) || 0,
      remainingBalance: calculations.remainingBalance,
      paymentMode,
      bankDetails: {
        bankName: settings.bankName,
        accountHolder: settings.accountHolder,
        accountNumber: settings.accountNumber,
        ifsc: settings.ifsc,
        upiId: settings.upiId,
        showPaymentInfoInPrint,
      },
      notes,
      termsAndConditions: terms,
      createdAt: initialInvoice ? initialInvoice.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'Aarez Syed',
    };

    onSaveInvoice(invoiceObj, saveClientToDatabase ? clientObj : undefined);
    onToast(
      'success',
      initialInvoice ? 'Invoice Updated' : 'Invoice Created',
      `Invoice ${invoiceObj.invoiceNumber} saved successfully.`
    );
  };

  const constructCurrentInvoiceForPreview = (): Invoice => ({
    id: initialInvoice ? initialInvoice.id : 'preview-temp',
    invoiceNumber: invoiceNumber || 'ARWS-2026-PREVIEW',
    date,
    dueDate,
    status,
    currency,
    currencySymbol,
    client: {
      id: 'temp',
      name: clientName || 'Client Name',
      businessName: businessName || 'Business Name',
      email: email || 'client@example.com',
      phone: phone || '+91 9876543210',
      gstNumber: gstNumber || '27XXXXX0000X1Z0',
      address: address || '123 Business Park',
      city: city || 'Mumbai',
      state: state || 'Maharashtra',
      country: country || 'India',
      pinCode: pinCode || '400001',
      createdAt: new Date().toISOString(),
    },
    services,
    subtotal: calculations.subtotal,
    discountType,
    discountValue: Number(discountValue) || 0,
    discountTotal: calculations.discountTotal,
    gstTotal: calculations.gstTotal,
    roundOff: calculations.roundOff,
    grandTotal: calculations.grandTotal,
    advanceReceived: Number(advanceReceived) || 0,
    remainingBalance: calculations.remainingBalance,
    paymentMode,
    bankDetails: {
      bankName: settings.bankName,
      accountHolder: settings.accountHolder,
      accountNumber: settings.accountNumber,
      ifsc: settings.ifsc,
      upiId: settings.upiId,
      showPaymentInfoInPrint,
    },
    notes,
    termsAndConditions: terms,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'Aarez Syed',
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fadeIn">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-xl bg-gray-100 dark:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 dark:text-white">
              {initialInvoice ? `Edit Invoice (${initialInvoice.invoiceNumber})` : 'Create New Invoice'}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              AR Web Solutions Invoice & Billing Generator
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onPreview(constructCurrentInvoiceForPreview())}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-800 dark:text-gray-200 font-bold text-xs rounded-xl transition-all"
          >
            <Eye className="w-4 h-4 text-red-600" />
            <span>Live Preview</span>
          </button>

          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-500/25 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Invoice</span>
          </button>
        </div>
      </div>

      {/* Basic Metadata Grid */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-red-600" /> Invoice Metadata
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Invoice Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-mono font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden"
              placeholder="ARWS-2026-001"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Invoice Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Payment Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as InvoiceStatus)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden"
            >
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
        </div>
      </div>

      {/* Client Information Section */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-red-600" /> Client Details
          </h3>

          {/* Autocomplete Existing Clients Dropdown */}
          <div className="flex items-center gap-2 min-w-[240px]">
            <select
              value={selectedClientId}
              onChange={(e) => handleClientSelect(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/30 text-xs font-semibold text-red-700 dark:text-red-300 outline-hidden"
            >
              <option value="">⚡ Select Existing Client (Auto-fill)</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.businessName || c.name} ({c.phone})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Client Contact Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden"
              placeholder="e.g. Vikramaditya Sharma"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Business / Company Name
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden"
              placeholder="e.g. Apex Logistics & Freight"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              GST Number
            </label>
            <input
              type="text"
              value={gstNumber}
              onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-mono text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden"
              placeholder="27AAACA1234F1Z8"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden"
              placeholder="client@company.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden"
              placeholder="+91 9820011223"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              PIN Code
            </label>
            <input
              type="text"
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden"
              placeholder="400093"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden"
              placeholder="Plot 42, MIDC Industrial Area, Andheri East"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden"
                placeholder="Mumbai"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                State
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden"
                placeholder="Maharashtra"
              />
            </div>
          </div>
        </div>

        <div className="pt-2 flex items-center gap-2">
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={saveClientToDatabase}
              onChange={(e) => setSaveClientToDatabase(e.target.checked)}
              className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
            />
            <span>Save or update this client in database for future invoices</span>
          </label>
        </div>
      </div>

      {/* Services Table Section */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              Services & Line Items
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Select pre-defined service templates or add custom items
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddService}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Service Row</span>
          </button>
        </div>

        {/* Editable Services Grid */}
        <div className="space-y-4">
          {services.map((item, idx) => (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40 space-y-3 relative transition-all"
            >
              {/* Row Header & Template Picker */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-xs font-extrabold text-red-600 dark:text-red-400">
                  Item #{idx + 1}
                </span>

                <div className="flex items-center gap-2">
                  <select
                    onChange={(e) => handleApplyTemplate(idx, e.target.value)}
                    className="px-2.5 py-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-[11px] font-medium text-gray-800 dark:text-gray-200 focus:ring-1 focus:ring-red-500 outline-hidden"
                  >
                    <option value="">✨ Choose Service Template...</option>
                    {SERVICE_TEMPLATES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} (₹{t.suggestedPrice.toLocaleString()})
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => handleDuplicateService(idx)}
                    className="p-1.5 text-gray-500 hover:text-gray-800 dark:hover:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                    title="Duplicate Service"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteService(idx)}
                    className="p-1.5 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50"
                    title="Delete Service"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Service Input Fields */}
              <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Service Name
                  </label>
                  <input
                    type="text"
                    value={item.serviceName}
                    onChange={(e) => handleServiceChange(idx, 'serviceName', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden"
                    placeholder="e.g. E-Commerce Development"
                    required
                  />
                </div>

                <div className="md:col-span-4">
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Detailed Description
                  </label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleServiceChange(idx, 'description', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden"
                    placeholder="Includes Razorpay integration, shopping cart, admin panel"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleServiceChange(idx, 'quantity', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Unit Price ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={item.unitPrice}
                    onChange={(e) => handleServiceChange(idx, 'unitPrice', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Item Discount ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={item.discount}
                    onChange={(e) => handleServiceChange(idx, 'discount', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    GST Rate (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="28"
                    value={item.gstPercentage}
                    onChange={(e) => handleServiceChange(idx, 'gstPercentage', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden"
                  />
                </div>

                <div className="md:col-span-2 flex flex-col justify-end">
                  <div className="px-3 py-1.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-right">
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 block">Row Total</span>
                    <span className="text-xs font-extrabold text-gray-900 dark:text-white">
                      {formatCurrency(item.amount, currencySymbol)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Calculations & Discounts Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Payment Method & Payment Advance */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
            Payment Method & Advance
          </h3>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Payment Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Bank Transfer', 'UPI', 'Cash', 'Cheque', 'Online'] as PaymentMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPaymentMode(mode)}
                  className={`py-2 px-2 text-xs font-bold rounded-xl border text-center transition-all ${
                    paymentMode === mode
                      ? 'bg-red-600 text-white border-red-600 shadow-md'
                      : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Advance Payment Received ({currencySymbol})
            </label>
            <input
              type="number"
              min="0"
              value={advanceReceived}
              onChange={(e) => setAdvanceReceived(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden"
              placeholder="e.g. 10000"
            />
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={showPaymentInfoInPrint}
                onChange={(e) => setShowPaymentInfoInPrint(e.target.checked)}
                className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
              />
              <span>Display Bank Transfer & UPI QR code on printed invoice</span>
            </label>
          </div>
        </div>

        {/* Right: Instant Calculation Breakdown Box */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white pb-2 border-b border-gray-100 dark:border-gray-800">
            Grand Total Summary
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Subtotal:</span>
              <span className="font-bold text-gray-900 dark:text-white">
                {formatCurrency(calculations.subtotal, currencySymbol)}
              </span>
            </div>

            {/* Additional Global Discount Input */}
            <div className="flex items-center justify-between gap-2 py-1">
              <span className="text-gray-600 dark:text-gray-400">Additional Discount:</span>
              <div className="flex items-center gap-1.5">
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as any)}
                  className="px-2 py-1 rounded-lg border text-xs bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
                >
                  <option value="fixed">Fixed ({currencySymbol})</option>
                  <option value="percentage">%</option>
                </select>
                <input
                  type="number"
                  min="0"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                  className="w-20 px-2 py-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-bold text-right"
                />
              </div>
            </div>

            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>GST Total ({settings.defaultGstPercentage}%):</span>
              <span className="font-bold text-gray-900 dark:text-white">
                {formatCurrency(calculations.gstTotal, currencySymbol)}
              </span>
            </div>

            {calculations.roundOff !== 0 && (
              <div className="flex justify-between text-gray-500">
                <span>Round Off:</span>
                <span>{formatCurrency(calculations.roundOff, currencySymbol)}</span>
              </div>
            )}

            <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <span className="text-sm font-black text-red-600 dark:text-red-400">
                Grand Total:
              </span>
              <span className="text-xl font-black text-red-600 dark:text-red-400">
                {formatCurrency(calculations.grandTotal, currencySymbol)}
              </span>
            </div>

            <div className="pt-2 flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
              <span>Advance Paid:</span>
              <span>-{formatCurrency(advanceReceived, currencySymbol)}</span>
            </div>

            <div className="p-3 bg-red-50 dark:bg-red-950/50 rounded-xl border border-red-200 dark:border-red-900 flex justify-between items-center text-red-700 dark:text-red-300 font-bold">
              <span>Remaining Balance:</span>
              <span className="text-lg font-black">
                {formatCurrency(calculations.remainingBalance, currencySymbol)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes & Terms Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
          <label className="block text-xs font-bold text-gray-900 dark:text-white mb-2">
            Invoice Notes / Thank You Message
          </label>
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden"
          />
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
          <label className="block text-xs font-bold text-gray-900 dark:text-white mb-2">
            Terms & Conditions
          </label>
          <textarea
            rows={4}
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden"
          />
        </div>
      </div>
    </form>
  );
};
