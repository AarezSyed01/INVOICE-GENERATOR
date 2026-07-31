import React from 'react';
import { Invoice, Client, CompanySettings, UserRole } from '../../types';
import { formatCurrency, formatDate } from '../../lib/utils';
import {
  IndianRupee,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  Users,
  FileSpreadsheet,
  Download,
  ArrowUpRight,
  Eye,
  TrendingUp,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface DashboardViewProps {
  invoices: Invoice[];
  clients: Client[];
  settings: CompanySettings;
  userRole: UserRole;
  onNewInvoice: () => void;
  onNewClient: () => void;
  onNewQuote: () => void;
  onViewInvoice: (invoice: Invoice) => void;
  onNavigateTab: (tab: any) => void;
  onToast: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  invoices,
  clients,
  settings,
  userRole,
  onNewInvoice,
  onNewClient,
  onNewQuote,
  onViewInvoice,
  onNavigateTab,
  onToast,
}) => {
  // KPI Calculations
  const totalRevenue = invoices.reduce((acc, inv) => acc + inv.grandTotal, 0);
  const paidInvoices = invoices.filter((i) => i.status === 'Paid');
  const paidRevenue = paidInvoices.reduce((acc, inv) => acc + inv.grandTotal, 0);
  const pendingInvoices = invoices.filter((i) => i.status === 'Pending' || i.status === 'Partially Paid');
  const pendingRevenue = pendingInvoices.reduce((acc, inv) => acc + inv.remainingBalance, 0);
  const overdueInvoices = invoices.filter((i) => i.status === 'Overdue');
  const overdueRevenue = overdueInvoices.reduce((acc, inv) => acc + inv.remainingBalance, 0);

  // Monthly Revenue Chart Data
  const monthlyData = [
    { month: 'Feb', revenue: 45000, invoices: 2 },
    { month: 'Mar', revenue: 68000, invoices: 3 },
    { month: 'Apr', revenue: 92000, invoices: 4 },
    { month: 'May', revenue: 110000, invoices: 5 },
    { month: 'Jun', revenue: 85000, invoices: 4 },
    { month: 'Jul', revenue: totalRevenue, invoices: invoices.length },
  ];

  // Status Distribution Pie Data
  const statusPieData = [
    { name: 'Paid', value: paidInvoices.length, color: '#10B981' },
    { name: 'Pending', value: pendingInvoices.length, color: '#3B82F6' },
    { name: 'Overdue', value: overdueInvoices.length, color: '#DC2626' },
  ];

  // Top Clients Bar Data
  const topClientsData = clients.slice(0, 4).map((client) => {
    const clientInvoices = invoices.filter((inv) => inv.client.id === client.id);
    const amount = clientInvoices.reduce((acc, inv) => acc + inv.grandTotal, 0);
    return {
      name: client.businessName || client.name,
      amount,
    };
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner & Quick Action Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-gray-900 via-gray-900 to-red-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-red-600 text-white tracking-wide">
              AR Web Solutions
            </span>
            <span className="text-xs text-red-300 font-bold">• Billing Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Dashboard & Analytics
          </h1>
          <p className="text-xs text-gray-300 max-w-xl leading-relaxed">
            We Design • We Develop • We Grow. Real-time revenue analytics and invoice control hub.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center flex-wrap gap-2.5 z-10 shrink-0">
          <button
            onClick={onNewInvoice}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-red-500/30 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Invoice</span>
          </button>

          <button
            onClick={onNewClient}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl backdrop-blur-md transition-all"
          >
            <Users className="w-4 h-4" />
            <span>New Client</span>
          </button>

          <button
            onClick={onNewQuote}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl backdrop-blur-md transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Generate Quote</span>
          </button>

          <button
            onClick={() => onNavigateTab('analytics')}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl backdrop-blur-md transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Reports</span>
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Revenue */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-5 rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Revenue</span>
            <div className="p-2 bg-red-50/80 dark:bg-red-950/80 text-red-600 rounded-xl">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white">
              {formatCurrency(totalRevenue, settings.defaultCurrencySymbol)}
            </h3>
            <p className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +18.4% from last month
            </p>
          </div>
        </div>

        {/* Total Invoices */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-5 rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Invoices</span>
            <div className="p-2 bg-gray-100/80 dark:bg-gray-800/80 text-gray-800 dark:text-gray-200 rounded-xl">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white">
              {invoices.length}
            </h3>
            <p className="text-[10px] text-gray-500 mt-1">Generated invoices</p>
          </div>
        </div>

        {/* Paid Invoices */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-5 rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Paid Invoices</span>
            <div className="p-2 bg-emerald-50/80 dark:bg-emerald-950/80 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white">
              {paidInvoices.length}
            </h3>
            <p className="text-[10px] text-emerald-600 font-semibold mt-1">
              {formatCurrency(paidRevenue, settings.defaultCurrencySymbol)} collected
            </p>
          </div>
        </div>

        {/* Pending Invoices */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-5 rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pending</span>
            <div className="p-2 bg-blue-50/80 dark:bg-blue-950/80 text-blue-600 rounded-xl">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white">
              {pendingInvoices.length}
            </h3>
            <p className="text-[10px] text-blue-600 font-semibold mt-1">
              {formatCurrency(pendingRevenue, settings.defaultCurrencySymbol)} balance
            </p>
          </div>
        </div>

        {/* Overdue Invoices */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-5 rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Overdue</span>
            <div className="p-2 bg-red-50/80 dark:bg-red-950/80 text-red-600 rounded-xl">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-black text-red-600 dark:text-red-400">
              {overdueInvoices.length}
            </h3>
            <p className="text-[10px] text-red-500 font-semibold mt-1">
              {formatCurrency(overdueRevenue, settings.defaultCurrencySymbol)} action needed
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue Area Chart */}
        <div className="lg:col-span-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-6 rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Monthly Revenue Growth
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Revenue trend for AR Web Solutions projects
              </p>
            </div>
            <span className="text-xs font-extrabold text-red-600 bg-red-50 dark:bg-red-950/80 px-2.5 py-1 rounded-lg">
              2026 YTD
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#DC2626" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(Number(val), settings.defaultCurrencySymbol), 'Revenue']}
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#DC2626" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Invoice Status Distribution Pie */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-6 rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              Invoice Status
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Distribution of invoice payment statuses
            </p>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100 dark:border-gray-800 text-center text-xs">
            {statusPieData.map((d) => (
              <div key={d.name}>
                <span className="block text-[10px] text-gray-400 font-medium">{d.name}</span>
                <span className="font-extrabold text-gray-900 dark:text-white">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Invoices Table */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
              Recent Invoices
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Latest client billing transactions
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('invoices')}
            className="text-xs font-bold text-red-600 hover:text-red-700 dark:text-red-400 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-800 text-[11px] font-extrabold uppercase text-gray-500 dark:text-gray-400 tracking-wider">
                <th className="py-3 px-3">Invoice #</th>
                <th className="py-3 px-3">Client</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Amount</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs text-gray-800 dark:text-gray-200">
              {invoices.slice(0, 5).map((inv) => (
                <tr key={inv.id} className="hover:bg-red-50/20 dark:hover:bg-red-950/20 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-red-600 dark:text-red-400">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-3 px-3 font-bold text-gray-900 dark:text-white">
                    {inv.client.businessName || inv.client.name}
                  </td>
                  <td className="py-3 px-3">{formatDate(inv.date)}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        inv.status === 'Paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : inv.status === 'Overdue'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      ● {inv.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-gray-900 dark:text-white">
                    {formatCurrency(inv.grandTotal, inv.currencySymbol)}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => onViewInvoice(inv)}
                      className="p-1 text-gray-500 hover:text-red-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
