declare module 'lucide-react' {
    import { FC, SVGProps } from 'react';
  
    interface LucideProps extends SVGProps<SVGSVGElement> {
      size?: number | string; // Thêm size
      color?: string;         // Thêm color
    }
  
    export const BarChart: FC<LucideProps>;
    export const CloudArrowDown: FC<LucideProps>;
    export const FilePlus: FC<LucideProps>;
    export const FileSpreadsheet: FC<LucideProps>;
  }