import React, { useState, useEffect, useCallback } from "react";
import GenericCriteriaForm4_B from "./GenericCriteriaForm4_B";
import { newnbaCriteria4Service } from "../../Services/NewNBA-Criteria4.service";
import SweetAlert from "react-bootstrap-sweetalert";

const Criterion4_BForm = ({
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
  const [studentsPerformanceId, setStudentsPerformanceId] = useState(null);
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
    title:
      "4B. Admission details for the program through multiple entry and exit points.",
    totalMarks: 20,
    fields: [
      {
        name: "4.1",
        label: "4B. Admission details for the program through multiple entry and exit points.",
        marks: 20,
        hasTable: true,
        tableConfig: {
          title: "Teaching-Learning Activities",
          columns: [
              { field: "item", header: "Item (No. of students admitted/exited through multiple entry and exit points) in the respective batch", placeholder: "" ,},
              { field: "cay", header: "CAY", placeholder: "" },
              { field: "caym1", header: "CAYm1", placeholder: "" },
              { field: "caym2", header: "CAYm2", placeholder: "" },
              { field: "caym3", header: "CAYm3", placeholder: "" },
              { field: "caym4", header: "CAYm4(LYG)", placeholder: "" },
              { field: "caym5", header: "CAYm5(LYGm1)", placeholder: "" },
              { field: "caym6", header: "CAYm6(LYGm2)", placeholder: "" },
            ],
          predefinedRows: [
            { item: "N52= No. of students admitted in 2nd year via multiple entry and exit points in same batch " },
            { item: "N53= No. of students admitted in 3rd year via multiple entry and exit points in same batch" },
            { item: "N54= No. of students admitted in 4th year via multiple entry and exit points in same batch" },
            { item: "N5=N52+N53+N54" , readOnly: true },
            { item: "N61= No. of students exits after 1st year via multiple entry and exit points in same batch" },
            { item: "N62= No. of students exit after 2nd year via multiple entry and exit points" },
            { item: "N63= No. of students exit after 3rd year via multiple entry and exit points in same batch" },
            { item: "N6=N61+N62+N63" , readOnly: true },
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

      const res = await newnbaCriteria4Service.getCriteria4_B_Data(cycle_sub_category_id, currentOtherStaffId);
      const rawResponse = res?.data || res || [];
      const d = Array.isArray(rawResponse) && rawResponse.length > 0 ? rawResponse[0] : rawResponse;
      
      console.log("🟠 Criterion4_BForm - Raw API Response:", rawResponse);
      console.log("🟠 Criterion4_BForm - Processed Data:", d);

      setStudentsPerformanceId(d.bstudents_performance_id || d.students_performance_id || null);

      const tableData = [];
      if (d.cri4_btable && Array.isArray(d.cri4_btable) && d.cri4_btable.length > 0) {
        const rowKeys = ["firstyear", "secondyear", "thirdyear", "totalN5", "firstyearN61", "secondyear62", "thirdyear63", "totalN6"];
        const predefinedItems = [
          "N52= No. of students admitted in 2nd year via multiple entry and exit points in same batch ",
          "N53= No. of students admitted in 3rd year via multiple entry and exit points in same batch",
          "N54= No. of students admitted in 4th year via multiple entry and exit points in same batch",
          "N5=N52+N53+N54",
          "N61= No. of students exits after 1st year via multiple entry and exit points in same batch",
          "N62= No. of students exit after 2nd year via multiple entry and exit points",
          "N63= No. of students exit after 3rd year via multiple entry and exit points in same batch",
          "N6=N61+N62+N63"
        ];
        
        rowKeys.forEach((key, index) => {
          const row = d.cri4_btable.find(r => r.row_type === key);
          if (row) {
            tableData.push({
              id: `row-${Date.now()}-${index}`,
              item: predefinedItems[index] || "",
              cay: row.cay || "",
              caym1: row.caym1 || "",
              caym2: row.caym2 || "",
              caym3: row.caym3 || "",
              caym4: row.caym4 || "",
              caym5: row.caym5 || "",
              caym6: row.caym6 || ""
            });
          } else {
            tableData.push({
              id: `row-${Date.now()}-${index}`,
              item: predefinedItems[index] || "",
              cay: "",
              caym1: "",
              caym2: "",
              caym3: "",
              caym4: "",
              caym5: "",
              caym6: ""
            });
          }
        });
      }

      setInitialData({
        content: { "4.1": "" },
        tableData: tableData.length > 0 ? tableData : [],
        filesByField: {
          "4.1": (d.cri4_bdocument || []).length > 0
            ? (d.cri4_bdocument || []).map((f, i) => ({
                id: `file-4.1-${i}`,
                filename: f.file_name || f.name || "",
                s3Url: f.file_url || f.url || "",
                description: f.description || "",
                uploading: false
              }))
            : [{ id: `file-4.1-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }]
        }
      });
    } catch (err) {
      console.warn("Load failed:", err);
      setStudentsPerformanceId(null);
      setInitialData({
        content: { "4.1": "" },
        tableData: [],
        filesByField: {
          "4.1": [{ id: `file-4.1-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }]
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
        const contributorsResponse = await newnbaCriteria4Service.getAllCriteria4_B_Data?.(cycle_sub_category_id);
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

  // ---------------- SAVE DATA (Same as 2.1) ----------------
const handleSave = async (formData) => {
  setSaving(true);

  try {
    const table = formData.tableData;

    // Map table rows to required keys
    const rowKeyMap = [
      "firstyear",        // row 0
      "secondyear",       // row 1
      "thirdyear",        // row 2
      "totalN5",          // row 3 (N5)
      "firstyearN61",     // row 4 (N61)
      "secondyear62",     // row 5 (N62)
      "thirdyear63",      // row 6 (N63)
      "totalN6"           // row 7 (N6)
    ];

    const cri4_btable = table.map((row, i) => {
      const key = rowKeyMap[i];
      if (!key) return null;

      return {
        row_type: key,
        cay: row.cay || "",
        caym1: row.caym1 || "",
        caym2: row.caym2 || "",
        caym3: row.caym3 || "",
        caym4: row.caym4 || "",
        caym5: row.caym5 || "",
        caym6: row.caym6 || ""
      };
    }).filter(Boolean);

    const filesWithCategory = Object.keys(formData.filesByField || {}).flatMap(
      (field) =>
        (formData.filesByField[field] || []).map((file) => ({
          ...file,
          category: "Students' Performance",
        }))
    );
    console.log("🟠 4B filesWithCategory before filter:", filesWithCategory);
    
    const cri4_bdocument = filesWithCategory
      .filter((f) => {
        const hasUrl = f.s3Url && f.s3Url.trim() !== "";
        console.log(`4B File ${f.filename}: hasUrl=${hasUrl}, s3Url=${f.s3Url}`);
        return hasUrl;
      })
      .map((f) => ({
        file_name: f.filename,
        file_url: f.s3Url,
        description: f.description || ""
      }));
    
    console.log("✅ 4B cri4_bdocument after mapping:", cri4_bdocument);

    // Get staff ID from localStorage
    const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
    const userInfoo = JSON.parse(localStorage.getItem("userInfo") || "{}");

    const staffId =
      otherStaffId ||
      userInfo?.rawData?.other_staff_id ||
      userInfo.user_id ||
      userInfoo?.other_staff_id;

    // FINAL PAYLOAD EXACTLY AS REQUIRED
    const payload = {
      other_staff_id : staffId,
      cycle_sub_category_id : cycle_sub_category_id,
      cri4_btable,
      cri4_bdocument
    };

    console.log("FINAL 4B PAYLOAD:", payload);

    if (studentsPerformanceId) {
      await newnbaCriteria4Service.putCriteria4_B_Data(studentsPerformanceId, payload);
    } else {
      await newnbaCriteria4Service.saveCriteria4_B_Data(payload);
    }

    setAlert(
      <SweetAlert success title="Saved!" confirmBtnCssClass="btn-confirm" onConfirm={() => setAlert(null)}>
        Criterion 4B saved successfully!
      </SweetAlert>
    );

    onSaveSuccess?.();
    loadData();
  } catch (err) {
    console.error("Save failed:", err);

    setAlert(
      <SweetAlert danger title="Save Failed" confirmBtnCssClass="btn-confirm" onConfirm={() => setAlert(null)}>
        Something went wrong while saving.
      </SweetAlert>
    );
  } finally {
    setSaving(false);
  }
};

  // ---------------- DELETE DATA (Same as 2.1) ----------------
  const handleDelete = async () => {
    if (!studentsPerformanceId) {
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
            const res = await newnbaCriteria4Service.deleteCriteria4_BData(
              studentsPerformanceId
            );

            let message = "Criteria 4 B deleted successfully.";
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

            setStudentsPerformanceId(null);
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
        Loading Criteria 4 B...
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
            title: "Criterion 4.B",
            statusField: "approval_status",
            userField: "other_staff_id",
            nameFields: ["firstname", "lastname"],
            idField: "bstudents_performance_id",
            isCoordinatorField: "is_coordinator_entry"
          }}
        />
        {alert}
      </>
    );
  }

  return (
    <div>
      <GenericCriteriaForm4_B
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

export default Criterion4_BForm;
