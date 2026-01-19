// src/screens/pages/NEWNBA/Components/Criteria6/Criterion6_1Form.jsx

import React, { useState, useEffect,useCallback } from "react";
import GenericCriteriaForm from "../GenericCriteriaForm";
import { newnbaCriteria6Service } from "../../Services/NewNBA-Criteria6.service";
import { toast } from "react-toastify";
import SweetAlert from 'react-bootstrap-sweetalert';
import { POService } from "../../../OBE/Settings/Services/po.service";
import { PSOService } from "../../../OBE/Settings/Services/pso.service";

const Criterion6_1Form = ({
  cycle_sub_category_id,
  isEditable = true,
  onSaveSuccess,
  programId = null,
  otherStaffId = null,
  showCardView = false,
  onCardClick = null,
}) => {
  console.log("cyclesubcategoriid",cycle_sub_category_id);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [classroomsWorkshopsId, setClassroomsWorkshopsId] = useState(null);
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
    title: "6.1 Availability of Adequate, Well-Equipped Classrooms and Workshops to Meet Requirements",
    totalMarks: 15,
    fields: [
      {
        name: "6.1",
        label: "6.1 Availability of Adequate, Well-Equipped Classrooms and Workshops to Meet Requirements",
        marks: 15,
        type: "textarea",
      },
    ],
  };

  const loadContributorsData = async () => {
    if (!showCardView || !cycle_sub_category_id) return;
    
    setCardLoading(true);
    try {
      const contributorsResponse = await newnbaCriteria6Service.getAllCriteria6_1_Data(cycle_sub_category_id);
      setCardData(contributorsResponse?.data || contributorsResponse || []);
    } catch (err) {
      console.error("Failed to load contributors data:", err);
      setCardData([]);
    } finally {
      setCardLoading(false);
    }
  };

  // Load data from API
  useEffect(() => {
    loadData();
    if (showCardView) {
      loadContributorsData();
    }
  }, [cycle_sub_category_id, programId, showCardView, otherStaffId]);

  // ---------------- LOAD DATA ----------------
  const loadData = useCallback(async () => {
    if (!cycle_sub_category_id) return setLoading(false);

    try {
      setLoading(true);

      const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
      const userInfoo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const userIsContributor = userInfo?.rawData?.is_contributor || false;
      setIsContributor(userIsContributor);
      
      const currentOtherStaffId = otherStaffId || 
        userInfoo?.other_staff_id || 
        userInfo?.rawData?.other_staff_id || 
        userInfo?.user_id;

      console.log("🟢 Loading data for staff ID:", currentOtherStaffId);

      // Get data using staff ID and cycle subcategory
      const res = await newnbaCriteria6Service.getCriteria6_1_Data(cycle_sub_category_id, currentOtherStaffId);
      const rawResponse = res?.data || res || [];
      const d = Array.isArray(rawResponse) && rawResponse.length > 0 ? rawResponse[0] : rawResponse;

      console.log("🟢 Criterion6_1Form - Raw API Response:", rawResponse);
      console.log("🟢 Criterion6_1Form - Processed Data:", d);

      setClassroomsWorkshopsId(d.id || null);

      setInitialData({
        content: { 
          "6.1": d.classrooms_workshops_description || "" 
        },
        tableData: [],
        filesByField: {
          "6.1": (d.classrooms_workshops_document || []).length > 0
            ? (d.classrooms_workshops_document || []).map((f, i) => ({
                id: `file-6.1-${i}`,
                filename: f.file_name || f.name || "",
                s3Url: f.file_url || f.url || "",
                description: f.description || "",
                uploading: false
              }))
            : [{ id: `file-6.1-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }]
        }
      });
    } catch (err) {
      console.warn("Load failed:", err);

      setClassroomsWorkshopsId(null);
      setInitialData({
        content: { "6.1": "" },
        tableData: [],
        filesByField: {
          "6.1": [{ id: `file-6.1-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }]
        }
      });
    } finally {
      setLoading(false);
    }
  }, [cycle_sub_category_id, otherStaffId]);

  // ---------------- SAVE DATA ----------------
  const handleSave = async (formData) => {
    setSaving(true);

    try {
      const filesWithCategory = Object.keys(formData.filesByField || {}).flatMap(
        (field) =>
          (formData.filesByField[field] || []).map((file) => ({
            ...file,
            category: "Classrooms Workshops",
          }))
      );
      
      console.log("Files with category:", filesWithCategory);
      
      const classrooms_workshops_document = filesWithCategory
        .filter((f) => {
          const hasUrl = f.s3Url && f.s3Url.trim() !== "";
          console.log(`File ${f.filename}: hasUrl=${hasUrl}, s3Url=${f.s3Url}`);
          return hasUrl;
        })
        .map((f) => ({
          file_name: f.filename,
          file_url: f.s3Url,
          description: f.description || ""
        }));
      
      const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
      const userInfoo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      
      // Get currentUserStaffId correctly
      const currentUserStaffId = userInfoo?.other_staff_id || userInfo?.rawData?.other_staff_id;
      
      if (!currentUserStaffId) {
        console.error("❌ currentUserStaffId not found in user data");
        throw new Error("Current user staff ID not found. Please login again.");
      }
      
      const staffId = otherStaffId || 
        userInfoo?.other_staff_id || 
        userInfo?.rawData?.other_staff_id || 
        userInfo?.user_id;

      const payload = {
        other_staff_id: parseInt(staffId, 10),
        cycle_sub_category_id: parseInt(cycle_sub_category_id, 10),
        classrooms_workshops_description: formData.content["6.1"] || "",
        classrooms_workshops_document
      };

      console.log("🟢 Saving payload:", payload);
      console.log("🟢 currentUserStaffId:", currentUserStaffId);

      if (classroomsWorkshopsId) {
        // UPDATE existing record
        await newnbaCriteria6Service.putCriteria6_1_Data(classroomsWorkshopsId, payload, currentUserStaffId);
      } else {
        // CREATE new record
        await newnbaCriteria6Service.saveCriteria6_1_Data(payload, currentUserStaffId);
      }

      setAlert(
        <SweetAlert
          success
          title="Saved!"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => setAlert(null)}
        >
          Criterion 6.1 saved successfully!
        </SweetAlert>
      );

      onSaveSuccess?.();
      loadData();
    } catch (err) {
      console.error("Save failed:", err);

      setAlert(
        <SweetAlert
          danger
          title="Error"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => setAlert(null)}
        >
          Failed to save Criterion 6.1. Error: {err.message || err}
        </SweetAlert>
      );
    } finally {
      setSaving(false);
    }
  };

  // ---------------- DELETE DATA ----------------
  const handleDelete = async () => {
    if (!classroomsWorkshopsId) {
      setAlert(
        <SweetAlert
          info
          title="Nothing to Delete"
          confirmBtnCssClass="btn-confirm"
          confirmBtnText="OK"
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
            const res = await newnbaCriteria6Service.deleteCriteria6_1_Data(classroomsWorkshopsId);

            let message = "Criterion 6.1 deleted successfully.";
            if (typeof res === "string") message = res;
            else if (res?.data) message = res.data;

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

            setClassroomsWorkshopsId(null);
            loadData();
            onSaveSuccess?.();
          } catch (err) {
            console.error("Delete failed:", err);

            setAlert(
              <SweetAlert
                danger
                title="Delete Failed"
                confirmBtnCssClass="btn-confirm"
                confirmBtnText="OK"
                onConfirm={() => setAlert(null)}
              >
                Error deleting the record
              </SweetAlert>
            );
          }
        }}
        onCancel={() => setAlert(null)}
      >
        You won't be able to revert this!
      </SweetAlert>
    );
  };

  // ---------------- UI ----------------
  if (loading || (showCardView && cardLoading)) {
    return (
      <div className="flex justify-center py-20 text-xl font-medium text-indigo-600">
        Loading Criterion 6.1...
      </div>
    );
  }

  console.log("🎯 Criterion6_1Form rendering with initialData:", initialData);

  // Show card view for coordinators
  if (showCardView) {
    return (
      <>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-bold text-blue-700 mb-4">6.1 Classrooms & Workshops - Contributors</h3>
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

export default Criterion6_1Form;