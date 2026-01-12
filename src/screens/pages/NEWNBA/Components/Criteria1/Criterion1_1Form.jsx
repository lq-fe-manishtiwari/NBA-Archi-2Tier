// src/screens/pages/NEWNBA/Criterion1_1Form.jsx

import React, { useState, useEffect } from "react";
import GenericCriteriaForm from "../GenericCriteriaForm";
import GenericCardWorkflow from "../GenericCardWorkflow";
import { newnbaCriteria1Service } from "../../Services/NewNBA-Criteria1.service";
import { toast } from "react-toastify";
import { MappingService } from "../../../OBE/Services/mapping.service";
import { getAllProfileFlags } from "@/_services/adminProfileUtils";
import SweetAlert from 'react-bootstrap-sweetalert';

const Criterion1_1Form = ({
  cycle_sub_category_id,
  isEditable = true,
  onSaveSuccess,
  programId = null,
  otherStaffId = null,
  showCardView = false,
  onCardClick = null,
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initialData, setInitialData] = useState({
    content: {},
    tableData: [],
    files: [], // This will be used only for display
  });
  const [profileFlags, setProfileFlags] = useState(null);
  const [alert, setAlert] = useState(null);
  const [cardData, setCardData] = useState([]);
  const [cardLoading, setCardLoading] = useState(false);

  useEffect(() => {
    const flags = getAllProfileFlags();
    setProfileFlags(flags);
  }, []);

  /**
   * Transform flat mapping data into expanded structure by PEO-Mission
   * Each PEO shows header, then each mission as a separate row
   * 
   * Input: [
   *   { peo_id: 2, peo_name: "PEO1", mission_name: "M1", correlation_level: "2" },
   *   { peo_id: 2, peo_name: "PEO1", mission_name: "M2", correlation_level: "2" },
   *   { peo_id: 3, peo_name: "PEO2", mission_name: "M1", correlation_level: "3" }
   * ]
   * 
   * Output: [
   *   { peo_id: 2, peo_name: "PEO1", peo_statement: "...", mission_name: "M1", correlation_level: "2", isFirstInGroup: true },
   *   { peo_id: 2, peo_name: "PEO1", peo_statement: "...", mission_name: "M2", correlation_level: "2", isFirstInGroup: false },
   *   { peo_id: 3, peo_name: "PEO2", peo_statement: "...", mission_name: "M1", correlation_level: "3", isFirstInGroup: true }
   * ]
   */
const groupMappingByPEO = (rawMappingData) => {
  console.log("🔧 Expanding mapping data by PEO with individual mission rows...");

  const peoMap = new Map();

  rawMappingData.forEach((row, index) => {
    const peoKey = row.peo_id ?? row.peo_name;

    if (!peoMap.has(peoKey)) {
      peoMap.set(peoKey, {
        peo_id: row.peo_id || null,
        peo_name: row.peo_name,
        peo_statement: row.peo_statement,
        missions: [], // ✅ ARRAY, not Map
      });
    }

    // ✅ KEEP ALL ROWS
    peoMap.get(peoKey).missions.push({
      mission_name: row.mission_name,
      correlation_level: row.correlation_level || "-",
      id: row.id ?? `${row.peo_name}-${row.mission_name}-${index}`,
    });
  });

  const expandedData = [];

  Array.from(peoMap.values()).forEach(peoGroup => {
    peoGroup.missions.forEach((mission, index) => {
      expandedData.push({
        peo_id: peoGroup.peo_id,
        peo_name: peoGroup.peo_name,
        peo_statement: peoGroup.peo_statement,
        mission_name: mission.mission_name,
        correlation_level: mission.correlation_level,
        id: mission.id,
        isFirstInGroup: index === 0,
      });
    });
  });

  console.log("✅ Expanded data by PEO-Mission:", expandedData);
  return expandedData;
};

  

  const config = {
    title: "1.1. Vision, Mission and Program Educational Objectives (PEOs)",
    totalMarks: 40,
    fields: [
      {
        name: "1.1.1",
        label: "1.1.1. State the Vision and Mission of the Institute and Department",
        marks: 5,
        type: "textarea",
      },
      // {
      //   name: "1.1.2",
      //   label: "1.1.2. State PEOs of the Program",
      //   marks: 5,
      //   type: "textarea",
      // },
      // {
      //   name: "1.1.3", // ← FIXED: was "1.1.process"
      //   label: "1.1.3. Process of Defining Vision, Mission and PEOs",
      //   marks: 15,
      //   type: "textarea",
      // },
      // {
      //   name: "1.1.4",
      //   label: "1.1.4. Dissemination of Vision, Mission and PEOs",
      //   marks: 5,
      //   type: "textarea",
      // },
      // {
      //   name: "1.1.5",
      //   label: "1.1.5. Mapping of PEOs with Mission",
      //   marks: 10,
      //   hasTable: true,
      //   tableConfig: {
      //     title: "Table 1.1.5: Mapping of PEOs with Mission Statement",
      //     subtitle: "M1, M2, ... Mn are distinct elements of mission statement. Enter correlation levels as Low (1), Medium (2) and High (3). If there is no correlation, put \"-\"",
      //     addRowLabel: "Add PEO-Mission Mapping",
      //     columns: [
      //       { 
      //         field: "peo_name", 
      //         header: "PEO", 
      //         placeholder: "PEO1",
      //         width: "w-20",
      //         editable: false,
      //       },
      //       { 
      //         field: "peo_statement", 
      //         header: "PEO Statement", 
      //         placeholder: "Statement",
      //         width: "w-40",
      //         editable: false,
      //       },
      //       {
      //         field: "mission_name",
      //         header: "Mission",
      //         placeholder: "M1",
      //         width: "w-24",
      //         editable: true,
      //       },
      //       {
      //         field: "correlation_level",
      //         header: "Correlation Level",
      //         placeholder: "1, 2, 3, or -",
      //         width: "w-40",
      //         type: "select",
      //         options: [
      //           { value: "1", label: "Low (1)" },
      //           { value: "2", label: "Medium (2)" },
      //           { value: "3", label: "High (3)" },
      //           { value: "-", label: "No Correlation (-)" },
      //         ],
      //       },
      //     ],
      //   },
      // },
    ],
  };

  // Load data from API function
  const loadData = async () => {
    const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
    const userInfoo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const currentOtherStaffId = otherStaffId || userInfo?.rawData?.other_staff_id || userInfo.user_id || userInfoo?.other_staff_id;
    
    console.log("🟠 Criterion1_1Form - useEffect triggered:");
    console.log("  - cycle_sub_category_id:", cycle_sub_category_id);
    console.log("  - programId:", programId, "currentOtherStaffId:", currentOtherStaffId);
    console.log("  - isEditable:", isEditable);
    console.log("  - Type of programId:", typeof programId);
    console.log("  - programId is truthy?:", !!programId);

    if (!cycle_sub_category_id) {
      console.log("❌ Criterion1_1Form: cycle_sub_category_id is missing, exiting");
      setLoading(false);
      return;
    }

    let d = {};
    let mappingTableData = [];
    let vision_mission_peo_id = null;

    setLoading(true);

    // ----------------------------------------------
    // 1️⃣ TRY LOADING CRITERIA 1.1 DATA (CAN FAIL)
    // ----------------------------------------------
    try {
      const res = await newnbaCriteria1Service.getCriteria1_1_Data(cycle_sub_category_id, currentOtherStaffId);
      const rawResponse = res?.data || res || [];
      // API returns array, get first element
      d = Array.isArray(rawResponse) && rawResponse.length > 0 ? rawResponse[0] : {};

      console.log("🟢 Loaded Criterion 1.1 data:", d);
      console.log("🔍 API Response fields:", {
        vision_mission_statement: d.vision_mission_statement,
        peo_statement: d.peo_statement,
        process_of_defining_vmp: d.process_of_defining_vmp,
        dissemination_of_vmp: d.dissemination_of_vmp,
        vision_mission_documents: d.vision_mission_documents,
        peo_documents: d.peo_documents,
        mapping_peos_mission:d.mapping_peos_mission,
      });

      const rawData = (d.mapping_peos_mission || []).map(r => ({
        id: r.id,
        peo_id: r.peo_id || r.id,
        peo_name: r.peo_name || "",
        peo_statement: r.peo_statement || "",
        mission_name: r.mission_name || r.mission_component || "",
        correlation_level: r.correlation_level || r.mapping_description || "-",
      }));

      // Group by PEO
      mappingTableData = rawData.length > 0 ? groupMappingByPEO(rawData) : [];
      vision_mission_peo_id = d.vision_mission_peo_id || null;
    } 
    catch (err) {
      console.error("❌ Failed to load Criterion 1.1 data:", err);
      toast.error("Failed to load Criterion 1.1 data");
      d = {}; // fallback
      mappingTableData = []; // fallback
    }

    // ----------------------------------------------
    // 2️⃣ LOAD PEO-MISSION MAPPING IF NO DATA FROM FIRST API AND programId EXISTS
    // ----------------------------------------------
    const numericProgramId = Number(programId);

    if (numericProgramId && mappingTableData.length === 0) {
      try {
        console.log(
          "🟡 Calling MappingService.getPEOMissionMapping with programId:",
          numericProgramId
        );

        const mappingRes = await MappingService.getPEOMissionMapping(numericProgramId);

        console.log("🟢 MappingService response:", mappingRes);

        if (Array.isArray(mappingRes) && mappingRes.length) {
          const rawData = mappingRes.map(r => ({
            id: r.id,
            peo_id: r.peo_id,
            peo_name: r.peo_name || "",
            peo_statement: r.peo_statement || "",
            mission_name: r.mission_name || r.mission_component || "",
            correlation_level: r.correlation_level || r.mapping_description || "-",
          }));

          // Group by PEO
          mappingTableData = groupMappingByPEO(rawData);
          console.log("✅ Successfully grouped mapping data:", mappingTableData);
        }
      } 
      catch (mappingErr) {
        console.error("❌ Failed to load PEO–Mission Mapping:", mappingErr);
      }
    } 
    else if (mappingTableData.length > 0) {
      console.log("✅ Using PEO-Mission data from Criteria 1.1 API, skipping MappingService call");
    }
    else {
      console.log("⚠️ No programId provided, skipping PEO–Mission Mapping API");
    }

    // ----------------------------------------------
    // 3️⃣ SET FINAL COMBINED DATA
    // -----------------------------------------------------------------
    console.log("📋 Criterion1_1Form: Final Grouped Mapping Table Data (Ready for Display):");
    console.log("   Total PEO groups:", mappingTableData.length);
    mappingTableData.forEach((row, idx) => {
      console.log(`   [Group ${idx + 1}] PEO: "${row.peo_name}" (ID: ${row.peo_id}), Missions: "${row.mission_name}", Correlations: "${row.correlation_level}"`);
    });

    setInitialData({
      content: {
        "1.1.1": d.vision_mission_statement || "",
        "1.1.2": d.peo_statement || "",
        "1.1.3": d.process_of_defining_vmp || "",
        "1.1.4": d.dissemination_of_vmp || "",
      },
      tableData: mappingTableData,
      vision_mission_peo_id: vision_mission_peo_id,
      filesByField: {
        "1.1.1": (d.vision_mission_documents || []).length > 0 
          ? (d.vision_mission_documents || []).map((f, i) => ({
              id: `file-1.1.1-${i}`,
              name: f.name || f.file_name || "",
              filename: f.name || f.file_name || "",
              url: f.url || f.file_url || "",
              s3Url: f.url || f.file_url || "",
              description: f.description || "",
              uploading: false
            }))
          : [{ id: `file-1.1.1-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }],
        "1.1.2": (d.peo_documents || []).length > 0
          ? (d.peo_documents || []).map((f, i) => ({
              id: `file-1.1.2-${i}`,
              name: f.name || f.file_name || "",
              filename: f.name || f.file_name || "",
              url: f.url || f.file_url || "",
              s3Url: f.url || f.file_url || "",
              description: f.description || "",
              uploading: false
            }))
          : [{ id: `file-1.1.2-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }],
        "1.1.3": (d.process_documents || []).length > 0
          ? (d.process_documents || []).map((f, i) => ({
              id: `file-1.1.3-${i}`,
              name: f.name || f.file_name || "",
              filename: f.name || f.file_name || "",
              url: f.url || f.file_url || "",
              s3Url: f.url || f.file_url || "",
              description: f.description || "",
              uploading: false
            }))
          : [{ id: `file-1.1.3-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }],
        "1.1.4": (d.dissemination_documents || []).length > 0
          ? (d.dissemination_documents || []).map((f, i) => ({
              id: `file-1.1.4-${i}`,
              name: f.name || f.file_name || "",
              filename: f.name || f.file_name || "",
              url: f.url || f.file_url || "",
              s3Url: f.url || f.file_url || "",
              description: f.description || "",
              uploading: false
            }))
          : [{ id: `file-1.1.4-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }],
        "1.1.5": (d.mapping_peos_documents || []).length > 0
          ? (d.mapping_peos_documents || []).map((f, i) => ({
              id: `file-1.1.5-${i}`,
              name: f.name || f.file_name || "",
              filename: f.name || f.file_name || "",
              url: f.url || f.file_url || "",
              s3Url: f.url || f.file_url || "",
              description: f.description || "",
              uploading: false
            }))
          : [{ id: `file-1.1.5-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }]
      }
    });

    console.log("✅ Criterion1_1Form: Data loaded and set successfully");
    setLoading(false);
  };

  // Load contributors data for card view
  const loadContributorsData = async () => {
    if (!showCardView || !cycle_sub_category_id) return;
    
    setCardLoading(true);
    try {
      const contributorsResponse = await newnbaCriteria1Service.getAllCriteria1_1_Data?.(cycle_sub_category_id);
      setCardData(contributorsResponse || []);
    } catch (err) {
      console.error("Failed to load contributors data:", err);
      setCardData([]);
    } finally {
      setCardLoading(false);
    }
  };

  // Load data from API
  useEffect(() => {
    loadData();
    if (showCardView) {
      loadContributorsData();
    }
  }, [cycle_sub_category_id, programId, showCardView, otherStaffId]);


  const getFileCategory = (url, data) => {
    if (data.vision_mission_documents?.some((f) => f.file_url === url))
      return "Vision & Mission";
    if (data.peo_documents?.some((f) => f.file_url === url)) return "PEOs";
    if (data.process_documents?.some((f) => f.file_url === url)) return "Process";
    if (data.dissemination_documents?.some((f) => f.file_url === url))
      return "Dissemination";
    return "PEO-Mission Mapping";
  };

  // This is the REAL save function that calls API
const handleSave = async (formData) => {
  const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
  const userInfoo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const currentOtherStaffId = otherStaffId || userInfo?.rawData?.other_staff_id || userInfo.user_id || userInfoo?.other_staff_id;
  
  console.log("calling");
  // if (!isEditable) {
  //   toast.error("You do not have permission to edit");
  //   return;
  // }

  setSaving(true);
  try {
    // Transform filesByField → flat files with correct category
    const filesWithCategory = Object.keys(formData.filesByField || {}).flatMap(fieldName => {
      return (formData.filesByField[fieldName] || []).map(file => {
        let category = "Other";
        if (fieldName === "1.1.1") category = "Vision & Mission";
        if (fieldName === "1.1.2") category = "PEOs";
        if (fieldName === "1.1.3") category = "Process";
        if (fieldName === "1.1.4") category = "Dissemination";
        if (fieldName === "1.1.5") category = "PEO-Mission Mapping";

        return { ...file, category };
      });
    });

    const payload = {
      cycle_sub_category_id,
      // id: initialData?.vision_mission_peo_id || null,
      other_staff_id: currentOtherStaffId,
      vision_mission_statement: formData.content["1.1.1"] || "",
      peo_statement: formData.content["1.1.2"] || "",
      process_of_defining_vmp: formData.content["1.1.3"] || "",
      dissemination_of_vmp: formData.content["1.1.4"] || "",
      // Extract unique PEO statements
      peo_statements: [...new Map(formData.tableData.map(row => [
        row.peo_id || row.peo_name,
        {
          peo_id: row.peo_id || null,
          peo_name: row.peo_name || "",
          peo_statement: row.peo_statement || ""
        }
      ])).values()],
      
      mapping_peos_mission: formData.tableData.flatMap(groupedRow => {
        // Each grouped row has mission_details array with individual missions
        if (groupedRow.mission_details && Array.isArray(groupedRow.mission_details)) {
          return groupedRow.mission_details.map(mission => ({
            peo_id: groupedRow.peo_id || null,
            peo_name: groupedRow.peo_name || "",
            peo_statement: groupedRow.peo_statement || "",
            mission_name: mission.mission_name || "",
            correlation_level: mission.correlation_level || "-",
            id: mission.id || null,
          }));
        }
        // Fallback for non-grouped data
        return [{
          peo_name: groupedRow.peo_name || "",
          mission_name: groupedRow.mission_name || "",
          correlation_level: groupedRow.correlation_level || "-",
          peo_statement: groupedRow.peo_statement || ""
        }];
      }),

      // Existing files (with url)
      vision_mission_documents: filesWithCategory
        .filter(f => f.category === "Vision & Mission" && (f.url || f.s3Url))
        .map(f => ({ name: f.filename || f.name, url: f.s3Url || f.url, description: f.description || "" })),

      peo_documents: filesWithCategory
        .filter(f => f.category === "PEOs" && (f.url || f.s3Url))
        .map(f => ({ name: f.filename || f.name, url: f.s3Url || f.url, description: f.description || "" })),

      process_documents: filesWithCategory
        .filter(f => f.category === "Process" && (f.url || f.s3Url))
        .map(f => ({ name: f.filename || f.name, url: f.s3Url || f.url, description: f.description || "" })),

      dissemination_documents: filesWithCategory
        .filter(f => f.category === "Dissemination" && (f.url || f.s3Url))
        .map(f => ({ name: f.filename || f.name, url: f.s3Url || f.url, description: f.description || "" })),

      mapping_peos_documents: filesWithCategory
        .filter(f => f.category === "PEO-Mission Mapping" && (f.url || f.s3Url))
        .map(f => ({ name: f.filename || f.name, url: f.s3Url || f.url, description: f.description || "" })),
      
      is_submit: false,
      remarks: "Saving draft for review"
    };

    //    New uploaded files (File objects)
    const newFiles = filesWithCategory.filter(f => f.file);

    console.log("FINAL API CALL → payload:", payload);
    console.log("New files to upload:", newFiles.length);

    // Use PUT for update if ID exists, otherwise POST for create
    if (initialData?.vision_mission_peo_id) {
      await newnbaCriteria1Service.putCriteria1_1_Data(
        initialData.vision_mission_peo_id,
        currentOtherStaffId,
        payload
      );
    } else {
      await newnbaCriteria1Service.saveCriteria1_1_Data(currentOtherStaffId, payload);
    }

    setAlert(
      <SweetAlert
        success
        title="Saved!"
        confirmBtnCssClass="btn-confirm"
        onConfirm={async () => {
          setAlert(null);
          await loadData();
          onSaveSuccess?.();
        }}
      >
        Criterion 1.1 saved successfully!
      </SweetAlert>
    );
    
  } catch (err) {
    console.error("API Error:", err);
    toast.error(err.message || "Save failed");
  } finally {
    setSaving(false);
  }
};

// Delete function that calls API
const handleDelete = async () => {
  if (!initialData?.vision_mission_peo_id) {
    setAlert(
      <SweetAlert
        warning
        title="No Data"
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
      confirmBtnBsStyle="danger"
      confirmBtnCssClass="btn-confirm"
      cancelBtnCssClass="btn-cancel"
      title="Are you sure?"
      onConfirm={async () => {
        setAlert(null);
        try {
          await newnbaCriteria1Service.deleteCriteria1_1Data(initialData.vision_mission_peo_id);
          
          setAlert(
            <SweetAlert
              success
              title="Deleted!"
              confirmBtnCssClass="btn-confirm"
              onConfirm={async () => {
                setAlert(null);
                await loadData(); // Reload data after delete
                onSaveSuccess?.();
              }}
            >
              Criterion 1.1 data has been deleted successfully.
            </SweetAlert>
          );
        } catch (err) {
          console.error("Delete Error:", err);
          setAlert(
            <SweetAlert
              danger
              title="Delete Failed"
              confirmBtnCssClass="btn-confirm"
              onConfirm={() => setAlert(null)}
            >
              {err.message || 'Failed to delete data'}
            </SweetAlert>
          );
        }
      }}
      onCancel={() => setAlert(null)}
    >
      This will permanently delete all Criterion 1.1 data!
    </SweetAlert>
  );
};

  if (loading || (showCardView && cardLoading)) {
    return (
      <div className="flex justify-center py-20 text-xl font-medium text-indigo-600">
        Loading Criterion 1.1...
      </div>
    );
  }

  console.log("🎯 Criterion1_1Form rendering with initialData:", initialData);

  // Show card view for coordinators
  if (showCardView) {
    return (
      <>
        <GenericCardWorkflow
          cycleSubCategoryId={cycle_sub_category_id}
          cardData={cardData}
          onCardClick={onCardClick}
          onStatusChange={loadContributorsData}
          apiService={newnbaCriteria1Service}
          cardConfig={{
            title: "Criterion 1.1",
            statusField: "approval_status",
            userField: "other_staff_id",
            nameFields: ["firstname", "lastname"],
            idField: "vision_mission_peo_id",
            isCoordinatorField: "is_coordinator_entry"
          }}
        />
        {alert}
      </>
    );
  }

  return (
  <>
  <GenericCriteriaForm
  title={config.title}
  marks={config.totalMarks}
  fields={config.fields}
  initialData={initialData}
  saving={saving}
  isContributorEditable={isEditable}
  showFileCategories={true}
  onDelete={handleDelete}
  onSave={(data) => {
    // This receives { content, tableData, filesByField } from GenericCriteriaForm
    console.log("GenericCriteriaForm → sending to API:", data);

    // Transform filesByField → flat array with category
    const filesWithCategory = Object.keys(data.filesByField || {}).flatMap(fieldName => {
      return (data.filesByField[fieldName] || []).map(file => {
        let category = "Other";
        if (fieldName === "1.1.1") category = "Vision & Mission";
        if (fieldName === "1.1.2") category = "PEOs";
        if (fieldName === "1.1.3") category = "Process";
        if (fieldName === "1.1.4") category = "Dissemination";
        if (fieldName === "1.1.5") category = "PEO-Mission Mapping";

        return { ...file, category };
      });
    });

    // Now call your REAL handleSave with correct shape
    handleSave({
      content: data.content,
      tableData: data.tableData,
      filesByField: data.filesByField
    });
  }}
/>
  {alert}
  </>
  );
};

export default Criterion1_1Form;