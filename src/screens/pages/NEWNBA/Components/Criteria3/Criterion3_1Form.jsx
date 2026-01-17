// src/screens/pages/NEWNBA/Components/Criteria3/Criterion3_1Form.jsx

import React, { useState, useEffect, useCallback } from "react";
import GenericCriteriaForm from "../GenericCriteriaForm";
import { newnbaCriteria3Service } from "../../Services/NewNBA-Criteria3.service";
import SweetAlert from "react-bootstrap-sweetalert";
import { getAllProfileFlags } from "@/_services/adminProfileUtils";

const Criterion3_1Form = ({
  cycle_sub_category_id,
  isEditable = true,
  onSaveSuccess,
  otherStaffId = null,
  showCardView = true,
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
  title: "3.1 Course Outcomes and Program Outcomes Mapping",
  totalMarks: 20,
  fields: [
    /* ============================================================
       3.1.1 COURSE OUTCOMES
    ============================================================ */

    {
      name: "3.1.1",
      label:
        "3.1.1 Course Outcomes (05)",
      marks: 5,
      hasTable: true,
      hasFile: true,
      tableConfig: {
        title: "Table No.3.1.1: List of Course Outcomes",
        subtitle:
          "SAR should include Course Outcomes of one course from each semester. Each course is expected to have 4–6 outcomes.",
        addRowLabel: "Add Course Outcome",
        columns: [
          {
            field: "course_code",
            header: "Course Code",
            placeholder: "C202",
            width: "w-24",
          },
          {
            field: "course_name",
            header: "Course Name",
            placeholder: "Data Structures",
            width: "w-48",
          },
          {
            field: "year_of_study",
            header: "Year of Study",
            placeholder: "2020–21",
            width: "w-28",
          },
          {
            field: "co_code",
            header: "CO Code",
            placeholder: "C202.1",
            width: "w-24",
          },
          {
            field: "co_statement",
            header: "Course Outcome Statement",
            placeholder: "Apply data structures to solve real-world problems",
            width: "w-96",
          },
        ],
      },
    },

    /* ============================================================
       3.1.2 CO–PO MATRIX (SELECTED COURSES)
    ============================================================ */

    {
      name: "3.1.2",
      label:
        "3.1.2 CO–PO Matrices of Courses Selected in 3.1.1 (05)",
      marks: 5,
      hasTable: true,
      hasFile: true,
      tableConfig: {
        title: "Table No.3.1.2: CO–PO Matrices of Selected Courses",
        subtitle:
          "Enter mapping strength as 1 (Low), 2 (Medium), 3 (High) or '-' for no correlation.",
        addRowLabel: "Add CO–PO Mapping",
        columns: [
          {
            field: "co_code",
            header: "CO",
            placeholder: "C202.1",
            width: "w-24",
          },
          ...Array.from({ length: 11 }, (_, i) => ({
            field: `PO${i + 1}`,
            header: `PO${i + 1}`,
            width: "w-16",
            type: "select",
            options: [
              { value: "-", label: "-" },
              { value: "1", label: "Low (1)" },
              { value: "2", label: "Medium (2)" },
              { value: "3", label: "High (3)" },
            ],
          })),
        ],
      },
    },

    /* ============================================================
       3.1.3 COURSE–PO MATRIX (ALL YEARS)
    ============================================================ */

    {
      name: "3.1.3",
      label:
        "3.1.3 Course–PO Matrix of All Five Years of Study (10)",
      marks: 10,
      hasTable: true,
      hasFile: true,
      tableConfig: {
        title: "Table No.3.1.3: Course–PO Matrix of All Five Years of Study",
        subtitle:
          "Correlation levels: 1 (Low), 2 (Medium), 3 (High). Use '-' if no correlation. Data should be consistent with Table 3.1.2.",
        addRowLabel: "Add Course–PO Mapping",
        columns: [
          {
            field: "course_code",
            header: "Course Code",
            placeholder: "C101 / C202 / C409",
            width: "w-28",
          },
          ...Array.from({ length: 11 }, (_, i) => ({
            field: `PO${i + 1}`,
            header: `PO${i + 1}`,
            width: "w-16",
            type: "select",
            options: [
              { value: "-", label: "-" },
              { value: "1", label: "Low (1)" },
              { value: "2", label: "Medium (2)" },
              { value: "3", label: "High (3)" },
            ],
          })),
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
      
      // Check if user is contributor
      const profileFlags = getAllProfileFlags();
      const userIsContributor = profileFlags?.isContributor || false;
      setIsContributor(userIsContributor);
      
      // Determine staff ID to use - otherStaffId has priority
      const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
      const userInfoo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const currentOtherStaffId = otherStaffId || userInfo?.rawData?.other_staff_id || userInfo.user_id || userInfoo?.other_staff_id;
      
      console.log("🟠 Criterion3_1Form - Loading data:");
      console.log("  - cycle_sub_category_id:", cycle_sub_category_id);
      console.log("  - otherStaffId (prop):", otherStaffId);
      console.log("  - currentOtherStaffId (final):", currentOtherStaffId);
      console.log("  - userIsContributor:", userIsContributor);
      
      // Call API with staff ID
      const res = await newnbaCriteria3Service.getCriteria3_1_Data(cycle_sub_category_id, currentOtherStaffId);
      
      // Handle both array and object responses
      const rawResponse = res?.data || res || [];
      let d;
      if (Array.isArray(rawResponse) && rawResponse.length > 0) {
        // Sort by updated_at descending to get the latest
        const sorted = rawResponse.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        d = sorted[0];
      } else {
        d = rawResponse;
      }
      
      console.log("🟢 Criterion3_1Form - Raw API Response:", rawResponse);
      console.log("🟢 Criterion3_1Form - Processed Data:", d);

      // If API returns nothing, show blank form
      setTeaching_learning_quality_id(d.course_outcome_correlation_id || null);

      setInitialData({
        content: {},
        tableData: {
          "3.1.1": d.course_outcomes || [],
          "3.1.2": d.co_po_matrices || [],
          "3.1.3": d.course_po_matrix || [],
        },
        filesByField: {
          "3.1.1": (d.course_outcome_document || []).length > 0
            ? (d.course_outcome_document || []).map((f, i) => ({
                id: `file-3.1.1-${i}`,
                filename: f.file_name || f.name || "",
                s3Url: f.file_url || f.url || "",
                url: f.file_url || f.url || "",
                description: f.description || "",
                uploading: false
              }))
            : [{ id: `file-3.1.1-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }],
          "3.1.2": [{ id: `file-3.1.2-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }],
          "3.1.3": [{ id: `file-3.1.3-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }],
        }
      });

    } catch (err) {
      console.warn("❌ Criterion3_1Form - API failed or returned 404, showing blank form", err);
      setTeaching_learning_quality_id(null);
      setInitialData({
        content: {},
        tableData: {
          "3.1.1": [],
          "3.1.2": [],
          "3.1.3": [],
        },
        filesByField: {
          "3.1.1": [{ id: `file-3.1.1-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }],
          "3.1.2": [{ id: `file-3.1.2-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }],
          "3.1.3": [{ id: `file-3.1.3-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }],
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
            category: "Assessment Documents",
          }))
      );
      console.log(filesWithCategory);
      const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
      const userInfoo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const staffId = otherStaffId || userInfo?.rawData?.other_staff_id || userInfo.user_id || userInfoo?.other_staff_id;

      const payload = {
        other_staff_id: staffId,
        cycle_sub_category_id,
        course_outcomes: formData.tableData["3.1.1"] || [],
        co_po_matrices: formData.tableData["3.1.2"] || [],
        course_po_matrix: formData.tableData["3.1.3"] || [],
        course_outcome_document: filesWithCategory
          .filter((f) => f.url || f.s3Url)
          .map((f) => ({
            file_name: f.filename,
            file_url: f.s3Url || f.url,
            description: f.description || "",
          })),
      };
      console.log("🟠 Criterion3_1Form - Save payload:", payload);
      console.log("🟠 staffId to save:", staffId);

      const newFiles = filesWithCategory.filter((f) => f.file);

      // Call appropriate API based on whether record exists
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
          Criterion 3.1 saved successfully
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

          // Handle plain text response
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
        Loading Criterion 3.1...
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

export default Criterion3_1Form;