import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider, useThemeContext } from './contexts/ThemeContext';


// Layouts
import Layout from './components/common/Layout';
import AdminLayout from './img/layouts/AdminLayout';

// Public Pages - Lazy Loaded
const Landing = lazy(() => import('./pages/Landing'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const Policy = lazy(() => import('./pages/Policy'));
const Support = lazy(() => import('./pages/Support'));
const ForgotPassword = lazy(() => import('./pages/oauth/ForgotPassword'));
const Login = lazy(() => import('./pages/oauth/Login'));
const OAuthHandler = lazy(() => import('./pages/oauth/OAuthHandler'));
const OAuthSuccess = lazy(() => import('./pages/oauth/OAuthSuccess'));
const Register = lazy(() => import('./pages/oauth/Register'));
const ResetPassword = lazy(() => import('./pages/oauth/ResetPassword'));
const VerifyEmail = lazy(() => import('./pages/oauth/VerifyEmail'));
const PricingPage = lazy(() => import('./components/PricingPage'));


// User Dashboard Pages - Lazy Loaded
const Dashboard = lazy(() => import('./pages/Home'));
const Market = lazy(() => import('./pages/investments/Market'));
const Trends = lazy(() => import('./pages/reports/Trends'));
const SavingsAccounts = lazy(() => import('./pages/savings/SavingsAccounts'));
const TransactionCategories = lazy(() => import('./pages/transactions/TransactionCategories'));
const AccountInfo = lazy(() => import('./pages/user/AccountInfo'));
const AiReport = lazy(() => import('./pages/user/AiReport'));
const BankIntegration = lazy(() => import('./pages/user/BankIntegration'));
const BudgetReport = lazy(() => import('./pages/user/BudgetReport'));
const BudgetSetup = lazy(() => import('./pages/user/BudgetSetup'));
const Investments = lazy(() => import('./pages/user/Investments'));
const Notifications = lazy(() => import('./pages/user/Notifications'));
const Reports = lazy(() => import('./pages/user/Reports'));
const Savings = lazy(() => import('./pages/user/Savings'));
const Settings = lazy(() => import('./pages/user/Settings'));
const SupportPage = lazy(() => import('./pages/user/SupportPage'));
const UserTransactions = lazy(() => import('./pages/user/UserTransactions'));


// Admin Pages - Lazy Loaded
const AccountPage = lazy(() => import('./pages/admin/AccountPage'));
const AdminNotifications = lazy(() => import('./pages/admin/AdminNotifications'));
const AdminSupportPage = lazy(() => import('./pages/admin/AdminSupportPage'));
const AnalyticsPage = lazy(() => import('./pages/admin/AnalyticsPage'));
const CategoriesPage = lazy(() => import('./pages/admin/CategoriesPage'));
const TransactionsPage = lazy(() => import('./pages/admin/TransactionsPage'));
const UsersPage = lazy(() => import('./pages/admin/UsersPage'));
const CategoriesManager = lazy(() => import('./pages/categories/CategoriesManager'));


// Other Pages - Lazy Loaded
const FinancialStatistics = lazy(() => import('./pages/FinancialStatistics'));
const AIAdvisor = lazy(() => import('./pages/ai-advisor/AIAdvisor'));
const FinancialForecast = lazy(() => import('./pages/ai-advisor/FinancialForecast'));
const InvestmentAdvice = lazy(() => import('./pages/ai-advisor/InvestmentAdvice'));
const SavingsSuggestions = lazy(() => import('./pages/ai-advisor/SavingsSuggestions'));
const SpendingAnalysis = lazy(() => import('./pages/ai-advisor/SpendingAnalysis'));


// NotFound component
const NotFound = () => {
  return <div>{('common.not_found')}</div>;
};

const AppContent = () => {
  const { theme } = useThemeContext();

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Suspense fallback={<div>Đang tải...</div>}>
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
            <Route path="/oauth/success" element={<OAuthSuccess />} />
            <Route path="/pricing" element={<PricingPage />} />

            {/* Standalone Transactions Route */}
            <Route path="/transactions" element={<UserTransactions />} />

            {/* Categories Manager Route */}
            <Route path="/categories" element={<CategoriesManager />} />

            {/* User Dashboard Routes */}
            <Route path="/dashboard" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="transactions">
                <Route index element={<UserTransactions />} />
                <Route path="new" element={<UserTransactions />} />
                <Route path="list" element={<UserTransactions />} />
                <Route path="categories" element={<TransactionCategories />} />
              </Route>
              <Route path="savings">
                <Route index element={<Savings />} />
                <Route path="goals" element={<Savings />} />
                <Route path="accounts" element={<SavingsAccounts />} />
              </Route>
              <Route path="investments">
                <Route index element={<Investments />} />
                <Route path="portfolio" element={<Investments />} />
                <Route path="market" element={<Market />} />
              </Route>
              <Route path="reports">
                <Route index element={<Reports />} />
                <Route path="transactions" element={<Reports />} />
                <Route path="trends" element={<Trends />} />
                <Route path="budget" element={<BudgetReport />} />
              </Route>
              <Route path="accountinfo" element={<AccountInfo />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="settings" element={<Settings />} />
              <Route path="ai-report" element={<AiReport />} />
              <Route path="support" element={<SupportPage />} />
              <Route path="budget/setup" element={<BudgetSetup />} />
              <Route path="bank" element={<BankIntegration />} />
              <Route path="ai-advisor" element={<AIAdvisor />} />
              <Route path="ai-advisor/spending-analysis" element={<SpendingAnalysis />} />
              <Route path="ai-advisor/savings-suggestions" element={<SavingsSuggestions />} />
              <Route path="ai-advisor/investment-advice" element={<InvestmentAdvice />} />
              <Route path="ai-advisor/financial-forecast" element={<FinancialForecast />} />
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
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