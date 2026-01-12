import React from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import ViewNBAPartBOptimized from "../screens/pages/NEWNBA/ViewNBAPartBOptimized";
import NBACriteria1Optimized from "../screens/pages/NEWNBA/Criteria1/NBACriteria1Optimized";
import NBACriteria5Optimized from "../screens/pages/NEWNBA/Criteria1/NBACriteria5Optimized";
import AddNewGradeNBA from "../screens/pages/Grade/AddNewGradeNBA";

const NBARoutes = () => {
  return (
    <Routes>
      {/* NBA Parent Route */}
      <Route path="/" element={<Outlet />}>
        <Route path="view-part-b" element={<ViewNBAPartBOptimized />} />
        <Route path="criterion-1" element={<NBACriteria1Optimized />} />
        <Route path="criterion-5" element={<NBACriteria5Optimized />} />
        <Route path="add-grade-nba" element={<AddNewGradeNBA />} />
        <Route path="*" element={<div className="p-8 text-center text-gray-500">NBA Page Not Found</div>} />
      </Route>
    </Routes>
  );
};

export default NBARoutes;
