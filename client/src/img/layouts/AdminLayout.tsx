import { Box, CssBaseline } from '@mui/material'; // Xóa useTheme
import { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../../components/common/Navbar'; // Đường dẫn đã sửa

interface AdminLayoutProps {
  children?: ReactNode; // Làm optional
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f5f7fa' }}>
      <CssBaseline />
      <Navbar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 4 },
          overflow: 'auto',
          bgcolor: 'white',
          borderRadius: { xs: 0, md: 2 },
          boxShadow: { xs: 'none', md: '0 4px 20px rgba(0, 0, 0, 0.1)' },
          transition: 'all 0.3s ease',
        }}
      >
        {children || <Outlet />}
      </Box>
    </Box>
  );
};

export default AdminLayout;