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

const canvasCtx = typeof document !== 'undefined' ? document.createElement('canvas').getContext('2d') : null;

function toSafeRgb(colorStr: string): string {
  if (!colorStr || colorStr === 'transparent' || colorStr === 'none') return colorStr;
  if (!canvasCtx) return colorStr;

  if (!/(oklch|oklab|lab|lch|color-mix)/i.test(colorStr)) {
    return colorStr;
  }

  try {
    canvasCtx.fillStyle = 'rgba(0, 0, 0, 0)';
    canvasCtx.fillStyle = colorStr;
    const computed = canvasCtx.fillStyle;
    if (computed && computed !== 'rgba(0, 0, 0, 0)' && !/(oklch|oklab|lab|lch|color-mix)/i.test(computed)) {
      return computed;
    }
  } catch (e) {
    // fallback
  }

  return 'rgb(0, 0, 0)';
}

function sanitizeCssText(cssText: string): string {
  if (!cssText) return '';
  const colorFnRegex = /(oklch|oklab|lab|lch|color-mix)\((?:[^()]+|\((?:[^()]+|\([^()]*\))*\))*\)/gi;
  return cssText.replace(colorFnRegex, (match) => {
    const converted = toSafeRgb(match);
    return converted !== 'rgb(0, 0, 0)' ? converted : 'transparent';
  });
}

function applyComputedStyles(source: HTMLElement, target: HTMLElement) {
  try {
    const computed = window.getComputedStyle(source);

    if (computed.color) {
      target.style.color = toSafeRgb(computed.color);
    }
    if (computed.backgroundColor && computed.backgroundColor !== 'rgba(0, 0, 0, 0)' && computed.backgroundColor !== 'transparent') {
      target.style.backgroundColor = toSafeRgb(computed.backgroundColor);
    }
    if (computed.borderColor) {
      target.style.borderColor = toSafeRgb(computed.borderColor);
    }
    if (computed.borderTopColor) target.style.borderTopColor = toSafeRgb(computed.borderTopColor);
    if (computed.borderRightColor) target.style.borderRightColor = toSafeRgb(computed.borderRightColor);
    if (computed.borderBottomColor) target.style.borderBottomColor = toSafeRgb(computed.borderBottomColor);
    if (computed.borderLeftColor) target.style.borderLeftColor = toSafeRgb(computed.borderLeftColor);

    if (computed.boxShadow && computed.boxShadow !== 'none') {
      target.style.boxShadow = computed.boxShadow.replace(
        /(oklch|oklab|lab|lch|color-mix)\((?:[^()]+|\((?:[^()]+|\([^()]*\))*\))*\)/gi,
        (m) => toSafeRgb(m)
      );
    }

    if (source instanceof SVGElement || target instanceof SVGElement) {
      if (computed.fill && computed.fill !== 'none') {
        target.style.fill = toSafeRgb(computed.fill);
      }
      if (computed.stroke && computed.stroke !== 'none') {
        target.style.stroke = toSafeRgb(computed.stroke);
      }
    }

    const sourceChildren = Array.from(source.children) as HTMLElement[];
    const targetChildren = Array.from(target.children) as HTMLElement[];
    const minLen = Math.min(sourceChildren.length, targetChildren.length);
    for (let i = 0; i < minLen; i++) {
      applyComputedStyles(sourceChildren[i], targetChildren[i]);
    }
  } catch (e) {
    // ignore
  }
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
        // 1. Sanitize style tags
        const styleEls = Array.from(clonedDoc.querySelectorAll('style'));
        styleEls.forEach((styleEl) => {
          if (styleEl.textContent) {
            styleEl.textContent = sanitizeCssText(styleEl.textContent);
          }
        });

        // 2. Sanitize inline style attributes
        const allElements = Array.from(clonedDoc.querySelectorAll('*')) as HTMLElement[];
        allElements.forEach((el) => {
          const styleAttr = el.getAttribute('style');
          if (styleAttr) {
            el.setAttribute('style', sanitizeCssText(styleAttr));
          }
        });

        // 3. Inline resolved computed styles from source element to cloned element
        const clonedElement = clonedDoc.getElementById(elementId);
        if (clonedElement && element) {
          applyComputedStyles(element, clonedElement);

          // Force standard A4 dimensions on the cloned DOM element (794px x 1123px at 96 DPI)
          clonedElement.style.margin = '0';
          clonedElement.style.boxShadow = 'none';
          clonedElement.style.borderRadius = '0';
          clonedElement.style.transform = 'none';
          clonedElement.style.width = '794px';
          clonedElement.style.minHeight = '1123px';
          clonedElement.style.background = '#ffffff';
          clonedElement.style.color = '#000000';
        }
      },
    });

    const imgData = canvas.toDataURL('image/png');
    if (!imgData || imgData === 'data:,' || imgData.length < 100) {
      throw new Error('Canvas rendering produced invalid image');
    }

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
    const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    if (imgWidth === 0 || imgHeight === 0) {
      throw new Error('Canvas width/height is zero');
    }

    const ratio = pdfWidth / imgWidth;
    const scaledHeight = imgHeight * ratio;

    if (scaledHeight <= pdfHeight) {
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, scaledHeight);
    } else {
      let heightLeft = scaledHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, scaledHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, scaledHeight);
        heightLeft -= pdfHeight;
      }
    }

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
