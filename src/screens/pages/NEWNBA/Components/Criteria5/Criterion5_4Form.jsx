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
  
  // Default empty data for Faculty Retention
  const defaultInitialData = {
    content: { 
      "5.4": "5.4 Faculty Retention (20)\n\n(Calculate the percentage of required full-time faculty members retained during the assessment period keeping CAYm2 as base year.)\n\nMarks Distribution:\n• ≥90% retained: 20 marks\n• ≥75% retained: 16 marks\n• ≥60% retained: 12 marks\n• ≥50% retained: 8 marks\n• <50% retained: 0 marks"
    },
    tableData: [],
    filesByField: {},
    retentionData: {
      facultyRetainedCAY: "",
      facultyRetainedCAYm1: "",
      totalRequiredFaculty: ""
    }
  };

  const [initialData, setInitialData] = useState(defaultInitialData);
  const [formKey, setFormKey] = useState(0);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState(null);
  const [userRole, setUserRole] = useState({});

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    setUserRole(userInfo);
  }, []);

  // ---------------- CONFIG FOR 5.4 FACULTY RETENTION ----------------
  const config = {
    title: "5.4 Faculty Retention",
    totalMarks: 20,
    fields: [
      {
        name: "5.4",
        label: "5.4 Faculty Retention",
        marks: 20,
        hasTable: true,
        tableConfig: {
          type: "faculty_retention",
          title: "Table No. 5.4. Faculty retention ratio.",
          columns: [
            { field: "item", header: "Item", type: "text" },
            { field: "cay", header: "CAY", type: "number" },
            { field: "caym1", header: "CAYm1", type: "number" }
          ]
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
        setRecordId(data.faculty_retention_id || data.id);
        
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

        // Format retention data from API response
        const retentionData = {
          facultyRetainedCAY: data.faculty_retained_cay?.toString() || "",
          facultyRetainedCAYm1: data.faculty_retained_caym1?.toString() || "",
          totalRequiredFaculty: data.total_required_faculty?.toString() || ""
        };

        // Format table data for display
        const formattedTableData = [
          {
            id: "retained-row",
            item: "No of Faculty Retained",
            cay: data.faculty_retained_cay?.toString() || "",
            caym1: data.faculty_retained_caym1?.toString() || ""
          },
          {
            id: "total-row",
            item: "Total No. of Required Faculty in CAYm2",
            cay: data.total_required_faculty?.toString() || "",
            caym1: ""
          }
        ];

        // Format files from API response
        const formattedFiles = (data.faculty_retention_document || []).map((doc, index) => ({
          id: `file-${Date.now()}-${index}`,
          filename: doc.file_name || "",
          url: doc.file_url || "",
          description: doc.description || "",
          category: doc.category || "Faculty Retention Documents",
          s3Url: doc.file_url || "",
        }));

        setInitialData({
          content: { 
            "5.4": data.faculty_retention_description || defaultInitialData.content["5.4"]
          },
          tableData: formattedTableData,
          retentionData: retentionData,
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
      console.log("🚀 Loading data for 5.4 Faculty Retention...");
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
      // Extract retention data from table data
      const retainedRow = formData.tableData.find(row => row.item === "No of Faculty Retained");
      const totalRow = formData.tableData.find(row => row.item === "Total No. of Required Faculty in CAYm2");
      
      const facultyRetainedCAY = parseInt(retainedRow?.cay) || 0;
      const facultyRetainedCAYm1 = parseInt(retainedRow?.caym1) || 0;
      const totalRequiredFaculty = parseInt(totalRow?.cay) || 0;

      // Format files for API in snake_case
      console.log("formData.filesByField:", formData.filesByField);
      
      const filesWithCategory = Object.keys(formData.filesByField || {}).flatMap(
        (field) =>
          (formData.filesByField[field] || []).map((file) => ({
            ...file,
            category: "Faculty Retention Documents",
          }))
      );
      
      console.log("filesWithCategory:", filesWithCategory);

      const faculty_retention_document = filesWithCategory
        .filter((f) => {
          console.log("Checking file:", f, "has s3Url:", !!f.s3Url, "has filename:", !!f.filename);
          return f.s3Url && f.filename;
        })
        .map((f) => ({
          file_name: f.filename,
          file_url: f.s3Url,
          description: f.description || "",
          category: f.category || "Faculty Retention Documents",
        }));
        
      console.log("faculty_retention_document:", faculty_retention_document);

      const payload = {
        other_staff_id: other_staff_id,
        cycle_sub_category_id: cycle_sub_category_id,
        faculty_retention_description: formData.content["5.4"] || "",
        faculty_retained_cay: facultyRetainedCAY,
        faculty_retained_caym1: facultyRetainedCAYm1,
        total_required_faculty: totalRequiredFaculty,
         faculty_retention_data: [
    {
      faculty_retained_caym1: facultyRetainedCAYm1,
      faculty_retained_cay: facultyRetainedCAY,
      total_required_faculty: totalRequiredFaculty,
    }
  ],
        faculty_retention_document: faculty_retention_document,
      };

      console.log("Sending payload to API:", payload);

      let result;
      if (recordId) {
        // Update existing record
        result = await newnbaCriteria5Service.updateCriteria5_4_Data(recordId, payload,other_staff_id);
      } else {
        // Create new record
        result = await newnbaCriteria5Service.saveCriteria5_4_Data(payload,other_staff_id);
      }

      const newRecordId = result.faculty_retention_id || result.id;
      if (newRecordId) {
        setRecordId(newRecordId);
      }

      // 🔥 IMMEDIATELY UPDATE LOCAL STATE
      setInitialData({
        content: formData.content,
        tableData: formData.tableData || [],
        retentionData: {
          facultyRetainedCAY: facultyRetainedCAY.toString(),
          facultyRetainedCAYm1: facultyRetainedCAYm1.toString(),
          totalRequiredFaculty: totalRequiredFaculty.toString()
        },
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
        Loading Criterion 5.4 (Faculty Retention)...
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
            <p className="text-sm text-gray-600">This will delete all faculty retention data including uploaded documents.</p>
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