import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../../redux/slices/authSlice"; // Thêm import này

const OAuthSuccess = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");

        if (token) {
            try {
                // Giải mã token để lấy thông tin user
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64));
                const user = JSON.parse(jsonPayload);

                // Lưu token và thông tin user
                localStorage.setItem("token", token);
                localStorage.setItem("user", JSON.stringify({
                    _id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    plan: user.plan,
                    isVerified: true,
                    avatar: user.avatar || ''
                }));

                // Cập nhật Redux store
                dispatch(setUser({
                    _id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    plan: user.plan,
                    isVerified: true,
                    avatar: user.avatar || ''
                }));

                // Chuyển hướng đến dashboard
                navigate("/dashboard", { replace: true });
            } catch (error) {
                console.error('❌ Lỗi xử lý thông tin đăng nhập:', error);
                navigate("/login?error=OAuthFail", { replace: true });
            }
        } else {
            navigate("/login?error=OAuthFail", { replace: true });
        }
    }, [navigate, dispatch]);

    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh' 
        }}>
            Đang xử lý đăng nhập...
        </div>
    );
};

export default OAuthSuccess;
