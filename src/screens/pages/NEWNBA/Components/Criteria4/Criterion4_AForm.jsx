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
      "4A. Admission details for the program excluding those admitted through multiple entry and exit points",
    totalMarks: 20,
    fields: [
      {
        name: "4.8",
        label: "4A. Admission details for the program excluding those admitted through multiple entry and exit points",
        marks: 20,
        hasTable: true,
        tableConfig: {
          title: "Teaching-Learning Activities",
          columns: [
              { field: "item", header: "Item (Information is to be provided cumulatively for all the shifts with explicit headings, wherever applicable)", placeholder: "" },
              { field: "cay", header: "CAY", placeholder: "" },
              { field: "caym1", header: "CAYm1", placeholder: "" },
              { field: "caym2", header: "CAYm2", placeholder: "" },
              { field: "caym3", header: "CAYm3", placeholder: "" },
              { field: "caym4", header: "CAYm4(LYG)", placeholder: "" },
              { field: "caym5", header: "CAYm5(LYGm1)", placeholder: "" },
              { field: "caym6", header: "CAYm6(LYGm2)", placeholder: "" },
            ],
          predefinedRows: [
            { item: "N= Sanctioned intake of the program (as per AICTE/Competent authority)" },
            { item: "N1= Total no. of students admitted in the 1st year minus the no. of students, who migrated to other programs/ institutions plus no. of students, who migrated to this program" },
            { item: "N2= Number of students admitted in 2nd year in the same batch via lateral entry including leftover seats " },
            { item: "N3= Separate division if any" },
            { item: "N4= Total no. of students admitted in the 1st year via all supernumerary quotas" },
            { item: "Total number of students admitted in the program (N1 + N2 + N3 + N4) - excluding those admitted through multiple entry and exit points." },
          ],
        },
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
      
      // Check if user is contributor
      const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
      const userInfoo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const userIsContributor = userInfo?.rawData?.is_contributor || false;
      setIsContributor(userIsContributor);
      
      // Determine staff ID to use - otherStaffId has priority
      const currentOtherStaffId = otherStaffId || userInfo?.rawData?.other_staff_id || userInfo.user_id || userInfoo?.other_staff_id;
      
      console.log("🟠 Criterion4_AForm - Loading data:");
      console.log("  - cycle_sub_category_id:", cycle_sub_category_id);
      console.log("  - otherStaffId (prop):", otherStaffId);
      console.log("  - currentOtherStaffId (final):", currentOtherStaffId);
      console.log("  - userIsContributor:", userIsContributor);
      
      // Call API with staff ID
      const res = await newnbaCriteria4Service.getCriteria4_A_Data(cycle_sub_category_id, currentOtherStaffId);
      
      // Handle both array and object responses like Criterion1_1Form
      const rawResponse = res?.data || res || [];
      const d = Array.isArray(rawResponse) && rawResponse.length > 0 ? rawResponse[0] : rawResponse;
      
      console.log("🟢 Criterion4_AForm - Raw API Response:", rawResponse);
      console.log("🟢 Criterion4_AForm - Processed Data:", d);

      // Set ID for update/delete operations
      setStudentsPerformanceId(d.students_performance_id || null);

      // Parse table data from cri4_atable - API returns array of flat objects with row_type
      const tableData = [];
      if (d.cri4_atable && Array.isArray(d.cri4_atable) && d.cri4_atable.length > 0) {
        const rowKeys = ["sanctionedintake", "firstyear", "secondyear", "thirdyear", "separatedivision", "studentadmitted"];
        const predefinedItems = [
          "N= Sanctioned intake of the program (as per AICTE/Competent authority)",
          "N1= Total no. of students admitted in the 1st year minus the no. of students, who migrated to other programs/ institutions plus no. of students, who migrated to this program",
          "N2= Number of students admitted in 2nd year in the same batch via lateral entry including leftover seats ",
          "N3= Separate division if any",
          "N4= Total no. of students admitted in the 1st year via all supernumerary quotas",
          "Total number of students admitted in the program (N1 + N2 + N3 + N4) - excluding those admitted through multiple entry and exit points."
        ];
        
        rowKeys.forEach((key, index) => {
          const row = d.cri4_atable.find(r => r.row_type === key);
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
            // Add empty row if not found
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
      
      console.log("✅ Criterion4_AForm - Parsed tableData:", tableData);

      setInitialData({
        content: { "4.8": "" },
        tableData: tableData.length > 0 ? tableData : [],
        filesByField: {
          "4.8": (d.cri4_adocument || []).length > 0
            ? (d.cri4_adocument || []).map((f, i) => ({
                id: `file-4.8-${i}`,
                filename: f.file_name || f.name || "",
                s3Url: f.file_url || f.url || "",
                description: f.description || "",
                uploading: false
              }))
            : [{ id: `file-4.8-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }]
        }
      });

    } catch (err) {
      console.warn("❌ Criterion4_AForm - API failed or returned 404, showing blank form", err);
      setStudentsPerformanceId(null);
      setInitialData({
        content: { "4.8": "" },
        tableData: [],
        filesByField: {
          "4.8": [{ id: `file-4.8-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }]
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

  // ---------------- SAVE DATA (Same as 4.8) ----------------
const handleSave = async (formData) => {
  setSaving(true);

  try {
    const filesWithCategory = Object.keys(formData.filesByField || {}).flatMap(
        (field) =>
          (formData.filesByField[field] || []).map((file) => ({
            ...file,
            category: "Students’ Performance",
          }))
      );
      console.log(filesWithCategory);

    const table = formData.tableData;

    // Row key mapping in correct order (6 rows, last one is auto-calculated)
    const rowToKey = [
      "sanctionedintake",
      "firstyear",
      "secondyear",
      "thirdyear",
      "separatedivision",
      "studentadmitted"
    ];

    // Build cri4_atable as array of flat objects
    const cri4_atable = table.map((row, i) => {
      const key = rowToKey[i];
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

    // Extract documents
    console.log("🟠 filesWithCategory before filter:", filesWithCategory);
    
    const cri4_adocument = filesWithCategory
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
    
    console.log("✅ cri4_adocument after mapping:", cri4_adocument);


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
      cri4_adocument,
      cri4_atable
    };

    console.log("FINAL PAYLOAD → ", payload);
    
    // Use PUT if updating existing entry, POST for new entry
    if (studentsPerformanceId) {
      await newnbaCriteria4Service.putCriteria4_A_Data(studentsPerformanceId, payload);
    } else {
      await newnbaCriteria4Service.saveCriteria4_A_Data(payload);
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
            idField: "students_performance_id",
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
