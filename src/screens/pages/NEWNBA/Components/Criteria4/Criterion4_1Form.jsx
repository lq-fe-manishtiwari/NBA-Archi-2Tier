import React, { useState, useEffect, useCallback } from "react";
import GenericCriteriaForm4_1 from "./GenericCriteriaForm4_1";
import GenericCardWorkflow from "../GenericCardWorkflow"
import { newnbaCriteria4Service } from "../../Services/NewNBA-Criteria4.service";
import SweetAlert from "react-bootstrap-sweetalert"; 

const Criterion4_1Form = ({ 
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
  const [enrolmentRatioId, setEnrolmentRatioId] = useState(null);
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
      "4.1. Enrolment Ratio in the First Year",
    totalMarks: 20,
    fields: [
      {
        name: "4.1",
        label: "4.1. Enrolment Ratio in the First Year",
        marks: 20,
        hasTable: true,
        tableConfig: {
          title: "Teaching-Learning Activities",
          columns: [
            { field: "item", header: "Item (Students enrolled in the First Year on average over 3 academic years (CAY, CAYm1, and CAYm2))", readOnly: true },
            { field: "cay", header: "CAY" },
            { field: "caym1", header: "CAYm1" },
            { field: "caym2", header: "CAYm2" },
          ],
          predefinedRows: [
            { item: "N= Sanctioned intake of the program in the 1st year (as per AICTE/Competent authority)" },
            { item: "N1= Total no. of students admitted in the 1st year minus the no. of students, who migrated to other programs/ institutions plus no. of students, who migrated to this program" },
            { item: "N4= Total no. of students admitted in the 1st year via all supernumerary quotas" },
            { item: "Enrolment Ratio (ER)= (N1+N4)/N " },
            { item: "Average ER= (ER_1+ ER_2+ ER_3)/3" },
          ],
        },
      },
    ],
  };

  const enrolmentToTable = (enrolment = {}) => {
    const rows = [
      {
        id: `row-sanctioned-${Date.now()}`,
        item:
          "N= Sanctioned intake of the program in the 1st year (as per AICTE/Competent authority)",
        cay: enrolment?.sanctionedintake?.cay ?? "",
        caym1: enrolment?.sanctionedintake?.caym1 ?? "",
        caym2: enrolment?.sanctionedintake?.caym2 ?? "",
      },
      {
        id: `row-totaladmitted-${Date.now()}`,
        item:
          "N1= Total no. of students admitted in the 1st year minus the no. of students, who migrated to other programs/ institutions plus no. of students, who migrated to this program",
        cay: enrolment?.Totaladmitted?.cay ?? "",
        caym1: enrolment?.Totaladmitted?.caym1 ?? "",
        caym2: enrolment?.Totaladmitted?.caym2 ?? "",
      },
      {
        id: `row-supernum-${Date.now()}`,
        item: "N4= Total no. of students admitted in the 1st year via all supernumerary quotas",
        cay: enrolment?.Supernumeraryquota?.cay ?? "",
        caym1: enrolment?.Supernumeraryquota?.caym1 ?? "",
        caym2: enrolment?.Supernumeraryquota?.caym2 ?? "",
      },
      {
        id: `row-er-${Date.now()}`,
        item: "Enrolment Ratio (ER)= (N1+N4)/N ",
        cay: enrolment?.EnrolmentRatio?.cay ?? "",
        caym1: enrolment?.EnrolmentRatio?.caym1 ?? "",
        caym2: enrolment?.EnrolmentRatio?.caym2 ?? "",
      },
      {
        id: `row-avg-${Date.now()}`,
        item: "Average ER = (ER_1 + ER_2 + ER_3)/3",
        cay: enrolment?.averageER?.cay ?? "",
        caym1: enrolment?.averageER?.caym1 ?? "",
        caym2: enrolment?.averageER?.caym2 ?? "",
        averageER: enrolment?.averageER?.cay ?? "",
      },
    ];

    return rows;
  };

  const tableToEnrolment = (tableData = []) => {
    const rowKeys = ["sanctionedintake", "Totaladmitted", "Supernumeraryquota", "EnrolmentRatio", "averageER"];
    
    return tableData.map((row, i) => {
      const key = rowKeys[i];
      if (!key) return null;

      return {
        row_type: key,
        cay: row.cay || "",
        caym1: row.caym1 || "",
        caym2: row.caym2 || ""
      };
    }).filter(Boolean);
  };

  const mapFiles = (filesByField) => {
  const arr = filesByField["enrolment_ratio_documents"] || [];

  return arr
    .filter(f => f.s3Url || f.file) // allow newly uploaded files
    .map(f => ({
      filename: f.filename,
      url: f.s3Url || "",      // backend will fill after upload
      description: f.description || ""
    }));
};

 const loadContributorsData = async () => {
    if (!showCardView || !cycle_sub_category_id) return;
    
    setCardLoading(true);
    try {
      const contributorsResponse = await newnbaCriteria4Service.getAllCriteria4_1_Data?.(cycle_sub_category_id);
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

      const res = await newnbaCriteria4Service.getCriteria4_1_Data(cycle_sub_category_id, currentOtherStaffId);
      const rawResponse = res?.data || res || [];
      const d = Array.isArray(rawResponse) && rawResponse.length > 0 ? rawResponse[0] : rawResponse;
      
      console.log("🟢 4.1 API Response:", d);
      console.log("🟢 4.1 cri411_enrolment_ratio_document:", d.cri411_enrolment_ratio_document);

      setEnrolmentRatioId(d.enrolment_ratio_id || null);

      // Map cri411_enrolment_ratio_table (server) -> tableData (UI)
      const tableArray = d.cri411_enrolment_ratio_table || [];
      console.log("🟢 4.1 cri411_enrolment_ratio_table:", tableArray);
      
      // Convert array to nested object format
      const enrolment = {};
      tableArray.forEach(row => {
        enrolment[row.row_type] = { cay: row.cay, caym1: row.caym1, caym2: row.caym2 };
      });
      console.log("🟢 4.1 converted enrolment object:", enrolment);
      
      const tableData = enrolmentToTable(enrolment);
      
      // Files: server might send cri411_enrolment_ratio_document
      const serverFiles = d.cri411_enrolment_ratio_document || d.enrolment_ratio_documents || d.quality_process_documents || [];
      console.log("🟢 4.1 serverFiles:", serverFiles);
      const files = (serverFiles || []).map((f, i) => ({
        id: f.id || `file-${i}`,
        filename: f.filename || f.file_name || f.name,
        s3Url: f.url || f.file_url || f.downloadPath || "",
        url: f.url || f.file_url || f.downloadPath || "",
        description: f.description || "",
        uploading: false,
      }));
      console.log("🟢 4.1 mapped files:", files);

      setInitialData({
        content: { "4.1": d.quality_processes_description || d.description || "" },
        tableData,
        filesByField: {
          "4.1": files.length > 0 ? files : [{ id: `file-4.1-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }]
        }
      });
    } catch (err) {
      console.warn("Load failed:", err);

      setEnrolmentRatioId(null);
      setInitialData({
        content: { "4.1": "" },
        tableData: enrolmentToTable(),
        filesByField: {
          "4.1": [{ id: `file-4.1-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }]
        }
      });
    } finally {
      setLoading(false);
    }
  }, [cycle_sub_category_id, otherStaffId]);

  useEffect(() => {
    loadData();
  }, [loadData]); 

  // ---------------- SAVE DATA ----------------
