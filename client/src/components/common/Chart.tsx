import { useTheme } from '@mui/material/styles'; // Sửa import
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Title, Tooltip } from 'chart.js';
import { useEffect, useRef } from 'react';

// Đăng ký các thành phần của Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement);

interface ChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string[] | ((context: any) => CanvasGradient);
      borderColor: string[];
      borderWidth?: number;
      tension?: number;
      fill?: boolean;
    }[];
  };
  options: any;
}

const Chart: React.FC<ChartProps> = ({ data, options }) => {
  const theme = useTheme();
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<ChartJS | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      // Hủy instance cũ nếu tồn tại
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      // Tạo instance mới
      chartInstanceRef.current = new ChartJS(chartRef.current, {
        type: 'line', // Mặc định là line
        data,
        options: {
          ...options,
          plugins: {
            ...options.plugins,
            title: {
              ...options.plugins?.title,
              color: theme.palette.text.primary,
            },
            legend: {
              ...options.plugins?.legend,
              labels: {
                ...options.plugins?.legend?.labels,
                color: theme.palette.text.secondary,
              },
            },
          },
          scales: {
            ...options.scales,
            x: {
              ...options.scales?.x,
              ticks: {
                ...options.scales?.x?.ticks,
                color: theme.palette.text.secondary,
                font: { family: 'Poppins, sans-serif' },
              },
            },
            y: {
              ...options.scales?.y,
              ticks: {
                ...options.scales?.y?.ticks,
                color: theme.palette.text.secondary,
                font: { family: 'Poppins, sans-serif' },
              },
            },
          },
        },
      });
    }

    // Cleanup khi component unmount
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [data, options, theme]); // Re-render khi data, options, hoặc theme thay đổi

  return <canvas ref={chartRef} />;
};

export default Chart;