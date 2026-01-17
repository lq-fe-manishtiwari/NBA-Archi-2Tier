// src/screens/pages/NEWNBA/NEWNBA-Criterion2/Criterion2_2Form.jsx

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
    title: "2.2 Teaching–Learning Processes",
    totalMarks: 110,
    fields: [
      {
        name: "2.2.1",
        label: "2.2.1 Initiatives in Teaching and Learning Process",
        marks: 15,
        type: "editor",
        hasFile: true,
      },
      {
        name: "2.2.2",
        label: "2.2.2 Quality of Internal Semester Question Papers, Assignments and Evaluation",
        marks: 20,
        type: "editor",
        hasFile: true,
      },
      {
        name: "2.2.3",
        label: "2.2.3 Quality of Students Projects",
        marks: 25,
        type: "editor",
        hasFile: true,
      },
      {
        name: "2.2.4",
        label: "2.2.4 Initiatives Related to Profession Interaction",
        marks: 10,
        type: "editor",
        hasFile: true,
      },
      {
        name: "2.2.5",
        label: "2.2.5 Initiatives Related to Skill Development Programs/Professional Internships / Summer Training",
        marks: 20,
        type: "editor",
        hasFile: true,
      },
      {
        name: "2.2.6",
        label: "2.2.6 Quality of Studio Projects and Experiments",
        marks: 20,
        type: "editor",
        hasFile: true,
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
      const res = await newnbaCriteria2Service.getCriteria2_2_Data(cycle_sub_category_id, currentOtherStaffId);
      
      // Handle both array and object responses like Criterion1_1Form
      const rawResponse = res?.data || res || [];
      const d = Array.isArray(rawResponse) && rawResponse.length > 0 ? rawResponse[0] : rawResponse;
      
      console.log("🟢 Criterion2_2Form - Raw API Response:", rawResponse);
      console.log("🟢 Criterion2_2Form - Processed Data:", d);

      // If API returns nothing, show blank form
      setTeachingLearningQualityId(d.teaching_learning_process_id || null);

      setInitialData({
        content: {
          "2.2.1": d.initiatives_teaching_learning_process || "",
          "2.2.2": d.quality_internal_semester_question_papers || "",
          "2.2.3": d.quality_student_projects || "",
          "2.2.4": d.initiatives_industry_interaction || "",
          "2.2.5": d.initiatives_skill_development || "",
          "2.2.6": d.quality_experiments || "",
        },
        tableData: [],
        filesByField: {
          "2.2.1": (d.teaching_learning_process_document || []).filter(f => f.category === "Initiatives in Teaching and Learning Process").length > 0 
            ? (d.teaching_learning_process_document || []).filter(f => f.category === "Initiatives in Teaching and Learning Process").map((f, i) => ({
                id: `file-2.2.1-${i}`,
                name: f.name || f.file_name || "",
                filename: f.name || f.file_name || "",
                url: f.url || f.file_url || "",
                s3Url: f.url || f.file_url || "",
                description: f.description || "",
                uploading: false
              }))
            : [{ id: `file-2.2.1-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }],
          "2.2.2": (d.teaching_learning_process_document || []).filter(f => f.category === "Quality of Internal Semester Question Papers").length > 0
            ? (d.teaching_learning_process_document || []).filter(f => f.category === "Quality of Internal Semester Question Papers").map((f, i) => ({
                id: `file-2.2.2-${i}`,
                name: f.name || f.file_name || "",
                filename: f.name || f.file_name || "",
                url: f.url || f.file_url || "",
                s3Url: f.url || f.file_url || "",
                description: f.description || "",
                uploading: false
              }))
            : [{ id: `file-2.2.2-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }],
          "2.2.3": (d.teaching_learning_process_document || []).filter(f => f.category === "Quality of Students Projects").length > 0
            ? (d.teaching_learning_process_document || []).filter(f => f.category === "Quality of Students Projects").map((f, i) => ({
                id: `file-2.2.3-${i}`,
                name: f.name || f.file_name || "",
                filename: f.name || f.file_name || "",
                url: f.url || f.file_url || "",
                s3Url: f.url || f.file_url || "",
                description: f.description || "",
                uploading: false
              }))
            : [{ id: `file-2.2.3-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }],
          "2.2.4": (d.teaching_learning_process_document || []).filter(f => f.category === "Initiatives Related to Profession Interaction").length > 0
            ? (d.teaching_learning_process_document || []).filter(f => f.category === "Initiatives Related to Profession Interaction").map((f, i) => ({
                id: `file-2.2.4-${i}`,
                name: f.name || f.file_name || "",
                filename: f.name || f.file_name || "",
                url: f.url || f.file_url || "",
                s3Url: f.url || f.file_url || "",
                description: f.description || "",
                uploading: false
              }))
            : [{ id: `file-2.2.4-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }],
          "2.2.5": (d.teaching_learning_process_document || []).filter(f => f.category === "Initiatives Related to Skill Development").length > 0
            ? (d.teaching_learning_process_document || []).filter(f => f.category === "Initiatives Related to Skill Development").map((f, i) => ({
                id: `file-2.2.5-${i}`,
                name: f.name || f.file_name || "",
                filename: f.name || f.file_name || "",
                url: f.url || f.file_url || "",
                s3Url: f.url || f.file_url || "",
                description: f.description || "",
                uploading: false
              }))
            : [{ id: `file-2.2.5-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }],
          "2.2.6": (d.teaching_learning_process_document || []).filter(f => f.category === "Quality of Studio Projects").length > 0
            ? (d.teaching_learning_process_document || []).filter(f => f.category === "Quality of Studio Projects").map((f, i) => ({
                id: `file-2.2.6-${i}`,
                name: f.name || f.file_name || "",
                filename: f.name || f.file_name || "",
                url: f.url || f.file_url || "",
                s3Url: f.url || f.file_url || "",
                description: f.description || "",
                uploading: false
              }))
            : [{ id: `file-2.2.6-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }],
        }
      });

    } catch (err) {
      console.warn("❌ Criterion2_2Form - API failed or returned 404, showing blank form", err);
      setTeachingLearningQualityId(null);
      setInitialData({
        content: {
          "2.2.1": "",
          "2.2.2": "",
          "2.2.3": "",
          "2.2.4": "",
          "2.2.5": "",
          "2.2.6": "",
        },
        tableData: [],
        filesByField: {
          "2.2.1": [{ id: `file-2.2.1-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }],
          "2.2.2": [{ id: `file-2.2.2-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }],
          "2.2.3": [{ id: `file-2.2.3-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }],
          "2.2.4": [{ id: `file-2.2.4-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }],
          "2.2.5": [{ id: `file-2.2.5-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }],
          "2.2.6": [{ id: `file-2.2.6-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }],
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
      const filesWithCategory = Object.keys(formData.filesByField || {}).flatMap(fieldName => {
        return (formData.filesByField[fieldName] || []).map(file => {
          let category = "Other";
          if (fieldName === "2.2.1") category = "Initiatives in Teaching and Learning Process";
          if (fieldName === "2.2.2") category = "Quality of Internal Semester Question Papers";
          if (fieldName === "2.2.3") category = "Quality of Students Projects";
          if (fieldName === "2.2.4") category = "Initiatives Related to Profession Interaction";
          if (fieldName === "2.2.5") category = "Initiatives Related to Skill Development";
          if (fieldName === "2.2.6") category = "Quality of Studio Projects";
  
          return { ...file, category };
        });
      });
      console.log(filesWithCategory);
          const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
      const userInfoo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const staffId = otherStaffId || userInfo?.rawData?.other_staff_id || userInfo.user_id || userInfoo?.other_staff_id;

      const payload = {
        other_staff_id: staffId,
        cycle_sub_category_id,
        initiatives_teaching_learning_process: formData.content["2.2.1"] || "",
        quality_internal_semester_question_papers: formData.content["2.2.2"] || "",
        quality_student_projects: formData.content["2.2.3"] || "",
        initiatives_industry_interaction: formData.content["2.2.4"] || "",
        initiatives_skill_development: formData.content["2.2.5"] || "",
        quality_experiments: formData.content["2.2.6"] || "",
        teaching_learning_process_document: filesWithCategory
          .filter(f => f.url || f.s3Url)
          .map(f => ({ 
              name: f.filename || f.name, 
              url: f.s3Url || f.url, 
              description: f.description || "",
              category: f.category 
          })),
      };
      console.log("🟠 Criterion2_2Form - Save payload:", payload);
      console.log("🟠 staffId to save:", staffId);

      // Call appropriate API based on whether record exists
      if (teachingLearningQualityId) {
        console.log("🟠 Updating existing record with ID:", teachingLearningQualityId);
        await newnbaCriteria2Service.putCriteria2_2_Data(teachingLearningQualityId, staffId, payload);
      } else {
        console.log("🟠 Creating new record");
        await newnbaCriteria2Service.saveCriteria2_2_Data(staffId, payload);
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
            // Call delete API
            const res = await newnbaCriteria2Service.deleteCriteria2_2Data(
              teachingLearningQualityId
            );

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