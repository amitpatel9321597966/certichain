import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * High-definition PDF generation for Certificates
 * Uses landscape A4 layout (297mm x 210mm)
 */
export async function exportCertificatePDF(elementId, filename = 'certificate.pdf') {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id ${elementId} not found`);
  }

  // Options for high resolution canvas capture
  const canvas = await html2canvas(element, {
    scale: 3, // 3x scale for crisp, print-ready 300 DPI text and gold borders
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff'
  });

  const imgData = canvas.toDataURL('image/png', 1.0);
  
  // A4 Landscape: 297mm width, 210mm height
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  pdf.addImage(imgData, 'PNG', 0, 0, 297, 210);
  pdf.save(filename);
}

/**
 * Native browser print trigger
 */
export function triggerPrint() {
  window.print();
}
