import React, { useState, useEffect } from "react";
import GenericCriteriaForm from "../GenericCriteriaForm";
import { newnbaCriteria1Service } from "../../Services/NewNBA-Criteria1.service";
import { toast } from "react-toastify";
import SweetAlert from "react-bootstrap-sweetalert";
import { MappingService } from "../../../OBE/Services/mapping.service";

const Criterion1_5Form = ({
  cycle_sub_category_id,
  isEditable = true,
  onSaveSuccess,
  programId = null,
  otherStaffId = null,
  showCardView = false,
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  const [initialData, setInitialData] = useState({
    content: {},
    tableData: {},
    filesByField: {},
    consistency_peo_mission_id: null,
  });

  // ────────────────────────────────────────────────
  //  Group raw mapping rows → expanded rows (one mission per row)
  // ────────────────────────────────────────────────
  const groupMappingByPEO = (rawMappingData) => {
    const peoMap = new Map();

    rawMappingData.forEach((row, index) => {
      const peoKey = row.peo_id ?? row.peo_name;

      if (!peoMap.has(peoKey)) {
        peoMap.set(peoKey, {
          peo_id: row.peo_id || null,
          peo_name: row.peo_name,
          peo_statement: row.peo_statement,
          missions: [],
        });
      }

      peoMap.get(peoKey).missions.push({
        mission_name: row.mission_name,
        correlation_level: row.correlation_level || "-",
        id: row.id ?? `${row.peo_name}-${row.mission_name}-${index}`,
      });
    });

    const expanded = [];
    Array.from(peoMap.values()).forEach((peo) => {
      peo.missions.forEach((m, idx) => {
        expanded.push({
          peo_id: peo.peo_id,
          peo_name: peo.peo_name,
          peo_statement: peo.peo_statement,
          mission_name: m.mission_name,
          correlation_level: m.correlation_level,
          id: m.id,
          isFirstInGroup: idx === 0,
        });
      });
    });

    return expanded;
  };

  // ────────────────────────────────────────────────
  //                  CONFIG
  // ────────────────────────────────────────────────
  const config = {
    title:
      "1.5.1 Generate a “Mission of the Institute – PEOs matrix” with justification and rationale of the mapping",
    totalMarks: 10,
    fields: [
      {
        name: "1.5.1",
        label:
          "1.5.1 Generate a “Mission of the Institute – PEOs matrix” with justification and rationale of the mapping",
        marks: 10,
        hasTable: true,
        allowFiles: true,           // ← important: enable file upload
        tableConfig: {
          title: "Table 1.5.1: Mapping of PEOs with Mission Statement",
          subtitle:
            "M1, M2, ... Mn are distinct elements of mission statement. Enter correlation levels as Low (1), Medium (2) and High (3). If there is no correlation, put '-'",
          addRowLabel: "Add PEO–Mission Mapping",
          columns: [
            { field: "peo_name",       header: "PEO",            width: "w-24", editable: false },
            { field: "peo_statement",  header: "PEO Statement",  width: "w-48", editable: false },
            { field: "mission_name",   header: "Mission",        width: "w-24", editable: true  },
            {
              field: "correlation_level",
              header: "Correlation Level",
              width: "w-40",
              type: "select",
              options: [
                { value: "1", label: "Low (1)" },
                { value: "2", label: "Medium (2)" },
                { value: "3", label: "High (3)" },
                { value: "-", label: "No Correlation (-)" },
              ],
            },
          ],
        },
      },
    ],
  };

  // ────────────────────────────────────────────────
  //                  LOAD DATA
  // ────────────────────────────────────────────────
// ────────────────────────────────────────────────
//                  LOAD DATA
// ────────────────────────────────────────────────
const loadData = async () => {
  if (!cycle_sub_category_id) {
    setLoading(false);
    return;
  }

  setLoading(true);

  const userInfo  = JSON.parse(localStorage.getItem("userProfile") || "{}");
  const userInfoo = JSON.parse(localStorage.getItem("userInfo")  || "{}");
  const currentOtherStaffId =
    otherStaffId ||
    userInfo?.rawData?.other_staff_id ||
    userInfo.user_id ||
    userInfoo?.other_staff_id;

  let apiData = null;
  let hasSavedMapping = false;

  try {
    const res = await newnbaCriteria1Service.getCriteria1_5_Data(
      cycle_sub_category_id,
      currentOtherStaffId
    );

    // Normalize response - handle different shapes people return
    apiData = res?.data ?? res ?? null;

    if (Array.isArray(apiData)) {
      apiData = apiData.length > 0 ? apiData[0] : null;
    }

    // Check if we have meaningful saved mapping data
    if (
      apiData &&
      Array.isArray(apiData.peo_mission_mapping) &&
      apiData.peo_mission_mapping.length > 0
    ) {
      hasSavedMapping = true;
      console.log("✅ Using SAVED PEO-Mission mapping from Criterion 1.5 API");
    } else {
      console.log("ℹ️ No saved PEO-Mission mapping found in Criterion 1.5 response");
    }
  } catch (err) {
    console.error("Failed to load Criterion 1.5 data:", err);
    toast.error("Failed to load saved Criterion 1.5 data");
  }

  let mappingTableData = [];

  // ── Priority 1: Use saved data if available ────────────────────────
  if (hasSavedMapping && apiData) {
    const raw = apiData.peo_mission_mapping.map(r => ({
      id: r.id,
      peo_id: r.peo_id ?? null,
      peo_name: r.peo_name ?? "",
      peo_statement: r.peo_statement ?? "",
      mission_name: r.mission_name ?? "",
      correlation_level: r.correlation_level ?? "-",
    }));

    mappingTableData = groupMappingByPEO(raw);
  }
  // ── Priority 2: Fallback to general mapping service ────────────────
  else if (programId) {
    try {
      console.log(`→ Fetching fallback PEO-Mission mapping for program ${programId}`);
      const res = await MappingService.getPEOMissionMapping(Number(programId));

      const raw = Array.isArray(res) ? res.map(r => ({
        id: r.id,
        peo_id: r.peo_id ?? null,
        peo_name: r.peo_name ?? "",
        peo_statement: r.peo_statement ?? "",
        mission_name: r.mission_name ?? "",
        correlation_level: r.correlation_level ?? "-",
      })) : [];

      if (raw.length > 0) {
        mappingTableData = groupMappingByPEO(raw);
        console.log(`✅ Loaded ${raw.length} mapping rows from MappingService`);
      } else {
        console.log("⚠️ MappingService returned empty array");
      }
    } catch (err) {
      console.warn("PEO-Mission fallback failed:", err);
    }
  } else {
    console.log("⚠️ No programId → skipping fallback mapping load");
  }

  // ── Files preparation ───────────────────────────────────────────────
  const existingFiles = (apiData?.consistency_peo_mission_document || []).map((f, i) => ({
    id: `file-1.5.1-${i}`,
    filename: f.document_name || f.name || f.filename || "",
    s3Url: f.document_url || f.url || f.s3Url || "",
    url: f.document_url || f.url || f.s3Url || "",
    description: f.description || "",
    uploading: false,
  }));

  // Set form data
  setInitialData({
    content: {},
    tableData: {
      "1.5.1": mappingTableData,
    },
    consistency_peo_mission_id: apiData?.consistency_peo_mission_id ?? null,
    filesByField: {
      "1.5.1": existingFiles.length > 0 ? existingFiles : [{
        id: "file-1.5.1-default",
        description: "",
        file: null,
        filename: "",
        s3Url: "",
        uploading: false,
      }],
    },
  });

  setLoading(false);
};

  // ────────────────────────────────────────────────
  //                  DELETE
  // ────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!initialData?.consistency_peo_mission_id) {
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
        confirmBtnCssClass="btn-confirm"
        cancelBtnCssClass="btn-cancel"
        title="Are you sure?"
        onConfirm={async () => {
          setAlert(null);

          const userInfo  = JSON.parse(localStorage.getItem("userProfile") || "{}");
          const userInfoo = JSON.parse(localStorage.getItem("userInfo")  || "{}");
          const currentOtherStaffId =
            otherStaffId ||
            userInfo?.rawData?.other_staff_id ||
            userInfo.user_id ||
            userInfoo?.other_staff_id;

          try {
            await newnbaCriteria1Service.deleteCriteria1_5_Data(
              initialData.consistency_peo_mission_id,
              currentOtherStaffId
            );

            setAlert(
              <SweetAlert
                success
                title="Deleted!"
                confirmBtnCssClass="btn-confirm"
                onConfirm={() => {
                  setAlert(null);
                  loadData();
                  onSaveSuccess?.();
                }}
              >
                Criterion 1.5 data deleted successfully.
              </SweetAlert>
            );
          } catch (err) {
            setAlert(
              <SweetAlert
                danger
                title="Delete Failed"
                confirmBtnCssClass="btn-confirm"
                onConfirm={() => setAlert(null)}
              >
                {err.message || "Failed to delete data"}
              </SweetAlert>
            );
          }
        }}
        onCancel={() => setAlert(null)}
      >
        This will permanently delete Criterion 1.5 data!
      </SweetAlert>
    );
  };

  // ────────────────────────────────────────────────
  //                  SAVE
  // ────────────────────────────────────────────────
  const handleSave = async (formData) => {
    const userInfo  = JSON.parse(localStorage.getItem("userProfile") || "{}");
    const userInfoo = JSON.parse(localStorage.getItem("userInfo")  || "{}");
    const currentOtherStaffId =
      otherStaffId ||
      userInfo?.rawData?.other_staff_id ||
      userInfo.user_id ||
      userInfoo?.other_staff_id;

    if (!currentOtherStaffId) {
      toast.error("Cannot save: staff ID not available");
      return;
    }

    setSaving(true);

    try {
      // Prepare documents (only those with s3Url — already uploaded)
      const documents = (formData.filesByField["1.5.1"] || [])
        .filter(f => f.s3Url || f.url)
        .map(f => ({
          document_name: f.filename || f.name || "",
          document_url: f.s3Url || f.url || "",
          description: f.description || "",
        }));

      const payload = {
        cycle_sub_category_id,
        other_staff_id: currentOtherStaffId,
        program_id: programId,
        consistency_peo_mission: formData.tableData["1.5.1"] || [],
        consistency_peo_mission_document: documents,
      };

      if (initialData.consistency_peo_mission_id) {
        await newnbaCriteria1Service.putCriteria1_5_Data(
          initialData.consistency_peo_mission_id,
          currentOtherStaffId,
          payload
        );
      } else {
        await newnbaCriteria1Service.saveCriteria1_5_Data(
          currentOtherStaffId,
          payload
        );
      }

      setAlert(
        <SweetAlert
          success
          title="Saved!"
          confirmBtnCssClass="btn-confirm"
          cancelBtnCssClass="btn-cancel"
          onConfirm={() => {
            setAlert(null);
            loadData();
            onSaveSuccess?.();
          }}
        >
          Criterion 1.5 saved successfully
        </SweetAlert>
      );
    } catch (err) {
      console.error("Save failed:", err);
      toast.error(err.message || "Failed to save Criterion 1.5");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [cycle_sub_category_id, otherStaffId, programId]);

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-xl font-medium text-indigo-600">
        Loading Criterion 1.5...
      </div>
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
        showFileCategories={true}      // ← shows category if needed
        onDelete={handleDelete}
        onSave={handleSave}
      />
      {alert}
    </>
  );
};

export default Criterion1_5Form;