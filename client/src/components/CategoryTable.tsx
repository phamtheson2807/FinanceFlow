import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  Box,
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useState } from 'react';

// Tạo MotionTableRow từ TableRow với hiệu ứng mượt mà
const MotionTableRow = motion(TableRow);

// Định nghĩa interface cho Category
interface Category {
  _id: string;
  name: string;
  type: 'income' | 'expense';
  description: string;
}

// Định nghĩa props cho CategoryTable
interface CategoryTableProps {
  categories: Category[];
  onDelete: (categoryId: string) => void;
  onEdit: (category: Category) => void;
}

const CategoryTable: React.FC<CategoryTableProps> = ({ categories, onDelete, onEdit }) => {
  const theme = useTheme();
  const [orderBy, setOrderBy] = useState<keyof Category>('name');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  // Hàm sắp xếp cột
  const handleSort = (property: keyof Category) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Sắp xếp danh mục theo tiêu chí
  const sortedCategories = [...categories].sort((a, b) => {
    const valueA = a[orderBy] as string;
    const valueB = b[orderBy] as string;
    return order === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
  });

  // Định nghĩa style cho tiêu đề bảng
  const headerStyle = {
    color: '#ffffff',
    fontWeight: 600,
    fontSize: '1rem',
    fontFamily: 'Poppins, sans-serif',
    padding: '16px',
    backgroundColor: theme.palette.primary.main,
    borderBottom: `2px solid ${theme.palette.primary.dark}`,
  };

  // Định nghĩa style cho ô trong bảng
  const cellStyle = {
    fontFamily: 'Poppins, sans-serif',
    fontSize: '0.95rem',
    padding: '14px 16px',
    color: theme.palette.text.primary,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <TableContainer
        component={Paper}
        sx={{
          bgcolor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.08)',
          maxHeight: { xs: '400px', sm: '600px' },
          overflow: 'auto',
          border: '1px solid rgba(0, 0, 0, 0.05)',
        }}
      >
        <Table stickyHeader aria-label="Bảng danh mục">
          <TableHead>
            <TableRow>
              {['Tên', 'Loại', 'Mô tả', 'Hành động'].map((header, index) => (
                <TableCell key={index} sx={headerStyle}>
                  <TableSortLabel
                    active={orderBy === (['name', 'type', 'description', ''][index] as keyof Category)}
                    direction={orderBy === (['name', 'type', 'description', ''][index] as keyof Category) ? order : 'asc'}
                    onClick={
                      index < 3 ? () => handleSort(['name', 'type', 'description'][index] as keyof Category) : undefined
                    }
                    sx={{
                      color: '#ffffff !important',
                      '&:hover': { color: '#e0e0e0 !important' },
                      '&.Mui-active': { color: '#ffffff !important' },
                      '& .MuiTableSortLabel-icon': {
                        color: '#ffffff !important',
                      },
                    }}
                  >
                    {header}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedCategories.length > 0 ? (
              sortedCategories.map((category, index) => (
                <MotionTableRow
                  key={category._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  sx={{
                    '&:hover': {
                      bgcolor: theme.palette.grey[100],
                      transition: 'background-color 0.3s ease',
                    },
                    borderBottom: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <TableCell sx={cellStyle}>{category.name}</TableCell>
                  <TableCell sx={cellStyle}>
                    <Chip
                      label={category.type === 'income' ? 'Thu' : 'Chi'}
                      color={category.type === 'income' ? 'success' : 'error'}
                      size="small"
                      sx={{
                        fontFamily: 'Poppins, sans-serif',
                        fontWeight: 500,
                        bgcolor: category.type === 'income' ? '#e8f5e9' : '#ffebee',
                        color: category.type === 'income' ? '#2e7d32' : '#c62828',
                        borderRadius: '8px',
                        px: 1,
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ ...cellStyle, color: theme.palette.text.secondary }}>
                    {category.description || 'Không có mô tả'}
                  </TableCell>
                  <TableCell align="center" sx={cellStyle}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5 }}>
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                        <IconButton
                          color="primary"
                          onClick={() => onEdit(category)}
                          sx={{
                            p: 0.5,
                            '&:hover': { bgcolor: theme.palette.primary.light, color: '#fff' },
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                        <IconButton
                          color="error"
                          onClick={() => onDelete(category._id)}
                          sx={{
                            p: 0.5,
                            '&:hover': { bgcolor: theme.palette.error.light, color: '#fff' },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </motion.div>
                    </Box>
                  </TableCell>
                </MotionTableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{
                        fontFamily: 'Poppins, sans-serif',
                        py: 4,
                        fontSize: '1rem',
                        fontWeight: 500,
                      }}
                    >
                      Không có dữ liệu danh mục
                    </Typography>
                  </motion.div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </motion.div>
  );
};

export default CategoryTable;