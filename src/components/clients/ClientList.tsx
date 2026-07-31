import React, { useState } from 'react';
import { Client, Invoice } from '../../types';
import { formatCurrency, formatDate } from '../../lib/utils';
import {
  Users,
  Plus,
  Search,
  Building2,
  Mail,
  Phone,
  FileText,
  Edit,
  Trash2,
  ExternalLink,
} from 'lucide-react';

interface ClientListProps {
  clients: Client[];
  invoices: Invoice[];
  onAddClient: () => void;
  onEditClient: (client: Client) => void;
  onDeleteClient: (id: string) => void;
  onToast: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
}

export const ClientList: React.FC<ClientListProps> = ({
  clients,
  invoices,
  onAddClient,
  onEditClient,
  onDeleteClient,
  onToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Calculate client metrics
  const clientMetrics = clients.map((client) => {
    const clientInvoices = invoices.filter(
      (inv) =>
        inv.client.id === client.id ||
        (inv.client.email && inv.client.email.toLowerCase() === client.email.toLowerCase()) ||
        (inv.client.phone && inv.client.phone === client.phone)
    );

    const totalBusiness = clientInvoices.reduce((acc, inv) => acc + inv.grandTotal, 0);
    const outstanding = clientInvoices.reduce((acc, inv) => acc + inv.remainingBalance, 0);

    return {
      ...client,
      invoicesCount: clientInvoices.length,
      totalBusiness,
      outstanding,
    };
  });

  const filtered = clientMetrics.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.businessName && c.businessName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      c.phone.includes(searchTerm) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Client Directory
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Manage client profiles, GST numbers, and business metrics
          </p>
        </div>

        <button
          onClick={onAddClient}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-500/25 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Client</span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by client name, business, email, phone..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-hidden"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((client) => (
          <div
            key={client.id}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative group"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 rounded-xl font-bold text-sm flex items-center justify-center shrink-0">
                    {client.businessName ? client.businessName.slice(0, 2).toUpperCase() : client.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-gray-900 dark:text-white leading-tight">
                      {client.businessName || client.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{client.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onEditClient(client)}
                    className="p-1.5 text-gray-400 hover:text-gray-800 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    title="Edit Client"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteClient(client.id)}
                    className="p-1.5 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50"
                    title="Delete Client"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300 pt-1">
                <p className="flex items-center gap-2 truncate">
                  <Mail className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <a href={`mailto:${client.email}`} className="hover:underline truncate">
                    {client.email}
                  </a>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span>{client.phone}</span>
                </p>
              </div>
            </div>

            {/* Financial Metrics Summary Banner */}
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs">
              <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <span className="text-[10px] text-gray-400 font-medium block">Total Business</span>
                <span className="font-black text-gray-900 dark:text-white">
                  {formatCurrency(client.totalBusiness, '₹')}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-red-50/50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40">
                <span className="text-[10px] text-red-500 font-medium block">Outstanding</span>
                <span className="font-black text-red-600 dark:text-red-400">
                  {formatCurrency(client.outstanding, '₹')}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
