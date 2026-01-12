import { Routes, Route, Navigate } from "react-router-dom";
import OBELayout from "../OBELayout";
import MappingLayout from "../Mapping/MappingLayout";
import CO_PO from "../Mapping/Dashboard/CO_PO";
import Peo_Mission from "../Mapping/Dashboard/Peo_Mission";
import ADD_CO_PO from "../Mapping/AddMapping/ADD_CO_PO"; 
import ADD_Peo_Mission from "../Mapping/AddMapping/ADD_Peo_Mission";
import PO_PSOLayout from "../PO-PSO/PO_PSOLayout";
import Direct from "../PO-PSO/Direct/Direct";
import Indirect from "../PO-PSO/Indirect/Indirect";
import BulkUploadIndirect from "../PO-PSO/Indirect/BulkUploadIndirect";
import SetTargetAttainment from "../PO-PSO/Indirect/SetTargetAttainment";
import MarksEntryLayout from "../MarksEntry/MarksEntryLayout";
import COAttainment from "../COAttainment/COAttainment";
import Overall from "../PO-PSO/Overall/Overall";
import SettingsLayout from "../SettingsLayout";
import Dashboard from "../Dashboard/Dashboard"; 
import AssignTeacherTable from "../AssignTeacher/AssignTeacherTable";
import AddAssignTeacher from "../AssignTeacher/AddAssignTeacher";
import ListVission from "../Settings/Vission/ListVission";
import AddVission from "../Settings/Vission/AddVission";
import ListMission from "../Settings/Mission/ListMission";
import AddMission from "../Settings/Mission/AddMission";
import ListPEO from "../Settings/PEO/ListPEO";
import AddPEO from "../Settings/PEO/AddPEO";
import ListPO from "../Settings/PO/ListPO";
import AddPO from "../Settings/PO/AddPO";
import ListPSO from "../Settings/PSO/ListPSO";
import AddPSO from "../Settings/PSO/AddPSO";
import ListCO from "../Settings/CO/ListCO";
import AddCO from "../Settings/CO/AddCO";
import EditCO from "../Settings/CO/EditCO";
import ListSemester from "../Settings/Semester/ListSemester";
import AddSemester from "../Settings/Semester/AddSemester";
import ListBloomLevel from "../Settings/BloomLevel/ListBloomLevel";
import AddBloomLevel from "../Settings/BloomLevel/AddBloomLevel";
import ListCourse from "../Settings/Courses/ListCourse";
import AddCourse from "../Settings/Courses/AddCourse";
import  ListInternal from "../Settings/InternalTools/ListInternal";
import AddInternal from "../Settings/InternalTools/AddInternal";
import ListExternal from "../Settings/ExternalTools/ListExternal";
import AddExternal from "../Settings/ExternalTools/AddExternal";
import EditExternal from "../Settings/ExternalTools/EditExternal";

const CoursesReport = () => <div>Courses Report Content</div>;

export default function OBERoutes() {
    return (
        <Routes>
            {/* When /courses is visited → redirect to /courses/dashboard */}
            <Route path="/" element={<Navigate to="dashboard" replace />} />

            <Route element={<OBELayout />}>
                <Route path="dashboard" element={<Dashboard />} /> 
                 <Route path="Marks-Entry" element={<MarksEntryLayout />} />
                 <Route path="CO-Attainment" element={<COAttainment />} />
                 <Route path="Assign-Teacher" element={<AssignTeacherTable />} />
                 <Route path="Assign-Teacher/AddAssignTeacher" element={<AddAssignTeacher />} />

                <Route path="Mapping" element={<MappingLayout />}> 
                  <Route index element={<Navigate to="PEO-MISSION" replace />} />  
                {/* Example sub-page (replace with your actual components) */}
                 <Route path="PEO-MISSION" element={<Peo_Mission />} />
                 <Route path="Add-PEO-MISSION" element={<ADD_Peo_Mission />} />
                 <Route path="CO-PO" element={<CO_PO />} />
                 <Route path="Add-CO-PO" element={<ADD_CO_PO />} />
                </Route>

                <Route path="PO-PSO-Attainment" element={<PO_PSOLayout />}> 
                  <Route index element={<Navigate to="Direct" replace />} />  
                {/* Example sub-page (replace with your actual components) */}
                 <Route path="Direct" element={<Direct />} />
                 <Route path="Indirect" element={<Indirect />} />
                 <Route path="Add-SetTarget" element={<SetTargetAttainment />} />
                 <Route path="Add-BulkUpload" element={<BulkUploadIndirect />} />
                 <Route path="Overall" element={<Overall />} />
                </Route>
            </Route>

            <Route path="settings" element={<SettingsLayout />}> 
                {/* Redirect /courses/settings → /courses/settings/paper-type */}
                  <Route index element={<Navigate to="VISION" replace />} />  

                {/* Example sub-page (replace with your actual components) */}
                <Route path="VISION" element={<ListVission />} />
                <Route path="MISSION" element={<ListMission />} />
                <Route path="PEO" element={<ListPEO />} />
                <Route path="PO" element={<ListPO />} />
                <Route path="PSO" element={<ListPSO />} />
                <Route path="SEMESTER" element={<ListSemester />} />
                <Route path="COURSES" element={<ListCourse />} />
                <Route path="CO" element={<ListCO />} />
                <Route path="BLOOM_LEVEL" element={<ListBloomLevel />} />
                <Route path="INTERNAL_TOOLS" element={<ListInternal />} />
                <Route path="EXTERNAL_TOOLS" element={<ListExternal />} />    

                <Route path="Add_VISION" element={<AddVission />} />
                <Route path="Add_MISSION" element={<AddMission />} />
                <Route path="Add_PEO" element={<AddPEO />} />
                <Route path="Add_PO" element={<AddPO />} />
                <Route path="Add_PSO" element={<AddPSO />} />
                <Route path="Add_SEMESTER" element={<AddSemester />} />
                <Route path="Add_COURSES" element={<AddCourse />} />
                <Route path="Add_CO" element={<AddCO />} />
                <Route path="Edit_CO" element={<EditCO />} />
                <Route path="Add_BLOOM_LEVEL" element={<AddBloomLevel />} />
                <Route path="Add_INTERNAL_TOOLS" element={<AddInternal />} />
                <Route path="Add_EXTERNAL_TOOLS" element={<AddExternal />} />
                <Route path="Edit_EXTERNAL_TOOLS" element={<EditExternal />} />     
            </Route>

            
        </Routes>
    );
}
