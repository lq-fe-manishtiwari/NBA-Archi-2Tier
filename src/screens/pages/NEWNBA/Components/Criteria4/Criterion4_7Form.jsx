import React, { useState, useEffect, useCallback } from "react";
import GenericCriteriaForm4_7 from "./GenericCriteriaForm4_7";
import { newnbaCriteria4Service } from "../../Services/NewNBA-Criteria4.service";
import SweetAlert from "react-bootstrap-sweetalert";
import GenericCardWorkflow from "../GenericCardWorkflow";

const Criterion4_7Form = ({
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
  const [firstYearStudentsId, setFirstYearStudentsId] = useState(null);
  const [isContributor, setIsContributor] = useState(false);

  const [initialData, setInitialData] = useState({
    content: {},
    tableData: [],
    files: [],
  });

  const [alert, setAlert] = useState(null);
  const [cardData, setCardData] = useState([]);
  const [cardLoading, setCardLoading] = useState(false);

  // Helper function to get row labels (matching the image)
  const getRowLabel = (index) => {
    const labels = [
      "(Mean of 1st Year Grade Point Average of all successful Students on a 10-point scale) or (Mean of the percentage of marks of all successful students in 1st year/10) (X)",
      "Total no. of successful students (Y)",
      "Total no. of students appeared in the examination (Z)",
      "API = X * (Y/Z)",
      "Average API = (AP1 + AP2 + AP3)/3"
    ];
    return labels[index] || "";
  };

  // ---------------- CONFIG ----------------
  const config = {
    title: "4.7. Academic Performance in First Year (10)",
    totalMarks: 10,
    fields: [
      {
        name: "4.7",
        label: "4.7 Academic Performance in First Year",
        marks: 10,
        hasTable: true,
        tableConfig: {
          title: "Academic Performance in First Year",
          columns: [
            { field: "item", header: "Academic Performance", placeholder: "" },
            { field: "caym1", header: "CAYm1", placeholder: "" },
            { field: "caym2", header: "CAYm2", placeholder: "" },
            { field: "caym3", header: "CAYm3", placeholder: "" },
          ],
        },
        predefinedRows: [
          { item: "(Mean of 1st Year Grade Point Average of all successful Students on a 10-point scale) or (Mean of the percentage of marks of all successful students in 1st year/10) (X)" },
          { item: "Total no. of successful students (Y)" },
          { item: "Total no. of students appeared in the examination (Z)" },
          { item: "API = X * (Y/Z)" },
          { item: "Average API = (AP1 + AP2 + AP3)/3" },
        ],
      },
    ],
  };

  // Load contributors data for card view
  const loadContributorsData = async () => {
    if (!showCardView || !cycle_sub_category_id) return;
    
    setCardLoading(true);
    try {
      const contributorsResponse = await newnbaCriteria4Service.getAllCriteria4_7_Data?.(cycle_sub_category_id);
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

  // ---------------- LOAD DATA ----------------
  const loadData = useCallback(async () => {
    if (!cycle_sub_category_id) return setLoading(false);

    try {
      setLoading(true);

      const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
      const userInfoo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const userIsContributor = userInfo?.rawData?.is_contributor || false;
      setIsContributor(userIsContributor);
      
      const currentOtherStaffId = otherStaffId || userInfo?.rawData?.other_staff_id || userInfo.user_id || userInfoo?.other_staff_id;

      const res = await newnbaCriteria4Service.getCriteria4_7_Data(cycle_sub_category_id, currentOtherStaffId);
      const rawResponse = res?.data || res || [];
      const d = Array.isArray(rawResponse) && rawResponse.length > 0 ? rawResponse[0] : rawResponse;

      setFirstYearStudentsId(d.id || null);

      // Transform table data from API response
      const transformedTableData = d.academic_performance_data ? 
        d.academic_performance_data.map((row, index) => ({
          id: `row-${Date.now()}-${index}`,
          item: getRowLabel(index),
          caym1: row.caym1 || "",
          caym2: row.caym2 || "",
          caym3: row.caym3 || ""
        })) : [];

      setInitialData({
        content: { "4.7": "" },
        tableData: transformedTableData,
        filesByField: {
          "4.7": (d.academic_performance_document || []).length > 0
            ? (d.academic_performance_document || []).map((f, i) => ({
                id: `file-4.7-${i}`,
                filename: f.file_name || f.name || "",
                s3Url: f.file_url || f.url || "",
                description: f.description || "",
                uploading: false
              }))
            : [{ id: `file-4.7-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }]
        }
      });
    } catch (err) {
      console.warn("Load failed:", err);

      setFirstYearStudentsId(null);
      setInitialData({
        content: { "4.7": "" },
        tableData: [],
        filesByField: {
          "4.7": [{ id: `file-4.7-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }]
        }
      });
    } finally {
      setLoading(false);
    }
  }, [cycle_sub_category_id, otherStaffId]);

  // ---------------- TRANSFORM TABLE INTO REQUIRED PAYLOAD ----------------
  const transformAcademicPerformance = (table) => {
    const rowKeys = ["Xrow", "Yrow", "Zrow", "api", "averageApi"];
    
    return table.map((row, i) => {
      const key = rowKeys[i];
      if (!key) return null;

      return {
        row_type: key,
        caym1: row.caym1 || "",
        caym2: row.caym2 || "",
        caym3: row.caym3 || ""
      };
    }).filter(Boolean);
  };

  // ---------------- SAVE DATA ----------------
  const handleSave = async (formData) => {
    setSaving(true);

    try {
      const filesWithCategory = Object.keys(formData.filesByField || {}).flatMap(
        (field) =>
          (formData.filesByField[field] || []).map((file) => ({
            ...file,
            category: "Students' Performance - First Year",
          }))
      );

      const academic_performance_document = filesWithCategory
        .filter((f) => {
          const hasUrl = f.s3Url && f.s3Url.trim() !== "";
          return hasUrl;
        })
        .map((f) => ({
          file_name: f.filename,
          file_url: f.s3Url,
          description: f.description || ""
        }));

      const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
      const userInfoo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const staffId = otherStaffId || userInfo?.rawData?.other_staff_id || userInfo.user_id || userInfoo?.other_staff_id;

      const academic_performance_data = transformAcademicPerformance(formData.tableData);

      const payload = {
        other_staff_id: staffId,
        cycle_sub_category_id: cycle_sub_category_id,
        academic_performance_data,
        academic_performance_document
      };

      if (firstYearStudentsId) {
        await newnbaCriteria4Service.putCriteria4_7_Data(firstYearStudentsId, payload,staffId);
      } else {
        await newnbaCriteria4Service.saveCriteria4_7_Data(payload,staffId);
      }

      setAlert(
        <SweetAlert
          success
          title="Saved!"
          confirmBtnCssClass="btn-confirm"
          confirmBtnText="OK"
          onConfirm={() => setAlert(null)}
        >
          Criterion 4.7 saved successfully
        </SweetAlert>
      );

      onSaveSuccess?.();
      loadData();
    } catch (err) {
      console.error("Save failed:", err);

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

  // ---------------- DELETE DATA ----------------
  const handleDelete = async () => {
    if (!firstYearStudentsId) {
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
            const res = await newnbaCriteria4Service.deleteCriteria4_7Data(firstYearStudentsId);

            let message = "Criterion 4.7 deleted successfully.";
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

            setFirstYearStudentsId(null);
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
        Loading Criterion 4.7...
      </div>
    );
  }

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
            title: "Criterion 4.7",
            statusField: "approval_status",
            userField: "other_staff_id",
            nameFields: ["firstname", "lastname"],
            idField: "first_year_students_id",
            isCoordinatorField: "is_coordinator_entry"
          }}
        />
        {alert}
      </>
    );
  }

  return (
    <div>
      <GenericCriteriaForm4_7
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

export default Criterion4_7Form;