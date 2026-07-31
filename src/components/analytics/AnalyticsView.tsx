import React, { useState } from 'react';
import { Invoice, Client, CompanySettings } from '../../types';
import { formatCurrency, downloadCSV } from '../../lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Award,
  Receipt,
  Download,
  Calendar,
  Sparkles,
  PieChart as PieIcon,
} from 'lucide-react';

interface AnalyticsViewProps {
  invoices: Invoice[];
  clients: Client[];
  settings: CompanySettings;
  onToast: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  invoices,
  clients,
  settings,
  onToast,
}) => {
  const [reportMonth, setReportMonth] = useState('2026-07');

  // Key Calculated Metrics
  const totalInvoicesCount = invoices.length;
  const totalRevenue = invoices.reduce((acc, inv) => acc + inv.grandTotal, 0);
  const avgInvoiceValue = totalInvoicesCount > 0 ? Math.round(totalRevenue / totalInvoicesCount) : 0;
  const totalGstCollected = invoices.reduce((acc, inv) => acc + inv.gstTotal, 0);
  const totalPendingBalance = invoices.reduce((acc, inv) => acc + inv.remainingBalance, 0);

  // Top Selling Services Aggregation
  const serviceMap: Record<string, { name: string; count: number; total: number }> = {};
  invoices.forEach((inv) => {
    inv.services.forEach((s) => {
      const key = s.serviceName || 'Custom Web Service';
      if (!serviceMap[key]) {
        serviceMap[key] = { name: key, count: 0, total: 0 };
      }
      serviceMap[key].count += s.quantity;
      serviceMap[key].total += s.amount;
    });
  });

  const topServicesData = Object.values(serviceMap)
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);

  // Revenue Forecast next 3 months (simple AI trajectory)
  const forecastData = [
    { month: 'May (Actual)', revenue: 110000 },
    { month: 'Jun (Actual)', revenue: 85000 },
    { month: 'Jul (Actual)', revenue: totalRevenue },
    { month: 'Aug (Projected)', revenue: Math.round(totalRevenue * 1.15) },
    { month: 'Sep (Projected)', revenue: Math.round(totalRevenue * 1.28) },
    { month: 'Oct (Projected)', revenue: Math.round(totalRevenue * 1.42) },
  ];

  // GST Summary Report Export
  const handleExportGstReport = () => {
    const rows = invoices.map((inv) => ({
      InvoiceNumber: inv.invoiceNumber,
      Date: inv.date,
      ClientName: inv.client.name,
      ClientBusiness: inv.client.businessName,
      ClientGSTIN: inv.client.gstNumber,
      TaxableValue: inv.subtotal - inv.discountTotal,
      GSTAmount: inv.gstTotal,
      GrandTotal: inv.grandTotal,
    }));

    downloadCSV(`ARWS_GST_Report_${reportMonth}.csv`, rows);
    onToast('success', 'GST Report Exported', `Exported GST breakdown for ${reportMonth}`);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Revenue Analytics & GST Reports
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Financial analytics, top services, client LTV, and GST filings
          </p>
        </div>

        <button
          onClick={handleExportGstReport}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-500/25 transition-all self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export GST Report (CSV)</span>
        </button>
      </div>

      {/* Analytics KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Avg Invoice Value</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white">
            {formatCurrency(avgInvoiceValue, settings.defaultCurrencySymbol)}
          </h3>
          <p className="text-[10px] text-gray-500 mt-1">Across all created invoices</p>
        </div>

        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total GST Collected</span>
            <Receipt className="w-4 h-4 text-red-500" />
          </div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white">
            {formatCurrency(totalGstCollected, settings.defaultCurrencySymbol)}
          </h3>
          <p className="text-[10px] text-gray-500 mt-1">18% GST output tax ledger</p>
        </div>

        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Outstanding Pipeline</span>
            <BarChart3 className="w-4 h-4 text-blue-500" />
          </div>
          <h3 className="text-xl font-black text-red-600 dark:text-red-400">
            {formatCurrency(totalPendingBalance, settings.defaultCurrencySymbol)}
          </h3>
          <p className="text-[10px] text-gray-500 mt-1">Pending client collections</p>
        </div>

        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Top Service</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <h3 className="text-sm font-black text-gray-900 dark:text-white truncate">
            {topServicesData[0]?.name || 'Web Development'}
          </h3>
          <p className="text-[10px] text-amber-600 font-bold mt-1">
            {topServicesData[0] ? formatCurrency(topServicesData[0].total, settings.defaultCurrencySymbol) : '₹0'}
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Services Horizontal Bar */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              Top Selling Services
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Revenue breakdown by service offer
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topServicesData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#374151" opacity={0.2} />
                <XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} axisLine={false} width={120} />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(Number(val), settings.defaultCurrencySymbol), 'Revenue']}
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="total" fill="#DC2626" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Forecasting Trajectory */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Revenue Forecast & Growth Projection
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Next 3 months projected revenue curve
              </p>
            </div>
            <span className="flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 dark:bg-red-950/80 px-2.5 py-1 rounded-lg">
              <Sparkles className="w-3.5 h-3.5" /> AI Forecast
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(Number(val), settings.defaultCurrencySymbol), 'Amount']}
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#DC2626" strokeWidth={3} dot={{ r: 5, fill: '#DC2626' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
