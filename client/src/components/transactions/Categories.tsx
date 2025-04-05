import { Box, Card, Grid, Typography } from '@mui/material';
import { useCategories } from '../../hooks/useCategories';

const Categories = () => {
    const { categories, loading, error } = useCategories();

    if (loading) return <Typography>Đang tải...</Typography>;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Box>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                Danh mục giao dịch
            </Typography>
            <Grid container spacing={2}>
                {categories.map((category) => (
                    <Grid item xs={12} sm={6} md={4} key={category._id}>
                        <Card sx={{ p: 2 }}>
                            <Typography variant="h6">{category.name}</Typography>
                            <Typography color="textSecondary">
                                {category.type === 'income' ? 'Thu nhập' : 'Chi tiêu'}
                            </Typography>
                            {category.description && (
                                <Typography variant="body2" color="text.secondary">
                                    {category.description}
                                </Typography>
                            )}
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default Categories;