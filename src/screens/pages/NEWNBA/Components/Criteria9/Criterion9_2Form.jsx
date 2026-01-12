/** @format */
import React, { useState, useEffect, useCallback } from "react";
import GenericCriteriaForm from "../GenericCriteriaForm";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import StatusBadge from "../StatusBadge";
import SweetAlert from "react-bootstrap-sweetalert";

// Import the new service
import { newnbaCriteria9_2_Service } from "../../Services/NewNBA-Criteria9_2.service";
import { getAllProfileFlags } from "@/_services/adminProfileUtils";

const Criterion9_2Form = ({
  nba_accredited_program_id,
  nba_criteria_sub_level2_id,
  nba_contributor_allocation_id,
  isContributorEditable = true,
  completed = false,
  onSaveSuccess,
  otherStaffId = null, // For coordinator viewing specific contributor's data
  editMode = false,
  mentoringSystemId: propMentoringSystemId = null,
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mentoringSystemId, setMentoringSystemId] = useState(null);
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
    title: "9.2. Mentoring System (05)",
    totalMarks: 5,
    fields: [
      {
        name: "mentoring_system_details",
        label: "Type of mentoring: Professional guidance/career advancement/course work specific/laboratory specific/all-round development. Number of faculty mentors: Number of students per mentor: Frequency of meeting",
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
      
      console.log("🎯 Criterion9_2Form - Loading data with:");
      console.log("  - otherStaffId prop:", otherStaffId);
      console.log("  - nba_contributor_allocation_id:", nba_contributor_allocation_id);
      console.log("  - nba_criteria_sub_level2_id:", nba_criteria_sub_level2_id);
      console.log("  - propMentoringSystemId:", propMentoringSystemId);
      console.log("  - editMode:", editMode);

      // Determine which staff ID to use - otherStaffId has priority
      const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
      const userInfo2 = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const staffIdToUse = otherStaffId || nba_contributor_allocation_id || userInfo?.rawData?.other_staff_id || userInfo.user_id || userInfo2?.other_staff_id;
      
      console.log("🎯 Criterion9_2Form - Final staffId:", staffIdToUse);

      if (!staffIdToUse) {
        console.log("❌ Criterion9_2Form - No staffId found, using empty data");
        setInitialData({ 
          content: { mentoring_system_details: "" }, 
          tableData: [], 
          filesByField: {} 
        });
        setLoading(false);
        return;
      }

      console.log("📡 Criterion9_2Form - Making API call with:");
      console.log("  - cycleSubCategoryId:", nba_criteria_sub_level2_id);
      console.log("  - staffId:", staffIdToUse);

      // Use the new service API call
      const response = await newnbaCriteria9_2_Service.getCriteria9_2_Data(
        nba_criteria_sub_level2_id, // cycleSubCategoryId
        staffIdToUse // otherStaffId
      );

      console.log("📊 Criterion9_2Form - Raw API Response:", response);

      // Handle array response like Criterion2_1Form
      let dataItem = null;
      if (Array.isArray(response)) {
        if (response.length > 0) {
          dataItem = response[0];
          console.log("📦 Criterion9_2Form - Extracted first item from array:", dataItem);
        } else {
          console.log("📭 Criterion9_2Form - Empty array response, no data found");
        }
      } else {
        dataItem = response;
      }

      console.log("📊 Final dataItem:", dataItem);

      if (dataItem && dataItem.mentoring_system_id) {
        console.log("✅ Criterion9_2Form - Found existing data");
        
        // Set contributor name for display
        if (dataItem.other_staff_name) {
          setContributorName(dataItem.other_staff_name);
        } else if (dataItem.firstname) {
          const name = `${dataItem.firstname || ''} ${dataItem.middlename || ''} ${dataItem.lastname || ''}`.trim();
          setContributorName(name);
        }

        // Set ID
        setMentoringSystemId(dataItem.mentoring_system_id);

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

        // Transform files to filesByField structure like Criterion2_1Form
        const filesArray = Array.isArray(dataItem.mentoring_supporting_documents) 
          ? dataItem.mentoring_supporting_documents 
          : [];

        const filesByField = {
          "mentoring_system_details": filesArray.length > 0
            ? filesArray.map((f, i) => ({
                id: f.id || `file-mentoring-${i}`,
                filename: f.filename || f.name || "",
                s3Url: f.url || f.filePath || "",
                // ✅ IMPORTANT: Add 'url' field for GenericCriteriaForm to recognize the file
                url: f.url || f.filePath || f.s3Url || "",
                description: f.description || "",
                uploading: false
              }))
            : [{ 
                id: `file-mentoring-0`, 
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
            mentoring_system_details: dataItem.mentoring_system_details || "" 
          },
          tableData: [],
          filesByField: filesByField
        });

      } else {
        // No existing data, initialize empty
        console.log("📭 Criterion9_2Form - No existing data found, showing blank form");
        setMentoringSystemId(null);
        setApprovalStatus(null);
        setContributorName("");
        
        setInitialData({ 
          content: { mentoring_system_details: "" }, 
          tableData: [], 
          filesByField: {
            "mentoring_system_details": [{ 
              id: `file-mentoring-0`, 
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
        content: { mentoring_system_details: "" }, 
        tableData: [], 
        filesByField: {
          "mentoring_system_details": [{ 
            id: `file-mentoring-0`, 
            description: "", 
            file: null, 
            filename: "", 
            s3Url: "", 
            url: "", // ✅ Add empty url field
            uploading: false 
          }]
        }
      });
      setMentoringSystemId(null);
      setApprovalStatus(null);
      setContributorName("");
      
    } finally {
      setLoading(false);
    }
  }, [nba_accredited_program_id, nba_criteria_sub_level2_id, nba_contributor_allocation_id, otherStaffId, propMentoringSystemId, editMode]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ---------------- SAVE DATA ----------------
  const handleSave = async (formData) => {
    console.log("Save data received:", formData);
    
    // Check permissions like Criterion2_1Form
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
            category: "Mentoring System",
            // ✅ Ensure url property exists for GenericCriteriaForm
            url: file.url || file.s3Url || "",
          }))
      );

      console.log("Files with category:", filesWithCategory);

      // Prepare payload
      const payload = {
        other_staff_id: parseInt(staffId),
        cycle_sub_category_id: parseInt(nba_criteria_sub_level2_id),
        mentoring_system_details: formData.content?.mentoring_system_details || "",
        mentoring_supporting_documents: filesWithCategory
          .filter((f) => f.url || f.s3Url || f.file)
          .map((f) => ({
            description: f.description || "",
            filename: f.filename || f.name || f.file?.name || "",
            url: f.url || f.s3Url || "",
            id: f.id,
          })),
      };

      console.log("🟠 Criterion9_2Form - Save payload:", payload);
      console.log("🟠 staffId to save:", staffId);

      let response;
      const hasExistingEntry = mentoringSystemId || propMentoringSystemId;

      if (hasExistingEntry) {
        // Update existing record
        const idToUse = mentoringSystemId || propMentoringSystemId;
        console.log("🔄 Criterion9_2Form - Updating existing entry with ID:", idToUse);
        response = await newnbaCriteria9_2_Service.updateCriteria9_2(
          idToUse,
          payload
        );
      } else {
        // Create new record
        console.log("🆕 Criterion9_2Form - Creating new entry");
        response = await newnbaCriteria9_2_Service.saveCriteria9_2_Data(payload);
      }

      console.log("Save response:", response);

      // ✅ IMMEDIATELY UPDATE LOCAL STATE with the saved data
      // This ensures files are shown without reloading
      const updatedFilesByField = {};
      
      Object.keys(formData.filesByField || {}).forEach(field => {
        const files = formData.filesByField[field] || [];
        updatedFilesByField[field] = files.map(file => {
          // Find matching file in payload
          const savedFile = payload.mentoring_supporting_documents?.find(
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
      if (response?.mentoring_system_id && !mentoringSystemId) {
        setMentoringSystemId(response.mentoring_system_id);
      }

      setAlert(
        <SweetAlert
          success
          title="Saved!"
          confirmBtnText="OK"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => setAlert(null)}
        >
          Criterion 9.2 saved successfully
        </SweetAlert>
      );

      // Call success callback
      onSaveSuccess?.();

    } catch (err) {
      console.error("Save failed:", err);
      console.error("Error details:", err.response?.data || err.message || err);
      
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
    if (!mentoringSystemId) {
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
            const response = await newnbaCriteria9_2_Service.deleteCriteria9_2(mentoringSystemId);
            
            let message = "Mentoring System record deleted successfully.";
            if (typeof response === "string") message = response;
            else if (response?.data && typeof response.data === "string") message = response.data;

            setAlert(
              <SweetAlert
                success
                title="Deleted!"
                confirmBtnCssClass="btn-confirm"
                confirmBtnText="OK"
                onConfirm={() => setAlert(null)}
              >
                {message}
              </SweetAlert>
            );

            await loadData();
            setMentoringSystemId(null);
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

      {/* ✅ ADDITIONAL: Manually show files in view mode */}
      {/* {!loading && (
        <div className="mb-6">
      
          {initialData.filesByField["mentoring_system_details"]?.some(file => 
            (file.s3Url || file.url) && file.filename
          ) && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <h4 className="text-lg font-bold text-blue-700 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
                Uploaded Documents
              </h4>
              <div className="space-y-2">
                {initialData.filesByField["mentoring_system_details"]?.map((file, index) => (
                  (file.s3Url || file.url) && file.filename && (
                    <div key={file.id || index} className="flex items-center justify-between p-3 bg-white rounded border">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">{file.description || `Document ${index + 1}`}</span>
                      </div>
                      <a 
                        href={file.s3Url || file.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        View File
                      </a>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}
        </div>
      )} */}

      <GenericCriteriaForm
        title={config.title}
        marks={config.totalMarks}
        fields={config.fields}
        initialData={initialData}
        onSave={handleSave}
        onDelete={mentoringSystemId ? handleDelete : null}
        isCompleted={completed}
        isContributorEditable={isContributorEditable}
        saving={saving}
        hasExistingData={!!mentoringSystemId}
        showFileCategories={true}
      />

      {alert}
    </div>
  );
};

export default Criterion9_2Form;