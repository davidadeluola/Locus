import { useEffect, useState } from "react";
import { supabase } from "../../../api/supabase";
import authRepository from '../../../services/repositories/authRepository.js';
// TODO(MIGRATE): Replace direct sign-up calls with `authRepository` methods.
import { useAuthStore } from "../../../store/authStore";
import {
  buildProfilePayload,
  checkExistingProfileByEmail,
  fetchSchools,
  initiateSignup,
  upsertProfile,
  verifySignupOtp,
} from "../services/signupService";

const INITIAL_FORM = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "",
  faculty: "",
  department: "",
  level: "",
  matricNo: "",
  staffId: "",
};

const validateInitialForm = (formData, selectedSchool) => {
  if (formData.password !== formData.confirmPassword) return "Passwords do not match";
  if (formData.password.length < 8) return "Password must be at least 8 characters";
  if (!selectedSchool) return "Please select a school";
  if (!formData.role) return "Please select a role";
  if (!formData.faculty || !formData.department) return "Faculty and department are required";
  if (formData.role === "student" && (!formData.matricNo || !formData.level)) {
    return "Student matric number and level are required";
  }
  if (formData.role === "lecturer" && !formData.staffId) {
    return "Staff ID is required for lecturer";
  }
  return "";
};

const mapProfileError = (err) => {
  const message = String(err?.message || "");
  if (message.includes("row-level security policy")) {
    return "DATABASE ERROR: Permission denied. Database RLS policy issue.";
  }
  if (message.includes("foreign key constraint")) {
    return "DATABASE ERROR: Invalid school selected. Please try another school.";
  }
  if (message.includes("duplicate key")) {
    return "DATABASE ERROR: User already exists. Please sign in instead.";
  }
  if (message.includes("column")) {
    return "DATABASE ERROR: Database schema mismatch - check column names.";
  }
  return "INVALID_CIPHER: The security code is incorrect or has expired.";
};

export const useSignupFlow = ({ onVerified }) => {
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [schools, setSchools] = useState([]);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const fetchProfile = useAuthStore((state) => state.fetchProfile);

  useEffect(() => {
    const loadSchools = async () => {
      try {
        const data = await fetchSchools(supabase);
        setSchools(data);
      } catch (err) {
        console.error("Failed to fetch schools:", {
          message: err?.message,
          details: err?.details,
          hint: err?.hint,
          code: err?.code,
        });
      }
    };

    loadSchools();
  }, []);

  const setFieldValue = (name, value) => {
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFieldValue(name, value);
  };

  const handleInitialSignup = async (event) => {
    event.preventDefault();
    setError("");

    const validationError = validateInitialForm(formData, selectedSchool);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const existingProfile = await checkExistingProfileByEmail(supabase, formData.email);
      if (existingProfile) {
        setError("This email is already registered. Please sign in instead.");
        return;
      }

      const { data, normalizedEmail } = await initiateSignup(
        supabase,
        formData.email,
        formData.password,
        `${window.location.origin}/auth/callback`
      );

      if (!data?.user) {
        setError("Account creation failed - no user data returned");
        return;
      }

      if (Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        setError("This email is already registered. Please sign in instead.");
        return;
      }

      if (data.session?.user?.id) {
        const profileData = buildProfilePayload(formData, selectedSchool, data.session.user.id);
        await upsertProfile(supabase, profileData);
        await fetchProfile(data.session.user.id);
        onVerified();
        return;
      }

      console.log("Signup initiated. Awaiting OTP verification for:", normalizedEmail);
      setVerifying(true);
    } catch (err) {
      if (String(err?.message || "").includes("User already registered")) {
        setError("This email is already registered. Please sign in instead.");
      } else if (String(err?.message || "").includes("Invalid")) {
        setError("Invalid email or password format");
      } else {
        setError(`Signup failed: ${err?.message || "Unknown error"}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndComplete = async () => {
    setLoading(true);
    setError("");

    try {
      if (otp.trim().length !== 6) {
        setError("INVALID_CIPHER: Enter the 6-digit security code.");
        return;
      }

      const verifyData = await verifySignupOtp(supabase, formData.email, otp);
      if (!verifyData?.user) {
        setError("Verification failed - no user data returned");
        return;
      }

      const profileData = buildProfilePayload(formData, selectedSchool, verifyData.user.id);
      await upsertProfile(supabase, profileData);
      await fetchProfile(verifyData.user.id);
      setVerifying(false);
      onVerified();
    } catch (err) {
      setError(mapProfileError(err));
    } finally {
      setLoading(false);
    }
  };

  return {
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
  };
};
