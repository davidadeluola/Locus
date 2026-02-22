import React from "react";
import { useNavigate } from "react-router-dom";
import OtpVerificationCard from "./components/OtpVerificationCard";
import SignupFormCard from "./components/SignupFormCard";
import { useSignupFlow } from "./hooks/useSignupFlow";
import { useGoogleAuth } from "../../hooks/useGoogleAuth";

const Signup = () => {
  const navigate = useNavigate();
  const {
    loading,
    verifying,
    otp,
    error,
    selectedSchool,
    schools,
    formData,
    setOtp,
    setSelectedSchool,
    setFieldValue,
    handleChange,
    handleInitialSignup,
    handleVerifyAndComplete,
  } = useSignupFlow({ onVerified: () => navigate("/dashboard") });

  const {
    signInWithGoogle,
    loading: googleLoading,
    error: googleError,
  } = useGoogleAuth();

  if (verifying) {
    return (
      <OtpVerificationCard
        email={formData.email}
        error={error}
        otp={otp}
        onOtpChange={setOtp}
        onSubmit={handleVerifyAndComplete}
        loading={loading}
      />
    );
  }

  return (
    <SignupFormCard
      error={error}
      googleError={googleError}
      loading={loading}
      googleLoading={googleLoading}
      formData={formData}
      schools={schools}
      selectedSchool={selectedSchool}
      onChange={handleChange}
      onRoleChange={(role) => setFieldValue("role", role)}
      onSchoolChange={(schoolId) => {
        const school = schools.find((item) => item.id === schoolId);
        setSelectedSchool(school || null);
      }}
      onSubmit={handleInitialSignup}
      onGoogleAuth={signInWithGoogle}
      onSignIn={() => navigate("/login")}
    />
  );
};

export default Signup;
