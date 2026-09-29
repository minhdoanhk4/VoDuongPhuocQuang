import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const pdfService = {
  /**
   * Xuất phần tử HTML sang file PDF chất lượng cao (A4)
   */
  async exportElementToPdf(elementId: string, filename: string, orientation: 'portrait' | 'landscape' = 'portrait'): Promise<boolean> {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Không tìm thấy phần tử HTML với ID: ${elementId}`);
      return false;
    }

    try {
      // Ẩn tạm các nút bấm có class 'no-print'
      const noPrintElements = element.querySelectorAll('.no-print');
      noPrintElements.forEach(el => ((el as HTMLElement).style.display = 'none'));

      // Chụp canvas ở độ phân giải 2x (Retina) để bản in PDF sắc nét
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      // Khôi phục hiển thị nút bấm
      noPrintElements.forEach(el => ((el as HTMLElement).style.display = ''));

      const imgData = canvas.toDataURL('image/png');
      const isLandscape = orientation === 'landscape';

      // Kích thước chuẩn A4 (mm): 210 x 297
      const pdf = new jsPDF({
        orientation: isLandscape ? 'landscape' : 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = isLandscape ? 297 : 210;
      const pageHeight = isLandscape ? 210 : 297;

      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (imgHeight <= pageHeight) {
        // Vừa trong 1 trang
        pdf.addImage(imgData, 'PNG', 0, (pageHeight - imgHeight) / 2, imgWidth, imgHeight);
      } else {
        // Nhiều trang nếu nội dung dài
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
      }

      pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
      return true;
    } catch (err) {
      console.error('Lỗi khi xuất PDF:', err);
      return false;
    }
  },

  /**
   * Mở hộp thoại In nhanh của trình duyệt
   */
  printElement(elementId: string) {
    const element = document.getElementById(elementId);
    if (!element) return;
    window.print();
  }
};
