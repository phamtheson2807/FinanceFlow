import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const OAuthSuccess = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");

        if (token) {
            localStorage.setItem("token", token);
            console.log("✅ Token saved:", token); // Debug token
            navigate("/dashboard");
        } else {
            navigate("/login?error=OAuthFail");
        }
    }, [navigate]);

    return <div>Đang xử lý đăng nhập...</div>;
};

export default OAuthSuccess;
