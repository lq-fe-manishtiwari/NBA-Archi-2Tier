import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import SweetAlert from 'react-bootstrap-sweetalert';
import GenericCriteriaForm from "../GenericCriteriaForm";
import StatusBadge from "../StatusBadge";
import { newnbaCriteria6Service } from "../../Services/NewNBA-Criteria6.service";

const Criterion6_2Form = ({
  nba_accredited_program_id,
  academic_year,
  nba_criteria_sub_level2_id,
  contributor_allocation_id: nba_contributor_allocation_id,
  completed = false,
  isContributorEditable = true,
  otherStaffId = null, // For coordinator viewing specific contributor's data
  editMode = false, // For editing existing entries
  developmentActivitiesId = null, // For PUT operations
}) => {
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState(null);
  const [currentDevelopmentActivitiesId, setCurrentDevelopmentActivitiesId] = useState(developmentActivitiesId);
  const [userRole, setUserRole] = useState("");
  const [calculatedTotals, setCalculatedTotals] = useState({
    "6.2.3": 0,
    "6.2.4": 0,
    "6.2.5": 0
  });
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const roles = userInfo || {};
    setUserRole(roles);
  }, []);

  // Function to calculate totals for CAY sections
  const calculateTotals = (tableData) => {
    const totals = {
      "6.2.3": 0,
      "6.2.4": 0,
      "6.2.5": 0
    };

    // Calculate 6.2.3 totals (Sponsored Research Project)
    const calculate623Total = () => {
      let total = 0;
      ["6.2.3_caym1", "6.2.3_caym2", "6.2.3_caym3"].forEach(section => {
        const sectionData = tableData[section] || [];
        sectionData.forEach(row => {
          const amount = parseFloat(row.amount_6_2_3 || 0);
          if (!isNaN(amount)) total += amount;
        });
      });
      return total;
    };

    // Calculate 6.2.4 totals (Consultancy Work)
    const calculate624Total = () => {
      let total = 0;
      ["6.2.4_caym1", "6.2.4_caym2", "6.2.4_caym3"].forEach(section => {
        const sectionData = tableData[section] || [];
        sectionData.forEach(row => {
          const amount = parseFloat(row.amount_6_2_4 || 0);
          if (!isNaN(amount)) total += amount;
        });
      });
      return total;
    };

    // Calculate 6.2.5 totals (Institution Seed Money)
    const calculate625Total = () => {
      let total = 0;
      ["6.2.5_caym1", "6.2.5_caym2", "6.2.5_caym3"].forEach(section => {
        const sectionData = tableData[section] || [];
        sectionData.forEach(row => {
          const amountLacs = parseFloat(row.amount_lacs_6_2_5 || 0);
          const amountUtilized = parseFloat(row.amount_utilized_6_2_5 || 0);
          if (!isNaN(amountLacs)) total += amountLacs;
          if (!isNaN(amountUtilized)) total += amountUtilized;
        });
      });
      return total;
    };

    totals["6.2.3"] = calculate623Total();
    totals["6.2.4"] = calculate624Total();
    totals["6.2.5"] = calculate625Total();

    return totals;
  };

  // Update calculated totals whenever table data changes
  useEffect(() => {
    if (initialData && initialData.tableData) {
      const newTotals = calculateTotals(initialData.tableData);
      setCalculatedTotals(newTotals);
    }
  }, [initialData]);


  // Manual refresh function for calculations
  const refreshCalculations = () => {
    if (initialData && initialData.tableData) {
      const newTotals = calculateTotals(initialData.tableData);
      setCalculatedTotals(newTotals);
    }
  };

  // Component to display totals
  const TotalsSummary = ({ totals }) => (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">Σ</span>
          Amount Summary 
        </h3>
        <button
          onClick={refreshCalculations}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Refresh Totals
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 border border-blue-100">
          <div className="text-sm text-gray-600 mb-1">6.2.3 Sponsored Research</div>
          <div className="text-2xl font-bold text-blue-600">₹{totals["6.2.3"].toFixed(2)} Lacs</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-blue-100">
          <div className="text-sm text-gray-600 mb-1">6.2.4 Consultancy Work</div>
          <div className="text-2xl font-bold text-green-600">₹{totals["6.2.4"].toFixed(2)} Lacs</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-blue-100">
          <div className="text-sm text-gray-600 mb-1">6.2.5 Institution Seed Money</div>
          <div className="text-2xl font-bold text-purple-600">₹{totals["6.2.5"].toFixed(2)} Lacs</div>
        </div>
      </div>
     
    </div>
  );

  const emptyTableData = {
    "6.2.1": [
      {
        sn_6_2_1: "1",
        item_6_2_1: "No. of peer reviewed journal papers published",
        caym1_6_2_1: "",
        caym2_6_2_1: "",
        caym3_6_2_1: "",
      },
      {
        sn_6_2_1: "2",
        item_6_2_1: "No. of peer reviewed conference papers published",
        caym1_6_2_1: "",
        caym2_6_2_1: "",
        caym3_6_2_1: "",
      },
      {
        sn_6_2_1: "3",
        item_6_2_1: "No. of books/book chapters published",
        caym1_6_2_1: "",
        caym2_6_2_1: "",
        caym3_6_2_1: "",
      },
    ],
    "6.2.2": [],
    "6.2.3_caym1": [],
    "6.2.3_caym2": [],
    "6.2.3_caym3": [],
    "6.2.4_caym1": [],
    "6.2.4_caym2": [],
    "6.2.4_caym3": [],
    "6.2.5_caym1": [],
    "6.2.5_caym2": [],
    "6.2.5_caym3": [],
  };

  const sectionConfig = {
    title: "6.2. Research and Development Activities",
    totalMarks: 60,
    fields: [
      {
        name: "6.2.1",
        label: "6.2.1 Academic Research (15)",
        marks: 15,
        hasTable: true,
        tableConfig: {
          title: "Table No. 6.2.1.1: Faculty publication details",
          columns: [
            { field: "sn_6_2_1", header: "S.N.", placeholder: "Serial Number", readonly: true },
            { field: "item_6_2_1", header: "Item", placeholder: "", readonly: true },
            { field: "caym1_6_2_1", header: "CAYm1", placeholder: "" },
            { field: "caym2_6_2_1", header: "CAYm2", placeholder: "" },
            { field: "caym3_6_2_1", header: "CAYm3", placeholder: "" },
          ],
        },
      },
      {
        name: "6.2.2",
        label: "6.2.2 Development Activities (10)",
        marks: 10,
        type: "textarea",
        placeholder: "Enter development activities details..."
      },
      {
        type: "heading",
        label: "6.2.3 Sponsored Research Project (15)",
        marks: 15,
        description: "List of sponsored research projects received from external agencies"
      },
      {
        name: "6.2.3_caym1",
        label: "6.2.3 Sponsored Research Project - CAYm1",
        marks: 5,
        hasTable: true,
        tableConfig: {
          title: "Table No. 6.2.3.1: List of sponsored research projects - CAYm1",
          columns: [
            { field: "sn_6_2_3", header: "S.N.", placeholder: "Serial Number" },
            { field: "pi_name_6_2_3", header: "PI name", placeholder: "" },
            { field: "co_pi_names_6_2_3", header: "Co-PI names if any", placeholder: "" },
            { field: "dept_name_6_2_3", header: "Name of the Dept., where project is sanctioned", placeholder: "" },
            { field: "project_title_6_2_3", header: "Project title", placeholder: "" },
            { field: "funding_agency_6_2_3", header: "Name of the Funding agency", placeholder: "" },
            { field: "duration_6_2_3", header: "Duration of the project", placeholder: "" },
            { field: "amount_6_2_3", header: "Amount (Lacs)", placeholder: "" },
          ],
        },
      },
      {
        name: "6.2.3_caym2",
        label: "6.2.3 Sponsored Research Project - CAYm2",
        marks: 5,
        hasTable: true,
        tableConfig: {
          title: "Table No. 6.2.3.2: List of sponsored research projects - CAYm2",
          columns: [
            { field: "sn_6_2_3", header: "S.N.", placeholder: "Serial Number" },
            { field: "pi_name_6_2_3", header: "PI name", placeholder: "" },
            { field: "co_pi_names_6_2_3", header: "Co-PI names if any", placeholder: "" },
            { field: "dept_name_6_2_3", header: "Name of the Dept., where project is sanctioned", placeholder: "" },
            { field: "project_title_6_2_3", header: "Project title", placeholder: "" },
            { field: "funding_agency_6_2_3", header: "Name of the Funding agency", placeholder: "" },
            { field: "duration_6_2_3", header: "Duration of the project", placeholder: "" },
            { field: "amount_6_2_3", header: "Amount (Lacs)", placeholder: "" },
          ],
        },
      },
      {
        name: "6.2.3_caym3",
        label: "6.2.3 Sponsored Research Project - CAYm3",
        marks: 5,
        hasTable: true,
        tableConfig: {
          title: "Table No. 6.2.3.3: List of sponsored research projects - CAYm3",
          columns: [
            { field: "sn_6_2_3", header: "S.N.", placeholder: "Serial Number" },
            { field: "pi_name_6_2_3", header: "PI name", placeholder: "" },
            { field: "co_pi_names_6_2_3", header: "Co-PI names if any", placeholder: "" },
            { field: "dept_name_6_2_3", header: "Name of the Dept., where project is sanctioned", placeholder: "" },
            { field: "project_title_6_2_3", header: "Project title", placeholder: "" },
            { field: "funding_agency_6_2_3", header: "Name of the Funding agency", placeholder: "" },
            { field: "duration_6_2_3", header: "Duration of the project", placeholder: "" },
            { field: "amount_6_2_3", header: "Amount (Lacs)", placeholder: "" },
          ],
        },
      },
      {
        type: "heading",
        label: "6.2.4 Consultancy Work (15)",
        marks: 15,
        description: "List of consultancy projects received from external agencies"
      },
      {
        name: "6.2.4_caym1",
        label: "6.2.4 Consultancy Work - CAYm1",
        marks: 5,
        hasTable: true,
        tableConfig: {
          title: "Table No. 6.2.4.1: List of consultancy projects - CAYm1",
          columns: [
            { field: "sn_6_2_4", header: "S.N.", placeholder: "Serial Number" },
            { field: "pi_name_6_2_4", header: "PI name", placeholder: "" },
            { field: "co_pi_names_6_2_4", header: "Co-PI names if any", placeholder: "" },
            { field: "dept_name_6_2_4", header: "Name of the Dept., where project is sanctioned", placeholder: "" },
            { field: "project_title_6_2_4", header: "Project title", placeholder: "" },
            { field: "funding_agency_6_2_4", header: "Name of the Funding agency", placeholder: "" },
            { field: "duration_6_2_4", header: "Duration of the project", placeholder: "" },
            { field: "amount_6_2_4", header: "Amount (Lacs)", placeholder: "" },
          ],
        },
      },
      {
        name: "6.2.4_caym2",
        label: "6.2.4 Consultancy Work - CAYm2",
        marks: 5,
        hasTable: true,
        tableConfig: {
          title: "Table No. 6.2.4.2: List of consultancy projects - CAYm2",
          columns: [
            { field: "sn_6_2_4", header: "S.N.", placeholder: "Serial Number" },
            { field: "pi_name_6_2_4", header: "PI name", placeholder: "" },
            { field: "co_pi_names_6_2_4", header: "Co-PI names if any", placeholder: "" },
            { field: "dept_name_6_2_4", header: "Name of the Dept., where project is sanctioned", placeholder: "" },
            { field: "project_title_6_2_4", header: "Project title", placeholder: "" },
            { field: "funding_agency_6_2_4", header: "Name of the Funding agency", placeholder: "" },
            { field: "duration_6_2_4", header: "Duration of the project", placeholder: "" },
            { field: "amount_6_2_4", header: "Amount (Lacs)", placeholder: "" },
          ],
        },
      },
      {
        name: "6.2.4_caym3",
        label: "6.2.4 Consultancy Work - CAYm3",
        marks: 5,
        hasTable: true,
        tableConfig: {
          title: "Table No. 6.2.4.3: List of consultancy projects - CAYm3",
          columns: [
            { field: "sn_6_2_4", header: "S.N.", placeholder: "Serial Number" },
            { field: "pi_name_6_2_4", header: "PI name", placeholder: "" },
            { field: "co_pi_names_6_2_4", header: "Co-PI names if any", placeholder: "" },
            { field: "dept_name_6_2_4", header: "Name of the Dept., where project is sanctioned", placeholder: "" },
            { field: "project_title_6_2_4", header: "Project title", placeholder: "" },
            { field: "funding_agency_6_2_4", header: "Name of the Funding agency", placeholder: "" },
            { field: "duration_6_2_4", header: "Duration of the project", placeholder: "" },
            { field: "amount_6_2_4", header: "Amount (Lacs)", placeholder: "" },
          ],
        },
      },
      {
        type: "heading",
        label: "6.2.5 Institution Seed Money or Internal Research Grant (05)",
        marks: 5,
        description: "List of faculty members received seed money or internal research grant from the Institution"
      },
      {
        name: "6.2.5_caym1",
        label: "6.2.5 Institution Seed Money - CAYm1",
        marks: 2,
        hasTable: true,
        tableConfig: {
          title: "Table No. 6.2.5.1: List of faculty members received seed money - CAYm1",
          columns: [
            { field: "sn_6_2_5", header: "S.N.", placeholder: "Serial Number" },
            { field: "faculty_name_6_2_5", header: "Faculty name", placeholder: "" },
            { field: "project_support_6_2_5", header: "Project Support Activity", placeholder: "" },
            { field: "title_6_2_5", header: "title/ for", placeholder: "" },
            { field: "duration_6_2_5", header: "Duration", placeholder: "" },
            { field: "amount_lacs_6_2_5", header: "Amount (Lacs)", placeholder: "" },
            { field: "amount_utilized_6_2_5", header: "Amount Utilized (Lacs)", placeholder: "" },
            { field: "outcomes_6_2_5", header: "Outcomes of the project", placeholder: "" },
          ],
        },
      },
      {
        name: "6.2.5_caym2",
        label: "6.2.5 Institution Seed Money - CAYm2",
        marks: 2,
        hasTable: true,
        tableConfig: {
          title: "Table No. 6.2.5.2: List of faculty members received seed money - CAYm2",
          columns: [
            { field: "sn_6_2_5", header: "S.N.", placeholder: "Serial Number" },
            { field: "faculty_name_6_2_5", header: "Faculty name", placeholder: "" },
            { field: "project_support_6_2_5", header: "Project Support Activity", placeholder: "" },
            { field: "title_6_2_5", header: "title/ for", placeholder: "" },
            { field: "duration_6_2_5", header: "Duration", placeholder: "" },
            { field: "amount_lacs_6_2_5", header: "Amount (Lacs)", placeholder: "" },
            { field: "amount_utilized_6_2_5", header: "Amount Utilized (Lacs)", placeholder: "" },
            { field: "outcomes_6_2_5", header: "Outcomes of the project", placeholder: "" },
          ],
        },
      },
      {
        name: "6.2.5_caym3",
        label: "6.2.5 Institution Seed Money - CAYm3",
        marks: 1,
        hasTable: true,
        tableConfig: {
          title: "Table No. 6.2.5.3: List of faculty members received seed money - CAYm3",
          columns: [
            { field: "sn_6_2_5", header: "S.N.", placeholder: "Serial Number" },
            { field: "faculty_name_6_2_5", header: "Faculty name", placeholder: "" },
            { field: "project_support_6_2_5", header: "Project Support Activity", placeholder: "" },
            { field: "title_6_2_5", header: "title/ for", placeholder: "" },
            { field: "duration_6_2_5", header: "Duration", placeholder: "" },
            { field: "amount_lacs_6_2_5", header: "Amount (Lacs)", placeholder: "" },
            { field: "amount_utilized_6_2_5", header: "Amount Utilized (Lacs)", placeholder: "" },
            { field: "outcomes_6_2_5", header: "Outcomes of the project", placeholder: "" },
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
        
        setInitialData({ content: { "6.2.2": "" }, tableData: emptyTableData, filesByField: emptyFilesByField });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        console.log("🎯 Criterion6_2Form - Loading data with:");
        console.log("  - otherStaffId prop:", otherStaffId);
        console.log("  - nba_criteria_sub_level2_id:", nba_criteria_sub_level2_id);
        console.log("  - developmentActivitiesId:", developmentActivitiesId);
        console.log("  - editMode:", editMode);

        let staffId = otherStaffId;
        if (!staffId) {
          const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
          const userInfoo = JSON.parse(localStorage.getItem("userInfo") || "{}");
          staffId = userInfo?.rawData?.other_staff_id || userInfo.user_id || userInfoo?.other_staff_id;
          console.log("🎯 Criterion6_2Form - Fallback staffId from localStorage:", staffId);
        } else {
          console.log("🎯 Criterion6_2Form - Using otherStaffId prop:", staffId);
        }

        if (!staffId) {
          console.log("❌ Criterion6_2Form - No staffId found, using empty data");
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
          setInitialData({ content: { "6.2.2": "" }, tableData: emptyTableData, filesByField: emptyFilesByField });
          setLoading(false);
          return;
        }

        console.log("📡 Criterion6_2Form - Making API call with staffId:", staffId);
        const response = await newnbaCriteria6Service.getCriteria6_2_Data(
          nba_criteria_sub_level2_id,
          staffId
        );
        console.log("📊 Criterion6_2Form - API Response:", response);

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
          const sponsoredResearchData = separateDataByCay(dataItem.sponsored_research_response, sectionConfig.fields.find(f => f.name === "6.2.3_caym1")?.tableConfig?.columns);
          const consultancyProjectsData = separateDataByCay(dataItem.consultancy_projects_table, sectionConfig.fields.find(f => f.name === "6.2.4_caym1")?.tableConfig?.columns);
          const membersReceivedData = separateDataByCay(dataItem.members_received_table, sectionConfig.fields.find(f => f.name === "6.2.5_caym1")?.tableConfig?.columns);

          const tableData = {
            "6.2.1": transformTableFromBackend(dataItem.compiled_list_table, sectionConfig.fields.find(f => f.name === "6.2.1")?.tableConfig?.columns),
            "6.2.3_caym1": sponsoredResearchData.caym1,
            "6.2.3_caym2": sponsoredResearchData.caym2,
            "6.2.3_caym3": sponsoredResearchData.caym3,
            "6.2.4_caym1": consultancyProjectsData.caym1,
            "6.2.4_caym2": consultancyProjectsData.caym2,
            "6.2.4_caym3": consultancyProjectsData.caym3,
            "6.2.5_caym1": membersReceivedData.caym1,
            "6.2.5_caym2": membersReceivedData.caym2,
            "6.2.5_caym3": membersReceivedData.caym3,
          };

          // Separate files by cay_identifier and map to field names
          const separateFilesByDescription = (files, baseFieldName) => {
            if (!Array.isArray(files)) return { caym1: [], caym2: [], caym3: [] };
            
            console.log(`🔍 DEBUG: separateFilesByDescription for ${baseFieldName}:`, files);
            
            // Handle both old description-based and new cay_identifier-based structures
            const caym1Files = files.filter(file => {
              const matchesDescription = file.description === baseFieldName || file.description === `${baseFieldName}`;
              const matchesCayIdentifier = file.cay_identifier === "CAYm1";
              return matchesDescription || matchesCayIdentifier;
            });
            
            const caym2Files = files.filter(file => {
              const matchesDescription = file.description === `${baseFieldName}-m2` || file.description === `${baseFieldName}m2`;
              const matchesCayIdentifier = file.cay_identifier === "CAYm2";
              return matchesDescription || matchesCayIdentifier;
            });
            
            const caym3Files = files.filter(file => {
              const matchesDescription = file.description === `${baseFieldName}-m3` || file.description === `${baseFieldName}m3`;
              const matchesCayIdentifier = file.cay_identifier === "CAYm3";
              return matchesDescription || matchesCayIdentifier;
            });
            

            
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
          const sponsoredResearchFiles = separateFilesByDescription(dataItem.funded_research_document, "6.2.3");
          const consultancyWorkFiles = separateFilesByDescription(dataItem.consultancy_work_document, "6.2.4");
          const institutionSeedFiles = separateFilesByDescription(dataItem.institution_seed_document, "6.2.5");

          const files = [
            ...mapFilesToField(dataItem.academic_research_document, "6.2.1"),
            ...mapFilesToField(dataItem.working_models_document, "6.2.2"),
            ...sponsoredResearchFiles.caym1,
            ...sponsoredResearchFiles.caym2,
            ...sponsoredResearchFiles.caym3,
            ...consultancyWorkFiles.caym1,
            ...consultancyWorkFiles.caym2,
            ...consultancyWorkFiles.caym3,
            ...institutionSeedFiles.caym1,
            ...institutionSeedFiles.caym2,
            ...institutionSeedFiles.caym3,
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
            content: {
              "6.2.2": dataItem.development_activities || ""
            },
            tableData: tableData,
            filesByField: filesByField
          });

          if (dataItem.development_activities_id) {
            setCurrentDevelopmentActivitiesId(dataItem.development_activities_id);
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
          setInitialData({ content: { "6.2.2": "" }, tableData: emptyTableData, filesByField: emptyFilesByField });
        }
      } catch (err) {
        toast.error("Failed to load saved data");
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
        setInitialData({ content: { "6.2.2": "" }, tableData: emptyTableData, filesByField: emptyFilesByField });
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
            newRow[`value${index + 1}`] = row[col.field] || "";
          });
          if (cayIdentifier) {
            newRow.cay_identifier = cayIdentifier;
          }
          return newRow;
        });
      };

      // Combine data from multiple CAY fields for backend with identifiers
      const combineTableDataWithIdentifiers = (fieldPrefix, columnConfig) => {
        console.log(`🔍 DEBUG: combineTableDataWithIdentifiers for ${fieldPrefix}`);
        console.log(`🔍 DEBUG: columnConfig:`, columnConfig);
        console.log(`🔍 DEBUG: data.tableData[${fieldPrefix}_caym1]:`, data.tableData?.[`${fieldPrefix}_caym1`]);
        console.log(`🔍 DEBUG: data.tableData[${fieldPrefix}_caym2]:`, data.tableData?.[`${fieldPrefix}_caym2`]);
        console.log(`🔍 DEBUG: data.tableData[${fieldPrefix}_caym3]:`, data.tableData?.[`${fieldPrefix}_caym3`]);
        
        const caym1Data = transformTableData(data.tableData?.[`${fieldPrefix}_caym1`] || [], columnConfig, "CAYm1");
        const caym2Data = transformTableData(data.tableData?.[`${fieldPrefix}_caym2`] || [], columnConfig, "CAYm2");
        const caym3Data = transformTableData(data.tableData?.[`${fieldPrefix}_caym3`] || [], columnConfig, "CAYm3");
        
        console.log(`🔍 DEBUG: caym1Data:`, caym1Data);
        console.log(`🔍 DEBUG: caym2Data:`, caym2Data);
        console.log(`🔍 DEBUG: caym3Data:`, caym3Data);
        
        const combined = [...caym1Data, ...caym2Data, ...caym3Data];
        
        // Add total row for this section
        if (fieldPrefix === "6.2.3") {
          const totalRow = {};
          columnConfig.forEach((col, index) => {
            if (index === columnConfig.length - 1) { // Last column is amount
              totalRow[`value${index + 1}`] = currentTotals["6.2.3"].toString();
            } else {
              totalRow[`value${index + 1}`] = "TOTAL";
            }
          });
          totalRow.cay_identifier = "TOTAL";
          combined.push(totalRow);
        } else if (fieldPrefix === "6.2.4") {
          const totalRow = {};
          columnConfig.forEach((col, index) => {
            if (index === columnConfig.length - 1) { // Last column is amount
              totalRow[`value${index + 1}`] = currentTotals["6.2.4"].toString();
            } else {
              totalRow[`value${index + 1}`] = "TOTAL";
            }
          });
          totalRow.cay_identifier = "TOTAL";
          combined.push(totalRow);
        } else if (fieldPrefix === "6.2.5") {
          const totalRow = {};
          columnConfig.forEach((col, index) => {
            if (index === columnConfig.length - 1) { // Last column is amount
              totalRow[`value${index + 1}`] = currentTotals["6.2.5"].toString();
            } else {
              totalRow[`value${index + 1}`] = "TOTAL";
            }
          });
          totalRow.cay_identifier = "TOTAL";
          combined.push(totalRow);
        }
        
        console.log(`🔍 DEBUG: combined result with totals:`, combined);
        
        return combined;
      };

      const combineFileData = (fieldPrefix) => {
        const caym1Files = extractFiles(`${fieldPrefix}_caym1`, "CAYm1");
        const caym2Files = extractFiles(`${fieldPrefix}_caym2`, "CAYm2");
        const caym3Files = extractFiles(`${fieldPrefix}_caym3`, "CAYm3");
        return [...caym1Files, ...caym2Files, ...caym3Files];
      };

      // Get column configurations for each section
      const getColumnConfig = (fieldName) => {
        const field = sectionConfig.fields.find(f => f.name === fieldName);
        return field?.tableConfig?.columns || [];
      };

      // Calculate totals for the current data
      const currentTotals = calculateTotals(data.tableData || {});
      
      // Backend expects payload matching NbaNewDevelopmentActivitiesRequest
      const payload = {
        other_staff_id: staffIdToUse,
        cycle_sub_category_id: nba_criteria_sub_level2_id,
        development_activities: data.content?.["6.2.2"] || "",
        patents_granted: "", // Not used in current form but required by backend
        academic_research_document: extractFiles("6.2.1"),
        compiled_list_table: transformTableData(data.tableData?.["6.2.1"] || [], getColumnConfig("6.2.1")),
        working_models_document: extractFiles("6.2.2"),
        sponsored_research_response: combineTableDataWithIdentifiers("6.2.3", getColumnConfig("6.2.3_caym1")),
        funded_research_document: combineFileData("6.2.3"),
        external_sources_table: [], // Not used in current form
        consultancy_work_document: combineFileData("6.2.4"),
        external_agencies_response: [], // Not used in current form
        consultancy_projects_table: combineTableDataWithIdentifiers("6.2.4", getColumnConfig("6.2.4_caym1")),
        institution_seed_document: combineFileData("6.2.5"),
        members_received_table: combineTableDataWithIdentifiers("6.2.5", getColumnConfig("6.2.5_caym1")),
        money_grants_response: [] // Not used in current form
      };

      console.log("🎯 DEBUG: Payload being sent:", payload);
      console.log("🎯 DEBUG: sponsoredResearchResponse:", payload.sponsoredResearchResponse);
      console.log("🎯 DEBUG: fundedResearchDocument:", payload.fundedResearchDocument);

      let saveResponse;
      const hasExistingEntry = currentDevelopmentActivitiesId || developmentActivitiesId;

      if (hasExistingEntry) {
        const idToUse = currentDevelopmentActivitiesId || developmentActivitiesId;
        saveResponse = await newnbaCriteria6Service.updateData6_2(idToUse, payload);
      } else {
        saveResponse = await newnbaCriteria6Service.saveCriteria6_2_Data(payload);
      }

      setAlertMessage(hasExistingEntry ? "Data updated successfully!" : "Data saved successfully!");
      setShowSuccessAlert(true);

      // Refresh data
      const refreshed = await newnbaCriteria6Service.getCriteria6_2_Data(nba_criteria_sub_level2_id, staffIdToUse);
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
        const refreshedSponsoredResearchData = separateDataByCay(refreshedItem.sponsored_research_response, sectionConfig.fields.find(f => f.name === "6.2.3_caym1")?.tableConfig?.columns);
        const refreshedConsultancyProjectsData = separateDataByCay(refreshedItem.consultancy_projects_table, sectionConfig.fields.find(f => f.name === "6.2.4_caym1")?.tableConfig?.columns);
        const refreshedMembersReceivedData = separateDataByCay(refreshedItem.members_received_table, sectionConfig.fields.find(f => f.name === "6.2.5_caym1")?.tableConfig?.columns);

        const tableData = {
          "6.2.1": transformTableFromBackend(refreshedItem.compiled_list_table, sectionConfig.fields.find(f => f.name === "6.2.1")?.tableConfig?.columns),
          "6.2.3_caym1": refreshedSponsoredResearchData.caym1,
          "6.2.3_caym2": refreshedSponsoredResearchData.caym2,
          "6.2.3_caym3": refreshedSponsoredResearchData.caym3,
          "6.2.4_caym1": refreshedConsultancyProjectsData.caym1,
          "6.2.4_caym2": refreshedConsultancyProjectsData.caym2,
          "6.2.4_caym3": refreshedConsultancyProjectsData.caym3,
          "6.2.5_caym1": refreshedMembersReceivedData.caym1,
          "6.2.5_caym2": refreshedMembersReceivedData.caym2,
          "6.2.5_caym3": refreshedMembersReceivedData.caym3,
        };

        // Separate files by description pattern and map to field names
        const separateFilesByDescription = (files, baseFieldName) => {
          if (!Array.isArray(files)) return { caym1: [], caym2: [], caym3: [] };
          
          // Handle both old description-based and new cay_identifier-based structures
          const caym1Files = files.filter(file => {
            const matchesDescription = file.description === baseFieldName || file.description === `${baseFieldName}`;
            const matchesCayIdentifier = file.cay_identifier === "CAYm1";
            return matchesDescription || matchesCayIdentifier;
          });
          
          const caym2Files = files.filter(file => {
            const matchesDescription = file.description === `${baseFieldName}-m2` || file.description === `${baseFieldName}m2`;
            const matchesCayIdentifier = file.cay_identifier === "CAYm2";
            return matchesDescription || matchesCayIdentifier;
          });
          
          const caym3Files = files.filter(file => {
            const matchesDescription = file.description === `${baseFieldName}-m3` || file.description === `${baseFieldName}m3`;
            const matchesCayIdentifier = file.cay_identifier === "CAYm3";
            return matchesDescription || matchesCayIdentifier;
          });
          
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
        const refreshedSponsoredResearchFiles = separateFilesByDescription(refreshedItem.funded_research_document, "6.2.3");
        const refreshedConsultancyWorkFiles = separateFilesByDescription(refreshedItem.consultancy_work_document, "6.2.4");
        const refreshedInstitutionSeedFiles = separateFilesByDescription(refreshedItem.institution_seed_document, "6.2.5");

        const files = [
          ...mapFilesToField(refreshedItem.academic_research_document, "6.2.1"),
          ...mapFilesToField(refreshedItem.working_models_document, "6.2.2"),
          ...refreshedSponsoredResearchFiles.caym1,
          ...refreshedSponsoredResearchFiles.caym2,
          ...refreshedSponsoredResearchFiles.caym3,
          ...refreshedConsultancyWorkFiles.caym1,
          ...refreshedConsultancyWorkFiles.caym2,
          ...refreshedConsultancyWorkFiles.caym3,
          ...refreshedInstitutionSeedFiles.caym1,
          ...refreshedInstitutionSeedFiles.caym2,
          ...refreshedInstitutionSeedFiles.caym3,
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
          content: {
            "6.2.2": refreshedItem.development_activities || ""
          },
          tableData: tableData,
          filesByField: filesByField
        });

        if (refreshedItem.development_activities_id) {
          setCurrentDevelopmentActivitiesId(refreshedItem.development_activities_id);
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
    if (!currentDevelopmentActivitiesId) {
      setAlertMessage("No entry to delete");
      setShowErrorAlert(true);
      return;
    }
    setShowDeleteAlert(true);
  };

  const confirmDelete = async () => {
    setShowDeleteAlert(false);
    try {
      await newnbaCriteria6Service.deleteData6_2(currentDevelopmentActivitiesId);
      setAlertMessage("Entry deleted successfully!");
      setShowSuccessAlert(true);
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
      setInitialData({ content: { "6.2.2": "" }, tableData: emptyTableData, filesByField: emptyFilesByField });
      setCurrentDevelopmentActivitiesId(null);
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
        onDelete={currentDevelopmentActivitiesId ? handleDelete : null}
        isCompleted={completed}
        isContributorEditable={isContributorEditable}
        saving={saveLoading}
        hasExistingData={!!currentDevelopmentActivitiesId}
      />

      {/* Display totals summary for CAY sections - always show for debugging */}
      <TotalsSummary totals={calculatedTotals} />
    </div>
    </>
  );
};

export default Criterion6_2Form;