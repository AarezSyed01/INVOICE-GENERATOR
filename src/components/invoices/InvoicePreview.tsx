import React from 'react';
import { Invoice, CompanySettings } from '../../types';
import { formatCurrency, formatDate, numberToWordsINR, downloadElementAsPDF } from '../../lib/utils';
import { QRCodeSVG } from 'qrcode.react';
import {
  Printer,
  Download,
  Share2,
  Mail,
  X,
  Phone,
  Globe,
  CheckCircle,
  Building2,
  FileCheck2,
} from 'lucide-react';

interface InvoicePreviewProps {
  invoice: Invoice;
  settings: CompanySettings;
  onClose: () => void;
  onToast: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({
  invoice,
  settings,
  onClose,
  onToast,
}) => {
  const [downloading, setDownloading] = React.useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    const success = await downloadElementAsPDF(
      'invoice-printable-a4',
      `${invoice.invoiceNumber}_${(invoice.client.businessName || invoice.client.name).replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
    );
    setDownloading(false);
    if (success) {
      onToast('success', 'PDF Downloaded', `Invoice ${invoice.invoiceNumber} saved as PDF.`);
    } else {
      onToast('info', 'Opening Print Preview', 'Use "Save as PDF" option in the print menu.');
      window.print();
    }
  };

  const handleWhatsAppShare = () => {
    const cleanPhone = invoice.client.phone.replace(/[^0-9]/g, '');
    const message = `Dear ${invoice.client.name},\n\nPlease find your invoice ${invoice.invoiceNumber} from AR Web Solutions.\nAmount: ${formatCurrency(invoice.grandTotal, invoice.currencySymbol)}\nBalance Due: ${formatCurrency(invoice.remainingBalance, invoice.currencySymbol)}\nDue Date: ${formatDate(invoice.dueDate)}\n\nThank you for choosing AR Web Solutions!\nWebsite: ${settings.website}`;
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    onToast('info', 'WhatsApp Opened', 'Sharing invoice details with client.');
  };

  const handleEmailShare = () => {
    const subject = `Invoice ${invoice.invoiceNumber} - AR Web Solutions`;
    const body = `Hi ${invoice.client.name},\n\nPlease review your invoice ${invoice.invoiceNumber} from AR Web Solutions.\nTotal Amount: ${formatCurrency(invoice.grandTotal, invoice.currencySymbol)}\nRemaining Balance: ${formatCurrency(invoice.remainingBalance, invoice.currencySymbol)}\nDue Date: ${formatDate(invoice.dueDate)}\n\nPayment Details:\nUPI ID: ${settings.upiId}\nBank: ${settings.bankName} (${settings.accountNumber})\n\nBest regards,\nAR Web Solutions\n${settings.website}`;
    window.open(`mailto:${invoice.client.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  // UPI QR String e.g. upi://pay?pa=info.arwebsolutions@okaxis&pn=AR%20Web%20Solutions&am=43070&cu=INR
  const upiQrString = `upi://pay?pa=${settings.upiId}&pn=${encodeURIComponent(settings.companyName)}&am=${invoice.remainingBalance > 0 ? invoice.remainingBalance : invoice.grandTotal}&cu=INR`;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-900/80 backdrop-blur-md overflow-y-auto p-2 sm:p-6 animate-fadeIn">
      {/* Top Action Bar (hidden in print) */}
      <div className="max-w-4xl w-full mx-auto mb-4 bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
        <div className="flex items-center gap-2">
          <FileCheck2 className="w-5 h-5 text-red-600 dark:text-red-400" />
          <span className="font-extrabold text-sm text-gray-900 dark:text-white">
            Invoice Preview ({invoice.invoiceNumber})
          </span>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Generating PDF...' : 'Download PDF'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 dark:bg-gray-700 hover:bg-black text-white font-semibold text-xs rounded-xl shadow-md transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>

          <button
            onClick={handleWhatsAppShare}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>

          <button
            onClick={handleEmailShare}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all"
          >
            <Mail className="w-4 h-4" />
            <span className="hidden sm:inline">Email</span>
          </button>

          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-xl bg-gray-100 dark:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* A4 Invoice Paper Printable Sheet */}
      <div className="flex-1 flex justify-center pb-12">
        <div
          id="invoice-printable-a4"
          className="w-full max-w-[210mm] min-h-[297mm] bg-white text-gray-900 p-8 sm:p-12 shadow-2xl rounded-none sm:rounded-xl relative flex flex-col justify-between font-sans leading-relaxed border border-gray-200"
        >
          {/* Top Decorative Header Accent */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-600 via-red-500 to-black" />

          <div>
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-gray-200 pb-6 mb-6">
              {/* Company Info */}
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

                <div className="text-xs text-gray-600 space-y-0.5 pt-1">
                  {settings.phones.map((p, idx) => (
                    <p key={idx} className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-red-600 shrink-0" />
                      <span>{p}</span>
                    </p>
                  ))}
                  <p className="flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-red-600 shrink-0" />
                    <span>{settings.email}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Globe className="w-3 h-3 text-red-600 shrink-0" />
                    <span>{settings.website}</span>
                  </p>
                </div>
              </div>

              {/* Invoice Meta Badge Box */}
              <div className="text-left sm:text-right space-y-2 bg-gray-50 p-4 rounded-xl border border-gray-100 min-w-[220px]">
                <div className="inline-block px-3 py-1 bg-red-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-md mb-1">
                  TAX INVOICE
                </div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight">
                  {invoice.invoiceNumber}
                </h2>
                <div className="text-xs text-gray-600 space-y-1 pt-1 border-t border-gray-200">
                  <p><span className="font-semibold text-gray-800">Date:</span> {formatDate(invoice.date)}</p>
                  <p><span className="font-semibold text-gray-800">Due Date:</span> {formatDate(invoice.dueDate)}</p>
                  <div className="pt-1">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        invoice.status === 'Paid'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : invoice.status === 'Partially Paid'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : invoice.status === 'Overdue'
                          ? 'bg-red-100 text-red-800 border border-red-300'
                          : 'bg-blue-100 text-blue-800 border border-blue-300'
                      }`}
                    >
                      ● {invoice.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Client Information Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50/80 p-5 rounded-2xl border border-gray-200 mb-6">
              <div>
                <p className="text-[11px] font-bold text-red-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" /> Billed To (Client)
                </p>
                <h3 className="text-base font-extrabold text-gray-900">
                  {invoice.client.businessName || invoice.client.name}
                </h3>
                {invoice.client.businessName && (
                  <p className="text-xs font-semibold text-gray-700">Attn: {invoice.client.name}</p>
                )}
              </div>

              <div className="sm:text-right space-y-1 text-xs text-gray-600 flex flex-col justify-end">
                <p><span className="font-semibold text-gray-800">Email:</span> {invoice.client.email}</p>
                <p><span className="font-semibold text-gray-800">Phone:</span> {invoice.client.phone}</p>
                {invoice.client.website && (
                  <p><span className="font-semibold text-gray-800">Website:</span> {invoice.client.website}</p>
                )}
              </div>
            </div>

            {/* Services Table */}
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-900 text-white text-[11px] font-bold uppercase tracking-wider">
                    <th className="py-3 px-3 rounded-l-lg">#</th>
                    <th className="py-3 px-3">Service Description</th>
                    <th className="py-3 px-2 text-center">Qty</th>
                    <th className="py-3 px-3 text-right">Unit Price</th>
                    <th className="py-3 px-2 text-right">Discount</th>
                    <th className="py-3 px-2 text-right">GST %</th>
                    <th className="py-3 px-3 text-right rounded-r-lg">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-xs text-gray-800">
                  {invoice.services.map((item, idx) => (
                    <tr key={item.id || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                      <td className="py-3.5 px-3 font-semibold text-gray-500">{idx + 1}</td>
                      <td className="py-3.5 px-3">
                        <p className="font-bold text-gray-900 text-xs">{item.serviceName}</p>
                        {item.description && (
                          <p className="text-[11px] text-gray-600 mt-0.5 leading-snug">{item.description}</p>
                        )}
                      </td>
                      <td className="py-3.5 px-2 text-center font-semibold">{item.quantity}</td>
                      <td className="py-3.5 px-3 text-right font-medium">
                        {formatCurrency(item.unitPrice, invoice.currencySymbol)}
                      </td>
                      <td className="py-3.5 px-2 text-right text-gray-600">
                        {item.discount > 0 ? formatCurrency(item.discount, invoice.currencySymbol) : '-'}
                      </td>
                      <td className="py-3.5 px-2 text-right text-gray-600">{item.gstPercentage}%</td>
                      <td className="py-3.5 px-3 text-right font-bold text-gray-900">
                        {formatCurrency(item.amount, invoice.currencySymbol)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations & Totals Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-t border-gray-200 pt-4 mb-6">
              {/* Left: Amount in Words */}
              <div className="flex-1 space-y-3">
                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                  <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-0.5">
                    Amount in Words
                  </p>
                  <p className="text-xs font-bold text-gray-900 italic">
                    {numberToWordsINR(invoice.grandTotal)}
                  </p>
                </div>

                {/* Notes */}
                {invoice.notes && (
                  <div className="text-xs text-gray-600">
                    <p className="font-bold text-gray-900 mb-1">Notes:</p>
                    <p className="whitespace-pre-line bg-gray-50 p-3 rounded-lg border border-gray-100 text-[11px]">
                      {invoice.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Right: Financial Totals Box */}
              <div className="w-full sm:w-80 bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(invoice.subtotal, invoice.currencySymbol)}</span>
                </div>

                {invoice.discountTotal > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount:</span>
                    <span className="font-semibold">-{formatCurrency(invoice.discountTotal, invoice.currencySymbol)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Total GST ({settings.defaultGstPercentage}%):</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(invoice.gstTotal, invoice.currencySymbol)}</span>
                </div>

                {invoice.roundOff !== 0 && (
                  <div className="flex justify-between text-gray-500 text-[11px]">
                    <span>Round-Off:</span>
                    <span>{formatCurrency(invoice.roundOff, invoice.currencySymbol)}</span>
                  </div>
                )}

                <div className="border-t border-gray-300 pt-2 flex justify-between font-black text-sm text-gray-900">
                  <span className="text-red-600">Grand Total:</span>
                  <span className="text-base text-red-600">{formatCurrency(invoice.grandTotal, invoice.currencySymbol)}</span>
                </div>

                {invoice.advanceReceived > 0 && (
                  <div className="flex justify-between text-emerald-800 font-semibold pt-1 border-t border-dashed border-gray-200">
                    <span>Advance Paid:</span>
                    <span>{formatCurrency(invoice.advanceReceived, invoice.currencySymbol)}</span>
                  </div>
                )}

                <div className="flex justify-between font-bold text-gray-900 pt-1 bg-red-100/60 p-2 rounded-lg border border-red-200 mt-1">
                  <span>Balance Due:</span>
                  <span className="text-red-700">{formatCurrency(invoice.remainingBalance, invoice.currencySymbol)}</span>
                </div>
              </div>
            </div>

            {/* Payment Details & UPI QR Code Section */}
            {invoice.bankDetails?.showPaymentInfoInPrint && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-900 text-white p-4 rounded-xl mb-6">
                <div className="sm:col-span-2 space-y-1.5 text-xs">
                  <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Payment & Bank Transfer Details
                  </p>
                  <p><span className="text-gray-400">Bank Name:</span> <strong className="text-white">{settings.bankName}</strong></p>
                  <p><span className="text-gray-400">Account Name:</span> <strong className="text-white">{settings.accountHolder}</strong></p>
                  <p><span className="text-gray-400">Account No:</span> <strong className="text-white font-mono">{settings.accountNumber}</strong></p>
                  <p><span className="text-gray-400">IFSC Code:</span> <strong className="text-white font-mono">{settings.ifsc}</strong></p>
                  <p><span className="text-gray-400">UPI ID:</span> <strong className="text-red-400 font-mono">{settings.upiId}</strong></p>
                </div>

                {/* QR Code */}
                <div className="flex flex-col items-center justify-center p-2 bg-white rounded-lg text-gray-900 shadow-md">
                  <QRCodeSVG value={upiQrString} size={84} level="M" />
                  <p className="text-[9px] font-extrabold text-red-600 mt-1 text-center">Scan to Pay via UPI</p>
                </div>
              </div>
            )}

            {/* Terms & Conditions */}
            {invoice.termsAndConditions && (
              <div className="text-[10px] text-gray-500 border-t border-gray-200 pt-3">
                <p className="font-bold text-gray-800 uppercase tracking-wider mb-1">Terms & Conditions:</p>
                <p className="whitespace-pre-line leading-relaxed">{invoice.termsAndConditions}</p>
              </div>
            )}
          </div>

          {/* Footer & Authorized Signature */}
          <div className="mt-8 border-t border-gray-200 pt-4 flex flex-col sm:flex-row items-end justify-between gap-4">
            <div className="text-[10px] text-gray-400">
              <p className="font-semibold text-gray-700">AR Web Solutions • We Design • We Develop • We Grow</p>
              <p>This is a computer-generated tax invoice.</p>
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
              <p className="text-[10px] text-gray-500">For AR Web Solutions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
