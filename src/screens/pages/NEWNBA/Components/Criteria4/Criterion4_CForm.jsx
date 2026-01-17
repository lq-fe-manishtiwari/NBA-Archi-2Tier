import React, { useState, useEffect, useCallback } from "react";
import GenericCriteriaForm4_B from "./GenericCriteriaForm4_B";
import { newnbaCriteria4Service } from "../../Services/NewNBA-Criteria4.service";
import SweetAlert from "react-bootstrap-sweetalert";

const Criterion4_CForm = ({
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
    filesByField: {}, 
  });

  const [alert, setAlert] = useState(null);
  const [cardData, setCardData] = useState([]);
  const [cardLoading, setCardLoading] = useState(false);

  // ---------------- CONFIG ----------------
  const config = {
    title:
      "Table No. 4C. No. of students graduated without backlogs",
    totalMarks: 20,
    fields: [
      {
        name: "4.1c",
        label: "4C. Admission details of a program",
        marks: 20,
        hasTable: true,
        tableConfig: {
          title: "Admission details of a program",
          columns: [
              { 
                field: "year_of_entry", 
                header: "Year of entry", 
                placeholder: "",
                readOnly: true 
              },
              { 
                field: "admitted_first_year", 
                header: "Number of students admitted in 1st year of the program (N1)", 
                placeholder: "" 
              },
              { 
                field: "graduated_i_year", 
                header: "I Year", 
                placeholder: "",
                subHeader: "Number of students who have successfully graduated without backlogs in any year of study" 
              },
              { 
                field: "graduated_ii_year", 
                header: "II Year", 
                placeholder: "" 
              },
              { 
                field: "graduated_iii_year", 
                header: "III Year", 
                placeholder: "" 
              },
              { 
                field: "graduated_iv_year", 
                header: "IV Year", 
                placeholder: "" 
              },
              { 
                field: "graduated_v_year", 
                header: "V Year", 
                placeholder: "" 
              },
            ],
          predefinedRows: [
            { year_of_entry: "CAY" },
            { year_of_entry: "CAYm1" },
            { year_of_entry: "CAYm2" },
            { year_of_entry: "CAYm3" },
            { year_of_entry: "CAYm4" },
            { year_of_entry: "CAYm5 (LYG)" },
            { year_of_entry: "CAYm6 (LYGm1)" },
            { year_of_entry: "CAYm7 (LYGm2)" },
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
      
      console.log("🟠 Criterion4_CForm - Loading data:");
      console.log("  - cycle_sub_category_id:", cycle_sub_category_id);
      console.log("  - otherStaffId (prop):", otherStaffId);
      console.log("  - currentOtherStaffId (final):", currentOtherStaffId);
      console.log("  - userIsContributor:", userIsContributor);
      
      // Call API with staff ID
      const res = await newnbaCriteria4Service.getCriteria4_C_Data(cycle_sub_category_id, currentOtherStaffId);
      
      // Handle both array and object responses like Criterion1_1Form
      const rawResponse = res?.data || res || [];
      const d = Array.isArray(rawResponse) && rawResponse.length > 0 ? rawResponse[0] : rawResponse;
      
      console.log("🟢 Criterion4_CForm - Raw API Response:", rawResponse);
      console.log("🟢 Criterion4_CForm - Processed Data:", d);

      // Set ID for update/delete operations
      setStudentsPerformanceId(d.id || null);

      // Parse table data from students_graduated_stipulated_data - API returns array of flat objects with row_type
      const tableData = [];
      const yearKeys = ["cay", "caym1", "caym2", "caym3", "caym4", "caym5", "caym6", "caym7"];
      const yearLabels = ["CAY", "CAYm1", "CAYm2", "CAYm3", "CAYm4", "CAYm5 (LYG)", "CAYm6 (LYGm1)", "CAYm7 (LYGm2)"];
      
      // If we have existing data, populate from API
      if (d.students_graduated_stipulated_data && Array.isArray(d.students_graduated_stipulated_data) && d.students_graduated_stipulated_data.length > 0) {
        yearKeys.forEach((key, index) => {
          const row = d.students_graduated_stipulated_data.find(r => r.row_type === key);
          if (row) {
            tableData.push({
              id: `row-${Date.now()}-${index}`,
              year_of_entry: yearLabels[index],
              admitted_first_year: row.admitted_first_year || "",
              graduated_i_year: row.graduated_i_year || "",
              graduated_ii_year: row.graduated_ii_year || "",
              graduated_iii_year: row.graduated_iii_year || "",
              graduated_iv_year: row.graduated_iv_year || "",
              graduated_v_year: row.graduated_v_year || ""
            });
          } else {
            // Add empty row if not found
            tableData.push({
              id: `row-${Date.now()}-${index}`,
              year_of_entry: yearLabels[index],
              admitted_first_year: "",
              graduated_i_year: "",
              graduated_ii_year: "",
              graduated_iii_year: "",
              graduated_iv_year: "",
              graduated_v_year: ""
            });
          }
        });
      } else {
        // No existing data - create empty rows with predefined labels
        yearLabels.forEach((label, index) => {
          tableData.push({
            id: `row-${Date.now()}-${index}`,
            year_of_entry: label,
            admitted_first_year: "",
            graduated_i_year: "",
            graduated_ii_year: "",
            graduated_iii_year: "",
            graduated_iv_year: "",
            graduated_v_year: ""
          });
        });
      }
      
      console.log("✅ Criterion4_CForm - Parsed tableData:", tableData);

      setInitialData({
        content: { "4.1c": "" },
        tableData: tableData.length > 0 ? tableData : [],
        filesByField: {
          "4.1c": (d.students_graduated_stipulated_document || []).length > 0
            ? (d.students_graduated_stipulated_document || []).map((f, i) => ({
                id: `file-4.1c-${i}`,
                filename: f.file_name || f.name || "",
                s3Url: f.file_url || f.url || "",
                description: f.description || "",
                uploading: false
              }))
            : [{ id: `file-4.1c-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }]
        }
      });
    } catch (err) {
      console.warn("Load failed:", err);
      setStudentsPerformanceId(null);
      
      // Create empty table data with year labels
      const yearLabels = ["CAY", "CAYm1", "CAYm2", "CAYm3", "CAYm4", "CAYm5 (LYG)", "CAYm6 (LYGm1)", "CAYm7 (LYGm2)"];
      const emptyTableData = yearLabels.map((label, index) => ({
        id: `row-empty-${index}`,
        year_of_entry: label,
        admitted_first_year: "",
        graduated_i_year: "",
        graduated_ii_year: "",
        graduated_iii_year: "",
        graduated_iv_year: "",
        graduated_v_year: ""
      }));
      
      setInitialData({
        content: { "4.1c": "" },
        tableData: [],
        filesByField: {
          "4.1c": [{ id: `file-4.1c-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }]
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
        const contributorsResponse = await newnbaCriteria4Service.getAllCriteria4_C_Data?.(cycle_sub_category_id);
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

    // Year key mapping
    const yearToKey = {
      "CAY": "cay",
      "CAYm1": "caym1",
      "CAYm2": "caym2",
      "CAYm3": "caym3",
      "CAYm4": "caym4",
      "CAYm5 (LYG)": "caym5",
      "CAYm6 (LYGm1)": "caym6",
      "CAYm7 (LYGm2)": "caym7"
    };

    // Build students_graduated_stipulated_data as array of flat objects
    const students_graduated_stipulated_data = table.map((row) => {
      const key = yearToKey[row.year_of_entry];
      if (!key) return null;

      return {
        row_type: key,
        admitted_first_year: row.admitted_first_year || "",
        graduated_i_year: row.graduated_i_year || "",
        graduated_ii_year: row.graduated_ii_year || "",
        graduated_iii_year: row.graduated_iii_year || "",
        graduated_iv_year: row.graduated_iv_year || "",
        graduated_v_year: row.graduated_v_year || ""
      };
    }).filter(Boolean);

    // Extract documents
    console.log("🟠 filesWithCategory before filter:", filesWithCategory);
    
    const students_graduated_stipulated_document = filesWithCategory
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
    
    console.log("✅ students_graduated_stipulated_document after mapping:", students_graduated_stipulated_document);

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
      students_graduated_stipulated_document,
      students_graduated_stipulated_data
    };

    console.log("FINAL PAYLOAD → ", payload);
    
    // Use PUT if updating existing entry, POST for new entry
    if (studentsPerformanceId) {
      await newnbaCriteria4Service.putCriteria4_C_Data(studentsPerformanceId, payload,staffId);
    } else {
      await newnbaCriteria4Service.saveCriteria4_C_Data(payload,staffId);
    }

    setAlert(
      <SweetAlert success title="Saved!" confirmBtnCssClass="btn-confirm" onConfirm={() => setAlert(null)}>
        Criterion 4B saved successfully
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
            const res = await newnbaCriteria4Service.deleteCriteria4_CData(
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
            title: "Criterion 4.B",
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

export default Criterion4_CForm;