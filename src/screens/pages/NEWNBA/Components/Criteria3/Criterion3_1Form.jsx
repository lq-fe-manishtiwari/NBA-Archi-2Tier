// src/screens/pages/NEWNBA/Components/Criteria3/Criterion3_1Form.jsx

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import SweetAlert from "react-bootstrap-sweetalert";
import { newnbaCriteria3Service } from "../../Services/NewNBA-Criteria3.service";
import { POService } from "../../../OBE/Settings/Services/po.service";
import { PSOService } from "../../../OBE/Settings/Services/pso.service";
import { newnbaCriteria1Service } from "../../Services/NewNBA-Criteria1.service";
import GenericCriteriaForm3_1 from "./GenericCriteriaForm3_1";

const Criterion3_1Form = ({
  cycle_sub_category_id,
  isEditable = true,
  onSaveSuccess,
  otherStaffId = null,
  programId = null,
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [correlationId, setCorrelationId] = useState(null);
  const [alert, setAlert] = useState(null);

  const [initialData, setInitialData] = useState({
    tableData: {
      "3.1.1": [],
      "3.1.2": [],
      "3.1.3": [],
    },
    filesByField: {
      "3.1.1": [],
      "3.1.2": [],
      "3.1.3": [],
    },
  });

  const [poData, setPoData] = useState([]);
  const [psoData, setPsoData] = useState([]);
  const [programCourseOutcomes, setProgramCourseOutcomes] = useState([]);

  /* ---------------- CONFIG ---------------- */

  const config = {
    title: "3.1. Establish the Correlation between the Courses and the Program Outcomes (20)",
    totalMarks: 20,
    fields: [
      {
        name: "3.1.1",
        label:
          "3.1.1. Course Outcomes (SAR Should include Course Outcomes of One Course from Each Semester of Study, however, should be Prepared for all Courses) (05)",
        marks: 5,
        hasTable: true,
        hasFile: true,
        tableConfig: {
          title: "Table No.3.1.1: List of Course Outcomes",
          addRowLabel: "Add Course Outcome",
          columns: [
            { field: "course_code", header: "Course Code", width: "w-28" },
            { field: "course_name", header: "Course Name", width: "w-64" },
            { field: "year_of_study", header: "Year / Semester", width: "w-40" },
            { field: "co_code", header: "CO Code", width: "w-28" },
            { field: "co_statement", header: "CO Statement", width: "w-96" },
          ],
        },
      },
      {
        name: "3.1.2",
        label:
          "3.1.2. CO-PO Matrices of Courses Selected in 3.1.1 (Ten Matrices to be Mentioned; One per Semester from 1st to 10th Semester) (05)",
        marks: 5,
        hasTable: true,
        hasFile: true,
        tableConfig: {
          title: "Table No.3.1.2: CO–PO Matrix",
          addRowLabel: "Add Mapping Row",
          columns: [
            { field: "co_code", header: "CO", width: "w-28" },
            ...Array.from({ length: 12 }, (_, i) => ({
              field: `PO${i + 1}`,
              header: `PO${i + 1}`,
              width: "w-16",
              type: "select",
              options: ["-", "1", "2", "3"].map((v) => ({ value: v, label: v })),
            })),
          ],
        },
      },
      {
        name: "3.1.3",
        label: "3.1.3. Course-PO Matrix of all Five Years of Study (10)",
        marks: 10,
        hasTable: true,
        hasFile: true,
        tableConfig: {
          title: "Table No.3.1.3: Course–PO Matrix",
          addRowLabel: "Add Course Mapping",
          columns: [
            { field: "course_code", header: "Course Code", width: "w-32" },
            ...Array.from({ length: 12 }, (_, i) => ({
              field: `PO${i + 1}`,
              header: `PO${i + 1}`,
              width: "w-16",
              type: "select",
              options: ["-", "1", "2", "3"].map((v) => ({ value: v, label: v })),
            })),
          ],
        },
      },
    ],
  };

  /* ---------------- HELPERS ---------------- */

  const getStaffId = () =>
    otherStaffId ||
    JSON.parse(localStorage.getItem("userProfile") || "{}")?.rawData?.other_staff_id ||
    JSON.parse(localStorage.getItem("userInfo") || "{}")?.other_staff_id;

  const ensureFileUploadSlot = (files = []) => {
    const normalized = (files || []).map((f, i) => {
      const url = f.file_url || f.url || f.s3Url || "";
      return {
        id: `file-${i}-${Date.now() + Math.random()}`,
        filename: f.file_name || f.name || (url ? url.split("/").pop() : ""),
        s3Url: url,
        description: f.description || "",
        uploading: false,
        file: null,
      };
    });

    return normalized.length > 0
      ? normalized
      : [
          {
            id: `file-empty-${Date.now()}`,
            filename: "",
            s3Url: "",
            description: "",
            uploading: false,
            file: null,
          },
        ];
  };

  const mapCourseOutcomesTo311 = (data = []) =>
    data.map((co) => ({
      course_code: co.subject?.subject_code || co.subject?.subjectCode || "",
      course_name: co.subject?.name || "",
      year_of_study: co.subject?.semester
        ? `Semester ${co.subject.semester.semester_number} (${co.subject.semester.name})`
        : "",
      co_code: co.co_code || co.coCode || "",
      co_statement: co.co_statement || co.coStatement || "",
    }));

  const buildCoPoMatrix312 = (mapping = []) => {
    const rows = {};
    mapping.forEach((m) => {
      const coCode = m.co?.coCode || m.co_code;
      if (!coCode) return;
      if (!rows[coCode]) {
        rows[coCode] = { co_code: coCode };
        for (let i = 1; i <= 12; i++) rows[coCode][`PO${i}`] = "-";
      }
      const poCode = m.po?.poCode;
      if (poCode) rows[coCode][poCode] = m.correlationLevel || "-";
    });
    return Object.values(rows);
  };

  const buildCoursePoMatrix313 = (mapping = []) => {
    const courseMap = {};
    mapping.forEach((m) => {
      const courseCode = m.subject?.subjectCode || m.course_code;
      const poCode = m.po?.poCode;
      if (!courseCode || !poCode) return;
      if (!courseMap[courseCode]) {
        courseMap[courseCode] = { course_code: courseCode };
        for (let i = 1; i <= 12; i++) courseMap[courseCode][`PO${i}`] = "-";
      }
      courseMap[courseCode][poCode] = m.averageCorrelation?.toString() || "-";
    });
    return Object.values(courseMap);
  };

  /* ---------------- INITIAL DATA LOADING ---------------- */

  useEffect(() => {
    const initializeAllData = async () => {
      if (!cycle_sub_category_id) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        // 1. Load user-saved data (highest priority)
        const userRes = await newnbaCriteria3Service.getCriteria3_1_Data(
          cycle_sub_category_id,
          getStaffId()
        );

        const rawUserData = userRes?.[0] || userRes?.data || {};
        console.log(rawUserData);
        const corrId = rawUserData.course_outcome_correlation_id || rawUserData.id || null;
        console.log(corrId);
        setCorrelationId(corrId);

        const userTableData = {
          "3.1.1": rawUserData.course_outcomes || [],
          "3.1.2": rawUserData.co_po_matrices || [],
          "3.1.3": rawUserData.course_po_matrix || [],
        };

        const userFiles = {
          "3.1.1": ensureFileUploadSlot(rawUserData.course_outcome_document || []),
          "3.1.2": ensureFileUploadSlot(rawUserData.co_po_document || []),
          "3.1.3": ensureFileUploadSlot(rawUserData.course_po_document || []),
        };

        // 2. Load reference / auto-fill data (only if programId exists)
        let ref312 = [];
        let ref313 = [];
        let autoFill311 = [];

        if (programId) {
          const [poRes, psoRes, mappingRes, coRes] = await Promise.all([
            POService.getPObyProgramId(programId),
            PSOService.getPSOByProgramId(programId),
            newnbaCriteria1Service.getCoPoMappingsByProgram(programId),
            newnbaCriteria1Service.getCourseOutcomesByProgram(programId),
          ]);

          setPoData(poRes || []);
          setPsoData(psoRes || []);
          const cos = coRes?.data || coRes || [];
          setProgramCourseOutcomes(cos);

          const mappings = mappingRes?.content || [];

          ref312 = buildCoPoMatrix312(mappings);
          ref313 = buildCoursePoMatrix313(mappings);
          autoFill311 = mapCourseOutcomesTo311(cos);
        }

        // 3. Final merge — user saved data has priority
        const finalTableData = {
          "3.1.1":
            userTableData["3.1.1"].length > 0
              ? userTableData["3.1.1"]
              : autoFill311,
          "3.1.2":
            userTableData["3.1.2"].length > 0
              ? userTableData["3.1.2"]
              : ref312,
          "3.1.3":
            userTableData["3.1.3"].length > 0
              ? userTableData["3.1.3"]
              : ref313,
        };

        setInitialData({
          tableData: finalTableData,
          filesByField: userFiles,
        });

        console.log("[INIT SUCCESS] Final rows:", {
          "3.1.1": finalTableData["3.1.1"].length,
          "3.1.2": finalTableData["3.1.2"].length,
          "3.1.3": finalTableData["3.1.3"].length,
        });

        console.log("[INIT] correlationId:", corrId);
      } catch (err) {
        console.error("Initialization failed:", err);
        toast.error("Failed to load Criterion 3.1 data");
        setCorrelationId(null);

        setInitialData({
          tableData: { "3.1.1": [], "3.1.2": [], "3.1.3": [] },
          filesByField: {
            "3.1.1": ensureFileUploadSlot(),
            "3.1.2": ensureFileUploadSlot(),
            "3.1.3": ensureFileUploadSlot(),
          },
        });
      } finally {
        setLoading(false);
      }
    };

    initializeAllData();
  }, [cycle_sub_category_id, programId]);

  /* ---------------- SAVE ---------------- */

  const handleSave = async (formData) => {
    setSaving(true);
    try {
      const payload = {
        other_staff_id: getStaffId(),
        cycle_sub_category_id,
        course_outcomes: formData.tableData["3.1.1"],
        co_po_matrices: formData.tableData["3.1.2"],
        course_po_matrix: formData.tableData["3.1.3"],

        course_outcome_document: formData.filesByField["3.1.1"]
          ?.filter((f) => f.s3Url || f.url || f.file_url)
          ?.map((f) => ({
            file_url: f.s3Url || f.url || f.file_url,
            file_name: f.filename,
            description: f.description?.trim() || "",
          })) || [],

        co_po_document: formData.filesByField["3.1.2"]
          ?.filter((f) => f.s3Url || f.url || f.file_url)
          ?.map((f) => ({
            file_url: f.s3Url || f.url || f.file_url,
            file_name: f.filename,
            description: f.description?.trim() || "",
          })) || [],

        course_po_document: formData.filesByField["3.1.3"]
          ?.filter((f) => f.s3Url || f.url || f.file_url)
          ?.map((f) => ({
            file_url: f.s3Url || f.url || f.file_url,
            file_name: f.filename,
            description: f.description?.trim() || "",
          })) || [],
      };

      let res;
      if (correlationId) {
        res = await newnbaCriteria3Service.putCriteria3_1_Data(
          correlationId,
          getStaffId(),
          payload
        );
      } else {
        res = await newnbaCriteria3Service.saveCriteria3_1_Data(getStaffId(), payload);
        setCorrelationId(res?.course_outcome_correlation_id || res?.id);
      }

      toast.success("Criterion 3.1 saved successfully");
      onSaveSuccess?.();

      // Option A: full reload (simple but heavy)
      // window.location.reload();

      // Option B: better → just re-fetch user data
      // You can call a lighter version of initializeAllData() here if you want
      // For now we keep reload for consistency with original behavior
      window.location.reload();
    } catch (err) {
      console.error("Save failed:", err);
      toast.error("Failed to save Criterion 3.1");
    } finally {
      setSaving(false);
    }
  };

  /* ---------------- DELETE ---------------- */

  const handleDelete = () => {
    if (!correlationId) {
      setAlert(
        <SweetAlert
          info
          title="Nothing to Delete"
          confirmBtnText="OK"
          onConfirm={() => setAlert(null)}
        >
          No saved Criterion 3.1 record found.
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
          try {
            await newnbaCriteria3Service.deleteCriteria3_1Data(correlationId);
            setAlert(
              <SweetAlert
                success
                title="Deleted!"
                confirmBtnText="OK"
                onConfirm={() => setAlert(null)}
              >
                Criterion 3.1 data deleted successfully
              </SweetAlert>
            );
            setCorrelationId(null);
            window.location.reload();
          } catch (err) {
            console.error("Delete failed:", err);
            setAlert(
              <SweetAlert
                danger
                title="Delete Failed"
                confirmBtnText="OK"
                onConfirm={() => setAlert(null)}
              >
                Could not delete the record.
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
      <div className="flex justify-center items-center min-h-[50vh] text-lg font-medium text-gray-600">
        Loading Criterion 3.1 data...
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-12">
      <GenericCriteriaForm3_1
        title={config.title}
        marks={config.totalMarks}
        fields={config.fields}
        initialData={initialData}
        saving={saving}
        isCompleted={!isEditable}
        isContributorEditable={isEditable}
        onSave={handleSave}
        onDelete={handleDelete}
      />
      {alert}
    </div>
  );
};

export default Criterion3_1Form;