// src/screens/pages/NEWNBA/Components/Criteria3/Criterion3_3Form.jsx

import React, { useState, useEffect, useCallback } from "react";
// import GenericCriteriaForm from "../GenericCriteriaForm";
import GenericCriteriaForm3_8 from "./GenericCriteriaForm3_8";
import { newnbaCriteria3Service } from "../../Services/NewNBA-Criteria3.service";
import SweetAlert from "react-bootstrap-sweetalert";
import { getAllProfileFlags } from "@/_services/adminProfileUtils";

const Criterion3_3Form = ({
  cycle_sub_category_id,
  isEditable = true,
  onSaveSuccess,
  otherStaffId = null,
  showCardView = false,
  onCardClick = null,
  editMode = false,
  teaching_learning_quality_id: propTeaching_learning_quality_id = null,
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [teaching_learning_quality_id, setTeaching_learning_quality_id] = useState(null);
  const [initialData, setInitialData] = useState({
    content: {},
    tableData: [],
    filesByField: {},
  });
  const [alert, setAlert] = useState(null);
  const [isContributor, setIsContributor] = useState(false);

  const config = {
    title: "3.3. Attainment of Program Outcomes and Program Specific Outcomes",
    totalMarks: 25,
    fields: [
      {
        name: "3.3.1",
        label: "3.3.1 Assessment Tools & Processes for Program Outcome Evaluation",
        marks: 5,
        type: "textarea",
        hasFile: true,
      },
      {
        name: "3.3.2",
        label: "3.3.2 Record of Program Outcome Attainment",
        marks: 20,
        hasTable: true,
        hasFile: true,
        tableConfig: {
          type: "program-outcome-attainment",
          title: "Table 3.3.2.1: Program Outcome Attainment Record",
          description: "Record the attainment of program outcomes with respect to set attainment levels.",
          addRowLabel: "Add Program Outcome Record",
          columns: [
            { field: "po_code", header: "PO Code", placeholder: "PO1", width: "w-32" },
            { field: "direct_attainment", header: "Direct (%)", placeholder: "78", width: "w-24" },
            { field: "indirect_attainment", header: "Indirect (%)", placeholder: "82", width: "w-24" },
            { field: "overall_attainment", header: "Overall (%)", placeholder: "80", width: "w-24" },
            { field: "attainment_level", header: "Attainment Level", placeholder: "3", width: "w-24", type: "select", options: [
              { value: "1", label: "Level 1" },
              { value: "2", label: "Level 2" },
              { value: "3", label: "Level 3" },
            ]},
          ],
        },
      },
    ],
  };

  // ---------------- LOAD DATA ----------------
  const loadData = useCallback(async () => {
    if (!cycle_sub_category_id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const profileFlags = getAllProfileFlags();
      const userIsContributor = profileFlags?.isContributor || false;
      setIsContributor(userIsContributor);
      
      const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
      const userInfoo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const currentOtherStaffId = otherStaffId || userInfo?.rawData?.other_staff_id || userInfo.user_id || userInfoo?.other_staff_id;
      
      console.log("🟠 Criterion3_3Form - Loading data:");
      console.log("  - cycle_sub_category_id:", cycle_sub_category_id);
      console.log("  - otherStaffId (prop):", otherStaffId);
      console.log("  - currentOtherStaffId (final):", currentOtherStaffId);
      console.log("  - userIsContributor:", userIsContributor);
      
      const res = await newnbaCriteria3Service.getCriteria3_1_Data(cycle_sub_category_id, currentOtherStaffId);
      
      const rawResponse = res?.data || res || [];
      const d = Array.isArray(rawResponse) && rawResponse.length > 0 ? rawResponse[0] : rawResponse;
      
      console.log("🟢 Criterion3_3Form - Raw API Response:", rawResponse);
      console.log("🟢 Criterion3_3Form - Processed Data:", d);

   setTeaching_learning_quality_id(d.teaching_learning_quality_id || null);

      setInitialData({
        content: { "3.3": d.quality_processes_description || "" },
        tableData: [],
        filesByField: {
          "3.3": (d.quality_process_documents || []).length > 0
            ? (d.quality_process_documents || []).map((f, i) => ({
                id: `file-3.3-${i}`,
                filename: f.file_name || f.name || "",
                s3Url: f.file_url || f.url || "",
                // description: f.file_name || f.name || "",
                 url: f.file_url || f.url || "",
                description: f.description || "",
                uploading: false
              }))
            : [{ id: `file-3.3-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }]
        }
      });

    } catch (err) {
      console.warn("❌ Criterion3_3Form - API failed or returned 404, showing blank form", err);
      setTeaching_learning_quality_id(null);
      setInitialData({
        content: { "3.3": "" },
        tableData: [],
        filesByField: {
          "3.3": [{ id: `file-3.3-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }]
        }
      });
    } finally {
      setLoading(false);
    }
  }, [cycle_sub_category_id, otherStaffId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ---------------- SAVE DATA ----------------
  const handleSave = async (formData) => {
    setSaving(true);
    console.log(formData);
    try {
      const filesWithCategory = Object.keys(formData.filesByField || {}).flatMap(
        (field) =>
          (formData.filesByField[field] || []).map((file) => ({
            ...file,
            category: "Performance Analysis Documents",
          }))
      );
      console.log(filesWithCategory);
      const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
      const userInfoo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const staffId = otherStaffId || userInfo?.rawData?.other_staff_id || userInfo.user_id || userInfoo?.other_staff_id;

      const payload = {
        other_staff_id: staffId,
        cycle_sub_category_id,
        quality_processes_description: formData.content["3.3"] || "",
        quality_process_documents: filesWithCategory
          .filter((f) => f.url || f.s3Url)
          .map((f) => ({
            file_name: f.filename,
            file_url: f.s3Url || f.url,
            description: f.description || "",
          })),
      };
      console.log("🟠 Criterion3_3Form - Save payload:", payload);
      console.log("🟠 staffId to save:", staffId);

      const newFiles = filesWithCategory.filter((f) => f.file);

      if (teaching_learning_quality_id) {
        console.log("🟠 Updating existing record with ID:", teaching_learning_quality_id);
        await newnbaCriteria3Service.putCriteria3_1_Data(teaching_learning_quality_id, staffId, payload);
      } else {
        console.log("🟠 Creating new record");
        await newnbaCriteria3Service.saveCriteria3_1_Data(staffId, payload);
      }

      setAlert(
        <SweetAlert
          success
          title="Saved!"
          confirmBtnText="OK"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => setAlert(null)}
        >
          Criterion 3.3 saved successfully
        </SweetAlert>
      );

      await loadData();
      onSaveSuccess?.();

    } catch (err) {
      console.error(err);
      setAlert(
        <SweetAlert
          danger
          title="Save Failed"
          confirmBtnText="OK"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => setAlert(null)}
        >
          An error occurred while saving
        </SweetAlert>
      );
    } finally {
      setSaving(false);
    }
  };

  // ---------------- DELETE DATA ----------------
  const handleDelete = async () => {
    if (!teaching_learning_quality_id) {
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
            let res;
            if (isContributor) {
              res = await newnbaCriteria3Service.deleteStageCriteria3_1Data(
                teaching_learning_quality_id
              );
            } else {
              res = await newnbaCriteria3Service.deleteCriteria3_1Data(
                teaching_learning_quality_id
              );
            }

            let message = "Student Performance record deleted successfully.";
            if (typeof res === "string") message = res;
            else if (res?.data && typeof res.data === "string") message = res.data;

            setAlert(
              <SweetAlert
                success
                title="Deleted!"
                confirmBtnCssClass="btn-confirm"
                confirmBtnText="OK"
                onConfirm={() => setAlert(null)}
              >
                {message}
              </SweetAlert>
            );

            await loadData();
            setTeaching_learning_quality_id(null);
            onSaveSuccess?.();

          } catch (err) {
            console.error(err);
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

  // ---------------- UI ----------------
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
        saving={saving}
        isContributorEditable={isEditable}
        showFileCategories={true}
        onSave={handleSave}
        onDelete={handleDelete}
      />

      {alert}
    </div>
  );
};

export default Criterion3_3Form;