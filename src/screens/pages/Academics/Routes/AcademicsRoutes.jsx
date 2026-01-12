import { Routes, Route, Navigate } from "react-router-dom";
import AcademicsLayout from "../AcademicsLayout";
import AddAcademic from "../Academic year/AddAcademic";
import EditAcademic from "../Academic year/EditAcademic";
import AcademicPage from "../Academic year/AcademicPage";
import CollegePage from "../College/CollegePage";
import AddNewCollege from "../College/AddNewCollege";
import EditCollege from "../College/EditCollege";
import RolesPage from "../Role/RolesPage";
import AddRole from "../Role/AddRole";
import EditRole from "../Role/EditRole";
import CategoryPage from "../Category/CategoryPage";
import AddCategory from "../Category/AddCategory";
import EditCategory from "../Category/EditCategory";
import SubCategoryPage from "../Sub-Category/SubCategoryPage";
import AddSubCategory from "../Sub-Category/AddSubCategory";
import EditSubCategory from "../Sub-Category/EditSubCategory";
import AddProgram from "../Program/AddProgram";
import EditProgram from "../Program/EditProgram";
import ProgramPage from "../Program/ProgramPage";
import ClassPage from "../Class/ClassPage";
import AddClass from "../Class/AddClass";
import EditClass from "../Class/EditClass";
import DivisionPage from "../Division/DivisionPage";
import AddDivision from "../Division/AddDivision";
import EditDivision from "../Division/EditDivision";
import BatchPage from "../Batch/BatchPage";
import AddBatch from "../Batch/AddBatch";
import EditBatch from "../Batch/EditBatch";
import AddNewCourse from "../Course/AddNewCourse";
import EditCourse from "../Course/EditCourse";
import CoursePage from "../Course/CoursePage";
import DepartmentPage from "../Department/DepartmentPage";
import AddDepartment from "../Department/AddDepartment";
import EditDepartment from "../Department/EditDepartment";
import AllocateProgram from "../Program/AllocateProgram";
import AllocationPage from "../Allocation/AllocationPage";
import AddAllocation from "../Allocation/AddAllocation";
import EditAllocation from "../Allocation/EditAllocation";
// import AcademicPage from "../Academic year/AcademicPage";

export default function AcademicsRoutes() {
  return (
    <Routes>
      {/* ✅ When /academics is visited → redirect to /academics/college */}
      <Route path="/" element={<Navigate to="college" replace />} />

      <Route element={<AcademicsLayout />}>
        <Route path="/academicyear" element={<AcademicPage />} /> 
        <Route path="/academicyear/add" element={<AddAcademic />} />
        <Route path="/academicyear/edit/:id" element={<EditAcademic />} />
        <Route path="college" element={<CollegePage />} />
        <Route path="college/add" element={<AddNewCollege />} />
        <Route path="college/edit/:id" element={<EditCollege />} />
        <Route path="role" element={<RolesPage />} />
        <Route path="role/add" element={<AddRole />} />
        <Route path="role/edit/:id" element={<EditRole />} />
        <Route path="category" element={<CategoryPage />} />
        <Route path="category/add" element={<AddCategory />} />
        <Route path="category/edit/:id" element={<EditCategory />} />
        <Route path="subcategory" element={<SubCategoryPage />} />
        <Route path="subcategory/add" element={<AddSubCategory />} />
        <Route path="subcategory/edit/:id" element={<EditSubCategory />} />
        <Route path="program" element={<ProgramPage />} />
        <Route path="program/add" element={<AddProgram />} />
        <Route path="program/edit/:id" element={<EditProgram />} />
        <Route path="program/allocate/:programId" element={<AllocateProgram />} />
        <Route path="class" element={<ClassPage />} />
        <Route path="class/add" element={<AddClass />} />
        <Route path="class/edit/:id" element={<EditClass />} />
        <Route path="division" element={<DivisionPage />} />
        <Route path="division/add" element={<AddDivision />} />
        <Route path="division/edit/:id" element={<EditDivision />} />
        <Route path="batch" element={<BatchPage />} />
        <Route path="batch/add" element={<AddBatch />} />
        <Route path="batch/edit/:id" element={<EditBatch />} />
        <Route path="course" element={<CoursePage />} />
        <Route path="course/add" element={<AddNewCourse />} />
        <Route path="course/edit/:id" element={<EditCourse />} />
        <Route path="department" element={<DepartmentPage />} />
        <Route path="department/add" element={<AddDepartment />} />
        <Route path="department/edit/:id" element={<EditDepartment />} />
        <Route path="allocation" element={<AllocationPage />} />
        <Route path="allocation/add" element={<AddAllocation />} />
        <Route path="allocation/edit/:id" element={<EditAllocation />} />
      </Route>
    </Routes>
  );
}
