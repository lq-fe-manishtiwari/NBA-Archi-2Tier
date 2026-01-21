// src/screens/pages/NEWNBA/Components/Criteria1/Criterion5_5Form.jsx

import React, { useState, useEffect } from "react";
import GenericCriteriaForm1_2 from "../GenericCriteriaForm1_2";
import { newnbaCriteria5Service } from "../../Services/NewNBA-Criteria5.service";
import { toast } from "react-toastify";
import SweetAlert from 'react-bootstrap-sweetalert';

const Criterion5_5Form = ({
  cycle_sub_category_id,
  isEditable = true,
  onSaveSuccess,
  programId = null,
  otherStaffId = null,
  showCardView = false,
  onCardClick = null,
  onStatusChange = null,
  cardData = [],
  editMode = false,
  poMappingId = null,
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initialData, setInitialData] = useState({
    content: {},
    tableData: {},
    files: [],
    po_pso_id: null,
  });
  const [cardLoading, setCardLoading] = useState(false);
  const [alert, setAlert] = useState(null);

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
    ],
  };

  // Load saved data
  const loadData = async () => {
    const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
    const userInfoo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const currentOtherStaffId =
      otherStaffId ||
      userInfo?.rawData?.other_staff_id ||
      userInfo.user_id ||
      userInfoo?.other_staff_id;

    if (!cycle_sub_category_id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await newnbaCriteria5Service.getCriteria5_5_Data(
        cycle_sub_category_id,
        currentOtherStaffId
      );
      const rawResponse = res?.data || res || [];
      const d = Array.isArray(rawResponse) && rawResponse.length > 0 ? rawResponse[0] : {};

      setInitialData({
        content: {
          "5.5": d.innovations_teaching_learning || "",
        },
        tableData: {},
        po_pso_id: d.id || null,
        filesByField: {
          "5.5": (d.innovations_document || []).length > 0
            ? d.innovations_document.map((f, i) => ({
                id: `file-5.5-${i}`,
                name: f.document_name || f.name || "",
                filename: f.document_name || f.name || "",
                url: f.document_url || f.url || "",
                s3Url: f.document_url || f.url || "",
                description: f.description || "",
                uploading: false,
              }))
            : [{ id: `file-5.5-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }],
        },
      });
    } catch (err) {
      console.error("Failed to load Criterion 5.5 data:", err);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Load all contributors data for coordinator card view
  const loadContributorsData = async () => {
    if (!showCardView || !cycle_sub_category_id) return;
    setCardLoading(true);
    try {
      const contributorsResponse = await newnbaCriteria5Service.getallCardDetails5_5Data(cycle_sub_category_id);
      if (onStatusChange) {
        onStatusChange(contributorsResponse || []);
      }
    } catch (err) {
      console.error("Failed to load contributors data:", err);
    } finally {
      setCardLoading(false);
    }
  };

  // Delete confirmation
  const handleDelete = async () => {
    if (!initialData?.po_pso_id) {
      setAlert(
        <SweetAlert warning title="No Data" onConfirm={() => setAlert(null)}>
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
        title="Are you sure?"
        onConfirm={async () => {
          setAlert(null);
          try {
            await newnbaCriteria5Service.deleteCriteria5_5Data(initialData.po_pso_id);
            setAlert(
              <SweetAlert
                success
                title="Deleted!"
                onConfirm={async () => {
                  setAlert(null);
                  await loadData();
                  onSaveSuccess?.();
                }}
              >
                Criterion 5.5 data deleted successfully!
              </SweetAlert>
            );
          } catch (err) {
            setAlert(
              <SweetAlert danger title="Delete Failed" onConfirm={() => setAlert(null)}>
                {err.message || "Failed to delete data"}
              </SweetAlert>
            );
          }
        }}
        onCancel={() => setAlert(null)}
      >
        This action cannot be undone!
      </SweetAlert>
    );
  };

  useEffect(() => {
    loadData();
    if (showCardView) loadContributorsData();
  }, [cycle_sub_category_id, showCardView, otherStaffId]);

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
      // Prepare documents array
      const innovationsDocuments = (formData.filesByField?.["5.5"] || [])
        .filter((f) => f.s3Url || f.url)
        .map((f) => ({
          document_name: f.filename,
          document_url: f.s3Url || f.url,
          description: f.description || "",
        }));

      const payload = {
        cycle_sub_category_id,
        other_staff_id: currentOtherStaffId,
        program_id: programId || null,
        innovations_teaching_learning: formData.content?.["5.5"] || "",
        innovations_document: innovationsDocuments,
      };

      console.log("FINAL PAYLOAD (5.5):", JSON.stringify(payload, null, 2));

      if (initialData?.po_pso_id) {
        // UPDATE
        await newnbaCriteria5Service.updateCriteria5_5_Data(
          initialData.po_pso_id,
          payload,
          currentOtherStaffId
        );
      } else {
        // CREATE
        await newnbaCriteria5Service.saveCriteria5_5_Data(payload, currentOtherStaffId);
      }

      setAlert(
        <SweetAlert
          success
          title="Saved!"
          onConfirm={async () => {
            setAlert(null);
            await loadData();
            onSaveSuccess?.();
          }}
        >
          Criterion 5.5 saved successfully!
        </SweetAlert>
      );
    } catch (err) {
      console.error("Save error:", err);
      toast.error(err.message || "Failed to save data");
    } finally {
      setSaving(false);
    }
  };

  if (loading || (showCardView && cardLoading)) {
    return (
      <div className="flex justify-center py-20 text-xl font-medium text-indigo-600">
        Loading Criterion 5.5...
      </div>
    );
  }

  // Coordinator Card View
  if (showCardView) {
    return (
      <div className="space-y-4">
        {cardData?.length > 0 ? (
          cardData.map((card, index) => (
            <div
              key={index}
              className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => onCardClick?.(cycle_sub_category_id, card.other_staff_id, card)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">
                    {card.firstname} {card.lastname}
                  </h4>
                  <p className="text-sm text-gray-600">Staff ID: {card.other_staff_id}</p>
                </div>
                <div className="text-right">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      card.approval_status === "APPROVED_BY_COORDINATOR"
                        ? "bg-green-100 text-green-800"
                        : card.approval_status === "REJECTED_BY_COORDINATOR"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {card.approval_status || "Pending"}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">No submissions found</div>
        )}
        {alert}
      </div>
    );
  }

  // Normal Form View
  return (
    <>
      <GenericCriteriaForm1_2
        title={config.title}
        marks={config.totalMarks}
        fields={config.fields}
        initialData={initialData}
        saving={saving}
        isCompleted={!isEditable}
        isContributorEditable={isEditable}
        onDelete={handleDelete}
        customContent={{}} // No extra PO/PSO tables needed for 5.5
        onSave={(data) =>
          handleSave({
            content: data.content,
            tableData: data.tableData,
            filesByField: data.filesByField,
          })
        }
      />
      {alert}
    </>
  );
};

export default Criterion5_5Form;