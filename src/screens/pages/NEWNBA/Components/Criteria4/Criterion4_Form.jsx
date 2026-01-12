// src/components/nba/Criterion4_Form.jsx
import React, { useState, useEffect, useCallback } from "react";
import GenericCriteriaForm4_1 from "./GenericCriteriaForm4_1"; // ← your existing generic form
import GenericCardWorkflow from "../GenericCardWorkflow";
import { newnbaCriteria4Service } from "../../Services/NewNBA-Criteria4.service";
import SweetAlert from "react-bootstrap-sweetalert";

const Criterion4_Form = ({
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
  const [dataId, setDataId] = useState(null); // will store main record id (e.g. cri4_id)
  const [isContributor, setIsContributor] = useState(false);
  const [initialData, setInitialData] = useState({
    content: {},
    tableData: [],
    filesByField: {},
  });
  const [alert, setAlert] = useState(null);
  const [cardData, setCardData] = useState([]);
  const [cardLoading, setCardLoading] = useState(false);

  // ────────────────────────────────────────────────
  //                  CONFIGURATION
  // ────────────────────────────────────────────────
  const config = {
    title: "Criterion 4 – University Result",
    totalMarks: 150, // adjust as per actual NBA weightage for Criterion 4

    fields: [
      {
        name: "4.1",
        label: "4.1 Enrolment Ratio",
        marks: 20,
        hasTable: true,
        tableConfig: {
          columns: [
            { field: "item", header: "Item", readOnly: true },
            { field: "cay", header: "CAY" },
            { field: "caym1", header: "CAYm1" },
            { field: "caym2", header: "CAYm2" },
          ],
          predefinedRows: [
            { item: "N = Sanctioned intake of the program in the 1st year (as per AICTE/Competent authority)" },
            { item: "N1 = Total no. of students admitted in the 1st year minus the no. of students who migrated to other programs/institutions plus no. of students who migrated to this program" },
            { item: "N4 = Total no. of students admitted in the 1st year via all supernumerary quotas" },
            { item: "Enrolment Ratio (ER) = (N1 + N4) / N" },
            { item: "Average ER = (ER1 + ER2 + ER3)/3" },
          ],
        },
      },
    ],
  };

  // ────────────────────────────────────────────────
  //     DATA MAPPING – Table ↔ API Format
  // ────────────────────────────────────────────────
  const tableToApiFormat = (tableData = [], fieldName) => {
    // Customize per table/field if needed
    if (fieldName === "4.1") {
      const keys = ["sanctioned_intake", "total_admitted", "supernumerary", "enrolment_ratio", "average_er"];
      return tableData.map((row, idx) => ({
        row_type: keys[idx] || `row_${idx}`,
        cay: row.cay || "",
        caym1: row.caym1 || "",
        caym2: row.caym2 || "",
      })).filter(Boolean);
    }

    // Add more mappings for other tables (4.3 etc.)
    return tableData.map(row => ({ ...row })); // fallback
  };

  const apiToTableFormat = (apiData = {}, fieldName) => {
    if (fieldName === "4.1") {
      const enrolment = {};
      (apiData?.cri4_enrolment_ratio_table || []).forEach(r => {
        enrolment[r.row_type] = { cay: r.cay, caym1: r.caym1, caym2: r.caym2 };
      });

      return [
        { id: `row-1-${Date.now()}`, item: config.fields[0].tableConfig.predefinedRows[0].item, cay: enrolment?.sanctioned_intake?.cay || "", caym1: enrolment?.sanctioned_intake?.caym1 || "", caym2: enrolment?.sanctioned_intake?.caym2 || "" },
        { id: `row-2-${Date.now()}`, item: config.fields[0].tableConfig.predefinedRows[1].item, cay: enrolment?.total_admitted?.cay || "", caym1: enrolment?.total_admitted?.caym1 || "", caym2: enrolment?.total_admitted?.caym2 || "" },
        { id: `row-3-${Date.now()}`, item: config.fields[0].tableConfig.predefinedRows[2].item, cay: enrolment?.supernumerary?.cay || "", caym1: enrolment?.supernumerary?.caym1 || "", caym2: enrolment?.supernumerary?.caym2 || "" },
        { id: `row-4-${Date.now()}`, item: config.fields[0].tableConfig.predefinedRows[3].item, cay: enrolment?.enrolment_ratio?.cay || "", caym1: enrolment?.enrolment_ratio?.caym1 || "", caym2: enrolment?.enrolment_ratio?.caym2 || "" },
        { id: `row-5-${Date.now()}`, item: config.fields[0].tableConfig.predefinedRows[4].item, cay: enrolment?.average_er?.cay || "", caym1: enrolment?.average_er?.caym1 || "", caym2: enrolment?.average_er?.caym2 || "", averageER: enrolment?.average_er?.cay || "0.00" },
      ];
    }

    // Add mappings for other tables
    return [];
  };

  // ────────────────────────────────────────────────
  //                   LOAD DATA
  // ────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    if (!cycle_sub_category_id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
      setIsContributor(userInfo?.rawData?.is_contributor || false);

      const staffId = otherStaffId || userInfo?.rawData?.other_staff_id || userInfo.user_id;
      const res = await newnbaCriteria4Service.getCriteria4_Data(cycle_sub_category_id, staffId);

      const d = res?.data?.[0] || res?.data || {};

      setDataId(d.id || d.cri4_id || null);

      const filesByField = {
        "4.1": (d.cri4_enrolment_documents || []).map(f => ({
          id: f.id,
          filename: f.filename,
          s3Url: f.url || f.downloadPath || "",
          description: f.description || "",
        })),
        // Add more fields when you have more document arrays from backend
      };

      setInitialData({
        content: {
          "4.1": d.description_4_1 || "",
          "4.2": d.description_4_2 || "",
          // ...
        },
        tableData: apiToTableFormat(d, "4.1"), // extend for other tables
        filesByField,
      });
    } catch (err) {
      console.error("Criterion 4 load error:", err);
      setInitialData({
        content: {},
        tableData: [],
        filesByField: { "4.1": [{ id: "empty-4.1", description: "", s3Url: "" }] },
      });
    } finally {
      setLoading(false);
    }
  }, [cycle_sub_category_id, otherStaffId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ────────────────────────────────────────────────
  //                   SAVE DATA
  // ────────────────────────────────────────────────
  const handleSave = async (formData) => {
    setSaving(true);
    try {
    //   const staffId = /* same logic as above */

      const payload = {
        other_staff_id: staffId,
        cycle_sub_category_id,
        cri4_enrolment_ratio_table: tableToApiFormat(formData.tableData, "4.1"),
        cri4_enrolment_documents: (formData.filesByField["4.1"] || []).map(f => ({
          filename: f.filename,
          url: f.s3Url || "",
          description: f.description || "",
        })),
        // Add more tables / fields / documents here
        description_4_1: formData.content["4.1"] || "",
        // description_4_2, etc.
      };

      if (dataId) {
        await newnbaCriteria4Service.updateCriteria4_Data(dataId, payload);
      } else {
        await newnbaCriteria4Service.saveCriteria4_Data(payload);
      }

      setAlert(<SweetAlert success title="Saved!" onConfirm={() => setAlert(null)}>
        Criterion 4 saved successfully
      </SweetAlert>);

      loadData();
      onSaveSuccess?.();
    } catch (err) {
      console.error("Save failed:", err);
      setAlert(<SweetAlert danger title="Error" onConfirm={() => setAlert(null)}>
        Failed to save Criterion 4
      </SweetAlert>);
    } finally {
      setSaving(false);
    }
  };

  // ────────────────────────────────────────────────
  //                   RENDER
  // ────────────────────────────────────────────────
  if (loading) {
    return <div className="py-12 text-center text-xl text-blue-600">Loading Criterion 4...</div>;
  }

  return (
    <div>
      {showCardView ? (
        <GenericCardWorkflow
          cycleSubCategoryId={cycle_sub_category_id}
          cardData={cardData}
          onCardClick={onCardClick}
        //   onStatusChange={/* reload cards */}
          apiService={newnbaCriteria4Service}
          cardConfig={{
            title: "Criterion 4",
            statusField: "approval_status",
            userField: "other_staff_id",
            nameFields: ["firstname", "lastname"],
            idField: "id", // adjust to your actual PK
          }}
        />
      ) : (
        <GenericCriteriaForm4_1
          title={config.title}
          marks={config.totalMarks}
          fields={config.fields}
          initialData={initialData}
          onSave={handleSave}
          saving={saving}
          isContributorEditable={isEditable}
        />
      )}

      {alert}
    </div>
  );
};

export default Criterion4_Form;