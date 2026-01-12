import React, { useState, useEffect, useCallback } from "react";
import SweetAlert from "react-bootstrap-sweetalert";
import { newnbaCriteria5Service } from "../../Services/NewNBA-Criteria5.service";
import { toast } from "react-toastify";
import StatusBadge from "../StatusBadge";
import {
  Trash2, Plus, FileText, Save, CheckCircle,
  Upload, X, Edit, Calculator, Users, Hash, Download
} from "lucide-react";
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Criterion5_AForm = ({
  cycle_sub_category_id,
  other_staff_id,
  isEditable = true,
  onSaveSuccess,
  nba_contributor_allocation_id,
  cardItem = null,
  nba_accredited_program_id,
  programId,
}) => {
  const location = useLocation();
  const stateFromRoute = location.state || {};
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);
  const [tableRows, setTableRows] = useState([]);
  const [recordId, setRecordId] = useState(null);
  const [approvalStatus, setApprovalStatus] = useState(null);
  const [userRole, setUserRole] = useState({});
  const [loadingPrequalified, setLoadingPrequalified] = useState(false);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    setUserRole(userInfo);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
      const userInfo2 = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const staffIdToUse = other_staff_id  || userInfo?.rawData?.other_staff_id || userInfo2?.other_staff_id;

      if (!cycle_sub_category_id || !staffIdToUse) {
        setTableRows([{ sn: 1 }]);
        setLoading(false);
        return;
      }

      const response = await newnbaCriteria5Service.getCriteria5_A_Data(cycle_sub_category_id, staffIdToUse);
      
      const data = Array.isArray(response) ? response[0] : response;

      if (data && data.faculty_info_id && data.faculty_details) {
        setRecordId(data.faculty_info_id);

        const statusData = cardItem || data;
        if (statusData.approval_status) {
          setApprovalStatus({
            status: statusData.approval_status,
            rejectionReason: statusData.rejection_reason,
            approvalReason: statusData.approval_status === 'APPROVED' ? statusData.rejection_reason : null,
            approvedByName: statusData.approved_by_name,
          });
        }

        const formattedRows = data.faculty_details.map((row, index) => ({
          ...row,
          sn: index + 1,
        }));
        setTableRows(formattedRows.length > 0 ? formattedRows : [{ sn: 1 }]);
      } else {
        setTableRows([{ sn: 1 }]);
        setRecordId(null);
      }
    } catch (error) {
      console.error("Failed to load data for 5A:", error);
      setTableRows([{ sn: 1 }]);
      if (error.response && error.response.status !== 404) {
        toast.error("Failed to load faculty details.");
      }
    } finally {
      setLoading(false);
    }
  }, [cycle_sub_category_id, other_staff_id, nba_contributor_allocation_id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Function to map API response to form fields
  const mapPrequalifiedDataToFormFields = (apiData) => {
    if (!Array.isArray(apiData)) {
      console.warn("API data is not an array:", apiData);
      return [];
    }
    
    return apiData.map((faculty, index) => ({
      sn: index + 1,
      name: faculty.name || "",
      pan_no: faculty.pan || "",
      apaar_id: faculty.apaar_id || "",
      highest_degree: faculty.degree || "",
      university: faculty.university || "",
      area_of_specialization: faculty.specialization || "",
      date_of_joining: faculty.doj || "",
      experience_current_institute: faculty.exp_institute || "",
      experience_joining: "", // Not provided in API response
      designation_at_joining: faculty.designation_join || "",
      present_designation: faculty.current_designation || "",
      date_professor: faculty.promotion_date || "",
      date_associate_professor: "", // Not provided in API response
      assistant_professor_regular: "", // Not provided in API response
      nature_of_association: faculty.nature || "",
      full_time_part_time: faculty.full_part || "",
      currently_associated: faculty.associated || "",
      date_of_leaving: faculty.date_leaving || "",
    }));
  };

  // Function to fetch prequalified data
  const fetchPrequalifiedData = async () => {
    if (!nba_accredited_program_id && !programId) {
      toast.error("Program ID is required to fetch prequalified data");
      return;
    }

    // Show confirmation dialog before replacing existing data
    if (tableRows.length > 1 || (tableRows.length === 1 && tableRows[0].name)) {
      const confirmReplace = window.confirm(
        "This will replace all existing faculty data. Are you sure you want to continue?"
      );
      if (!confirmReplace) {
        return;
      }
    }

    setLoadingPrequalified(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
      const userInfo2 = JSON.parse(localStorage.getItem("userInfo") || "{}");
      
      // Extract required parameters similar to InstituteInformation.jsx
      const partAId = stateFromRoute.nba_accredited_program_id || stateFromRoute.cycleId || nba_accredited_program_id;
      const collegeId = stateFromRoute.collegeId || userInfo?.rawData?.college_id || userInfo2?.college_id || 1;
      const programIdToUse = stateFromRoute.programId || programId || nba_accredited_program_id;

      console.log("Fetching prequalified data with params:", {
        partAId,
        collegeId,
        programId: programIdToUse
      });

      const response = await newnbaCriteria5Service.getPrequalifierdatain5_A(
        partAId,
        collegeId,
        programIdToUse
      );

      console.log("Prequalified data response:", response);

      if (response && Array.isArray(response) && response.length > 0) {
        const mappedData = mapPrequalifiedDataToFormFields(response);
        setTableRows(mappedData);
        toast.success(`${response.length} faculty records loaded from prequalified data`);
      } else if (response && !Array.isArray(response)) {
        // Handle single object response
        const mappedData = mapPrequalifiedDataToFormFields([response]);
        setTableRows(mappedData);
        toast.success("1 faculty record loaded from prequalified data");
      } else {
        toast.info("No prequalified faculty data found");
      }
    } catch (error) {
      console.error("Failed to fetch prequalified data:", error);
      const errorMessage = error.response?.data?.message || error.message || "Unknown error";
      toast.error("Failed to fetch prequalified data: " + errorMessage);
    } finally {
      setLoadingPrequalified(false);
    }
  };

  const addRow = () => {
    setTableRows((prev) => [...prev, { sn: prev.length + 1 }]);
  };

  const removeRow = (index) => {
    setTableRows((prev) =>
      prev.filter((_, i) => i !== index).map((row, i) => ({ ...row, sn: i + 1 }))
    );
  };

  const updateCell = (index, field, value) => {
    setTableRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  const handleSave = async () => {
    const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
    const userInfo2 = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const staffId = other_staff_id  || userInfo?.rawData?.other_staff_id || userInfo2?.other_staff_id;

    if (!staffId || !cycle_sub_category_id) {
      setAlert(
        <SweetAlert danger title="Error" onConfirm={() => setAlert(null)}>
          Required fields missing!
        </SweetAlert>
      );
      return;
    }

    setSaving(true);
    try {
      const faculty_details_array = tableRows.map((row) => ({
        sn: row.sn,
        name: row.name || "",
        pan_no: row.pan_no || "",
        apaar_id: row.apaar_id || "",
        highest_degree: row.highest_degree || "",
        university: row.university || "",
        area_of_specialization: row.area_of_specialization || "",
        date_of_joining: row.date_of_joining || "",
        experience_current_institute: row.experience_current_institute || "",
        experience_joining: row.experience_joining || "",
        designation_at_joining: row.designation_at_joining || "",
        present_designation: row.present_designation || "",
        date_professor: row.date_professor || "",                    // NEW
        date_associate_professor: row.date_associate_professor || "", // NEW
        assistant_professor_regular: row.assistant_professor_regular || "",
        nature_of_association: row.nature_of_association || "",
        full_time_part_time: row.full_time_part_time || "",
        currently_associated: row.currently_associated || "",
        date_of_leaving: row.date_of_leaving || "",
      }));

      const payload = {
        other_staff_id: parseInt(staffId),
        cycle_sub_category_id: parseInt(cycle_sub_category_id),
        faculty_details: faculty_details_array,
      };

      console.log("Final Payload →", payload);
      
      let response;
      if (recordId) {
        response = await newnbaCriteria5Service.updateCriteria5_A_Data(recordId, payload);
        toast.success("Faculty Details updated successfully!");
      } else {
        response = await newnbaCriteria5Service.saveCriteria5_A_Data(payload);
        if (response.faculty_info_id) {
          setRecordId(response.faculty_info_id);
        }
        toast.success("Faculty Details saved successfully!");
      }
      
      setAlert(
        <SweetAlert success title="Saved!" onConfirm={() => { setAlert(null); onSaveSuccess?.(); }}>
          Faculty Details (Table 5A) saved successfully!
        </SweetAlert>
      );
    } catch (err) {
      setAlert(
        <SweetAlert danger title="Error" onConfirm={() => setAlert(null)}>
          {err.message || "Save failed"}
        </SweetAlert>
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!recordId) {
      toast.info("No data to delete.");
      return;
    }
    setAlert(
      <SweetAlert
        warning
        showCancel
        confirmBtnText="Yes, delete it!"
        cancelBtnText="Cancel"
        title="Are you sure?"
        onConfirm={confirmDelete}
        onCancel={() => setAlert(null)}
      >
        You won't be able to revert this!
      </SweetAlert>
    );
  };

  const confirmDelete = async () => {
    try {
      await newnbaCriteria5Service.deleteCriteria5_AData(recordId);
      setAlert(null);
      toast.success("Faculty details deleted successfully.");
      setRecordId(null);
      setTableRows([{ sn: 1 }]);
      onSaveSuccess?.();
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete data.");
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-32 text-2xl text-primary-600 font-medium">Loading Faculty Details...</div>;
  }

  return (
    <div className="p-8 bg-white rounded-xl shadow-2xl border border-gray-200">
         {approvalStatus && approvalStatus.status !== 'COORDINATORS_DATA' && userRole.nba_coordinator !== true && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <StatusBadge
                    status={approvalStatus.status}
                    rejectionReason={approvalStatus.rejectionReason}
                    approvalReason={approvalStatus.approvalReason}
                    approvedByName={approvalStatus.approvedByName}
                  />
                </div>
              </div>
            )}
            
      {alert}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Users className="w-12 h-12 text-primary-600" />
          <div>
            <h2 className="text-3xl font-bold text-primary-600">
              Criterion 5: Faculty Information (100)
            </h2>
            <p className="text-lg font-semibold text-gray-600">
              Table No. 5A: Faculty Details
            </p>
          </div>
        </div>

        {/* Action Buttons - Top Right */}
        {isEditable && (
          <div className="flex items-center gap-4">
            <button
              onClick={fetchPrequalifiedData}
              disabled={loadingPrequalified}
              className={`flex items-center gap-3 font-bold py-3 px-8 rounded-xl shadow-lg transition transform hover:scale-105 ${
                loadingPrequalified
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
              title="Load faculty data from prequalified records"
            >
              {loadingPrequalified ? (
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
              ) : (
                <Download size={24} />
              )}
              {loadingPrequalified ? "Loading..." : "Fetch Prequalifier Data"}
            </button>
            
          
          </div>
        )}
      </div>

      {/* Scrollable Table */}
      <div
        className="border border-gray-300 rounded-lg overflow-auto shadow-inner bg-gray-50"
        style={{ maxHeight: "70vh" }}
      >
        <style jsx>{`
          div::-webkit-scrollbar { width: 14px; height: 14px; }
          div::-webkit-scrollbar-track { background: #e5e7eb; border-radius: 8px; }
          div::-webkit-scrollbar-thumb { background: #6b7280; border-radius: 8px; border: 3px solid #e5e7eb; }
          div::-webkit-scrollbar-thumb:hover { background: #4b5563; }
        `}</style>

        <table className="min-w-[3400px] w-full text-sm border-collapse">
          <thead className="bg-gradient-to-r from-primary-600 to-primary-600 text-white sticky top-0 z-20">
            <tr>
              {[
                "S.N.",
                "Name of the Faculty",
                "PAN No.",
                "APAAR faculty ID*(if any)",
                "Highest Degree",
                "University",
                "Area of Specialization",
                "Date of Joining in this Institution",
                "Experience in years in current institute",
                "Experience in years at the time of joining",
                "Designation at Time Joining in this Institution",
                "Present Designation",
                "The date on which Designated as Professor if any",
                "The date on which Designated as Associate Professor if any",
                "Assistant Professor (Regular)",
                "Nature of Association (Regular/Contract/ Ad hoc)",
                "If contractual mention Full time or (Part time or hourly based)",
                "Currently Associated",
                "Date of Leaving if any",
              ].map((h, i) => (
                <th key={i} className="px-5 py-4 text-left font-semibold border-r border-primary-600 last:border-r-0 whitespace-nowrap">
                  {h}
                </th>
              ))}
              <th className="px-5 py-4 text-left font-semibold border-r border-primary-600 last:border-r-0 whitespace-nowrap">Actions</th>
            </tr>
          </thead>

          <tbody className="bg-white">
            {tableRows.map((row, index) => (
              <tr key={index} className="hover:bg-primary-50 transition-all even:bg-gray-50 border-b">
                <td className="px-5 py-3 text-center font-bold text-primary-700">{row.sn}</td>
                
                {/* Name */}
                <td className="border-r border-gray-200"><input type="text" disabled={!isEditable} value={row.name || ""} onChange={(e) => updateCell(index, "name", e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" placeholder="Enter name" /></td>
                {/* PAN */}
                <td className="border-r border-gray-200"><input type="text" disabled={!isEditable} value={row.pan_no || ""} onChange={(e) => updateCell(index, "pan_no", e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" /></td>
                {/* APAAR ID */}
                <td className="border-r border-gray-200"><input type="text" disabled={!isEditable} value={row.apaar_id || ""} onChange={(e) => updateCell(index, "apaar_id", e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" /></td>
                {/* Highest Degree */}
                <td className="border-r border-gray-200"><input type="text" disabled={!isEditable} value={row.highest_degree || ""} onChange={(e) => updateCell(index, "highest_degree", e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" /></td>
                {/* University */}
                <td className="border-r border-gray-200"><input type="text" disabled={!isEditable} value={row.university || ""} onChange={(e) => updateCell(index, "university", e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" /></td>
                {/* Specialization */}
                <td className="border-r border-gray-200"><input type="text" disabled={!isEditable} value={row.area_of_specialization || ""} onChange={(e) => updateCell(index, "area_of_specialization", e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" /></td>
                
                {/* Date of Joining */}
                <td className="border-r border-gray-200"><input type="date" disabled={!isEditable} value={row.date_of_joining || ""} onChange={(e) => updateCell(index, "date_of_joining", e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" /></td>
                
                {/* Experience Current */}
                <td className="border-r border-gray-200"><input type="text" disabled={!isEditable} value={row.experience_current_institute || ""} onChange={(e) => updateCell(index, "experience_current_institute", e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" /></td>
                {/* Experience Joining */}
                <td className="border-r border-gray-200"><input type="text" disabled={!isEditable} value={row.experience_joining || ""} onChange={(e) => updateCell(index, "experience_joining", e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" /></td>
                {/* Designation Joining */}
                <td className="border-r border-gray-200"><input type="text" disabled={!isEditable} value={row.designation_at_joining || ""} onChange={(e) => updateCell(index, "designation_at_joining", e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" /></td>
                {/* Present Designation */}
                <td className="border-r border-gray-200"><input type="text" disabled={!isEditable} value={row.present_designation || ""} onChange={(e) => updateCell(index, "present_designation", e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" /></td>
                
                {/* Date Professor */}
                <td className="border-r border-gray-200"><input type="date" disabled={!isEditable} value={row.date_professor || ""} onChange={(e) => updateCell(index, "date_professor", e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" /></td>
                {/* Date Associate Professor */}
                <td className="border-r border-gray-200"><input type="date" disabled={!isEditable} value={row.date_associate_professor || ""} onChange={(e) => updateCell(index, "date_associate_professor", e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" /></td>
                
                {/* Assistant Professor (Regular) Checkbox */}
                <td className="border-r border-gray-200"><input type="text" disabled={!isEditable} value={row.assistant_professor_regular || ""} onChange={(e) => updateCell(index, "assistant_professor_regular", e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" /></td>
                
                {/* Nature of Association */}
                <td className="border-r border-gray-200"><input type="text" disabled={!isEditable} value={row.nature_of_association || ""} onChange={(e) => updateCell(index, "nature_of_association", e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" /></td>
                {/* Full/Part time */}
                <td className="border-r border-gray-200"><input type="text" disabled={!isEditable} value={row.full_time_part_time || ""} onChange={(e) => updateCell(index, "full_time_part_time", e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" /></td>
                
                {/* Currently Associated (Y/N) */}
                <td className="border-r border-gray-200"><input type="text" disabled={!isEditable} value={row.currently_associated || ""} onChange={(e) => updateCell(index, "currently_associated", e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" /></td>
                
                {/* Date of Leaving */}
                <td className="border-r border-gray-200"><input type="date" disabled={!isEditable} value={row.date_of_leaving || ""} onChange={(e) => updateCell(index, "date_of_leaving", e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" /></td>
                
                {/* Actions */}
                <td className="text-center">
                  <button
                    onClick={() => removeRow(index)}
                    disabled={!isEditable || tableRows.length <= 1}
                    className="text-red-600 hover:text-red-800 p-3 transition disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
        <button
              onClick={addRow}
              className="flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition transform hover:scale-105"
            >
              <Plus size={24} />
              Add Faculty Row
            </button>

        {isEditable  && (
          <div className="text-center pt-10 flex gap-4 justify-center">
            <button
              onClick={handleSave}
              disabled={saving }
              className={`inline-flex items-center justify-center w-12 h-12 rounded-lg transition-all ${
                saving 
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl"
              }`}
              title={saving ? "Saving..." : " " ? "Not allowed to save" : "Save"}
            >
              {saving ? (
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
              ) : (
                <Save className="w-6 h-6" />
              )}
            </button>

            <button
              onClick={() => setIsEditMode(false)}
              disabled={saving}
              className="inline-flex items-center justify-center w-12 h-12 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition shadow-lg"
              title="Cancel"
            >
              <X className="w-6 h-6" />
            </button>

            <button
              onClick={handleDelete}
              className="inline-flex items-center justify-center w-12 h-12 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow-lg"
              title="Delete Section Data"
            >
              <Trash2 className="w-6 h-6" />
            </button>
          </div>
        )}

    </div>
  );
};

export default Criterion5_AForm;