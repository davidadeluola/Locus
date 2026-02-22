import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import DashboardLayout from "./DashboardLayout";
import StudentAttendancePage from "../../pages/StudentAttendancePage";
import StudentResourcesPage from "../../pages/StudentResourcesPage";
import LecturerStudentsPage from "../../pages/LecturerStudentsPage";
import LecturerCoursesPage from "../../pages/LecturerCoursesPage";
import LecturerAuditPage from "../../pages/LecturerAuditPage";

const StudentDashboard = lazy(() => import("./StudentDashboard"));
const LecturerDashboard = lazy(() => import("./LecturerDashboard"));

const DashboardRouter = () => {
  const { profile } = useAuthContext();

  return (
    <DashboardLayout>
      <Suspense fallback={<div className="font-mono text-orange-500">SYSTEM_BOOTING...</div>}>
        <Routes>
          {profile?.role === "lecturer" ? (
            <>
              <Route index element={<LecturerDashboard />} />
              <Route path="students" element={<LecturerStudentsPage />} />
              <Route path="courses" element={<LecturerCoursesPage />} />
              <Route path="audit" element={<LecturerAuditPage />} />
            </>
          ) : (
            <>
              <Route index element={<StudentDashboard />} />
              <Route path="attendance" element={<StudentAttendancePage />} />
              <Route path="resources" element={<StudentResourcesPage />} />
            </>
          )}
        </Routes>
      </Suspense>
    </DashboardLayout>
  );
};

export default DashboardRouter;
