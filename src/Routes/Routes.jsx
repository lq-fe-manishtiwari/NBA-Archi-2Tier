// App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Auth & Dashboard
import Login from '../screens/Login/Dashboard/Login';
import Dashboard from '../screens/Dashboard/Dashboard.jsx';
import Homepage from "../screens/Homepage/Homepage";
import AdminForgotPassword from '../screens/Login/ForgotPassword.jsx';

// Module Routes (example)
import AcademicsRoutes from "../screens/pages/Academics/Routes/AcademicsRoutes.jsx";
import TeacherRoutes from "../screens/pages/Teacher/Routes/TeacherRoutes.jsx";
import CoursesRoutes from "../screens/pages/Courses/Routes/CoursesRoutes.jsx";
import OBERoutes from "../screens/pages/OBE/Routes/OBERoutes.jsx";
import OtherStaffRoutes from "../screens/pages/OtherStaff/Routes/OtherStaffRoutes.jsx";


// NBA Screens
import ViewNBADashboard from "../screens/pages/NEWNBA/ViewNBADashboard";
import ViewNBAPartBOptimized from "../screens/pages/NEWNBA/ViewNBAPartBOptimized";
import ViewPreQualifierOptimized from "../screens/pages/NEWNBA/ViewPreQualifierOptimized";
import ViewPrequalifierPartA from "../screens/pages/NEWNBA/ViewPrequalifierPartA";
import ViewPrequalifierPartB from "../screens/pages/NEWNBA/ViewPrequalifierPartB";
import ViewInstitutionInformation from "../screens/pages/NEWNBA/ViewInstitutionInformation";
import NBACriteria1Optimized from "../screens/pages/NEWNBA/Criteria1/NBACriteria1Optimized";
import NBACriteria2Optimized from "../screens/pages/NEWNBA/Criteria2/NBACriteria2Optimized";
import NBACriteria5Optimized from "../screens/pages/NEWNBA/Criteria5/NBACriteria5Optimized";
import NBACriteria6Optimized from "../screens/pages/NEWNBA/Criteria6/NBACriteria6Optimized";
import NBACriteria7Optimized from "../screens/pages/NEWNBA/Criteria7/NBACriteria7Optimized";
import NBACriteria3Optimized from '../screens/pages/NEWNBA/Criteria3/NBACriteria3Optimized';
import NBACriteria4Optimized from '../screens/pages/NEWNBA/Criteria4/NBACriteria4Optimized';
import NBACriteria8Optimized  from '../screens/pages/NEWNBA/Criteria8/NBACriteria8Optimized.jsx';
import NBACriteria9Optimized from '../screens/pages/NEWNBA/Criteria9/NBACriteria9Optimized.jsx';
import InstituteInformation from '../screens/pages/NEWNBA/Part-A/InstituteInformation.jsx';
import GraphPage from '../screens/pages/NEWNBA/GraphPage.jsx';

const ProtectedRoute = ({ children }) => {
  const isLoggedIn = !!localStorage.getItem('refreshToken');
  return isLoggedIn ? children : <Navigate to="/dashboard" replace />;
};

const PublicRoute = ({ children }) => {
  const isLoggedIn = !!localStorage.getItem('refreshToken');
  return isLoggedIn ? <Navigate to="/dashboard" replace /> : children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/admin-forgot-password" element={<PublicRoute><AdminForgotPassword /></PublicRoute>} />

        {/* Dashboard */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Homepage>
              <Dashboard />
            </Homepage>
          </ProtectedRoute>
        } />
        {/* OBE */}
        <Route path="/obe/*" element={
          <ProtectedRoute>
            <Homepage>
              <OBERoutes />
            </Homepage>
          </ProtectedRoute>
        } />

        {/* Module Routes */}
        <Route path="/academics/*" element={<ProtectedRoute><Homepage><AcademicsRoutes /></Homepage></ProtectedRoute>} />
        <Route path="/teacher-list/*" element={<ProtectedRoute><Homepage><TeacherRoutes /></Homepage></ProtectedRoute>} />
        <Route path="/teacher-list" element={<ProtectedRoute><Homepage><TeacherRoutes /></Homepage></ProtectedRoute>} />
        <Route path="/courses/*" element={<ProtectedRoute><Homepage><CoursesRoutes /></Homepage></ProtectedRoute>} />
        <Route path="/other-staff/*" element={<ProtectedRoute><Homepage><OtherStaffRoutes /></Homepage></ProtectedRoute>} />
  
        {/* NBA Dashboard */}
        <Route path="/view-nba" element={<ProtectedRoute><Homepage><ViewNBADashboard /></Homepage></ProtectedRoute>} />
        {/* NBA Routes directly */}
        <Route path="/nba/view-part-b" element={<ProtectedRoute><Homepage><ViewNBAPartBOptimized /></Homepage></ProtectedRoute>} />
        <Route path="/nba/pre-qualifier" element={<ProtectedRoute><Homepage><ViewPreQualifierOptimized /></Homepage></ProtectedRoute>} />
        <Route path="/pre-qualifier/part-a" element={<ProtectedRoute><Homepage><ViewPrequalifierPartA /></Homepage></ProtectedRoute>} />
        <Route path="/pre-qualifier/part-b" element={<ProtectedRoute><Homepage><ViewPrequalifierPartB /></Homepage></ProtectedRoute>} />
        <Route path="/institution-information" element={<ProtectedRoute><Homepage><ViewInstitutionInformation /></Homepage></ProtectedRoute>} />
        <Route path="/nba/criterion-1" element={<ProtectedRoute><Homepage><NBACriteria1Optimized /></Homepage></ProtectedRoute>} />
        <Route path="/nba/criterion-2" element={<ProtectedRoute><Homepage><NBACriteria2Optimized /></Homepage></ProtectedRoute>} />
        <Route path="/nba/criterion-3" element={<ProtectedRoute><Homepage><NBACriteria3Optimized /></Homepage></ProtectedRoute>} />
        <Route path="/nba/criterion-4" element={<ProtectedRoute><Homepage><NBACriteria4Optimized /></Homepage></ProtectedRoute>} />
        <Route path="/nba/criterion-5" element={<ProtectedRoute><Homepage><NBACriteria5Optimized /></Homepage></ProtectedRoute>} />
        <Route path="/nba/criterion-6" element={<ProtectedRoute><Homepage><NBACriteria6Optimized /></Homepage></ProtectedRoute>} />
        <Route path="/nba/criterion-7" element={<ProtectedRoute><Homepage><NBACriteria7Optimized /></Homepage></ProtectedRoute>} />
        <Route path="/nba/criterion-8" element={<ProtectedRoute><Homepage><NBACriteria8Optimized /></Homepage></ProtectedRoute>} />
        <Route path="/nba/criterion-9" element={<ProtectedRoute><Homepage><NBACriteria9Optimized /></Homepage></ProtectedRoute>} />
        <Route path="/nba/criteria-part-a" element={<ProtectedRoute><Homepage><InstituteInformation /></Homepage></ProtectedRoute>} />
        <Route path="/nba/graph" element={<ProtectedRoute><Homepage><GraphPage /></Homepage></ProtectedRoute>} />

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
