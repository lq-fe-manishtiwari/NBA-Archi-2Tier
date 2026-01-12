// src/screens/pages/NEWNBA/Components/Criteria3/Criterion5_4Form.jsx
import React, { useState, useEffect, useCallback } from "react";
import GenericCriteriaForm5_4 from "./GenericCriteriaForm5_4";
import { newnbaCriteria5Service } from "../../Services/NewNBA-Criteria5.service";
import StatusBadge from "../StatusBadge";
import SweetAlert from "react-bootstrap-sweetalert";
import { toast } from "react-toastify";

const Criterion5_4Form = ({
  cycle_sub_category_id,
  other_staff_id,
  isEditable = true,
  onSaveSuccess,
  cardItem = null,
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [recordId, setRecordId] = useState(null);
  
  // Default empty data - इसे अलग variable में रखें
  const defaultInitialData = {
    content: { 
      "5.4": "5.4. Visiting/Adjunct Faculty/Professor of Practice (10)\n\n(Provide details of participation and contributions in teaching, learning, or practical work by visiting, adjunct, emeritus faculty, professors of practice, etc., from industry, research organizations & reputed institutions as well as retired professors, during the assessment period.)\n\n- Provision of visiting or adjunct faculty/emeritus professor/professor of practice etc. (01)\n- Minimum 50 hours per year of interaction with adjunct faculty from industry or research organization, retired professors, etc. (09)\n- A minimum of 50 hours of interaction in a year will result in 3 marks for that year (3 marks * 3 years = 9 marks)."
    },
    tableData: [],
    filesByField: {},
  };

  const [initialData, setInitialData] = useState(defaultInitialData);
  const [formKey, setFormKey] = useState(0); // 🔑 Add this for force re-render
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState(null);
  const [userRole, setUserRole] = useState({});

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    setUserRole(userInfo);
  }, []);

  // ---------------- CONFIG FOR 5.4 VISITING/ADJUNCT FACULTY ----------------
  const config = {
    title: "5.4. Visiting/Adjunct Faculty/Professor of Practice",
    totalMarks: 10,
    fields: [
      {
        name: "5.4",
        label: "5.4. Visiting/Adjunct Faculty/Professor of Practice",
        marks: 10,
        hasTable: true,
        tableConfig: {
          title: "Table No. 5.4.1: List of visiting/adjunct faculty/professor of practice and their teaching and practical loads.",
          columns: [
            { field: "sn", header: "S.N.", type: "autoNumber" },
            { field: "name", header: "Name of the Person", type: "text" },
            { field: "designation", header: "Designation & Organization", type: "text" },
            { field: "course", header: "Name of the Course", type: "text" },
            { field: "hours", header: "No. of hours handled", type: "number" },
          ],
          yearSections: [
            { year: "CAYm1", label: "CAYm1" },
            { year: "CAYm2", label: "CAYm2" },
            { year: "CAYm3", label: "CAYm3" }
          ],
        }
      }
    ],
  };

  // ---------------- LOAD DATA ----------------
  const loadData = useCallback(async () => {
    if (!cycle_sub_category_id || !other_staff_id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Load data for specific staff and cycle
      const response = await newnbaCriteria5Service.getCriteria5_4_Data(
        cycle_sub_category_id, 
        other_staff_id
      );

      const data = Array.isArray(response) ? response[0] : response;

      if (data) {
        setRecordId(data.visiting_faculty_id || data.visitingFacultyId || data.id);
        
        const statusData = cardItem || data;
        if (statusData.approval_status) {
          setApprovalStatus({
            status: statusData.approval_status,
            rejectionReason: statusData.rejection_reason,
            approvalReason: statusData.approval_status === 'APPROVED' ? statusData.rejection_reason : null,
            approvedByName: statusData.approved_by_name,
            submittedTime: statusData.submitted_time
          });
        } else {
          setApprovalStatus(null);
        }

        // Format table data from API response
        let formattedTableData = [];
        if (data.visiting_faculty_table && data.visiting_faculty_table.length > 0) {
          formattedTableData = data.visiting_faculty_table.map((item, index) => ({
            id: `row-${Date.now()}-${index}`,
            sn: index + 1,
            name: item.name || "",
            designation: item.designation || "",
            course: item.course || "",
            hours: item.hours?.toString() || "",
            year: item.year || "CAYm1",
          }));
        }

        // Format files from API response
        const formattedFiles = (data.supporting_documents || []).map((doc, index) => ({
          id: `file-${Date.now()}-${index}`,
          filename: doc.file_name || "",
          url: doc.file_url || "",
          description: doc.description || "",
          category: doc.category || "Visiting Faculty Documents",
          s3Url: doc.file_url || "",
        }));

        setInitialData({
          content: { 
            "5.4": data.visiting_faculty_description || config.fields[0].content || defaultInitialData.content["5.4"]
          },
          tableData: formattedTableData,
          filesByField: {
            "5.4": formattedFiles, 
          },
          approval_status: data.approval_status,
          rejection_reason: data.rejection_reason,
          approved_by_name: data.approved_by_name,
          submitted_time: data.submitted_time || data.created_at,
        });
        
      } else {
        // No existing data, set defaults
        console.log("📭 No existing data found, resetting to defaults");
        setRecordId(null);
        setApprovalStatus(null);
        setInitialData(defaultInitialData);
      }
    } catch (err) {
      console.warn("Load failed:", err);
      setRecordId(null);
      setApprovalStatus(null);
      setInitialData(defaultInitialData);
    } finally {
      setLoading(false);
    }
  }, [cycle_sub_category_id, other_staff_id]);

  useEffect(() => {
    if (cycle_sub_category_id && other_staff_id) {
      console.log("🚀 Loading data for 5.4...");
      loadData();
    }
  }, [cycle_sub_category_id, other_staff_id, loadData]);

  // ---------------- SAVE DATA ----------------
  const handleSave = async (formData) => {
    console.log("handleSave called with formData:", formData);
    
    if (!other_staff_id || !cycle_sub_category_id) {
      toast.error("Staff ID or Cycle information is missing.");
      return;
    }
  
    setSaving(true);
  
    try {
      // Format table data for API in snake_case
      const formattedTableData = (formData.tableData || []).map((row) => ({
        name: row.name || "",
        designation: row.designation || "",
        course: row.course || "",
        hours: parseInt(row.hours) || 0,
        year: row.year || "CAYm1",
      }));
  
      // Format files for API in snake_case
      console.log("formData.filesByField:", formData.filesByField);
      
      const filesWithCategory = Object.keys(formData.filesByField || {}).flatMap(
        (field) =>
          (formData.filesByField[field] || []).map((file) => ({
            ...file,
            category: "Visiting Faculty Documents",
          }))
      );
      
      console.log("filesWithCategory:", filesWithCategory);
  
      const supporting_documents = filesWithCategory
        .filter((f) => {
          console.log("Checking file:", f, "has s3Url:", !!f.s3Url, "has filename:", !!f.filename);
          return f.s3Url && f.filename;
        })
        .map((f) => ({
          file_name: f.filename,
          file_url: f.s3Url,
          description: f.description || "",
          category: f.category || "Visiting Faculty Documents",
        }));
        
      console.log("supporting_documents:", supporting_documents);
  
      const payload = {
        other_staff_id: other_staff_id,
        cycle_sub_category_id: cycle_sub_category_id,
        visiting_faculty_description: formData.content["5.4"] || "",
        visiting_faculty_table: formattedTableData,
        supporting_documents: supporting_documents,
      };
  
      console.log("Sending payload to API:", payload);
  
      let result;
      if (recordId) {
        // Update existing record
        result = await newnbaCriteria5Service.updateCriteria5_4_Data(recordId, payload);
      } else {
        // Create new record
        result = await newnbaCriteria5Service.saveCriteria5_4_Data(payload);
      }
  
      const newRecordId = result.visiting_faculty_id || result.visitingFacultyId || result.id;
      if (newRecordId) {
        setRecordId(newRecordId);
      }
  
      // 🔥 IMMEDIATELY UPDATE LOCAL STATE
      setInitialData({
        content: formData.content,
        tableData: formData.tableData || [],
        filesByField: formData.filesByField || {},
      });
      
      // 🔑 FORCE RE-RENDER
      setFormKey(prev => prev + 1);
      
      toast.success(`Criterion 5.4 ${recordId ? 'updated' : 'saved'} successfully!`);
      setShowSuccessAlert(true);

      onSaveSuccess?.();
      
    } catch (err) {
      console.error("Save failed:", err);
      toast.error(err.message || "Failed to save data");
    } finally {
      setSaving(false);
    }
  };

  // ---------------- DELETE DATA ----------------
  const handleDelete = async () => {
    if (!recordId) {
      toast.info("No data to delete");
      return;
    }
    setShowDeleteAlert(true);
  };

  const confirmDelete = async () => {
    try {
      await newnbaCriteria5Service.deleteCriteria5_4Data(recordId);
      
      toast.success("✅ Criterion 5.4 data deleted successfully!");

      // 🔥 COMPLETE RESET - TURANT UI UPDATE
      setRecordId(null);
      setApprovalStatus(null);
      setInitialData(defaultInitialData);
      
      // 🔑 FORCE RE-RENDER BY CHANGING KEY
      setFormKey(prev => prev + 1);

      setShowDeleteAlert(false);
      onSaveSuccess?.();

    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("❌ Failed to delete data");
      setShowDeleteAlert(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteAlert(false);
    toast.info("Delete operation cancelled.");
  };

  // ---------------- UI ----------------
  if (loading) {
    return (
      <div className="flex justify-center py-20 text-xl font-medium text-indigo-600">
        Loading Criterion 5.4 (Visiting/Adjunct Faculty)...
      </div>
    );
  }

  return (
    <div className="space-y-4">
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

      {/* Display approval status if available */}
      {initialData?.approval_status && (
        <div className={`mb-4 p-4 rounded-lg ${
          initialData.approval_status === 'APPROVED' ? 'bg-green-100 text-green-800' :
          initialData.approval_status === 'REJECTED' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          <div className="flex justify-between items-center">
            <span className="font-bold">Approval Status: {initialData.approval_status}</span>
            {initialData.approved_by_name && (
              <span className="text-sm">Approved by: {initialData.approved_by_name}</span>
            )}
          </div>
          {initialData.rejection_reason && (
            <div className="mt-2">
              <strong>Reason:</strong> {initialData.rejection_reason}
            </div>
          )}
        </div>
      )}

      {/* 🔑 KEY PROP IS CRITICAL - This forces complete re-render */}
      <GenericCriteriaForm5_4
        key={`criterion5-4-form-${formKey}`}
        title={config.title}
        marks={config.totalMarks}
        fields={config.fields}
        initialData={initialData}
        saving={saving}
        isContributorEditable={isEditable}
        onSave={handleSave}
        onDelete={handleDelete}
      />

      {/* SweetAlert for Delete Confirmation */}
      {showDeleteAlert && (
        <SweetAlert
          warning
          showCancel
          confirmBtnText="Yes, Delete!"
          cancelBtnText="Cancel"
          confirmBtnBsStyle="danger"
          cancelBtnBsStyle="default"
          title="Delete Confirmation"
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        >
          <div className="text-left">
            <p className="mb-3">Are you sure you want to delete all data for Criterion 5.4?</p>
            <p className="text-sm text-gray-600">This will delete all visiting/adjunct faculty data including uploaded documents.</p>
          </div>
        </SweetAlert>
      )}

      {/* SweetAlert for Success */}
      {showSuccessAlert && (
        <SweetAlert
          success
          confirmBtnText="OK"
          confirmBtnBsStyle="success"
          title="Success!"
          onConfirm={() => setShowSuccessAlert(false)}
        >
          <div className="text-center">
            <p className="mb-3">Criterion 5.4 saved successfully!</p>
          </div>
        </SweetAlert>
      )}
    </div>
  );
};

export default Criterion5_4Form;