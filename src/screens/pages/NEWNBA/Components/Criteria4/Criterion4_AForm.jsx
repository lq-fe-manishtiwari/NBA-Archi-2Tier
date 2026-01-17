import React, { useState, useEffect, useCallback } from "react";
import GenericCriteriaForm4_A from "./GenericCriteriaForm4_A";
import { newnbaCriteria4Service } from "../../Services/NewNBA-Criteria4.service";
import SweetAlert from "react-bootstrap-sweetalert";

const Criterion4_AForm = ({
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
      "Table No. 4A. Admission details of a program",
    totalMarks: 20,
    fields: [
      {
        name: "4.8",
        label: "4A. Admission details of a program",
        marks: 20,
        hasTable: true,
       tableConfig: {
  title: "Admission details of a program",
columns: [
  { field: "item", header: "Item", isItem: true }, // 👈 change here
  { field: "cay", header: "CAY" },
  { field: "caym1", header: "CAYm1" },
  { field: "caym2", header: "CAYm2" },
  { field: "caym3", header: "CAYm3" },
  { field: "caym4", header: "CAYm4" },
  { field: "caym5", header: "CAYm5 (LYG)" },
  { field: "caym6", header: "CAYm6 (LYGm1)" },
  { field: "caym7", header: "CAYm7 (LYGm2)" },
]
,
predefinedRows: [
  {
    item: "Sanctioned intake of a program (N)",
    cay: "",
    caym1: "",
    caym2: "",
    caym3: "",
    caym4: "",
    caym5: "",
    caym6: "",
    caym7: ""
  },
  {
    item: "Total number of students admitted in 1st year of the program (N1)",
    cay: "",
    caym1: "",
    caym2: "",
    caym3: "",
    caym4: "",
    caym5: "",
    caym6: "",
    caym7: ""
  }
]

}

      },
    ],
  };

  // ---------------- LOAD DATA  ----------------
const loadData = useCallback(async () => {
  if (!cycle_sub_category_id) {
    setLoading(false);
    return;
  }

  try {
    setLoading(true);

    // ---------- USER INFO ----------
    const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
    const userInfoo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const userIsContributor = userInfo?.rawData?.is_contributor || false;
    setIsContributor(userIsContributor);

    const currentOtherStaffId =
      otherStaffId ||
      userInfo?.rawData?.other_staff_id ||
      userInfo?.user_id ||
      userInfoo?.other_staff_id;

    console.log("🟠 Criterion4_AForm - Loading data");
    console.log("cycle_sub_category_id:", cycle_sub_category_id);
    console.log("staffId:", currentOtherStaffId);

    // ---------- API CALL ----------
    const res = await newnbaCriteria4Service.getCriteria4_A_Data(
      cycle_sub_category_id,
      currentOtherStaffId
    );

    const rawResponse = res?.data || res || [];
    const d =
      Array.isArray(rawResponse) && rawResponse.length > 0
        ? rawResponse[0]
        : rawResponse;

    console.log("🟢 API Response:", d);

    setStudentsPerformanceId(d?.id || null);

    // ---------- TABLE MAPPING (IMPORTANT PART) ----------
    const predefinedRows =
      config.fields[0].tableConfig.predefinedRows;

    // clone predefined rows (2 rows only)
    const uiTableData = predefinedRows.map((row) => ({
      ...row,
    }));

    const yearKeys = [
      "cay",
      "caym1",
      "caym2",
      "caym3",
      "caym4",
      "caym5",
      "caym6",
      "caym7",
    ];

    if (Array.isArray(d?.admission_details_data)) {
      d.admission_details_data.forEach((yearRow) => {
        const yearKey = yearRow.row_type;

        if (!yearKeys.includes(yearKey)) return;

        // Row 0 → Sanctioned intake (N)
        uiTableData[0][yearKey] =
          yearRow.sanctioned_intake || "";

        // Row 1 → Total admitted in 1st year (N1)
        uiTableData[1][yearKey] =
          yearRow.admitted_first_year || "";
      });
    }

    console.log("✅ UI Table Data:", uiTableData);

    // ---------- FILE MAPPING ----------
    const files =
      (d?.admission_details_document || []).length > 0
        ? d.admission_details_document.map((f, i) => ({
            id: `file-4.8-${i}`,
            filename: f.file_name || "",
            s3Url: f.file_url || "",
            description: f.description || "",
            uploading: false,
          }))
        : [
            {
              id: "file-4.8-0",
              description: "",
              file: null,
              filename: "",
              s3Url: "",
              uploading: false,
            },
          ];

    // ---------- SET INITIAL DATA ----------
    setInitialData({
      content: { "4.8": "" },
      tableData: uiTableData,
      filesByField: {
        "4.8": files,
      },
    });
  } catch (err) {
    console.warn(
      "❌ Criterion4_AForm - API failed, loading empty table",
      err
    );

    setStudentsPerformanceId(null);

    // fallback → empty predefined rows
    const fallbackRows =
      config.fields[0].tableConfig.predefinedRows.map((r) => ({
        ...r,
      }));

    setInitialData({
      content: { "4.8": "" },
      tableData: fallbackRows,
      filesByField: {
        "4.8": [
          {
            id: "file-4.8-0",
            description: "",
            file: null,
            filename: "",
            s3Url: "",
            uploading: false,
          },
        ],
      },
    });
  } finally {
    setLoading(false);
  }
}, [cycle_sub_category_id, otherStaffId]);


  const loadContributorsData = async () => {
      if (!showCardView || !cycle_sub_category_id) return;
      
      setCardLoading(true);
      try {
        const contributorsResponse = await newnbaCriteria4Service.getAllCriteria4_A_Data?.(cycle_sub_category_id);
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

  // ---------------- SAVE DATA ----------------
const handleSave = async (formData) => {
  setSaving(true);

  try {
    const filesWithCategory = Object.keys(formData.filesByField || {}).flatMap(
        (field) =>
          (formData.filesByField[field] || []).map((file) => ({
            ...file,
            category: "Students' Performance",
          }))
      );
      console.log(filesWithCategory);

    const table = formData.tableData;

      // year keys from columns
      const yearKeys = ["cay","caym1","caym2","caym3","caym4","caym5","caym6","caym7"];

      const admission_details_data = yearKeys.map((yearKey) => ({
        row_type: yearKey,
        sanctioned_intake: table[0]?.[yearKey] || "",
        admitted_first_year: table[1]?.[yearKey] || ""
      }));


    // Extract documents
    console.log("🟠 filesWithCategory before filter:", filesWithCategory);
    
    const admission_details_document = filesWithCategory
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
    
    console.log("✅ admission_details_document after mapping:", admission_details_document);

    // Get staff ID
    const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
    const userInfoo = JSON.parse(localStorage.getItem("userInfo") || "{}");

    const staffId =
      otherStaffId ||
      userInfo?.rawData?.other_staff_id ||
      userInfo.user_id ||
      userInfoo?.other_staff_id;

    // FINAL PAYLOAD (Correct Format)
    const payload = {
      other_staff_id: staffId,
      cycle_sub_category_id: cycle_sub_category_id,
      admission_details_document,
      admission_details_data
    };

    console.log("FINAL PAYLOAD → ", payload);
    
    // Use PUT if updating existing entry, POST for new entry
    if (studentsPerformanceId) {
      await newnbaCriteria4Service.putCriteria4_A_Data(studentsPerformanceId, payload,staffId);
    } else {
      await newnbaCriteria4Service.saveCriteria4_A_Data(payload,staffId);
    }

    setAlert(
      <SweetAlert success title="Saved!" confirmBtnCssClass="btn-confirm" onConfirm={() => setAlert(null)}>
        Criterion 4A saved successfully
      </SweetAlert>
    );

    onSaveSuccess?.();
    loadData();
  } catch (err) {
    console.error(err);
    setAlert(
      <SweetAlert danger title="Save Failed" confirmBtnCssClass="btn-confirm" onConfirm={() => setAlert(null)}>
        Something went wrong while saving
      </SweetAlert>
    );
  } finally {
    setSaving(false);
  }
};

  // ---------------- DELETE DATA----------------
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
            const res = await newnbaCriteria4Service.deleteCriteria4_AData(
              studentsPerformanceId
            );

            let message = "Criteria 4 A deleted successfully.";
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
        Loading Criteria 4 A...
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
            title: "Criterion 4.A",
            statusField: "approval_status",
            userField: "other_staff_id",
            nameFields: ["firstname", "lastname"],
            idField: "id",
            isCoordinatorField: "is_coordinator_entry"
          }}
        />
        {alert}
      </>
    );
  }

  return (
    <div>
      <GenericCriteriaForm4_A
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

export default Criterion4_AForm;