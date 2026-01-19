// src/screens/pages/NEWNBA/Components/Criteria6/Criterion6_3Form.jsx

import React, { useState, useEffect, useCallback } from "react";
import GenericCriteriaForm from "../GenericCriteriaForm";
import { newnbaCriteria6Service } from "../../Services/NewNBA-Criteria6.service";
import SweetAlert from "react-bootstrap-sweetalert";

const Criterion6_3Form = ({
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
  const [labsId, setLabsId] = useState(null);
  const [cardData, setCardData] = useState([]);
  const [cardLoading, setCardLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [isContributor, setIsContributor] = useState(false);

  const [initialData, setInitialData] = useState({
    content: {},
    tableData: {},
    filesByField: {}
  });

  const config = {
    title: "6.3 Laboratories/Studio/Computer Labs/Construction Yard along with Equipment and Relevant Facilities (35)",
    totalMarks: 35,
    fields: [
      {
        name: "labsTable",
        label: "List of Laboratories/Studio/Computer Labs/Construction Yard Details",
        marks: 0,
        hasTable: true,
        tableConfig: {
          title: "List of Laboratories / Studios / Computer Labs / Construction Yards",
          columns: [
            { field: "sno", header: "S.No", placeholder: "1", width: "60px" },
            { field: "labName", header: "Lab/Workshop", placeholder: "e.g. Physics Lab" },
            { field: "batchSize", header: "Batch Size", placeholder: "30" },
            { field: "manuals", header: "Availability of Manuals", placeholder: "Yes / No / Partial" },
            { field: "instrumentsQuality", header: "Quality of Instruments", placeholder: "Good / Average / Poor" },
            { field: "safety", header: "Safety Measures", placeholder: "Fire extinguisher, First-aid, etc." },
            { field: "remarks", header: "Remarks", placeholder: "Additional comments..." },
          ],
          allowAddRemoveRows: true,
        },
        predefinedRows: [],
      },
    ],
  };

  // Load contributors (for coordinator view)
  const loadContributorsData = async () => {
    if (!showCardView || !cycle_sub_category_id) return;
    setCardLoading(true);
    try {
      const res = await newnbaCriteria6Service.getAllCriteria6_3_Data(cycle_sub_category_id);
      setCardData(res?.data || res || []);
    } catch (err) {
      console.error("Failed to load 6.3 contributors:", err);
      setCardData([]);
    } finally {
      setCardLoading(false);
    }
  };

  // Load saved data
  const loadData = useCallback(async () => {
    if (!cycle_sub_category_id) {
      setInitialData({
        content: {},
        tableData: { labsTable: [] },
        filesByField: {
          "6.3": [{ id: "file-6.3-0", description: "", file: null, filename: "", s3Url: "", uploading: false }],
        },
      });
      setLoading(false);
      return;
    }

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

      console.log("🟢 Loading 6.3 data for staff ID:", currentStaffId);

      const res = await newnbaCriteria6Service.getCriteria6_3_Data(cycle_sub_category_id, currentStaffId);
      const raw = res?.data || res || [];
      const d = Array.isArray(raw) && raw.length > 0 ? raw[0] : raw;

      console.log("🟢 Criterion6_3Form - Raw API Response:", raw);
      console.log("🟢 Criterion6_3Form - Processed Data:", d);

      setLabsId(d?.id || null);

      const newInitialData = {
        content: {},
        tableData: {
          labsTable: d?.laboratories_maintenance_data || [],
        },
        filesByField: {
          "6.3": (d?.laboratories_maintenance_document || []).length > 0
            ? (d?.laboratories_maintenance_document || []).map((f, i) => ({
                id: `file-6.3-${i}`,
                filename: f.file_name || "",
                s3Url: f.file_url || "",
                description: f.description || "",
                uploading: false,
              }))
            : [{ id: "file-6.3-0", description: "", file: null, filename: "", s3Url: "", uploading: false }]
        }
      };

      setInitialData(newInitialData);
    } catch (err) {
      console.error("Load 6.3 failed:", err);
      setLabsId(null);
      setInitialData({
        content: {},
        tableData: { labsTable: [] },
        filesByField: {
          "6.3": [{ id: "file-6.3-0", description: "", file: null, filename: "", s3Url: "", uploading: false }],
        },
      });
    } finally {
      setLoading(false);
    }
  }, [cycle_sub_category_id, otherStaffId]);

  useEffect(() => {
    loadData();
    if (showCardView) loadContributorsData();
  }, [loadData, showCardView]);

  const handleSave = async (formData) => {
    setSaving(true);

    try {
      const laboratories_maintenance_data = formData.tableData?.labsTable || [];

      const filesWithCategory = Object.keys(formData.filesByField || {}).flatMap(
        (field) =>
          (formData.filesByField[field] || []).map((file) => ({
            ...file,
            category: "Laboratories Maintenance",
          }))
      );
      
      const laboratories_maintenance_document = filesWithCategory
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
        laboratories_maintenance_data,
        laboratories_maintenance_document
      };

      console.log("🟢 Saving 6.3 payload:", payload);
      console.log("🟢 currentUserStaffId:", currentUserStaffId);

      if (labsId) {
        // UPDATE existing record
        await newnbaCriteria6Service.putCriteria6_3_Data(labsId, payload, currentUserStaffId);
      } else {
        // CREATE new record
        await newnbaCriteria6Service.saveCriteria6_3_Data(payload, currentUserStaffId);
      }

      setAlert(
        <SweetAlert
          success
          title="Saved!"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => setAlert(null)}
        >
          Criterion 6.3 saved successfully!
        </SweetAlert>
      );

      onSaveSuccess?.();
      loadData();
    } catch (err) {
      console.error("Save 6.3 failed:", err);

      setAlert(
        <SweetAlert
          danger
          title="Error"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => setAlert(null)}
        >
          Failed to save Criterion 6.3. Error: {err.message || err}
        </SweetAlert>
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!labsId) {
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
            const res = await newnbaCriteria6Service.deleteCriteria6_3_Data(labsId);

            let message = "Criterion 6.3 deleted successfully.";
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

            setLabsId(null);
            loadData();
            onSaveSuccess?.();
          } catch (err) {
            console.error("Delete 6.3 failed:", err);

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

  if (loading || (showCardView && cardLoading)) {
    return (
      <div className="flex justify-center py-20 text-xl font-medium text-indigo-600">
        Loading Criterion 6.3...
      </div>
    );
  }

  console.log("🎯 Criterion6_3Form rendering with initialData:", initialData);

  if (showCardView) {
    return (
      <>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-bold text-blue-700 mb-4">6.3 Laboratories & Facilities - Contributors</h3>
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

export default Criterion6_3Form;