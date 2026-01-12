// Criterion5_5Form.jsx
import React, { useState, useEffect, useCallback } from "react";
import GenericCriteriaForm5_5 from "./GenericCriteriaForm5_5";
import { newnbaCriteria5Service } from "../../Services/NewNBA-Criteria5.service";
import { toast } from "react-toastify";
import SweetAlert from "react-bootstrap-sweetalert";
import StatusBadge from "../StatusBadge";

const Criterion5_5Form = ({
  cycle_sub_category_id,
  other_staff_id,
  isEditable = true,
  onSaveSuccess,
  cardItem = null,
}) => {
  console.log("🔵 Criterion5_5Form props:", {
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
  const [isCoordinatorView, setIsCoordinatorView] = useState(false);
  const [currentUserStaffId, setCurrentUserStaffId] = useState(null);

  const [initialData, setInitialData] = useState({
    content: {
      "5.5": `5.5. Faculty Retention (10)

• Faculty retention ratio (FR) = ((A×0)+(B×1)+(C×2)+(D×3)+(E×4))/RF × 2.5 where:
  • RF = No. of required faculty in the Department including allied Departments to adhere to the 20:1 Student-Faculty ratio (RF=S/20)
  • AF = No. of available faculty members in the Department including allied Departments
  • A = Faculty members with less than 1 year experience
  • B = Faculty members with 1-2 years experience
  • C = Faculty members with 2-3 years experience
  • D = Faculty members with 3-4 years experience
  • E = Faculty members with more than 4 years experience

• Marks = (Average FR) × 10/8 (Maximum 10 marks)

Note:
• The FR calculation is done separately for CAYm1, CAYm2, and CAYm3.
• Average FR = (FR_1 + FR_2 + FR_3)/3
• If any faculty member is repeated in the experience categories, they should be counted only once in the appropriate category.`
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

  // ---------------- CONFIG FOR 5.5 FACULTY RETENTION ----------------
  const config = {
    title: "5.5. Faculty Retention",
    totalMarks: 10,
    fields: [
      {
        name: "5.5",
        label: "5.5. Faculty Retention Ratio",
        marks: 10,
        hasTable: true,
        tableConfig: {
          title: "Table No. 5.5.1: Faculty retention ratio",
          description: "FR = ((A×0)+(B×1)+(C×2)+(D×3)+(E×4))/RF × 2.5",
          columns: [
            { field: "item", header: "Item", type: "label", readOnly: true },
            { field: "caym1", header: "CAYm1", type: "number", decimal: true },
            { field: "caym2", header: "CAYm2", type: "number", decimal: true },
            { field: "caym3", header: "CAYm3", type: "number", decimal: true },
          ],
          years: ["CAYm1", "CAYm2", "CAYm3"],
          marksGuidance: "Marks = (Average FR) × 10/8 (Maximum 10 marks)",
          note: "Average FR = (FR_1 + FR_2 + FR_3)/3",
          predefinedRows: [
            { 
              item: "RF = No. of required faculty in the Department including allied Departments to adhere to the 20:1 Student-Faculty ratio (RF=S/20)",
              caym1: "",
              caym2: "",
              caym3: ""
            },
            { 
              item: "AF = No. of available faculty members in the Department including allied Departments",
              caym1: "",
              caym2: "",
              caym3: ""
            },
            { 
              item: "A = Faculty members with less than 1 year experience",
              caym1: "",
              caym2: "",
              caym3: ""
            },
            { 
              item: "B = Faculty members with 1-2 years experience",
              caym1: "",
              caym2: "",
              caym3: ""
            },
            { 
              item: "C = Faculty members with 2-3 years experience",
              caym1: "",
              caym2: "",
              caym3: ""
            },
            { 
              item: "D = Faculty members with 3-4 years experience",
              caym1: "",
              caym2: "",
              caym3: ""
            },
            { 
              item: "E = Faculty members with more than 4 years experience",
              caym1: "",
              caym2: "",
              caym3: ""
            },
            { 
              item: "FR = ((A×0)+(B×1)+(C×2)+(D×3)+(E×4))/RF × 2.5",
              caym1: "",
              caym2: "",
              caym3: "",
              calculated: true
            },
            { 
              item: "Average FR = (FR_1 + FR_2 + FR_3)/3",
              caym1: "0.00",
              caym2: "0.00",
              caym3: "0.00",
              averageFR: "0.00",
              summary: true
            },
          ],
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
    
    console.log("🎯 Criterion5_5Form - Final staffId:", staffIdToUse);
    console.log("🎯 Is Coordinator View:", isCoordinatorView);
    console.log("🎯 Current User Staff ID:", currentUserStaffId);

    if (!staffIdToUse) {
      console.log("❌ Criterion5_5Form - No staffId found, using empty data");
      setInitialData({
        content: { "5.5": config.fields[0].content || "" },
        tableData: config.fields[0].tableConfig.predefinedRows.map((row, index) => ({
          id: `row-${index}`,
          sn: index + 1,
          ...row,
        })),
        filesByField: {
          "5.5": [{
            id: `file-5.5-0`,
            description: "",
            file: null,
            filename: "",
            s3Url: "",
            uploading: false
          }]
        },
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log("📡 Criterion5_5Form - Making API call with:");
      console.log("  - cycle_sub_category_id:", cycle_sub_category_id);
      console.log("  - staffId:", staffIdToUse);
      
      const response = await newnbaCriteria5Service.getCriteria5_5_Data(cycle_sub_category_id, staffIdToUse);
      console.log("📊 Criterion5_5Form - Raw API Response:", response);

      // Handle both array and single object responses
      let data = {};
      if (Array.isArray(response?.data)) {
        data = response.data.find(item => item && (item.faculty_retention_id || item.id)) || {};
      } else if (response?.data) {
        data = response.data;
      } else if (response && !response.data) {
        data = Array.isArray(response) ? (response.find(item => item && (item.faculty_retention_id || item.id)) || {}) : response;
      }

      if (data.faculty_retention_id || data.id) {
        setRecordId(data.faculty_retention_id || data.id);
        
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
        let formattedTableData = [];
        if (data.faculty_retention_table) {
          try {
            // Check if it's a string or already parsed
            const tableData = typeof data.faculty_retention_table === 'string' 
              ? JSON.parse(data.faculty_retention_table) 
              : data.faculty_retention_table;
            
            if (Array.isArray(tableData)) {
              formattedTableData = tableData.map((item, index) => ({
                id: item.id || `row-${index}`,
                sn: index + 1,
                item: item.item || config.fields[0].tableConfig.predefinedRows[index]?.item || "",
                caym1: item.caym1?.toString() || "",
                caym2: item.caym2?.toString() || "",
                caym3: item.caym3?.toString() || "",
                averageFR: item.averageFR?.toString() || "",
                calculated: item.calculated || false,
                summary: item.summary || false
              }));
            }
          } catch (error) {
            console.error("Error parsing table data:", error);
            // Fallback to predefined rows
            formattedTableData = config.fields[0].tableConfig.predefinedRows.map((row, index) => ({
              id: `row-${index}`,
              sn: index + 1,
              ...row,
            }));
          }
        } else {
          // No existing data, use predefined rows
          formattedTableData = config.fields[0].tableConfig.predefinedRows.map((row, index) => ({
            id: `row-${index}`,
            sn: index + 1,
            ...row,
          }));
        }

        // Parse faculty_retention_documents - handle array response
        let filesByField = {};
        if (Array.isArray(data.faculty_retention_documents) && data.faculty_retention_documents.length > 0) {
          filesByField["5.5"] = data.faculty_retention_documents.map((doc, index) => ({
            id: doc.id || `file-${index}`,
            filename: doc.file_name || doc.fileName || "",
            description: doc.description || "",
            s3Url: doc.file_url || doc.fileUrl || "",
            uploading: false
          }));
        } else {
          // No files or empty array, create single empty row
          filesByField["5.5"] = [{
            id: `file-5.5-0`,
            description: "",
            file: null,
            filename: "",
            s3Url: "",
            uploading: false
          }];
        }

        // Store approval status data
        const approvalData = {
          approval_status: data.approval_status || data.approvalStatus,
          rejection_reason: data.rejection_reason || data.rejectionReason,
          approved_by_name: data.approved_by_name || data.approvedByName,
          submitted_time: data.submitted_time || data.created_at || data.createdAt,
        };

        console.log("Formatted Initial Data:", {
          tableData: formattedTableData,
          filesByField: filesByField,
          ...approvalData
        });

        setInitialData({
          content: {
            "5.5": data.faculty_retention_description || config.fields[0].content || ""
          },
          tableData: formattedTableData,
          filesByField: filesByField,
        });
      } else {
        // No existing data, use defaults
        setApprovalStatus(null);
        setContributorName("");
        setInitialData({
          content: { "5.5": config.fields[0].content || "" },
          tableData: config.fields[0].tableConfig.predefinedRows.map((row, index) => ({
            id: `row-${index}`,
            sn: index + 1,
            ...row,
          })),
          filesByField: {
            "5.5": [{
              id: `file-5.5-0`,
              description: "",
              file: null,
              filename: "",
              s3Url: "",
              uploading: false
            }]
          },
        });
      }

    } catch (err) {
      console.error("Load failed:", err);
      toast.error("Failed to load saved data");
      // Set defaults on error
      setInitialData({
        content: { "5.5": config.fields[0].content || "" },
        tableData: config.fields[0].tableConfig.predefinedRows.map((row, index) => ({
          id: `row-${index}`,
          sn: index + 1,
          ...row,
        })),
        filesByField: {
          "5.5": [{
            id: `file-5.5-0`,
            description: "",
            file: null,
            filename: "",
            s3Url: "",
            uploading: false
          }]
        },
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
        item: row.item || "",
        caym1: parseFloat(row.caym1) || 0,
        caym2: parseFloat(row.caym2) || 0,
        caym3: parseFloat(row.caym3) || 0,
        averageFR: parseFloat(row.averageFR) || 0,
        calculated: row.calculated || false,
        summary: row.summary || false
      }));

      // Transform faculty retention documents
      const faculty_retention_documents = [];
      let hasUnuploadedFiles = false;
      
      if (formData.filesByField && formData.filesByField["5.5"]) {
        formData.filesByField["5.5"].forEach((file) => {
          if (file.file && !file.s3Url) {
            hasUnuploadedFiles = true;
          } else if (file.s3Url && file.filename) {
            faculty_retention_documents.push({
              file_name: file.filename,
              file_url: file.s3Url,
              description: file.description || ""
            });
          }
        });
      }
      
      if (hasUnuploadedFiles) {
        toast.error("Please wait for all files to upload before saving");
        return;
      }

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

      // Build payload - Use correct field names from API
      const payload = {
        other_staff_id: parseInt(staffIdToSave),
        cycle_sub_category_id: parseInt(cycle_sub_category_id),
        faculty_retention_description: formData.content["5.5"] || "",
        faculty_retention_table: formattedTableData,
        faculty_retention_documents: faculty_retention_documents,
      };

      console.log("🚀 Saving payload:", payload);

      let response;
      if (recordId) {
        // Update existing record
        response = await newnbaCriteria5Service.updateCriteria5_5_Data(recordId, payload);
        console.log("✅ Update response:", response);
        setSuccessMessage("Section updated successfully!");
      } else {
        // Create new record
        response = await newnbaCriteria5Service.saveCriteria5_5_Data(payload);
        console.log("✅ Save response:", response);
        
        // Set recordId from response
        if (response?.data?.faculty_retention_id || response?.data?.id) {
          setRecordId(response.data.faculty_retention_id || response.data.id);
        } else if (response?.faculty_retention_id || response?.id) {
          setRecordId(response.faculty_retention_id || response.id);
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
      await newnbaCriteria5Service.deleteCriteria5_5Data(recordId);
  
      toast.success("✅ Section data deleted successfully!");
  
      // 🔥 IMPORTANT: Reset everything immediately
      setRecordId(null);
      setApprovalStatus(null);
      setContributorName("");
  
      setInitialData({
        content: { "5.5": config.fields[0].content || "" },
        tableData: config.fields[0].tableConfig.predefinedRows.map((row, index) => ({
          id: `row-${index}`,
          sn: index + 1,
          ...row,
        })),
        filesByField: {
          "5.5": [
            {
              id: `file-5.5-0`,
              description: "",
              file: null,
              filename: "",
              s3Url: "",
              uploading: false,
            },
          ],
        },
      });
  
      setShowDeleteAlert(false);
  
      // 🔥 THIS IS THE KEY LINE
      await loadData(); // ensures UI & backend are in sync
  
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

  // ---------------- DETERMINE EDITABILITY ----------------
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
        Loading 5.5. Faculty Retention...
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

      <GenericCriteriaForm5_5
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
            <p className="text-sm text-gray-600">This will delete table data and all uploaded documents.</p>
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
         
            </div>
          </div>
        </SweetAlert>
      )}
    </div>
  );
};

export default Criterion5_5Form;