import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const OAuthHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (token) {
      localStorage.setItem("token", token);
      navigate("/dashboard");
    } else {
      navigate("/login?error=OAuthFailed");
    }
  }, [navigate]);

  return <p>Đang xử lý đăng nhập...</p>;
};

export default OAuthHandler;
