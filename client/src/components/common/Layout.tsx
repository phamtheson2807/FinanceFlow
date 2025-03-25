import {
  AccountBalance,
  Assessment,
  Dashboard as DashboardIcon,
  ExitToApp,
  ExpandLess,
  ExpandMore,
  MenuOpen,
  Notifications,
  Person,
  Savings,
  Settings,
  Support as SupportIcon,
  TrendingUp,
} from '@mui/icons-material';
import {
  Alert,
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  styled,
  SxProps,
  Theme,
  Toolbar,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axiosInstance from '../../utils/axiosInstance';

const drawerWidth = 240;

const StyledAppBar = styled(AppBar)(({ theme }: { theme: Theme }) => ({
  background: 'linear-gradient(90deg, #1e3c72 0%, #2a5298 100%)',
  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
}));

const StyledTypography = styled(Typography)<{ component?: string }>(({ theme }: { theme: Theme }) => ({
  fontWeight: 'bold',
  color: '#fff',
  textShadow: '1px 1px 4px rgba(0, 0, 0, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    textShadow: '1px 1px 8px rgba(255, 255, 255, 0.5)',
  },
}));

const menuItems = [
  { text: 'Tổng quan', icon: <DashboardIcon />, path: '/dashboard', description: 'Xem tổng quan tài chính của bạn' },
  {
    text: 'Giao dịch',
    icon: <AccountBalance />,
    path: '/dashboard/transactions',
    description: 'Quản lý các khoản thu chi',
    subItems: [
      { text: 'Thêm giao dịch', path: '/dashboard/transactions/new' },
      { text: 'Danh sách giao dịch', path: '/dashboard/transactions/list' },
      { text: 'Phân loại', path: '/dashboard/transactions/categories' },
    ],
  },
  {
    text: 'Tiết kiệm',
    icon: <Savings />,
    path: '/dashboard/savings',
    description: 'Quản lý các khoản tiết kiệm',
    subItems: [
      { text: 'Mục tiêu tiết kiệm', path: '/dashboard/savings/goals' },
      { text: 'Sổ tiết kiệm', path: '/dashboard/savings/accounts' },
    ],
  },
  {
    text: 'Đầu tư',
    icon: <TrendingUp />,
    path: '/dashboard/investments',
    description: 'Theo dõi danh mục đầu tư',
    subItems: [
      { text: 'Danh mục đầu tư', path: '/dashboard/investments/portfolio' },
      { text: 'Theo dõi thị trường', path: '/dashboard/investments/market' },
    ],
  },
  {
    text: 'Báo cáo',
    icon: <Assessment />,
    path: '/dashboard/reports',
    description: 'Xem báo cáo và phân tích',
    subItems: [
      { text: 'Báo cáo thu chi', path: '/dashboard/reports/transactions' },
      { text: 'Phân tích xu hướng', path: '/dashboard/reports/trends' },
      { text: 'Ngân sách', path: '/dashboard/reports/budget' },
    ],
  },
  { text: 'Hỗ trợ', icon: <SupportIcon />, path: '/dashboard/support', description: 'Trò chuyện trực tiếp với admin' },
];

interface Notification {
  _id: string;
  title: string;
  content: string;
  isActive: boolean;
  createdBy: { name: string; email: string };
  createdAt: Date;
  isRead?: boolean;
}

