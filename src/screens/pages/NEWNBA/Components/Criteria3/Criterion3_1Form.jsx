import React, { useState, useEffect, useCallback } from "react";
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
    title: "3.1 Course Outcomes and Program Outcomes Mapping",
    totalMarks: 20,
    fields: [
      {
        name: "3.1.1",
        label: "3.1.1 Course Outcomes (05)",
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
        label: "3.1.2 CO–PO Matrices (05)",
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
              options: ["-", "1", "2", "3"].map((v) => ({
                value: v,
                label: v,
              })),
            })),
          ],
        },
      },
      {
        name: "3.1.3",
        label: "3.1.3 Course–PO Matrix (10)",
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
              options: ["-", "1", "2", "3"].map((v) => ({
                value: v,
                label: v,
              })),
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

  // Always ensure at least one empty file upload entry
  const ensureFileUploadSlot = (files = []) => {
    if (files?.length > 0) {
      return files.map((f, i) => ({
        id: `file-${f.field || "doc"}-${i}-${Date.now()}`,
        filename: f.file_name || f.name || "",
        file: null,
        s3Url: f.file_url || f.url || "",
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
        description: "",
        uploading: false,
      },
    ];
  };

  /* ---------- 3.1.1 Semester-wise COs ---------- */

  const mapCourseOutcomesTo311 = (data = []) =>
    data.map((co) => ({
      course_code: co.subject?.subjectCode || "",
      course_name: co.subject?.name || "",
      year_of_study: co.subject?.semester
        ? `Semester ${co.subject.semester.semester_number} (${co.subject.semester.name})`
        : "",
      co_code: co.coCode || "",
      co_statement: co.coStatement || "",
    }));

  /* ---------- 3.1.2 CO–PO Matrix ---------- */

  const buildCoPoMatrix312 = (mapping = []) => {
    const rows = {};

    mapping.forEach((m) => {
      const coCode = m.co?.coCode;
      if (!coCode) return;

      if (!rows[coCode]) {
        rows[coCode] = { co_code: coCode };
        for (let i = 1; i <= 12; i++) rows[coCode][`PO${i}`] = "-";
      }

      const poCode = m.po?.poCode;
      if (poCode) {
        rows[coCode][poCode] = m.correlationLevel || "-";
      }
    });

    return Object.values(rows);
  };

  /* ---------- 3.1.3 Course–PO Matrix ---------- */

  const buildCoursePoMatrix313 = (mapping = []) => {
    const courseMap = {};

    mapping.forEach((m) => {
      const courseCode = m.subject?.subjectCode;
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

  /* ---------------- API CALLS ---------------- */

  const fetchProgramCOs = useCallback(async () => {
    if (!programId) return;
    try {
      const res = await newnbaCriteria1Service.getCourseOutcomesByProgram(programId);
      setProgramCourseOutcomes(res?.data || res || []);
    } catch {
      toast.error("Failed to fetch Course Outcomes");
    }
  }, [programId]);

  const loadUserData = useCallback(async () => {
    if (!cycle_sub_category_id) return;

    try {
      const res = await newnbaCriteria3Service.getCriteria3_1_Data(
        cycle_sub_category_id,
        getStaffId()
      );

      const data = res?.data?.[0] || {};
      setCorrelationId(data?.course_outcome_correlation_id || null);

      setInitialData((prev) => ({
        ...prev,
        tableData: {
          "3.1.1": data?.course_outcomes || [],
          "3.1.2": data?.co_po_matrices || [],
          "3.1.3": data?.course_po_matrix || [],
        },
        filesByField: {
          "3.1.1": ensureFileUploadSlot(data?.course_outcome_document),
          "3.1.2": ensureFileUploadSlot(data?.co_po_matrices_document),
          "3.1.3": ensureFileUploadSlot(data?.course_po_matrix_document),
        },
      }));
    } catch (err) {
      console.warn("No previous Criterion 3.1 data found", err);

      // Show empty file upload slots even when no data exists
      setInitialData((prev) => ({
        ...prev,
        filesByField: {
          "3.1.1": ensureFileUploadSlot(),
          "3.1.2": ensureFileUploadSlot(),
          "3.1.3": ensureFileUploadSlot(),
        },
      }));
    }
  }, [cycle_sub_category_id]);

  const loadReferenceData = useCallback(async () => {
    if (!programId) return;

    const [poRes, psoRes, mappingRes] = await Promise.all([
      POService.getPObyProgramId(programId),
      PSOService.getPSOByProgramId(programId),
      newnbaCriteria1Service.getCoPoMappingsByProgram(programId),
    ]);

    setPoData(poRes || []);
    setPsoData(psoRes || []);

    const mappings = mappingRes?.content || [];

    setInitialData((prev) => ({
      ...prev,
      tableData: {
        ...prev.tableData,
        "3.1.2": buildCoPoMatrix312(mappings),
        "3.1.3": buildCoursePoMatrix313(mappings),
      },
    }));
  }, [programId]);

  /* ---------------- INIT ---------------- */

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchProgramCOs(), loadReferenceData(), loadUserData()]);
      setLoading(false);
    };
    init();
  }, [fetchProgramCOs, loadReferenceData, loadUserData]);

  /* ---------- Auto-fill 3.1.1 only if empty ---------- */

  useEffect(() => {
    if (
      !loading &&
      initialData.tableData["3.1.1"].length === 0 &&
      programCourseOutcomes.length > 0
    ) {
      setInitialData((prev) => ({
        ...prev,
        tableData: {
          ...prev.tableData,
          "3.1.1": mapCourseOutcomesTo311(programCourseOutcomes),
        },
      }));
    }
  }, [loading, programCourseOutcomes, initialData.tableData]);

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
      };

      if (correlationId) {
        await newnbaCriteria3Service.putCriteria3_1_Data(
          correlationId,
          getStaffId(),
          payload
        );
      } else {
        const res = await newnbaCriteria3Service.saveCriteria3_1_Data(
          getStaffId(),
          payload
        );
        setCorrelationId(res?.course_outcome_correlation_id);
      }

      toast.success("Criterion 3.1 saved successfully");
      onSaveSuccess?.();
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  /* ---------------- RENDER ---------------- */

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh] text-lg">
        Loading Criterion 3.1...
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
      />
      {alert}
    </div>
  );
};

export default Criterion3_1Form;