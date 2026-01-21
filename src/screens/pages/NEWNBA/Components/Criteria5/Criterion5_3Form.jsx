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
      "5.3": `5.3. Faculty Qualification (25)

• Faculty qualification index (FQI) = 2.5 * [(10X + 4Y)/RF] where:
  • X = No. of faculty members with Ph.D. degree or equivalent as per AICTE/UGC norms.
  • Y = No. of faculty members with M.Tech. or M.E. degree or equivalent as per AICTE/UGC norms.
  • RF = No. of required faculty in the Department including allied Departments to adhere to the 20:1 Student-Faculty ratio, with calculations based on both student numbers and faculty requirements as per section 5.1 of SAR; (RF = S/20).

Note:
• To determine the RF value (No. of required faculty in the Department, including allied Departments to adhere to the 20:1 Student-Faculty ratio), all students (S as defined in section 5.1 of SAR) in the department, as well as those in allied departments, need to be considered.
• The programs, such as MCA, BCA, and other non-engineering programs running in the Department or allied Departments, need to have sufficient faculty members to support those programs and exclude the faculty members and students listed in Table No. 5.3.1 (X, Y, and RF).`
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

  // ---------------- CONFIG FOR 5.3 FACULTY QUALIFICATION ----------------
  const config = {
    title: "5.3. Faculty Qualification",
    totalMarks: 25,
    fields: [
      {
        name: "5.3",
        label: "5.3. Faculty Qualification",
        marks: 25,
        hasTable: true,
        tableConfig: {
          title: "Table No. 5.3.1: Faculty qualification.",
          description: "Faculty qualification index (FQI) = 2.5 × [(10X + 4Y)/RF]",
          columns: [
            { field: "year", header: "Year", type: "label" },
            { field: "X", header: "X (Ph.D.)", type: "number", integer: true, tooltip: "No. of faculty with Ph.D. or equivalent" },
            { field: "Y", header: "Y (M.Tech/M.E.)", type: "number", integer: true, tooltip: "No. of faculty with M.Tech/M.E. or equivalent" },
            { field: "RF", header: "RF", type: "number", integer: true, tooltip: "Required Faculty = Total Students / 20" },
            { field: "FQI", header: "FQI = 2.5 × [(10X + 4Y)/RF]", type: "calculated", tooltip: "Faculty Qualification Index" },
          ],
          years: ["CAY", "CAYm1", "CAYm2"],
          marksGuidance: "Marks = Average FQI (capped at 25 marks)",
          note: "RF should be calculated as S/20 from section 5.1"
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
        data = response.data.find(item => item && (item.fqi_id || item.id)) || {};
      } else if (response?.data) {
        data = response.data;
      } else if (response && !response.data) {
        data = Array.isArray(response) ? (response.find(item => item && (item.fqi_id || item.id)) || {}) : response;
      }

      if (data.fqi_id || data.id) {
        setRecordId(data.fqi_id || data.id);

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
        const formattedTableData = (data.faculty_qualification_data || []).map((item, index) => ({
          id: `row-${index}`,
          year: item.year || "",
          X: item.x_phd?.toString() || "",
          Y: item.y_mtech?.toString() || "",
          RF: item.required_faculty_rf?.toString() || "",
          FQI: item.fqi?.toString() || "",
        }));

        // Handle files
        let filesByField = {};
        if (data.faculty_qualification_document && Array.isArray(data.faculty_qualification_document)) {
          data.faculty_qualification_document.forEach(doc => {
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
            "5.3": data.fqi_description || config.fields[0].content || ""
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
        x_phd: parseInt(row.X) || 0,
        y_mtech: parseInt(row.Y) || 0,
        required_faculty_rf: parseInt(row.RF) || 0,
        fqi: parseFloat(row.FQI) || 0,
      }));


      // Transform supporting documents - using working logic from Criterion5_4Form
      console.log("formData.filesByField:", formData.filesByField);

      const filesWithCategory = Object.keys(formData.filesByField || {}).flatMap(
        (field) =>
          (formData.filesByField[field] || []).map((file) => ({
            ...file,
            category: "Faculty Qualification Documents",
          }))
      );

      console.log("filesWithCategory:", filesWithCategory);

      const faculty_qualification_document = filesWithCategory
        .filter((f) => {
          console.log("Checking file:", f, "has s3Url:", !!f.s3Url, "has url:", !!f.url, "has filename:", !!f.filename);
          return (f.s3Url || f.url) && f.filename;
        })
        .map((f) => ({
          field_name: "5.3",
          file_name: f.filename,
          file_url: f.s3Url || f.url,
          description: f.description || "",
          category: f.category || "Faculty Qualification Documents",
        }));

      console.log("faculty_qualification_document:", faculty_qualification_document);


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
        // fqi_description: formData.content["5.3"] || "",
        faculty_qualification_data: formattedTableData,
        faculty_qualification_document: faculty_qualification_document,
      };

      console.log("🚀 Saving payload:", payload);

      let response;
      if (recordId) {
        // Update existing record
        response = await newnbaCriteria5Service.updateCriteria5_3_Data(recordId, payload,staffIdToSave);
        console.log("✅ Update response:", response);
        setSuccessMessage("Section updated successfully!");
      } else {
        // Create new record
        response = await newnbaCriteria5Service.saveCriteria5_3_Data(payload,staffIdToSave);
        console.log("✅ Save response:", response);

        // Set recordId from response
        if (response?.data?.fqi_id || response?.data?.id) {
          setRecordId(response.data.fqi_id || response.data.id);
        } else if (response?.fqi_id || response?.id) {
          setRecordId(response.fqi_id || response.id);
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

    // 🔴 IMPORTANT: recordId clear karo
    setRecordId(null);

    // 🔴 IMPORTANT: approval status bhi reset karo
    setApprovalStatus(null);
    setContributorName("");

    // 🔴 IMPORTANT: UI state reset
    setInitialData({
      content: { "5.3": config.fields[0].content || "" },
      tableData: [],
      filesByField: {},
    });

    setShowDeleteAlert(false);

    // 🔴 MOST IMPORTANT: data dubara load karo
    await loadData();

    onSaveSuccess?.();

  } catch (err) {
    console.error("Delete error:", err);
    toast.error(
      err.response?.data?.message || "❌ Failed to delete data. Please try again."
    );
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
        Loading 5.3. Faculty Qualification...
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