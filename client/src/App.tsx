// src/App.tsx
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider, useThemeContext } from './contexts/ThemeContext';

// Layouts
import Layout from './components/common/Layout';
import AdminLayout from './img/layouts/AdminLayout';

// Public Pages
import AboutUs from './pages/AboutUs';
import Landing from './pages/Landing';
import Policy from './pages/Policy';
import ResetPassword from './pages/ResetPassword';
import Support from './pages/Support';
import ForgotPassword from './pages/oauth/ForgotPassword';
import Login from './pages/oauth/Login';
import OAuthHandler from './pages/oauth/OAuthHandler';
import OAuthSuccess from './pages/oauth/OAuthSuccess';
import Register from './pages/oauth/Register';
import VerifyEmail from './pages/oauth/VerifyEmail';

// Dashboard Pages
import AccountInfo from './pages/AccountInfo';
import AiReport from './pages/AiReport';
import Dashboard from './pages/Home';
import Investments from './pages/Investments';
import Notifications from './pages/Notifications';
import Reports from './pages/Reports';
import Savings from './pages/Savings';
import Settings from './pages/Settings';
import Transactions from './pages/Transactions';
import SupportPage from './pages/user/SupportPage';

// Admin Pages
import AccountPage from './pages/admin/AccountPage';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminSupportPage from './pages/admin/AdminSupportPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import CategoriesPage from './pages/admin/CategoriesPage';
import TransactionsPage from './pages/admin/TransactionsPage';
import UsersPage from './pages/admin/UsersPage';

// Other Pages
import FinancialStatistics from './pages/FinancialStatistics';

const AppContent = () => {
  const { theme } = useThemeContext();

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/ve-chung-toi" element={<AboutUs />} />
          <Route path="/chinh-sach" element={<Policy />} />
          <Route path="/ho-tro" element={<Support />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/oauth" element={<OAuthHandler />} />
          <Route path="/oauth-success" element={<OAuthSuccess />} />

          {/* Standalone Transactions Route */}
          <Route path="/transactions" element={<Transactions />} />

          {/* Dashboard Routes */}
          <Route path="/dashboard" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="savings" element={<Savings />} />
            <Route path="investments" element={<Investments />} />
            <Route path="reports" element={<Reports />} />
            <Route path="account" element={<AccountInfo />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="settings" element={<Settings />} />
            <Route path="ai-report" element={<AiReport />} />
            <Route path="support" element={<SupportPage />} />
          </Route>

          {/* Standalone Statistics Route */}
          <Route path="/statistics" element={<FinancialStatistics />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="users" element={<UsersPage />} />
            <Route path="transactions" element={<TransactionsPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="account" element={<AccountPage />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="support" element={<AdminSupportPage />} />
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<div>404 - Không tìm thấy trang</div>} />
        </Routes>
      </AuthProvider>
    </MuiThemeProvider>
  );
};

const App = () => (
  <BrowserRouter>
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  </BrowserRouter>
);

export default App;