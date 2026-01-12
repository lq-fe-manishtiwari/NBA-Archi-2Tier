import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import SweetAlert from 'react-bootstrap-sweetalert';
import GenericCriteriaForm from "../GenericCriteriaForm";
import StatusBadge from "../StatusBadge";
import { newnbaCriteria6Service } from "../../Services/NewNBA-Criteria6.service";

const Criterion6_1Form = ({
  nba_accredited_program_id,
  academic_year,
  nba_criteria_sub_level2_id,
  contributor_allocation_id: nba_contributor_allocation_id,
  completed = false,
  isContributorEditable = true,
  otherStaffId = null, // For coordinator viewing specific contributor's data
  editMode = false, // For editing existing entries
  professionalDevelopmentId = null, // For PUT operations
}) => {
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState(null);
  const [currentProfessionalDevelopmentId, setCurrentProfessionalDevelopmentId] = useState(professionalDevelopmentId);
  const [userRole, setUserRole] = useState("");
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const roles = userInfo || {};
    setUserRole(roles);
  }, []);

  const emptyTableData = {
    "6.1.1": [],
    "6.1.2.1_caym1": [],
    "6.1.2.1_caym2": [],
    "6.1.2.1_caym3": [],
    "6.1.2.2": [],
    "6.1.3": [],
    "6.1.4_caym1": [],
    "6.1.4_caym2": [],
    "6.1.4_caym3": [],
    "6.1.5_caym1": [],
    "6.1.5_caym2": [],
    "6.1.5_caym3": [],
    "6.1.6": [],
  };

  const sectionConfig = {
    title: "6.1. Professional Development Activities",
    totalMarks: 60,
    fields: [
      {
        name: "6.1.1",
        label: "6.1.1 Membership in Professional Societies at National/International Levels",
        marks: 5,
        hasTable: true,
        tableConfig: {
          title: "Professional Society Memberships",
          columns: [
            { field: "sn_6_1_1", header: "S.N.", placeholder: "Serial Number" },
            { field: "faculty_name_6_1_1", header: "Name of the Faculty", placeholder: "" },
            { field: "society_name_6_1_1", header: "Name of the Professional Society / Body at National and International Level", placeholder: "" },
            { field: "grade_level_6_1_1", header: "Name of the Grade/Level/Position", placeholder: "" },
          ],
        },
      },
      {
        type: "heading",
        label: "6.1.2 Faculty as Resource Persons or Participants in STTPs/FDPs",
        marks: 15,
        description: "Total marks for this section: 15"
      },
      {
        name: "6.1.2.1_caym1",
        label: "6.1.2.1 Faculty as Resource Persons in STTPs/FDPs-CAYm1 (05)",
        marks: 5,
        hasTable: true,
        tableConfig: {
          title: "Table No. 6.1.2.1.1: List of faculty members as resource person in STTP/FDP events - CAYm1",
          columns: [
            { field: "sn_6_1_2_1", header: "S.N.", placeholder: "Serial Number" },
            { field: "faculty_name_6_1_2_1", header: "Name of the Faculty as Resource Person", placeholder: "" },
            { field: "sttp_fdp_name_6_1_2_1", header: "Name of the STTP/FDP", placeholder: "" },
            { field: "date_6_1_2_1", header: "Date", placeholder: "", type: "date" },
            { field: "location_6_1_2_1", header: "Location", placeholder: "" },
            { field: "organized_by_6_1_2_1", header: "Organized by", placeholder: "" },
          ],
        },
      },
      {
        name: "6.1.2.1_caym2",
        label: "6.1.2.1 Faculty as Resource Persons in STTPs/FDPs-CAYm2 (05)",
        marks: 5,
        hasTable: true,
        tableConfig: {
          title: "Table No. 6.1.2.1.2: List of faculty members as resource person in STTP/FDP events - CAYm2",
          columns: [
            { field: "sn_6_1_2_1", header: "S.N.", placeholder: "Serial Number" },
            { field: "faculty_name_6_1_2_1", header: "Name of the Faculty as Resource Person", placeholder: "" },
            { field: "sttp_fdp_name_6_1_2_1", header: "Name of the STTP/FDP", placeholder: "" },
            { field: "date_6_1_2_1", header: "Date", placeholder: "", type: "date" },
            { field: "location_6_1_2_1", header: "Location", placeholder: "" },
            { field: "organized_by_6_1_2_1", header: "Organized by", placeholder: "" },
          ],
        },
      },
      {
        name: "6.1.2.1_caym3",
        label: "6.1.2.1 Faculty as Resource Persons in STTPs/FDPs-CAYm3 (05)",
        marks: 5,
        hasTable: true,
        tableConfig: {
          title: "Table No. 6.1.2.1.3: List of faculty members as resource person in STTP/FDP events - CAYm3",
          columns: [
            { field: "sn_6_1_2_1", header: "S.N.", placeholder: "Serial Number" },
            { field: "faculty_name_6_1_2_1", header: "Name of the Faculty as Resource Person", placeholder: "" },
            { field: "sttp_fdp_name_6_1_2_1", header: "Name of the STTP/FDP", placeholder: "" },
            { field: "date_6_1_2_1", header: "Date", placeholder: "", type: "date" },
            { field: "location_6_1_2_1", header: "Location", placeholder: "" },
            { field: "organized_by_6_1_2_1", header: "Organized by", placeholder: "" },
          ],
        },
      },
      {
        name: "6.1.2.2",
        label: "6.1.2.2 Faculty Members' Participation in STTPs/FDPs (10)",
        marks: 10,
        hasTable: true,
        tableConfig: {
          title: "Table No. 6.1.2.2.1: List of faculty members participated in STTP/FDP events",
          description: "Note: A Faculty scores maximum five points for participation",
          columns: [
            { field: "sn_6_1_2_2", header: "S.N.", placeholder: "Serial Number" },
            { field: "faculty_name_6_1_2_2", header: "Name of the Faculty as Resource Person or Participant", placeholder: "" },
            { field: "caym1_6_1_2_2", header: "CAYm1", placeholder: "Points" },
            { field: "caym2_6_1_2_2", header: "CAYm2", placeholder: "Points" },
            { field: "caym3_6_1_2_2", header: "CAYm3", placeholder: "Points" },
          ],
        },
      },
      {
        name: "6.1.3",
        label: "6.1.3 Faculty Certifications of MOOCs through SWAYAM, etc",
        marks: 10,
        hasTable: true,
        tableConfig: {
          title: "MOOC Certifications",
          columns: [
            { field: "sn_6_1_3", header: "S.N.", placeholder: "Serial Number" },
            { field: "faculty_name_6_1_3", header: "Name of the Faculty", placeholder: "" },
            { field: "course_name_6_1_3", header: "Name of the Course Passed", placeholder: "" },
            { field: "offered_by_6_1_3", header: "Course Offered by (agency)", placeholder: "E.g., SWAYAM, NPTEL" },
            { field: "grade_6_1_3", header: "Grade obtained if any", placeholder: "" },
            
          ],
        },
      },
      {
        name: "6.1.4_caym1",
        label: "6.1.4 FDP/STTP Organized by the Department-CAYm1",
        marks: 10,
        hasTable: true,
        tableConfig: {
          title: "FDP/STTP Organized by Department - CAYm1",
          columns: [
            { field: "sn_6_1_4", header: "S.N.", placeholder: "Serial Number" },
            { field: "program_name_6_1_4", header: "Name of the Program", placeholder: "" },
            { field: "program_date_6_1_4", header: "Date of the Program", placeholder: "DD/MM/YYYY", type: "date" },
            { field: "program_duration_6_1_4", header: "Duration of the Program", placeholder: "E.g., 1 week" },
            { field: "speaker_details_6_1_4", header: "Name of the Speaker & Designation and Organization", placeholder: "" },
            { field: "attendees_count_6_1_4", header: "No. of People Attended", placeholder: "" },
          ],
        },
      },
      {
        name: "6.1.4_caym2",
        label: "6.1.4 FDP/STTP Organized by the Department-CAYm2",
        marks: 10,
        hasTable: true,
        tableConfig: {
          title: "FDP/STTP Organized by Department - CAYm2",
          columns: [
            { field: "sn_6_1_4", header: "S.N.", placeholder: "Serial Number" },
            { field: "program_name_6_1_4", header: "Name of the Program", placeholder: "" },
            { field: "program_date_6_1_4", header: "Date of the Program", placeholder: "DD/MM/YYYY", type: "date" },
            { field: "program_duration_6_1_4", header: "Duration of the Program", placeholder: "E.g., 1 week" },
            { field: "speaker_details_6_1_4", header: "Name of the Speaker & Designation and Organization", placeholder: "" },
            { field: "attendees_count_6_1_4", header: "No. of People Attended", placeholder: "" },
          ],
        },
      },
      {
        name: "6.1.4_caym3",
        label: "6.1.4 FDP/STTP Organized by the Department-CAYm3",
        marks: 10,
        hasTable: true,
        tableConfig: {
          title: "FDP/STTP Organized by Department - CAYm3",
          columns: [
            { field: "sn_6_1_4", header: "S.N.", placeholder: "Serial Number" },
            { field: "program_name_6_1_4", header: "Name of the Program", placeholder: "" },
            { field: "program_date_6_1_4", header: "Date of the Program", placeholder: "DD/MM/YYYY", type: "date" },
            { field: "program_duration_6_1_4", header: "Duration of the Program", placeholder: "E.g., 1 week" },
            { field: "speaker_details_6_1_4", header: "Name of the Speaker & Designation and Organization", placeholder: "" },
            { field: "attendees_count_6_1_4", header: "No. of People Attended", placeholder: "" },
          ],
        },
      },
      {
        name: "6.1.5_caym1",
        label: "6.1.5 Faculty Support in Student Innovative Projects-CAYm1",
        marks: 10,
        hasTable: true,
        tableConfig: {
          title: "Faculty Support in Student Projects - CAYm1",
          columns: [
            { field: "sn_6_1_5", header: "S.N.", placeholder: "Serial Number" },
            { field: "faculty_name_6_1_5", header: "Name of the Faculty", placeholder: "" },
            { field: "project_name_6_1_5", header: "Name of the Project/Initiative/Event", placeholder: "" },
            { field: "event_date_6_1_5", header: "Date of Event", placeholder: "DD/MM/YYYY", type: "date" },
            { field: "event_place_6_1_5", header: "Place of Event", placeholder: "" },
            { field: "website_link_6_1_5", header: "Website Link if any", placeholder: "http://..." },
          ],
        },
      },
      {
        name: "6.1.5_caym2",
        label: "6.1.5 Faculty Support in Student Innovative Projects-CAYm2",
        marks: 10,
        hasTable: true,
        tableConfig: {
          title: "Faculty Support in Student Projects - CAYm2",
          columns: [
            { field: "sn_6_1_5", header: "S.N.", placeholder: "Serial Number" },
            { field: "faculty_name_6_1_5", header: "Name of the Faculty", placeholder: "" },
            { field: "project_name_6_1_5", header: "Name of the Project/Initiative/Event", placeholder: "" },
            { field: "event_date_6_1_5", header: "Date of Event", placeholder: "DD/MM/YYYY", type: "date" },
            { field: "event_place_6_1_5", header: "Place of Event", placeholder: "" },
            { field: "website_link_6_1_5", header: "Website Link if any", placeholder: "http://..." },
          ],
        },
      },
      {
        name: "6.1.5_caym3",
        label: "6.1.5 Faculty Support in Student Innovative Projects-CAYm3",
        marks: 10,
        hasTable: true,
        tableConfig: {
          title: "Faculty Support in Student Projects - CAYm3",
          columns: [
            { field: "sn_6_1_5", header: "S.N.", placeholder: "Serial Number" },
            { field: "faculty_name_6_1_5", header: "Name of the Faculty", placeholder: "" },
            { field: "project_name_6_1_5", header: "Name of the Project/Initiative/Event", placeholder: "" },
            { field: "event_date_6_1_5", header: "Date of Event", placeholder: "DD/MM/YYYY", type: "date" },
            { field: "event_place_6_1_5", header: "Place of Event", placeholder: "" },
            { field: "website_link_6_1_5", header: "Website Link if any", placeholder: "http://..." },
          ],
        },
      },
      {
        name: "6.1.6",
        label: "6.1.6 Faculty Internship/training/Collaboration with Industry",
        marks: 10,
        hasTable: true,
        tableConfig: {
          title: "Industry Collaboration",
          columns: [
            { field: "sn_6_1_6", header: "S.N.", placeholder: "Serial Number" },
            { field: "faculty_name_6_1_6", header: "Name of the Faculty", placeholder: "" },
            { field: "collaboration_name_6_1_6", header: "Name of the Internship/Training/Collaboration", placeholder: "" },
            { field: "company_details_6_1_6", header: "Name of the Company & Place", placeholder: "" },
            { field: "duration_6_1_6", header: "Duration", placeholder: "E.g., 3 months" },
            { field: "outcomes_6_1_6", header: "Outcomes of Internship/Training/Collaboration", placeholder: "" },
          ],
        },
      },
    ],
  };

  useEffect(() => {
    const loadData = async () => {
      if (!nba_criteria_sub_level2_id) {
        // Initialize empty filesByField structure
        const emptyFilesByField = {};
        Object.keys(emptyTableData).forEach(fieldName => {
          emptyFilesByField[fieldName] = [{
            id: `file-${Date.now()}-${fieldName}-0`,
            description: "",
            file: null,
            filename: "",
            s3Url: "",
            uploading: false
          }];
        });
        
        setInitialData({ content: {}, tableData: emptyTableData, filesByField: emptyFilesByField });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        console.log("🎯 Criterion6_1Form - Loading data with:");
        console.log("  - otherStaffId prop:", otherStaffId);
        console.log("  - nba_criteria_sub_level2_id:", nba_criteria_sub_level2_id);
        console.log("  - professionalDevelopmentId:", professionalDevelopmentId);
        console.log("  - editMode:", editMode);

        let staffId = otherStaffId;
        if (!staffId) {
          const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
          const userInfoo = JSON.parse(localStorage.getItem("userInfo") || "{}");
          staffId = userInfo?.rawData?.other_staff_id || userInfo.user_id || userInfoo?.other_staff_id;
          console.log("🎯 Criterion6_1Form - Fallback staffId from localStorage:", staffId);
        } else {
          console.log("🎯 Criterion6_1Form - Using otherStaffId prop:", staffId);
        }

        if (!staffId) {
          console.log("❌ Criterion6_1Form - No staffId found, using empty data");
          setInitialData({ content: {}, tableData: emptyTableData, files: [] });
          setLoading(false);
          return;
        }

        console.log("📡 Criterion6_1Form - Making API call with staffId:", staffId);
        const response = await newnbaCriteria6Service.getCriteria6_1_Data(
          nba_criteria_sub_level2_id,
          staffId
        );
        console.log("📊 Criterion6_1Form - API Response:", response);

        const dataItem = Array.isArray(response) ? response[0] : response;

        if (dataItem) {
          const transformTableFromBackend = (tableRows, columnConfig) => {
            if (!Array.isArray(tableRows) || !Array.isArray(columnConfig)) {
              return [];
            }
            return tableRows.map(row => {
              const newRow = {};
              columnConfig.forEach((col, index) => {
                newRow[col.field] = row[`value${index + 1}`] || "";
              });
              return newRow;
            });
          };

          // Separate data by CAY identifier
          const separateDataByCay = (tableRows, columnConfig) => {
            if (!Array.isArray(tableRows) || !Array.isArray(columnConfig)) {
              return { caym1: [], caym2: [], caym3: [] };
            }
            
            const caym1Data = tableRows.filter(row => row.cay_identifier === "CAYm1");
            const caym2Data = tableRows.filter(row => row.cay_identifier === "CAYm2");
            const caym3Data = tableRows.filter(row => row.cay_identifier === "CAYm3");
            
            return {
              caym1: transformTableFromBackend(caym1Data, columnConfig),
              caym2: transformTableFromBackend(caym2Data, columnConfig),
              caym3: transformTableFromBackend(caym3Data, columnConfig)
            };
          };

          // Separate CAY data for fields that have multiple CAY sections
          const resourcePersonsData = separateDataByCay(dataItem.resource_persons_table, sectionConfig.fields.find(f => f.name === "6.1.2.1_caym1")?.tableConfig?.columns);
          const developmentProgramsData = separateDataByCay(dataItem.development_programs_table, sectionConfig.fields.find(f => f.name === "6.1.4_caym1")?.tableConfig?.columns);
          const innovationProjectsData = separateDataByCay(dataItem.innovation_projects_table, sectionConfig.fields.find(f => f.name === "6.1.5_caym1")?.tableConfig?.columns);

          const tableData = {
            "6.1.1": transformTableFromBackend(dataItem.profession_societies_table, sectionConfig.fields.find(f => f.name === "6.1.1")?.tableConfig?.columns),
            "6.1.2.1_caym1": resourcePersonsData.caym1,
            "6.1.2.1_caym2": resourcePersonsData.caym2,
            "6.1.2.1_caym3": resourcePersonsData.caym3,
            "6.1.2.2": transformTableFromBackend(dataItem.faculty_participated_table, sectionConfig.fields.find(f => f.name === "6.1.2.2")?.tableConfig?.columns),
            "6.1.3": transformTableFromBackend(dataItem.moocs_table, sectionConfig.fields.find(f => f.name === "6.1.3")?.tableConfig?.columns),
            "6.1.4_caym1": developmentProgramsData.caym1,
            "6.1.4_caym2": developmentProgramsData.caym2,
            "6.1.4_caym3": developmentProgramsData.caym3,
            "6.1.5_caym1": innovationProjectsData.caym1,
            "6.1.5_caym2": innovationProjectsData.caym2,
            "6.1.5_caym3": innovationProjectsData.caym3,
            "6.1.6": transformTableFromBackend(dataItem.undergone_internships_table, sectionConfig.fields.find(f => f.name === "6.1.6")?.tableConfig?.columns),
          };

          // Separate files by description pattern and map to field names
          const separateFilesByDescription = (files, baseFieldName) => {
            if (!Array.isArray(files)) return { caym1: [], caym2: [], caym3: [] };
            
            const caym1Files = files.filter(file =>
              file.description === baseFieldName ||
              file.description === `${baseFieldName}`
            );
            const caym2Files = files.filter(file =>
              file.description === `${baseFieldName}-m2` ||
              file.description === `${baseFieldName}m2`
            );
            const caym3Files = files.filter(file =>
              file.description === `${baseFieldName}-m3` ||
              file.description === `${baseFieldName}m3`
            );
            
            return {
              caym1: caym1Files.map(file => ({ ...file, fieldName: `${baseFieldName}_caym1` })),
              caym2: caym2Files.map(file => ({ ...file, fieldName: `${baseFieldName}_caym2` })),
              caym3: caym3Files.map(file => ({ ...file, fieldName: `${baseFieldName}_caym3` }))
            };
          };

          const mapFilesToField = (files, fieldName) => {
            return (files || []).map(file => ({ ...file, fieldName }));
          };

          // Separate CAY files by description
          const resourcePersonsFiles = separateFilesByDescription(dataItem.faculty_resource_document, "6.1.2.1");
          const developmentProgramsFiles = separateFilesByDescription(dataItem.organized_department_document, "6.1.4");
          const innovationProjectsFiles = separateFilesByDescription(dataItem.faculty_support_document, "6.1.5");

          const files = [
            ...mapFilesToField(dataItem.professional_development_document, "6.1.1"),
            ...resourcePersonsFiles.caym1,
            ...resourcePersonsFiles.caym2,
            ...resourcePersonsFiles.caym3,
            ...mapFilesToField(dataItem.members_participation_document, "6.1.2.2"),
            ...mapFilesToField(dataItem.faculty_certification_document, "6.1.3"),
            ...developmentProgramsFiles.caym1,
            ...developmentProgramsFiles.caym2,
            ...developmentProgramsFiles.caym3,
            ...innovationProjectsFiles.caym1,
            ...innovationProjectsFiles.caym2,
            ...innovationProjectsFiles.caym3,
            ...mapFilesToField(dataItem.faculty_internship_document, "6.1.6"),
          ];

          // Organize files by field name for GenericCriteriaForm
          const filesByField = {};
          
          // Initialize all field names with empty arrays
          Object.keys(emptyTableData).forEach(fieldName => {
            filesByField[fieldName] = [];
          });
          
          // Add files to their respective field arrays
          files.forEach((file, i) => {
            const fieldName = file.fieldName;
            if (fieldName && filesByField[fieldName] !== undefined) {
              filesByField[fieldName].push({
                ...file,
                id: file.id || `file-${i}`,
                url: file.url || file.s3Url || ""
              });
            }
          });
          
          // Ensure each field has at least one empty slot if no files
          Object.keys(filesByField).forEach(fieldName => {
            if (filesByField[fieldName].length === 0) {
              filesByField[fieldName].push({
                id: `file-${Date.now()}-${fieldName}-0`,
                description: "",
                file: null,
                filename: "",
                s3Url: "",
                uploading: false
              });
            }
          });

          setInitialData({
            content: {}, // No simple content fields in 6.1
            tableData: tableData,
            filesByField: filesByField
          });

          if (dataItem.professional_development_id) {
            setCurrentProfessionalDevelopmentId(dataItem.professional_development_id);
          }

          if (dataItem.approval_status) {
            setApprovalStatus({
              status: dataItem.approval_status,
              rejectionReason: dataItem.rejection_reason,
              approvalReason: dataItem.approval_status === 'APPROVED' ? dataItem.rejection_reason : null,
              approvedByName: dataItem.approved_by_name
            });
          }
        } else {
          setInitialData({ content: {}, tableData: emptyTableData, files: [] });
        }
      } catch (err) {
        toast.error("Failed to load saved data");
        setInitialData({ content: {}, tableData: emptyTableData, files: [] });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [nba_accredited_program_id, nba_criteria_sub_level2_id, nba_contributor_allocation_id, otherStaffId]);

  const handleSave = async (data) => {
    if (!isContributorEditable && userRole.nba_contributor === true) {
      setAlertMessage("You don't have permission to edit");
      setShowErrorAlert(true);
      return;
    }

    setSaveLoading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
      const userInfo2 = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const staffIdToUse = otherStaffId || userInfo?.rawData?.other_staff_id || userInfo.user_id || userInfo2?.other_staff_id;

      if (!staffIdToUse) {
        throw new Error("Staff ID not found");
      }

      const extractFiles = (fieldKey, cayIdentifier = null) => (data.filesByField?.[fieldKey] || []).map(file => ({
        description: file.description || "",
        filename: file.filename || "",
        url: file.s3Url || file.url || "",
        ...(cayIdentifier && { cay_identifier: cayIdentifier })
      }));

      const transformTableData = (tableRows, columnConfig, cayIdentifier = null) => {
        if (!Array.isArray(tableRows) || !Array.isArray(columnConfig)) {
          return [];
        }
        return tableRows.map(row => {
          const newRow = {};
          columnConfig.forEach((col, index) => {
            // Use `col.field` to get the original key from the row object
            // The backend expects keys like "value1", "value2", ...
            newRow[`value${index + 1}`] = row[col.field] || "";
          });
          // Add CAY identifier if provided
          if (cayIdentifier) {
            newRow.cay_identifier = cayIdentifier;
          }
          return newRow;
        });
      };

      // Combine data from multiple CAY fields for backend with identifiers
      const combineTableDataWithIdentifiers = (fieldPrefix, columnConfig) => {
        const caym1Data = transformTableData(data.tableData?.[`${fieldPrefix}_caym1`] || [], columnConfig, "CAYm1");
        const caym2Data = transformTableData(data.tableData?.[`${fieldPrefix}_caym2`] || [], columnConfig, "CAYm2");
        const caym3Data = transformTableData(data.tableData?.[`${fieldPrefix}_caym3`] || [], columnConfig, "CAYm3");
        return [...caym1Data, ...caym2Data, ...caym3Data];
      };

      const combineFileData = (fieldPrefix) => {
        const caym1Files = extractFiles(`${fieldPrefix}_caym1`, "CAYm1");
        const caym2Files = extractFiles(`${fieldPrefix}_caym2`, "CAYm2");
        const caym3Files = extractFiles(`${fieldPrefix}_caym3`, "CAYm3");
        return [...caym1Files, ...caym2Files, ...caym3Files];
      };

      // Backend expects snake_case keys for tables and documents — send matching names
      const payload = {
        other_staff_id: staffIdToUse,
        cycle_sub_category_id: nba_criteria_sub_level2_id,
        profession_societies_table: transformTableData(data.tableData?.["6.1.1"] || [], sectionConfig.fields.find(f => f.name === "6.1.1")?.tableConfig?.columns),
        resource_persons_table: combineTableDataWithIdentifiers("6.1.2.1", sectionConfig.fields.find(f => f.name === "6.1.2.1_caym1")?.tableConfig?.columns),
        faculty_participated_table: transformTableData(data.tableData?.["6.1.2.2"] || [], sectionConfig.fields.find(f => f.name === "6.1.2.2")?.tableConfig?.columns),
        moocs_table: transformTableData(data.tableData?.["6.1.3"] || [], sectionConfig.fields.find(f => f.name === "6.1.3")?.tableConfig?.columns),
        development_programs_table: combineTableDataWithIdentifiers("6.1.4", sectionConfig.fields.find(f => f.name === "6.1.4_caym1")?.tableConfig?.columns),
        innovation_projects_table: combineTableDataWithIdentifiers("6.1.5", sectionConfig.fields.find(f => f.name === "6.1.5_caym1")?.tableConfig?.columns),
        undergone_internships_table: transformTableData(data.tableData?.["6.1.6"] || [], sectionConfig.fields.find(f => f.name === "6.1.6")?.tableConfig?.columns),
        professional_development_document: extractFiles("6.1.1"),
        faculty_resource_document: combineFileData("6.1.2.1"),
        members_participation_document: extractFiles("6.1.2.2"),
        faculty_certification_document: extractFiles("6.1.3"),
        organized_department_document: combineFileData("6.1.4"),
        faculty_support_document: combineFileData("6.1.5"),
        faculty_internship_document: extractFiles("6.1.6"),
      };

      let saveResponse;
      const hasExistingEntry = currentProfessionalDevelopmentId || professionalDevelopmentId;

      if (hasExistingEntry) {
        const idToUse = currentProfessionalDevelopmentId || professionalDevelopmentId;
        // service has updateData6_1 (PUT) — call it with id and payload
        saveResponse = await newnbaCriteria6Service.updateData6_1(idToUse, payload);
      } else {
        saveResponse = await newnbaCriteria6Service.saveCriteria6_1_Data(payload);
      }

      setAlertMessage(hasExistingEntry ? "Data updated successfully!" : "Data saved successfully!");
      setShowSuccessAlert(true);

      // Refresh data
      const refreshed = await newnbaCriteria6Service.getCriteria6_1_Data(nba_criteria_sub_level2_id, staffIdToUse);
      const refreshedItem = Array.isArray(refreshed) ? refreshed[0] : refreshed;

      if (refreshedItem) {
        // Helper to transform refreshed table data from backend's valueN format to UI's field format
        const transformTableFromBackend = (tableRows, columnConfig) => {
          if (!Array.isArray(tableRows) || !Array.isArray(columnConfig)) {
            return [];
          }
          return tableRows.map(row => {
            const newRow = {};
            columnConfig.forEach((col, index) => {
              newRow[col.field] = row[`value${index + 1}`] || "";
            });
            return newRow;
          });
        };

        // Separate data by CAY identifier
        const separateDataByCay = (tableRows, columnConfig) => {
          if (!Array.isArray(tableRows) || !Array.isArray(columnConfig)) {
            return { caym1: [], caym2: [], caym3: [] };
          }
          
          const caym1Data = tableRows.filter(row => row.cay_identifier === "CAYm1");
          const caym2Data = tableRows.filter(row => row.cay_identifier === "CAYm2");
          const caym3Data = tableRows.filter(row => row.cay_identifier === "CAYm3");
          
          return {
            caym1: transformTableFromBackend(caym1Data, columnConfig),
            caym2: transformTableFromBackend(caym2Data, columnConfig),
            caym3: transformTableFromBackend(caym3Data, columnConfig)
          };
        };

        // Separate CAY data for fields that have multiple CAY sections
        const refreshedResourcePersonsData = separateDataByCay(refreshedItem.resource_persons_table, sectionConfig.fields.find(f => f.name === "6.1.2.1_caym1")?.tableConfig?.columns);
        const refreshedDevelopmentProgramsData = separateDataByCay(refreshedItem.development_programs_table, sectionConfig.fields.find(f => f.name === "6.1.4_caym1")?.tableConfig?.columns);
        const refreshedInnovationProjectsData = separateDataByCay(refreshedItem.innovation_projects_table, sectionConfig.fields.find(f => f.name === "6.1.5_caym1")?.tableConfig?.columns);

        const tableData = {
          "6.1.1": transformTableFromBackend(refreshedItem.profession_societies_table, sectionConfig.fields.find(f => f.name === "6.1.1")?.tableConfig?.columns),
          "6.1.2.1_caym1": refreshedResourcePersonsData.caym1,
          "6.1.2.1_caym2": refreshedResourcePersonsData.caym2,
          "6.1.2.1_caym3": refreshedResourcePersonsData.caym3,
          "6.1.2.2": transformTableFromBackend(refreshedItem.faculty_participated_table, sectionConfig.fields.find(f => f.name === "6.1.2.2")?.tableConfig?.columns),
          "6.1.3": transformTableFromBackend(refreshedItem.moocs_table, sectionConfig.fields.find(f => f.name === "6.1.3")?.tableConfig?.columns),
          "6.1.4_caym1": refreshedDevelopmentProgramsData.caym1,
          "6.1.4_caym2": refreshedDevelopmentProgramsData.caym2,
          "6.1.4_caym3": refreshedDevelopmentProgramsData.caym3,
          "6.1.5_caym1": refreshedInnovationProjectsData.caym1,
          "6.1.5_caym2": refreshedInnovationProjectsData.caym2,
          "6.1.5_caym3": refreshedInnovationProjectsData.caym3,
          "6.1.6": transformTableFromBackend(refreshedItem.undergone_internships_table, sectionConfig.fields.find(f => f.name === "6.1.6")?.tableConfig?.columns),
        };
        // Separate files by description pattern and map to field names
        const separateFilesByDescription = (files, baseFieldName) => {
          if (!Array.isArray(files)) return { caym1: [], caym2: [], caym3: [] };
          
          const caym1Files = files.filter(file =>
            file.description === baseFieldName ||
            file.description === `${baseFieldName}`
          );
          const caym2Files = files.filter(file =>
            file.description === `${baseFieldName}-m2` ||
            file.description === `${baseFieldName}m2`
          );
          const caym3Files = files.filter(file =>
            file.description === `${baseFieldName}-m3` ||
            file.description === `${baseFieldName}m3`
          );
          
          return {
            caym1: caym1Files.map(file => ({ ...file, fieldName: `${baseFieldName}_caym1` })),
            caym2: caym2Files.map(file => ({ ...file, fieldName: `${baseFieldName}_caym2` })),
            caym3: caym3Files.map(file => ({ ...file, fieldName: `${baseFieldName}_caym3` }))
          };
        };

        const mapFilesToField = (files, fieldName) => {
          return (files || []).map(file => ({ ...file, fieldName }));
        };

        // Separate CAY files by description
        const refreshedResourcePersonsFiles = separateFilesByDescription(refreshedItem.faculty_resource_document, "6.1.2.1");
        const refreshedDevelopmentProgramsFiles = separateFilesByDescription(refreshedItem.organized_department_document, "6.1.4");
        const refreshedInnovationProjectsFiles = separateFilesByDescription(refreshedItem.faculty_support_document, "6.1.5");

        const files = [
          ...mapFilesToField(refreshedItem.professional_development_document, "6.1.1"),
          ...refreshedResourcePersonsFiles.caym1,
          ...refreshedResourcePersonsFiles.caym2,
          ...refreshedResourcePersonsFiles.caym3,
          ...mapFilesToField(refreshedItem.members_participation_document, "6.1.2.2"),
          ...mapFilesToField(refreshedItem.faculty_certification_document, "6.1.3"),
          ...refreshedDevelopmentProgramsFiles.caym1,
          ...refreshedDevelopmentProgramsFiles.caym2,
          ...refreshedDevelopmentProgramsFiles.caym3,
          ...refreshedInnovationProjectsFiles.caym1,
          ...refreshedInnovationProjectsFiles.caym2,
          ...refreshedInnovationProjectsFiles.caym3,
          ...mapFilesToField(refreshedItem.faculty_internship_document, "6.1.6"),
        ];
        // Organize files by field name for GenericCriteriaForm
        const filesByField = {};
        
        // Initialize all field names with empty arrays
        Object.keys(emptyTableData).forEach(fieldName => {
          filesByField[fieldName] = [];
        });
        
        // Add files to their respective field arrays
        files.forEach((file, i) => {
          const fieldName = file.fieldName;
          if (fieldName && filesByField[fieldName] !== undefined) {
            filesByField[fieldName].push({
              ...file,
              id: file.id || `file-${i}`,
              url: file.url || file.s3Url || ""
            });
          }
        });
        
        // Ensure each field has at least one empty slot if no files
        Object.keys(filesByField).forEach(fieldName => {
          if (filesByField[fieldName].length === 0) {
            filesByField[fieldName].push({
              id: `file-${Date.now()}-${fieldName}-0`,
              description: "",
              file: null,
              filename: "",
              s3Url: "",
              uploading: false
            });
          }
        });

        setInitialData({
          content: {},
          tableData: tableData,
          filesByField: filesByField
        });
        if (refreshedItem.professional_development_id) {
          setCurrentProfessionalDevelopmentId(refreshedItem.professional_development_id);
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
      setAlertMessage(err.message || "Failed to save");
      setShowErrorAlert(true);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentProfessionalDevelopmentId) {
      setAlertMessage("No entry to delete");
      setShowErrorAlert(true);
      return;
    }
    setShowDeleteAlert(true);
  };

  const confirmDelete = async () => {
    setShowDeleteAlert(false);
    try {
      await newnbaCriteria6Service.deleteData6_1(currentProfessionalDevelopmentId);
      setAlertMessage("Entry deleted successfully!");
      setShowSuccessAlert(true);
      setInitialData({ content: {}, tableData: emptyTableData, files: [] });
      setCurrentProfessionalDevelopmentId(null);
      setApprovalStatus(null);
    } catch (error) {
      setAlertMessage(error.message || "Failed to delete entry");
      setShowErrorAlert(true);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-32 text-2xl text-indigo-600 font-medium">Loading {sectionConfig.title}...</div>;
  }

  return (
    <>
      {showDeleteAlert && (
        <SweetAlert
          warning
          showCancel
          confirmBtnText="Yes, delete it!"
          confirmBtnBsStyle="danger"
          title="Are you sure?"
          onConfirm={confirmDelete}
          onCancel={() => setShowDeleteAlert(false)}
          focusCancelBtn
          confirmBtnCssClass="btn-confirm"
          cancelBtnCssClass="btn-cancel"
        >
          You won't be able to revert this!
        </SweetAlert>
      )}

      {showSuccessAlert && (
        <SweetAlert
          success
          title="Success!"
          onConfirm={() => setShowSuccessAlert(false)}
          confirmBtnCssClass="btn-confirm"
        >
          {alertMessage}
        </SweetAlert>
      )}

      {showErrorAlert && (
        <SweetAlert
          error
          title="Error!"
          onConfirm={() => setShowErrorAlert(false)}
          confirmBtnCssClass="btn-confirm"
        >
          {alertMessage}
        </SweetAlert>
      )}

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
        onDelete={currentProfessionalDevelopmentId ? handleDelete : null}
        isCompleted={completed}
        isContributorEditable={isContributorEditable}
        saving={saveLoading}
        hasExistingData={!!currentProfessionalDevelopmentId}
      />
    </div>
    </>
  );
};

export default Criterion6_1Form;