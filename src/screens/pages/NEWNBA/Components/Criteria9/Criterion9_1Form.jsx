import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import StatusBadge from "../StatusBadge";
import SweetAlert from "react-bootstrap-sweetalert";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { GripVertical, Trash2, Plus, FileText, Save, Edit, X, Upload, CheckCircle } from "lucide-react";
import Modal from "react-modal";
import MergePdfModal from "../../Components/MergePdfModal";
import { nbaDashboardService } from "../../Services/NBA-dashboard.service";

// Import the new service
import { newnbaCriteria9Service } from "../../Services/NewNBA-Criteria9.service";
import { getAllProfileFlags } from "@/_services/adminProfileUtils";

Modal.setAppElement("#root");

const Criterion9_1Form = ({
  nba_accredited_program_id,
  nba_criteria_sub_level2_id,
  nba_contributor_allocation_id,
  isContributorEditable = true,
  completed = false,
  onSaveSuccess,
  otherStaffId = null,
  editMode = false,
  fysfr_id: propFysfrId = null,
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fysfrId, setFysfrId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(!completed);
  const [fysfr_calculation_table, setTableData] = useState([]);
  const [filesByField, setFilesByField] = useState({
    fysfr_documents: [
      { id: `file-${Date.now()}-fysfr-0`, description: "", file: null, filename: "", s3Url: "", url: "", uploading: false }
    ]
  });
  const [previewModal, setPreviewModal] = useState({ isOpen: false, file: null });
  const [mergeModal, setMergeModal] = useState({ isOpen: false, fieldName: null });
  const [approvalStatus, setApprovalStatus] = useState(null);
  const [userRole, setUserRole] = useState({});
  const [contributorName, setContributorName] = useState("");
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    setUserRole(userInfo);
  }, []);

  const defaultTableData = [
    { id: 'row-1', year: "", sanctioned_intake: "", required_faculty: "", faculty_basic_science: "", faculty_engineering: "", percentage: "" },
    { id: 'row-2', year: "", sanctioned_intake: "", required_faculty: "", faculty_basic_science: "", faculty_engineering: "", percentage: "" },
    { id: 'row-3', year: "", sanctioned_intake: "", required_faculty: "", faculty_basic_science: "", faculty_engineering: "", percentage: "" }
  ];

  const columns = [
    { field: "year", header: "Year", width: "w-20" },
    { field: "sanctioned_intake", header: "Sanctioned intake of all UG programs (S4)", width: "w-32" },
    { field: "required_faculty", header: "No. of required faculty (RF4= S4/20)", width: "w-32" },
    { field: "faculty_basic_science", header: "No. of faculty members in Basic Science Courses & Humanities and Social Sciences including Management courses (NS1)", width: "w-40" },
    { field: "faculty_engineering", header: "No. of faculty members in Engineering Science Courses (NS2)", width: "w-32" },
    { field: "percentage", header: "Percentage= No. of faculty members ((NS1*0.8) +(NS2*0.2))/(No. of required faculty (RF4)); Percentage=((NS1*0.8)+ (NS2*0.2))/RF4", width: "w-40" }
  ];

  // ---------------- LOAD DATA ----------------
  const loadData = useCallback(async () => {
    if (!nba_criteria_sub_level2_id) {
      setTableData(defaultTableData);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      console.log("🎯 Criterion9_1Form - Loading data with:");
      console.log("  - otherStaffId prop:", otherStaffId);
      console.log("  - nba_contributor_allocation_id:", nba_contributor_allocation_id);
      console.log("  - nba_criteria_sub_level2_id:", nba_criteria_sub_level2_id);
      console.log("  - propFysfrId:", propFysfrId);
      console.log("  - editMode:", editMode);

      // Determine which staff ID to use - otherStaffId has priority
      const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
      const userInfo2 = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const staffIdToUse = otherStaffId  || userInfo?.rawData?.other_staff_id || userInfo.user_id || userInfo2?.other_staff_id;
      
      console.log("🎯 Criterion9_1Form - Final staffId:", staffIdToUse);

      // ✅ Get contributor name if otherStaffId is provided
      if (otherStaffId && otherStaffId !== nba_contributor_allocation_id) {
        try {
          console.log("📡 Fetching contributor details for otherStaffId:", otherStaffId);
          const contributorResponse = await newnbaCriteria9Service.getContributorDetails(otherStaffId);
          console.log("👤 Contributor details:", contributorResponse);
          
          if (contributorResponse) {
            if (contributorResponse.other_staff_name) {
              setContributorName(contributorResponse.other_staff_name);
            } else if (contributorResponse.firstname) {
              const name = `${contributorResponse.firstname || ''} ${contributorResponse.middlename || ''} ${contributorResponse.lastname || ''}`.trim();
              setContributorName(name);
            }
          }
        } catch (contributorErr) {
          console.error("Failed to fetch contributor details:", contributorErr);
          // Don't fail the whole load process if contributor fetch fails
        }
      }

      if (!staffIdToUse) {
        console.log("❌ Criterion9_1Form - No staffId found, using empty data");
        setTableData(defaultTableData);
        setLoading(false);
        return;
      }

      console.log("📡 Criterion9_1Form - Making API call with:");
      console.log("  - cycleSubCategoryId:", nba_criteria_sub_level2_id);
      console.log("  - staffId:", staffIdToUse);

      // Use the new service API call
      const response = await newnbaCriteria9Service.getCriteria9Data(
        '9.1', // section
        nba_criteria_sub_level2_id, // cycleSubCategoryId
        staffIdToUse // otherStaffId
      );

      console.log("📊 Criterion9_1Form - Raw API Response:", response);

      // Handle array response like other forms
      let dataItem = null;
      if (Array.isArray(response)) {
        if (response.length > 0) {
          dataItem = response[0];
          console.log("📦 Criterion9_1Form - Extracted first item from array:", dataItem);
        } else {
          console.log("📭 Criterion9_1Form - Empty array response, no data found");
        }
      } else {
        dataItem = response;
      }

      console.log("📊 Final dataItem:", dataItem);

      if (dataItem && dataItem.fysfr_id) {
        console.log("✅ Criterion9_1Form - Found existing data");
        
        // Set contributor name for display
        if (dataItem.other_staff_name) {
          setContributorName(dataItem.other_staff_name);
        } else if (dataItem.firstname) {
          const name = `${dataItem.firstname || ''} ${dataItem.middlename || ''} ${dataItem.lastname || ''}`.trim();
          setContributorName(name);
        }

        // Set ID
        setFysfrId(dataItem.fysfr_id);

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

        // Set table data and clean percentage values
        const tableData = Array.isArray(dataItem.fysfr_calculation_table) && dataItem.fysfr_calculation_table.length > 0
          ? dataItem.fysfr_calculation_table.map(row => ({
              ...row,
              percentage: cleanPercentageValue(row.percentage)
            }))
          : defaultTableData;
        setTableData(tableData);
        
        // Transform files to filesByField structure
        const filesArray = Array.isArray(dataItem.fysfr_documents) 
          ? dataItem.fysfr_documents 
          : [];

        if (filesArray.length > 0) {
          setFilesByField({
            fysfr_documents: filesArray.map((f, i) => ({
              id: f.id || `file-fysfr-${i}`,
              filename: f.filename || f.name || "",
              s3Url: f.url || f.filePath || "",
              // ✅ IMPORTANT: Add 'url' field for file display
              url: f.url || f.filePath || f.s3Url || "",
              description: f.description || "",
              uploading: false
            }))
          });
        }

      } else {
        // No existing data, initialize empty
        console.log("📭 Criterion9_1Form - No existing data found, showing blank form");
        setFysfrId(null);
        setApprovalStatus(null);
        setContributorName("");
        setTableData(defaultTableData);
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
      setTableData(defaultTableData);
      setFysfrId(null);
      setApprovalStatus(null);
      setContributorName("");
      
    } finally {
      setLoading(false);
    }
  }, [nba_accredited_program_id, nba_criteria_sub_level2_id, nba_contributor_allocation_id, otherStaffId, propFysfrId, editMode]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ---------------- SAVE DATA ----------------
  const handleSave = async () => {
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
      const filesWithCategory = Object.keys(filesByField || {}).flatMap(
        (field) =>
          (filesByField[field] || []).map((file) => ({
            ...file,
            category: "FYSFR Documents",
            // ✅ Ensure url property exists for file display
            url: file.url || file.s3Url || "",
          }))
      );

      // Prepare payload
      const payload = {
        other_staff_id: parseInt(staffId),
        cycle_sub_category_id: parseInt(nba_criteria_sub_level2_id),
        fysfr_calculation_table: fysfr_calculation_table,
        fysfr_documents: filesWithCategory
          .filter((f) => f.url || f.s3Url || f.file)
          .map((f) => ({
            description: f.description || "",
            filename: f.filename || f.name || f.file?.name || "",
            url: f.url || f.s3Url || "",
            category: f.category || "",
            id: f.id,
          })),
      };

      console.log("🟠 Criterion9_1Form - Save payload:", payload);

      let response;
      const hasExistingEntry = fysfrId || propFysfrId;

      if (hasExistingEntry) {
        // Update existing record
        const idToUse = fysfrId || propFysfrId;
        console.log("🔄 Criterion9_1Form - Updating existing entry with ID:", idToUse);
        response = await newnbaCriteria9Service.updateCriteria9('9.1', idToUse, payload);
      } else {
        // Create new record
        console.log("🆕 Criterion9_1Form - Creating new entry");
        response = await newnbaCriteria9Service.saveCriteria9Data('9.1', payload);
      }

      console.log("Save response:", response);

      // ✅ IMMEDIATELY UPDATE LOCAL STATE with the saved data
      const updatedFilesByField = {};
      
      Object.keys(filesByField || {}).forEach(field => {
        const files = filesByField[field] || [];
        updatedFilesByField[field] = files.map(file => {
          // Find matching file in payload
          const savedFile = payload.fysfr_documents?.find(
            f => f.id === file.id || f.filename === (file.filename || file.file?.name)
          );
          
          return {
            ...file,
            s3Url: savedFile?.url || file.s3Url || file.url || "",
            // ✅ CRITICAL: Ensure 'url' field is also set for file display
            url: savedFile?.url || file.s3Url || file.url || "",
            filename: savedFile?.filename || file.filename || file.file?.name || "",
            uploading: false
          };
        });
      });

      // Update filesByField state immediately
      setFilesByField(updatedFilesByField);

      // If this is a new entry, set the ID from response
      if (response?.fysfr_id && !fysfrId) {
        setFysfrId(response.fysfr_id);
      }

      setAlert(
        <SweetAlert
          success
          title="Saved!"
          confirmBtnText="OK"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => setAlert(null)}
        >
          Criterion 9.1 saved successfully
        </SweetAlert>
      );

      setIsEditMode(false);
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
    if (!fysfrId) {
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
            await newnbaCriteria9Service.deleteCriteria9('9.1', fysfrId);
            setAlert(
              <SweetAlert
                success
                title="Deleted!"
                confirmBtnCssClass="btn-confirm"
                confirmBtnText="OK"
                onConfirm={() => setAlert(null)}
              >
                FYSFR record deleted successfully
              </SweetAlert>
            );
            await loadData();
            setFysfrId(null);
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

  const calculatePercentage = (ns1, ns2, rf4) => {
    const ns1Num = parseFloat(ns1) || 0;
    const ns2Num = parseFloat(ns2) || 0;
    const rf4Num = parseFloat(rf4) || 0;
    
    if (rf4Num === 0) return "0%";
    
    const calculation = ((ns1Num * 0.8) + (ns2Num * 0.2)) / rf4Num;
    const percentage = (calculation * 100).toFixed(1);
    
    return `${percentage}%`;
  };

  // Helper function to extract percentage value from formula or return clean percentage
  const cleanPercentageValue = (percentageString) => {
    if (!percentageString) return "";
    
    // If it's already a clean percentage (like "75.5%"), return as is
    if (/^\d+\.?\d*%$/.test(percentageString.toString().trim())) {
      return percentageString;
    }
    
    // If it contains formula, extract the final percentage value
    const match = percentageString.toString().match(/=(\d+\.?\d*)%$/);
    if (match) {
      return `${match[1]}%`;
    }
    
    // If no match found, try to recalculate if we have the data
    return percentageString;
  };

  const calculateRequiredFaculty = (intake) => {
    const intakeNum = parseFloat(intake) || 0;
    return Math.ceil(intakeNum / 20).toString();
  };

  const getAveragePercentage = () => {
    const percentages = fysfr_calculation_table.map(row => {
      const ns1 = parseFloat(row.faculty_basic_science) || 0;
      const ns2 = parseFloat(row.faculty_engineering) || 0;
      const rf4 = parseFloat(row.required_faculty) || 0;
      
      if (rf4 === 0) return 0;
      return ((ns1 * 0.8) + (ns2 * 0.2)) / rf4 * 100;
    }).filter(p => p > 0);
    
    if (percentages.length === 0) return { avg: 0, marks: 0 };
    
    const avg = percentages.reduce((sum, p) => sum + p, 0) / percentages.length;
    let marks = 0;
    
    if (avg >= 80) marks = 5;
    else if (avg >= 70) marks = 4;
    else if (avg >= 60) marks = 3;
    else if (avg >= 50) marks = 2;
    else if (avg >= 40) marks = 1;
    else marks = 0;
    
    return { avg: avg.toFixed(1), marks };
  };

  const handleChange = (i, field, val) => {
    const updated = [...fysfr_calculation_table];
    updated[i][field] = val;
    
    // Auto-calculate required faculty when intake changes
    if (field === 'sanctioned_intake') {
      updated[i]['required_faculty'] = calculateRequiredFaculty(val);
    }
    
    // Auto-calculate percentage when NS1, NS2, or RF4 changes
    if (field === 'faculty_basic_science' || field === 'faculty_engineering' || field === 'required_faculty' || field === 'sanctioned_intake') {
      const ns1 = updated[i]['faculty_basic_science'];
      const ns2 = updated[i]['faculty_engineering'];
      const rf4 = updated[i]['required_faculty'];
      
      if (ns1 && ns2 && rf4) {
        updated[i]['percentage'] = calculatePercentage(ns1, ns2, rf4);
      }
    }
    
    setTableData(updated);
  };

  const addRow = () => {
    const newRow = {
      id: `row-${Date.now()}`,
      year: "",
      sanctioned_intake: "",
      required_faculty: "",
      faculty_basic_science: "",
      faculty_engineering: "",
      percentage: ""
    };
    setTableData([...fysfr_calculation_table, newRow]);
  };

  const removeRow = (i) => {
    if (fysfr_calculation_table.length <= 1) return;
    setTableData(fysfr_calculation_table.filter((_, idx) => idx !== i));
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(fysfr_calculation_table);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setTableData(items);
  };

  const addFileRow = (fieldName) => {
    setFilesByField((prev) => ({
      ...prev,
      [fieldName]: [
        ...(prev[fieldName] || []),
        { id: `file-${Date.now()}-${fieldName}-${Math.random()}`, description: "", file: null, filename: "", s3Url: "", url: "", uploading: false },
      ],
    }));
  };

  const updateFileDescription = (fieldName, index, value) => {
    setFilesByField((prev) => ({
      ...prev,
      [fieldName]: prev[fieldName].map((f, i) => (i === index ? { ...f, description: value } : f)),
    }));
  };

  const handleFileChange = async (fieldName, index, newFile) => {
    if (!newFile || !(newFile instanceof File)) {
      toast.error("Invalid file");
      return;
    }

    const currentRow = filesByField[fieldName][index];

    setFilesByField(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].map((f, i) =>
        i === index ? { ...f, file: newFile, filename: newFile.name, uploading: true } : f
      )
    }));

    try {
      const formData = new FormData();
      formData.append("file", newFile);
      
      if (currentRow.description?.trim()) {
        formData.append("description", currentRow.description.trim());
      }

      const resData = await nbaDashboardService.uploadFile(formData);
      const s3Url = resData || resData?.url || "";

      setFilesByField(prev => ({
        ...prev,
        [fieldName]: prev[fieldName].map((f, i) =>
          i === index
            ? { ...f, s3Url: s3Url, url: s3Url, filename: newFile.name, uploading: false }
            : f
        )
      }));

      toast.success("Uploaded successfully!");
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error("Upload failed");

      setFilesByField(prev => ({
        ...prev,
        [fieldName]: prev[fieldName].map((f, i) =>
          i === index ? { ...f, uploading: false, file: null, filename: "", s3Url: "", url: "" } : f
        )
      }));
    }
  };

  const removeFileRow = (fieldName, index) => {
    setFilesByField((prev) => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((_, i) => i !== index),
    }));
  };

  if (loading) {
    return <div className="flex items-center justify-center py-32 text-2xl text-indigo-600 font-medium">Loading 9.1. First Year Student-Faculty Ratio (FYSFR)...</div>;
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

      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
        <div className="bg-[#2163c1] text-white p-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold flex items-center gap-4">
              <FileText className="w-10 h-10" />
              9.1. First Year Student-Faculty Ratio (FYSFR)
              <span className="text-xl font-medium text-indigo-200">(05 Marks)</span>
            </h2>
            {!completed && (
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditMode(!isEditMode)}
                  className={`p-4 rounded-xl transition-all shadow-lg flex items-center justify-center ${
                    isEditMode ? "bg-white hover:bg-gray-200 text-[#2163c1]" : "bg-white hover:bg-gray-100 text-[#2163c1]"
                  }`}
                  title={isEditMode ? "Cancel Editing" : "Edit Section"}
                >
                  {isEditMode ? <X className="w-7 h-7" /> : <Edit className="w-7 h-7" />}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="p-8 space-y-12">
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-gray-800">Table No. 9.1.1: FYSFR details</h4>

              <DragDropContext onDragEnd={onDragEnd}>
                <table className="w-full table-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-300">
                  <thead>
                    <tr className="bg-[#2163c1] text-white">
                      <th className="p-4 w-12"></th>
                      {columns.map((c) => (
                        <th key={c.field} className="p-4 text-left font-medium text-xs">{c.header}</th>
                      ))}
                      {!completed && isEditMode && <th className="w-20"></th>}
                    </tr>
                  </thead>
                  <Droppable droppableId="table-rows-fysfr">
                    {(provided) => (
                      <tbody {...provided.droppableProps} ref={provided.innerRef}>
                        {fysfr_calculation_table.map((row, i) => (
                          <Draggable key={row.id} draggableId={row.id.toString()} index={i} isDragDisabled={!isEditMode}>
                            {(provided, snapshot) => (
                              <tr
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`border-b transition-all ${snapshot.isDragging ? "bg-indigo-50 shadow-2xl" : "hover:bg-gray-50"}`}
                              >
                                <td className="p-3">
                                  <div {...provided.dragHandleProps} className="cursor-grab">
                                    <GripVertical className="w-6 h-6 text-gray-500" />
                                  </div>
                                </td>
                                {columns.map((col) => (
                                  <td key={col.field} className="p-3">
                                    <input
                                      type="text"
                                      value={row[col.field] || ""}
                                      onChange={(e) => handleChange(i, col.field, e.target.value)}
                                      disabled={!isEditMode || completed || col.field === 'percentage'}
                                      className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                                        col.field === 'percentage' ? 'bg-gray-100 cursor-not-allowed' : ''
                                      }`}
                                      placeholder={col.field === 'percentage' ? 'Auto-calculated' : ''}
                                    />
                                  </td>
                                ))}
                                {!completed && isEditMode && fysfr_calculation_table.length > 1 && (
                                  <td className="text-center">
                                    <button
                                      onClick={() => removeRow(i)}
                                      className="text-red-600 hover:bg-red-50 p-3 rounded-full transition"
                                    >
                                      <Trash2 className="w-5 h-5" />
                                    </button>
                                  </td>
                                )}
                              </tr>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </tbody>
                    )}
                  </Droppable>
                  <tfoot>
                    <tr className="bg-gray-100">
                      <td colSpan={columns.length + 2} className="p-4 text-center font-bold text-lg text-blue-700">
                        Average Percentage: {getAveragePercentage().avg}% ({getAveragePercentage().marks} Marks)
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </DragDropContext>

              {!completed && isEditMode && (
                <button
                  onClick={addRow}
                  className="flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:shadow-xl transition"
                >
                  <Plus className="w-5 h-5" /> Add Row
                </button>
              )}
            </div>

            {isEditMode && !completed && (
              <div className="mt-6 p-6 bg-gray-50 rounded-xl border">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-bold text-blue-700 flex items-center gap-2">
                    <Upload className="w-6 h-6" /> Supporting Documents
                  </h4>
                  {filesByField.fysfr_documents?.some((f) => f.filename?.toLowerCase().endsWith(".pdf")) && (
                    <button
                      onClick={() => setMergeModal({ isOpen: true, fieldName: "fysfr_documents" })}
                      className="px-5 py-2.5 bg-[#2163c1] text-white font-medium rounded-lg hover:bg-[#1d57a8] transition flex items-center gap-2"
                    >
                      <FileText className="w-5 h-5" /> Merge PDFs
                    </button>
                  )}
                </div>

                <DragDropContext
                  onDragEnd={(result) => {
                    if (!result.destination) return;
                    const items = Array.from(filesByField.fysfr_documents || []);
                    const [moved] = items.splice(result.source.index, 1);
                    items.splice(result.destination.index, 0, moved);
                    setFilesByField((prev) => ({ ...prev, fysfr_documents: items }));
                  }}
                >
                  <Droppable droppableId="files-fysfr_documents">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                        {(filesByField.fysfr_documents || []).map((file, index) => {
                          if (!file.id) {
                            file.id = `file-${Date.now()}-fysfr_documents-${Math.random()}`;
                          }
                          return (
                            <Draggable key={file.id} draggableId={file.id.toString()} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`flex items-center gap-3 p-4 bg-white rounded-lg border transition-all ${snapshot.isDragging ? "border-indigo-500 shadow-lg" : "border-gray-300"}`}
                                >
                                  <div {...provided.dragHandleProps} className="cursor-grab">
                                    <GripVertical className="w-5 h-5 text-gray-400" />
                                  </div>
                                  <input
                                    type="text"
                                    value={file.description || ""}
                                    onChange={(e) => updateFileDescription("fysfr_documents", index, e.target.value)}
                                    placeholder="Description"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />

                                  <div className="w-64 space-y-2">
                                    {/* Uploaded Filename Display (on top) */}
                                    {file.filename && !file.uploading && (
                                      <button
                                        onClick={() => setPreviewModal({ isOpen: true, file })}
                                        className="w-full text-left text-blue-600 font-medium hover:underline flex items-center gap-2 py-1"
                                        title={file.filename}
                                      >
                                        <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-600" />
                                        <span className="truncate block">{file.filename}</span>
                                      </button>
                                    )}

                                    {file.uploading && (
                                      <div className="text-gray-500 italic text-sm py-1 flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                                        <span>Uploading...</span>
                                      </div>
                                    )}

                                    {/* Choose File Input (below) */}
                                    <input
                                      type="file"
                                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                      onChange={(e) => {
                                        const newFile = e.target.files?.[0];
                                        if (newFile) {
                                          handleFileChange("fysfr_documents", index, newFile);
                                        }
                                      }}
                                      className="block w-full text-sm text-gray-700
                                                 file:mr-4 file:py-2.5 file:px-5 
                                                 file:rounded-lg file:border-0
                                                 file:text-sm file:font-medium
                                                 file:bg-[#2163c1] file:text-white
                                                 file:hover:bg-[#1d57a8] file:cursor-pointer
                                                 cursor-pointer"
                                      disabled={file.uploading}
                                    />
                                  </div>

                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => addFileRow("fysfr_documents")}
                                      className="text-green-600 hover:bg-green-50 p-2 rounded transition"
                                      title="Add another document"
                                    >
                                      <Plus className="w-5 h-5" />
                                    </button>
                                    <button
                                      onClick={
                                        filesByField.fysfr_documents?.length <= 1
                                          ? undefined
                                          : () => removeFileRow("fysfr_documents", index)
                                      }
                                      disabled={filesByField.fysfr_documents?.length <= 1}
                                      className={`p-2 rounded transition ${
                                        filesByField.fysfr_documents?.length <= 1
                                          ? "text-gray-300 cursor-not-allowed"
                                          : "text-red-500 hover:bg-red-50"
                                      }`}
                                      title={filesByField.fysfr_documents?.length <= 1 ? "At least one document is required" : "Remove document"}
                                    >
                                      <Trash2 className="w-5 h-5" />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>
            )}

            {!isEditMode && (
              <div className="mt-6 p-6 bg-gray-50 rounded-xl border">
                <h4 className="text-lg font-bold text-blue-700 flex items-center gap-2 mb-4">
                  <Upload className="w-6 h-6" /> Supporting Documents
                </h4>
                <div className="space-y-3">
                  {(filesByField.fysfr_documents || []).map((file, index) => (
                    <div
                      key={file.id || `view-file-${index}`}
                      className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-300"
                    >
                      <div className="flex-1">
                        <span className="text-gray-700 font-medium">
                          {file.description || `Document ${index + 1}`}
                        </span>
                      </div>
                      <div className="w-64">
                        {file.filename && file.url ? (
                          <button
                            onClick={() => setPreviewModal({ isOpen: true, file })}
                            className="text-blue-600 font-medium hover:underline flex items-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" /> {file.filename}
                          </button>
                        ) : (
                          <span className="text-gray-400 italic">No file uploaded</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {isEditMode && !completed && (
            <div className="text-center pt-10 flex gap-4 justify-center">
              <button
                onClick={handleSave}
                className={`inline-flex items-center justify-center w-12 h-12 rounded-lg transition-all ${
                  saving || !isContributorEditable
                    ? "bg-[#2163c1] cursor-pointer opacity-60"
                    : "bg-[#2163c1] hover:bg-[#1d57a8] text-white shadow-lg hover:shadow-xl"
                }`}
                title={saving ? "Saving..." : !isContributorEditable ? "Not allowed to save" : "Save"}
              >
                <Save className="w-6 h-6" />
              </button>

              <button
                onClick={() => setIsEditMode(false)}
                disabled={saving}
                className="inline-flex items-center justify-center w-12 h-12 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition shadow-lg"
                title="Cancel"
              >
                <X className="w-6 h-6" />
              </button>

              <button
                onClick={handleDelete}
                className="inline-flex items-center justify-center w-12 h-12 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow-lg"
                title="Delete Section Data"
              >
                <Trash2 className="w-6 h-6" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Preview & Merge Modals */}
      <Modal
        isOpen={previewModal.isOpen}
        onRequestClose={() => setPreviewModal({ isOpen: false, file: null })}
        className="fixed inset-4 bg-white rounded-2xl shadow-2xl overflow-hidden outline-none"
        overlayClassName="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
      >
        {previewModal.file && (
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center p-6 bg-gradient-to-r from-blue-600 to-blue-400 text-white">
              <h3 className="text-xl font-bold">{previewModal.file.filename}</h3>
              <button onClick={() => setPreviewModal({ isOpen: false, file: null })}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <iframe
              src={previewModal.file.s3Url}
              title={previewModal.file.filename}
              className="flex-1 w-full"
            />
          </div>
        )}
      </Modal>

      <MergePdfModal
        isOpen={mergeModal.isOpen}
        pdfFiles={filesByField[mergeModal.fieldName] || []}
        onClose={() => setMergeModal({ isOpen: false, fieldName: null })}
        onFileAdd={(mergedDocument) => {
          const mergedFile = {
            id: mergedDocument.id,
            filename: mergedDocument.filename,
            description: mergedDocument.description,
            s3Url: mergedDocument.s3Url,
            uploading: false,
            isMerged: true,
          };
          setFilesByField((prev) => ({
            ...prev,
            [mergeModal.fieldName]: [...(prev[mergeModal.fieldName] || []), mergedFile],
          }));
          setMergeModal({ isOpen: false, fieldName: null });
        }}
      />

      {alert}
    </div>
  );
};

export default Criterion9_1Form;