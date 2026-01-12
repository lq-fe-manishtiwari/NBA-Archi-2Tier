// Criterion5_3Form.jsx
import React, { useState, useEffect, useCallback } from "react";
import GenericCriteriaForm5_3 from "./GenericCriteriaForm5_3";
import { newnbaCriteria5Service } from "../../Services/NewNBA-Criteria5.service";
import { toast } from "react-toastify";
import SweetAlert from "react-bootstrap-sweetalert";
import StatusBadge from "../StatusBadge";

const Criterion5_3Form = ({
  cycle_sub_category_id,
  other_staff_id,
  isEditable = true,
  onSaveSuccess,
  cardItem = null,
}) => {
  console.log("🔵 Criterion5_3Form props:", {
    cycle_sub_category_id,
    other_staff_id,
    isEditable
  });

  const [loading, setLoading] = useState(true);
  const [recordId, setRecordId] = useState(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [approvalStatus, setApprovalStatus] = useState(null);
  const [userRole, setUserRole] = useState({});
  const [contributorName, setContributorName] = useState("");
  const [isCoordinatorView, setIsCoordinatorView] = useState(false);
  const [currentUserStaffId, setCurrentUserStaffId] = useState(null);

  const [initialData, setInitialData] = useState({
    content: {
      "5.3": `5.3. Faculty Cadre Proportion (25)

• Faculty Cadre Proportion is 1(RF1): 2(RF2): 6(RF3)

• RF1 = No. of Professors required = 1/9 × No. of Faculty required to comply with 20:1 Student-Faculty ratio based on no. of students (S) as per section 5.1 of SAR.

• RF2 = No. of Associate Professors required = 2/9 × No. of Faculty required to comply with 20:1 Student-Faculty ratio based on no. of students (S) as per section 5.1 of SAR.

• RF3 = No. of Assistant Professors required = 6/9 × No. of Faculty required to comply with 20:1 Student-Faculty ratio based on no. of students (S) as per section 5.1 of SAR.

• Faculty cadre and qualification and experience should be as per AICTE/UGC norms.`
    },
    tableData: [],
    filesByField: {},
  });

  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    setUserRole(userInfo);

    // Check if current user is coordinator
    if (userInfo.nba_coordinator === true) {
      setIsCoordinatorView(true);
    }

    // Get current user's staff ID
    const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}");
    const staffId = userProfile?.rawData?.other_staff_id || userInfo?.other_staff_id;
    setCurrentUserStaffId(staffId);
  }, []);

  // ---------------- CONFIG FOR 5.3 FACULTY CADRE PROPORTION ----------------
  const config = {
    title: "5.3. Faculty Cadre Proportion",
    totalMarks: 25,
    fields: [
      {
        name: "5.3",
        label: "5.3. Faculty Cadre Proportion",
        marks: 25,
        hasTable: true,
        tableConfig: {
          title: "Table No. 5.3.1 (AF1, AF2, AF3). Faculty cadre proportion details.",
          description: "Faculty Cadre Proportion is 1(RF1): 2(RF2): 6(RF3)",
          columns: [
            { field: "year", header: "Year", type: "label" },
            { field: "RF1", header: "Required Faculty (RF1)\\nProfessors", type: "number", decimal: true, tooltip: "Professors required" },
            { field: "AF1", header: "Available Faculty (AF1)\\nProfessors", type: "number", integer: true, tooltip: "Professors available" },
            { field: "RF2", header: "Required Faculty (RF2)\\nAssociate Professors", type: "number", decimal: true, tooltip: "Associate Professors required" },
            { field: "AF2", header: "Available Faculty (AF2)\\nAssociate Professors", type: "number", integer: true, tooltip: "Associate Professors available" },
            { field: "RF3", header: "Required Faculty (RF3)\\nAssistant Professors", type: "number", decimal: true, tooltip: "Assistant Professors required" },
            { field: "AF3", header: "Available Faculty (AF3)\\nAssistant Professors", type: "number", integer: true, tooltip: "Assistant Professors available" },
          ],
          years: ["CAY", "CAYm1", "CAYm2"],
          marksGuidance: "Marks = ⌈ AF1/RF1 + (AF2/RF2 × 0.6) + (AF3/RF3 × 0.4) ⌉ × 12.5 (Maximum 25 marks)",
          note: "If AF1 = AF2 = 0, then zero mark"
        }
      }
    ],
  };

  // ---------------- LOAD DATA ----------------
  const loadData = useCallback(async () => {
    if (!cycle_sub_category_id) {
      console.log("⏸️ Skipping load - missing cycle_sub_category_id");
      setLoading(false);
      return;
    }

    // Determine which staff ID to use
    let staffIdToUse;

    if (isCoordinatorView) {
      // Coordinator can view any contributor's data
      if (other_staff_id) {
        staffIdToUse = other_staff_id;
      } else if (cardItem?.other_staff_id) {
        staffIdToUse = cardItem.other_staff_id;
      } else {
        // If no specific staff ID provided, use current user's ID
        staffIdToUse = currentUserStaffId;
      }
    } else {
      // Contributor can only view/edit their own data
      staffIdToUse = currentUserStaffId;
    }

    console.log("🎯 Criterion5_3Form - Final staffId:", staffIdToUse);
    console.log("🎯 Is Coordinator View:", isCoordinatorView);
    console.log("🎯 Current User Staff ID:", currentUserStaffId);

    if (!staffIdToUse) {
      console.log("❌ Criterion5_3Form - No staffId found, using empty data");
      setInitialData({
        content: { "5.3": config.fields[0].content || "" },
        tableData: [],
        filesByField: {},
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log("📡 Criterion5_3Form - Making API call with:");
      console.log("  - cycle_sub_category_id:", cycle_sub_category_id);
      console.log("  - staffId:", staffIdToUse);

      const response = await newnbaCriteria5Service.getCriteria5_3_Data(cycle_sub_category_id, staffIdToUse);
      console.log("📊 Criterion5_3Form - Raw API Response:", response);

      // Handle both array and single object responses
      let data = {};
      if (Array.isArray(response?.data)) {
        data = response.data.find(item => item && (item.cadre_proportion_id || item.id)) || {};
      } else if (response?.data) {
        data = response.data;
      } else if (response && !response.data) {
        data = Array.isArray(response) ? (response.find(item => item && (item.cadre_proportion_id || item.id)) || {}) : response;
      }

      if (data.cadre_proportion_id || data.id) {
        setRecordId(data.cadre_proportion_id || data.id);

        // Set contributor name for display
        if (data.other_staff_name) {
          setContributorName(data.other_staff_name);
        } else if (data.firstname) {
          const name = `${data.firstname || ''} ${data.middlename || ''} ${data.lastname || ''}`.trim();
          setContributorName(name);
        }

        // Set approval status from cardItem or data
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

        // Format table data from API response
        const formattedTableData = (data.cadre_proportion_table || []).map((item, index) => ({
          id: `row-${index}`,
          year: item.year || "",
          RF1: item.professor_required?.toString() || "",
          AF1: item.professor_available?.toString() || "",
          RF2: item.associate_required?.toString() || "",
          AF2: item.associate_available?.toString() || "",
          RF3: item.assistant_required?.toString() || "",
          AF3: item.assistant_available?.toString() || "",
        }));

        // Handle files
        let filesByField = {};
        if (data.cadre_supporting_documents && Array.isArray(data.cadre_supporting_documents)) {
          data.cadre_supporting_documents.forEach(doc => {
            const fieldName = doc.field_name || "5.3";
            if (!filesByField[fieldName]) {
              filesByField[fieldName] = [];
            }
            filesByField[fieldName].push({
              id: `file-${Date.now()}-${Math.random()}`,
              filename: doc.file_name,
              url: doc.file_url,
              s3Url: doc.file_url,
              description: doc.description || "",
              uploading: false
            });
          });
          console.log("📁 Loaded files from API:", filesByField);
        }

        setInitialData({
          content: {
            "5.3": data.cadre_description || config.fields[0].content || ""
          },
          tableData: formattedTableData,
          filesByField: filesByField,
        });
      } else {
        // No existing data, use defaults
        setApprovalStatus(null);
        setContributorName("");
        setInitialData({
          content: { "5.3": config.fields[0].content || "" },
          tableData: [],
          filesByField: {},
        });
      }

    } catch (err) {
      console.error("Load failed:", err);
      toast.error("Failed to load saved data");
      // Set defaults on error
      setInitialData({
        content: { "5.3": config.fields[0].content || "" },
        tableData: [],
        filesByField: {},
      });
    } finally {
      setLoading(false);
    }
  }, [cycle_sub_category_id, other_staff_id, isCoordinatorView, currentUserStaffId, cardItem]);

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
    console.log("🔍 handleSave received formData:", formData);

    if (!isEditable) {
      toast.error("You don't have permission to edit");
      return;
    }

    // Check if coordinator is trying to edit contributor's data
    if (isCoordinatorView && other_staff_id && other_staff_id !== currentUserStaffId) {
      toast.error("Coordinator cannot edit contributor's data");
      return;
    }

    setSaveLoading(true);
    try {
      // Format table data for API
      const formattedTableData = (formData.tableData || []).map((row) => ({
        year: row.year,
        professor_required: parseFloat(row.RF1) || 0,
        professor_available: parseInt(row.AF1) || 0,
        associate_required: parseFloat(row.RF2) || 0,
        associate_available: parseInt(row.AF2) || 0,
        assistant_required: parseFloat(row.RF3) || 0,
        assistant_available: parseInt(row.AF3) || 0,
      }));

      // Transform supporting documents - using working logic from Criterion5_4Form
      console.log("formData.filesByField:", formData.filesByField);

      const filesWithCategory = Object.keys(formData.filesByField || {}).flatMap(
        (field) =>
          (formData.filesByField[field] || []).map((file) => ({
            ...file,
            category: "Faculty Cadre Documents",
          }))
      );

      console.log("filesWithCategory:", filesWithCategory);

      const cadre_supporting_documents = filesWithCategory
        .filter((f) => {
          console.log("Checking file:", f, "has s3Url:", !!f.s3Url, "has url:", !!f.url, "has filename:", !!f.filename);
          return (f.s3Url || f.url) && f.filename;
        })
        .map((f) => ({
          field_name: "5.3",
          file_name: f.filename,
          file_url: f.s3Url || f.url,
          description: f.description || "",
          category: f.category || "Faculty Cadre Documents",
        }));

      console.log("cadre_supporting_documents:", cadre_supporting_documents);

      // Use appropriate staff ID based on context
      let staffIdToSave;
      if (isCoordinatorView && other_staff_id) {
        // Coordinator saving for specific contributor
        staffIdToSave = other_staff_id;
      } else {
        // Contributor saving their own data
        staffIdToSave = currentUserStaffId;
      }

      if (!staffIdToSave) {
        toast.error("User staff ID not found");
        return;
      }

      // Build payload
      const payload = {
        other_staff_id: parseInt(staffIdToSave),
        cycle_sub_category_id: parseInt(cycle_sub_category_id),
        cadre_description: formData.content["5.3"] || "",
        cadre_proportion_table: formattedTableData,
        supporting_documents: cadre_supporting_documents,
      };

      console.log("🚀 Saving payload:", payload);

      let response;
      if (recordId) {
        // Update existing record
        response = await newnbaCriteria5Service.updateCriteria5_3_Data(recordId, payload);
        console.log("✅ Update response:", response);
        setSuccessMessage("Section updated successfully!");
      } else {
        // Create new record
        response = await newnbaCriteria5Service.saveCriteria5_3_Data(payload);
        console.log("✅ Save response:", response);

        // Set recordId from response
        if (response?.data?.cadre_proportion_id || response?.data?.id) {
          setRecordId(response.data.cadre_proportion_id || response.data.id);
        } else if (response?.cadre_proportion_id || response?.id) {
          setRecordId(response.cadre_proportion_id || response.id);
        }

        setSuccessMessage("Section created successfully!");
      }

      // Update local state immediately
      const updatedFilesByField = {};

      Object.keys(formData.filesByField || {}).forEach(field => {
        const files = formData.filesByField[field] || [];
        updatedFilesByField[field] = files.map(file => ({
          ...file,
          url: file.url || file.s3Url || "",
          uploading: false
        }));
      });

      setInitialData(prev => ({
        ...prev,
        content: formData.content,
        tableData: formData.tableData || prev.tableData,
        filesByField: updatedFilesByField
      }));

      setShowSuccessAlert(true);
      onSaveSuccess?.();

      // Refresh data from API
      await loadData();

    } catch (err) {
      console.error("Save failed:", err);
      toast.error(err.message || "Failed to save");
    } finally {
      setSaveLoading(false);
    }
  };

  // ---------------- DELETE DATA ----------------
  const handleDelete = () => {
    // Only allow deletion if user is editing their own data
    if (isCoordinatorView && other_staff_id && other_staff_id !== currentUserStaffId) {
      toast.error("Coordinator cannot delete contributor's data");
      return;
    }

    if (!recordId) {
      toast.info("There is no saved data to delete.");
      return;
    }
    setShowDeleteAlert(true);
  };

  const confirmDelete = async () => {
    try {
      await newnbaCriteria5Service.deleteCriteria5_3Data(recordId);
      toast.success('✅ Section data deleted successfully!');
      setRecordId(null);
      setShowDeleteAlert(false);
      setInitialData({
        content: { "5.3": config.fields[0].content || "" },
        tableData: [],
        filesByField: {},
      });
      onSaveSuccess?.();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(err.response?.data?.message || "❌ Failed to delete data. Please try again.");
      setShowDeleteAlert(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteAlert(false);
    toast.info("Delete operation cancelled.");
  };

  // ---------------- DETERMINE EDITABILITY ----------------
  // Contributor can edit if: not in coordinator view AND isEditable is true
  // Coordinator can edit if: in coordinator view AND editing their own data
  const determineEditable = () => {
    if (!isEditable) return false;

    if (isCoordinatorView) {
      // Coordinator can only edit if viewing their own data
      if (other_staff_id && other_staff_id !== currentUserStaffId) {
        return false; // Coordinator viewing other contributor's data
      }
      return true; // Coordinator viewing/editing their own data
    }

    // Contributor editing their own data
    return true;
  };

  const isFormEditable = determineEditable();

  // ---------------- UI ----------------
  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-2xl text-indigo-600 font-medium">
        Loading 5.3. Faculty Cadre Proportion...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Coordinator View Indicator */}
      {isCoordinatorView && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-yellow-700">Coordinator View Mode</span>
            {other_staff_id && other_staff_id !== currentUserStaffId && (
              <span className="text-yellow-600">(Viewing Contributor's Data - Read Only)</span>
            )}
          </div>
        </div>
      )}

      {/* Approval Status - Show for contributors, not for coordinator */}
      {approvalStatus && approvalStatus.status !== 'COORDINATORS_DATA' && (
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

      {/* Contributor Name Display - Show when viewing someone else's data */}
      {contributorName && (other_staff_id !== currentUserStaffId) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-blue-700">Contributor:</span>
            <span className="text-blue-600">{contributorName}</span>
          </div>
        </div>
      )}

      <GenericCriteriaForm5_3
        title={config.title}
        marks={config.totalMarks}
        fields={config.fields}
        initialData={initialData}
        saving={saveLoading}
        isCompleted={false}
        isContributorEditable={isFormEditable}
        onSave={handleSave}
        onDelete={handleDelete}
        approvalStatus={approvalStatus?.status}
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

export default Criterion5_3Form;