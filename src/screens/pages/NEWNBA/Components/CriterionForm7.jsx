import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import GenericCriteriaForm7 from "./GenericCriteriaForm7";
import GenericCriteriaForm7_5 from "./GenericCriteriaForm7_5";
import GenericCriteriaForm7_6 from "./GenericCriteriaForm7_6";
import StatusBadge from "./StatusBadge";
import { newnbaCriteria7Service } from "../Services/NewNBA-Criteria7.service";

/* =========================================================
   Criterion Form – Criteria 7.x (UPDATED)
   ========================================================= */

const CriterionForm = ({
  section,
  nba_criteria_sub_level2_id,
  contributor_allocation_id,
  completed = false,
  isContributorEditable = true,
  otherStaffId = null,
  editMode = false,
}) => {
  /* ---------------- STATE ---------------- */
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initialData, setInitialData] = useState({
    content: {},
    tableData: [],
    filesByField: {},
  });
  const [recordId, setRecordId] = useState(null);
  const [approvalStatus, setApprovalStatus] = useState(null);
  const [userRole, setUserRole] = useState({});

  /* ---------------- USER ROLE ---------------- */
  useEffect(() => {
    const info = JSON.parse(localStorage.getItem("userInfo") || "{}");
    setUserRole(info || {});
  }, []);

  /* =========================================================
     SECTION UI CONFIG - UPDATED BASED ON IMAGE
     ========================================================= */
  const sectionConfig = {
    "7.1": {
      title:
        "7.1. Improvement in Success Index of Students without the Backlogs",
      totalMarks: 15,
      fields: [
        {
          name: "7.1",
          hasTable: true,
          hasFileUpload: true,
          tableConfig: {
            title: "Teaching–Learning Activities",
            columns: [
              { field: "items", header: "Items" },
              { field: "lyg", header: "LYG" },
              { field: "lyg_1", header: "LYGm1" },
              { field: "lyg_2", header: "LYGm2" },
            ],
          },
        },
      ],
    },

    "7.2": {
      title: "7.2. Improvement in Placement and Higher Studies",
      totalMarks: 10,
      fields: [
        {
          name: "7.2",
          label: "Description",
          hasEditor: true,
          hasFileUpload: true,
        },
      ],
    },

    "7.3": {
      title: "7.3. Improvement in Sponsored Projects and Consultancy",
      totalMarks: 10,
      fields: [
        {
          name: "7.3",
          label: "Description",
          hasEditor: true,
          hasFileUpload: true,
        },
      ],
    },

    "7.4": {
      title:
        "7.4. Academic Audit and Actions Taken thereof during the Assessment Period",
      totalMarks: 10,
      fields: [
        {
          name: "7.4",
          label: "Academic Audit Description",
          hasEditor: true,
          hasFileUpload: true,
        },
      ],
    },

    "7.5": {
      title:
        "7.5. Improvement in the Quality of Students Admitted to the Program",
      totalMarks: 10,
      fields: [
        {
          name: "7.5",
          hasTable: true,
          hasFileUpload: true,
          tableConfig: {
            title:
              "Table 7.5 – Improvement in the Quality of Students Admitted (3 Years)",
            columns: [
              { field: "item", header: "Item" },
              { field: "cay", header: "CAY" },
              { field: "caym1", header: "CAYm1" },
              { field: "caym2", header: "CAYm2" },
            ],
            readOnlyRows: [0, 4, 9], // Updated based on new rows
          },
          predefinedRows: [
            // Section 1: National Level Entrance Examination
            { 
              item: "National Level Entrance Examination (NAT/JEEE Examination)", 
              cay: "", 
              caym1: "", 
              caym2: "",
              isSectionHeader: true // Optional: to style differently
            },
            { 
              item: "No. of students admitted", 
              cay: "", 
              caym1: "", 
              caym2: "",
              indent: true // Optional: for indentation
            },
            { 
              item: "Opening Score/Rank", 
              cay: "", 
              caym1: "", 
              caym2: "",
              indent: true
            },
            { 
              item: "Closing Score/Rank", 
              cay: "", 
              caym1: "", 
              caym2: "",
              indent: true
            },
            
            // Empty row for spacing
            { item: "", cay: "", caym1: "", caym2: "" },
            
            // Section 2: Average percentage
            { 
              item: "Average percentage of all students of CBSE/Any other Board Result of admitted students", 
              cay: "", 
              caym1: "", 
              caym2: "",
              isSectionHeader: true
            },
          ],
        },
      ],
    },

    "7.6": {
      title: "7.6. Continuous Improvement Initiatives",
      totalMarks: 10,
      fields: [
        {
          name: "7.6",
          label: "Description",
          hasEditor: true,
          hasFileUpload: true,
        },
        {
      name: "po_attainment",                  // ← new field for the table
      label: "POs Attainment Levels & Actions Taken",
      showPOTable: true,                      // ← new flag we'll use
      hasFileUpload: false,                    // documents can support the actions / observations
      // Optional: you can pre-fill PO statements if you have them
      poStatements: {
        PO1: "Engineering knowledge: Apply the knowledge of mathematics, science, engineering fundamentals...",
        PO2: "Problem analysis: Identify, formulate, review research literature, and analyze complex engineering problems...",
        // PO3, PO4, ..., PO12 as needed
      },
    },
      ],
    },
  };

  /* =========================================================
     API CONFIG
     ========================================================= */
  const apiConfig = {
    /* ======================= 7.1 ======================= */
    "7.1": {
      save: newnbaCriteria7Service.saveCriteria7_1_Data,
      update: newnbaCriteria7Service.updateCriteria7_1_Data,
      refresh: newnbaCriteria7Service.getCriteria7_1_Data,
      delete: newnbaCriteria7Service.deleteCriteria7_1_Data,
      mapPayload: (data, staffId) => ({
        other_staff_id: staffId,
        cycle_sub_category_id: nba_criteria_sub_level2_id,
        success_index_data: data.tableData || [],
        success_index_document: mapFiles(data),
      }),
      mapResponse: (d) => ({
        content: {},
        tableData: d.success_index_data || [],
        filesByField: fileMap(d.success_index_document, "7.1"),
      }),
    },

    /* ======================= 7.2 ======================= */
    "7.2": {
      save: newnbaCriteria7Service.saveCriteria7_2_Data,
      update: newnbaCriteria7Service.updateCriteria7_2_Data,
      refresh: newnbaCriteria7Service.getCriteria7_2_Data,
      delete: newnbaCriteria7Service.deleteCriteria7_2_Data,
      mapPayload: (data, staffId) => ({
        other_staff_id: staffId,
        cycle_sub_category_id: nba_criteria_sub_level2_id,
        placement_higher_studies_description: data.content?.["7.2"] || "",
        placement_higher_studies_document: mapFiles(data),
      }),
      mapResponse: (d) => ({
        content: { "7.2": d.placement_higher_studies_description || "" },
        tableData: [],
        filesByField: fileMap(d.placement_higher_studies_document, "7.2"),
      }),
    },

    /* ======================= 7.3 ======================= */
    "7.3": {
      save: newnbaCriteria7Service.saveCriteria7_3_Data,
      update: newnbaCriteria7Service.updateCriteria7_3_Data,
      refresh: newnbaCriteria7Service.getCriteria7_3_Data,
      delete: newnbaCriteria7Service.deleteCriteria7_3_Data,
      mapPayload: (data, staffId) => ({
        other_staff_id: staffId,
        cycle_sub_category_id: nba_criteria_sub_level2_id,
        projects_consultancy_description: data.content?.["7.3"] || "",
        projects_consultancy_document: mapFiles(data),
      }),
      mapResponse: (d) => ({
        content: { "7.3": d.projects_consultancy_description || "" },
        tableData: [],
        filesByField: fileMap(d.projects_consultancy_document, "7.3"),
      }),
    },

    /* ======================= 7.4 ======================= */
    "7.4": {
      save: newnbaCriteria7Service.saveCriteria7_4_Data,
      update: newnbaCriteria7Service.updateCriteria7_4_Data,
      refresh: newnbaCriteria7Service.getCriteria7_4_Data,
      delete: newnbaCriteria7Service.deleteCriteria7_4_Data,
      mapPayload: (data, staffId) => ({
        other_staff_id: staffId,
        cycle_sub_category_id: nba_criteria_sub_level2_id,
        academic_audit_description: data.content?.["7.4"] || "",
        academic_audit_document: mapFiles(data),
      }),
      mapResponse: (d) => ({
        content: { "7.4": d.academic_audit_description || "" },
        tableData: [],
        filesByField: fileMap(d.academic_audit_document, "7.4"),
      }),
    },

    /* ======================= 7.5 ======================= */
    "7.5": {
      save: newnbaCriteria7Service.saveCriteria7_5_Data,
      update: newnbaCriteria7Service.updateCriteria7_5_Data,
      refresh: newnbaCriteria7Service.getCriteria7_5_Data,
      delete: newnbaCriteria7Service.deleteCriteria7_5_Data,
      mapPayload: (data, staffId) => ({
        other_staff_id: staffId,
        cycle_sub_category_id: nba_criteria_sub_level2_id,
        students_admitted_data: data.tableData || [],
        students_admitted_document: mapFiles(data),
      }),
      mapResponse: (d) => ({
        content: {},
        tableData: d.students_admitted_data || [],
        filesByField: fileMap(d.students_admitted_document, "7.5"),
      }),
    },

    /* ======================= 7.6 ======================= */
    "7.6": {
      save: newnbaCriteria7Service.saveCriteria7_6_Data,
      update: newnbaCriteria7Service.updateCriteria7_6_Data,
      refresh: newnbaCriteria7Service.getCriteria7_6_Data,
      delete: newnbaCriteria7Service.deleteCriteria7_6_Data,
      mapPayload: (data, staffId) => ({
        other_staff_id: staffId,
        cycle_sub_category_id: nba_criteria_sub_level2_id,
        continuous_improvement_description: data.content?.["7.6"] || "",
        po_evaluation_document: mapFiles(data),
      }),
      mapResponse: (d) => ({
        content: { "7.6": d.continuous_improvement_description || "" },
        tableData: [],
        filesByField: fileMap(d.po_evaluation_document, "7.6"),
      }),
    },
  };

  /* =========================================================
     LOAD DATA
     ========================================================= */
  useEffect(() => {
    const load = async () => {
      if (!apiConfig[section]) return;

      try {
        setLoading(true);
        const staffId =
          otherStaffId ||
          JSON.parse(localStorage.getItem("userProfile") || "{}")?.rawData
            ?.other_staff_id;

        const res = await apiConfig[section].refresh(
          nba_criteria_sub_level2_id,
          staffId
        );

        const item = Array.isArray(res) ? res[0] : res;

        if (item) {
          setRecordId(item.id);
          setInitialData(apiConfig[section].mapResponse(item));
          if (item.approval_status) setApprovalStatus(item);
        } else {
          // No data found - initialize with default file upload sections
          const defaultFilesByField = {};
          sectionConfig[section].fields.forEach((field) => {
            if (field.hasFileUpload) {
              defaultFilesByField[field.name] = [
                {
                  id: `file-${field.name}-0`,
                  description: "",
                  file: null,
                  filename: "",
                  s3Url: "",
                  uploading: false,
                },
              ];
            }
          });
          
          setInitialData({
            content: {},
            tableData: [],
            filesByField: defaultFilesByField,
          });
        }
      } catch {
        // Error loading - still initialize with default file upload sections
        const defaultFilesByField = {};
        sectionConfig[section].fields.forEach((field) => {
          if (field.hasFileUpload) {
            defaultFilesByField[field.name] = [
              {
                id: `file-${field.name}-0`,
                description: "",
                file: null,
                filename: "",
                s3Url: "",
                uploading: false,
              },
            ];
          }
        });
        
        setInitialData({
          content: {},
          tableData: [],
          filesByField: defaultFilesByField,
        });
        
        toast.error("Failed to load saved data");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [section, nba_criteria_sub_level2_id, otherStaffId]);

  /* =========================================================
     SAVE
     ========================================================= */
  const handleSave = async (data) => {
    try {
      setSaving(true);
      const staffId =
        otherStaffId ||
        JSON.parse(localStorage.getItem("userProfile") || "{}")?.rawData
          ?.other_staff_id;

      const payload = apiConfig[section].mapPayload(data, staffId);

      recordId
        ? await apiConfig[section].update(recordId, payload, staffId)
        : await apiConfig[section].save(payload, staffId);

      toast.success("Saved successfully");
    } catch (err) {
      toast.error(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     DELETE
     ========================================================= */
  const handleDelete = async () => {
    if (!recordId) return;

    const confirm = await Swal.fire({
      title: "Are you sure?",
      icon: "warning",
      showCancelButton: true,
    });

    if (!confirm.isConfirmed) return;

    await apiConfig[section].delete(recordId);
    setRecordId(null);
    
    // Reset to default empty state with file upload sections
    const defaultFilesByField = {};
    sectionConfig[section].fields.forEach((field) => {
      if (field.hasFileUpload) {
        defaultFilesByField[field.name] = [
          {
            id: `file-${field.name}-0`,
            description: "",
            file: null,
            filename: "",
            s3Url: "",
            uploading: false,
          },
        ];
      }
    });
    
    setInitialData({ 
      content: {}, 
      tableData: [], 
      filesByField: defaultFilesByField 
    });
    
    toast.success("Deleted successfully");
  };

  if (loading) return <div className="py-20 text-center">Loading…</div>;

  const FormComponent =
    section === "7.5"
      ? GenericCriteriaForm7_5
      : section === "7.6" ? GenericCriteriaForm7_6
      : GenericCriteriaForm7

  return (
    <div className="space-y-4">
      {approvalStatus &&
        userRole?.nba_contributor &&
        approvalStatus.approval_status !== "COORDINATORS_DATA" && (
          <StatusBadge
            status={approvalStatus.approval_status}
            rejectionReason={approvalStatus.rejection_reason}
            approvedByName={approvalStatus.approved_by_name}
          />
        )}

      <FormComponent
        section={section} 
        title={sectionConfig[section].title}
        marks={sectionConfig[section].totalMarks}
        fields={sectionConfig[section].fields}
        initialData={initialData}
        onSave={handleSave}
        onDelete={recordId ? handleDelete : null}
        isCompleted={completed}
        isContributorEditable={!recordId || editMode}
        saving={saving}
        hasExistingData={!!recordId}
      />
    </div>
  );
};

/* =========================================================
   HELPERS
   ========================================================= */

const mapFiles = (data) =>
  Object.values(data.filesByField || {})
    .flat()
    .filter((f) => f.s3Url || f.url)
    .map((f) => ({
      filename: f.filename,
      url: f.s3Url || f.url,
      description: f.description,
    }));

const fileMap = (docs = [], fieldName = "default") => {
  const files =
    docs && docs.length > 0
      ? docs.map((d, i) => ({
          id: d.id || `file-${i}`,
          filename: d.filename || d.name || "",
          url: d.url || d.file_url || "",
          s3Url: d.url || d.file_url || "",
          description: d.description || "",
          uploading: false,
        }))
      : [
          {
            id: `file-${fieldName}-0`,
            description: "",
            file: null,
            filename: "",
            s3Url: "",
            uploading: false,
          },
        ];
  return { [fieldName]: files };
};

export default CriterionForm;