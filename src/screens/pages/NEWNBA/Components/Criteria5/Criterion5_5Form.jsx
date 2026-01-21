// src/screens/pages/NEWNBA/Components/Criteria3/Criterion5_5Form.jsx

import React, { useState, useEffect, useCallback } from "react";
import GenericCriteriaForm from "../GenericCriteriaForm";
import { newnbaCriteria5Service } from "../../Services/NewNBA-Criteria5.service";
import SweetAlert from "react-bootstrap-sweetalert";
import { getAllProfileFlags } from "@/_services/adminProfileUtils";

const Criterion5_5Form = ({
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
    title: "5.5 Innovations by the Faculty in Teaching and Learning (15)",
    totalMarks: 15,
    fields: [
        {
        name: "5.5",
        label: "5.5 Innovations by the Faculty in Teaching and Learning (15)",
        marks: 15,
        type: "textarea",
      },
    ]
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
      
      console.log("🟠 Criterion5_5Form - Loading data:");
      console.log("  - cycle_sub_category_id:", cycle_sub_category_id);
      console.log("  - otherStaffId (prop):", otherStaffId);
      console.log("  - currentOtherStaffId (final):", currentOtherStaffId);
      console.log("  - userIsContributor:", userIsContributor);
      
      const res = await newnbaCriteria5Service.getCriteria5_5_Data(cycle_sub_category_id, currentOtherStaffId);
      
      const rawResponse = res?.data || res || [];
      const d = Array.isArray(rawResponse) && rawResponse.length > 0 ? rawResponse[0] : rawResponse;
      
      console.log("🟢 Criterion5_5Form - Raw API Response:", rawResponse);
      console.log("🟢 Criterion5_5Form - Processed Data:", d);

      setTeaching_learning_quality_id(d.id || null);

      setInitialData({
        content: { "5.5": d.innovations_teaching_learning || "" },
        tableData: [],
        filesByField: {
          "5.5": (d.innovations_document || []).length > 0
            ? (d.innovations_document || []).map((f, i) => ({
                id: `file-5.5-${i}`,
                filename: f.file_name || f.name || "",
                s3Url: f.file_url || f.url || "",
                // description: f.file_name || f.name || "",
                 url: f.file_url || f.url || "",
                description: f.description || "",
                uploading: false
              }))
            : [{ id: `file-5.5-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }]
        }
      });

    } catch (err) {
      console.warn("❌ Criterion5_5Form - API failed or returned 404, showing blank form", err);
      setTeaching_learning_quality_id(null);
      setInitialData({
        content: { "5.5": "" },
        tableData: [],
        filesByField: {
          "5.5": [{ id: `file-5.5-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }]
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
            category: "Performance Monitoring Documents",
          }))
      );
      console.log(filesWithCategory);
      const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
      const userInfoo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const staffId = otherStaffId || userInfo?.rawData?.other_staff_id || userInfo.user_id || userInfoo?.other_staff_id;

      const payload = {
        other_staff_id: staffId,
        cycle_sub_category_id,
        innovations_teaching_learning: formData.content["5.5"] || "",
        innovations_document: filesWithCategory
          .filter((f) => f.url || f.s3Url)
          .map((f) => ({
            file_name: f.filename,
            file_url: f.s3Url || f.url,
            description: f.description || "",
          })),
      };
      console.log("🟠 Criterion5_5Form - Save payload:", payload);
      console.log("🟠 staffId to save:", staffId);

      const newFiles = filesWithCategory.filter((f) => f.file);

      if (teaching_learning_quality_id) {
        console.log("🟠 Updating existing record with ID:", teaching_learning_quality_id);
        await newnbaCriteria5Service.updateCriteria5_5_Data(teaching_learning_quality_id,payload,staffId, );
      } else {
        console.log("🟠 Creating new record");
        await newnbaCriteria5Service.saveCriteria5_5_Data(payload,staffId);
      }

      setAlert(
        <SweetAlert
          success
          title="Saved!"
          confirmBtnText="OK"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => setAlert(null)}
        >
          Criterion 5.5 saved successfully
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
              res = await newnbaCriteria5Service.deleteStageCriteria5_5Data(
                teaching_learning_quality_id
              );
            } else {
              res = await newnbaCriteria5Service.deleteCriteria5_5Data(
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
        Loading Criterion 5.5...
      </div>
    );
  }

  return (
    <div>
      <GenericCriteriaForm
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

export default Criterion5_5Form;