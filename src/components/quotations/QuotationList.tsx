import React, { useState } from 'react';
import { Quotation, UserRole, CompanySettings, Client, ServiceItem, Invoice } from '../../types';
import { formatCurrency, formatDate, downloadElementAsPDF, numberToWordsINR } from '../../lib/utils';
import {
  Plus,
  Search,
  Eye,
  Trash2,
  ArrowRightLeft,
  Download,
  Printer,
  X,
  Building2,
  Phone,
  Mail,
  Globe,
  Share2,
} from 'lucide-react';

interface QuotationListProps {
  quotations: Quotation[];
  invoices: Invoice[];
  clients: Client[];
  settings: CompanySettings;
  userRole: UserRole;
  onNewQuotation: () => void;
  onConvertQuotationToInvoice: (quotation: Quotation) => void;
  onDeleteQuotation: (id: string) => void;
  onToast: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
}

export const QuotationList: React.FC<QuotationListProps> = ({
  quotations,
  invoices,
  clients,
  settings,
  userRole,
  onNewQuotation,
  onConvertQuotationToInvoice,
  onDeleteQuotation,
  onToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [downloading, setDownloading] = useState(false);

  const filteredQuotations = quotations.filter(
    (q) =>
      q.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.client.businessName && q.client.businessName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDownloadQuotationPDF = async (qt: Quotation) => {
    setDownloading(true);
    const filename = `Quotation_${qt.quotationNumber}_${(qt.client.businessName || qt.client.name).replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    const success = await downloadElementAsPDF('quotation-printable-a4', filename);
    setDownloading(false);

    if (success) {
      onToast('success', 'Quotation PDF Saved', `Saved PDF for ${qt.quotationNumber}.`);
    } else {
      onToast('info', 'Opening Print Preview', 'Use "Save as PDF" in the print menu.');
      window.print();
    }
  };

  const handleWhatsAppQuotationShare = (qt: Quotation) => {
    const cleanPhone = qt.client.phone.replace(/[^0-9]/g, '');
    const message = `Dear ${qt.client.name},\n\nPlease find project quotation proposal ${qt.quotationNumber} from AR Web Solutions.\nTotal Estimated Amount: ${formatCurrency(qt.grandTotal, qt.currencySymbol)}\nValid Until: ${formatDate(qt.validUntil)}\n\nThank you for choosing AR Web Solutions!\nWebsite: ${settings.website}`;
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    onToast('info', 'WhatsApp Opened', 'Sharing quotation with client.');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Quotations & Estimates
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Generate client project proposals and convert them to invoices in 1 click
          </p>
        </div>

        <button
          onClick={onNewQuotation}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-500/25 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Quotation</span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search quotation number or client..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-800 text-[11px] font-extrabold uppercase text-gray-500 dark:text-gray-400 tracking-wider">
                <th className="py-3.5 px-4">Quotation #</th>
                <th className="py-3.5 px-4">Client</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Valid Until</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Grand Total</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs text-gray-800 dark:text-gray-200">
              {filteredQuotations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500 dark:text-gray-400">
                    No quotations found.
                  </td>
                </tr>
              ) : (
                filteredQuotations.map((qt) => (
                  <tr key={qt.id} className="hover:bg-red-50/30 dark:hover:bg-red-950/20 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-red-600 dark:text-red-400">
                      {qt.quotationNumber}
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-gray-900 dark:text-white">
                        {qt.client.businessName || qt.client.name}
                      </p>
                      {qt.client.businessName && (
                        <p className="text-[10px] text-gray-500">{qt.client.name}</p>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-medium">{formatDate(qt.date)}</td>
                    <td className="py-3.5 px-4 font-medium text-gray-500">{formatDate(qt.validUntil)}</td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          qt.status === 'Converted'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : qt.status === 'Approved'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        ● {qt.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-extrabold text-gray-900 dark:text-white">
                      {formatCurrency(qt.grandTotal, qt.currencySymbol)}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedQuotation(qt)}
                          className="p-1.5 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                          title="View / Print Quotation"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {qt.status !== 'Converted' && (
                          <button
                            onClick={() => onConvertQuotationToInvoice(qt)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] rounded-lg shadow-xs transition-all"
                            title="Convert Quotation to Invoice"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                            <span>Convert to Invoice</span>
                          </button>
                        )}

                        {userRole === 'Admin' && (
                          <button
                            onClick={() => onDeleteQuotation(qt.id)}
                            className="p-1.5 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50"
                            title="Delete Quotation"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quotation Preview Modal */}
      {selectedQuotation && (
        <div className="fixed inset-0 z-50 flex flex-col bg-gray-900/80 backdrop-blur-md overflow-y-auto p-2 sm:p-6 animate-fadeIn">
          {/* Top Action Bar */}
          <div className="max-w-4xl w-full mx-auto mb-4 bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
            <span className="font-extrabold text-sm text-gray-900 dark:text-white">
              Quotation Preview ({selectedQuotation.quotationNumber})
            </span>

            <div className="flex items-center flex-wrap gap-2">
              <button
                onClick={() => handleDownloadQuotationPDF(selectedQuotation)}
                disabled={downloading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                <Download className="w-4 h-4" />
                <span>{downloading ? 'Generating...' : 'Download PDF'}</span>
              </button>

              <button
                onClick={() => {
                  window.focus();
                  window.print();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 dark:bg-gray-700 hover:bg-black text-white font-semibold text-xs rounded-xl shadow-md transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </button>

              <button
                onClick={() => handleWhatsAppQuotationShare(selectedQuotation)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">WhatsApp</span>
              </button>

              <button
                onClick={() => setSelectedQuotation(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-xl bg-gray-100 dark:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Printable Sheet */}
          <div className="flex-1 flex justify-center pb-12">
            <div
              id="quotation-printable-a4"
              className="w-full max-w-[210mm] bg-white text-gray-900 p-8 sm:p-12 shadow-2xl rounded-none sm:rounded-xl relative flex flex-col justify-between font-sans leading-relaxed border border-gray-200"
            >
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-600 via-red-500 to-black" />

              <div>
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-gray-200 pb-6 mb-6">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3 mb-2">
                      {settings.logoUrl ? (
                        <img src={settings.logoUrl} alt={settings.companyName} className="h-12 object-contain" />
                      ) : (
                        <div className="w-10 h-10 bg-red-600 text-white rounded-xl font-black text-lg flex items-center justify-center shadow-md">
                          AR
                        </div>
                      )}
                      <div>
                        <h1 className="text-2xl font-black tracking-tight text-gray-900">
                          {settings.companyName}
                        </h1>
                        <p className="text-xs font-bold text-red-600">{settings.tagline}</p>
                      </div>
                    </div>
                  </div>

                  <div className="text-left sm:text-right space-y-2 bg-gray-50 p-4 rounded-xl border border-gray-100 min-w-[220px]">
                    <div className="inline-block px-3 py-1 bg-red-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-md mb-1">
                      PROJECT QUOTATION
                    </div>
                    <h2 className="text-xl font-black text-gray-900 tracking-tight">
                      {selectedQuotation.quotationNumber}
                    </h2>
                    <div className="text-xs text-gray-600 space-y-1 pt-1 border-t border-gray-200">
                      <p><span className="font-semibold text-gray-800">Date:</span> {formatDate(selectedQuotation.date)}</p>
                      <p><span className="font-semibold text-gray-800">Valid Until:</span> {formatDate(selectedQuotation.validUntil)}</p>
                    </div>
                  </div>
                </div>

                {/* Client Box */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50 p-5 rounded-2xl border border-gray-200 mb-6">
                  <div>
                    <p className="text-[11px] font-bold text-red-600 uppercase tracking-wider mb-1">Prepared For</p>
                    <h3 className="text-base font-extrabold text-gray-900">
                      {selectedQuotation.client.businessName || selectedQuotation.client.name}
                    </h3>
                  </div>
                  <div className="sm:text-right text-xs text-gray-600 flex flex-col justify-end">
                    <p><span className="font-semibold text-gray-800">Email:</span> {selectedQuotation.client.email}</p>
                    <p><span className="font-semibold text-gray-800">Phone:</span> {selectedQuotation.client.phone}</p>
                  </div>
                </div>

                {/* Services Table */}
                <div className="overflow-x-auto mb-6">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-900 text-white text-[11px] font-bold uppercase tracking-wider">
                        <th className="py-3 px-3 rounded-l-lg">#</th>
                        <th className="py-3 px-3">Service / Deliverable</th>
                        <th className="py-3 px-2 text-center">Qty</th>
                        <th className="py-3 px-3 text-right">Unit Price</th>
                        <th className="py-3 px-3 text-right rounded-r-lg">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-xs text-gray-800">
                      {selectedQuotation.services.map((item, idx) => (
                        <tr key={item.id || idx}>
                          <td className="py-3 px-3 font-semibold text-gray-500">{idx + 1}</td>
                          <td className="py-3 px-3">
                            <p className="font-bold text-gray-900">{item.serviceName}</p>
                            {item.description && <p className="text-[11px] text-gray-600">{item.description}</p>}
                          </td>
                          <td className="py-3 px-2 text-center">{item.quantity}</td>
                          <td className="py-3 px-3 text-right">{formatCurrency(item.unitPrice, selectedQuotation.currencySymbol)}</td>
                          <td className="py-3 px-3 text-right font-bold text-gray-900">{formatCurrency(item.amount, selectedQuotation.currencySymbol)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Total */}
                <div className="flex justify-end mb-6">
                  <div className="w-full sm:w-80 bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2 text-xs">
                    <div className="flex justify-between font-black text-sm text-gray-900">
                      <span className="text-red-600">Estimated Total:</span>
                      <span className="text-base text-red-600">{formatCurrency(selectedQuotation.grandTotal, selectedQuotation.currencySymbol)}</span>
                    </div>
                  </div>
                </div>

                {selectedQuotation.notes && (
                  <div className="text-xs text-gray-600 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <p className="font-bold text-gray-900 mb-1">Proposal Scope & Notes:</p>
                    <p className="whitespace-pre-line text-[11px]">{selectedQuotation.notes}</p>
                  </div>
                )}
              </div>

              {/* Signature */}
              <div className="mt-8 border-t border-gray-200 pt-4 flex flex-col sm:flex-row items-end justify-between gap-4">
                <div className="text-[10px] text-gray-400">
                  <p className="font-semibold text-gray-700">AR Web Solutions • Official Quotation Proposal</p>
                </div>
                <div className="text-center sm:text-right">
                  <p className="text-xs font-bold text-gray-900 mt-1">Authorized Signatory</p>
                  <p className="text-[10px] text-gray-500">AR Web Solutions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