const handleSave = async (formData) => {
  setSaving(true);

  try {
  const mapFiles = (filesByField) => {
  const arr = filesByField["4.1"] || [];   // field name

  return arr
    .filter(f => f.s3Url || f.file) // only uploaded files
    .map(f => ({
      description: f.description || "",
      filename: f.filename || "",
      url: f.s3Url || ""
    }));
};

    // Get staff ID
    const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
    const userInfoo = JSON.parse(localStorage.getItem("userInfo") || "{}");

    const staffId =
      otherStaffId ||
      userInfo?.rawData?.other_staff_id ||
      userInfo.user_id ||
      userInfoo?.other_staff_id;

    const tableData = formData.tableData || [];

    // 1️⃣ Convert table → enrolment ratio table
    const enrolment_ratio = tableToEnrolment(tableData);

    // 2️⃣ Extract average enrolment percentage from row 4
    const averageER =
      tableData[4]?.averageER ||
      tableData[4]?.cay ||
      "0.00";

    // Calculate marks logic (based on your rule)
    const marks = parseFloat(averageER) >= 90 ? "20" : "0";
    const documents = mapFiles(formData.filesByField);

    // --- FINAL REQUIRED PAYLOAD FORMAT ---
    const payload = {
      other_staff_id: staffId,
      cycle_sub_category_id: cycle_sub_category_id, 

      // TABLE 1
      cri411_enrolment_ratio_table: enrolment_ratio,

      // TABLE 2
      cri412_marks_distribution_table: [
        {
          average_enrolment_percentage: averageER,
          marks: marks
        }
      ],
      cri411_enrolment_ratio_document: documents,
      // cri412_marks_distribution_document: documents
    };

    console.log("FINAL 4.1 PAYLOAD:", payload);

    if (enrolmentRatioId) {
          await newnbaCriteria4Service.putCriteria4_1_Data(enrolmentRatioId, payload);
        } else {
          await newnbaCriteria4Service.saveCriteria4_1_Data(payload);
        }

    // await newnbaCriteria4Service.saveCriteria4_1_Data(payload);

    setAlert(
      <SweetAlert success title="Saved!" onConfirm={() => setAlert(null)}>
        Criterion 4.1 saved successfully
      </SweetAlert>
    );

    onSaveSuccess?.();
    loadData();

  } catch (err) {
    console.error("Save failed:", err);

    setAlert(
      <SweetAlert danger title="Save Failed" onConfirm={() => setAlert(null)}>
        Something went wrong while saving
      </SweetAlert>
    );
  } finally {
    setSaving(false);
  }
};


  // ---------------- DELETE DATA ----------------
  const handleDelete = async () => {
    if (!enrolmentRatioId) {
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
            const res = await newnbaCriteria4Service.deleteCriteria4_1Data(
              enrolmentRatioId
            );

            let message = "Criterion 4.1 deleted successfully.";
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

            setEnrolmentRatioId(null);
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
        Loading Criterion 4.1...
      </div>
    );
  }

  console.log("🎯 Criterion4_1Form rendering with initialData:", initialData);

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
      <GenericCriteriaForm4_1
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

export default Criterion4_1Form;
 