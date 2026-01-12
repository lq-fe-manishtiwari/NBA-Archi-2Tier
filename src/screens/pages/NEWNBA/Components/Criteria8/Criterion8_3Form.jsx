import React, { useState, useEffect, useCallback } from "react";
import GenericCriteriaForm from "../GenericCriteriaForm";
import { newnbaCriteria8Service } from "../../Services/NewNBA-Criteria8.service";
import SweetAlert from "react-bootstrap-sweetalert";
import { getAllProfileFlags } from "@/_services/adminProfileUtils";
import StatusBadge from "../StatusBadge";

const Criterion8_3Form = ({
  nba_accredited_program_id,
  nba_criteria_sub_level2_id,
  nba_contributor_allocation_id,
  isContributorEditable = true,
  completed = false,
  onSaveSuccess,
  otherStaffId = null,
  editMode = false,
  facultyQualificationId: propFacultyQualificationId = null,
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [facultyQualificationId, setFacultyQualificationId] = useState(propFacultyQualificationId);
  const [initialData, setInitialData] = useState({
    content: {},
    tableData: {},
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

  const defaultRows = [
    {
      item: "No. of faculty members with Ph.D. degree",
      caym1: "",
      caym2: "",
      caym3: "",
    },
    {
      item: "No. of publications in peer reviewed journals",
      caym1: "",
      caym2: "",
      caym3: "",
    },
    {
      item: "No. of publications in conferences",
      caym1: "",
      caym2: "",
      caym3: "",
    },
  ];

  const config = {
    title: "8.3 Improvement in Faculty Qualification/Contribution (10)",
    totalMarks: 10,
    fields: [
      {
        name: "8.3",
        label: "Assessment is based on improvement in qualification and publications with respect to the Department During the assessment period",
        marks: 10,
        hasTable: true,
        tableConfig: {
          title: "Table No.8.3.1: Improvement in qualification and publications",
          columns: [
            { field: "item", header: "Item", readOnly: true, width: "400px" },
            { field: "caym1", header: "CAYm1", width: "200px" },
            { field: "caym2", header: "CAYm2", width: "200px" },
            { field: "caym3", header: "CAYm3", width: "200px" },
          ],
          defaultRows: defaultRows,
        },
      },
    ],
  };

  // ---------------- LOAD DATA ----------------
  const loadData = useCallback(async () => {
    if (!nba_criteria_sub_level2_id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      console.log("🎯 Criterion8_3Form - Loading data with:");
      console.log("  - otherStaffId prop:", otherStaffId);
      console.log("  - nba_criteria_sub_level2_id:", nba_criteria_sub_level2_id);
      console.log("  - propFacultyQualificationId:", propFacultyQualificationId);
      console.log("  - editMode:", editMode);

      // Determine which staff ID to use - otherStaffId has priority
      const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
      const userInfo2 = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const staffIdToUse = otherStaffId || userInfo?.rawData?.other_staff_id || userInfo.user_id || userInfo2?.other_staff_id;
      
      console.log("🎯 Criterion8_3Form - Final staffId:", staffIdToUse);

      if (!staffIdToUse) {
        console.log("❌ Criterion8_3Form - No staffId found, using empty data");
        setInitialData({
          content: { improvement_details: "" },
          tableData: { "8.3": defaultRows },
          filesByField: {
            "8.3": [{
              id: `file-8.3-0`,
              description: "",
              file: null,
              filename: "",
              s3Url: "",
              url: "",
              uploading: false
            }]
          }
        });
        setLoading(false);
        return;
      }

      console.log("📡 Criterion8_3Form - Making API call with:");
      console.log("  - cycleSubCategoryId:", nba_criteria_sub_level2_id);
      console.log("  - staffId:", staffIdToUse);

      // Use the service API call
      const response = await newnbaCriteria8Service.getCriteria8_3_Data(
        nba_criteria_sub_level2_id,
        staffIdToUse
      );

      console.log("📊 Criterion8_3Form - Raw API Response:", response);

      // Handle array response like Criterion9_4Form
      let dataItem = null;
      if (Array.isArray(response)) {
        if (response.length > 0) {
          dataItem = response[0];
          console.log("📦 Criterion8_3Form - Extracted first item from array:", dataItem);
        } else {
          console.log("📭 Criterion8_3Form - Empty array response, no data found");
        }
      } else {
        dataItem = response;
      }

      console.log("📊 Final dataItem:", dataItem);

      if (dataItem && dataItem.faculty_qualification_improvement_id) {
        console.log("✅ Criterion8_3Form - Found existing data");
        
        if (dataItem.other_staff_name) {
          setContributorName(dataItem.other_staff_name);
        } else if (dataItem.firstname) {
          const name = `${dataItem.firstname || ''} ${dataItem.middlename || ''} ${dataItem.lastname || ''}`.trim();
          setContributorName(name);
        }

        // Set the ID from response
        setFacultyQualificationId(dataItem.faculty_qualification_improvement_id);

        if (dataItem.approval_status) {
          setApprovalStatus({
            status: dataItem.approval_status,
            rejectionReason: dataItem.rejection_reason,
            approvalReason: dataItem.approval_status === 'APPROVED' ? dataItem.rejection_reason : null,
            approvedByName: dataItem.approved_by_name,
            submittedTime: dataItem.submitted_time
          });
        }

        // Transform qualification_table data while keeping item column fixed
        const transformTableData = (backendRows) => {
          if (!Array.isArray(backendRows)) {
            return defaultRows.map(row => ({
              ...row,
              caym1: "",
              caym2: "",
              caym3: ""
            }));
          }
          
          return defaultRows.map(defaultRow => {
            const found = backendRows.find(row => {
              const backendItem = row.item || "";
              const defaultItem = defaultRow.item || "";
              return backendItem.toLowerCase().includes(defaultItem.toLowerCase()) ||
                     defaultItem.toLowerCase().includes(backendItem.toLowerCase());
            });
            
            return {
              item: defaultRow.item, // Always keep default item text
              caym1: found?.caym1 || "",
              caym2: found?.caym2 || "",
              caym3: found?.caym3 || ""
            };
          });
        };

        const tableData = {
          "8.3": transformTableData(dataItem.qualification_table || [])
        };

        // Process files
        const filesArray = Array.isArray(dataItem.supporting_documents) 
          ? dataItem.supporting_documents 
          : [];

        const filesByField = {
          "8.3": filesArray.length > 0
            ? filesArray.map((f, i) => ({
                id: f.id || `file-8.3-${i}`,
                filename: f.filename || f.name || f.file_url || "",
                s3Url: f.file_url || f.url || f.s3Url || "",
                url: f.file_url || f.url || f.s3Url || "", // ✅ Ensure 'url' field exists
                description: f.description || "",
                uploading: false
              }))
            : [{ 
                id: `file-8.3-0`, 
                description: "", 
                file: null, 
                filename: "", 
                s3Url: "", 
                url: "", // ✅ Add empty url field
                uploading: false 
              }]
        };

        setInitialData({
          content: { improvement_details: dataItem.improvement_details || "" },
          tableData: tableData,
          filesByField: filesByField
        });

      } else {
        // No existing data, initialize empty
        console.log("📭 Criterion8_3Form - No existing data found, showing blank form");
        setFacultyQualificationId(null);
        setApprovalStatus(null);
        setContributorName("");
        
        setInitialData({
          content: { improvement_details: "" },
          tableData: { "8.3": defaultRows },
          filesByField: {
            "8.3": [{
              id: `file-8.3-0`,
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
      
      setInitialData({ 
        content: { improvement_details: "" }, 
        tableData: { "8.3": defaultRows }, 
        filesByField: {
          "8.3": [{ 
            id: `file-8.3-0`, 
            description: "", 
            file: null, 
            filename: "", 
            s3Url: "", 
            url: "", // ✅ Add empty url field
            uploading: false 
          }]
        }
      });
      setFacultyQualificationId(null);
      setApprovalStatus(null);
      setContributorName("");
      
    } finally {
      setLoading(false);
    }
  }, [nba_accredited_program_id, nba_criteria_sub_level2_id, nba_contributor_allocation_id, otherStaffId, propFacultyQualificationId, editMode]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ---------------- SAVE DATA ----------------
  const handleSave = async (formData) => {
    console.log("Save data received:", formData);
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
      const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
      const userInfo2 = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const staffId = otherStaffId || userInfo?.rawData?.other_staff_id || userInfo2?.other_staff_id;

      if (!staffId) {
        throw new Error("Staff ID not found");
      }

      if (!nba_criteria_sub_level2_id) {
        throw new Error("Cycle sub-category ID is required");
      }

      // ✅ Ensure files have proper structure
      const filesWithCategory = Object.keys(formData.filesByField || {}).flatMap(
        (field) =>
          (formData.filesByField[field] || []).map((file) => ({
            ...file,
            // ✅ Ensure url property exists for GenericCriteriaForm
            url: file.url || file.s3Url || "",
            file_url: file.url || file.s3Url || "",
          }))
      );

      // Transform table data for backend
      const transformTableForBackend = (tableRows) => {
        if (!Array.isArray(tableRows)) {
          return defaultRows.map(row => ({
            item: row.item,
            caym1: "",
            caym2: "",
            caym3: ""
          }));
        }
        
        return tableRows.map((row, index) => {
          const defaultRow = defaultRows[index] || { item: "" };
          return {
            item: defaultRow.item, // Always use the fixed item text
            caym1: row.caym1 || "",
            caym2: row.caym2 || "",
            caym3: row.caym3 || ""
          };
        });
      };

      const payload = {
        other_staff_id: parseInt(staffId),
        cycle_sub_category_id: parseInt(nba_criteria_sub_level2_id),
        improvement_details: formData.content?.improvement_details || "",
        qualification_table: transformTableForBackend(formData.tableData?.["8.3"] || defaultRows),
        supporting_documents: filesWithCategory
          .filter((f) => f.url || f.s3Url || f.file)
          .map((f) => ({
            description: f.description || "",
            filename: f.filename || f.name || f.file?.name || "",
            file_url: f.url || f.s3Url || "",
            url: f.url || f.s3Url || "", // Keep both formats for compatibility
            id: f.id,
          })),
      };

      console.log("🟠 Criterion8_3Form - Save payload:", payload);

      let response;
      const hasExistingEntry = facultyQualificationId || propFacultyQualificationId;

      if (hasExistingEntry) {
        // Update existing record
        const idToUse = facultyQualificationId || propFacultyQualificationId;
        console.log("🔄 Criterion8_3Form - Updating existing entry with ID:", idToUse);
        response = await newnbaCriteria8Service.updateData8_3(idToUse, payload);
      } else {
        // Create new record
        console.log("🆕 Criterion8_3Form - Creating new entry");
        response = await newnbaCriteria8Service.saveCriteria8_3_Data(payload);
      }

      console.log("Save response:", response);

      // ✅ IMMEDIATELY UPDATE LOCAL STATE with the saved data
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
            s3Url: savedFile?.url || savedFile?.file_url || file.s3Url || file.url || "",
            url: savedFile?.url || savedFile?.file_url || file.s3Url || file.url || "",
            filename: savedFile?.filename || file.filename || file.file?.name || "",
            uploading: false
          };
        });
      });

      // Update initialData state immediately
      setInitialData(prev => ({
        ...prev,
        content: formData.content,
        tableData: formData.tableData,
        filesByField: updatedFilesByField
      }));

      // If this is a new entry, set the ID from response
      if (response?.faculty_qualification_improvement_id && !facultyQualificationId) {
        setFacultyQualificationId(response.faculty_qualification_improvement_id);
      }

      setAlert(
        <SweetAlert
          success
          title="Saved!"
          confirmBtnText="OK"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => setAlert(null)}
        >
          Criterion 8.3 saved successfully
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
    if (!facultyQualificationId) {
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
            await newnbaCriteria8Service.deleteData8_3(facultyQualificationId);
            setAlert(
              <SweetAlert
                success
                title="Deleted!"
                confirmBtnCssClass="btn-confirm"
                confirmBtnText="OK"
                onConfirm={() => setAlert(null)}
              >
                Faculty Qualification record deleted successfully
              </SweetAlert>
            );
            await loadData();
            setFacultyQualificationId(null);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-2xl text-indigo-600 font-medium">
        Loading {config.title}...
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
        onDelete={facultyQualificationId ? handleDelete : null}
        isCompleted={completed}
        isContributorEditable={isContributorEditable}
        saving={saving}
        hasExistingData={!!facultyQualificationId}
        showFileCategories={true}
        deleteButtonText={facultyQualificationId ? "Delete Record" : null}
        saveButtonText={facultyQualificationId ? "Update Record" : "Save Record"}
      />

      {alert}
    </div>
  );
};

export default Criterion8_3Form;