import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';

export interface TicketData {
  firstName: string;
  lastName: string;
  email: string;
  association: string;
  registrationId: string;
}

@Injectable({
  providedIn: 'root'
})
export class TicketService {

  async generateAndDownloadTicket(data: TicketData): Promise<Blob> {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 18;
    const labelX = margin;
    const labelColWidth = 46;
    const valueX = labelX + labelColWidth;
    const qrSize = 52;
    const qrX = pageWidth - margin - qrSize;
    const maxValueWidth = qrX - valueX - 10;
    const lineHeight = 6;

    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('BVSR Conference 2026', pageWidth / 2, margin + 8, { align: 'center' });

    doc.setFontSize(15);
    doc.setFont('helvetica', 'normal');
    doc.text('Registration Pass', pageWidth / 2, margin + 18, { align: 'center' });

    const rows: { label: string; value: string }[] = [
      { label: 'Name:', value: `${data.firstName} ${data.lastName}`.trim() },
      { label: 'Email:', value: data.email },
      { label: 'Association:', value: data.association },
      { label: 'Registration ID:', value: data.registrationId }
    ];

    doc.setFontSize(11);
    const startY = margin + 32;

    const layoutRows: { label: string; lines: string[]; h: number }[] = [];
    for (const row of rows) {
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(row.value, maxValueWidth);
      const h = Math.max(lineHeight + 1, lines.length * lineHeight + 1);
      layoutRows.push({ label: row.label, lines, h });
    }

    const totalBlockHeight = layoutRows.reduce((s, r) => s + r.h, 0);
    const qrY = startY + Math.max(0, (totalBlockHeight - qrSize) / 2);

    try {
      const qrDataUrl = await QRCode.toDataURL(data.registrationId, {
        width: 128,
        margin: 1
      });
      doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text('Scan for verification', qrX + qrSize / 2, qrY + qrSize + 6, { align: 'center' });
      doc.setTextColor(0, 0, 0);
    } catch (err) {
      console.error('QR code generation error:', err);
    }

    let y = startY;
    for (const lr of layoutRows) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(lr.label, labelX, y);
      doc.setFont('helvetica', 'normal');
      doc.text(lr.lines, valueX, y);
      y += lr.h;
    }

    const belowQr = qrY + qrSize + 10;
    const contentBottom = Math.max(y, belowQr);
    const footerY = contentBottom + 14;

    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.2);
    doc.line(margin, contentBottom + 6, pageWidth - margin, contentBottom + 6);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Please bring this pass to the conference', pageWidth / 2, footerY, { align: 'center' });
    doc.text('Darmstadt · May 14–17, 2026', pageWidth / 2, footerY + 6, { align: 'center' });

    const pdfBlob = doc.output('blob');

    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BVSR2026-Pass-${data.registrationId}.pdf`;
    link.click();
    URL.revokeObjectURL(url);

    return pdfBlob;
  }
}
