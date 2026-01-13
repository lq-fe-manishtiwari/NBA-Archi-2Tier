import React, { useState, useEffect, useCallback } from "react";
import GenericCriteriaForm4_2 from "./GenericCriteriaForm4_2";
import { newnbaCriteria4Service } from "../../Services/NewNBA-Criteria4.service";
import SweetAlert from "react-bootstrap-sweetalert";

const Criterion4_2Form = ({
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
  const [recordId, setRecordId] = useState(null);

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
      "4.2. Success Rate of the Students in the Stipulated Period of the Program",
    totalMarks: 15,
    fields: [
      {
        name: "4.2",
        label: "4.2. Success Rate of the Students in the Stipulated Period of the Program",
        marks: 15,
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
            { item: "A*= (No. of students admitted in the 1st year of that batch and those actually admitted in the 2nd year via lateral entry, plus the number of students admitted through multiple entry (if any) and separate division if applicable, minus the number of students who exited through multiple entry (if any)." },
            { item: "B= No. of students who graduated from the program in the stipulated course duration" },
            { item: "Success Rate (SR)= (B/A)*100" },
            { item: "Average SR of three batches ((SR_1+SR_2+ SR_3)/3)" },
          ],
          },
      },
    ],
  };

  const loadContributorsData = async () => {
    if (!showCardView || !cycle_sub_category_id) return;
    
    setCardLoading(true);
    try {
      const contributorsResponse = await newnbaCriteria4Service.getAllCriteria4_2_Data?.(cycle_sub_category_id);
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

  // ---------------- LOAD DATA----------------
  const loadData = useCallback(async () => {
    if (!cycle_sub_category_id) return setLoading(false);

    try {
      setLoading(true);
      
      const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
      const userInfoo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const currentOtherStaffId = otherStaffId || userInfo?.rawData?.other_staff_id || userInfo.user_id || userInfoo?.other_staff_id;

      const res = await newnbaCriteria4Service.getCriteria4_2_Data(
        cycle_sub_category_id,
        currentOtherStaffId
      );

      const rawResponse = res?.data || res || [];
      const d = Array.isArray(rawResponse) && rawResponse.length > 0 ? rawResponse[rawResponse.length - 1] : rawResponse;
      
      setRecordId(d.cri42_success_rate_id || null);

      // Map uploaded files
      const files = (d.cri42_success_rate_document || []).map((f, i) => ({
        id: f.id || `file-${i}`,
        filename: f.filename || f.file_name || "",
        s3Url: f.url || f.file_url || "",
        description: f.description || f.filename || f.file_name || "",
        uploading: false,
      }));

      // Map table data - API returns flat array, need to map to UI structure
      const tableArray = d.cri42_success_rate_table || [];
      const tableData = tableArray.length > 0 ? tableArray.map((row, i) => ({
        id: `row-${Date.now()}-${i}`,
        item: config.fields[0].tableConfig.predefinedRows[i]?.item || "",
        lyg: row.academic_year || row.lyg || "",
        lygm1: row.sanctioned_intake || row.lygm1 || "",
        lygm2: row.no_of_students_admitted || row.lygm2 || "",
      })) : [];

      // Provide filesByField matching GenericCriteriaForm4_2 expectations (4.2.1 & 4.2.2)
      setInitialData({
        content: { "4.2": d.quality_processes_description || "" },
        tableData421: tableData,
        tableData422: [],
        filesByField: {
          "4.2.1": [{ id: `file-4.2.1-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }],
          "4.2.2": [{ id: `file-4.2.2-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }]
        }
      });
    } catch (err) {
      console.warn("Load failed:", err);
      setRecordId(null);
      setInitialData({
        content: { "4.2": "" },
        tableData421: [],
        tableData422: [],
        filesByField: {
          "4.2.1": [{ id: `file-4.2.1-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }],
          "4.2.2": [{ id: `file-4.2.2-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }]
        }
      });
    } finally {
      setLoading(false);
    }
  }, [cycle_sub_category_id, otherStaffId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const transformTableData = (tableData) => {
    const rowKeys = ["Arow", "Brow", "successrate", "averageSR"];
    
    return tableData.map((row, i) => {
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

  const transformFiles = (files) =>
    (files || [])
      .filter((f) => f.s3Url || f.file)
      .map((f) => ({
        description: f.description || "",
        filename: f.filename || "",
        url: f.s3Url || "",
      }));

  // ---------------- SAVE DATA----------------
   const handleSave = async (formData) => {
    setSaving(true);
    try {

      // Get staff ID
    const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
    const userInfoo = JSON.parse(localStorage.getItem("userInfo") || "{}");

    const staffId =
      otherStaffId ||
      userInfo?.rawData?.other_staff_id ||
      userInfo.user_id ||
      userInfoo?.other_staff_id;

      // Normalize incoming formData (GenericCriteriaForm4_2 sends { tableData421, tableData422, filesByField })
      const incomingFiles = [
        ...(formData.filesByField?.["4.2.1"] || []),
        ...(formData.filesByField?.["4.2.2"] || []),
      ];

      const incomingTable = formData.tableData421 || formData.tableData || [];

      const payload = {
        cycle_sub_category_id,
        other_staff_id: staffId,
        cri42_success_rate_document: transformFiles(incomingFiles),
        cri42_success_rate_table: transformTableData(incomingTable),
      };

      console.log("Payload to API:", payload);

      if (recordId) {
            await newnbaCriteria4Service.putCriteria4_2_Data(recordId, payload);
          } else {
            await newnbaCriteria4Service.saveCriteria4_2_Data(payload);
          }

      // await newnbaCriteria4Service.saveCriteria4_2_Data(payload);

      setAlert(
        <SweetAlert
          success
          title="Saved!"
          confirmBtnCssClass="btn-confirm"
          confirmBtnText="OK"
          onConfirm={() => setAlert(null)}
        >
          Criterion 4.2 saved successfully
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

  // ---------------- DELETE DATA----------------
  const handleDelete = async () => {
    if (!recordId) {
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
            await newnbaCriteria4Service.deleteCriteria4_2Data(recordId);

            setAlert(
              <SweetAlert
                success
                title="Deleted!"
                confirmBtnCssClass="btn-confirm"
                confirmBtnText="OK"
                onConfirm={() => setAlert(null)}
              >
                Criterion 4.2 deleted successfully.
              </SweetAlert>
            );

            setRecordId(null);
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
        Loading Criterion 4.2...
      </div>
    );
  }

  console.log("🎯 Criterion1_1Form rendering with initialData:", initialData);

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
      <GenericCriteriaForm4_2
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

export default Criterion4_2Form;
