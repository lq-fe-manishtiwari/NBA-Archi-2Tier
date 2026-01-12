// src/screens/pages/NEWNBA/NEWNBA-Criterion2/Criterion2_1Form.jsx

import React, { useState, useEffect, useCallback } from "react";
import GenericCriteriaForm from "../GenericCriteriaForm";
import { newnbaCriteria2Service } from "../../Services/NewNBA-Criteria2.service";
import SweetAlert from "react-bootstrap-sweetalert";
import { getAllProfileFlags } from "@/_services/adminProfileUtils";

const Criterion2_2Form = ({
  cycle_sub_category_id,
  isEditable = true,
  onSaveSuccess,
  otherStaffId = null,
  showCardView = false,
  onCardClick = null,
  editMode = false,
  teachingLearningQualityId: propTeachingLearningQualityId = null,
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [teachingLearningQualityId, setTeachingLearningQualityId] = useState(null);
  const [initialData, setInitialData] = useState({
    content: {},
    tableData: [],
    filesByField: {},
  });
  const [alert, setAlert] = useState(null);
  const [isContributor, setIsContributor] = useState(false);

  const config = {
    title: "2.2. Quality of Student Capstone Project",
    totalMarks: 25,
    fields: [
      {
        name: "2.2",
        label: "Describe Processes Followed",
        marks: 25,
        type: "textarea",
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
      
      // Check if user is contributor
      const profileFlags = getAllProfileFlags();
      const userIsContributor = profileFlags?.isContributor || false;
      setIsContributor(userIsContributor);
      
      // Determine staff ID to use - otherStaffId has priority
      const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
      const userInfoo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const currentOtherStaffId = otherStaffId || userInfo?.rawData?.other_staff_id || userInfo.user_id || userInfoo?.other_staff_id;
      
      console.log("🟠 Criterion2_2Form - Loading data:");
      console.log("  - cycle_sub_category_id:", cycle_sub_category_id);
      console.log("  - otherStaffId (prop):", otherStaffId);
      console.log("  - currentOtherStaffId (final):", currentOtherStaffId);
      console.log("  - userIsContributor:", userIsContributor);
      
      // Call API with staff ID
      const res = await newnbaCriteria2Service.getCriteria2_1_Data(cycle_sub_category_id, currentOtherStaffId);
      
      // Handle both array and object responses like Criterion1_1Form
      const rawResponse = res?.data || res || [];
      const d = Array.isArray(rawResponse) && rawResponse.length > 0 ? rawResponse[0] : rawResponse;
      
      console.log("🟢 Criterion2_2Form - Raw API Response:", rawResponse);
      console.log("🟢 Criterion2_2Form - Processed Data:", d);

      // If API returns nothing, show blank form
      setTeachingLearningQualityId(d.teaching_learning_quality_id || null);

      setInitialData({
        content: { "2.2": d.quality_processes_description || "" },
        tableData: [],
        filesByField: {
          "2.2": (d.quality_process_documents || []).length > 0
            ? (d.quality_process_documents || []).map((f, i) => ({
                id: `file-2.2-${i}`,
                filename: f.file_name || f.name || "",
                s3Url: f.file_url || f.url || "",
                 url: f.file_url || f.url || "",
                
                description: f.description || "",
                uploading: false
              }))
            : [{ id: `file-2.2-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }]
        }
      });

    } catch (err) {
      console.warn("❌ Criterion2_2Form - API failed or returned 404, showing blank form", err);
      setTeachingLearningQualityId(null);
      setInitialData({
        content: { "2.2": "" },
        tableData: [],
        filesByField: {
          "2.2": [{ id: `file-2.2-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }]
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
            category: "Teaching-Learning Processes",
          }))
      );
      console.log(filesWithCategory);
          const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
      const userInfoo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const staffId = otherStaffId || userInfo?.rawData?.other_staff_id || userInfo.user_id || userInfoo?.other_staff_id;

      const payload = {
        other_staff_id: staffId,
        cycle_sub_category_id,
        quality_processes_description: formData.content["2.2"] || "",
        quality_process_documents: filesWithCategory
          .filter((f) => f.url || f.s3Url)
          .map((f) => ({
            file_name: f.filename,
            file_url: f.s3Url || f.url,
            description: f.description || "",
          })),
      };
      console.log("🟠 Criterion2_2Form - Save payload:", payload);
      console.log("🟠 staffId to save:", staffId);

      const newFiles = filesWithCategory.filter((f) => f.file);

      // Call appropriate API based on whether record exists
      if (teachingLearningQualityId) {
        console.log("🟠 Updating existing record with ID:", teachingLearningQualityId);
        await newnbaCriteria2Service.putCriteria2_1_Data(teachingLearningQualityId, staffId, payload);
      } else {
        console.log("🟠 Creating new record");
        await newnbaCriteria2Service.saveCriteria2_1_Data(staffId, payload);
      }

      setAlert(
        <SweetAlert
          success
          title="Saved!"
          confirmBtnText="OK"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => setAlert(null)}
        >
          Criterion 2.2 saved successfully
        </SweetAlert>
      );

      // Reload data to get updated ID for delete functionality
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
    if (!teachingLearningQualityId) {
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
            // Call appropriate API based on user role
            let res;
            if (isContributor) {
              res = await newnbaCriteria2Service.deleteStageCriteria2_1Data(
                teachingLearningQualityId
              );
            } else {
              res = await newnbaCriteria2Service.deleteCriteria2_1Data(
                teachingLearningQualityId
              );
            }

          // Handle plain text response
            let message = "Record deleted successfully.";
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
            setTeachingLearningQualityId(null);
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
        Loading Criterion 2.2...
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
        onDelete={handleDelete} // Optional: pass delete handler
      />

      {alert}
    </div>
  );
};

export default Criterion2_2Form;
