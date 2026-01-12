// src/screens/pages/NEWNBA/Components/Criteria4/Criterion4_6Form.jsx

import React, { useState, useEffect, useCallback } from "react";
import GenericCriteriaForm4_6 from "./GenericCriteriaForm4_6";
import { newnbaCriteria4Service } from "../../Services/NewNBA-Criteria4.service";
import SweetAlert from "react-bootstrap-sweetalert";

const Criterion4_6Form = ({
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
  const [placementId, setPlacementId] = useState(null);
  const [isContributor, setIsContributor] = useState(false);

  const [initialData, setInitialData] = useState({
    content: {},
    tableData: [],
    files: [],
  });

  const [alert, setAlert] = useState(null);
  const [cardData, setCardData] = useState([]);
  const [cardLoading, setCardLoading] = useState(false);
  

  // Helper function to get row labels
  const getRowLabel = (index) => {
    const labels = [
      "FS* =Total no. of final year students",
      "X= No. of students placed",
      "Y= No. of students admitted to higher studies",
      "Z= No. of students taking up entrepreneurship",
      "X + Y + Z =",
      "Placement Index (P) = (((X + Y + Z)/FS) * 100)",
      "Average placement index = (P_1 + P_2 + P_3)/3"
    ];
    return labels[index] || "";
  };

  // ---------------- CONFIG ----------------
  const config = {
    title:
      "4.6. Placement, Higher Studies and Entrepreneurship",
    totalMarks: 30,
    fields: [
      {
        name: "4.6",
        label: "4.6 Placement, Higher Studies and Entrepreneurship",
        marks: 30,
        hasTable: true,
          tableConfig: {
            title: "Teaching-Learning Activities",
            columns: [
              { field: "item", header: "Item", placeholder: "" },
              { field: "lyg", header: "LYG", placeholder: "" },
              { field: "lygm1", header: "LYGm1", placeholder: "" },
              { field: "lygm2", header: "LYGm2", placeholder: "" },
            ],
            predefinedRows: [
            { item: "FS* =Total no. of final year students" },
            { item: "X= No. of students placed" },
            { item: "Y= No. of students admitted to higher studies" },
            { item: "Z= No. of students taking up entrepreneurship" },
            { item: "X + Y + Z =" },
            { item: "Placement Index (P) = (((X + Y + Z)/FS) * 100) " },
            { item: "Average placement index = (P_1 + P_2 + P_3)/3" },
          ],
          },
      },
    ],
  };

  // ---------------- LOAD DATA (Same as 2.1) ----------------
  const loadData = useCallback(async () => {
    if (!cycle_sub_category_id) return setLoading(false);

    try {
      setLoading(true);

      const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
      const userInfoo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const userIsContributor = userInfo?.rawData?.is_contributor || false;
      setIsContributor(userIsContributor);
      
      const currentOtherStaffId = otherStaffId || userInfo?.rawData?.other_staff_id || userInfo.user_id || userInfoo?.other_staff_id;

      const res = await newnbaCriteria4Service.getCriteria4_6_Data(cycle_sub_category_id, currentOtherStaffId);
      const rawResponse = res?.data || res || [];
      const d = Array.isArray(rawResponse) && rawResponse.length > 0 ? rawResponse[0] : rawResponse;

      setPlacementId(d.cri46_higher_studies_id || null);

      // Transform table data from API response
      const transformedTableData = d.cri46_higher_studies_table ? 
        d.cri46_higher_studies_table.map((row, index) => ({
          id: `row-${Date.now()}-${index}`,
          item: getRowLabel(index),
          lyg: row.lyg || "",
          lygm1: row.lygm1 || "",
          lygm2: row.lygm2 || ""
        })) : [];

      setInitialData({
        content: { "4.6": "" },
        tableData: transformedTableData,
        filesByField: {
          "4.6": (d.cri46_higher_studies_document || []).length > 0
            ? (d.cri46_higher_studies_document || []).map((f, i) => ({
                id: `file-4.6-${i}`,
                name: f.name || f.file_name || "",
                filename: f.name || f.file_name || "",
                url: f.url || f.file_url || "",
                s3Url: f.url || f.file_url || "",
                description: f.description || "",
                uploading: false
              }))
            : [{ id: `file-4.6-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }]
        }
      });
    } catch (err) {
      console.warn("Load failed:", err);

      setPlacementId(null);
      setInitialData({
        content: { "4.6": "" },
        tableData: [],
        filesByField: {
          "4.6": [{ id: `file-4.6-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }]
        }
      });
    } finally {
      setLoading(false);
    }
  }, [cycle_sub_category_id, otherStaffId]);

  const loadContributorsData = async () => {
      if (!showCardView || !cycle_sub_category_id) return;
      
      setCardLoading(true);
      try {
        const contributorsResponse = await newnbaCriteria4Service.getAllCriteria4_6_Data?.(cycle_sub_category_id);
        setCardData(contributorsResponse || []);
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

  useEffect(() => {
    loadData();
  }, [loadData]);

  const tablePayload = (formData) => {
  const rowKeys = ["FSrow", "Xrow", "Yrow", "Zrow", "total", "placement_index", "average"];
  
  return formData.tableData.map((row, i) => {
    const key = rowKeys[i];
    if (!key) return null;

    return {
      row_type: key,
      lyg: row.lyg || "",
      lygm1: row.lygm1 || "",
      lygm2: row.lygm2 || ""
    };
  }).filter(Boolean);
};
 
const DocumentPayload = (formData) => {
  return Object.keys(formData.filesByField || {}).flatMap((field) =>
    (formData.filesByField[field] || [])
      .filter(file => (file.s3Url || file.url) && file.filename)
      .map((file) => ({
        name: file.filename,
        description: file.description || "",
        url: file.s3Url || file.url
      }))
  );
};



  // ---------------- SAVE DATA ----------------
const handleSave = async (formData) => {
  setSaving(true);
  
  console.log("Criterion4_6Form handleSave - received formData:", formData);

  try {
    const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
    const userInfoo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const staffId = otherStaffId || userInfo?.rawData?.other_staff_id || userInfo.user_id || userInfoo?.other_staff_id;

    const cri46_higher_studies_table = tablePayload(formData);
    const cri46_higher_studies_document = DocumentPayload(formData);
    
    console.log("Files being processed:", formData.filesByField);
    console.log("Document payload:", cri46_higher_studies_document);

    const payload = {
      other_staff_id: staffId,
      cycle_sub_category_id: cycle_sub_category_id,
      cri46_higher_studies_table,
      cri46_higher_studies_document
    };

    console.log("FINAL API CALL → payload:", payload);

    if (placementId) {
      await newnbaCriteria4Service.putCriteria4_6_Data(placementId, payload);
    } else {
      await newnbaCriteria4Service.saveCriteria4_6_Data(payload);
    }

    setAlert(
          <SweetAlert
            success
            title="Saved!"
            confirmBtnCssClass="btn-confirm"
            confirmBtnText="OK"
            onConfirm={() => setAlert(null)}
          >
            Criterion 4.6 saved successfully
          </SweetAlert>
        );

    onSaveSuccess?.();
    loadData();

  } catch (err) {
    console.error(err);
      setAlert(
          <SweetAlert
            danger
            title="Save Failed"
            confirmBtnCssClass="btn-confirm"
            confirmBtnText="OK"
            onConfirm={() => setAlert(null)}
          >
            Something went wrong while saving
          </SweetAlert>
        );
  } finally {
    setSaving(false);
  }
};

  // ---------------- DELETE DATA (Same as 2.1) ----------------
  const handleDelete = async () => {
    if (!placementId) {
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
            const res = await newnbaCriteria4Service.deleteCriteria4_6Data(
              placementId
            );

            let message = "Criterion 4.6 deleted successfully.";
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

            setPlacementId(null);
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
        You won’t be able to revert this!
      </SweetAlert>
    );
  };

  // ---------------- UI ----------------
  if (loading || (showCardView && cardLoading)) {
    return (
      <div className="flex justify-center py-20 text-xl font-medium text-indigo-600">
        Loading Criterion 4.6...
      </div>
    );
  }

   console.log("🎯 Criterion1_1Form rendering with initialData:", initialData);

  // Show card view for coordinators
  if (showCardView) {
    return (
      <>
        <GenericCardWorkflow
          cycleSubCategoryId={cycle_sub_category_id}
          cardData={cardData}
          onCardClick={onCardClick}
          onStatusChange={loadContributorsData}
          apiService={newnbaCriteria4Service}
          cardConfig={{
            title: "Criterion 4.1",
            statusField: "approval_status",
            userField: "other_staff_id",
            nameFields: ["firstname", "lastname"],
            idField: "enrolment_ratio_id",
            isCoordinatorField: "is_coordinator_entry"
          }}
        />
        {alert}
      </>
    );
  }

  return (
    <div>
      <GenericCriteriaForm4_6
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

export default Criterion4_6Form;
