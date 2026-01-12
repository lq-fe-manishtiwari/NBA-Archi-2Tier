import { Routes, Route, Navigate } from "react-router-dom";
import CoursesLayout from "../CoursesLayout";
import PaperDashboard from "../Paper/PaperDashboard";
import ModuleDashboard from "../Module/ModuleDashboard";
import AddModule from "../Module/AddModule";
import EditModule from "../Module/EditModule";
import AddPaper from "../Paper/AddPaper";
import EditPaper from "../Paper/EditPaper";
import UnitDashboard from "../Unit/UnitDashboard";
import AddUnit from "../AddUnit";
import EditUnit from "../Unit/EditUnit";
import SettingsLayout from "../SettingsLayout";
import PaperTypeDashboard from "../Settings/PaperTypeDashboard";
import VerticalNumberDashboard from "../Settings/VerticalNumberDashboard";
import SubjectModeDashboard from "../Settings/SubjectModeDashboard";
import SpecializationDashboard from "../Settings/SpecializationDashboard";
import AddSettings from "../Settings/AddSettings";
import BulkUploadModule from "../Module/BulkUploadModule";
import BulkUploadPaper from "../Paper/BulkUploadPaper";
import BulkUploadUnit from "../Unit/BulkUploadUnit";
import EditSettings from "../Settings/EditSettings";

const CoursesReport = () => <div>Courses Report Content</div>;

export default function CoursesRoutes() {
    return (
        <Routes>
            {/* When /courses is visited → redirect to /courses/dashboard */}
            <Route path="/" element={<Navigate to="paper" replace />} />

            <Route element={<CoursesLayout />}>
                <Route path="paper" element={<PaperDashboard />} />
                <Route path="module" element={<ModuleDashboard />} />
                <Route path="unit" element={<UnitDashboard />} />
                <Route path="report" element={<CoursesReport />} />
            </Route>
            <Route element={<CoursesLayout />}>
                <Route path="paper" element={<PaperDashboard />} />
                <Route path="report" element={<CoursesReport />} />
                <Route path="/add-paper" element={<AddPaper />} />
                <Route path="/edit-paper/:id" element={<EditPaper />} />
                <Route path="/bulk-upload" element={<BulkUploadPaper />} />
                <Route path="module/add-module" element={<AddModule />} />
                <Route path="module/module-edit/:id" element={<EditModule />} />
                <Route path="module/bulk-upload" element={<BulkUploadModule />} />                
                <Route path="edit-unit/:id" element={<EditUnit />} />
                <Route path="/add-unit" element={<AddUnit />} />
                <Route path="/bulk-upload-unit" element={<BulkUploadUnit />} />
                

            </Route>

            <Route path="settings" element={<SettingsLayout />}>
                {/* Redirect /courses/settings → /courses/settings/paper-type */}
                <Route index element={<Navigate to="paper-type" replace />} />

                {/* Example sub-page (replace with your actual components) */}
                <Route path="paper-type" element={<PaperTypeDashboard />} />
                <Route path="vertical-number" element={<VerticalNumberDashboard />} />
                <Route path="subject-mode" element={<SubjectModeDashboard />} />
                <Route path="specialization" element={<SpecializationDashboard />} />
                <Route path="add/:type" element={<AddSettings />} />
                <Route path="edit/:type/:id" element={<EditSettings />} />
            </Route>
        </Routes>
    );
}
