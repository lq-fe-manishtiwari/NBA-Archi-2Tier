// src/screens/pages/NEWNBA/Components/Criteria6/Criterion6_2Form.jsx

import React, { useState, useEffect, useCallback } from "react";
import GenericCriteriaForm from "../GenericCriteriaForm"; // ← same as 6.1
import { newnbaCriteria6Service } from "../../Services/NewNBA-Criteria6.service";
import { toast } from "react-toastify";
import SweetAlert from 'react-bootstrap-sweetalert';

const Criterion6_2Form = ({
  cycle_sub_category_id,
  isEditable = true,
  onSaveSuccess,
  programId = null,
  otherStaffId = null,
  showCardView = false,
  onCardClick = null,
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [facultyRoomsId, setFacultyRoomsId] = useState(null);
  const [isContributor, setIsContributor] = useState(false);

  const [initialData, setInitialData] = useState({
    content: {},
    tableData: [],
    files: [],
  });

  const [alert, setAlert] = useState(null);
  const [cardData, setCardData] = useState([]);
  const [cardLoading, setCardLoading] = useState(false);

  // ---------------- CONFIG ----------------
  const config = {
    title: "6.2 Availability of Faculty Rooms / Staff Rooms",
    totalMarks: 15,
    fields: [
      {
        name: "6.2",
        label: "6.2 Availability of Adequate, Well-Equipped Faculty Rooms",
        marks: 15,
        type: "textarea",           // or "richText" if you prefer
        placeholder: "Describe the availability, adequacy, quality, furniture, facilities, internet, maintenance, etc. of faculty rooms...",
      },
    ],
  };

  // Load list of contributors (for coordinator card view)
  const loadContributorsData = async () => {
    if (!showCardView || !cycle_sub_category_id) return;
    
    setCardLoading(true);
    try {
      const contributorsResponse = await newnbaCriteria6Service.getAllCriteria6_2_Data(cycle_sub_category_id);
      setCardData(contributorsResponse?.data || contributorsResponse || []);
    } catch (err) {
      console.error("Failed to load 6.2 contributors:", err);
      setCardData([]);
    } finally {
      setCardLoading(false);
    }
  };

  // ---------------- LOAD DATA ----------------
  const loadData = useCallback(async () => {
    if (!cycle_sub_category_id) return setLoading(false);

    try {
      setLoading(true);

      const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
      const userInfoo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const userIsContributor = userInfo?.rawData?.is_contributor || false;
      setIsContributor(userIsContributor);

      const currentStaffId = otherStaffId ||
        userInfoo?.other_staff_id ||
        userInfo?.rawData?.other_staff_id ||
        userInfo?.user_id;

      console.log("Loading 6.2 data for staff:", currentStaffId);

      const res = await newnbaCriteria6Service.getCriteria6_2_Data(cycle_sub_category_id, currentStaffId);
      const rawResponse = res?.data || res || [];
      const d = Array.isArray(rawResponse) && rawResponse.length > 0 ? rawResponse[0] : rawResponse;

      setFacultyRoomsId(d.id || null);

      setInitialData({
        content: {
          "6.2": d.faculty_rooms_description || "",
        },
        tableData: [],
        filesByField: {
          "6.2": (d.faculty_rooms_documents || []).length > 0
            ? (d.faculty_rooms_documents || []).map((f, i) => ({
                id: `file-6.2-${i}`,
                filename: f.file_name || f.name || "",
                s3Url: f.file_url || f.url || "",
                description: f.description || "",
                uploading: false
              }))
            : [{ id: `file-6.2-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }]
        }
      });
    } catch (err) {
      console.warn("6.2 load failed:", err);

      setFacultyRoomsId(null);
      setInitialData({
        content: { "6.2": "" },
        tableData: [],
        filesByField: {
          "6.2": [{ id: `file-6.2-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }]
        }
      });
    } finally {
      setLoading(false);
    }
  }, [cycle_sub_category_id, otherStaffId]);

  useEffect(() => {
    loadData();
    if (showCardView) {
      loadContributorsData();
    }
  }, [cycle_sub_category_id, programId, showCardView, otherStaffId, loadData]);

  // ---------------- SAVE ----------------
// ---------------- SAVE ----------------
// ---------------- SAVE ----------------
const handleSave = async (formData) => {
  setSaving(true);

  try {
    if (!cycle_sub_category_id) {
      throw new Error("cycle_sub_category_id is missing");
    }

    const filesWithCategory = Object.keys(formData.filesByField || {}).flatMap(
      (field) =>
        (formData.filesByField[field] || []).map((file) => ({
          ...file,
          category: "Faculty Rooms",
        }))
    );

    const faculty_rooms_document = filesWithCategory
      .filter((f) => f.s3Url && f.s3Url.trim() !== "")
      .map((f) => ({
        file_name: f.filename || f.name || "unnamed-file",
        file_url: f.s3Url,
        description: f.description?.trim() || "",
      }));

    const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
    const userInfoo = JSON.parse(localStorage.getItem("userInfo") || "{}");

    const currentUserStaffId =
      userInfoo?.other_staff_id ||
      userInfo?.rawData?.other_staff_id ||
      userInfo?.user_id;

    if (!currentUserStaffId) {
      throw new Error("Staff ID not found. Please login again.");
    }

    const targetStaffId = otherStaffId || currentUserStaffId;

    const payload = {
      other_staff_id: parseInt(targetStaffId, 10),
      cycle_sub_category_id: parseInt(cycle_sub_category_id, 10),
      faculty_rooms_description: formData.content["6.2"]?.trim() || "",
      faculty_rooms_document,
    };

    console.log("[SAVE 6.2] Sending payload:", payload);

    let newId = facultyRoomsId;

    if (facultyRoomsId) {
      // UPDATE
      console.log("[SAVE 6.2] → Performing PUT with ID:", facultyRoomsId);
      await newnbaCriteria6Service.putCriteria6_2_Data(
        facultyRoomsId,
        payload,
        currentUserStaffId
      );
    } else {
      // CREATE
      console.log("[SAVE 6.2] → Performing POST (create)");
      const createResponse = await newnbaCriteria6Service.saveCriteria6_2_Data(
        payload,
        currentUserStaffId
      );

      console.log("[SAVE 6.2] POST response:", createResponse);

      // Try to extract the new ID from response (most common patterns)
      newId =
        createResponse?.id ||
        createResponse?.data?.id ||
        createResponse?.record?.id ||
        createResponse?.data?.record?.id ||
        null;

      if (!newId) {
        console.warn("[SAVE 6.2] Warning: POST did not return new ID → will reload to find it");
      }
    }

    // Always reload after save to get fresh data + ID
    await loadData();

    // If we still don't have ID after reload → show warning
    if (!facultyRoomsId && !newId) {
      console.warn("[SAVE 6.2] No ID found after save + reload");
    }

    setAlert(
      <SweetAlert
        success
        title="Saved!"
        confirmBtnCssClass="btn-confirm"
        onConfirm={() => setAlert(null)}
      >
        Criterion 6.2 saved successfully!
      </SweetAlert>
    );

    onSaveSuccess?.();
  } catch (err) {
    console.error("[SAVE 6.2] failed:", err);
    let msg = err.message || "Save failed";

    if (err.message?.includes("null") || err.message?.includes("IllegalArgumentException")) {
      msg = "Update failed: Record ID is missing. This usually happens when the system couldn't find the previously saved record.";
    }

    setAlert(
      <SweetAlert
        danger
        title="Save Failed"
        confirmBtnCssClass="btn-confirm"
        onConfirm={() => setAlert(null)}
      >
        {msg}
      </SweetAlert>
    );
  } finally {
    setSaving(false);
  }
};


  // ---------------- DELETE ----------------
  const handleDelete = async () => {
    if (!facultyRoomsId) {
      setAlert(
        <SweetAlert
          info
          title="Nothing to Delete"
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
            await newnbaCriteria6Service.deleteCriteria6_2_Data(facultyRoomsId);

            setAlert(
              <SweetAlert
                success
                title="Deleted!"
                confirmBtnCssClass="btn-confirm"
                onConfirm={() => setAlert(null)}
              >
                Criterion 6.2 deleted successfully.
              </SweetAlert>
            );

            setFacultyRoomsId(null);
            loadData();
            onSaveSuccess?.();
          } catch (err) {
            setAlert(
              <SweetAlert
                danger
                title="Delete Failed"
                confirmBtnCssClass="btn-confirm"
                onConfirm={() => setAlert(null)}
              >
                Failed to delete record.
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

  // ---------------- RENDER ----------------
  if (loading || (showCardView && cardLoading)) {
    return (
      <div className="flex justify-center py-20 text-xl font-medium text-indigo-600">
        Loading Criterion 6.2...
      </div>
    );
  }

  if (showCardView) {
    return (
      <>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-bold text-blue-700 mb-4">
            6.2 Faculty Rooms - Contributors
          </h3>
          {cardData.length > 0 ? (
            <div className="space-y-3">
              {cardData.map((item, index) => (
                <div
                  key={index}
                  className="border p-3 rounded hover:bg-gray-50 cursor-pointer"
                  onClick={() => onCardClick?.(cycle_sub_category_id, item.other_staff_id, item)}
                >
                  <div className="flex justify-between">
                    <div>
                      <span className="font-medium">
                        {item.firstname} {item.lastname}
                      </span>
                      <p className="text-sm text-gray-600">Staff ID: {item.other_staff_id}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      item.approval_status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                      item.approval_status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.approval_status || 'PENDING'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No contributors found</p>
          )}
        </div>
        {alert}
      </>
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

export default Criterion6_2Form;