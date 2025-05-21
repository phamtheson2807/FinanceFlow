import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const OAuthSuccess = () => {
    const navigate = useNavigate();
    const { loginWithGoogle } = useAuth();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");

        if (token) {
            loginWithGoogle(token)
                .then(() => {
                    navigate("/dashboard", { replace: true });
                })
                .catch((err) => {
                    console.error("Đăng nhập Google thất bại:", err);
                    navigate("/login?error=OAuthFail", { replace: true });
                });
        } else {
            navigate("/login?error=OAuthFail", { replace: true });
        }
    }, [navigate, loginWithGoogle]);

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
