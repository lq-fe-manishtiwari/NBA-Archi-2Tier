import React, { useState, useEffect, useCallback } from "react";
import GenericCriteriaForm from "../GenericCriteriaForm";
import { newnbaCriteria3Service } from "../../Services/NewNBA-Criteria3.service";
import SweetAlert from "react-bootstrap-sweetalert";
import { getAllProfileFlags } from "@/_services/adminProfileUtils";

const Criterion3_2Form = ({
  cycle_sub_category_id,
  isEditable = true,
  onSaveSuccess,
  otherStaffId = null,
  showCardView = false,
  onCardClick = null,
  editMode = false,
  teaching_learning_quality_id: propTeachingLearningQualityId = null,
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [attainmentCoId, setAttainmentCoId] = useState(null);
  const [initialData, setInitialData] = useState({
    content: {},
    tableData: {},
    filesByField: {},
  });
  const [alert, setAlert] = useState(null);
  const [isContributor, setIsContributor] = useState(false);

  const config = {
    title: "3.2. Attainment of Course Outcomes",
    totalMarks: 25,
    fields: [
      {
        name: "3.2.1",
        label: "3.2.1 Describe the Assessment Tools and Processes Used to Gather the Data for the Evaluation of Course Outcome",
        marks: 5,
        type: "textarea",
        hasFile: true,
      },
      {
        name: "3.2.2",
        label: "3.2.2 Record the Attainment of Course Outcomes of all Courses with Respect to Set Attainment Levels",
        marks: 20,
        hasTable: true,
        hasFile: true, // ← important
        tableConfig: {
          type: "course-outcome-attainment",
          title: "Table 3.2.2.1: Course Outcome Attainment Record",
          description: "Record the attainment of course outcomes for all courses with respect to set attainment levels.",
          addRowLabel: "Add Course Record",
          columns: [
            { field: "course_code", header: "Course Code", placeholder: "CS301", width: "w-32" },
            { field: "co1", header: "CO1 (%)", placeholder: "78", width: "w-20" },
            { field: "co2", header: "CO2 (%)", placeholder: "82", width: "w-20" },
            { field: "co3", header: "CO3 (%)", placeholder: "75", width: "w-20" },
            { field: "co4", header: "CO4 (%)", placeholder: "88", width: "w-20" },
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

  // Helper: Always show at least one empty file upload row
  const ensureFileUploadSlot = (files = []) => {
    if (Array.isArray(files) && files.length > 0) {
      return files.map((f, i) => ({
        id: `file-${Date.now()}-${i}`,
        filename: f.file_name || f.filename || "",
        file: null,
        s3Url: f.file_url || f.s3Url || f.url || "",
        url: f.file_url || f.url || "",
        description: f.description || "",
        uploading: false,
      }));
    }

    return [
      {
        id: `file-empty-${Date.now()}`,
        filename: "",
        file: null,
        s3Url: "",
        url: "",
        description: "",
        uploading: false,
      },
    ];
  };

  // ────────────────────────────────────────────────
  //                   LOAD DATA
  // ────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    if (!cycle_sub_category_id) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const profileFlags = getAllProfileFlags();
      const userIsContributor = profileFlags?.isContributor || false;
      setIsContributor(userIsContributor);

      const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}");
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");

      const staffId =
        otherStaffId ||
        userProfile?.rawData?.other_staff_id ||
        userProfile?.user_id ||
        userInfo?.other_staff_id;

      const res = await newnbaCriteria3Service.getCriteria3_2_Data(cycle_sub_category_id, staffId);
      const data = res[0] || null;
       console.log(res);
      const attainmentId = data?.id || data?.id || null;
      console.log(attainmentId);
      setAttainmentCoId(attainmentId);

      let descriptionText = "";
      if (Array.isArray(data?.description_assessment_process) && data.description_assessment_process.length > 0) {
        descriptionText = data.description_assessment_process[0]?.description || "";
      } else if (typeof data?.description_assessment_process === "string") {
        descriptionText = data.description_assessment_process;
      }

      setInitialData({
        content: {
          "3.2.1": descriptionText,
        },
        tableData: {
          "3.2.2": Array.isArray(data?.record_attainment_course_outcomes)
            ? data.record_attainment_course_outcomes.map(item => ({
                ...item,
                co1: String(item.co1 ?? ""),
                co2: String(item.co2 ?? ""),
                co3: String(item.co3 ?? ""),
                co4: String(item.co4 ?? ""),
                attainment_level: String(item.attainment_level ?? "1"),
              }))
            : [],
        },
        filesByField: {
          "3.2.1": ensureFileUploadSlot(data?.description_assessment_process_document),
          "3.2.2": ensureFileUploadSlot(data?.record_attainment_course_outcomes_document || []), // ← NEW: for table 3.2.2
        },
      });
    } catch (err) {
      console.error("[Criterion 3.2] Load failed:", err);
      setAttainmentCoId(null);

      setInitialData({
        content: { "3.2.1": "" },
        tableData: { "3.2.2": [] },
        filesByField: {
          "3.2.1": ensureFileUploadSlot(),
          "3.2.2": ensureFileUploadSlot(), // ← NEW
        },
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
      const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}");
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");

      const staffId =
        otherStaffId ||
        userProfile?.rawData?.other_staff_id ||
        userProfile?.user_id ||
        userInfo?.other_staff_id;

      // Files for 3.2.1 (description)
      const descriptionFiles = (formData.filesByField["3.2.1"] || [])
        .filter(f => f.s3Url || f.url)
        .map(f => ({
          file_name: (f.filename || "").trim(),
          file_url: (f.s3Url || f.url || "").trim(),
          description: (f.description || "").trim(),
        }));

      // Files for 3.2.2 (table)  ← NEW
      const tableFiles = (formData.filesByField["3.2.2"] || [])
        .filter(f => f.s3Url || f.url)
        .map(f => ({
          file_name: (f.filename || "").trim(),
          file_url: (f.s3Url || f.url || "").trim(),
          description: (f.description || "").trim(),
        }));

      const payload = {
        other_staff_id: Number(staffId),
        cycle_sub_category_id: Number(cycle_sub_category_id),

        ...(propTeachingLearningQualityId && {
          teaching_learning_quality_id: Number(propTeachingLearningQualityId),
        }),

        description_assessment_process: formData.content["3.2.1"]?.trim()
          ? [{ description: formData.content["3.2.1"].trim() }]
          : [],

        record_attainment_course_outcomes: (formData.tableData["3.2.2"] || []).map(item => ({
          course_code: String(item.course_code || "").trim(),
          co1: Number(item.co1) || 0,
          co2: Number(item.co2) || 0,
          co3: Number(item.co3) || 0,
          co4: Number(item.co4) || 0,
          attainment_level: String(item.attainment_level || "1"),
        })),

        description_assessment_process_document: descriptionFiles,          // for 3.2.1
        record_attainment_course_outcomes_document: tableFiles,         // for 3.2.2  ← NEW (adjust name if backend uses different field)
      };

      console.log("[Criterion 3.2] Saving payload:", JSON.stringify(payload, null, 2));

      let response;

      if (attainmentCoId) {
        response = await newnbaCriteria3Service.putCriteria3_2_Data(
          attainmentCoId,
          staffId,
          payload
        );
      } else {
        response = await newnbaCriteria3Service.saveCriteria3_2_Data(staffId, payload);
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
            Criterion 3.2 saved successfully.
          </SweetAlert>
        );

        await loadData();

        if (isContributor) {
          try {
            const updatedId = response?.id || attainmentCoId;
            if (updatedId) {
              await newnbaCriteria3Service.updateCriteria3_2_Status({
                id: updatedId,
                approval_status: "APPROVED",
                approved_by: staffId,
                approved_by_name: userProfile?.name || userProfile?.rawData?.name || "",
              }, staffId);
            }
          } catch (approveErr) {
            console.error("[Criterion 3.2] Auto-approve failed:", approveErr);
          }
        }
      } else {
        throw new Error(response?.message || "Save failed");
      }
    } catch (err) {
      console.error("[Criterion 3.2] Save failed:", err);
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

  const handleDelete = async () => {
    if (!attainmentCoId) {
      setAlert(
        <SweetAlert
          info
          title="Nothing to Delete"
          confirmBtnText="OK"
          onConfirm={() => setAlert(null)}
        >
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
            const res = await newnbaCriteria3Service.deleteCriteria3_2_Data(attainmentCoId);

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

            setAttainmentCoId(null);
            await loadData();
            onSaveSuccess?.();
          } catch (err) {
            console.error("[Criterion 3.2] Delete failed:", err);
            setAlert(
              <SweetAlert
                danger
                title="Delete Failed"
                confirmBtnText="OK"
                onConfirm={() => setAlert(null)}
              >
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
        Loading Criterion 3.2...
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

export default Criterion3_2Form;