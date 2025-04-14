import { Add, Delete, Edit } from '@mui/icons-material';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, List, ListItem, ListItemText, MenuItem, Paper, TextField, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { useThemeContext } from '../../contexts/ThemeContext';
import axiosInstance from '../../utils/axiosInstance';

interface Category {
  _id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string;
}

const TransactionCategories: React.FC = () => {
  const { darkMode } = useThemeContext();
  const [categories, setCategories] = useState<Category[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({ name: '', type: 'expense' as 'income' | 'expense', color: '#000000', icon: '' });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/api/categories');
        setCategories(response.data || []);
      } catch (err) {
        console.error('Lỗi tải danh mục:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleAddOrEditCategory = async () => {
    try {
      if (!formData.name) return;
      const payload = { ...formData };
      if (editingCategory) {
        await axiosInstance.put(`/api/categories/${editingCategory._id}`, payload);
      } else {
        await axiosInstance.post('/api/categories', payload);
      }
      setOpenDialog(false);
      setFormData({ name: '', type: 'expense', color: '#000000', icon: '' });
      setEditingCategory(null);
      const response = await axiosInstance.get('/api/categories');
      setCategories(response.data || []);
    } catch (err) {
      console.error('Lỗi lưu danh mục:', err);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await axiosInstance.delete(`/api/categories/${id}`);
      setCategories(categories.filter((cat) => cat._id !== id));
    } catch (err) {
      console.error('Lỗi xóa danh mục:', err);
    }
  };

  return (
    <Box
      sx={{
        p: { xs: 1, sm: 2, md: 3 },
        background: darkMode
          ? 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)'
          : 'linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%)',
        minHeight: '100vh',
      }}
    >
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontWeight: 700,
            color: darkMode ? '#E2E8F0' : '#1E293B',
            background: 'linear-gradient(45deg, #3B82F6, #7C3AED)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Phân loại giao dịch
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          sx={{
            mb: 2,
            bgcolor: 'linear-gradient(45deg, #3B82F6 30%, #7C3AED 90%)',
            color: '#fff',
            borderRadius: '8px',
            fontWeight: 600,
          }}
          onClick={() => setOpenDialog(true)}
        >
          Thêm danh mục
        </Button>
        <Paper
          sx={{
            p: 3,
            borderRadius: '12px',
            bgcolor: darkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.98)',
            boxShadow: darkMode ? '0 5px 15px rgba(0,0,0,0.5)' : '0 5px 15px rgba(0,0,0,0.1)',
          }}
        >
          {loading ? (
            <Typography>Đang tải...</Typography>
          ) : (
            <List>
              {categories.map((category) => (
                <motion.div
                  key={category._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <ListItem
                    secondaryAction={
                      <Box>
                        <IconButton
                          onClick={() => {
                            setEditingCategory(category);
                            setFormData({ name: category.name, type: category.type, color: category.color, icon: category.icon });
                            setOpenDialog(true);
                          }}
                        >
                          <Edit sx={{ color: darkMode ? '#A5B4FC' : '#3B82F6' }} />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteCategory(category._id)}>
                          <Delete sx={{ color: darkMode ? '#F87171' : '#EF4444' }} />
                        </IconButton>
                      </Box>
                    }
                  >
                    <ListItemText
                      primary={`${category.icon} ${category.name}`}
                      secondary={category.type === 'income' ? 'Thu nhập' : 'Chi tiêu'}
                      primaryTypographyProps={{ fontWeight: 500, color: darkMode ? '#E2E8F0' : '#1E293B' }}
                      secondaryTypographyProps={{ color: darkMode ? '#CBD5E1' : '#64748B' }}
                    />
                  </ListItem>
                </motion.div>
              ))}
            </List>
          )}
        </Paper>
      </motion.div>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle sx={{ color: darkMode ? '#A5B4FC' : '#4B5563' }}>
          {editingCategory ? 'Sửa danh mục' : 'Thêm danh mục'}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Tên danh mục"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            fullWidth
            margin="normal"
            sx={{ bgcolor: darkMode ? '#1E293B' : '#fff' }}
          />
          <TextField
            select
            label="Loại"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense' })}
            fullWidth
            margin="normal"
            sx={{ bgcolor: darkMode ? '#1E293B' : '#fff' }}
          >
            <MenuItem value="income">Thu nhập</MenuItem>
            <MenuItem value="expense">Chi tiêu</MenuItem>
          </TextField>
          <TextField
            label="Màu sắc"
            type="color"
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            fullWidth
            margin="normal"
            sx={{ bgcolor: darkMode ? '#1E293B' : '#fff' }}
          />
          <TextField
            label="Icon (emoji)"
            value={formData.icon}
            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
            fullWidth
            margin="normal"
            sx={{ bgcolor: darkMode ? '#1E293B' : '#fff' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} sx={{ color: darkMode ? '#CBD5E1' : '#64748B' }}>
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleAddOrEditCategory}
            sx={{ bgcolor: 'linear-gradient(45deg, #3B82F6 30%, #7C3AED 90%)', color: '#fff' }}
          >
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TransactionCategories;