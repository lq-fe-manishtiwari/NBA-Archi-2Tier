import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
// import Swal from "sweetalert2";
import GenericCriteriaForm from "../GenericCriteriaForm";
import StatusBadge from "../StatusBadge";
import { newnbaCriteria8Service } from "../../Services/NewNBA-Criteria8.service";

const Criterion8_1Form = ({
  nba_accredited_program_id,
  academic_year,
  nba_criteria_sub_level2_id,
  contributor_allocation_id: nba_contributor_allocation_id,
  completed = false,
  isContributorEditable = true,
  otherStaffId = null,
  editMode = false,
  coPoPsoActionsId = null,
  onSuccess = () => {},
  readOnly = false,
  cardData = null
}) => {
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState(null);
  const [currentCoPoPsoActionsId, setCurrentCoPoPsoActionsId] = useState(coPoPsoActionsId);
  const [userRole, setUserRole] = useState({});

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    setUserRole(userInfo);
  }, []);

  const emptyTableData = {
    "8.1": [],
    "8.1.2": [],
  };

  const sectionConfig = {
    title: "8.1. Actions Based on Evaluation of COs/POs/PSOs Attainment",
    totalMarks: 40,
    fields: [
      {
        name: "8.1",
        label: "8.1.1 Actions Taken Based on the Results of Evaluation of the COs Attainment",
        marks: 20,
        type: "textarea",
        rows: 8,
        placeholder: "Describe the actions taken based on COs attainment results..."
      },
      {
        name: "8.1.2",
        label: "8.1.2. Actions Taken Based on the Results of Evaluation of the POs/PSOs Attainment",
        marks: 20,
        type: "textarea",
        rows: 8,
        placeholder: "Describe the actions taken based on POs/PSOs attainment results..."
      },
    ],
  };


  useEffect(() => {
    console.log("🎯 Criterion8_1Form - Loading data...");
    console.log("📦 Direct cardData received:", cardData);
    console.log("🔍 Other props:", {
      otherStaffId,
      coPoPsoActionsId,
      nba_criteria_sub_level2_id,
      readOnly
    });

    const loadData = async () => {
      try {
        setLoading(true);
        if (cardData && cardData.co_po_pso_actions_id) {
          console.log("✅ Using direct cardData from card click");
          processCardData(cardData);
          return;
        }

        if (nba_criteria_sub_level2_id && otherStaffId) {
          console.log(`📡 Fetching via getCriteria8_1_Data: cycle=${nba_criteria_sub_level2_id}, staff=${otherStaffId}`);
          const response = await newnbaCriteria8Service.getCriteria8_1_Data(
            nba_criteria_sub_level2_id,
            otherStaffId
          );
          
          console.log("📊 API Response:", response);
          
          let dataItem;
          if (Array.isArray(response)) {
            dataItem = response.length > 0 ? response[0] : null;
          } else {
            dataItem = response;
          }
          
          if (dataItem && dataItem.co_po_pso_actions_id) {
            processCardData(dataItem);
          } else {
            loadEmptyForm();
          }
        } else {
          loadEmptyForm();
        }
      } catch (err) {
        console.error("❌ Failed to load data:", err);
        toast.error("Failed to load data");
        loadEmptyForm();
      } finally {
        setLoading(false);
      }
    };

    const processCardData = (data) => {
      console.log("🔄 Processing data for form:", data);
      
      const filesByField = {};
      
      // Initialize all fields
      Object.keys(emptyTableData).forEach(fieldName => {
        filesByField[fieldName] = [];
      });
      
      // ✅ Process CO supporting documents
      if (data.co_supporting_documents && Array.isArray(data.co_supporting_documents)) {
        data.co_supporting_documents.forEach((file, i) => {
          filesByField["8.1"].push({
            id: file.id || `file-co-${i}`,
            filename: file.filename || file.file_name || "",
            url: file.file_url || "",
            description: file.description || "",
            s3Url: file.file_url || "",
            category: "CO Supporting Documents"
          });
        });
      }
      
      // ✅ Process PO/PSO supporting documents
      if (data.po_pso_supporting_documents && Array.isArray(data.po_pso_supporting_documents)) {
        data.po_pso_supporting_documents.forEach((file, i) => {
          filesByField["8.1.2"].push({
            id: file.id || `file-po-pso-${i}`,
            filename: file.filename || file.file_name || "",
            url: file.file_url || "",
            description: file.description || "",
            s3Url: file.file_url || "",
            category: "PO/PSO Supporting Documents"
          });
        });
      }
      
      // Ensure each field has at least one empty slot
      Object.keys(filesByField).forEach(fieldName => {
        if (filesByField[fieldName].length === 0) {
          filesByField[fieldName].push({
            id: `file-${Date.now()}-${fieldName}-0`,
            description: "",
            file: null,
            filename: "",
            s3Url: "",
            uploading: false,
            category: fieldName === "8.1" ? "CO Supporting Documents" : "PO/PSO Supporting Documents"
          });
        }
      });

      // ✅ Set the form data
      setInitialData({
        content: {
          "8.1": data.co_actions_details || "",
          "8.1.2": data.po_pso_actions_details || ""
        },
        tableData: emptyTableData,
        filesByField: filesByField
      });

      setCurrentCoPoPsoActionsId(data.co_po_pso_actions_id);

      if (data.approval_status) {
        setApprovalStatus({
          status: data.approval_status,
          rejectionReason: data.rejection_reason,
          approvalReason: data.approval_status === 'APPROVED' ? data.rejection_reason : null,
          approvedByName: data.approved_by_name
        });
      }
      
      console.log("✅ Form data loaded successfully!");
      console.log("📝 Content to display:", {
        co_actions: data.co_actions_details?.substring(0, 50) + "...",
        po_pso_actions: data.po_pso_actions_details?.substring(0, 50) + "..."
      });
    };

    const loadEmptyForm = () => {
      console.log("ℹ️ Loading empty form");
      const emptyFilesByField = {};
      Object.keys(emptyTableData).forEach(fieldName => {
        emptyFilesByField[fieldName] = [{
          id: `file-${Date.now()}-${fieldName}-0`,
          description: "",
          file: null,
          filename: "",
          s3Url: "",
          uploading: false,
          category: fieldName === "8.1" ? "CO Supporting Documents" : "PO/PSO Supporting Documents"
        }];
      });
      
      setInitialData({ 
        content: {
          "8.1": "",
          "8.1.2": ""
        }, 
        tableData: emptyTableData, 
        filesByField: emptyFilesByField 
      });
    };

    loadData();
  }, [nba_criteria_sub_level2_id, otherStaffId, coPoPsoActionsId]); // ✅ Only relevant dependencies

  const handleSave = async (data) => {
    if (readOnly || (!isContributorEditable && userRole.nba_contributor === true)) {
      toast.error("You don't have permission to edit");
      return;
    }

    setSaveLoading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
      const userInfo2 = JSON.parse(localStorage.getItem("userInfo") || "{}");
      
      // ✅ Use otherStaffId from props (from card click) or current user
      const staffIdToUse = otherStaffId || userInfo?.rawData?.other_staff_id || userInfo.user_id || userInfo2?.other_staff_id;

      if (!staffIdToUse) {
        throw new Error("Staff ID not found");
      }

      // Extract files for each field
      const extractFiles = (fieldKey) => {
        const files = data.filesByField?.[fieldKey] || [];
        return files
          .map(file => ({
            description: file.description || "",
            filename: file.filename || "",
            file_url: file.s3Url || file.url || "",
          }))
          .filter(file => file.file_url);
      };

      // Get new files that need to be uploaded
      const getNewFiles = (fieldKey) => {
        const files = data.filesByField?.[fieldKey] || [];
        return files.filter(file => file.file && !file.s3Url);
      };

      // Separate CO and PO/PSO documents
      const coDocuments = extractFiles("8.1");
      const poPsoDocuments = extractFiles("8.1.2");

      const newCOFiles = getNewFiles("8.1");
      const newPOPsoFiles = getNewFiles("8.1.2");

      const payload = {
        other_staff_id: staffIdToUse,
        cycle_sub_category_id: nba_criteria_sub_level2_id,
        co_actions_details: data.content?.["8.1"] || "",
        po_pso_actions_details: data.content?.["8.1.2"] || "",
        co_supporting_documents: coDocuments,
        po_pso_supporting_documents: poPsoDocuments
      };

      console.log("📤 Saving payload:", payload);

      let saveResponse;
      const hasExistingEntry = currentCoPoPsoActionsId || coPoPsoActionsId;

      if (hasExistingEntry) {
        const idToUse = currentCoPoPsoActionsId || coPoPsoActionsId;
        saveResponse = await newnbaCriteria8Service.updateData8_1(idToUse, payload);
        toast.success("Data updated successfully!");
      } else {
        saveResponse = await newnbaCriteria8Service.saveCriteria8_1_Data(payload);
        toast.success("Data saved successfully!");
      }

      // Handle new file uploads if needed
      if ((newCOFiles.length > 0 || newPOPsoFiles.length > 0) && saveResponse?.co_po_pso_actions_id) {
        console.log("📎 New files need to be uploaded");
        toast.info("Please upload supporting documents if not already uploaded");
      }

      // Call success callback
      onSuccess();
      
      // Refresh data
      const refreshed = await newnbaCriteria8Service.getCriteria8_1_Data(
        nba_criteria_sub_level2_id, 
        staffIdToUse
      );
      
      let refreshedItem;
      if (Array.isArray(refreshed)) {
        refreshedItem = refreshed.length > 0 ? refreshed[0] : null;
      } else {
        refreshedItem = refreshed;
      }

      if (refreshedItem) {
        // Update filesByField with refreshed data
        const refreshedFilesByField = {};
        Object.keys(emptyTableData).forEach(fieldName => {
          refreshedFilesByField[fieldName] = [];
        });

        // Process refreshed CO documents
        if (refreshedItem.co_supporting_documents && Array.isArray(refreshedItem.co_supporting_documents)) {
          refreshedItem.co_supporting_documents.forEach((file, i) => {
            refreshedFilesByField["8.1"].push({
              id: file.id || `file-co-${i}`,
              filename: file.filename || file.file_name || "",
              url: file.file_url || "",
              description: file.description || "",
              s3Url: file.file_url || "",
              category: "CO Supporting Documents"
            });
          });
        }
        
        // Process refreshed PO/PSO documents
        if (refreshedItem.po_pso_supporting_documents && Array.isArray(refreshedItem.po_pso_supporting_documents)) {
          refreshedItem.po_pso_supporting_documents.forEach((file, i) => {
            refreshedFilesByField["8.1.2"].push({
              id: file.id || `file-po-pso-${i}`,
              filename: file.filename || file.file_name || "",
              url: file.file_url || "",
              description: file.description || "",
              s3Url: file.file_url || "",
              category: "PO/PSO Supporting Documents"
            });
          });
        }

        // Ensure each field has at least one empty slot
        Object.keys(refreshedFilesByField).forEach(fieldName => {
          if (refreshedFilesByField[fieldName].length === 0) {
            refreshedFilesByField[fieldName].push({
              id: `file-${Date.now()}-${fieldName}-0`,
              description: "",
              file: null,
              filename: "",
              s3Url: "",
              uploading: false,
              category: fieldName === "8.1" ? "CO Supporting Documents" : "PO/PSO Supporting Documents"
            });
          }
        });

        setInitialData({
          content: {
            "8.1": refreshedItem.co_actions_details || "",
            "8.1.2": refreshedItem.po_pso_actions_details || ""
          },
          tableData: emptyTableData,
          filesByField: refreshedFilesByField
        });

        if (refreshedItem.co_po_pso_actions_id) {
          setCurrentCoPoPsoActionsId(refreshedItem.co_po_pso_actions_id);
        }

        if (refreshedItem.approval_status) {
          setApprovalStatus({
            status: refreshedItem.approval_status,
            rejectionReason: refreshedItem.rejection_reason,
            approvalReason: refreshedItem.approval_status === 'APPROVED' ? refreshedItem.rejection_reason : null,
            approvedByName: refreshedItem.approved_by_name
          });
        }
      }
    } catch (err) {
      console.error("❌ Save error:", err);
      toast.error(err.message || "Failed to save");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentCoPoPsoActionsId) {
      toast.error("No entry to delete");
      return;
    }

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    });

    if (result.isConfirmed) {
      try {
        await newnbaCriteria8Service.deleteData8_1(currentCoPoPsoActionsId);
        toast.success("Entry deleted successfully!");
        
        // Reset to initial state
        const emptyFilesByField = {};
        Object.keys(emptyTableData).forEach(fieldName => {
          emptyFilesByField[fieldName] = [{
            id: `file-${Date.now()}-${fieldName}-0`,
            description: "",
            file: null,
            filename: "",
            s3Url: "",
            uploading: false,
            category: fieldName === "8.1" ? "CO Supporting Documents" : "PO/PSO Supporting Documents"
          }];
        });
        
        setInitialData({ 
          content: {
            "8.1": "",
            "8.1.2": ""
          }, 
          tableData: emptyTableData, 
          filesByField: emptyFilesByField 
        });
        setCurrentCoPoPsoActionsId(null);
        setApprovalStatus(null);
        
        onSuccess();
      } catch (error) {
        toast.error(error.message || "Failed to delete entry");
      }
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-32 text-2xl text-indigo-600 font-medium">Loading {sectionConfig.title}...</div>;
  }

  if (!initialData) {
    return <div className="flex items-center justify-center py-32 text-2xl text-red-600 font-medium">Failed to load form data</div>;
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

      <GenericCriteriaForm 
        title={sectionConfig.title}
        marks={sectionConfig.totalMarks}
        fields={sectionConfig.fields || []}
        initialData={initialData}
        onSave={handleSave}
        onDelete={currentCoPoPsoActionsId && !readOnly ? handleDelete : null}
        isCompleted={completed}
        isContributorEditable={isContributorEditable && !readOnly}
        saving={saveLoading}
        hasExistingData={!!currentCoPoPsoActionsId}
        readOnly={readOnly}
      />
    </div>
  );
};

export default Criterion8_1Form;