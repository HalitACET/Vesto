import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function exportReportToPdf(
  elementId: string,
  filename: string = 'vesto-stil-raporu.pdf'
) {
  const element = document.getElementById(elementId);
  if (!element) return;

  // Loading göster
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#F5F5F5',
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  // Çok uzunsa birden fazla sayfa
  if (imgHeight <= pageHeight) {
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
  } else {
    let yPosition = 0;
    let remainingHeight = imgHeight;

    while (remainingHeight > 0) {
      pdf.addImage(
        imgData, 'PNG',
        0, -yPosition,
        imgWidth, imgHeight
      );

      remainingHeight -= pageHeight;
      yPosition += pageHeight;

      if (remainingHeight > 0) {
        pdf.addPage();
      }
    }
  }

  pdf.save(filename);
}

// CSV Export (global istatistikler için)
export function exportToCsv(
  data: Record<string, any>[],
  filename: string = 'vesto-export.csv'
) {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(h => {
        const val = row[h];
        // String'leri quote'la
        if (typeof val === 'string' && val.includes(',')) {
          return `"${val}"`;
        }
        return val ?? '';
      }).join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
