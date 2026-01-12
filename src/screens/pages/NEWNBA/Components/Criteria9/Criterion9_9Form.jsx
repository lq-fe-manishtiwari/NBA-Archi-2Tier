import React, { useState, useEffect, useCallback } from "react";
import GenericCriteriaForm from "../GenericCriteriaForm";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import StatusBadge from "../StatusBadge";
import SweetAlert from "react-bootstrap-sweetalert";

// Import the new service
import { newnbaCriteria9Service } from "../../Services/NewNBA-Criteria9.service";
import { getAllProfileFlags } from "@/_services/adminProfileUtils";

const Criterion9_9Form = ({
  nba_accredited_program_id,
  nba_criteria_sub_level2_id,
  nba_contributor_allocation_id,
  isContributorEditable = true,
  completed = false,
  onSaveSuccess,
  otherStaffId = null,
  editMode = false,
  learning_resources_id: propLearningResourcesId = null,
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [learningResourcesId, setLearningResourcesId] = useState(null);
  const [initialData, setInitialData] = useState({
    content: {},
    tableData: [],
    filesByField: {},
  });
  const [approvalStatus, setApprovalStatus] = useState(null);
  const [userRole, setUserRole] = useState({});
  const [contributorName, setContributorName] = useState("");
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    setUserRole(userInfo);
  }, []);

  const config = {
    title: "9.9. Quality of Learning Resources (Hard/Soft) (05)",
    totalMarks: 5,
    fields: [
      {
        name: "learning_resources_description",
        label: "Provide details of available learning resources, including e-resources (books and journals), as well as information on the accessibility of these resources to students. Additionally, describe the support provided to students for self-learning activities.",
        marks: 5,
        type: "textarea"
      }
    ]
  };

  // ---------------- LOAD DATA ----------------
  const loadData = useCallback(async () => {
    if (!nba_criteria_sub_level2_id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      console.log("🎯 Criterion9_9Form - Loading data with:");
      console.log("  - otherStaffId prop:", otherStaffId);
      console.log("  - nba_contributor_allocation_id:", nba_contributor_allocation_id);
      console.log("  - nba_criteria_sub_level2_id:", nba_criteria_sub_level2_id);
      console.log("  - propLearningResourcesId:", propLearningResourcesId);
      console.log("  - editMode:", editMode);

      // Determine which staff ID to use - otherStaffId has priority
      const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
      const userInfo2 = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const staffIdToUse = otherStaffId  || userInfo?.rawData?.other_staff_id || userInfo.user_id || userInfo2?.other_staff_id;
      
      console.log("🎯 Criterion9_9Form - Final staffId:", staffIdToUse);

      if (!staffIdToUse) {
        console.log("❌ Criterion9_9Form - No staffId found, using empty data");
        setInitialData({ 
          content: { learning_resources_description: "" }, 
          tableData: [], 
          filesByField: {} 
        });
        setLoading(false);
        return;
      }

      console.log("📡 Criterion9_9Form - Making API call with:");
      console.log("  - cycleSubCategoryId:", nba_criteria_sub_level2_id);
      console.log("  - staffId:", staffIdToUse);

      // Use the new service API call
      const response = await newnbaCriteria9Service.getCriteria9Data(
        '9.9', // section
        nba_criteria_sub_level2_id, // cycleSubCategoryId
        staffIdToUse // otherStaffId
      );

      console.log("📊 Criterion9_9Form - Raw API Response:", response);

      // Handle array response like other forms
      let dataItem = null;
      if (Array.isArray(response)) {
        if (response.length > 0) {
          dataItem = response[0];
          console.log("📦 Criterion9_9Form - Extracted first item from array:", dataItem);
        } else {
          console.log("📭 Criterion9_9Form - Empty array response, no data found");
        }
      } else {
        dataItem = response;
      }

      console.log("📊 Final dataItem:", dataItem);

      if (dataItem && dataItem.learning_resources_quality_id) {
        console.log("✅ Criterion9_9Form - Found existing data");
        
        // Set contributor name for display
        if (dataItem.other_staff_name) {
          setContributorName(dataItem.other_staff_name);
        } else if (dataItem.firstname) {
          const name = `${dataItem.firstname || ''} ${dataItem.middlename || ''} ${dataItem.lastname || ''}`.trim();
          setContributorName(name);
        }

        // Set ID
        setLearningResourcesId(dataItem.learning_resources_quality_id);

        // Set approval status if available
        if (dataItem.approval_status) {
          setApprovalStatus({
            status: dataItem.approval_status,
            rejectionReason: dataItem.rejection_reason,
            approvalReason: dataItem.approval_status === 'APPROVED' ? dataItem.rejection_reason : null,
            approvedByName: dataItem.approved_by_name,
            submittedTime: dataItem.submitted_time
          });
        }

        // Transform files to filesByField structure
        const filesArray = Array.isArray(dataItem.supporting_documents) 
          ? dataItem.supporting_documents 
          : [];

        const filesByField = {
          "learning_resources_description": filesArray.length > 0
            ? filesArray.map((f, i) => ({
                id: f.id || `file-learning-${i}`,
                filename: f.filename || f.name || "",
                s3Url: f.url || f.filePath || "",
                // ✅ IMPORTANT: Add 'url' field for GenericCriteriaForm to recognize the file
                url: f.url || f.filePath || f.s3Url || "",
                description: f.description || "",
                uploading: false
              }))
            : [{ 
                id: `file-learning-0`, 
                description: "", 
                file: null, 
                filename: "", 
                s3Url: "", 
                url: "", // ✅ Add empty url field
                uploading: false 
              }]
        };

        setInitialData({
          content: { 
            learning_resources_description: dataItem.learning_resources_description || "" 
          },
          tableData: [],
          filesByField: filesByField
        });

      } else {
        // No existing data, initialize empty
        console.log("📭 Criterion9_9Form - No existing data found, showing blank form");
        setLearningResourcesId(null);
        setApprovalStatus(null);
        setContributorName("");
        
        setInitialData({ 
          content: { learning_resources_description: "" }, 
          tableData: [], 
          filesByField: {
            "learning_resources_description": [{ 
              id: `file-learning-0`, 
              description: "", 
              file: null, 
              filename: "", 
              s3Url: "", 
              url: "", // ✅ Add empty url field
              uploading: false 
            }]
          }
        });
      }

    } catch (err) {
      console.error("Load failed:", err);
      console.error("Error details:", err.response?.data || err.message || err);
      
      // Don't show error if no data exists (404 is expected for new entries)
      if (err.response && err.response.status !== 404) {
        setAlert(
          <SweetAlert
            danger
            title="Load Failed"
            confirmBtnText="OK"
            confirmBtnCssClass="btn-confirm"
            onConfirm={() => setAlert(null)}
          >
            Failed to load saved data
          </SweetAlert>
        );
      }
      
      // Initialize empty data for new entry
      setInitialData({ 
        content: { learning_resources_description: "" }, 
        tableData: [], 
        filesByField: {
          "learning_resources_description": [{ 
            id: `file-learning-0`, 
            description: "", 
            file: null, 
            filename: "", 
            s3Url: "", 
            url: "", // ✅ Add empty url field
            uploading: false 
          }]
        }
      });
      setLearningResourcesId(null);
      setApprovalStatus(null);
      setContributorName("");
      
    } finally {
      setLoading(false);
    }
  }, [nba_accredited_program_id, nba_criteria_sub_level2_id, nba_contributor_allocation_id, otherStaffId, propLearningResourcesId, editMode]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ---------------- SAVE DATA ----------------
  const handleSave = async (formData) => {
    console.log("Save data received:", formData);
    
    // Check permissions
    const profileFlags = getAllProfileFlags();
    const isContributor = profileFlags?.isContributor || false;
    
    if (!isContributorEditable && isContributor) {
      setAlert(
        <SweetAlert
          warning
          title="Permission Denied"
          confirmBtnText="OK"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => setAlert(null)}
        >
          You don't have permission to edit
        </SweetAlert>
      );
      return;
    }

    setSaving(true);
    
    try {
      // Determine staff ID to use
      const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
      const userInfo2 = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const staffId = userInfo?.rawData?.other_staff_id || userInfo2?.other_staff_id;

      if (!staffId) {
        throw new Error("Staff ID not found");
      }

      if (!nba_criteria_sub_level2_id) {
        throw new Error("Cycle sub-category ID is required");
      }

      // ✅ FIX: Ensure files have both s3Url and url properties
      const filesWithCategory = Object.keys(formData.filesByField || {}).flatMap(
        (field) =>
          (formData.filesByField[field] || []).map((file) => ({
            ...file,
            category: "Learning Resources",
            // ✅ Ensure url property exists for GenericCriteriaForm
            url: file.url || file.s3Url || "",
          }))
      );

      // Prepare payload
      const payload = {
        other_staff_id: parseInt(staffId),
        cycle_sub_category_id: parseInt(nba_criteria_sub_level2_id),
        learning_resources_description: formData.content?.learning_resources_description || "",
        supporting_documents: filesWithCategory
          .filter((f) => f.url || f.s3Url || f.file)
          .map((f) => ({
            description: f.description || "",
            filename: f.filename || f.name || f.file?.name || "",
            url: f.url || f.s3Url || "",
            id: f.id,
          })),
      };

      console.log("🟠 Criterion9_9Form - Save payload:", payload);

      let response;
      const hasExistingEntry = learningResourcesId || propLearningResourcesId;

      if (hasExistingEntry) {
        // Update existing record
        const idToUse = learningResourcesId || propLearningResourcesId;
        console.log("🔄 Criterion9_9Form - Updating existing entry with ID:", idToUse);
        response = await newnbaCriteria9Service.updateCriteria9('9.9', idToUse, payload);
      } else {
        // Create new record
        console.log("🆕 Criterion9_9Form - Creating new entry");
        response = await newnbaCriteria9Service.saveCriteria9Data('9.9', payload);
      }

      console.log("Save response:", response);

      // ✅ IMMEDIATELY UPDATE LOCAL STATE with the saved data
      // This ensures files are shown without reloading
      const updatedFilesByField = {};
      
      Object.keys(formData.filesByField || {}).forEach(field => {
        const files = formData.filesByField[field] || [];
        updatedFilesByField[field] = files.map(file => {
          // Find matching file in payload
          const savedFile = payload.supporting_documents?.find(
            f => f.id === file.id || f.filename === (file.filename || file.file?.name)
          );
          
          return {
            ...file,
            s3Url: savedFile?.url || file.s3Url || file.url || "",
            // ✅ CRITICAL: Ensure 'url' field is also set for GenericCriteriaForm
            url: savedFile?.url || file.s3Url || file.url || "",
            filename: savedFile?.filename || file.filename || file.file?.name || "",
            uploading: false
          };
        });
      });

      // Update initialData state immediately
      setInitialData(prev => ({
        ...prev,
        content: formData.content,
        filesByField: updatedFilesByField
      }));

      // If this is a new entry, set the ID from response
      if (response?.learning_resources_quality_id && !learningResourcesId) {
        setLearningResourcesId(response.learning_resources_quality_id);
      }

      setAlert(
        <SweetAlert
          success
          title="Saved!"
          confirmBtnText="OK"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => setAlert(null)}
        >
          Criterion 9.9 saved successfully
        </SweetAlert>
      );

      // Call success callback
      onSaveSuccess?.();

    } catch (err) {
      console.error("Save failed:", err);
      setAlert(
        <SweetAlert
          danger
          title="Save Failed"
          confirmBtnText="OK"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => setAlert(null)}
        >
          {err.response?.data?.message || err.message || "Failed to save"}
        </SweetAlert>
      );
    } finally {
      setSaving(false);
    }
  };

  // ---------------- DELETE DATA ----------------
  const handleDelete = async () => {
    if (!learningResourcesId) {
      setAlert(
        <SweetAlert
          info
          title="Nothing to Delete"
          confirmBtnText="OK"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => setAlert(null)}
        >
          No data available to delete
        </SweetAlert>
      );
      return;
    }

    setAlert(
      <SweetAlert
        warning
        showCancel
        confirmBtnText="Yes, delete it!"
        cancelBtnText="Cancel"
        confirmBtnCssClass="btn-confirm"
        cancelBtnCssClass="btn-cancel"
        title="Are you sure?"
        onConfirm={async () => {
          setAlert(null);
          try {
            await newnbaCriteria9Service.deleteCriteria9('9.9', learningResourcesId);
            setAlert(
              <SweetAlert
                success
                title="Deleted!"
                confirmBtnCssClass="btn-confirm"
                confirmBtnText="OK"
                onConfirm={() => setAlert(null)}
              >
                Learning Resources record deleted successfully
              </SweetAlert>
            );
            await loadData();
            setLearningResourcesId(null);
            onSaveSuccess?.();
          } catch (error) {
            console.error(error);
            setAlert(
              <SweetAlert
                danger
                title="Delete Failed"
                confirmBtnCssClass="btn-confirm"
                confirmBtnText="OK"
                onConfirm={() => setAlert(null)}
              >
                An error occurred while deleting
              </SweetAlert>
            );
          }
        }}
        onCancel={() => setAlert(null)}
      >
        You won't be able to revert this deletion!
      </SweetAlert>
    );
  };

  // ---------------- UI ----------------
  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-2xl text-indigo-600 font-medium">
        Loading {config.title}...
      </div>
    );
  }

  return (
    <div className="space-y-4">
 
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
            {approvalStatus.submittedTime && (
              <span className="text-sm text-gray-500">
                Submitted: {new Date(approvalStatus.submittedTime).toLocaleString()}
              </span>
            )}
          </div>
        </div>
      )}

      <GenericCriteriaForm
        title={config.title}
        marks={config.totalMarks}
        fields={config.fields}
        initialData={initialData}
        onSave={handleSave}
        onDelete={learningResourcesId ? handleDelete : null}
        isCompleted={completed}
        isContributorEditable={isContributorEditable}
        saving={saving}
        hasExistingData={!!learningResourcesId}
        showFileCategories={true}
      />

      {alert}
    </div>
  );
};

export default Criterion9_9Form;