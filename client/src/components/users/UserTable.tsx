import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  Box,
  Button,
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
import { User } from '../../types/user';

const MotionTableRow = motion(TableRow);

interface UserTableProps {
  users: User[];
  onLock: (userId: string) => void;
  onUnlock: (userId: string) => void;
  onViewDetails: (userId: string) => void;
  onEdit: (user: User) => void; // Chỉ mở dialog, không gửi API ngay
  onDelete: (userId: string) => void;
}

const tableHeadStyle = {
  color: '#ffffff',
  fontWeight: 700,
  fontSize: '1.1rem',
  fontFamily: 'Poppins, sans-serif',
  padding: '12px 16px',
  backgroundColor: 'primary.main',
};

const tableCellStyle = {
  fontFamily: 'Poppins, sans-serif',
  fontWeight: 500,
  fontSize: '1rem',
  color: '#212121',
  padding: '10px 16px',
};

const buttonSx = {
  fontFamily: 'Poppins, sans-serif',
  fontWeight: 600,
  fontSize: '0.9rem',
  px: 2,
  py: 0.5,
  borderRadius: 1,
  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
};

const UserTable: React.FC<UserTableProps> = ({
  users,
  onLock,
  onUnlock,
  onViewDetails,
  onEdit,
  onDelete,
}) => {
  const theme = useTheme();
  const [orderBy, setOrderBy] = useState<keyof User>('name');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = (property: keyof User) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedUsers = [...users].sort((a, b) => {
    const valueA = orderBy === 'isLocked' ? (a.isLocked ? 1 : 0) : (a[orderBy] || '');
    const valueB = orderBy === 'isLocked' ? (b.isLocked ? 1 : 0) : (b[orderBy] || '');

    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return order === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
    }
    return order === 'asc'
      ? (valueA as number) - (valueB as number)
      : (valueB as number) - (valueA as number);
  });

  const columns = [
    { label: 'Tên', key: 'name' as keyof User },
    { label: 'Email', key: 'email' as keyof User },
    { label: 'Vai trò', key: 'role' as keyof User },
    { label: 'Trạng thái', key: 'isLocked' as keyof User },
    { label: 'Hành động', key: 'isLocked' as keyof User },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <TableContainer
        component={Paper}
        sx={{
          bgcolor: 'white',
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          maxHeight: { xs: '400px', sm: '600px' },
          overflow: 'auto',
        }}
      >
        <Table stickyHeader aria-label="User management table">
          <TableHead>
            <TableRow sx={{ bgcolor: theme.palette.primary.main }}>
              {columns.map((column) => (
                <TableCell key={column.label} sx={tableHeadStyle}>
                  <TableSortLabel
                    active={orderBy === column.key}
                    direction={orderBy === column.key ? order : 'asc'}
                    onClick={() => handleSort(column.key)}
                    sx={{
                      color: 'inherit',
                      '&:hover': { color: '#e0e0e0' },
                      '&.Mui-active': { color: '#ffffff' },
                      '& .MuiTableSortLabel-icon': {
                        color: '#ffffff !important',
                        fontSize: '1.2rem',
                      },
                    }}
                  >
                    {column.label}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedUsers.length > 0 ? (
              sortedUsers.map((user, index) => (
                <MotionTableRow
                  key={user._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  sx={{
                    '&:hover': {
                      bgcolor: theme.palette.action.hover,
                      transition: 'background 0.3s ease',
                    },
                  }}
                >
                  <TableCell sx={tableCellStyle}>
                    {user.name || 'Không có thông tin'}
                  </TableCell>
                  <TableCell sx={tableCellStyle}>
                    {user.email || 'Không có thông tin'}
                  </TableCell>
                  <TableCell sx={tableCellStyle}>
                    <Chip
                      label={user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                      color={user.role === 'admin' ? 'primary' : 'default'}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        fontFamily: 'Poppins, sans-serif',
                        bgcolor: user.role === 'admin' ? theme.palette.primary.light : theme.palette.grey[200],
                        color: user.role === 'admin' ? '#ffffff' : '#212121',
                      }}
                    />
                  </TableCell>
                  <TableCell sx={tableCellStyle}>
                    <Chip
                      label={user.isLocked ? 'Đã khóa' : 'Hoạt động'}
                      color={user.isLocked ? 'error' : 'success'}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        fontFamily: 'Poppins, sans-serif',
                        bgcolor: user.isLocked ? theme.palette.error.light : theme.palette.success.light,
                        color: '#ffffff',
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                        <IconButton
                          color="primary"
                          onClick={() => onViewDetails(user._id)}
                          aria-label="View user details"
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                        <IconButton
                          color="secondary"
                          onClick={() => onEdit(user)} // Chỉ mở dialog, không gửi API
                          aria-label="Edit user"
                        >
                          <EditIcon />
                        </IconButton>
                      </motion.div>
                      {user.isLocked ? (
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            variant="contained"
                            color="success"
                            onClick={() => onUnlock(user._id)}
                            sx={buttonSx}
                          >
                            Mở khóa
                          </Button>
                        </motion.div>
                      ) : (
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            variant="contained"
                            color="error"
                            onClick={() => onLock(user._id)}
                            sx={buttonSx}
                          >
                            Khóa
                          </Button>
                        </motion.div>
                      )}
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                        <IconButton
                          color="error"
                          onClick={() => onDelete(user._id)}
                          aria-label="Delete user"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </motion.div>
                    </Box>
                  </TableCell>
                </MotionTableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Typography
                      variant="h6"
                      color="text.secondary"
                      sx={{
                        fontFamily: 'Poppins, sans-serif',
                        py: 4,
                        fontWeight: 500,
                        fontSize: '1.2rem',
                        color: theme.palette.grey[600],
                      }}
                    >
                      Không có dữ liệu người dùng
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

export default UserTable;