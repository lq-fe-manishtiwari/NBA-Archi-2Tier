// src/screens/pages/NEWNBA/Components/Criteria3/Criterion3_3Form.jsx

import React, { useState, useEffect, useCallback } from "react";
import GenericCriteriaForm3_8 from "./GenericCriteriaForm3_8";
import { newnbaCriteria3Service } from "../../Services/NewNBA-Criteria3.service";
import SweetAlert from "react-bootstrap-sweetalert";
import { getAllProfileFlags } from "@/_services/adminProfileUtils";

const Criterion3_3Form = ({
  cycle_sub_category_id,
  isEditable = true,
  onSaveSuccess,
  otherStaffId = null,
  programId = null,
  academic_year_id = null,          // ← Changed: now numeric ID from parent
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [recordId, setRecordId] = useState(null);
  const [initialData, setInitialData] = useState({
    content: {},
    tableData: {},
    filesByField: {},
  });
  const [alert, setAlert] = useState(null);
  const [isContributor, setIsContributor] = useState(false);

  const config = {
    title: "3.3. Attainment of Program Outcomes and Program Specific Outcomes (40)",
    totalMarks: 40,
    fields: [
      {
        name: "3.3.1",
        label: "3.3.1. Describe Assessment Tools and Processes Used for Assessing the Attainment of Each PO/PSO (10)",
        marks: 10,
        type: "textarea",
        hasFile: true,
      },
      {
        name: "3.3.2",
        label: "3.3.2. Provide Results of Evaluation of Each PO/PSO (30)",
        marks: 30,
        hasTable: true,
        hasFile: true,
        tableConfig: {
          type: "program-outcome-attainment",
          title: "Table 3.3.2: PO / PSO Attainment Summary",
          description:
            "Record the attainment levels (Direct, Indirect, Overall) for each Program Outcome and Program Specific Outcome.",
          addRowLabel: "Add PO / PSO Record",
          columns: [
            {
              field: "po_code",
              header: "PO / PSO Code",
              placeholder: "PO1 or PSO1",
              width: "w-32",
            },
            {
              field: "direct_attainment",
              header: "Direct Attainment (%)",
              placeholder: "78",
              width: "w-28",
            },
            {
              field: "indirect_attainment",
              header: "Indirect Attainment (%)",
              placeholder: "82",
              width: "w-28",
            },
            {
              field: "overall_attainment",
              header: "Overall Attainment (%)",
              placeholder: "80",
              width: "w-28",
            },
            {
              field: "attainment_level",
              header: "Attainment Level",
              placeholder: "3",
              width: "w-24",
              type: "select",
              options: [
                { value: "1", label: "Level 1" },
                { value: "2", label: "Level 2" },
                { value: "3", label: "Level 3" },
              ],
            },
          ],
        },
      },
    ],
  };

  // Helpers
  const toNumberOrNull = (val) => {
    if (val === "" || val == null || val === undefined) return null;
    const num = Number(val);
    return isNaN(num) ? null : num;
  };

  const ensureFileUploadSlot = (files = []) => {
    if (!Array.isArray(files) || files.length === 0) {
      return [
        {
          id: `file-3.3.1-empty-${Date.now()}`,
          filename: "",
          file: null,
          s3Url: "",
          url: "",
          description: "No document uploaded yet",
          uploading: false,
        },
      ];
    }

    return files.map((f, i) => ({
      id: `file-3.3.1-${i}-${Date.now()}`,
      filename: f.file_name || f.filename || "",
      file: null,
      s3Url: f.file_url || f.s3Url || f.url || "",
      url: f.file_url || f.s3Url || f.url || "",
      description: f.description || "",
      uploading: false,
    }));
  };

  // ────────────────────────────────────────────────
  // LOAD DATA
  // ────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    if (!cycle_sub_category_id) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const profileFlags = getAllProfileFlags();
      setIsContributor(!!profileFlags?.isContributor);

      const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}");
      const staffId =
        otherStaffId ||
        userProfile?.rawData?.other_staff_id ||
        userProfile?.user_id;

      if (!staffId) throw new Error("Staff ID not found");

      const res = await newnbaCriteria3Service.getCriteria3_3_Data(
        cycle_sub_category_id,
        staffId
      );

      const data = Array.isArray(res) ? res[0] : res || null;

      const id = data?.id || null;
      setRecordId(id);

      setInitialData({
        content: {
          "3.3.1": data?.assessment_tools_description || "",
        },
        tableData: {
          "3.3.2": Array.isArray(data?.evaluation_results)
            ? data.evaluation_results.map((item) => ({
                po_code: item.po_code || item.code || "",
                direct_attainment: String(item.direct_attainment ?? item.direct ?? ""),
                indirect_attainment: String(item.indirect_attainment ?? item.indirect ?? ""),
                overall_attainment: String(item.overall_attainment ?? item.overall ?? ""),
                attainment_level: String(item.attainment_level ?? "1"),
              }))
            : [],
        },
        filesByField: {
          "3.3.1": ensureFileUploadSlot(data?.attainment_po_pso_document || []),
        },
      });

      // Debug logs – very important now
      console.log("[Criterion 3.3] Loaded from parent:", { academic_year_id });
      console.log("[Criterion 3.3] Backend response:", {
        academic_year: data?.academic_year,
        academic_year_id: data?.academic_year_id,
        fullDataKeys: Object.keys(data || {}),
      });
    } catch (err) {
      console.error("[Criterion 3.3] Load failed:", err);
      setRecordId(null);
      setInitialData({
        content: { "3.3.1": "" },
        tableData: { "3.3.2": [] },
        filesByField: { "3.3.1": ensureFileUploadSlot() },
      });
    } finally {
      setLoading(false);
    }
  }, [cycle_sub_category_id, otherStaffId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ────────────────────────────────────────────────
  // SAVE
  // ────────────────────────────────────────────────
  const handleSave = async (formData = {}) => {
    setSaving(true);

    try {
      const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}");
      const staffId =
        otherStaffId ||
        userProfile?.rawData?.other_staff_id ||
        userProfile?.user_id;

      if (!staffId) throw new Error("Staff ID missing");

      const safeFormData = {
        content: formData?.content || {},
        tableData: formData?.tableData || {},
        filesByField: formData?.filesByField || {},
      };

      // Documents
      const documentsArray = (safeFormData.filesByField["3.3.1"] || [])
        .filter((f) => (f?.s3Url || f?.url) && (f.filename?.trim() || f.description?.trim()))
        .map((f) => ({
          file_name: (f.filename || "").trim(),
          file_url: (f.s3Url || f.url || "").trim(),
          description: (f.description || "").trim(),
        }));

      const payload = {
        other_staff_id: Number(staffId),
        cycle_sub_category_id: Number(cycle_sub_category_id),
        program_id: programId ? Number(programId) : null,

        // ─── ONLY THIS ───
        academic_year_id: formData.academic_year_id 
          ? Number(formData.academic_year_id) 
          : null,

        // Removed: academic_year string completely

        assessment_tools_description: (safeFormData.content["3.3.1"] || "").trim(),

        evaluation_results: (safeFormData.tableData["3.3.2"] || [])
          .filter((item) => item.po_code?.trim())
          .map((item) => ({
            po_code: (item.po_code || "").trim(),
            direct_attainment: toNumberOrNull(item.direct_attainment),
            indirect_attainment: toNumberOrNull(item.indirect_attainment),
            overall_attainment: toNumberOrNull(item.overall_attainment),
            attainment_level: (item.attainment_level || "1").trim(),
          })),

        attainment_po_pso_document: documentsArray,
      };

      console.log("[Criterion 3.3] Sending payload:", JSON.stringify(payload, null, 2));

      let response;

      if (recordId) {
        response = await newnbaCriteria3Service.putCriteria3_3_Data(
          recordId,
          staffId,
          payload
        );
      } else {
        response = await newnbaCriteria3Service.saveCriteria3_3_Data(staffId, payload);
      }

      if (response?.status === 200 || response?.status === 201 || response?.id) {
        setAlert(
          <SweetAlert
            success
            title="Saved!"
            confirmBtnText="OK"
            onConfirm={() => {
              setAlert(null);
              onSaveSuccess?.();
            }}
          >
            Criterion 3.3 saved successfully.
          </SweetAlert>
        );

        await loadData();

        if (isContributor) {
          try {
            const updatedId = response?.id || recordId;
            if (updatedId) {
              await newnbaCriteria3Service.updateCriteria3_3_Status(
                {
                  id: updatedId,
                  approval_status: "APPROVED",
                  approved_by: staffId,
                  approved_by_name: userProfile?.name || userProfile?.rawData?.name || "",
                },
                staffId
              );
            }
          } catch (approveErr) {
            console.error("[Criterion 3.3] Auto-approve failed:", approveErr);
          }
        }
      } else {
        throw new Error(response?.message || "Save failed");
      }
    } catch (err) {
      console.error("[Criterion 3.3] Save failed:", err);
      setAlert(
        <SweetAlert
          danger
          title="Save Failed"
          confirmBtnText="OK"
          onConfirm={() => setAlert(null)}
        >
          {err.message || "Could not save data. Please try again."}
        </SweetAlert>
      );
    } finally {
      setSaving(false);
    }
  };

  // ────────────────────────────────────────────────
  // DELETE (unchanged)
  // ────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!recordId) {
      setAlert(
        <SweetAlert info title="Nothing to Delete" confirmBtnText="OK" onConfirm={() => setAlert(null)}>
          No saved record found.
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
        title="Are you sure?"
        onConfirm={async () => {
          setAlert(null);
          try {
            const res = await newnbaCriteria3Service.deleteCriteria3_3_Data(recordId);

            setAlert(
              <SweetAlert
                success
                title="Deleted!"
                confirmBtnText="OK"
                onConfirm={() => setAlert(null)}
              >
                {res?.message || "Record deleted successfully"}
              </SweetAlert>
            );

            setRecordId(null);
            await loadData();
            onSaveSuccess?.();
          } catch (err) {
            console.error("[Criterion 3.3] Delete failed:", err);
            setAlert(
              <SweetAlert danger title="Delete Failed" confirmBtnText="OK" onConfirm={() => setAlert(null)}>
                Could not delete the record. Please try again.
              </SweetAlert>
            );
          }
        }}
        onCancel={() => setAlert(null)}
      >
        This action cannot be undone.
      </SweetAlert>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-xl font-medium text-indigo-600">
        Loading Criterion 3.3...
      </div>
    );
  }

  return (
    <div>
      <GenericCriteriaForm3_8
        title={config.title}
        marks={config.totalMarks}
        fields={config.fields}
        initialData={initialData}
        hasData={!!initialData}  
        saving={saving}
        isContributorEditable={isEditable}
        showFileCategories={true}
        onSave={handleSave}
        onDelete={handleDelete}
        programId={programId}
        academic_year_id={academic_year_id}      // ← only numeric ID passed
      />

      {alert}
    </div>
  );
};

export default Criterion3_3Form;