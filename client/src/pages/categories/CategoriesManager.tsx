import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // <-- Add this import
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControl, Grid, IconButton, InputLabel, MenuItem, Select, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, Alert
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Category as CategoryIcon } from '@mui/icons-material';
import axiosInstance from '../../utils/axiosInstance';

interface Category {
  _id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string;
}

const DEFAULT_ICONS = ['🍔', '🚖', '🛍️', '💰', '🎁', '❓'];
const DEFAULT_COLORS = ['#FF5722', '#3F51B5', '#9C27B0', '#4CAF50', '#FFC107', '#607D8B'];

const CategoriesManager = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', type: 'expense', icon: DEFAULT_ICONS[0], color: DEFAULT_COLORS[0] });
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate(); // <-- Add this line

  const fetchCategories = async () => {
    try {
      const res = await axiosInstance.get('/api/categories');
      setCategories(res.data || []);
    } catch {
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpen = (cat?: Category) => {
    if (cat) {
      setEditCategory(cat);
      setForm({ name: cat.name, type: cat.type, icon: cat.icon, color: cat.color });
    } else {
      setEditCategory(null);
      setForm({ name: '', type: 'expense', icon: DEFAULT_ICONS[0], color: DEFAULT_COLORS[0] });
    }
    setError(null);
    setOpenDialog(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError('Tên danh mục không được để trống');
      return;
    }
    try {
      if (editCategory) {
        await axiosInstance.put(`/api/categories/${editCategory._id}`, form);
      } else {
        await axiosInstance.post('/api/categories', form);
      }
      setOpenDialog(false);
      fetchCategories();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi lưu danh mục');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return;
    try {
      await axiosInstance.delete(`/api/categories/${id}`);
      fetchCategories();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi xóa danh mục');
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 700, margin: '0 auto' }}>
      {/* Add the navigation button here */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="outlined"
          onClick={() => navigate('/transactions')}
        >
          Quay lại trang Giao dịch
        </Button>
      </Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        <CategoryIcon sx={{ mr: 1 }} /> Quản lý Danh mục
      </Typography>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => handleOpen()}
        sx={{ mb: 2 }}
      >
        Thêm danh mục
      </Button>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Biểu tượng</TableCell>
              <TableCell>Tên</TableCell>
              <TableCell>Loại</TableCell>
              <TableCell>Màu</TableCell>
              <TableCell>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((cat) => (
              <TableRow key={cat._id}>
                <TableCell>{cat.icon}</TableCell>
                <TableCell>{cat.name}</TableCell>
                <TableCell>{cat.type === 'income' ? 'Thu nhập' : 'Chi tiêu'}</TableCell>
                <TableCell>
                  <Box sx={{ width: 24, height: 24, bgcolor: cat.color, borderRadius: '50%' }} />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(cat)}><EditIcon /></IconButton>
                  <IconButton onClick={() => handleDelete(cat._id)} color="error"><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            {categories.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">Chưa có danh mục nào</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editCategory ? 'Sửa danh mục' : 'Thêm danh mục mới'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Tên danh mục"
                fullWidth
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Loại</InputLabel>
                <Select
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value as 'income' | 'expense' })}
                >
                  <MenuItem value="income">Thu nhập</MenuItem>
                  <MenuItem value="expense">Chi tiêu</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={3}>
              <FormControl fullWidth>
                <InputLabel>Biểu tượng</InputLabel>
                <Select
                  value={form.icon}
                  onChange={e => setForm({ ...form, icon: e.target.value })}
                >
                  {DEFAULT_ICONS.map(icon => (
                    <MenuItem key={icon} value={icon}>{icon}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={3}>
              <FormControl fullWidth>
                <InputLabel>Màu</InputLabel>
                <Select
                  value={form.color}
                  onChange={e => setForm({ ...form, color: e.target.value })}
                >
                  {DEFAULT_COLORS.map(color => (
                    <MenuItem key={color} value={color}>
                      <Box sx={{ width: 20, height: 20, bgcolor: color, borderRadius: '50%', display: 'inline-block', mr: 1 }} />
                      {color}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleSave}>Lưu</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CategoriesManager;