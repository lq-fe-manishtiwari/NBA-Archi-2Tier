// Criterion5_1Form.jsx
import React, { useState, useEffect, useCallback } from "react";
import GenericCriteriaForm5_1 from "../Criteria5/GenericCriteriaForm5_1";
import { newnbaCriteria5Service } from "../../Services/NewNBA-Criteria5.service";
import { toast } from "react-toastify";
import SweetAlert from "react-bootstrap-sweetalert";
import StatusBadge from "../StatusBadge";
import { Users } from "lucide-react";

const Criterion5_1Form = ({
  cycle_sub_category_id,
  other_staff_id,
  isEditable = true,
  onSaveSuccess,
  cardItem = null,
}) => {
  console.log("🔵 Criterion5_1Form props:", {
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

  const [initialData, setInitialData] = useState({
    content: {
      "5.1.1": "",
      "5.1.2": ""
    },
    tableData: {
      lateralEntryCalculation: [
        {
          id: "case1",
          case: "Case 1",
          firstYear: "",
          leftover: "",
          secondYear: "",
          considered: "",
          sanctionedIntake: "120"
        }
      ],
      studentFacultyRatio: [
        {
          id: "ug1",
          program: "B.Tech Computer Science & Engineering",
          type: "ug",
          year: "CAY",
          b: "1024", c: "", d: "", total: "1024"
        }
      ],
    },
    filesByField: {},
  });

  const [facultyData, setFacultyData] = useState({
    df: { cay: "", caym1: "", caym2: "" },
    af: { cay: "0", caym1: "0", caym2: "0" },
    ff: { cay: "0", caym1: "0", caym2: "0" }
  });

  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    setUserRole(userInfo);
  }, []);

  // ---------------- CONFIG ----------------
  const config = {
    title: "5.1. Student-Faculty Ratio (SFR)",
    totalMarks: 30,
    fields: [
      {
        name: "5.1.1",
        label: "5.1.1: Calculation of number of students admitted in the program though lateral entry or left-over seats",
        marks: 15,
        hasTable: true,
        tableKey: "lateralEntryCalculation",
        tableConfig: {
          title: "Table No. 5.1.1: Lateral Entry and Leftover Seats Calculation",
          description: "Calculate the number of students to be considered for SFR (ST) based on lateral entry and leftover seats"
        },
      },
      {
        name: "5.1.2",
        label: "5.1.2: Student-Faculty Ratio (SFR) Calculation",
        marks: 15,
        hasTable: true,
        tableKey: "studentFacultyRatio",
        tableConfig: {
          title: "Table No. 5.1.2: Student-Faculty Ratio Calculation",
          description: "Detailed calculation of SFR for UG and PG programs"
        },
      },
    ],
  };

  // ---------------- LOAD DATA ----------------
  const loadData = useCallback(async () => {
    if (!cycle_sub_category_id) {
      console.log("⏸️ Skipping load - missing cycle_sub_category_id");
      setLoading(false);
      return;
    }

    // Determine which staff ID to use - other_staff_id has priority, fallback to current user
    const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
    const userInfo2 = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const staffIdToUse = other_staff_id || userInfo?.rawData?.other_staff_id || userInfo2?.other_staff_id;
    
    console.log("🎯 Criterion5_1Form - Final staffId:", staffIdToUse);
    console.log("🎯 Criterion5_1Form - other_staff_id prop:", other_staff_id);
    console.log("🎯 Criterion5_1Form - userInfo staff ID:", userInfo?.rawData?.other_staff_id);
    console.log("🎯 Criterion5_1Form - userInfo2 staff ID:", userInfo2?.other_staff_id);

    if (!staffIdToUse) {
      console.log("❌ Criterion5_1Form - No staffId found, using empty data");
      setInitialData({
        content: { "5.1.1": "", "5.1.2": "" },
        tableData: {
          lateralEntryCalculation: [{
            id: "case1", case: "Case 1", firstYear: "", leftover: "",
            secondYear: "", considered: "", sanctionedIntake: "120"
          }],
          studentFacultyRatio: [{
            id: "ug1", program: "B.Tech Computer Science & Engineering",
            type: "ug", year: "CAY", b: "", c: "", d: "", total: ""
          }]
        },
        filesByField: {}
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log("📡 Criterion5_1Form - Making API call with:");
      console.log("  - cycle_sub_category_id:", cycle_sub_category_id);
      console.log("  - staffId:", staffIdToUse);
      
      const response = await newnbaCriteria5Service.getCriteria5_1_Data(cycle_sub_category_id, staffIdToUse);
      console.log("📊 Criterion5_1Form - Raw API Response:", response);
      
      // Handle both array and single object responses
      let data = {};
      if (Array.isArray(response?.data)) {
        data = response.data.find(item => item && (item.sfr_id || item.criteria5_1_id || item.id)) || {};
      } else if (response?.data) {
        data = response.data;
      } else if (response && !response.data) {
        data = Array.isArray(response) ? (response.find(item => item && (item.sfr_id || item.criteria5_1_id || item.id)) || {}) : response;
      }

      console.log("📡 Fetching data from API...");
      const res = await newnbaCriteria5Service.getCriteria5_1_Data(cycle_sub_category_id, other_staff_id);
      console.log("📥 API Response:", res);

      // Handle both array and object responses
      const rawData = res?.data || res || [];
      const d = Array.isArray(rawData) && rawData.length > 0 ? rawData[0] : rawData;
      console.log("📊 Raw data:", rawData);
      console.log("📊 Parsed data:", d);

      if (d.sfr_id || d.criteria5_1_id || d.id) {
        const newRecordId = d.sfr_id || d.criteria5_1_id || d.id;
        setRecordId(newRecordId);
        console.log("✅ Record ID set to:", newRecordId, "(sfr_id:", d.sfr_id, ")");

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

        // Set approval status if available
        if (data.approval_status) {
          setApprovalStatus({
            status: data.approval_status,
            rejectionReason: data.rejection_reason,
            approvalReason: data.approval_status === 'APPROVED' ? data.rejection_reason : null,
            approvedByName: data.approved_by_name,
            submittedTime: data.submitted_time
          });
        }
        
        // Parse existing data
        let lateralData = [];
        let sfrData = [];
        let filesByField = {};

        // Handle lateral entry data
        if (data.lateral_entry_table && Array.isArray(data.lateral_entry_table)) {
          lateralData = data.lateral_entry_table.map((entry, index) => ({
            id: `case-${index + 1}`,
            case: entry.case_name || `Case ${index + 1}`,
            firstYear: entry.first_year_students || "",
            leftover: entry.leftover_students || "",
            secondYear: entry.second_year_students || "",
            considered: entry.students_considered || "",
            sanctionedIntake: entry.sanctioned_intake || "120"
          }));
          console.log("📊 Loaded lateral entry data from API:", lateralData);
        } else if (data.lateral_calculation_rows) {
          try {
            lateralData = typeof data.lateral_calculation_rows === 'string'
              ? JSON.parse(data.lateral_calculation_rows)
              : data.lateral_calculation_rows;
          } catch (e) {
            lateralData = [];
          }
        }

        // Handle SFR data
        if (data.sfr_calculation_table && Array.isArray(data.sfr_calculation_table)) {
          sfrData = data.sfr_calculation_table.map((calc, index) => ({
            id: `${calc.program_type || 'ug'}-${index + 1}`,
            program: calc.program_name || "B.Tech Computer Science & Engineering",
            type: calc.program_type || "ug",
            year: calc.year || "CAY",
            b: calc.column_b || "",
            c: calc.column_c || "",
            d: calc.column_d || "",
            total: calc.total || ""
          }));
          console.log("📊 Loaded SFR calculation data from API:", sfrData);
        } else if (data.sfr_calculation_rows) {
          try {
            sfrData = typeof data.sfr_calculation_rows === 'string'
              ? JSON.parse(data.sfr_calculation_rows)
              : data.sfr_calculation_rows;
          } catch (e) {
            sfrData = [];
          }
        }

        // Handle files
        if (data.sfr_supporting_documents && Array.isArray(data.sfr_supporting_documents)) {
          data.sfr_supporting_documents.forEach(doc => {
            const fieldName = doc.field_name || "5.1.1";
            if (!filesByField[fieldName]) {
              filesByField[fieldName] = [];
            }
            filesByField[fieldName].push({
              id: `file-${Date.now()}-${Math.random()}`,
              filename: doc.file_name,
              s3Url: doc.s3_url, // Fixed: use s3_url instead of file_url
              description: doc.description || "",
              uploading: false
            });
          });
          console.log("📁 Loaded files from API:", filesByField);
        } else if (data.files_by_field) {
          try {
            filesByField = typeof data.files_by_field === 'string'
              ? JSON.parse(data.files_by_field)
              : data.files_by_field;
          } catch (e) {
            filesByField = {};
          }
        }

        // Handle faculty data (old format)
        if (data.faculty_data && !data.sfr_calculation_table) {
          try {
            const parsedFaculty = typeof data.faculty_data === 'string'
              ? JSON.parse(data.faculty_data)
              : data.faculty_data;
            setFacultyData(parsedFaculty);
          } catch (e) {
            // ignore
          }
        }

        setInitialData({
          content: {
            "5.1.1": data.description_5_1_1 || data.sfr_description || "",
            "5.1.2": data.description_5_1_2 || ""
          },
          tableData: {
            lateralEntryCalculation: lateralData.length > 0 ? lateralData : [{
              id: "case1", case: "Case 1", firstYear: "", leftover: "",
              secondYear: "", considered: "", sanctionedIntake: "120"
            }],
            studentFacultyRatio: sfrData.length > 0 ? sfrData : [{
              id: "ug1", program: "B.Tech Computer Science & Engineering",
              type: "ug", year: "CAY", b: "", c: "", d: "", total: ""
            }]
          },
          filesByField: filesByField
        });
      } else {
        // No existing data, use defaults
        setApprovalStatus(null);
        setContributorName("");
        setInitialData({
          content: { "5.1.1": "", "5.1.2": "" },
          tableData: {
            lateralEntryCalculation: [{
              id: "case1", case: "Case 1", firstYear: "", leftover: "",
              secondYear: "", considered: "", sanctionedIntake: "120"
            }],
            studentFacultyRatio: [{
              id: "ug1", program: "B.Tech Computer Science & Engineering",
              type: "ug", year: "CAY", b: "", c: "", d: "", total: ""
            }]
          },
          filesByField: {}
        });
      }

    } catch (err) {
      console.error("Load failed:", err);
      toast.error("Failed to load saved data");
      // Set defaults on error
      setInitialData({
        content: { "5.1.1": "", "5.1.2": "" },
        tableData: {
          lateralEntryCalculation: [{
            id: "case1", case: "Case 1", firstYear: "", leftover: "",
            secondYear: "", considered: "", sanctionedIntake: "120"
          }],
          studentFacultyRatio: [{
            id: "ug1", program: "B.Tech Computer Science & Engineering",
            type: "ug", year: "CAY", b: "", c: "", d: "", total: ""
          }]
        },
        filesByField: {}
      });
    } finally {
      setLoading(false);
    }
  }, [cycle_sub_category_id, other_staff_id]);

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
  const handleSave = async (formData, facultyDataFromComponent = null) => {
    if (!isEditable) {
      toast.error("You don't have permission to edit");
      return;
    }

    setSaveLoading(true);
    try {
      // Transform UI data to API format
      const currentFacultyData = facultyDataFromComponent || facultyData;
      
      // Transform lateral entry data
      const lateral_entry_table = formData.tableData?.lateralEntryCalculation?.map(row => ({
        case_name: row.case || "",
        first_year_students: row.firstYear || "",
        leftover_students: row.leftover || "",
        second_year_students: row.secondYear || "",
        students_considered: row.considered || "",
        sanctioned_intake: row.sanctionedIntake || ""
      })) || [];

      // Transform SFR calculation data
      const sfr_calculation_table = formData.tableData?.studentFacultyRatio?.map(row => ({
        program_name: row.program || "",
        program_type: row.type || "",
        year: row.year || "",
        column_b: row.b || "",
        column_c: row.c || "",
        column_d: row.d || "",
        total: row.total || ""
      })) || [];

      // Transform supporting documents
      const sfr_supporting_documents = [];
      if (formData.filesByField) {
        Object.entries(formData.filesByField).forEach(([fieldName, files]) => {
          files.forEach(file => {
            if (file.s3Url) {
              sfr_supporting_documents.push({
                field_name: fieldName,
                file_name: file.filename || "",
                s3_url: file.s3Url,
                description: file.description || ""
              });
            }
          });
        });
      }
  const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
      const userInfo2 = JSON.parse(localStorage.getItem("userInfo") || "{}");
    
      const staffId = userInfo?.rawData?.other_staff_id || userInfo2?.other_staff_id;

      const payload = {
        other_staff_id: parseInt(staffId),
        cycle_sub_category_id: parseInt(cycle_sub_category_id),
        description_5_1_1: formData.content?.["5.1.1"] || "",
        description_5_1_2: formData.content?.["5.1.2"] || "",
        lateral_entry_table,
        sfr_calculation_table,
        sfr_supporting_documents,
        faculty_data: JSON.stringify(currentFacultyData || [])
      };

      console.log("🚀 Saving payload:", payload);

      let response;
      if (recordId) {
        // Update existing record
        response = await newnbaCriteria5Service.updateCriteria5_1_Data(recordId, payload);
        console.log("✅ Update response:", response);
        setSuccessMessage("Section updated successfully!");
      } else {
        // Create new record
        response = await newnbaCriteria5Service.saveCriteria5_1_Data(payload, staffId);
        console.log("✅ Save response:", response);
        
        // Set recordId from response for future updates
        if (response?.data?.sfr_id || response?.data?.id) {
          setRecordId(response.data.sfr_id || response.data.id);
        } else if (response?.sfr_id || response?.id) {
          setRecordId(response.sfr_id || response.id);
        }
        
        setSuccessMessage("Section created successfully!");
      }

      // ✅ IMMEDIATELY UPDATE LOCAL STATE with the saved data
      // This ensures files and data are shown without reloading
      const updatedFilesByField = {};
      
      Object.keys(formData.filesByField || {}).forEach(field => {
        const files = formData.filesByField[field] || [];
        updatedFilesByField[field] = files.map(file => {
          // Find matching file in payload
          const savedFile = payload.sfr_supporting_documents?.find(
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
        tableData: formData.tableData || prev.tableData,
        filesByField: updatedFilesByField
      }));

      setShowSuccessAlert(true);

      onSaveSuccess?.();
      // Still call loadData to ensure full sync, but data is already visible
      loadData();
    } catch (err) {
      console.error("Save failed:", err);
      toast.error(err.message || "Failed to save");
    } finally {
      setSaveLoading(false);
    }
  };

  // ---------------- DELETE DATA ----------------
  const handleDelete = async () => {
    // Use sfr_id for delete operations
    const idToDelete = recordId;
    
    console.log("🗑️ Delete function called:");
    console.log("  - recordId:", recordId);
    console.log("  - idToDelete:", idToDelete);
  
    if (!idToDelete) {
      console.warn("⚠️ No ID available for deletion");
      setAlert(
        <SweetAlert info title="No Data to Delete" onConfirm={() => setAlert(null)}>
          There is no saved data to delete.
        </SweetAlert>
      );
      return;
    }
    setShowDeleteAlert(true);
  };

  const confirmDelete = async () => {
    try {
      await newnbaCriteria5Service.deleteCriteria5_1Data(recordId);
  
      toast.success("✅ Section data deleted successfully!");
  
      // 🔥 RESET EVERYTHING IMMEDIATELY
      setRecordId(null);
      setApprovalStatus(null);
      setContributorName("");
  
      // 🔥 Reset faculty data
      setFacultyData({
        df: { cay: "0", caym1: "0", caym2: "0" },
        af: { cay: "0", caym1: "0", caym2: "0" },
        ff: { cay: "0", caym1: "0", caym2: "0" }
      });
  
      // 🔥 Reset form data instantly
      setInitialData({
        content: {
          "5.1.1": "",
          "5.1.2": ""
        },
        tableData: {
          lateralEntryCalculation: [
            {
              id: "case1",
              case: "Case 1",
              firstYear: "",
              leftover: "",
              secondYear: "",
              considered: "",
              sanctionedIntake: "120"
            }
          ],
          studentFacultyRatio: [
            {
              id: "ug1",
              program: "B.Tech Computer Science & Engineering",
              type: "ug",
              year: "CAY",
              b: "",
              c: "",
              d: "",
              total: ""
            }
          ]
        },
        filesByField: {}
      });
  
      setShowDeleteAlert(false);
  
      // 🔥 Force sync with backend (safety)
      await loadData();
  
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

  // Handle save from GenericCriteriaForm5_1 with faculty data
  const handleGenericSave = (formData, facultyDataFromComponent) => {
    handleSave(formData, facultyDataFromComponent);
  };

  // ---------------- UI ----------------
  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-2xl text-indigo-600 font-medium">
        Loading 5.1. Student-Faculty Ratio (SFR)...
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
          
          </div>
        </div>
      )}

      <GenericCriteriaForm5_1
        title={config.title}
        marks={config.totalMarks}
        fields={config.fields}
        initialData={initialData}
        saving={saveLoading}
        isCompleted={false}
        isContributorEditable={isEditable}
        onSave={handleGenericSave}
        onDelete={handleDelete}
        facultyData={facultyData}
        onFacultyDataChange={setFacultyData}
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
            loadData();
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

export default Criterion5_1Form;