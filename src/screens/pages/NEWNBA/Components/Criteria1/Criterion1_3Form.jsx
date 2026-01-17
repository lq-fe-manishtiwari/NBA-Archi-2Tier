// src/screens/pages/NEWNBA/Components/Criteria1/Criterion1_3Form.jsx

import React, { useState, useEffect } from "react";
import GenericCriteriaForm from "../GenericCriteriaForm";
import { newnbaCriteria1Service } from "../../Services/NewNBA-Criteria1.service";
import { toast } from "react-toastify";
import SweetAlert from "react-bootstrap-sweetalert";
import { POService } from "../../../OBE/Settings/Services/po.service";
import { PSOService } from "../../../OBE/Settings/Services/pso.service";

const Criterion1_3Form = ({
  cycle_sub_category_id,
  isEditable = true,
  onSaveSuccess,
  programId = null,
  otherStaffId = null,
  showCardView = false,
  onCardClick = null,
  onStatusChange = null,
  cardData = [],
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  // Always start in edit mode so file upload is visible
  const [isEditMode, setIsEditMode] = useState(true);

  const [initialData, setInitialData] = useState({
    content: {
      "1.3.1": "",
    },
    tableData: {},
    filesByField: {
      "1.3.1": [
        {
          id: `file-1.3.1-default-${Date.now()}`,
          description: "",
          file: null,
          filename: "",
          s3Url: "",
          uploading: false,
        },
      ],
    },
    vision_mission_dissemination_id: null,
  });

  const [pos, setPos] = useState([]);
  const [psos, setPsos] = useState([]);
  const [poCourseMappingData, setPoCourseMappingData] = useState([]);

  /* ================= CONFIG ================= */
  const config = {
    title:
      "1.3. Indicate Where and How the Vision, Mission and PEOs are Published and Disseminated among Stakeholders",
    totalMarks: 15,
    fields: [
      {
        name: "1.3.1",
        label:
          "Internal stakeholders may include Management, Governing Board Members, faculty, support staff, students etc. and external stakeholders may include employers, industry, alumni, funding agencies, etc. Describe the place and media such as (websites, curricula, posters etc.), where the Vision, Mission, PEOs and the details of the process to ensure awareness among internal and external stakeholders with effective process of implementation are published",
        marks: 15,
        type: "textarea",
        allowFiles: true,
      },
    ],
  };

  /* ================= ENSURE AT LEAST ONE FILE SLOT ================= */
  const ensureFileSlot = (data) => {
    const field = "1.3.1";
    if (!data?.filesByField?.[field]?.length) {
      data.filesByField = {
        ...(data.filesByField || {}),
        [field]: [
          {
            id: `file-1.3.1-default-${Date.now()}`,
            description: "",
            file: null,
            filename: "",
            s3Url: "",
            uploading: false,
          },
        ],
      };
    }
    return { ...data };
  };

  /* ================= LOAD DATA ================= */
  const loadData = async () => {
    const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
    const userInfoo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const currentOtherStaffId =
      otherStaffId ||
      userInfo?.rawData?.other_staff_id ||
      userInfo.user_id ||
      userInfoo?.other_staff_id;

    if (!cycle_sub_category_id) {
      // No ID → new entry → keep default empty form + file slot
      setInitialData((prev) => ensureFileSlot({ ...prev }));
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const res = await newnbaCriteria1Service.getCriteria1_3_Data(
        cycle_sub_category_id,
        currentOtherStaffId
      );

      const d = Array.isArray(res) ? res[0] : res || {};

      const loadedData = {
        content: {
          "1.3.1": d.vision_mission_peo_dissemination || "",
        },
        tableData: {},
        vision_mission_dissemination_id:
          d.vision_mission_dissemination_id || null,
        filesByField: {
          "1.3.1":
            d?.vision_mission_dissemination_document?.length > 0
              ? d.vision_mission_dissemination_document.map((f, i) => ({
                  id: `file-1.3.1-${i}`,
                  filename: f.document_name || "",
                  s3Url: f.document_url || "",
                  url: f.document_url || "",
                  description: f.description || "",
                  uploading: false,
                }))
              : [
                  {
                    id: `file-1.3.1-default-${Date.now()}`,
                    description: "",
                    file: null,
                    filename: "",
                    s3Url: "",
                    uploading: false,
                  },
                ],
        },
      };

      setInitialData(ensureFileSlot(loadedData));
    } catch (err) {
      console.error("Failed to load Criterion 1.3:", err);
      toast.error("Failed to load Criterion 1.3");
      // Still show empty form with upload section on error
      setInitialData((prev) => ensureFileSlot({ ...prev }));
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async () => {
    if (!initialData?.vision_mission_dissemination_id) {
      setAlert(
        <SweetAlert
          warning
          title="No Data"
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
        confirmBtnBsStyle="danger"
        confirmBtnCssClass="btn-confirm"
        cancelBtnCssClass="btn-cancel"
        title="Are you sure?"
        onConfirm={async () => {
          setAlert(null);
          try {
            await newnbaCriteria1Service.deleteCriteria1_3_Data(
              initialData.vision_mission_dissemination_id
            );
            await loadData();
            onSaveSuccess?.();
          } catch (err) {
            toast.error("Delete failed");
          }
        }}
        onCancel={() => setAlert(null)}
      >
        This will permanently delete Criterion 1.3 data
      </SweetAlert>
    );
  };

  /* ================= SAVE ================= */
  const handleSave = async (formData) => {
    const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
    const userInfoo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const currentOtherStaffId =
      otherStaffId ||
      userInfo?.rawData?.other_staff_id ||
      userInfo.user_id ||
      userInfoo?.other_staff_id;

    setSaving(true);

    try {
      const payload = {
        cycle_sub_category_id,
        other_staff_id: currentOtherStaffId,
        program_id: programId,
        vision_mission_peo_dissemination: formData.content["1.3.1"],
        po_data: pos,
        pso_data: psos,
        po_course_mapping: poCourseMappingData,
        vision_mission_dissemination_document: (formData.filesByField["1.3.1"] || [])
          .filter((f) => f.s3Url)
          .map((f) => ({
            document_name: f.filename,
            document_url: f.s3Url,
            description: f.description || "",
          })),
      };

      if (initialData.vision_mission_dissemination_id) {
        await newnbaCriteria1Service.putCriteria1_3_Data(
          initialData.vision_mission_dissemination_id,
          currentOtherStaffId,
          payload
        );
      } else {
        await newnbaCriteria1Service.saveCriteria1_3_Data(
          currentOtherStaffId,
          payload
        );
      }

      setAlert(
        <SweetAlert
          success
          title="Saved!"
          confirmBtnCssClass="btn-confirm"
          onConfirm={async () => {
            setAlert(null);
            await loadData();
            onSaveSuccess?.();
          }}
        >
          Criterion 1.3 saved successfully
        </SweetAlert>
      );
    } catch (err) {
      console.error(err);
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  /* ================= EFFECTS ================= */
  useEffect(() => {
    loadData();
  }, [cycle_sub_category_id, otherStaffId]);

  useEffect(() => {
    if (programId) {
      POService.getPObyProgramId(programId).then(setPos);
      PSOService.getPSOByProgramId(programId).then(setPsos);
    }
  }, [programId]);

  if (loading) {
    return (
      <div className="text-center py-20 text-indigo-600 font-medium">
        Loading Criterion 1.3...
      </div>
    );
  }

  /* ================= RENDER ================= */
  return (
    <>
      <GenericCriteriaForm
        title={config.title}
        marks={config.totalMarks}
        fields={config.fields}
        initialData={initialData}
        saving={saving}
        isContributorEditable={isEditable}
        // ─── Key changes to always show file upload ─────────────────────
        // Remove isCompleted={false} if it was present
        initialEditMode={true}           // ← Most important: start in edit mode
        // Alternative (if you prefer explicit control):
        // isEditMode={isEditMode}
        // onEditModeChange={setIsEditMode}
        onDelete={handleDelete}
        onSave={(data) =>
          handleSave({
            content: data.content,
            tableData: data.tableData,
            filesByField: data.filesByField,
          })
        }
        showFileCategories={true}        // ← Optional, same as in 1.1
      />
      {alert}
    </>
  );
};

export default Criterion1_3Form;