import React, { useState, useEffect, useCallback } from "react";
import GenericCriteriaForm5_6 from "../Criteria5/GenericCriteriaForm5_6";
import { newnbaCriteria5Service } from "../../Services/NewNBA-Criteria5.service";
import { toast } from "react-toastify";
import SweetAlert from "react-bootstrap-sweetalert";
import StatusBadge from "../StatusBadge";
import { Users } from "lucide-react";

const Criterion5_6Form = ({
  cycle_sub_category_id,
  other_staff_id,
  isEditable = true,
  onSaveSuccess,
  cardItem = null,
}) => {
  console.log("🔵 Criterion5_6Form props:", {
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
      "5.6": ""
    },
    tableData: {
      facultyDevelopment: []
    },
    rfValue: 10,
    filesByField: {},
  });

  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    setUserRole(userInfo);
  }, []);

  // ---------------- CONFIG ----------------
  const config = {
    title: "5.6. Faculty as Participants in Faculty Development/Training Activities/STTPs (15)",
    totalMarks: 15,
    fields: [
      {
        name: "5.6",
        label: "5.6 Faculty Development Points Calculation",
        marks: 15,
        hasTable: true,
        tableKey: "facultyDevelopment",
        tableConfig: {
          title: "Table No. 5.6: A list of faculty members who have participated in FDPs or STPs over the past 3 years",
          description: "Calculate faculty development points for each faculty member"
        },
      },
    ],
  };

  // Helper function to get default faculty table structure
  const getDefaultFacultyTable = () => {
    return [
      { 
        id: "faculty_1", 
        name: "", 
        CAYm1: "", 
        CAYm2: "", 
        CAYm3: "",
        maxPerYear: 5
      }
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
    
    console.log("🎯 Criterion5_6Form - Final staffId:", staffIdToUse);

    if (!staffIdToUse) {
      console.log("❌ Criterion5_6Form - No staffId found, using empty data");
      setInitialData({
        content: { "5.6": "" },
        tableData: {
          facultyDevelopment: getDefaultFacultyTable()
        },
        rfValue: 10,
        filesByField: {}
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log("📡 Criterion5_6Form - Making API call with:");
      console.log("  - cycle_sub_category_id:", cycle_sub_category_id);
      console.log("  - staffId:", staffIdToUse);
      
      // TODO: Replace with actual API call for 5.6
      const response = await newnbaCriteria5Service.getCriteria5_6_Data(cycle_sub_category_id, staffIdToUse);
      console.log("📊 Criterion5_6Form - Raw API Response:", response);
      
      let data = {};
      if (Array.isArray(response?.data)) {
        data = response.data.find(item => item && (item.faculty_dev_id || item.criteria5_6_id || item.id)) || {};
      } else if (response?.data) {
        data = response.data;
      } else if (response && !response.data) {
        data = Array.isArray(response) ? (response.find(item => item && (item.faculty_dev_id || item.criteria5_6_id || item.id)) || {}) : response;
      }

      if (data.faculty_dev_id || data.criteria5_6_id || data.id) {
        const newRecordId = data.faculty_dev_id || data.criteria5_6_id || data.id;
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
        
        // Parse faculty development table data
        let facultyTableData = getDefaultFacultyTable();
        let filesByField = {};
        let rfValue = 10;

        // Handle faculty table data
        if (data.faculty_table && Array.isArray(data.faculty_table)) {
          facultyTableData = data.faculty_table.map((row, index) => ({
            id: row.id || `faculty_${index + 1}`,
            name: row.name || "",
            CAYm1: row.CAYm1 || "",
            CAYm2: row.CAYm2 || "",
            CAYm3: row.CAYm3 || "",
            maxPerYear: row.maxPerYear || 5
          }));
        }

        // Get RF value
        if (data.rf_value) {
          rfValue = data.rf_value;
        }

        // Handle files
        if (data.supporting_documents && Array.isArray(data.supporting_documents)) {
          data.supporting_documents.forEach(doc => {
            const fieldName = doc.field_name || "5.6";
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
            "5.6": data.description_5_6 || data.faculty_dev_description || ""
          },
          tableData: {
            facultyDevelopment: facultyTableData
          },
          rfValue: rfValue,
          filesByField: filesByField
        });
      } else {
        // No existing data, use defaults
        setApprovalStatus(null);
        setContributorName("");
        setInitialData({
          content: { "5.6": "" },
          tableData: {
            facultyDevelopment: getDefaultFacultyTable()
          },
          rfValue: 10,
          filesByField: {}
        });
      }

    } catch (err) {
      console.error("Load failed:", err);
      toast.error("Failed to load saved data");
      // Set defaults on error
      setInitialData({
        content: { "5.6": "" },
        tableData: {
          facultyDevelopment: getDefaultFacultyTable()
        },
        rfValue: 10,
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
      const faculty_table = formData.tableData?.facultyDevelopment?.map(row => ({
        name: row.name || "",
        CAYm1: row.CAYm1 || "",
        CAYm2: row.CAYm2 || "",
        CAYm3: row.CAYm3 || "",
        maxPerYear: row.maxPerYear || 5
      })) || [];

      // Transform supporting documents
      const supporting_documents = [];
      if (formData.filesByField) {
        Object.entries(formData.filesByField).forEach(([fieldName, files]) => {
          files.forEach(file => {
            if (file.s3Url) {
              supporting_documents.push({
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
        description_5_6: formData.content?.["5.6"] || "",
        faculty_table,
        rf_value: formData.rfValue || 10,
        supporting_documents
      };

      console.log("🚀 Saving Criterion 5.6 payload:", payload);

      let response;
      if (recordId) {
        // Update existing record
        response = await newnbaCriteria5Service.updateCriteria5_6_Data(recordId, payload);
        console.log("✅ Update response:", response);
        setSuccessMessage("Section updated successfully!");
      } else {
        // Create new record
        response = await newnbaCriteria5Service.saveCriteria5_6_Data(payload, staffId);
        console.log("✅ Save response:", response);
        
        // Set recordId from response for future updates
        if (response?.data?.faculty_dev_id || response?.data?.id) {
          setRecordId(response.data.faculty_dev_id || response.data.id);
        } else if (response?.faculty_dev_id || response?.id) {
          setRecordId(response.faculty_dev_id || response.id);
        }
        
        setSuccessMessage("Section created successfully!");
      }

      // Update initialData state immediately
      setInitialData({
        content: formData.content,
        tableData: formData.tableData,
        rfValue: formData.rfValue,
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
      await newnbaCriteria5Service.deleteCriteria5_6Data(recordId);
  
      toast.success("✅ Section data deleted successfully!");
  
      // Reset everything
      setRecordId(null);
      setApprovalStatus(null);
      setContributorName("");
  
      setInitialData({
        content: { "5.6": "" },
        tableData: {
          facultyDevelopment: getDefaultFacultyTable()
        },
        rfValue: 10,
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
        Loading 5.6. Faculty Development Activities...
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

      <GenericCriteriaForm5_6
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

export default Criterion5_6Form;