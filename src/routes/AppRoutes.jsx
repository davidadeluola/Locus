// import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// import NotFound from "../pages/NotFound";

import Layout from "../components/shared/Layout";
import Landing from "../components/Landing";
import ProtectedRoute from "../components/shared/ProtectedRoute";
import Login from '../features/auth/Login';
import Signup from '../features/auth/Signup';
import ForgotPassword from '../features/auth/ForgotPassword';
import AuthCallback from '../pages/auth/AuthCallback';
import UpdatePassword from '../pages/auth/UpdatePassword';
import DashboardRouter from '../features/dashboard/DashboardRouter';
// import Preloader from "../components/UI/Preloader";

const AppRoutes = () => {
  //   const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      {/* The Preloader overlay */}
      {/* {isLoading && <Preloader onComplete={() => setIsLoading(false)} />} */}

      {/* Main App Content Container */}
      <div
      // className={`transition-opacity duration-1000 ease-in-out bg-zinc-950 ${
      //   isLoading ? "opacity-0 h-screen overflow-hidden" : "opacity-100 min-h-screen"
      // }`}
      >
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Landing />} />
            <Route path="about" element={<Landing />} />
            <Route path="projects" element={<Landing />} />
            {/* <Route path="project/:slug" element={<ProjectDetailPage />} /> */}
            {/* <Route path="*" element={<NotFound />} /> */}
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/update-password" element={<UpdatePassword />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/onboarding" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard/*" element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />
         
        </Routes>
      </div>
    </>
  );
};

export default AppRoutes;
