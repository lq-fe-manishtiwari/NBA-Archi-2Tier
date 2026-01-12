import { Routes, Route, Navigate } from "react-router-dom";
import TeacherList from "../DashBoard/TeacherList";
import TeacherLayout from "../TeacherLayout";
import { AddTeacher } from "../AddTeacher/AddTeacher";
import TeacherViewProfile from "../DashBoard/TeacherViewProfile";

export default function TeacherRoutes() {
  return (
    <Routes>
      {/* ✅ When /teacher is visited → redirect to /teacher/list */}

      <Route path="/" element={<TeacherLayout />} />

      <Route element={<TeacherLayout />}>
        
        {/* <Route
          path="/teacher-view-profile/:teacher_id"
          element={<TeacherViewProfile />}
        /> */}
       
      </Route>
      <Route path="/teacher-edit/:teacher_id" element={<AddTeacher />} />
      <Route path="/teacher-view/:teacher_id" element={<TeacherViewProfile />} />
      <Route path="/add-teacher" element={<AddTeacher />} />
    
    </Routes>
  );
}