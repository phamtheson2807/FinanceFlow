import { Box, Card, Grid, Typography, IconButton, Button } from '@mui/material';
import { useCategories } from '../../hooks/useCategories';
import DeleteIcon from '@mui/icons-material/Delete';
import axiosInstance from '../../utils/axiosInstance';
import CategoryAddDialog from './CategoryAddDialog';
import AddIcon from '@mui/icons-material/Add';
import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert } from '@mui/material';

const Categories = () => {
    const { categories, loading, error, refetch } = useCategories();
    const [openDialog, setOpenDialog] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // State cho snackbar
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success',
    });

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await axiosInstance.delete(`/api/categories/${deleteId}`);
            refetch();
            setSnackbar({ open: true, message: 'Xóa danh mục thành công!', severity: 'success' });
        } catch (err) {
            setSnackbar({ open: true, message: 'Xóa danh mục thất bại!', severity: 'error' });
        } finally {
            setDeleteId(null);
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
                    Danh mục giao dịch
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenDialog(true)}
                >
                    Thêm danh mục
                </Button>
            </Box>
            <Grid container spacing={2}>
                {categories.map((category) => (
                    <Grid item xs={12} sm={6} md={4} key={category._id}>
                        <Card sx={{ p: 2, position: 'relative' }}>
                            <Typography variant="h6">{category.name}</Typography>
                            <Typography color="textSecondary">
                                {category.type === 'income' ? 'Thu nhập' : 'Chi tiêu'}
                            </Typography>
                            {category.description && (
                                <Typography variant="body2" color="text.secondary">
                                    {category.description}
                                </Typography>
                            )}
                            <IconButton
                                aria-label="delete"
                                sx={{ position: 'absolute', top: 8, right: 8 }}
                                onClick={() => setDeleteId(category._id)}
                            >
                                <DeleteIcon color="error" />
                            </IconButton>
                        </Card>
                    </Grid>
                ))}
            </Grid>
            {/* Dialog xác nhận xóa */}
            <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
                <DialogTitle>Xác nhận xóa</DialogTitle>
                <DialogContent>
                    <Typography>Bạn có chắc chắn muốn xóa danh mục này?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteId(null)}>Hủy</Button>
                    <Button onClick={handleDelete} color="error" variant="contained">Xóa</Button>
                </DialogActions>
            </Dialog>
            {/* Snackbar hiển thị thông báo */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
            <CategoryAddDialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                onSuccess={refetch}
            />
        </Box>
    );
};

export default Categories;