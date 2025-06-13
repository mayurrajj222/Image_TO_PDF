
import jsPDF from 'jspdf';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';

// Configure pdfjs-dist worker
// Use a CDN for the worker to avoid issues with Next.js public folder setup in this context
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}


export type ImageMimeType = 'image/jpeg' | 'image/png' | 'image/webp';

export interface ConversionResult {
  name: string;
  dataUrl: string;
  type: string;
}

// Converts an image file to a specified format (JPEG, PNG, WebP)
export async function convertImageFormat(
  file: File,
  targetFormat: ImageMimeType,
  quality: number = 0.92 // Quality for JPEG/WebP
): Promise<ConversionResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context.'));
          return;
        }
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL(targetFormat, quality);
        const outputFileName = `${file.name.substring(0, file.name.lastIndexOf('.')) || file.name}.${targetFormat.split('/')[1]}`;
        resolve({ name: outputFileName, dataUrl, type: targetFormat });
      };
      img.onerror = (err) => reject(new Error(`Failed to load image: ${err}`));
      if (event.target?.result) {
        img.src = event.target.result as string;
      } else {
        reject(new Error('Failed to read file.'));
      }
    };
    reader.onerror = (err) => reject(new Error(`FileReader error: ${err}`));
    reader.readAsDataURL(file);
  });
}

// Converts a single image file to a PDF document
export async function imageToPdf(file: File): Promise<ConversionResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const doc = new jsPDF(img.width > img.height ? 'l' : 'p', 'px', [img.width, img.height]);
        doc.addImage(img.src, 'PNG', 0, 0, img.width, img.height); // Store as PNG in PDF for lossless quality
        const pdfDataUrl = doc.output('datauristring');
        const outputFileName = `${file.name.substring(0, file.name.lastIndexOf('.')) || file.name}.pdf`;
        resolve({ name: outputFileName, dataUrl: pdfDataUrl, type: 'application/pdf' });
      };
      img.onerror = (err) => reject(new Error(`Failed to load image: ${err}`));
      if (event.target?.result) {
        img.src = event.target.result as string;
      } else {
        reject(new Error('Failed to read file.'));
      }
    };
    reader.onerror = (err) => reject(new Error(`FileReader error: ${err}`));
    reader.readAsDataURL(file);
  });
}

// Converts a PDF file into a collection of images (one image per page)
export async function pdfToImages(file: File, imageFormat: ImageMimeType = 'image/png', scale: number = 1.5): Promise<ConversionResult[]> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    const results: ConversionResult[] = [];
    const ext = imageFormat.split('/')[1];

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Could not get canvas context for PDF page.');
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };
      await page.render(renderContext).promise;
      
      const dataUrl = canvas.toDataURL(imageFormat);
      const pageFileName = `${file.name.substring(0, file.name.lastIndexOf('.')) || file.name}_page_${i}.${ext}`;
      results.push({ name: pageFileName, dataUrl, type: imageFormat });
      page.cleanup(); // Cleanup page resources
    }
    return results;
  } catch (error) {
    console.error("Error converting PDF to images:", error);
    throw error; // Re-throw to be caught by the caller
  }
}