const Layout: React.FC = () => {
  const theme = useTheme<Theme>();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    localStorage.removeItem('token');
  };

  const fetchNotifications = async () => {
    try {
      const response = await axiosInstance.get<Notification[]>('/api/notifications');
      const fetchedNotifications = response.data.map((notif: Notification) => ({
        ...notif,
        isRead: notif.isRead || false,
      }));
      setNotifications(fetchedNotifications);
    } catch (error) {
      console.error('Lỗi tải thông báo:', error);
      setError('Không thể tải thông báo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter((n: Notification) => !n.isRead).length;

  const handleSubMenuToggle = (path: string) => {
    setOpenSubMenu(openSubMenu === path ? null : path);
  };

  const layoutStyles: SxProps<Theme> = {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    position: 'relative',
  };

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#1e3c72', background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)' }}>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ bgcolor: '#fff', color: '#1e3c72', mr: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>Q</Avatar>
          <StyledTypography variant="h6" noWrap component="div">
            Quản lý Tài chính
          </StyledTypography>
        </Box>
      </Toolbar>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, p: 2, overflowY: 'auto' }}>
        {menuItems.map((item) => (
          <Box key={item.text}>
            <Button
              startIcon={item.icon}
              onClick={() => (item.subItems ? handleSubMenuToggle(item.path) : navigate(item.path))}
              sx={{
                width: '100%',
                justifyContent: 'flex-start',
                color: '#fff',
                padding: '8px 16px',
                borderRadius: '20px',
                textTransform: 'none',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              {item.text}
              {item.subItems && (
                <Box
                  component="span"
                  sx={{ ml: 'auto', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  onClick={(e: React.MouseEvent<HTMLElement>) => {
                    e.stopPropagation();
                    handleSubMenuToggle(item.path);
                  }}
                >
                  {openSubMenu === item.path ? <ExpandLess /> : <ExpandMore />}
                </Box>
              )}
            </Button>

            {item.subItems && openSubMenu === item.path && (
              <Box sx={{ ml: 4, mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {item.subItems.map((subItem) => (
                  <Button
                    key={subItem.text}
                    onClick={() => navigate(subItem.path)}
                    sx={{
                      fontSize: '0.9rem',
                      color: 'rgba(255,255,255,0.8)',
                      padding: '6px 16px',
                      borderRadius: '20px',
                      textTransform: 'none',
                      '&:hover': {
                        color: '#fff',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                      },
                    }}
                  >
                    {subItem.text}
                  </Button>
                ))}
              </Box>
            )}
          </Box>
        ))}
      </Box>

      <Box sx={{ p: 2, borderTop: `1px solid rgba(255, 255, 255, 0.1)`, mt: 'auto', textAlign: 'center' }}>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
          © 2024 Finance Manager
        </Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block' }}>
          Được tạo bởi Phạm Thế Sơn
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={layoutStyles}>
      <StyledAppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuOpen />
            </IconButton>
            <StyledTypography
              variant="h6"
              noWrap
              component="div"
              sx={{ display: { xs: 'none', sm: 'block' }, mr: 3 }}
            >
              Quản lý Tài chính
            </StyledTypography>
          </Box>

          <Box
            sx={{
              display: { xs: 'none', sm: 'flex' },
              gap: 2,
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          >
            {menuItems.map((item) => (
              <Button
                key={item.text}
                startIcon={item.icon}
                onClick={() => navigate(item.path)}
                sx={{
                  color: '#fff',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  },
                }}
              >
                {item.text}
              </Button>
            ))}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Thông báo">
              <IconButton color="inherit" onClick={() => navigate('/dashboard/notifications')}>
                <Badge badgeContent={unreadCount} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>
            <Tooltip title="Tài khoản">
              <IconButton color="inherit" onClick={handleProfileMenuOpen}>
                <Person />
              </IconButton>
            </Tooltip>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                backgroundColor: '#fff',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                borderRadius: '8px',
              },
            }}
          >
            <MenuItem>
              <Avatar src={user?.avatar || ''} sx={{ width: 24, height: 24, mr: 1 }} />
              <Box>
                <Typography variant="body1">{user?.name || 'Người dùng'}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.email || 'Email không có'}
                </Typography>
              </Box>
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={() => {
                handleMenuClose();
                navigate('/dashboard/account');
              }}
            >
              <ListItemIcon>
                <Person fontSize="small" />
              </ListItemIcon>
              <Typography>Thông tin tài khoản</Typography>
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleMenuClose();
                navigate('/dashboard/settings');
              }}
            >
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              <Typography>Cài đặt</Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <ExitToApp fontSize="small" />
              </ListItemIcon>
              <Typography>Đăng xuất</Typography>
            </MenuItem>
          </Menu>
        </Toolbar>
      </StyledAppBar>

      <Box component="nav">
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      {loading && (
        <Box
          sx={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1000,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            padding: 2,
            borderRadius: 2,
          }}
        >
          <CircularProgress sx={{ color: '#1E3A8A' }} />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2, mt: 8, zIndex: 1000 }}>
          {error}
        </Alert>
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: '100%',
          marginTop: '64px',
          background: 'linear-gradient(to bottom, #f5f7fa 0%, #c3cfe2 100%)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;