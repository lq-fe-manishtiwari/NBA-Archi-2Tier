// src/screens/pages/NEWNBA/Components/Criteria4/Criterion4_9Form.jsx

import React, { useState, useEffect, useCallback } from "react";
import GenericCriteriaForm from "../GenericCriteriaForm";
import { newnbaCriteria4Service } from "../../Services/NewNBA-Criteria4.service";
import SweetAlert from "react-bootstrap-sweetalert";
import { toast } from "react-toastify";

const Criterion4_9Form = ({
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
  const [recordId, setRecordId] = useState(null);
  const [alert, setAlert] = useState(null);
  const [cardLoading, setCardLoading] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState(null);

  const [initialData, setInitialData] = useState({
    content: {
      "4.9.1": "",
      "4.9.2": "",
      "4.9.3": "",
    },
    tableData: {},
    filesByField: {
      "4.9.1": [
        {
          id: `file-4.9.1-default-${Date.now()}`,
          description: "",
          file: null,
          filename: "",
          s3Url: "",
          uploading: false,
        },
      ],
      "4.9.2": [
        {
          id: `file-4.9.2-default-${Date.now()}`,
          description: "",
          file: null,
          filename: "",
          s3Url: "",
          uploading: false,
        },
      ],
      "4.9.3": [
        {
          id: `file-4.9.3-default-${Date.now()}`,
          description: "",
          file: null,
          filename: "",
          s3Url: "",
          uploading: false,
        },
      ],
    },
  });

  /* ================= CONFIG ================= */

  const config = {
    title: "4.9 Professional Activities (20)",
    totalMarks: 20,
    fields: [
      {
        name: "4.9.1",
        label:
          "4.9.1 Professional Societies / Chapters and Organizing Architectural Events (5)",
        marks: 5,
        description:
          "Provide details including holding of position at regional/national/international level",
        type: "editor",
        allowFiles: true,
      },
      {
        name: "4.9.2",
        label:
          "4.9.2 Publication of Technical Magazines, Newsletters, etc. (5)",
        marks: 5,
        description:
          "Provide a comprehensive list of publications with editors and publishers",
        type: "editor",
        allowFiles: true,
      },
      {
        name: "4.9.3",
        label:
          "4.9.3 Participation in Inter-Institute Events by Students (10)",
        marks: 10,
        description:
          "Describe participation and achievements in inter-institute events",
        type: "editor",
        allowFiles: true,
      },
    ],
  };

  /* ================= ENSURE FILE SLOTS ================= */

  const ensureFileSlots = (data) => {
    ["4.9.1", "4.9.2", "4.9.3"].forEach((field) => {
      if (!data.filesByField?.[field]?.length) {
        data.filesByField[field] = [
          {
            id: `file-${field}-default-${Date.now()}`,
            description: "",
            file: null,
            filename: "",
            s3Url: "",
            uploading: false,
          },
        ];
      }
    });
    return { ...data };
  };

  /* ================= LOAD DATA ================= */

  const loadData = useCallback(async () => {
    const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
    const userInfoo = JSON.parse(localStorage.getItem("userInfo") || "{}");

    const currentOtherStaffId =
      otherStaffId ||
      userInfo?.rawData?.other_staff_id ||
      userInfo.user_id ||
      userInfoo?.other_staff_id;

    if (!cycle_sub_category_id) {
      setInitialData((prev) => ensureFileSlots({ ...prev }));
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const res = await newnbaCriteria4Service.getCriteria4_9_Data(
        cycle_sub_category_id,
        currentOtherStaffId
      );

      const data = Array.isArray(res?.data)
        ? res.data[0]
        : Array.isArray(res)
        ? res[0]
        : res || {};

      setRecordId(data.professional_activities_id || data.id || null);

      if (data.approval_status) {
        setApprovalStatus({
          status: data.approval_status,
          rejectionReason: data.rejection_reason,
          approvedByName: data.approved_by_name,
          submittedTime: data.submitted_time || data.created_at,
        });
      } else {
        setApprovalStatus(null);
      }

      const filesByField = {
        "4.9.1": [],
        "4.9.2": [],
        "4.9.3": [],
      };

      (data.supporting_documents || []).forEach((doc) => {
        const category = doc.category || "4.9.1";
        if (filesByField[category]) {
          filesByField[category].push({
            id: `file-${category}-${doc.id || Math.random()}`,
            filename: doc.file_name || "",
            s3Url: doc.file_url || "",
            url: doc.file_url || "",
            description: doc.description || "",
            uploading: false,
          });
        }
      });

      setInitialData(
        ensureFileSlots({
          content: {
            "4.9.1": data.professional_societies_description || "",
            "4.9.2": data.publications_description || "",
            "4.9.3": data.participation_description || "",
          },
          tableData: {},
          filesByField,
        })
      );
    } catch (err) {
      console.error("Failed to load Criterion 4.9:", err);
      toast.error("Failed to load Criterion 4.9");
      setInitialData((prev) => ensureFileSlots({ ...prev }));
    } finally {
      setLoading(false);
    }
  }, [cycle_sub_category_id, otherStaffId]);

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
        professional_societies_description: formData.content["4.9.1"] || "",
        publications_description: formData.content["4.9.2"] || "",
        participation_description: formData.content["4.9.3"] || "",
        supporting_documents: Object.keys(formData.filesByField || {}).flatMap(
          (field) =>
            (formData.filesByField[field] || [])
              .filter((f) => f.s3Url)
              .map((f) => ({
                file_name: f.filename,
                file_url: f.s3Url,
                description: f.description || "",
                category: field,
              }))
        ),
      };

      if (recordId) {
        await newnbaCriteria4Service.updateCriteria4_9_Data(
          recordId,
          payload
        );
      } else {
        const res =
          await newnbaCriteria4Service.saveCriteria4_9_Data(payload);
        setRecordId(res?.professional_activities_id || res?.id || null);
      }

      setAlert(
        <SweetAlert
          success
          title="Saved!"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => {
            setAlert(null);
            loadData();
            onSaveSuccess?.();
          }}
        >
          Criterion 4.9 saved successfully
        </SweetAlert>
      );
    } catch (err) {
      console.error(err);
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  /* ================= DELETE ================= */

  const handleDelete = async () => {
    if (!recordId) {
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
        confirmBtnCssClass="btn-confirm"
        cancelBtnCssClass="btn-cancel"
        title="Are you sure?"
        onConfirm={async () => {
          setAlert(null);
          try {
            await newnbaCriteria4Service.deleteCriteria4_9_Data(recordId);
            setRecordId(null);
            await loadData();
            onSaveSuccess?.();
          } catch (err) {
            toast.error("Delete failed");
          }
        }}
        onCancel={() => setAlert(null)}
      >
        This will permanently delete Criterion 4.9 data
      </SweetAlert>
    );
  };

  /* ================= EFFECT ================= */

  useEffect(() => {
    loadData();
  }, [cycle_sub_category_id, otherStaffId, loadData]);

  if (loading || (showCardView && cardLoading)) {
    return (
      <div className="flex justify-center py-20 text-xl font-medium text-white">
        Loading Criterion 4.9...
      </div>
    );
  }

  /* ================= RENDER ================= */

  return (
    <div>
      {approvalStatus && approvalStatus.status && (
        <div className="mb-6 p-4 rounded-lg border bg-gray-50">
          <div className="font-bold">
            Status: {approvalStatus.status.replace(/_/g, " ")}
          </div>
          {approvalStatus.rejectionReason && (
            <div className="mt-1 text-sm">
              Reason: {approvalStatus.rejectionReason}
            </div>
          )}
        </div>
      )}

      <GenericCriteriaForm
        title={config.title}
        marks={config.totalMarks}
        fields={config.fields}
        initialData={initialData}
        saving={saving}
        isContributorEditable={isEditable}
        initialEditMode={true}
        showFileCategories={true}
        onSave={handleSave}
        onDelete={handleDelete}
      />

      {alert}
    </div>
  );
};

export default Criterion4_9Form;
