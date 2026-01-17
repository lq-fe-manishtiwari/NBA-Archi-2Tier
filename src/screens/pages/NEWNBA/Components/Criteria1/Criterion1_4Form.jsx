// src/screens/pages/NEWNBA/Components/Criteria1/Criterion1_4Form.jsx

import React, { useState, useEffect } from "react";
import GenericCriteriaForm from "../GenericCriteriaForm";
import { newnbaCriteria1Service } from "../../Services/NewNBA-Criteria1.service";
import { toast } from "react-toastify";
import SweetAlert from "react-bootstrap-sweetalert";
import { POService } from "../../../OBE/Settings/Services/po.service";
import { PSOService } from "../../../OBE/Settings/Services/pso.service";

const Criterion1_4Form = ({
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
      "1.4.1": "",
    },
    tableData: {},
    filesByField: {
      "1.4.1": [
        {
          id: `file-1.4.1-default-${Date.now()}`,
          description: "",
          file: null,
          filename: "",
          s3Url: "",
          uploading: false,
        },
      ],
    },
    process_defining_vm_id: null,
  });

  const [pos, setPos] = useState([]);
  const [psos, setPsos] = useState([]);
  const [poCourseMappingData, setPoCourseMappingData] = useState([]);

  /* ================= CONFIG ================= */
  const config = {
    title: "1.4. State the Process for Defining the Vision & Mission and PEOs of the Program",
    totalMarks: 10,
    fields: [
      {
        name: "1.4.1",
        label: "1.4.1 Articulate the process for defining the Vision, Mission and PEOs of the program",
        marks: 10,
        type: "textarea",
        allowFiles: true, // important to allow files
      },
    ],
  };

  /* ================= ENSURE AT LEAST ONE FILE SLOT ================= */
  const ensureFileSlot = (data) => {
    const field = "1.4.1";
    if (!data?.filesByField?.[field]?.length) {
      data.filesByField = {
        ...(data.filesByField || {}),
        [field]: [
          {
            id: `file-1.4.1-default-${Date.now()}`,
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
      setInitialData((prev) => ensureFileSlot({ ...prev }));
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const res = await newnbaCriteria1Service.getCriteria1_4_Data(
        cycle_sub_category_id,
        currentOtherStaffId
      );

      const d = Array.isArray(res) ? res[0] : res || {};

      const loadedData = {
        content: {
          "1.4.1": d.process_defining_vision_mission || "",
        },
        tableData: {},
        process_defining_vm_id: d.process_defining_vm_id || null,
        filesByField: {
          "1.4.1":
            d?.process_defining_vm_document?.length > 0
              ? d.process_defining_vm_document.map((f, i) => ({
                  id: `file-1.4.1-${i}`,
                  filename: f.document_name || "",
                  s3Url: f.document_url || "",
                  url: f.document_url || "",
                  description: f.description || "",
                  uploading: false,
                }))
              : [
                  {
                    id: `file-1.4.1-default-${Date.now()}`,
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
      console.error("Failed to load Criterion 1.4:", err);
      toast.error("Failed to load Criterion 1.4");
      // On error still show empty form + upload area
      setInitialData((prev) => ensureFileSlot({ ...prev }));
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async () => {
    if (!initialData?.process_defining_vm_id) {
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
            await newnbaCriteria1Service.deleteCriteria1_4_Data(
              initialData.process_defining_vm_id
            );
            await loadData();
            onSaveSuccess?.();
          } catch (err) {
            toast.error("Delete failed");
          }
        }}
        onCancel={() => setAlert(null)}
      >
        This will permanently delete Criterion 1.4 data
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
        process_defining_vision_mission: formData.content["1.4.1"],
        po_data: pos,
        pso_data: psos,
        po_course_mapping: poCourseMappingData,
        process_defining_vm_document: (formData.filesByField["1.4.1"] || [])
          .filter((f) => f.s3Url)
          .map((f) => ({
            document_name: f.filename,
            document_url: f.s3Url,
            description: f.description || "",
          })),
      };

      if (initialData.process_defining_vm_id) {
        await newnbaCriteria1Service.putCriteria1_4_Data(
          initialData.process_defining_vm_id,
          currentOtherStaffId,
          payload
        );
      } else {
        await newnbaCriteria1Service.saveCriteria1_4_Data(
          currentOtherStaffId,
          payload
        );
      }

      setAlert(
        <SweetAlert
          success
          title="Saved!"
          confirmBtnCssClass="btn-confirm"
          cancelBtnCssClass="btn-cancel"
          onConfirm={async () => {
            setAlert(null);
            await loadData();
            onSaveSuccess?.();
          }}
        >
          Criterion 1.4 saved successfully
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
        Loading Criterion 1.4...
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
        initialEditMode={true}           // ← Key fix: start in edit mode
        // Remove or avoid: isCompleted={!isEditable}
        onDelete={handleDelete}
        onSave={(data) =>
          handleSave({
            content: data.content,
            tableData: data.tableData,
            filesByField: data.filesByField,
          })
        }
        showFileCategories={true}        // optional, aligns with other criteria
      />
      {alert}
    </>
  );
};

export default Criterion1_4Form;