export type InvoiceStatus = 'Paid' | 'Pending' | 'Partially Paid' | 'Overdue';
export type QuotationStatus = 'Draft' | 'Sent' | 'Approved' | 'Converted' | 'Rejected';
export type PaymentMode = 'Bank Transfer' | 'UPI' | 'Cash' | 'Cheque' | 'Online';
export type UserRole = 'Admin' | 'Staff';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Client {
  id: string;
  name: string;
  businessName: string;
  email: string;
  phone: string;
  gstNumber?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pinCode: string;
  website?: string;
  notes?: string;
  createdAt: string;
}

export interface ServiceItem {
  id: string;
  serviceName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number; // percentage or fixed
  gstPercentage?: number;
  amount: number;
}

export interface BankDetails {
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  ifsc: string;
  upiId: string;
  qrCodeUrl?: string;
  showPaymentInfoInPrint: boolean;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g., ARWS-2026-001
  quotationNumber?: string;
  date: string;
  dueDate: string;
  status: InvoiceStatus;
  currency: string; // default INR
  currencySymbol: string; // default ₹
  
  client: Client;
  services: ServiceItem[];
  
  subtotal: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountTotal: number;
  gstTotal?: number;
  roundOff: number;
  grandTotal: number;
  advanceReceived: number;
  remainingBalance: number;
  
  paymentMode: PaymentMode;
  bankDetails: BankDetails;
  
  notes: string;
  termsAndConditions: string;
  
  createdAt: string;
  updatedAt: string;
  createdBy: string; // User name
}

export interface Quotation {
  id: string;
  quotationNumber: string; // e.g. ARWS-QT-2026-001
  date: string;
  validUntil: string;
  status: QuotationStatus;
  currency: string;
  currencySymbol: string;
  
  client: Client;
  services: ServiceItem[];
  
  subtotal: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountTotal: number;
  gstTotal?: number;
  grandTotal: number;
  
  notes: string;
  termsAndConditions: string;
  createdAt: string;
  convertedInvoiceId?: string;
}

export interface ServiceTemplate {
  id: string;
  name: string;
  description: string;
  suggestedPrice: number;
  defaultGst?: number;
}

export interface CompanySettings {
  companyName: string;
  tagline: string;
  phones: string[];
  email: string;
  website: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  gstNumber?: string;
  
  logoUrl: string;
  signatureUrl: string;
  
  defaultGstPercentage?: number;
  defaultCurrency: string;
  defaultCurrencySymbol: string;
  invoicePrefix: string;
  quotationPrefix: string;
  
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  ifsc: string;
  upiId: string;
  
  defaultNotes: string;
  defaultTerms: string;
  
  supabaseUrl?: string;
  supabaseAnonKey?: string;
}
