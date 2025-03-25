import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Grid, MenuItem, Select, TextField, Typography, useTheme } from '@mui/material';
import Grow from '@mui/material/Grow';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import UserTable from '../../components/users/UserTable';
import { User } from '../../types/user';

const UsersPage = () => {
  const theme = useTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [viewUser, setViewUser] = useState<User | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token không tồn tại');
      const response = await axios.get('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!Array.isArray(response.data)) {
        console.error('API trả về dữ liệu không đúng:', response.data);
        setUsers([]);
      } else {
        const processedUsers = response.data.map((user: any) => ({
          _id: user._id || '',
          name: user.name || undefined,
          email: user.email || undefined,
          role: user.role || 'user',
          isLocked: user.isLocked !== undefined ? user.isLocked : false,
        })).filter((user: User) => user._id);
        setUsers(processedUsers);
        console.log('Danh sách người dùng:', processedUsers);
      }
    } catch (error) {
      console.error('Lỗi khi tải người dùng:', error);
      setError('Không thể tải danh sách người dùng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleLockUser = async (userId: string) => {
    if (!userId) {
      console.error('userId không hợp lệ:', userId);
      setError('ID người dùng không hợp lệ. Vui lòng thử lại.');
      return;
    }

    console.log('Bắt đầu khóa tài khoản với userId:', userId);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token không tồn tại');

      const apiUrl = `http://localhost:5000/api/admin/users/${userId}/lock`;
      console.log('📌 Gửi yêu cầu khóa tài khoản tới:', apiUrl);
      const response = await axios.put(apiUrl, { isLocked: true }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('📌 Phản hồi từ backend khi khóa:', response.data);

      if (response.data.data && response.data.data.isLocked !== undefined) {
        setUsers(users.map(user => user._id === userId ? response.data.data : user));
      } else {
        const updatedUser = { ...users.find(u => u._id === userId)!, isLocked: true };
        setUsers(users.map(user => user._id === userId ? updatedUser : user));
      }

      await fetchUsers();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('❌ Lỗi khi khóa người dùng:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        setError(`Không thể khóa tài khoản: ${error.response?.data?.message || 'Lỗi không xác định từ server.'}`);
      } else {
        console.error('❌ Lỗi không xác định khi khóa người dùng:', error);
        setError('Không thể khóa tài khoản. Vui lòng thử lại.');
      }
    }
  };

  const handleUnlockUser = async (userId: string) => {
    if (!userId) {
      console.error('userId không hợp lệ:', userId);
      setError('ID người dùng không hợp lệ. Vui lòng thử lại.');
      return;
    }

    const user = users.find(u => u._id === userId);
    if (!user) {
      setError('Không tìm thấy người dùng. Vui lòng làm mới trang.');
      return;
    }
    if (!user.isLocked) {
      setError('Tài khoản này đang hoạt động, không thể mở khóa.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token không tồn tại');
      const response = await axios.put(`http://localhost:5000/api/admin/users/${userId}/unlock`, { isLocked: false }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('📌 Phản hồi từ backend khi mở khóa:', response.data);

      if (response.data.data && response.data.data.isLocked !== undefined) {
        setUsers(users.map(user => user._id === userId ? response.data.data : user));
      } else {
        const updatedUser = { ...user, isLocked: false };
        setUsers(users.map(u => u._id === userId ? updatedUser : u));
      }
      await fetchUsers();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('❌ Lỗi khi mở khóa người dùng:', error.response?.data || error.message);
        setError(`Không thể mở khóa người dùng: ${error.response?.data?.message || 'Lỗi không xác định'}`);
      } else {
        console.error('❌ Lỗi khi mở khóa người dùng:', error);
        setError('Không thể mở khóa người dùng. Vui lòng thử lại.');
      }
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!userId) {
      console.error('userId không hợp lệ:', userId);
      setError('ID người dùng không hợp lệ. Vui lòng thử lại.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token không tồn tại');
      await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(users.filter((user) => user._id !== userId));
      setDeleteUserId(null);
      await fetchUsers();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Lỗi khi xóa người dùng:', error.response?.data || error.message);
        setError(`Không thể xóa người dùng: ${error.response?.data?.message || 'Lỗi không xác định'}`);
      } else {
        console.error('Lỗi khi xóa người dùng:', error);
        setError('Không thể xóa người dùng. Vui lòng thử lại.');
      }
    }
  };

  const handleEditUser = async (updatedUser: User) => {
    console.log('handleEditUser called with:', updatedUser);
    if (!updatedUser._id) {
      console.error('userId không hợp lệ:', updatedUser._id);
      setError('ID người dùng không hợp lệ. Vui lòng thử lại.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token không tồn tại');
      const response = await axios.put(`http://localhost:5000/api/admin/users/${updatedUser._id}`, updatedUser, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('API response:', response.data);
      setUsers(users.map(user => user._id === updatedUser._id ? response.data.data : user));
      setEditUser(null);
      await fetchUsers();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Lỗi khi chỉnh sửa người dùng:', error.response?.data || error.message);
        setError(`Không thể chỉnh sửa người dùng: ${error.response?.data?.message || 'Lỗi không xác định'}`);
      } else {
        console.error('Lỗi khi chỉnh sửa người dùng:', error);
        setError('Không thể chỉnh sửa người dùng. Vui lòng thử lại.');
      }
    }
  };

  const handleViewDetails = (userId: string) => {
    console.log('handleViewDetails called with userId:', userId);
    const user = users.find(u => u._id === userId);
    if (user) {
      setViewUser(user);
    } else {
      console.error('Không tìm thấy người dùng với userId:', userId);
      setError('Không tìm thấy người dùng.');
    }
  };

  const handleOpenEdit = (user: User) => {
    console.log('handleOpenEdit called with:', user); // Debug
    setEditUser(user);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) =>
    (user.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (user.email?.toLowerCase() || '').includes(searchQuery.toLowerCase())
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
        <Typography
          variant="h3"
          gutterBottom
          sx={{
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 'bold',
            color: '#1E3A8A',
            textShadow: '0 2px 5px rgba(0,0,0,0.1)',
          }}
        >
          Quản Lý Người Dùng
        </Typography>
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
              label="Tìm kiếm người dùng"
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

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4, type: 'spring', stiffness: 200, damping: 20 }}
          >
            <UserTable
              users={filteredUsers}
              onLock={handleLockUser}
              onUnlock={handleUnlockUser}
              onViewDetails={handleViewDetails}
              onEdit={handleOpenEdit} // Truyền hàm handleOpenEdit để mở dialog
              onDelete={(userId) => setDeleteUserId(userId)}
            />
          </motion.div>

          {/* Dialog xem chi tiết */}
          <Dialog
            open={!!viewUser}
            onClose={() => setViewUser(null)}
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
              Thông Tin Người Dùng
            </DialogTitle>
            <DialogContent sx={{ bgcolor: 'rgba(245, 245, 245, 0.95)', py: 3, px: 4 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography sx={{ fontFamily: 'Poppins, sans-serif', color: '#333', fontWeight: 'medium' }}>Tên:</Typography>
                  <Typography sx={{ fontFamily: 'Poppins, sans-serif', color: '#777' }}>{viewUser?.name || 'Không có thông tin'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography sx={{ fontFamily: 'Poppins, sans-serif', color: '#333', fontWeight: 'medium' }}>Email:</Typography>
                  <Typography sx={{ fontFamily: 'Poppins, sans-serif', color: '#777' }}>{viewUser?.email || 'Không có thông tin'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography sx={{ fontFamily: 'Poppins, sans-serif', color: '#333', fontWeight: 'medium' }}>Vai trò:</Typography>
                  <Typography sx={{ fontFamily: 'Poppins, sans-serif', color: '#777' }}>{viewUser?.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography sx={{ fontFamily: 'Poppins, sans-serif', color: '#333', fontWeight: 'medium' }}>Trạng thái:</Typography>
                  <Typography sx={{ fontFamily: 'Poppins, sans-serif', color: '#777' }}>{viewUser?.isLocked ? 'Đã khóa' : 'Hoạt động'}</Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ bgcolor: 'rgba(245, 245, 245, 0.95)', px: 4, py: 2 }}>
              <Button
                onClick={() => setViewUser(null)}
                sx={{
                  fontFamily: 'Poppins, sans-serif',
                  color: '#777',
                  '&:hover': { color: '#1E3A8A' },
                }}
              >
                Đóng
              </Button>
            </DialogActions>
          </Dialog>

          {/* Dialog chỉnh sửa */}
          <Dialog
            open={!!editUser}
            onClose={() => setEditUser(null)}
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
              Chỉnh Sửa Người Dùng
            </DialogTitle>
            <DialogContent sx={{ bgcolor: 'rgba(245, 245, 245, 0.95)', py: 3, px: 4 }}>
              <TextField
                autoFocus
                margin="dense"
                label="Tên"
                type="text"
                fullWidth
                value={editUser?.name || ''}
                onChange={(e) => setEditUser({ ...editUser!, name: e.target.value || undefined })}
                variant="outlined"
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'white', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
                  '& .MuiInputLabel-root': { fontFamily: 'Poppins, sans-serif', color: '#555' },
                  '& .MuiInputLabel-root.Mui-focused': { color: theme.palette.primary.main },
                }}
              />
              <TextField
                margin="dense"
                label="Email"
                type="email"
                fullWidth
                value={editUser?.email || ''}
                onChange={(e) => setEditUser({ ...editUser!, email: e.target.value || undefined })}
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
                label="Vai trò"
                fullWidth
                value={editUser?.role || 'user'}
                onChange={(e) => setEditUser({ ...editUser!, role: e.target.value as 'admin' | 'user' })}
                variant="outlined"
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'white', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
                  '& .MuiInputLabel-root': { fontFamily: 'Poppins, sans-serif', color: '#555' },
                  '& .MuiInputLabel-root.Mui-focused': { color: theme.palette.primary.main },
                }}
              >
                <MenuItem value="admin">Quản trị viên</MenuItem>
                <MenuItem value="user">Người dùng</MenuItem>
              </Select>
              <Select
                margin="dense"
                label="Trạng thái"
                fullWidth
                value={editUser?.isLocked ? 'locked' : 'active'}
                onChange={(e) => setEditUser({ ...editUser!, isLocked: e.target.value === 'locked' })}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'white', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
                  '& .MuiInputLabel-root': { fontFamily: 'Poppins, sans-serif', color: '#555' },
                  '& .MuiInputLabel-root.Mui-focused': { color: theme.palette.primary.main },
                }}
              >
                <MenuItem value="active">Hoạt động</MenuItem>
                <MenuItem value="locked">Đã khóa</MenuItem>
              </Select>
            </DialogContent>
            <DialogActions sx={{ bgcolor: 'rgba(245, 245, 245, 0.95)', px: 4, py: 2 }}>
              <Button
                onClick={() => setEditUser(null)}
                sx={{
                  fontFamily: 'Poppins, sans-serif',
                  color: '#777',
                  '&:hover': { color: '#1E3A8A' },
                }}
              >
                Hủy
              </Button>
              <Button
                onClick={() => editUser && handleEditUser(editUser)}
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
                Lưu
              </Button>
            </DialogActions>
          </Dialog>

          {/* Dialog xác nhận xóa */}
          <Dialog
            open={!!deleteUserId}
            onClose={() => setDeleteUserId(null)}
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
                Bạn có chắc muốn xóa tài khoản này? Hành động này không thể hoàn tác.
              </Typography>
            </DialogContent>
            <DialogActions sx={{ bgcolor: 'rgba(245, 245, 245, 0.95)', px: 4, py: 2 }}>
              <Button
                onClick={() => setDeleteUserId(null)}
                sx={{
                  fontFamily: 'Poppins, sans-serif',
                  color: '#777',
                  '&:hover': { color: '#1E3A8A' },
                }}
              >
                Hủy
              </Button>
              <Button
                onClick={() => deleteUserId && handleDeleteUser(deleteUserId)}
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

export default UsersPage;