// src/screens/pages/NEWNBA/Components/Criteria1/Criterion1_5Form.jsx

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
  const [initialData, setInitialData] = useState({
    content: {},
    tableData: {},
    filesByField: {},
    program_articulation_id: null,
  });
  const [alert, setAlert] = useState(null);

  // Helper: group raw mapping by PEO for display
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

  // Field configuration
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
        tableConfig: {
          title: "Table 1.5.1: Mapping of PEOs with Mission Statement",
          subtitle:
            "M1, M2, ... Mn are distinct elements of mission statement. Enter correlation levels as Low (1), Medium (2) and High (3). If there is no correlation, put '-'",
          addRowLabel: "Add PEO–Mission Mapping",
          columns: [
            {
              field: "peo_name",
              header: "PEO",
              width: "w-24",
              editable: false,
            },
            {
              field: "peo_statement",
              header: "PEO Statement",
              width: "w-48",
              editable: false,
            },
            {
              field: "mission_name",
              header: "Mission",
              width: "w-24",
              editable: true,
            },
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

  // Load data from API
  const loadData = async () => {
    setLoading(true);

    let d = {};
    try {
      const res = await newnbaCriteria1Service.getCriteria1_5_Data(
        cycle_sub_category_id,
        otherStaffId
      );
      const rawResponse = res?.data || res || [];
      d = Array.isArray(rawResponse) && rawResponse.length > 0 ? rawResponse[0] : {};
    } catch (err) {
      console.error("❌ Failed to load Criterion 1.5 data:", err);
      toast.error("Failed to load Criterion 1.5 data");
    }

    let mappingTableData = [];

    // 1️⃣ Use API response if available
    if (Array.isArray(d.peo_mission_mapping) && d.peo_mission_mapping.length > 0) {
      const raw = d.peo_mission_mapping.map((r) => ({
        id: r.id,
        peo_id: r.peo_id,
        peo_name: r.peo_name,
        peo_statement: r.peo_statement,
        mission_name: r.mission_name,
        correlation_level: r.correlation_level || "-",
      }));
      mappingTableData = groupMappingByPEO(raw);
    }

    // 2️⃣ Fallback: MappingService
    if (programId && mappingTableData.length === 0) {
      try {
        const res = await MappingService.getPEOMissionMapping(Number(programId));
        const raw = res.map((r) => ({
          id: r.id,
          peo_id: r.peo_id,
          peo_name: r.peo_name,
          peo_statement: r.peo_statement,
          mission_name: r.mission_name,
          correlation_level: r.correlation_level || "-",
        }));
        mappingTableData = groupMappingByPEO(raw);
      } catch (err) {
        console.warn("PEO–Mission fallback failed");
      }
    }

    setInitialData({
      content: {},
      tableData: {
        "1.5.1": mappingTableData,
      },
      program_articulation_id: d.program_articulation_id || null,
      filesByField: {
        "1.5.1": [],
      },
    });

    setLoading(false);
  };

  // Delete handler
  const handleDelete = async () => {
    if (!initialData?.program_articulation_id) {
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
          try {
            await newnbaCriteria1Service.deleteCriteria1_5_Data(
              initialData.program_articulation_id
            );
            setAlert(
              <SweetAlert
                success
                title="Deleted!"
                confirmBtnCssClass="btn-confirm"
                onConfirm={async () => {
                  setAlert(null);
                  await loadData();
                  onSaveSuccess?.();
                }}
              >
                Criterion 1.5 data has been deleted successfully.
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
                {err.message || "Failed to delete data"}
              </SweetAlert>
            );
          }
        }}
        onCancel={() => setAlert(null)}
      >
        This will permanently delete all Criterion 1.5 data!
      </SweetAlert>
    );
  };

  // Save handler
  const handleSave = async (data) => {
    const payload = {
      program_articulation_id: initialData.program_articulation_id,
      pam_table: data.tableData["1.5.1"],
      filesByField: data.filesByField,
    };

    setSaving(true);

    try {
      if (initialData.program_articulation_id) {
        // Use PUT for update
        await newnbaCriteria1Service.putCriteria1_5_Data(
          initialData.program_articulation_id,
          payload
        );
      } else {
        // Use POST for new save
        await newnbaCriteria1Service.saveCriteria1_5_Data(payload);
      }

      toast.success("Criterion 1.5 saved successfully!");
      await loadData();
      onSaveSuccess?.();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Save failed");
    }

    setSaving(false);
  };

  useEffect(() => {
    loadData();
  }, [cycle_sub_category_id, programId]);

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
        onDelete={handleDelete}
        onSave={handleSave}
      />
      {alert}
    </>
  );
};

export default Criterion1_5Form;
