import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import LoginFormCard from "./components/login/LoginFormCard";
import { useLoginFlow } from "./hooks/useLoginFlow";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/dashboard";
  const {
    email,
    password,
    error,
    loading,
    setEmail,
    setPassword,
    handleLogin,
    handleGoogleLogin,
  } = useLoginFlow({ onSuccess: () => navigate(from, { replace: true }) });

  return (
    <LoginFormCard
      email={email}
      password={password}
      error={error}
      loading={loading}
      setEmail={setEmail}
      setPassword={setPassword}
      onSubmit={handleLogin}
      onSignup={() => navigate("/signup")}
      onForgotPassword={() => navigate("/forgot-password")}
      onGoogle={handleGoogleLogin}
    />
  );
};

export default Login;