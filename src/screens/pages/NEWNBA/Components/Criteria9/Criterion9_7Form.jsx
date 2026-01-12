import React, { useState, useEffect, useCallback } from "react";
import GenericCriteriaForm from "../GenericCriteriaForm";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import StatusBadge from "../StatusBadge";
import SweetAlert from "react-bootstrap-sweetalert";

// Import the new service
import { newnbaCriteria9Service } from "../../Services/NewNBA-Criteria9.service";
import { getAllProfileFlags } from "@/_services/adminProfileUtils";

const Criterion9_7Form = ({
  nba_accredited_program_id,
  nba_criteria_sub_level2_id,
  nba_contributor_allocation_id,
  isContributorEditable = true,
  completed = false,
  onSaveSuccess,
  otherStaffId = null,
  editMode = false,
  institute_budget_id: propBudgetAllocationId = null,
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [budgetAllocationId, setBudgetAllocationId] = useState(null);
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
    title: "9.7. Budget Allocation, Utilization, and Public Accounting at Institute Level",
    totalMarks: 12,
    fields: [
      {
        name: "table1",
        label: "Table No. 9.7.1: Summary of budget and actual expenditure incurred at Institute level for CFY m1",
        marks: 6,
        hasTable: true,
        tableConfig: {
          columns: [
            { field: "fee", header: "Fee", width: "w-16" },
            { field: "govt", header: "Govt.", width: "w-16" },
            { field: "grants", header: "Grant(s)", width: "w-16" },
            { field: "other_sources", header: "Other Sources", width: "w-16" },
            { field: "actual_expenditure", header: "Actual expenditure in the CFYm1", width: "w-32" },
            { field: "total_students", header: "Total Students in the institute", width: "w-32" },
            { field: "expenditure_per_student", header: "Expenditure per student in CFYm1", width: "w-32" }
          ]
        },
        defaultData: [
          { id: 'row-1', fee: "", govt: "", grants: "", other_sources: "", actual_expenditure: "", total_students: "", expenditure_per_student: "" }
        ]
      },
      {
        name: "table2",
        label: "Table No. 9.7.2: Budget and actual expenditure incurred at Institute level",
        marks: 6,
        hasTable: true,
        tableConfig: {
          columns: [
            { field: "items", header: "Items", width: "w-32" },
            { field: "budget_cfy", header: "Budget ed in CFY", width: "w-24" },
            { field: "actual_expenses_cfy", header: "Actual expenses in CFY (till ...)", width: "w-24" },
            { field: "budget_cfym1", header: "Budget ed in CFYm1", width: "w-24" },
            { field: "actual_expenses_cfym1", header: "Actual Expenses in CFYm1", width: "w-24" },
            { field: "budget_cfym2", header: "Budget ed in CFYm2", width: "w-24" },
            { field: "actual_expenses_cfym2", header: "Actual Expenses in CFYm2", width: "w-24" },
            { field: "budget_cfym3", header: "Budget ed in CFYm3", width: "w-24" },
            { field: "actual_expenses_cfym3", header: "Actual Expenses in CFYm3", width: "w-24" }
          ],
          readOnlyRows: [10] // Make row 10 (Total amount) read-only
        },
        defaultData: [
          { id: 'row-1', items: "Infrastructure Built-Up", budget_cfy: "", actual_expenses_cfy: "", budget_cfym1: "", actual_expenses_cfym1: "", budget_cfym2: "", actual_expenses_cfym2: "", budget_cfym3: "", actual_expenses_cfym3: "" },
          { id: 'row-2', items: "Library", budget_cfy: "", actual_expenses_cfy: "", budget_cfym1: "", actual_expenses_cfym1: "", budget_cfym2: "", actual_expenses_cfym2: "", budget_cfym3: "", actual_expenses_cfym3: "" },
          { id: 'row-3', items: "Laboratory equipment", budget_cfy: "", actual_expenses_cfy: "", budget_cfym1: "", actual_expenses_cfym1: "", budget_cfym2: "", actual_expenses_cfym2: "", budget_cfym3: "", actual_expenses_cfym3: "" },
          { id: 'row-4', items: "Teaching and non-teaching staff salary", budget_cfy: "", actual_expenses_cfy: "", budget_cfym1: "", actual_expenses_cfym1: "", budget_cfym2: "", actual_expenses_cfym2: "", budget_cfym3: "", actual_expenses_cfym3: "" },
          { id: 'row-5', items: "Outreach Programs", budget_cfy: "", actual_expenses_cfy: "", budget_cfym1: "", actual_expenses_cfym1: "", budget_cfym2: "", actual_expenses_cfym2: "", budget_cfym3: "", actual_expenses_cfym3: "" },
          { id: 'row-6', items: "R&D", budget_cfy: "", actual_expenses_cfy: "", budget_cfym1: "", actual_expenses_cfym1: "", budget_cfym2: "", actual_expenses_cfym2: "", budget_cfym3: "", actual_expenses_cfym3: "" },
          { id: 'row-7', items: "Training, Placement and Industry linkage", budget_cfy: "", actual_expenses_cfy: "", budget_cfym1: "", actual_expenses_cfym1: "", budget_cfym2: "", actual_expenses_cfym2: "", budget_cfym3: "", actual_expenses_cfym3: "" },
          { id: 'row-8', items: "SDGs", budget_cfy: "", actual_expenses_cfy: "", budget_cfym1: "", actual_expenses_cfym1: "", budget_cfym2: "", actual_expenses_cfym2: "", budget_cfym3: "", actual_expenses_cfym3: "" },
          { id: 'row-9', items: "Entrepreneurship", budget_cfy: "", actual_expenses_cfy: "", budget_cfym1: "", actual_expenses_cfym1: "", budget_cfym2: "", actual_expenses_cfym2: "", budget_cfym3: "", actual_expenses_cfym3: "" },
          { id: 'row-10', items: "Others*, pl. specify", budget_cfy: "", actual_expenses_cfy: "", budget_cfym1: "", actual_expenses_cfym1: "", budget_cfym2: "", actual_expenses_cfym2: "", budget_cfym3: "", actual_expenses_cfym3: "" },
          { id: 'row-11', items: "Total amount", budget_cfy: "", actual_expenses_cfy: "", budget_cfym1: "", actual_expenses_cfym1: "", budget_cfym2: "", actual_expenses_cfym2: "", budget_cfym3: "", actual_expenses_cfym3: "" }
        ]
      }
    ]
  };

  // ---------------- AUTO-CALCULATION FUNCTION ----------------
  const calculateTotals = (tableData) => {
    if (!Array.isArray(tableData) || tableData.length < 11) return tableData;
    
    const calculationFields = ["budget_cfy", "actual_expenses_cfy", "budget_cfym1", "actual_expenses_cfym1", "budget_cfym2", "actual_expenses_cfym2", "budget_cfym3", "actual_expenses_cfym3"];
    const totals = {};
    
    // Initialize totals
    calculationFields.forEach(field => {
      totals[field] = 0;
    });
    
    // Calculate totals from rows 0-9 (first 10 rows)
    for (let i = 0; i < 10; i++) {
      if (tableData[i]) {
        calculationFields.forEach(field => {
          const value = parseFloat(tableData[i][field]) || 0;
          totals[field] += value;
        });
      }
    }
    
    // Update the data array with calculated totals
    const updatedData = [...tableData];
    if (updatedData[10]) {
      updatedData[10] = {
        ...updatedData[10],
        items: 'Total amount',
        ...totals
      };
    }
    
    return updatedData;
  };

  // ---------------- LOAD DATA ----------------
  const loadData = useCallback(async () => {
    if (!nba_criteria_sub_level2_id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      console.log("🎯 Criterion9_7Form - Loading data with:");
      console.log("  - otherStaffId prop:", otherStaffId);
      console.log("  - nba_contributor_allocation_id:", nba_contributor_allocation_id);
      console.log("  - nba_criteria_sub_level2_id:", nba_criteria_sub_level2_id);
      console.log("  - propBudgetAllocationId:", propBudgetAllocationId);
      console.log("  - editMode:", editMode);

      // Determine which staff ID to use - otherStaffId has priority
      const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
      const userInfo2 = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const staffIdToUse = otherStaffId  || userInfo?.rawData?.other_staff_id || userInfo.user_id || userInfo2?.other_staff_id;
      
      console.log("🎯 Criterion9_7Form - Final staffId:", staffIdToUse);

      if (!staffIdToUse) {
        console.log("❌ Criterion9_7Form - No staffId found, using empty data");
        setInitialData({
          content: {},
          tableData: {
            table1: config.fields[0].defaultData,
            table2: calculateTotals(config.fields[1].defaultData)
          },
          filesByField: {
            "table1": [{
              id: `file-table1-0`,
              description: "",
              file: null,
              filename: "",
              s3Url: "",
              url: "",
              uploading: false
            }],
            "table2": [{
              id: `file-table2-0`,
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

      console.log("📡 Criterion9_7Form - Making API call with:");
      console.log("  - cycleSubCategoryId:", nba_criteria_sub_level2_id);
      console.log("  - staffId:", staffIdToUse);

      // Use the new service API call
      const response = await newnbaCriteria9Service.getCriteria9Data(
        '9.7', // section
        nba_criteria_sub_level2_id, // cycleSubCategoryId
        staffIdToUse // otherStaffId
      );

      console.log("📊 Criterion9_7Form - Raw API Response:", response);

      // Handle array response like other forms
      let dataItem = null;
      if (Array.isArray(response)) {
        if (response.length > 0) {
          dataItem = response[0];
          console.log("📦 Criterion9_7Form - Extracted first item from array:", dataItem);
        } else {
          console.log("📭 Criterion9_7Form - Empty array response, no data found");
        }
      } else {
        dataItem = response;
      }

      console.log("📊 Final dataItem:", dataItem);

      if (dataItem && dataItem.institute_budget_id) {
        console.log("✅ Criterion9_7Form - Found existing data");
        
        // Set contributor name for display
        if (dataItem.other_staff_name) {
          setContributorName(dataItem.other_staff_name);
        } else if (dataItem.firstname) {
          const name = `${dataItem.firstname || ''} ${dataItem.middlename || ''} ${dataItem.lastname || ''}`.trim();
          setContributorName(name);
        }

        // Set ID
        setBudgetAllocationId(dataItem.institute_budget_id);

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
        const filesArray = Array.isArray(dataItem.budget_documents) 
          ? dataItem.budget_documents 
          : [];

        const filesByField = {
          "table1": filesArray.filter(f => f.category === "Table 1" || !f.category).length > 0
            ? filesArray.filter(f => f.category === "Table 1" || !f.category).map((f, i) => ({
                id: f.id || `file-table1-${i}`,
                filename: f.filename || f.name || "",
                s3Url: f.url || f.filePath || "",
                url: f.url || f.filePath || f.s3Url || "",
                description: f.description || "",
                uploading: false
              }))
            : [{
                id: `file-table1-0`,
                description: "",
                file: null,
                filename: "",
                s3Url: "",
                url: "",
                uploading: false
              }],
          "table2": filesArray.filter(f => f.category === "Table 2").length > 0
            ? filesArray.filter(f => f.category === "Table 2").map((f, i) => ({
                id: f.id || `file-table2-${i}`,
                filename: f.filename || f.name || "",
                s3Url: f.url || f.filePath || "",
                url: f.url || f.filePath || f.s3Url || "",
                description: f.description || "",
                uploading: false
              }))
            : [{
                id: `file-table2-0`,
                description: "",
                file: null,
                filename: "",
                s3Url: "",
                url: "",
                uploading: false
              }]
        };

        setInitialData({
          content: {},
          tableData: {
            table1: Array.isArray(dataItem.budget_utilization_table) && dataItem.budget_utilization_table.length > 0
              ? dataItem.budget_utilization_table
              : config.fields[0].defaultData,
            table2: Array.isArray(dataItem.budget_summary_table) && dataItem.budget_summary_table.length > 0
              ? calculateTotals(dataItem.budget_summary_table)
              : calculateTotals(config.fields[1].defaultData)
          },
          filesByField: filesByField
        });

      } else {
        // No existing data, initialize empty
        console.log("📭 Criterion9_7Form - No existing data found, showing blank form");
        setBudgetAllocationId(null);
        setApprovalStatus(null);
        setContributorName("");
        
        setInitialData({
          content: {},
          tableData: {
            table1: config.fields[0].defaultData,
            table2: calculateTotals(config.fields[1].defaultData)
          },
          filesByField: {
            "table1": [{
              id: `file-table1-0`,
              description: "",
              file: null,
              filename: "",
              s3Url: "",
              url: "",
              uploading: false
            }],
            "table2": [{
              id: `file-table2-0`,
              description: "",
              file: null,
              filename: "",
              s3Url: "",
              url: "",
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
        content: {},
        tableData: {
          table1: config.fields[0].defaultData,
          table2: calculateTotals(config.fields[1].defaultData)
        },
        filesByField: {
          "table1": [{
            id: `file-table1-0`,
            description: "",
            file: null,
            filename: "",
            s3Url: "",
            url: "",
            uploading: false
          }],
          "table2": [{
            id: `file-table2-0`,
            description: "",
            file: null,
            filename: "",
            s3Url: "",
            url: "",
            uploading: false
          }]
        }
      });
      setBudgetAllocationId(null);
      setApprovalStatus(null);
      setContributorName("");
      
    } finally {
      setLoading(false);
    }
  }, [nba_accredited_program_id, nba_criteria_sub_level2_id, nba_contributor_allocation_id, otherStaffId, propBudgetAllocationId, editMode]);

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

      // ✅ FIX: Ensure files have both s3Url and url properties with categories
      const filesWithCategory = Object.keys(formData.filesByField || {}).flatMap(
        (field) =>
          (formData.filesByField[field] || []).map((file) => ({
            ...file,
            category: field === "table1" ? "Table 1" : "Table 2",
            // ✅ Ensure url property exists for GenericCriteriaForm
            url: file.url || file.s3Url || "",
          }))
      );

      // Apply calculations to table2 before saving
      const table2Data = formData.tableData?.table2 || config.fields[1].defaultData;
      const calculatedTable2 = calculateTotals(table2Data);

      // Prepare payload
      const payload = {
        other_staff_id: parseInt(staffId),
        cycle_sub_category_id: parseInt(nba_criteria_sub_level2_id),
        budget_utilization_table: formData.tableData?.table1 || config.fields[0].defaultData,
        budget_summary_table: calculatedTable2,
        budget_documents: filesWithCategory
          .filter((f) => f.url || f.s3Url || f.file)
          .map((f) => ({
            description: f.description || "",
            filename: f.filename || f.name || f.file?.name || "",
            url: f.url || f.s3Url || "",
            category: f.category || "",
            id: f.id,
          })),
      };

      console.log("🟠 Criterion9_7Form - Save payload:", payload);

      let response;
      const hasExistingEntry = budgetAllocationId || propBudgetAllocationId;

      if (hasExistingEntry) {
        // Update existing record
        const idToUse = budgetAllocationId || propBudgetAllocationId;
        console.log("🔄 Criterion9_7Form - Updating existing entry with ID:", idToUse);
        response = await newnbaCriteria9Service.updateCriteria9('9.7', idToUse, payload);
      } else {
        // Create new record
        console.log("🆕 Criterion9_7Form - Creating new entry");
        response = await newnbaCriteria9Service.saveCriteria9Data('9.7', payload);
      }

      console.log("Save response:", response);

      // ✅ IMMEDIATELY UPDATE LOCAL STATE with the saved data
      const updatedFilesByField = {};
      
      Object.keys(formData.filesByField || {}).forEach(field => {
        const files = formData.filesByField[field] || [];
        updatedFilesByField[field] = files.map(file => {
          // Find matching file in payload
          const savedFile = payload.budget_documents?.find(
            f => f.id === file.id || f.filename === (file.filename || file.file?.name)
          );
          
          return {
            ...file,
            s3Url: savedFile?.url || file.s3Url || file.url || "",
            url: savedFile?.url || file.s3Url || file.url || "",
            filename: savedFile?.filename || file.filename || file.file?.name || "",
            uploading: false
          };
        });
      });

      // Update initialData state immediately
      setInitialData(prev => ({
        ...prev,
        tableData: formData.tableData,
        filesByField: updatedFilesByField
      }));

      // If this is a new entry, set the ID from response
      if (response?.institute_budget_id && !budgetAllocationId) {
        setBudgetAllocationId(response.institute_budget_id);
      }

      setAlert(
        <SweetAlert
          success
          title="Saved!"
          confirmBtnText="OK"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => setAlert(null)}
        >
          Criterion 9.7 saved successfully
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
    if (!budgetAllocationId) {
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
            await newnbaCriteria9Service.deleteCriteria9('9.7', budgetAllocationId);
            setAlert(
              <SweetAlert
                success
                title="Deleted!"
                confirmBtnCssClass="btn-confirm"
                confirmBtnText="OK"
                onConfirm={() => setAlert(null)}
              >
                Budget Allocation record deleted successfully
              </SweetAlert>
            );
            await loadData();
            setBudgetAllocationId(null);
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
      {/* Contributor Name Display */}
  

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
        onDelete={budgetAllocationId ? handleDelete : null}
        isCompleted={completed}
        isContributorEditable={isContributorEditable}
        saving={saving}
        hasExistingData={!!budgetAllocationId}
        showFileCategories={true}
        onTableDataChange={(fieldName, newData) => {
          // Apply real-time calculations for table2
          if (fieldName === 'table2') {
            return calculateTotals(newData);
          }
          return newData;
        }}
      />

      {alert}
    </div>
  );
};

export default Criterion9_7Form;