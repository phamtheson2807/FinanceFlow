import AddIcon from '@mui/icons-material/Add';
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Select, TextField, Typography, useTheme } from '@mui/material';
import Grow from '@mui/material/Grow';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import CategoryTable from '../../components/CategoryTable';

interface Category {
  _id: string;
  name: string;
  type: 'income' | 'expense';
  description: string;
}

const CategoriesPage = () => {
  const theme = useTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState({ name: '', type: 'income' as 'income' | 'expense', description: '' });
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [openAddDialog, setOpenAddDialog] = useState(false); // Thêm state để điều khiển dialog thêm

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token không tồn tại');
      const response = await axios.get('http://localhost:5000/api/admin/categories', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(response.data);
    } catch (error) {
      console.error('Lỗi khi tải danh mục:', error);
      setError('Không thể tải danh sách danh mục. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token không tồn tại');
      const response = await axios.post('http://localhost:5000/api/admin/categories', newCategory, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories([...categories, response.data]);
      setNewCategory({ name: '', type: 'income' as 'income' | 'expense', description: '' });
      setOpenAddDialog(false); // Đóng dialog sau khi thêm thành công
      setError(null); // Xóa thông báo lỗi nếu có
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Lỗi khi thêm danh mục:', error.response?.data);
        setError(error.response?.data?.message || 'Không thể thêm danh mục. Vui lòng thử lại.');
      } else {
        console.error('Lỗi không xác định:', error);
        setError('Không thể thêm danh mục. Vui lòng thử lại.');
      }
    }
  };

  const handleEditCategory = async (category: Category) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token không tồn tại');
      const response = await axios.put(`http://localhost:5000/api/admin/categories/${category._id}`, category, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(categories.map((c) => (c._id === category._id ? response.data : c)));
      setEditCategory(null);
      setError(null); // Xóa thông báo lỗi nếu có
    } catch (error) {
      console.error('Lỗi khi sửa danh mục:', error);
      setError('Không thể sửa danh mục. Vui lòng thử lại.');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token không tồn tại');
      await axios.delete(`http://localhost:5000/api/admin/categories/${categoryId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(categories.filter((c) => c._id !== categoryId));
      setDeleteCategoryId(null);
      setError(null); // Xóa thông báo lỗi nếu có
    } catch (error) {
      console.error('Lỗi khi xóa danh mục:', error);
      setError('Không thể xóa danh mục. Vui lòng thử lại.');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, bgcolor: '#f0f4f8', minHeight: 'calc(100vh - 64px)' }}>
      {error && (
        <Typography sx={{ color: 'error.main', mb: 2, textAlign: 'center' }}>{error}</Typography>
      )}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, type: 'spring', stiffness: 200, damping: 20 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography
            variant="h3"
            sx={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 'bold',
              color: '#1E3A8A',
              textShadow: '0 2px 5px rgba(0,0,0,0.1)',
            }}
          >
            Quản Lý Danh Mục
          </Typography>
          <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenAddDialog(true)} // Mở dialog khi nhấn nút Thêm
              sx={{
                fontFamily: 'Poppins, sans-serif',
                background: 'linear-gradient(45deg, #4CAF50, #2E7D32)',
                borderRadius: 2,
                px: 3,
                py: 1,
                boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
                '&:hover': { background: 'linear-gradient(45deg, #66BB6A, #1B5E20)' },
              }}
            >
              Thêm danh mục
            </Button>
          </motion.div>
        </Box>
      </motion.div>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <CircularProgress size={60} sx={{ color: theme.palette.primary.main }} />
          </motion.div>
        </Box>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <TextField
              label="Tìm kiếm danh mục"
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                width: { xs: '100%', sm: '50%' },
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: 'white',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                  '&:hover fieldset': { borderColor: theme.palette.primary.main },
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.primary.main,
                    boxShadow: `0 0 5px ${theme.palette.primary.main}50`,
                  },
                },
                '& .MuiInputLabel-root': {
                  fontFamily: 'Poppins, sans-serif',
                  color: theme.palette.text.secondary,
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: theme.palette.primary.main,
                },
              }}
            />
          </motion.div>

          {/* Dialog thêm/sửa danh mục */}
          <Dialog
            open={openAddDialog || !!editCategory} // Sử dụng openAddDialog cho thêm danh mục
            onClose={() => {
              setNewCategory({ name: '', type: 'income' as 'income' | 'expense', description: '' });
              setOpenAddDialog(false);
              setEditCategory(null);
            }}
            TransitionComponent={Grow}
            transitionDuration={400}
          >
            <DialogTitle
              sx={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 'bold',
                bgcolor: 'rgba(245, 245, 245, 0.95)',
                color: '#1E3A8A',
                py: 2,
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
              }}
            >
              {openAddDialog ? 'Thêm danh mục' : 'Sửa danh mục'}
            </DialogTitle>
            <DialogContent sx={{ bgcolor: 'rgba(245, 245, 245, 0.95)', py: 3, px: 4 }}>
              <TextField
                autoFocus
                margin="dense"
                label="Tên danh mục"
                type="text"
                fullWidth
                value={openAddDialog ? newCategory.name : editCategory?.name || ''}
                onChange={(e) => {
                  if (openAddDialog) setNewCategory({ ...newCategory, name: e.target.value });
                  else if (editCategory) setEditCategory({ ...editCategory, name: e.target.value });
                }}
                variant="outlined"
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'white', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
                  '& .MuiInputLabel-root': { fontFamily: 'Poppins, sans-serif', color: '#555' },
                  '& .MuiInputLabel-root.Mui-focused': { color: theme.palette.primary.main },
                }}
              />
              <Select
                margin="dense"
                label="Loại"
                fullWidth
                value={(openAddDialog ? newCategory.type : editCategory?.type) || 'income'}
                onChange={(e) => {
                  const type = e.target.value as 'income' | 'expense';
                  if (openAddDialog) setNewCategory({ ...newCategory, type });
                  else if (editCategory) setEditCategory({ ...editCategory, type });
                }}
                variant="outlined"
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'white', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
                  '& .MuiInputLabel-root': { fontFamily: 'Poppins, sans-serif', color: '#555' },
                  '& .MuiInputLabel-root.Mui-focused': { color: theme.palette.primary.main },
                }}
              >
                <MenuItem value="income">Thu</MenuItem>
                <MenuItem value="expense">Chi</MenuItem>
              </Select>
              <TextField
                margin="dense"
                label="Mô tả"
                type="text"
                fullWidth
                value={openAddDialog ? newCategory.description : editCategory?.description || ''}
                onChange={(e) => {
                  if (openAddDialog) setNewCategory({ ...newCategory, description: e.target.value });
                  else if (editCategory) setEditCategory({ ...editCategory, description: e.target.value });
                }}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'white', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
                  '& .MuiInputLabel-root': { fontFamily: 'Poppins, sans-serif', color: '#555' },
                  '& .MuiInputLabel-root.Mui-focused': { color: theme.palette.primary.main },
                }}
              />
            </DialogContent>
            <DialogActions sx={{ bgcolor: 'rgba(245, 245, 245, 0.95)', px: 4, py: 2 }}>
              <Button
                onClick={() => {
                  setNewCategory({ name: '', type: 'income' as 'income' | 'expense', description: '' });
                  setOpenAddDialog(false);
                  setEditCategory(null);
                }}
                sx={{
                  fontFamily: 'Poppins, sans-serif',
                  color: '#777',
                  '&:hover': { color: '#1E3A8A' },
                }}
              >
                Hủy
              </Button>
              <Button
                onClick={() => {
                  if (openAddDialog) handleAddCategory();
                  else if (editCategory) handleEditCategory(editCategory);
                }}
                variant="contained"
                color="primary"
                sx={{
                  fontFamily: 'Poppins, sans-serif',
                  background: 'linear-gradient(45deg, #3B82F6, #1E3A8A)',
                  borderRadius: 3,
                  px: 4,
                  py: 1,
                  boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                  '&:hover': { background: 'linear-gradient(45deg, #4B9EFF, #2A4D9E)' },
                }}
              >
                {openAddDialog ? 'Thêm' : 'Lưu'}
              </Button>
            </DialogActions>
          </Dialog>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4, type: 'spring', stiffness: 200, damping: 20 }}
          >
            <CategoryTable
              categories={filteredCategories}
              onDelete={(categoryId: string) => setDeleteCategoryId(categoryId)}
              onEdit={(category: Category) => setEditCategory(category)}
            />
          </motion.div>

          {/* Dialog xác nhận xóa */}
          <Dialog
            open={!!deleteCategoryId}
            onClose={() => setDeleteCategoryId(null)}
            TransitionComponent={Grow}
            transitionDuration={400}
          >
            <DialogTitle
              sx={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 'bold',
                bgcolor: 'rgba(245, 245, 245, 0.95)',
                color: '#1E3A8A',
                py: 2,
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
              }}
            >
              Xác nhận xóa
            </DialogTitle>
            <DialogContent sx={{ bgcolor: 'rgba(245, 245, 245, 0.95)', py: 3, px: 4 }}>
              <Typography sx={{ fontFamily: 'Poppins, sans-serif', color: '#555' }}>
                Bạn có chắc muốn xóa danh mục này? Hành động này không thể hoàn tác.
              </Typography>
            </DialogContent>
            <DialogActions sx={{ bgcolor: 'rgba(245, 245, 245, 0.95)', px: 4, py: 2 }}>
              <Button
                onClick={() => setDeleteCategoryId(null)}
                sx={{
                  fontFamily: 'Poppins, sans-serif',
                  color: '#777',
                  '&:hover': { color: '#1E3A8A' },
                }}
              >
                Hủy
              </Button>
              <Button
                onClick={() => deleteCategoryId && handleDeleteCategory(deleteCategoryId)}
                variant="contained"
                color="error"
                sx={{
                  fontFamily: 'Poppins, sans-serif',
                  background: 'linear-gradient(45deg, #f44336, #d32f2f)',
                  borderRadius: 3,
                  px: 4,
                  py: 1,
                  boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                  '&:hover': { background: 'linear-gradient(45deg, #ff5f52, #e64a19)' },
                }}
              >
                Xóa
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Box>
  );
};

export default CategoriesPage;