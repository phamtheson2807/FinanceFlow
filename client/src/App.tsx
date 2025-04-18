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
import Support from './pages/Support';
import ForgotPassword from './pages/oauth/ForgotPassword';
import Login from './pages/oauth/Login';
import OAuthHandler from './pages/oauth/OAuthHandler';
import OAuthSuccess from './pages/oauth/OAuthSuccess';
import Register from './pages/oauth/Register';
import ResetPassword from './pages/oauth/ResetPassword';
import VerifyEmail from './pages/oauth/VerifyEmail';

// User Dashboard Pages
import PricingPage from './components/PricingPage';
import Dashboard from './pages/Home';
import Market from './pages/investments/Market'; // Thêm
import Trends from './pages/reports/Trends'; // Thêm
import SavingsAccounts from './pages/savings/SavingsAccounts'; // Thêm
import TransactionCategories from './pages/transactions/TransactionCategories'; // Thêm
import AccountInfo from './pages/user/AccountInfo';
import AiReport from './pages/user/AiReport';
import BankIntegration from './pages/user/BankIntegration';
import BudgetReport from './pages/user/BudgetReport';
import BudgetSetup from './pages/user/BudgetSetup';
import Investments from './pages/user/Investments';
import Notifications from './pages/user/Notifications';
import Reports from './pages/user/Reports';
import Savings from './pages/user/Savings';
import Settings from './pages/user/Settings';
import SupportPage from './pages/user/SupportPage';
import UserTransactions from './pages/user/UserTransactions';

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
          <Route path="/pricing" element={<PricingPage />} />

          {/* Standalone Transactions Route */}
          <Route path="/transactions" element={<UserTransactions />} />

          {/* User Dashboard Routes */}
          <Route path="/dashboard" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="transactions">
              <Route index element={<UserTransactions />} />
              <Route path="new" element={<UserTransactions />} /> {/* Form thêm giao dịch */}
              <Route path="list" element={<UserTransactions />} /> {/* Danh sách giao dịch */}
              <Route path="categories" element={<TransactionCategories />} /> {/* Phân loại giao dịch */}
            </Route>
            <Route path="savings">
              <Route index element={<Savings />} />
              <Route path="goals" element={<Savings />} /> {/* Mục tiêu tiết kiệm */}
              <Route path="accounts" element={<SavingsAccounts />} /> {/* Sổ tiết kiệm */}
            </Route>
            <Route path="investments">
              <Route index element={<Investments />} />
              <Route path="portfolio" element={<Investments />} /> {/* Danh mục đầu tư */}
              <Route path="market" element={<Market />} /> {/* Theo dõi thị trường */}
            </Route>
            <Route path="reports">
              <Route index element={<Reports />} />
              <Route path="transactions" element={<Reports />} /> {/* Báo cáo thu chi */}
              <Route path="trends" element={<Trends />} /> {/* Phân tích xu hướng */}
              <Route path="budget" element={<BudgetReport />} /> {/* Ngân sách */}
            </Route>
            <Route path="account" element={<AccountInfo />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="settings" element={<Settings />} />
            <Route path="ai-report" element={<AiReport />} />
            <Route path="support" element={<SupportPage />} />
            <Route path="budget/setup" element={<BudgetSetup />} />
            <Route path="bank" element={<BankIntegration />} />
          </Route>

          {/* Standalone Statistics Page */}
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

          {/* Fallback */}
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