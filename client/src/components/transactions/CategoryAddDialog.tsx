import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Grid, Typography, ToggleButton, ToggleButtonGroup, IconButton, Box
} from '@mui/material';
import axiosInstance from '../../utils/axiosInstance';

const ICONS = ['🍔', '🚖', '🛍️', '💰', '🎁', '❓', '🏠', '📚', '🎓', '💡', '🏥', '🎮', '🍺', '🚗', '✈️', '🐶', '👶', '🎵', '📱', '🛒'];

interface CategoryAddDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CategoryAddDialog: React.FC<CategoryAddDialogProps> = ({ open, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [icon, setIcon] = useState(ICONS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Tên danh mục không được để trống');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await axiosInstance.post('/api/categories', { name, type, icon });
      setName('');
      setType('expense');
      setIcon(ICONS[0]);
      onSuccess();
      onClose();
    } catch (err) {
      setError('Thêm danh mục thất bại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Thêm danh mục mới</DialogTitle>
      <DialogContent>
        <TextField
          label="Tên danh mục"
          fullWidth
          value={name}
          onChange={e => setName(e.target.value)}
          margin="normal"
        />
        <Typography sx={{ mt: 2, mb: 1 }}>Loại danh mục</Typography>
        <ToggleButtonGroup
          value={type}
          exclusive
          onChange={(_, val) => val && setType(val)}
          fullWidth
          sx={{ mb: 2 }}
        >
          <ToggleButton value="expense" color="error">Chi tiêu</ToggleButton>
          <ToggleButton value="income" color="success">Thu nhập</ToggleButton>
        </ToggleButtonGroup>
        <Typography sx={{ mb: 1 }}>Chọn icon</Typography>
        <Grid container spacing={1}>
          {ICONS.map((ic) => (
            <Grid item xs={2} key={ic}>
              <IconButton
                onClick={() => setIcon(ic)}
                sx={{
                  border: icon === ic ? '2px solid #3b82f6' : '2px solid transparent',
                  background: icon === ic ? '#e0e7ff' : 'transparent',
                  fontSize: 24,
                  width: 40,
                  height: 40,
                }}
              >
                {ic}
              </IconButton>
            </Grid>
          ))}
        </Grid>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="h6" component="span">Icon đã chọn: </Typography>
          <span style={{ fontSize: 28 }}>{icon}</span>
        </Box>
        {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Hủy</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? 'Đang lưu...' : 'Thêm'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CategoryAddDialog;