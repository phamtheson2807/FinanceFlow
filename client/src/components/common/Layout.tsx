import {
  AccountBalance,
  Analytics,
  ArrowRight,
  Dashboard as DashboardIcon,
  ExitToApp,
  Flare,
  GridView,
  Lightbulb,
  Menu as MenuIcon,
  MenuOpen,
  Notifications,
  Person,
  Savings,
  Search,
  Settings,
  SmartToy,
  TrendingUp
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
  InputAdornment,
  ListItemIcon,
  Menu,
  MenuItem,
  styled,
  TextField,
  Theme,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AppDispatch, RootState } from '../../redux/store';
import { fetchSubscription } from '../../redux/subscriptionSlice';
import axiosInstance from '../../utils/axiosInstance';
  
  // Các styled components giữ nguyên như trước
  const drawerWidth = 280;
  const collapsedDrawerWidth = 70;
  
  const StyledAppBar = styled(AppBar)(({ theme }: { theme: Theme }) => ({
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 4px 25px rgba(0, 0, 0, 0.05)',
    borderBottom: '1px solid rgba(230, 230, 230, 0.8)',
    zIndex: theme.zIndex.drawer + 1,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  }));
  
  const StyledDrawer = styled(Drawer, {
    shouldForwardProp: (prop) => prop !== 'collapsed',
  })<{ collapsed?: boolean }>(({ theme, collapsed }) => ({
    width: collapsed ? collapsedDrawerWidth : drawerWidth,
    flexShrink: 0,
    '& .MuiDrawer-paper': {
      width: collapsed ? collapsedDrawerWidth : drawerWidth,
      background: '#ffffff',
      color: '#334155',
      boxSizing: 'border-box',
      boxShadow: '4px 0 20px rgba(0, 0, 0, 0.03)',
      borderRight: '1px solid rgba(230, 230, 230, 0.8)',
      transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      overflowX: 'hidden',
    },
  }));
  
  const MainContent = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'collapsed',
  })<{ collapsed?: boolean }>(({ theme, collapsed }) => ({
    flexGrow: 1,
    padding: theme.spacing(4),
    paddingTop: theme.spacing(10),
    marginTop: '64px',
    marginLeft: collapsed ? collapsedDrawerWidth : 0,
    minHeight: 'calc(100vh - 64px)',
    background: 'linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    [theme.breakpoints.up('md')]: {
      marginLeft: collapsed ? collapsedDrawerWidth : 0,
    },
  }));
  
  const NavButton = styled(Button, {
    shouldForwardProp: (prop) => !['active', 'collapsed'].includes(String(prop)),
  })<{ active?: boolean; collapsed?: boolean }>(({ theme, active, collapsed }) => ({
    color: active ? '#2563eb' : '#64748b',
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.95rem',
    padding: '12px 16px',
    borderRadius: '12px',
    justifyContent: collapsed ? 'center' : 'flex-start',
    width: '100%',
    minHeight: '48px',
    marginBottom: '6px',
    background: active ? 'rgba(219, 234, 254, 0.7)' : 'transparent',
    border: active ? '1px solid rgba(191, 219, 254, 0.8)' : '1px solid transparent',
    boxShadow: active ? '0 2px 8px rgba(37, 99, 235, 0.1)' : 'none',
    transition: 'all 0.2s ease',
    minWidth: collapsed ? '48px' : 'auto',
    '&:hover': {
      background: active ? 'rgba(219, 234, 254, 0.8)' : 'rgba(241, 245, 249, 0.8)',
      transform: 'translateY(-2px)',
      color: active ? '#2563eb' : '#334155',
    },
    '& .MuiButton-startIcon': {
      marginRight: collapsed ? 0 : '12px',
      marginLeft: collapsed ? 0 : '0',
      color: active ? '#2563eb' : '#64748b',
    },
    '& .MuiButton-endIcon': {
      display: collapsed ? 'none' : 'flex',
      marginLeft: 'auto',
    },
  }));
  
  const SubMenuButton = styled(Button, {
    shouldForwardProp: (prop) => prop !== 'active',
  })<{ active?: boolean }>(({ theme, active }) => ({
    color: active ? '#2563eb' : '#64748b',
    textTransform: 'none',
    fontSize: '0.85rem',
    padding: '10px 16px 10px 40px',
    justifyContent: 'flex-start',
    width: '100%',
    minHeight: '40px',
    borderRadius: '8px',
    background: active ? 'rgba(219, 234, 254, 0.5)' : 'transparent',
    transition: 'all 0.2s ease',
    marginBottom: '4px',
    '&:hover': {
      background: active ? 'rgba(219, 234, 254, 0.6)' : 'rgba(241, 245, 249, 0.6)',
      color: active ? '#2563eb' : '#334155',
    },
  }));
  
  const GradientAvatar = styled(Avatar)({
    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    color: 'white',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    boxShadow: '0 5px 15px rgba(37, 99, 235, 0.4)',
    border: '2px solid rgba(255, 255, 255, 0.8)',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'scale(1.1)',
      boxShadow: '0 8px 25px rgba(37, 99, 235, 0.5)',
    },
  });
  
  const ProfileButton = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    borderRadius: '16px',
    background: 'rgba(241, 245, 249, 0.8)',
    border: '1px solid rgba(226, 232, 240, 0.8)',
    marginTop: 'auto',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
      background: 'rgba(226, 232, 240, 0.8)',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    },
  });
  
  const SearchTextField = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
      backgroundColor: 'rgba(241, 245, 249, 0.8)',
      borderRadius: '12px',
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: 'rgba(203, 213, 225, 0.8)',
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: '#3b82f6',
      },
    },
    '& .MuiOutlinedInput-input': {
      padding: '10px 14px',
    },
  }));
  
  const SpotlightCard = styled(Box)({
    borderRadius: '20px',
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    padding: '24px',
    color: 'white',
    marginTop: '24px',
    marginBottom: '16px',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 12px 24px rgba(37, 99, 235, 0.25)',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 16px 30px rgba(37, 99, 235, 0.35)',
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: '-50%',
      right: '-50%',
      width: '200px',
      height: '200px',
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)',
    },
  });
  
  interface SubscriptionState {
    plan: string | null;
    loading: boolean;
    error: string | null;
  }
  
  interface Notification {
    _id: string;
    title: string;
    content: string;
    isActive: boolean;
    createdBy: { name: string; email: string };
    createdAt: Date;
    isRead?: boolean;
  }
  
  interface MenuItem {
    text: string;
    icon: React.ReactNode;
    path: string;
    description: string;
    subItems?: SubMenuItem[];
  }
  
  interface SubMenuItem {
    text: string;
    path: string;
  }
  
  const menuItems: MenuItem[] = [
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
      icon: <Analytics />,
      path: '/dashboard/reports',
      description: 'Xem báo cáo và phân tích',
      subItems: [
        { text: 'Báo cáo thu chi', path: '/dashboard/reports/transactions' },
        { text: 'Phân tích xu hướng', path: '/dashboard/reports/trends' },
        { text: 'Ngân sách', path: '/dashboard/reports/budget' },
      ],
    },
    { text: 'AI Phân tích', icon: <SmartToy />, path: '/dashboard/ai-advisor', description: 'Phân tích tài chính với trợ lý AI' },
  ];
  
  const Layout: React.FC = () => {
    const theme = useTheme<Theme>();
    const navigate = useNavigate();
    const location = useLocation();
    const { logout, user } = useAuth();
    const dispatch = useDispatch<AppDispatch>();
    const subscription = useSelector((state: RootState) => state.subscription) as SubscriptionState;
    const { plan, loading: subLoading, error: subError } = subscription;
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileOpen, setMobileOpen] = useState(false);
    const [drawerCollapsed, setDrawerCollapsed] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);
    const [showSpotlight, setShowSpotlight] = useState(true);
  
    const handleDrawerToggle = () => {
      if (isMobile) {
        setMobileOpen(!mobileOpen);
      } else {
        setDrawerCollapsed(!drawerCollapsed);
      }
    };
  
    const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);
    const handleLogout = () => {
      logout();
      navigate('/login');
      localStorage.removeItem('token');
      handleMenuClose();
    };
  
    const fetchNotifications = async () => {
      try {
        const response = await axiosInstance.get<Notification[]>('/api/notifications');
        setNotifications(response.data.map((notif) => ({ ...notif, isRead: notif.isRead || false })));
      } catch (err) {
        console.error('Lỗi tải thông báo:', err);
        setError('Không thể tải thông báo.');
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
      fetchNotifications();
      dispatch(fetchSubscription());
    }, [dispatch]);
  
    useEffect(() => {
      if (mobileOpen && isMobile) {
        setMobileOpen(false);
      }
    }, [location, isMobile]);
  
    const isPathActive = (path: string) => {
      if (path === '/dashboard' && location.pathname === '/dashboard') return true;
      return location.pathname.startsWith(path) && path !== '/dashboard';
    };
  
    const isSubPathActive = (path: string) => location.pathname === path;
  
    const unreadCount = notifications.filter((n) => !n.isRead).length;
  
    const handleMenuClick = (path: string, hasSubItems: boolean) => {
      navigate(path);
      if (hasSubItems && !drawerCollapsed) {
        setOpenSubMenu(openSubMenu === path ? null : path);
      }
    };
  
    const drawerContent = (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', py: 2, px: drawerCollapsed ? 1 : 3 }}>
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: drawerCollapsed ? 'center' : 'flex-start' }}>
          <GradientAvatar sx={{ width: 40, height: 40, mr: drawerCollapsed ? 0 : 2 }}>F</GradientAvatar>
          {!drawerCollapsed && (
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
              FinanceFlow
            </Typography>
          )}
        </Box>
  
        {!drawerCollapsed && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#94a3b8', px: 2, mb: 1, display: 'block' }}>
              MENU CHÍNH
            </Typography>
          </Box>
        )}
  
        <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: drawerCollapsed ? 0 : 1, scrollbarWidth: 'thin' }}>
          {menuItems.map((item) => (
            <Box key={item.text}>
              <Tooltip title={drawerCollapsed ? `${item.text}: ${item.description}` : item.description} placement={drawerCollapsed ? 'right' : 'top'} arrow>
                <NavButton
                  startIcon={item.icon}
                  onClick={() => handleMenuClick(item.path, !!item.subItems)}
                  active={isPathActive(item.path)}
                  collapsed={drawerCollapsed}
                  endIcon={!drawerCollapsed && item.subItems && (openSubMenu === item.path ? <GridView fontSize="small" /> : <ArrowRight fontSize="small" />)}
                >
                  {!drawerCollapsed && item.text}
                </NavButton>
              </Tooltip>
  
              {!drawerCollapsed && item.subItems && openSubMenu === item.path && (
                <Box sx={{ ml: 2, mb: 1, mt: 0 }}>
                  {item.subItems.map((subItem) => (
                    <SubMenuButton
                      key={subItem.text}
                      onClick={() => navigate(subItem.path)}
                      active={isSubPathActive(subItem.path)}
                    >
                      {subItem.text}
                    </SubMenuButton>
                  ))}
                </Box>
              )}
            </Box>
          ))}
  
          {!drawerCollapsed && showSpotlight && (
            <SpotlightCard sx={{ mx: 2 }}>
              <IconButton
                size="small"
                sx={{ position: 'absolute', top: 8, right: 8, color: 'white', opacity: 0.7 }}
                onClick={() => setShowSpotlight(false)}
              >
                <Flare fontSize="small" />
              </IconButton>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Lightbulb sx={{ mr: 1 }} />
                <Typography variant="subtitle1" fontWeight={600}>
                  Tip tài chính
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
                Thiết lập ngân sách tự động để kiểm soát chi tiêu tốt hơn.
              </Typography>
              <Button
                variant="contained"
                size="small"
                sx={{
                  bgcolor: 'white',
                  color: '#1d4ed8',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                }}
                onClick={() => navigate('/dashboard/budget/setup')}
              >
                Thiết lập ngay
              </Button>
            </SpotlightCard>
          )}
        </Box>
  
        {!drawerCollapsed && (
          <Box sx={{ mt: 2, mx: 2 }}>
            <ProfileButton onClick={handleProfileMenuOpen}>
              <Avatar src={user?.avatar} sx={{ width: 42, height: 42, mr: 2 }} />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
                  {user?.name || 'Người dùng'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  {plan ? `${plan.toUpperCase()} Plan` : 'Free Plan'}
                </Typography>
              </Box>
              <IconButton size="small" sx={{ ml: 1, color: '#64748b' }}>
                <Settings fontSize="small" />
              </IconButton>
            </ProfileButton>
          </Box>
        )}
      </Box>
    );
  
    return (
      <Box sx={{ display: 'flex', bgcolor: '#f8fafc', minHeight: '100vh' }}>
        <StyledAppBar position="fixed" elevation={0}>
          <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                sx={{ mr: 2, color: '#64748b' }}
                onClick={handleDrawerToggle}
                aria-label={drawerCollapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
              >
                {mobileOpen ? <MenuOpen /> : <MenuIcon />}
              </IconButton>
  
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <GradientAvatar sx={{ width: 36, height: 36, mr: 2 }}>F</GradientAvatar>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                  FinanceFlow
                </Typography>
              </Box>
            </Box>
  
            <Box sx={{ display: 'flex', flexGrow: 1, mx: 4, maxWidth: '500px' }}>
              <SearchTextField
                size="small"
                fullWidth
                placeholder="Tìm kiếm giao dịch, báo cáo..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search fontSize="small" sx={{ color: '#64748b' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ display: { xs: 'none', sm: 'block' } }}
              />
            </Box>
  
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Tooltip title="Thông báo" arrow>
                <IconButton
                  sx={{
                    color: '#64748b',
                    bgcolor: 'rgba(241, 245, 249, 0.8)',
                    '&:hover': { bgcolor: 'rgba(226, 232, 240, 0.8)' },
                  }}
                  onClick={() => navigate('/dashboard/notifications')}
                >
                  <Badge
                    badgeContent={unreadCount}
                    color="error"
                    sx={{
                      '& .MuiBadge-badge': {
                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                        boxShadow: '0 2px 6px rgba(239, 68, 68, 0.4)',
                      },
                    }}
                  >
                    <Notifications />
                  </Badge>
                </IconButton>
              </Tooltip>
  
              <Tooltip title="Tài khoản" arrow>
                <IconButton
                  onClick={handleProfileMenuOpen}
                  sx={{
                    p: 0,
                    border: '2px solid rgba(226, 232, 240, 0.8)',
                    transition: 'all 0.2s ease',
                    '&:hover': { transform: 'scale(1.05)' },
                  }}
                >
                  <Avatar src={user?.avatar} sx={{ width: 38, height: 38 }} />
                </IconButton>
              </Tooltip>
            </Box>
  
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{
                sx: {
                  borderRadius: '16px',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                  minWidth: '260px',
                  border: '1px solid rgba(226, 232, 240, 0.8)',
                  mt: 1.5,
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem sx={{ py: 2 }}>
                <Avatar src={user?.avatar} sx={{ mr: 2, width: 48, height: 48 }} />
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                    {user?.name || 'Người dùng'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.email || 'Email không có'}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'inline-block',
                      mt: 0.5,
                      fontWeight: 600,
                      color: '#2563eb',
                      bgcolor: 'rgba(219, 234, 254, 0.5)',
                      px: 1,
                      py: 0.5,
                      borderRadius: '4px',
                    }}
                  >
                    {subLoading ? 'Đang tải...' : (plan || 'Free').toUpperCase()}
                  </Typography>
                </Box>
              </MenuItem>
  
              <Divider />
  
              <MenuItem
                onClick={() => {
                  navigate('/dashboard/accountinfo');
                  handleMenuClose();
                }}
                sx={{ py: 1.5, '&:hover': { bgcolor: 'rgba(241, 245, 249, 0.8)' } }}
              >
                <ListItemIcon>
                  <Person fontSize="small" sx={{ color: '#2563eb' }} />
                </ListItemIcon>
                Thông tin tài khoản
              </MenuItem>
  
              <MenuItem
                onClick={() => {
                  navigate('/dashboard/settings');
                  handleMenuClose();
                }}
                sx={{ py: 1.5, '&:hover': { bgcolor: 'rgba(241, 245, 249, 0.8)' } }}
              >
                <ListItemIcon>
                  <Settings fontSize="small" sx={{ color: '#2563eb' }} />
                </ListItemIcon>
                Cài đặt
              </MenuItem>
  
              <MenuItem
                onClick={() => {
                  navigate('/pricing');
                  handleMenuClose();
                }}
                sx={{ py: 1.5, '&:hover': { bgcolor: 'rgba(241, 245, 249, 0.8)' } }}
              >
                <ListItemIcon>
                  <TrendingUp fontSize="small" sx={{ color: '#2563eb' }} />
                </ListItemIcon>
                Nâng cấp tài khoản
              </MenuItem>
  
              <Divider />
  
              <MenuItem
                onClick={handleLogout}
                sx={{ py: 1.5, color: '#ef4444', '&:hover': { bgcolor: 'rgba(254, 226, 226, 0.5)' } }}
              >
                <ListItemIcon>
                  <ExitToApp fontSize="small" sx={{ color: '#ef4444' }} />
                </ListItemIcon>
                Đăng xuất
              </MenuItem>
            </Menu>
          </Toolbar>
        </StyledAppBar>
  
        <StyledDrawer variant="permanent" sx={{ display: { xs: 'none', md: 'block' } }} collapsed={drawerCollapsed}>
          {drawerContent}
        </StyledDrawer>
  
        <StyledDrawer variant="temporary" open={mobileOpen} onClose={handleDrawerToggle} ModalProps={{ keepMounted: true }} sx={{ display: { xs: 'block', md: 'none' } }}>
          {drawerContent}
        </StyledDrawer>
  
        <MainContent collapsed={!isMobile && drawerCollapsed}>
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress sx={{ color: '#2563eb' }} />
            </Box>
          )}
  
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
              {error}
            </Alert>
          )}
  
          {subError && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
              {subError}
            </Alert>
          )}
  
          <Outlet />
        </MainContent>
      </Box>
    );
  };
  
  export default Layout;