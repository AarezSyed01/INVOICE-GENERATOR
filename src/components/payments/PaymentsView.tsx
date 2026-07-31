import React, { useState } from 'react';
import { Invoice, CompanySettings } from '../../types';
import { formatCurrency, formatDate, downloadElementAsPDF, numberToWordsINR } from '../../lib/utils';
import { CreditCard, CheckCircle2, Download, Printer, Search, X, Building2, Phone, Mail, Globe, Share2 } from 'lucide-react';

interface PaymentsViewProps {
  invoices: Invoice[];
  settings: CompanySettings;
  onToast: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({ invoices, settings, onToast }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReceiptInvoice, setSelectedReceiptInvoice] = useState<Invoice | null>(null);
  const [downloading, setDownloading] = useState(false);

  const paidOrPartialInvoices = invoices.filter(
    (inv) =>
      (inv.status === 'Paid' || inv.status === 'Partially Paid' || inv.advanceReceived > 0) &&
      (inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inv.client.businessName && inv.client.businessName.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const handleDownloadReceiptPDF = async (inv: Invoice) => {
    setDownloading(true);
    const filename = `Receipt_RCPT-${inv.invoiceNumber}_${(inv.client.businessName || inv.client.name).replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    const success = await downloadElementAsPDF('receipt-printable-a4', filename);
    setDownloading(false);

    if (success) {
      onToast('success', 'Receipt PDF Saved', `Saved receipt voucher for invoice ${inv.invoiceNumber}.`);
    } else {
      onToast('info', 'Opening Print Preview', 'Use "Save as PDF" option in the print dialog.');
      window.print();
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Payment Receipts & Ledger
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Payment voucher generation and advance collection tracker
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search payments by invoice # or client..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-800 text-[11px] font-extrabold uppercase text-gray-500 dark:text-gray-400 tracking-wider">
                <th className="py-3.5 px-4">Receipt # / Invoice #</th>
                <th className="py-3.5 px-4">Client</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Payment Mode</th>
                <th className="py-3.5 px-4 text-right">Amount Received</th>
                <th className="py-3.5 px-4 text-right">Balance Due</th>
                <th className="py-3.5 px-4 text-center">Receipt Voucher</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs text-gray-800 dark:text-gray-200">
              {paidOrPartialInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500 dark:text-gray-400">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                paidOrPartialInvoices.map((inv) => {
                  const collected = inv.status === 'Paid' ? inv.grandTotal : inv.advanceReceived;
                  return (
                    <tr key={inv.id} className="hover:bg-red-50/20 dark:hover:bg-red-950/20 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-red-600 dark:text-red-400">
                        RCPT-{inv.invoiceNumber}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white">
                        {inv.client.businessName || inv.client.name}
                      </td>

                      <td className="py-3.5 px-4 font-medium">{formatDate(inv.date)}</td>

                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                          {inv.paymentMode}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-extrabold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(collected, inv.currencySymbol)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-red-600 dark:text-red-400">
                        {formatCurrency(inv.remainingBalance, inv.currencySymbol)}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setSelectedReceiptInvoice(inv)}
                          className="flex items-center gap-1 mx-auto px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] rounded-lg shadow-xs transition-all cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>View Receipt</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Receipt Modal Preview */}
      {selectedReceiptInvoice && (
        <div className="fixed inset-0 z-50 flex flex-col bg-gray-900/80 backdrop-blur-md overflow-y-auto p-2 sm:p-6 animate-fadeIn">
          {/* Top Bar */}
          <div className="max-w-3xl w-full mx-auto mb-4 bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 flex items-center justify-between gap-3 shrink-0 print:hidden">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span className="font-extrabold text-sm text-gray-900 dark:text-white">
                Payment Voucher (RCPT-{selectedReceiptInvoice.invoiceNumber})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDownloadReceiptPDF(selectedReceiptInvoice)}
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
                onClick={() => setSelectedReceiptInvoice(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-xl bg-gray-100 dark:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* A4 Printable Receipt Voucher Sheet */}
          <div className="flex-1 flex justify-center pb-12">
            <div
              id="receipt-printable-a4"
              className="w-full max-w-[210mm] bg-white text-gray-900 p-8 sm:p-12 shadow-2xl rounded-none sm:rounded-xl relative flex flex-col justify-between font-sans leading-relaxed border border-gray-200"
            >
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-600 via-emerald-500 to-black" />

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

                  <div className="text-left sm:text-right space-y-2 bg-emerald-50 p-4 rounded-xl border border-emerald-100 min-w-[220px]">
                    <div className="inline-block px-3 py-1 bg-emerald-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-md mb-1">
                      PAYMENT RECEIPT
                    </div>
                    <h2 className="text-lg font-black text-gray-900 tracking-tight">
                      RCPT-{selectedReceiptInvoice.invoiceNumber}
                    </h2>
                    <p className="text-xs text-gray-600"><span className="font-semibold text-gray-800">Date:</span> {formatDate(selectedReceiptInvoice.date)}</p>
                  </div>
                </div>

                {/* Receipt Info Body */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-200 mb-6">
                  <div>
                    <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider mb-1">Received From (Client)</p>
                    <h3 className="text-base font-black text-gray-900">
                      {selectedReceiptInvoice.client.businessName || selectedReceiptInvoice.client.name}
                    </h3>
                    {selectedReceiptInvoice.client.businessName && (
                      <p className="text-xs font-semibold text-gray-700">Attn: {selectedReceiptInvoice.client.name}</p>
                    )}
                    <p className="text-xs text-gray-600 mt-1">{selectedReceiptInvoice.client.phone} • {selectedReceiptInvoice.client.email}</p>
                  </div>

                  <div className="sm:text-right space-y-1.5 text-xs text-gray-700">
                    <p><span className="font-semibold text-gray-900">For Invoice:</span> {selectedReceiptInvoice.invoiceNumber}</p>
                    <p><span className="font-semibold text-gray-900">Payment Mode:</span> {selectedReceiptInvoice.paymentMode}</p>
                    <p><span className="font-semibold text-gray-900">Transaction Status:</span> Successful / Verified</p>
                  </div>
                </div>

                {/* Amount Table */}
                <div className="border border-gray-200 rounded-xl overflow-hidden mb-6">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-gray-900 text-white font-bold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="py-3 px-4">Description</th>
                        <th className="py-3 px-4 text-right">Total Invoice Amount</th>
                        <th className="py-3 px-4 text-right">Amount Received</th>
                        <th className="py-3 px-4 text-right">Balance Due</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-gray-800 font-semibold">
                      <tr>
                        <td className="py-4 px-4 font-bold text-gray-900">
                          {selectedReceiptInvoice.status === 'Paid' ? 'Full Settlement Payment' : 'Advance Payment Received'}
                        </td>
                        <td className="py-4 px-4 text-right">
                          {formatCurrency(selectedReceiptInvoice.grandTotal, selectedReceiptInvoice.currencySymbol)}
                        </td>
                        <td className="py-4 px-4 text-right font-extrabold text-emerald-600">
                          {formatCurrency(
                            selectedReceiptInvoice.status === 'Paid'
                              ? selectedReceiptInvoice.grandTotal
                              : selectedReceiptInvoice.advanceReceived,
                            selectedReceiptInvoice.currencySymbol
                          )}
                        </td>
                        <td className="py-4 px-4 text-right font-extrabold text-red-600">
                          {formatCurrency(selectedReceiptInvoice.remainingBalance, selectedReceiptInvoice.currencySymbol)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="bg-emerald-50/80 p-4 rounded-xl border border-emerald-200 mb-6">
                  <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-0.5">Amount Received in Words</p>
                  <p className="text-xs font-black text-emerald-950 italic">
                    {numberToWordsINR(
                      selectedReceiptInvoice.status === 'Paid'
                        ? selectedReceiptInvoice.grandTotal
                        : selectedReceiptInvoice.advanceReceived
                    )}
                  </p>
                </div>
              </div>

              {/* Signature */}
              <div className="mt-12 border-t border-gray-200 pt-4 flex flex-col sm:flex-row items-end justify-between gap-4">
                <div className="text-[10px] text-gray-400">
                  <p className="font-semibold text-gray-700">AR Web Solutions • Payment Receipt Voucher</p>
                  <p>Computer generated receipt acknowledgment.</p>
                </div>

                <div className="text-center sm:text-right">
                  {settings.signatureUrl ? (
                    <img src={settings.signatureUrl} alt="Signature" className="h-10 mx-auto sm:ml-auto mb-1 object-contain" />
                  ) : (
                    <div className="h-10 flex items-center justify-center sm:justify-end">
                      <span className="font-serif italic font-bold text-gray-800 text-sm tracking-wide border-b border-gray-400 px-4 py-1">
                        Aarez Syed
                      </span>
                    </div>
                  )}
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
