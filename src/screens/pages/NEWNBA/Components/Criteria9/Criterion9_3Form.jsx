import React, { useState, useEffect, useCallback } from "react";
import GenericCriteriaForm from "../GenericCriteriaForm";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import StatusBadge from "../StatusBadge";
import SweetAlert from "react-bootstrap-sweetalert";

// Import the new service
import { newnbaCriteria9Service } from "../../Services/NewNBA-Criteria9.service";
import { getAllProfileFlags } from "@/_services/adminProfileUtils";

const Criterion9_3Form = ({
  nba_accredited_program_id,
  nba_criteria_sub_level2_id,
  nba_contributor_allocation_id,
  isContributorEditable = true,
  completed = false,
  onSaveSuccess,
  otherStaffId = null, // For coordinator viewing specific contributor's data
  editMode = false,
  feedback_analysis_id: propFeedbackAnalysisId = null,
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedbackAnalysisId, setFeedbackAnalysisId] = useState(null);
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
    title: "9.3 Library and Internet (30)",
    totalMarks: 30,
    fields: [
      {
        name: "quality_learning_resource",
        label: "9.3.1. Quality of Learning Resource (hard/soft) (20)",
        marks: 20,
        type: "textarea"
      },
      {
        name: "internet",
        label: "9.3.2. Internet (10)",
        marks: 10,
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
      
      console.log("🎯 Criterion9_3Form - Loading data with:");
      console.log("  - otherStaffId prop:", otherStaffId);
      console.log("  - nba_contributor_allocation_id:", nba_contributor_allocation_id);
      console.log("  - nba_criteria_sub_level2_id:", nba_criteria_sub_level2_id);
      console.log("  - propFeedbackAnalysisId:", propFeedbackAnalysisId);
      console.log("  - editMode:", editMode);

      // Determine which staff ID to use - otherStaffId has priority
      const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
      const userInfo2 = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const staffIdToUse = otherStaffId  || userInfo?.rawData?.other_staff_id || userInfo.user_id || userInfo2?.other_staff_id;

      
      console.log("🎯 Criterion9_3Form - Final staffId:", staffIdToUse);

      if (!staffIdToUse) {
        console.log("❌ Criterion9_3Form - No staffId found, using empty data");
        setInitialData({
          content: {
            quality_learning_resource: "",
            internet: ""
          },
          tableData: [],
          filesByField: {}
        });
        setLoading(false);
        return;
      }

      console.log("📡 Criterion9_3Form - Making API call with:");
      console.log("  - cycleSubCategoryId:", nba_criteria_sub_level2_id);
      console.log("  - staffId:", staffIdToUse);

      // Use the new service API call
      const response = await newnbaCriteria9Service.getCriteria9Data(
        '9.3', // section
        nba_criteria_sub_level2_id, // cycleSubCategoryId
        staffIdToUse // otherStaffId
      );

      console.log("📊 Criterion9_3Form - Raw API Response:", response);

      // Handle array response like Criterion2_1Form
      let dataItem = null;
      if (Array.isArray(response)) {
        if (response.length > 0) {
          dataItem = response[0];
          console.log("📦 Criterion9_3Form - Extracted first item from array:", dataItem);
        } else {
          console.log("📭 Criterion9_3Form - Empty array response, no data found");
        }
      } else {
        dataItem = response;
      }

      console.log("📊 Final dataItem:", dataItem);

      if (dataItem && dataItem.feedback_analysis_id) {
        console.log("✅ Criterion9_3Form - Found existing data");
        
        // Set contributor name for display
        if (dataItem.other_staff_name) {
          setContributorName(dataItem.other_staff_name);
        } else if (dataItem.firstname) {
          const name = `${dataItem.firstname || ''} ${dataItem.middlename || ''} ${dataItem.lastname || ''}`.trim();
          setContributorName(name);
        }

        // Set ID
        setFeedbackAnalysisId(dataItem.feedback_analysis_id);

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
          "quality_learning_resource": filesArray.filter(f => f.category === 'quality_learning_resource').length > 0
            ? filesArray.filter(f => f.category === 'quality_learning_resource').map((f, i) => ({
                id: f.id || `file-quality-${i}`,
                filename: f.filename || f.name || "",
                s3Url: f.url || f.filePath || "",
                // ✅ IMPORTANT: Add 'url' field for GenericCriteriaForm to recognize the file
                url: f.url || f.filePath || f.s3Url || "",
                description: f.description || "",
                uploading: false
              }))
            : [{
                id: `file-quality-0`,
                description: "",
                file: null,
                filename: "",
                s3Url: "",
                url: "", // ✅ Add empty url field
                uploading: false
              }],
          "internet": filesArray.filter(f => f.category === 'internet').length > 0
            ? filesArray.filter(f => f.category === 'internet').map((f, i) => ({
                id: f.id || `file-internet-${i}`,
                filename: f.filename || f.name || "",
                s3Url: f.url || f.filePath || "",
                // ✅ IMPORTANT: Add 'url' field for GenericCriteriaForm to recognize the file
                url: f.url || f.filePath || f.s3Url || "",
                description: f.description || "",
                uploading: false
              }))
            : [{
                id: `file-internet-0`,
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
            quality_learning_resource: dataItem.quality_learning_resource || "",
            internet: dataItem.internet || ""
          },
          tableData: [],
          filesByField: filesByField
        });

      } else {
        // No existing data, initialize empty
        console.log("📭 Criterion9_3Form - No existing data found, showing blank form");
        setFeedbackAnalysisId(null);
        setApprovalStatus(null);
        setContributorName("");
        
        setInitialData({
          content: {
            quality_learning_resource: "",
            internet: ""
          },
          tableData: [],
          filesByField: {
            "quality_learning_resource": [{
              id: `file-quality-0`,
              description: "",
              file: null,
              filename: "",
              s3Url: "",
              url: "", // ✅ Add empty url field
              uploading: false
            }],
            "internet": [{
              id: `file-internet-0`,
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
        content: {
          quality_learning_resource: "",
          internet: ""
        },
        tableData: [],
        filesByField: {
          "quality_learning_resource": [{
            id: `file-quality-0`,
            description: "",
            file: null,
            filename: "",
            s3Url: "",
            url: "", // ✅ Add empty url field
            uploading: false
          }],
          "internet": [{
            id: `file-internet-0`,
            description: "",
            file: null,
            filename: "",
            s3Url: "",
            url: "", // ✅ Add empty url field
            uploading: false
          }]
        }
      });
      setFeedbackAnalysisId(null);
      setApprovalStatus(null);
      setContributorName("");
      
    } finally {
      setLoading(false);
    }
  }, [nba_accredited_program_id, nba_criteria_sub_level2_id, nba_contributor_allocation_id, otherStaffId, propFeedbackAnalysisId, editMode]);

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

      // Prepare files with category
      const filesWithCategory = Object.keys(formData.filesByField || {}).flatMap(
        (field) =>
          (formData.filesByField[field] || []).map((file) => ({
            ...file,
            category: field === 'quality_learning_resource' ? 'quality_learning_resource' : 'internet',
          }))
      );

      // Prepare payload
      const payload = {
        other_staff_id: parseInt(staffId),
        cycle_sub_category_id: parseInt(nba_criteria_sub_level2_id),
        quality_learning_resource: formData.content?.quality_learning_resource || "",
        internet: formData.content?.internet || "",
        supporting_documents: filesWithCategory
          .filter((f) => f.url || f.s3Url)
          .map((f) => ({
            description: f.description || "",
            filename: f.filename || f.name || "",
            url: f.s3Url || f.url || "",
            id: f.id,
            category: f.category
          })),
      };

      console.log("🟠 Criterion9_3Form - Save payload:", payload);

      let response;
      const hasExistingEntry = feedbackAnalysisId || propFeedbackAnalysisId;

      if (hasExistingEntry) {
        // Update existing record
        const idToUse = feedbackAnalysisId || propFeedbackAnalysisId;
        console.log("🔄 Criterion9_3Form - Updating existing entry with ID:", idToUse);
        response = await newnbaCriteria9Service.updateCriteria9('9.3', idToUse, payload);
      } else {
        // Create new record
        console.log("🆕 Criterion9_3Form - Creating new entry");
        response = await newnbaCriteria9Service.saveCriteria9Data('9.3', payload);
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
      if (response?.feedback_analysis_id && !feedbackAnalysisId) {
        setFeedbackAnalysisId(response.feedback_analysis_id);
      }

      setAlert(
        <SweetAlert
          success
          title="Saved!"
          confirmBtnText="OK"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => setAlert(null)}
        >
          Criterion 9.3 saved successfully
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
    if (!feedbackAnalysisId) {
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
            await newnbaCriteria9Service.deleteCriteria9('9.3', feedbackAnalysisId);
            setAlert(
              <SweetAlert
                success
                title="Deleted!"
                confirmBtnCssClass="btn-confirm"
                confirmBtnText="OK"
                onConfirm={() => setAlert(null)}
              >
                Library and Internet record deleted successfully
              </SweetAlert>
            );
            await loadData();
            setFeedbackAnalysisId(null);
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
        onDelete={feedbackAnalysisId ? handleDelete : null}
        isCompleted={completed}
        isContributorEditable={isContributorEditable}
        saving={saving}
        hasExistingData={!!feedbackAnalysisId}
        showFileCategories={true}
      />

      {alert}
    </div>
  );
};

export default Criterion9_3Form;