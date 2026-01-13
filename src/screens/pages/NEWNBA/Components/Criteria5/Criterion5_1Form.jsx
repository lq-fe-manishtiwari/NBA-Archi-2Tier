import React, { useState, useEffect, useCallback } from "react";
import GenericCriteriaForm5_1 from "../Criteria5/GenericCriteriaForm5_1";
import { newnbaCriteria5Service } from "../../Services/NewNBA-Criteria5.service";
import { toast } from "react-toastify";
import SweetAlert from "react-bootstrap-sweetalert";
import StatusBadge from "../StatusBadge";
import { Users } from "lucide-react";

const Criterion5_1Form = ({
  cycle_sub_category_id,
  other_staff_id,
  isEditable = true,
  onSaveSuccess,
  cardItem = null,
}) => {
  console.log("🔵 Criterion5_1Form props:", {
    cycle_sub_category_id,
    other_staff_id,
    isEditable
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [recordId, setRecordId] = useState(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [approvalStatus, setApprovalStatus] = useState(null);
  const [userRole, setUserRole] = useState({});
  const [contributorName, setContributorName] = useState("");

  const [initialData, setInitialData] = useState({
    content: {
      "5.1": ""
    },
    tableData: {
      sfrCalculation: []
    },
    filesByField: {},
  });

  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    setUserRole(userInfo);
  }, []);

  // ---------------- CONFIG ----------------
  const config = {
    title: "5.1. Student-Faculty Ratio (SFR) (20)",
    totalMarks: 20,
    fields: [
      {
        name: "5.1",
        label: "5.1 Student-Faculty Ratio (SFR) Calculation",
        marks: 20,
        hasTable: true,
        tableKey: "sfrCalculation",
        tableConfig: {
          title: "Table No. 5.1: Student-Faculty Ratio Calculation",
          description: "Calculate Student-Faculty Ratio for Department Level"
        },
      },
    ],
  };

  // Helper function to get SFR table structure
  const getDefaultSFRTable = () => {
    return [
      // UG Year-wise breakdown
      { 
        id: "u1_1", 
        category: "u1.1", 
        label: "UG Year 1 - Program 1", 
        type: "ug",
        cay: "", caym1: "", caym2: "" 
      },
      { 
        id: "u1_2", 
        category: "u1.2", 
        label: "UG Year 2 - Program 1", 
        type: "ug",
        cay: "", caym1: "", caym2: "" 
      },
      { 
        id: "u1_3", 
        category: "u1.3", 
        label: "UG Year 3 - Program 1", 
        type: "ug",
        cay: "", caym1: "", caym2: "" 
      },
      { 
        id: "u1_4", 
        category: "u1.4", 
        label: "UG Year 4 - Program 1", 
        type: "ug",
        cay: "", caym1: "", caym2: "" 
      },
      { 
        id: "u1_5", 
        category: "u1.5", 
        label: "UG Year 5 - Program 1", 
        type: "ug",
        cay: "", caym1: "", caym2: "" 
      },
      { 
        id: "ug1_total", 
        category: "UG1", 
        label: "Total UG Students", 
        type: "total",
        isCalculated: true,
        cay: "", caym1: "", caym2: "" 
      },
      // PG Programs
      { 
        id: "pg_programs", 
        category: "p1.1", 
        label: "No. of PG Programs in the Department", 
        type: "pg",
        cay: "", caym1: "", caym2: "" 
      },
      { 
        id: "total_students", 
        category: "S", 
        label: "Total Students in Department (S)", 
        type: "total",
        isCalculated: true,
        cay: "", caym1: "", caym2: "" 
      },
      { 
        id: "faculty_count", 
        category: "F", 
        label: "Total Faculty Members (F)", 
        type: "faculty",
        cay: "", caym1: "", caym2: "" 
      },
      { 
        id: "sfr", 
        category: "SFR", 
        label: "Student-Faculty Ratio (S/F)", 
        type: "sfr",
        isCalculated: true,
        cay: "", caym1: "", caym2: "" 
      },
      { 
        id: "average_sfr", 
        category: "Average SFR", 
        label: "Average SFR (3 years)", 
        type: "average",
        isCalculated: true,
        cay: "", caym1: "", caym2: "" 
      },
    ];
  };

  // ---------------- LOAD DATA ----------------
  const loadData = useCallback(async () => {
    if (!cycle_sub_category_id) {
      console.log("⏸️ Skipping load - missing cycle_sub_category_id");
      setLoading(false);
      return;
    }

    const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
    const userInfo2 = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const staffIdToUse = other_staff_id || userInfo?.rawData?.other_staff_id || userInfo2?.other_staff_id;
    
    console.log("🎯 Criterion5_1Form - Final staffId:", staffIdToUse);

    if (!staffIdToUse) {
      console.log("❌ Criterion5_1Form - No staffId found, using empty data");
      setInitialData({
        content: { "5.1": "" },
        tableData: {
          sfrCalculation: getDefaultSFRTable()
        },
        filesByField: {}
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log("📡 Criterion5_1Form - Making API call with:");
      console.log("  - cycle_sub_category_id:", cycle_sub_category_id);
      console.log("  - staffId:", staffIdToUse);
      
      const response = await newnbaCriteria5Service.getCriteria5_1_Data(cycle_sub_category_id, staffIdToUse);
      console.log("📊 Criterion5_1Form - Raw API Response:", response);
      
      let data = {};
      if (Array.isArray(response?.data)) {
        data = response.data.find(item => item && (item.sfr_id || item.criteria5_1_id || item.id)) || {};
      } else if (response?.data) {
        data = response.data;
      } else if (response && !response.data) {
        data = Array.isArray(response) ? (response.find(item => item && (item.sfr_id || item.criteria5_1_id || item.id)) || {}) : response;
      }

      if (data.sfr_id || data.criteria5_1_id || data.id) {
        const newRecordId = data.sfr_id || data.criteria5_1_id || data.id;
        setRecordId(newRecordId);
        console.log("✅ Record ID set to:", newRecordId);

        const statusData = cardItem || data;
        if (statusData.approval_status) {
          setApprovalStatus({
            status: statusData.approval_status,
            rejectionReason: statusData.rejection_reason,
            approvalReason: statusData.approval_status === 'APPROVED' ? statusData.rejection_reason : null,
            approvedByName: statusData.approved_by_name,
            submittedTime: statusData.submitted_time
          });
        }

        // Set approval status if available
        if (data.approval_status) {
          setApprovalStatus({
            status: data.approval_status,
            rejectionReason: data.rejection_reason,
            approvalReason: data.approval_status === 'APPROVED' ? data.rejection_reason : null,
            approvedByName: data.approved_by_name,
            submittedTime: data.submitted_time
          });
        }
        
        // Parse SFR table data
        let sfrTableData = getDefaultSFRTable();
        let filesByField = {};

        // Handle SFR table data
        if (data.sfr_table && Array.isArray(data.sfr_table)) {
          data.sfr_table.forEach(row => {
            const existingRow = sfrTableData.find(r => r.category === row.category);
            if (existingRow) {
              existingRow.cay = row.cay || "";
              existingRow.caym1 = row.caym1 || "";
              existingRow.caym2 = row.caym2 || "";
            }
          });
        }

        // Handle files
        if (data.sfr_supporting_documents && Array.isArray(data.sfr_supporting_documents)) {
          data.sfr_supporting_documents.forEach(doc => {
            const fieldName = doc.field_name || "5.1";
            if (!filesByField[fieldName]) {
              filesByField[fieldName] = [];
            }
            filesByField[fieldName].push({
              id: `file-${Date.now()}-${Math.random()}`,
              filename: doc.file_name,
              s3Url: doc.s3_url || doc.file_url,
              description: doc.description || "",
              uploading: false
            });
          });
        }

        setInitialData({
          content: {
            "5.1": data.description_5_1 || data.sfr_description || ""
          },
          tableData: {
            sfrCalculation: sfrTableData
          },
          filesByField: filesByField
        });
      } else {
        // No existing data, use defaults
        setApprovalStatus(null);
        setContributorName("");
        setInitialData({
          content: { "5.1": "" },
          tableData: {
            sfrCalculation: getDefaultSFRTable()
          },
          filesByField: {}
        });
      }

    } catch (err) {
      console.error("Load failed:", err);
      toast.error("Failed to load saved data");
      // Set defaults on error
      setInitialData({
        content: { "5.1": "" },
        tableData: {
          sfrCalculation: getDefaultSFRTable()
        },
        filesByField: {}
      });
    } finally {
      setLoading(false);
    }
  }, [cycle_sub_category_id, other_staff_id]);

  useEffect(() => {
    if (cycle_sub_category_id) {
      console.log("🚀 useEffect triggered, loading data...");
      loadData();
    } else {
      console.log("⏸️ Skipping load - missing cycle_sub_category_id:", { cycle_sub_category_id, other_staff_id });
      setLoading(false);
    }
  }, [loadData, cycle_sub_category_id, other_staff_id]);

  // ---------------- SAVE DATA ----------------
  const handleSave = async (formData) => {
    if (!isEditable) {
      toast.error("You don't have permission to edit");
      return;
    }

    setSaveLoading(true);
    try {
      // Transform UI data to API format
      const sfr_table = formData.tableData?.sfrCalculation?.map(row => ({
        category: row.category,
        label: row.label,
        type: row.type,
        cay: row.cay || "",
        caym1: row.caym1 || "",
        caym2: row.caym2 || "",
        isCalculated: row.isCalculated || false
      })) || [];

      // Transform supporting documents
      const sfr_supporting_documents = [];
      if (formData.filesByField) {
        Object.entries(formData.filesByField).forEach(([fieldName, files]) => {
          files.forEach(file => {
            if (file.s3Url) {
              sfr_supporting_documents.push({
                field_name: fieldName,
                file_name: file.filename || "",
                s3_url: file.s3Url,
                description: file.description || ""
              });
            }
          });
        });
      }

      const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
      const userInfo2 = JSON.parse(localStorage.getItem("userInfo") || "{}");
    
      const staffId = userInfo?.rawData?.other_staff_id || userInfo2?.other_staff_id;

      const payload = {
        other_staff_id: parseInt(staffId),
        cycle_sub_category_id: parseInt(cycle_sub_category_id),
        description_5_1: formData.content?.["5.1"] || "",
        sfr_table,
        sfr_supporting_documents
      };

      console.log("🚀 Saving payload:", payload);

      let response;
      if (recordId) {
        // Update existing record
        response = await newnbaCriteria5Service.updateCriteria5_1_Data(recordId, payload);
        console.log("✅ Update response:", response);
        setSuccessMessage("Section updated successfully!");
      } else {
        // Create new record
        response = await newnbaCriteria5Service.saveCriteria5_1_Data(payload, staffId);
        console.log("✅ Save response:", response);
        
        // Set recordId from response for future updates
        if (response?.data?.sfr_id || response?.data?.id) {
          setRecordId(response.data.sfr_id || response.data.id);
        } else if (response?.sfr_id || response?.id) {
          setRecordId(response.sfr_id || response.id);
        }
        
        setSuccessMessage("Section created successfully!");
      }

      // Update initialData state immediately
      setInitialData({
        content: formData.content,
        tableData: formData.tableData,
        filesByField: formData.filesByField || {}
      });

      setShowSuccessAlert(true);
      onSaveSuccess?.();
      loadData();
    } catch (err) {
      console.error("Save failed:", err);
      toast.error(err.message || "Failed to save");
    } finally {
      setSaveLoading(false);
    }
  };

  // ---------------- DELETE DATA ----------------
  const handleDelete = async () => {
    const idToDelete = recordId;
    
    console.log("🗑️ Delete function called:", idToDelete);
  
    if (!idToDelete) {
      console.warn("⚠️ No ID available for deletion");
      setAlert(
        <SweetAlert info title="No Data to Delete" onConfirm={() => setAlert(null)}>
          There is no saved data to delete.
        </SweetAlert>
      );
      return;
    }
    setShowDeleteAlert(true);
  };

  const confirmDelete = async () => {
    try {
      await newnbaCriteria5Service.deleteCriteria5_1Data(recordId);
  
      toast.success("✅ Section data deleted successfully!");
  
      // Reset everything
      setRecordId(null);
      setApprovalStatus(null);
      setContributorName("");
  
      setInitialData({
        content: { "5.1": "" },
        tableData: {
          sfrCalculation: getDefaultSFRTable()
        },
        filesByField: {}
      });
  
      setShowDeleteAlert(false);
      await loadData();
      onSaveSuccess?.();

    } catch (err) {
      console.error("Delete error:", err);
      toast.error(
        err.response?.data?.message ||
        "❌ Failed to delete data. Please try again."
      );
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
      <div className="flex items-center justify-center py-32 text-2xl text-indigo-600 font-medium">
        Loading 5.1. Student-Faculty Ratio (SFR)...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Approval Status */}
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

      <GenericCriteriaForm5_1
        title={config.title}
        marks={config.totalMarks}
        fields={config.fields}
        initialData={initialData}
        saving={saveLoading}
        isCompleted={false}
        isContributorEditable={isEditable}
        onSave={handleSave}
        onDelete={handleDelete}
      />
      
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
            <p className="mb-3">Are you sure you want to delete all data for this section?</p>
           
          </div>
        </SweetAlert>
      )}

      {showSuccessAlert && (
        <SweetAlert
          success
          confirmBtnText="OK"
          confirmBtnBsStyle="success"
          title="Success!"
          onConfirm={() => {
            setShowSuccessAlert(false);
            onSaveSuccess?.();
            loadData();
          }}
        >
          <div className="text-center">
            <p className="mb-3">{successMessage}</p>
            <div className="text-sm text-gray-600">
              <p>✅ Data has been saved successfully</p>
            </div>
          </div>
        </SweetAlert>
      )}
    </div>
  );
};

export default Criterion5_1Form;