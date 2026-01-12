import React, { useState, useEffect, useCallback } from "react";
import GenericCriteriaForm4_C from "./GenericCriteriaForm4_C";
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
    files: [],
  });

  const [alert, setAlert] = useState(null);
  const [cardData, setCardData] = useState([]);
  const [cardLoading, setCardLoading] = useState(false);

  // ---------------- CONFIG ----------------
  const config = {
    title:
      "4C: No. of students graduated within the stipulated period of the program.",
    totalMarks: 20,
    fields: [
      {
        name: "4.1",
        label: "4C: No. of students graduated within the stipulated period of the program.",
        marks: 20,
        hasTable: true,
        tableConfig: {
          title: "Teaching-Learning Activities",
          columns: [
            { field: "item", header: "Year of entry"},
            { field: "item1", header: "Total no. of students (N1 + N2 + N3+ N4+N5-N6 as defined above)"},
            { field: "cay", header: "I Year" },
            { field: "caym1", header: "II Year " },
            { field: "caym2", header: "III Year" },
            { field: "caym3", header: "IV Year" },
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
      
      const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
      const userInfoo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const userIsContributor = userInfo?.rawData?.is_contributor || false;
      setIsContributor(userIsContributor);
      
      const currentOtherStaffId = otherStaffId || userInfo?.rawData?.other_staff_id || userInfo.user_id || userInfoo?.other_staff_id;

      const res = await newnbaCriteria4Service.getCriteria4_C_Data(cycle_sub_category_id, currentOtherStaffId);
      const rawResponse = res?.data || res || [];
      const d = Array.isArray(rawResponse) && rawResponse.length > 0 ? rawResponse[rawResponse.length - 1] : rawResponse;

      setStudentsPerformanceId(d.cstudents_performance_id || null);

      const tableData = [];
      if (d.cri4_ctable && Array.isArray(d.cri4_ctable) && d.cri4_ctable.length > 0) {
        d.cri4_ctable.forEach((row, index) => {
          tableData.push({
            id: `row-${Date.now()}-${index}`,
            item: row.row_type || row.item || "",
            item1: row.item1 || "",
            cay: row.cay || "",
            caym1: row.caym1 || "",
            caym2: row.caym2 || "",
            caym3: row.caym3 || ""
          });
        });
      }

      setInitialData({
        content: { "4.1": "" },
        tableData: tableData.length > 0 ? tableData : [],
        filesByField: {
          "4.1": (d.cri4_cdocument || []).length > 0
            ? (d.cri4_cdocument || []).map((f, i) => ({
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
      const table = formData.tableData || [];

      // Build cri4_ctable as array of flat objects
      const cri4_ctable = table.map((row) => {
        if (!row.item) return null;
        
        return {
          row_type: row.item,
          item1: row.item1 || "",
          cay: row.cay || "",
          caym1: row.caym1 || "",
          caym2: row.caym2 || "",
          caym3: row.caym3 || "",
        };
      }).filter(Boolean);

      const filesWithCategory = Object.keys(formData.filesByField || {}).flatMap(
        (field) =>
          (formData.filesByField[field] || []).map((file) => ({
            ...file,
            category: "Students' Performance",
          }))
      );
      console.log("🟠 4C filesWithCategory before filter:", filesWithCategory);
      
      const cri4_cdocument = filesWithCategory
        .filter((f) => {
          const hasUrl = f.s3Url && f.s3Url.trim() !== "";
          console.log(`4C File ${f.filename}: hasUrl=${hasUrl}, s3Url=${f.s3Url}`);
          return hasUrl;
        })
        .map((f) => ({
          file_name: f.filename,
          file_url: f.s3Url,
          description: f.description || ""
        }));
      
      console.log("✅ 4C cri4_cdocument after mapping:", cri4_cdocument);

      const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
      const userInfoo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const staffId = otherStaffId || userInfo?.rawData?.other_staff_id || userInfo.user_id || userInfoo?.other_staff_id;

      const payload = {
        other_staff_id: staffId,
        cycle_sub_category_id : cycle_sub_category_id,
        cri4_cdocument,
        cri4_ctable
      };

      console.log("FINAL 4C PAYLOAD:", payload);

      if (studentsPerformanceId) {
        await newnbaCriteria4Service.putCriteria4_C_Data(studentsPerformanceId, payload);
      } else {
        await newnbaCriteria4Service.saveCriteria4_C_Data(payload);
      }

      setAlert(
        <SweetAlert success title="Saved!" confirmBtnCssClass="btn-confirm" onConfirm={() => setAlert(null)}>
          Criteria 4 C saved successfully
        </SweetAlert>
      );

      onSaveSuccess?.();
      loadData();
    } catch (err) {
      console.error("Save failed:", err);
      setAlert(
        <SweetAlert danger title="Save Failed" confirmBtnCssClass="btn-confirm" onConfirm={() => setAlert(null)}>
          Something went wrong while saving
        </SweetAlert>
      );
    } finally {
      setSaving(false);
    }
  };

  // ---------------- DELETE DATA ----------------
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

            let message = "Criteria 4 C deleted successfully.";
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
        Loading Criteria 4 C...
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
            title: "Criterion 4.C",
            statusField: "approval_status",
            userField: "other_staff_id",
            nameFields: ["firstname", "lastname"],
            idField: "cstudents_performance_id",
            isCoordinatorField: "is_coordinator_entry"
          }}
        />
        {alert}
      </>
    );
  }

  return (
    <div>
      <GenericCriteriaForm4_C
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
