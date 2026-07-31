import React, { useState, useMemo } from 'react';
import { Invoice, UserRole, CompanySettings } from '../../types';
import { formatCurrency, formatDate, downloadCSV } from '../../lib/utils';
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  Copy,
  Download,
  Receipt,
  Share2,
} from 'lucide-react';

interface InvoiceListProps {
  invoices: Invoice[];
  userRole: UserRole;
  settings: CompanySettings;
  onNewInvoice: () => void;
  onViewInvoice: (invoice: Invoice) => void;
  onEditInvoice: (invoice: Invoice) => void;
  onDuplicateInvoice: (invoice: Invoice) => void;
  onDeleteInvoice: (id: string) => void;
  onToast: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
}

export const InvoiceList: React.FC<InvoiceListProps> = ({
  invoices,
  userRole,
  settings,
  onNewInvoice,
  onViewInvoice,
  onEditInvoice,
  onDuplicateInvoice,
  onDeleteInvoice,
  onToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [timeFilter, setTimeFilter] = useState<string>('All');

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      // Search matches
      const query = searchTerm.toLowerCase();
      const matchesQuery =
        inv.invoiceNumber.toLowerCase().includes(query) ||
        inv.client.name.toLowerCase().includes(query) ||
        (inv.client.businessName && inv.client.businessName.toLowerCase().includes(query)) ||
        inv.client.phone.includes(query) ||
        inv.grandTotal.toString().includes(query);

      // Status filter
      const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;

      // Time filter
      let matchesTime = true;
      const invDate = new Date(inv.date);
      const now = new Date();

      if (timeFilter === 'This Month') {
        matchesTime =
          invDate.getMonth() === now.getMonth() && invDate.getFullYear() === now.getFullYear();
      } else if (timeFilter === 'This Year') {
        matchesTime = invDate.getFullYear() === now.getFullYear();
      }

      return matchesQuery && matchesStatus && matchesTime;
    });
  }, [invoices, searchTerm, statusFilter, timeFilter]);

  // Export CSV
  const handleExportCSV = () => {
    if (!filteredInvoices.length) {
      onToast('info', 'No Data', 'No invoices to export.');
      return;
    }

    const rows = filteredInvoices.map((inv) => ({
      InvoiceNumber: inv.invoiceNumber,
      Date: inv.date,
      DueDate: inv.dueDate,
      ClientName: inv.client.name,
      BusinessName: inv.client.businessName,
      GSTIN: inv.client.gstNumber,
      Status: inv.status,
      GrandTotal: inv.grandTotal,
      AdvanceReceived: inv.advanceReceived,
      RemainingBalance: inv.remainingBalance,
    }));

    downloadCSV(`ARWS_Invoices_Export_${new Date().toISOString().slice(0, 10)}.csv`, rows);
    onToast('success', 'CSV Exported', `Exported ${rows.length} invoices to CSV.`);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Invoices Management
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Total {invoices.length} invoices generated • AR Web Solutions
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold text-xs rounded-xl transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onNewInvoice}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Invoice</span>
          </button>
        </div>
      </div>

      {/* Search & Filtering Bar */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search invoice #, client, phone, amount..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden"
          />
        </div>

        <div className="flex items-center flex-wrap gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            {['All', 'Paid', 'Pending', 'Partially Paid', 'Overdue'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                  statusFilter === st
                    ? 'bg-white dark:bg-gray-700 text-red-600 dark:text-red-400 shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            {['All', 'This Month', 'This Year'].map((tm) => (
              <button
                key={tm}
                onClick={() => setTimeFilter(tm)}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                  timeFilter === tm
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                {tm}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Invoices Data Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-800 text-[11px] font-extrabold uppercase text-gray-500 dark:text-gray-400 tracking-wider">
                <th className="py-3.5 px-4">Invoice #</th>
                <th className="py-3.5 px-4">Client / Business</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Grand Total</th>
                <th className="py-3.5 px-4 text-right">Balance Due</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs text-gray-800 dark:text-gray-200">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500 dark:text-gray-400">
                    No matching invoices found.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-red-50/30 dark:hover:bg-red-950/20 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-red-600 dark:text-red-400">
                      {inv.invoiceNumber}
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-gray-900 dark:text-white">
                        {inv.client.businessName || inv.client.name}
                      </p>
                      {inv.client.businessName && (
                        <p className="text-[10px] text-gray-500">{inv.client.name}</p>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-medium">{formatDate(inv.date)}</td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          inv.status === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : inv.status === 'Partially Paid'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : inv.status === 'Overdue'
                            ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        }`}
                      >
                        ● {inv.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-extrabold text-gray-900 dark:text-white">
                      {formatCurrency(inv.grandTotal, inv.currencySymbol)}
                    </td>

                    <td className="py-3.5 px-4 text-right font-extrabold text-red-600 dark:text-red-400">
                      {formatCurrency(inv.remainingBalance, inv.currencySymbol)}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onViewInvoice(inv)}
                          className="p-1.5 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                          title="View / Print Invoice"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onEditInvoice(inv)}
                          className="p-1.5 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                          title="Edit Invoice"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onDuplicateInvoice(inv)}
                          className="p-1.5 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                          title="Duplicate Invoice"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        {userRole === 'Admin' && (
                          <button
                            onClick={() => onDeleteInvoice(inv.id)}
                            className="p-1.5 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50"
                            title="Delete Invoice (Admin Only)"
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
    </div>
  );
};
