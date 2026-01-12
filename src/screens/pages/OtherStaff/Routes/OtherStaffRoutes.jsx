import { Routes, Route, Navigate } from "react-router-dom";
import OtherStaffLayout from "../OtherStaffLayout";
import Dashboard from "../Dashboard/Dashboard";
import AddOtherStaff from "../AddOtherStaff/AddOtherStaff";
import EditOtherStaff from "../AddOtherStaff/EditOtherStaff";
import ViewOtherStaff from "../Dashboard/ViewOtherStaff";
const OtherStaffReport = () => <div>Other Staff Report Content</div>;

export default function OtherStaffRoutes() {
  return (
    <Routes>
      {/* When /other-staff is visited → redirect to /other-staff/dashboard */}
      <Route path="/" element={<Navigate to="dashboard" replace />} />

      <Route element={<OtherStaffLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="report" element={<OtherStaffReport />} />
      </Route>

      <Route path="/add-OtherStaff" element={<AddOtherStaff />} />
      <Route path="/view-other-staff/:id" element={<ViewOtherStaff />} />
      <Route path="/edit-other-staff/:id" element={<EditOtherStaff />} />
    </Routes>
  );
}
