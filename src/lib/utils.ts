import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Invoice, Quotation } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, symbol = '₹'): string {
  if (isNaN(amount)) return `${symbol}0.00`;
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(amount);
  return `${symbol}${formatted}`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function generateInvoiceNumber(existingInvoices: Invoice[], prefix = 'ARWS-2026-'): string {
  const currentYear = new Date().getFullYear();
  const effectivePrefix = prefix.includes('YYYY') 
    ? prefix.replace('YYYY', currentYear.toString()) 
    : prefix;

  let maxNum = 0;
  existingInvoices.forEach((inv) => {
    const parts = inv.invoiceNumber.split('-');
    const lastPart = parts[parts.length - 1];
    const num = parseInt(lastPart, 10);
    if (!isNaN(num) && num > maxNum) {
      maxNum = num;
    }
  });

  const nextNum = (maxNum + 1).toString().padStart(3, '0');
  return `${effectivePrefix}${nextNum}`;
}

export function generateQuotationNumber(existingQuotations: Quotation[], prefix = 'ARWS-QT-2026-'): string {
  let maxNum = 0;
  existingQuotations.forEach((qt) => {
    const parts = qt.quotationNumber.split('-');
    const lastPart = parts[parts.length - 1];
    const num = parseInt(lastPart, 10);
    if (!isNaN(num) && num > maxNum) {
      maxNum = num;
    }
  });

  const nextNum = (maxNum + 1).toString().padStart(3, '0');
  return `${prefix}${nextNum}`;
}

export function numberToWordsINR(num: number): string {
  if (!num || isNaN(num) || num === 0) return 'Zero Rupees Only';

  const a = [
    '', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ',
    'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const inWords = (n: number): string => {
    if ((n = n.toString() as any).length > 9) return 'overflow';
    const nStr = ('000000000' + n).substr(-9);
    const match = nStr.match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!match) return '';
    
    let str = '';
    str += Number(match[1]) !== 0 ? (a[Number(match[1])] || b[Number(match[1][0])] + ' ' + a[Number(match[1][1])]) + 'Crore ' : '';
    str += Number(match[2]) !== 0 ? (a[Number(match[2])] || b[Number(match[2][0])] + ' ' + a[Number(match[2][1])]) + 'Lakh ' : '';
    str += Number(match[3]) !== 0 ? (a[Number(match[3])] || b[Number(match[3][0])] + ' ' + a[Number(match[3][1])]) + 'Thousand ' : '';
    str += Number(match[4]) !== 0 ? (a[Number(match[4])] || b[Number(match[4][0])] + ' ' + a[Number(match[4][1])]) + 'Hundred ' : '';
    str += Number(match[5]) !== 0 ? ((str !== '') ? 'and ' : '') + (a[Number(match[5])] || b[Number(match[5][0])] + ' ' + a[Number(match[5][1])]) : '';
    return str;
  };

  const wholePart = Math.floor(num);
  const words = inWords(wholePart).trim();
  return `${words} Rupees Only`;
}

export async function downloadElementAsPDF(elementId: string, filename: string): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) return false;

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1200,
      onclone: (clonedDoc) => {
        const dummyEl = clonedDoc.createElement('div');
        dummyEl.style.display = 'none';
        clonedDoc.body.appendChild(dummyEl);

        const replaceUnsupportedColorFunctions = (cssText: string): string => {
          if (!cssText) return '';
          const funcNames = ['oklch', 'oklab', 'color-mix', 'lab', 'lch', 'color'];
          let result = cssText;

          for (const fn of funcNames) {
            let index = result.indexOf(fn + '(');
            let safetyGuard = 0;
            while (index !== -1 && safetyGuard < 500) {
              safetyGuard++;
              let depth = 0;
              let end = -1;
              for (let i = index + fn.length; i < result.length; i++) {
                if (result[i] === '(') depth++;
                else if (result[i] === ')') {
                  depth--;
                  if (depth === 0) {
                    end = i;
                    break;
                  }
                }
              }

              if (end !== -1) {
                const colorExpr = result.substring(index, end + 1);
                let rgbColor = 'rgb(0, 0, 0)';
                try {
                  dummyEl.style.color = '';
                  dummyEl.style.color = colorExpr;
                  const computed = window.getComputedStyle(dummyEl).color;
                  if (computed && (computed.startsWith('rgb') || computed.startsWith('rgba'))) {
                    rgbColor = computed;
                  }
                } catch (e) {
                  rgbColor = 'rgb(0,0,0)';
                }
                result = result.substring(0, index) + rgbColor + result.substring(end + 1);
                index = result.indexOf(fn + '(', index + rgbColor.length);
              } else {
                break;
              }
            }
          }
          return result;
        };

        // Clean all style tags
        const styleEls = Array.from(clonedDoc.querySelectorAll('style'));
        styleEls.forEach((styleEl) => {
          if (styleEl.textContent) {
            styleEl.textContent = replaceUnsupportedColorFunctions(styleEl.textContent);
          }
        });

        // Clean inline styles on all elements
        const allElements = Array.from(clonedDoc.querySelectorAll('*'));
        allElements.forEach((el) => {
          const htmlEl = el as HTMLElement;
          const styleAttr = htmlEl.getAttribute('style');
          if (styleAttr) {
            htmlEl.setAttribute('style', replaceUnsupportedColorFunctions(styleAttr));
          }
        });

        if (clonedDoc.body.contains(dummyEl)) {
          clonedDoc.body.removeChild(dummyEl);
        }

        // Prepare the target element inside cloned document
        const clonedElement = clonedDoc.getElementById(elementId);
        if (clonedElement) {
          clonedElement.style.margin = '0';
          clonedElement.style.boxShadow = 'none';
          clonedElement.style.borderRadius = '0';
          clonedElement.style.transform = 'none';
          clonedElement.style.width = '210mm';
          clonedElement.style.background = '#ffffff';
          clonedElement.style.color = '#000000';
        }
      },
    });

    const imgData = canvas.toDataURL('image/png');
    if (!imgData || imgData === 'data:,') {
      throw new Error('Canvas rendering produced empty image');
    }

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    if (imgWidth === 0 || imgHeight === 0) {
      throw new Error('Canvas width/height is zero');
    }

    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 0;

    pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
    pdf.save(filename);
    return true;
  } catch (err) {
    console.error('PDF Generation Error:', err);
    return false;
  }
}

export function downloadCSV(filename: string, rows: Record<string, any>[]) {
  if (!rows || !rows.length) return;
  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      headers
        .map((header) => {
          let val = row[header] ?? '';
          if (typeof val === 'string' && (val.includes(',') || val.includes('\n') || val.includes('"'))) {
            val = `"${val.replace(/"/g, '""')}"`;
          }
          return val;
        })
        .join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
