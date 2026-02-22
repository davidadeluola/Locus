import { useAuthContext } from "../context/AuthContext";

export const useUser = () => {
  const { user, profile, loading, signOut, activeSession, setActiveSession } = useAuthContext();

  const logout = async () => {
    await signOut();
    window.location.href = "/login";
  };

  return { 
    user, 
    profile, 
    loading, 
    activeSession,
    setActiveSession,
    logout 
  };
};
