import { Alert, Box, Button, Container, TextField, Typography } from '@mui/material';
import axios from 'axios';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            const res = await axios.post('http://localhost:5000/api/auth/reset-password', { token, newPassword });
            setMessage(res.data.message);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Lỗi khi đặt lại mật khẩu');
        }
    };

    return (
        <Container maxWidth="xs">
            <Box sx={{ mt: 8, textAlign: 'center' }}>
                <Typography variant="h5">🔒 Đặt lại mật khẩu</Typography>
                <Typography variant="body2" sx={{ mb: 3 }}>Nhập mật khẩu mới.</Typography>

                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        type="password"
                        label="Mật khẩu mới"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        sx={{ mb: 2 }}
                    />
                    <Button type="submit" variant="contained" fullWidth>Đặt lại mật khẩu</Button>
                </form>

                {message && <Alert severity="success" sx={{ mt: 2 }}>{message}</Alert>}
                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            </Box>
        </Container>
    );
};

export default ResetPassword;
