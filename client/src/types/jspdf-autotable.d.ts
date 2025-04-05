// types/jspdf-autotable.d.ts
declare module 'jspdf-autotable' {
    import { jsPDF } from 'jspdf';
  
    interface AutoTableOptions {
      head?: any[][];
      body?: any[][];
      startY?: number;
      theme?: string;
      styles?: { [key: string]: any };
      headStyles?: { [key: string]: any };
      [key: string]: any;
    }
  
    function autoTable(doc: jsPDF, options: AutoTableOptions): void;
  
    export = autoTable;
  }