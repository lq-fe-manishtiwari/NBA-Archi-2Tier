import { Routes, Route, Navigate } from "react-router-dom";
// import StudentList from "../Dashboard/StudentList";
import StudentLayout from "../StudentLayout";
import AddStudentForm from "../AddStudent/AddStudentForm";
import StudentViewDetails from "../Components/StudentViewDetails";
import AllocatedStudent from "../Dashboard/AllocatedStudent";
import NonAllocatedStudent from "../Dashboard/NonAllocatedStudent";
import AtktStudent from "../Dashboard/AtktStudent";
import PromoteStudent from "../Components/PromoteStudent";

export default function StudentRoutes() {
  return (
    <Routes>
      {/* ✅ Redirect to list when visiting /student */}
      <Route path="/" element={<Navigate to="Allocated" replace />} />
      
      {/* ✅ Student list route */}
      <Route element={<StudentLayout />}>
        <Route path="Allocated" element={<AllocatedStudent />} />
        <Route path="Non-Allocated" element={<NonAllocatedStudent />} />
      
        <Route path="ATKT" element={<AtktStudent />} />
      </Route>
      
      {/* ✅ Add student route */}
      <Route path="/add-student" element={<AddStudentForm />} />
      {/* ✅ Edit student route */}
       <Route path="/edit-student/:id" element={<AddStudentForm />} />
       {/* ✅ View student route */}
       <Route path="/view-student/:id" element={<StudentViewDetails />} />

       <Route path="/promotion" element={<PromoteStudent />} />
      
    </Routes>
  );
}
