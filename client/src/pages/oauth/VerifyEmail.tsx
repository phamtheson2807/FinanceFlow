import { Alert, CircularProgress, Container, Paper, Typography } from '@mui/material';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const VerifyEmail = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token"); // Lấy token từ URL
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            return;
        }

        const verifyEmail = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/auth/verify-email?token=${token}`);
                if (response.status === 200) {
                    setStatus('success');
                    setTimeout(() => navigate('/login'), 3000); // Chuyển về login sau 3s
                } else {
                    setStatus('error');
                }
            } catch (error) {
                console.error("❌ Lỗi xác thực:", error);
                setStatus('error');
            }
        };

        verifyEmail();
    }, [token, navigate]);

    return (
        <Container maxWidth="sm">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Paper elevation={6} sx={{ p: 4, mt: 8, textAlign: 'center', borderRadius: 3 }}>
                    {status === 'loading' && (
                        <>
                            <CircularProgress color="primary" />
                            <Typography variant="h6" sx={{ mt: 2 }}>Đang xác thực email...</Typography>
                        </>
                    )}
                    {status === 'success' && (
                        <Alert severity="success">
                            ✅ Email của bạn đã được xác thực thành công! Bạn sẽ được chuyển đến trang đăng nhập...
                        </Alert>
                    )}
                    {status === 'error' && (
                        <Alert severity="error">
                            ❌ Xác thực thất bại! Token không hợp lệ hoặc đã hết hạn.
                        </Alert>
                    )}
                </Paper>
            </motion.div>
        </Container>
    );
};

export default VerifyEmail;
