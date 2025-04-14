import { AnimatePresence, motion } from 'framer-motion';
import { Route, Routes, useLocation } from 'react-router-dom';
import AdminLayout from '../img/layouts/AdminLayout'; // Đường dẫn đúng từ pages -> layouts
import AccountPage from './admin/AccountPage'; // Đường dẫn từ pages -> pages/admin
import AnalyticsPage from './admin/AnalyticsPage'; // Đường dẫn từ pages -> pages/admin
import CategoriesPage from './admin/CategoriesPage'; // Đường dẫn từ pages -> pages/admin
import DashboardPage from './admin/DashboardPage'; // Đường dẫn từ pages -> pages/admin
import TransactionsPage from './admin/TransactionsPage'; // Đường dẫn từ pages -> pages/admin
import UsersPage from './admin/UsersPage'; // Đường dẫn từ pages -> pages/admin

const Admin = () => {
  const location = useLocation();

  return (
    <AdminLayout>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="transactions" element={<TransactionsPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="account" element={<AccountPage />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </AdminLayout>
  );
};

export default Admin;