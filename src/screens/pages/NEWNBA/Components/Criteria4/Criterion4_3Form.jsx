import React, { useState, useEffect, useCallback } from "react";
import GenericCriteriaForm4_3 from "./GenericCriteriaForm4_3";
import { newnbaCriteria4Service } from "../../Services/NewNBA-Criteria4.service";
import SweetAlert from "react-bootstrap-sweetalert";

const Criterion4_3Form = ({
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
  const [academicPerformanceId, setAcademicPerformanceId] = useState(null);
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
      "4.3. Academic Performance of the First-Year Students of the Program",
    totalMarks: 10,
    fields: [
      {
        name: "4.3",
        label: "4.3. Academic Performance of the First-Year Students of the Program",
        marks: 10,
        hasTable: true,
          tableConfig: {
            title: "Teaching-Learning Activities",
            columns: [
              { field: "item", header: "Academic Performance ", placeholder: "" },
              { field: "caym1", header: "CAYm1", placeholder: "" },
              { field: "caym2", header: "CAYm2", placeholder: "" },
              { field: "caym3", header: "CAYm3", placeholder: "" },
            ],
            predefinedRows: [
            { item: "X= (Mean of 1st year grade point average of all successful students on a 10-point scale) or (Mean of the percentage of marks of all successful students in 1st year/10)" },
            { item: "Y= Total no. of successful students" },
            { item: "Z = Total no. of students appeared in the examination " },
            { item: "API = X* (Y/Z)" },
            { item: "Average API = ( API_1 + API_2 + API_3)/3" },
          ],
          },
      },
    ],
  };

  const loadContributorsData = async () => {
    if (!showCardView || !cycle_sub_category_id) return;
    
    setCardLoading(true);
    try {
      const contributorsResponse = await newnbaCriteria4Service.getAllCriteria4_3_Data?.(cycle_sub_category_id);
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

      const res = await newnbaCriteria4Service.getCriteria4_3_Data(cycle_sub_category_id, currentOtherStaffId);
      const rawResponse = res?.data || res || [];
      const d = Array.isArray(rawResponse) && rawResponse.length > 0 ? rawResponse[rawResponse.length - 1] : rawResponse;

      setAcademicPerformanceId(d.id || null);

      const files = (d.academic_performance_document || []).map((f, i) => ({
        id: f.id || `file-${i}`,
        filename: f.filename || f.file_name || "",
        s3Url: f.url || f.file_url || "",
        description: f.description || f.filename || f.file_name || "",
        uploading: false,
      }));

      const tableArray = d.academic_performance_data || [];
      const tableData = tableArray.length > 0 ? tableArray.map((row, i) => ({
        id: `row-${Date.now()}-${i}`,
        item: config.fields[0].tableConfig.predefinedRows[i]?.item || "",
        caym1: row.caym1 || "",
        caym2: row.caym2 || "",
        caym3: row.caym3 || "",
      })) : [];

    setInitialData({
  content: { "4.3": "" },
  tableData,
  filesByField: {
    "4.3": files.length > 0
      ? files
      : [
          {
            id: `file-4.3-0`,
            description: "",
            file: null,
            filename: "",
            s3Url: "",
            uploading: false,
          },
        ],
  },
});

    } catch (err) {
      console.warn("Load failed:", err);

      setAcademicPerformanceId(null);
      setInitialData({
        content: { "4.3": "" },
        tableData: [],
        filesByField: {
          "4.3": [{ id: `file-4.3-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }]
        }
      });
    } finally {
      setLoading(false);
    }
  }, [cycle_sub_category_id, otherStaffId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ---------------- TRANSFORM TABLE DATA ----------------
const transformTableData = (tableData) => {
  const rowKeys = ["Xrow", "Yrow", "Zrow", "api", "averageApi"];
  
  return tableData.map((row, i) => {
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

const transformFiles = (files) =>
  (files || [])
    .filter((f) => f.s3Url || f.file)
    .map((f) => ({
      description: f.description || "",
      filename: f.filename || "",
      url: f.s3Url || "",
    }));

// ---------------- SAVE DATA ----------------
const handleSave = async (formData) => {
  setSaving(true);

  try {
    const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
    const userInfoo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const staffId = otherStaffId || userInfo?.rawData?.other_staff_id || userInfo.user_id || userInfoo?.other_staff_id;

    const payload = {
      other_staff_id: staffId,
      cycle_sub_category_id: cycle_sub_category_id,
      academic_performance_data: transformTableData(formData.tableData),
      academic_performance_document: transformFiles(formData.filesByField["4.3"])
    };

    if (academicPerformanceId) {
      await newnbaCriteria4Service.putCriteria4_3_Data(academicPerformanceId, payload,staffId);
    } else {
      await newnbaCriteria4Service.saveCriteria4_3_Data(payload,staffId);
    }

    setAlert(
      <SweetAlert
        success
        title="Saved!"
        confirmBtnCssClass="btn-confirm"
        confirmBtnText="OK"
        onConfirm={() => setAlert(null)}
      >
        Criterion 4.3 saved successfully
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
    if (!academicPerformanceId) {
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
            const res = await newnbaCriteria4Service.deleteCriteria4_3Data(
              academicPerformanceId
            );

            let message = "Criterion 4.3 deleted successfully.";
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

            setAcademicPerformanceId(null);
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
        Loading Criterion 4.3...
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
      <GenericCriteriaForm4_3
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

export default Criterion4_3Form;
