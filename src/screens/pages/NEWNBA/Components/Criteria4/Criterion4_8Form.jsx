// src/screens/pages/NEWNBA/Components/Criteria4/Criterion4_8Form.jsx
import React, { useState, useEffect, useCallback } from "react";
import GenericCriteriaForm4_8 from "./GenericCriteriaForm4_8";
import { newnbaCriteria4Service } from "../../Services/NewNBA-Criteria4.service";
import SweetAlert from "react-bootstrap-sweetalert";

const Criterion4_8Form = ({
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
    tableData: {},
    filesByField: {},
  });
  const [alert, setAlert] = useState(null);
  const [cardData, setCardData] = useState([]);
  const [cardLoading, setCardLoading] = useState(false);

  // Helper function to get row labels for 4.8.1
  const getRowLabel481 = (index) => {
    const labels = [
      "Total No. of Final Year Students (N)",
      "Number of students placed (X)",
      "No. of students admitted to higher studies (Y)",
      "No. of students opted for entrepreneurs (Z)",
      "X + Y + Z",
      "Placement Index (PI): (X + Y + Z)/N",
      "Average placement = (P1 + P2 + P3)/3",
    ];
    return labels[index] || "";
  };

  // ---------------- CONFIG FOR 4.8 ----------------
  const config = {
    title: "4.8. Placement and Higher Studies and Entrepreneurship",
    totalMarks: 40,
    fields: [
      {
        name: "4.8.1",
        label: "4.8.1 Placement and Higher Studies and Entrepreneurship",
        marks: 40,
        hasTable: true,
        tableConfig: {
          title: "Table No. 4.8.1. Placement and Higher Studies and Entrepreneurship details for 3 years.",
          columns: [
            { field: "item", header: "Item", placeholder: "" },
            { field: "lyg", header: "LYG", placeholder: "" },
            { field: "lygm1", header: "LYGm1", placeholder: "" },
            { field: "lygm2", header: "LYGm2", placeholder: "" },
          ],
          predefinedRows: [
            { item: "Total No. of Final Year Students (N)" },
            { item: "Number of students placed (X)" },
            { item: "No. of students admitted to higher studies (Y)" },
            { item: "No. of students opted for entrepreneurs (Z)" },
            { item: "X + Y + Z" },
            { item: "Placement Index (PI): (X + Y + Z)/N" },
            { item: "Average placement = (P1 + P2 + P3)/3" },
          ],
          variant: "summary", // helps table component know it's the summary one
        },
      },
      {
        name: "4.8.2",
        label: "4.8.2 List of Students (Placed / Higher Studies / Entrepreneurs)",
        hasTable: true,
        tableConfig: {
          title: "Table No. 4.8.2. Details of students placed / admitted to higher studies / opted for entrepreneurship",
          columns: [
            { field: "sl_no", header: "Sl. No.", placeholder: "" },
            { field: "name", header: "Name of the Student", placeholder: "Full name" },
            { field: "Enrollment No", header: "USN / Roll No.", placeholder: "1XX18XX000" },
            { field: "Name of the Employer", header: "Company / Institute / Enterprise", placeholder: "" },
      
          ],
          predefinedRows: [], // user adds rows manually
          variant: "student-list",
        },
      },
    ],
  };

  // ---------------- LOAD DATA ----------------
  const loadData = useCallback(async () => {
    if (!cycle_sub_category_id) return setLoading(false);
    try {
      setLoading(true);
      const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
      const userInfoo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const userIsContributor = userInfo?.rawData?.is_contributor || false;
      setIsContributor(userIsContributor);

      const currentOtherStaffId =
        otherStaffId ||
        userInfo?.rawData?.other_staff_id ||
        userInfo.user_id ||
        userInfoo?.other_staff_id;

      const res = await newnbaCriteria4Service.getCriteria4_8_Data(cycle_sub_category_id, currentOtherStaffId);
      const d = res?.data?.[0] || res || {};

      setPlacementId(d.cri48_placement_id || null);

      // Transform 4.8.1 data
      const tableData481 = (d.placement_data || []).map((row, index) => ({
        id: `row481-${Date.now()}-${index}`,
        item: getRowLabel481(index),
        lyg: row.lyg || "",
        lygm1: row.lygm1 || "",
        lygm2: row.lygm2 || "",
      }));

      // Transform 4.8.2 data (adjust field names according to your actual API)
      const tableData482 = (d.placement_student_list || []).map((row, index) => ({
        id: `row482-${Date.now()}-${index}`,
        sl_no: row.sl_no || index + 1,
        name: row.student_name || "",
        usn: row.usn || "",
        company: row.company_institute || "",
        package: row.ctc_program || "",
        year: row.year || "",
        type: row.type || "",
      }));

      setInitialData({
        content: {
          "4.8.1": "",
          "4.8.2": "",
        },
        tableData: {
          "4.8.1": tableData481,
          "4.8.2": tableData482,
        },
        filesByField: {
          "4.8.1": (d.placement_document || []).length > 0
            ? d.placement_document.map((f, i) => ({
                id: `file-481-${i}`,
                name: f.name || f.file_name || "",
                filename: f.name || f.file_name || "",
                url: f.url || f.file_url || "",
                s3Url: f.url || f.file_url || "",
                description: f.description || "",
                uploading: false,
              }))
            : [{ id: `file-481-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }],
          "4.8.2": (d.student_list_documents || []).length > 0
            ? d.student_list_documents.map((f, i) => ({
                id: `file-482-${i}`,
                name: f.name || f.file_name || "",
                filename: f.name || f.file_name || "",
                url: f.url || f.file_url || "",
                s3Url: f.url || f.file_url || "",
                description: f.description || "",
                uploading: false,
              }))
            : [{ id: `file-482-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }],
        },
      });
    } catch (err) {
      console.warn("Load failed:", err);
      setPlacementId(null);
      setInitialData({
        content: { "4.8.1": "", "4.8.2": "" },
        tableData: { "4.8.1": [], "4.8.2": [] },
        filesByField: {
          "4.8.1": [{ id: `file-481-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }],
          "4.8.2": [{ id: `file-482-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }],
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
      const contributorsResponse = await newnbaCriteria4Service.getAllCriteria4_8_Data?.(cycle_sub_category_id);
      setCardData(contributorsResponse || []);
    } catch (err) {
      console.error("Failed to load contributors data:", err);
      setCardData([]);
    } finally {
      setCardLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    if (showCardView) {
      loadContributorsData();
    }
  }, [cycle_sub_category_id, programId, showCardView, otherStaffId, loadData]);

  // ---------------- PAYLOAD PREPARATION ----------------
  const tablePayload = (formData) => {
    const payload481 = (formData.tableData["4.8.1"] || []).map((row, i) => {
      const rowTypes = ["N_row", "X_row", "Y_row", "Z_row", "total", "placement_index", "average"];
      return {
        row_type: rowTypes[i] || "unknown",
        lyg: row.lyg || "",
        lygm1: row.lygm1 || "",
        lygm2: row.lygm2 || "",
      };
    });

    const payload482 = (formData.tableData["4.8.2"] || []).map((row) => ({
      sl_no: row.sl_no || "",
      student_name: row.name || "",
      usn: row.usn || "",
      company_institute: row.company || "",
      ctc_program: row.package || "",
      year: row.year || "",
      type: row.type || "",
    }));

    return {
      placement_data: payload481,
      placement_student_list: payload482,
    };
  };

  const documentPayload = (formData) => {
    const getDocs = (field) =>
      (formData.filesByField[field] || [])
        .filter((file) => (file.s3Url || file.url) && file.filename)
        .map((file) => ({
          name: file.filename,
          description: file.description || "",
          url: file.s3Url || file.url,
        }));

    return {
      placement_document: getDocs("4.8.1"),
      student_list_documents: getDocs("4.8.2"),
    };
  };

  // ---------------- SAVE DATA ----------------
  const handleSave = async (formData) => {
    setSaving(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
      const userInfoo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const staffId =
        otherStaffId ||
        userInfo?.rawData?.other_staff_id ||
        userInfo.user_id ||
        userInfoo?.other_staff_id;

      const tables = tablePayload(formData);
      const documents = documentPayload(formData);

      const payload = {
        other_staff_id: staffId,
        cycle_sub_category_id: cycle_sub_category_id,
        ...tables,
        ...documents,
      };

      if (placementId) {
        await newnbaCriteria4Service.putCriteria4_8_Data(placementId, payload, staffId);
      } else {
        await newnbaCriteria4Service.saveCriteria4_8_Data(payload, staffId);
      }

      setAlert(
        <SweetAlert
          success
          title="Saved!"
          confirmBtnCssClass="btn-confirm"
          confirmBtnText="OK"
          onConfirm={() => setAlert(null)}
        >
          Criterion 4.8 saved successfully
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

  // ---------------- DELETE DATA ----------------
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
    // ... (delete logic remains same)
  };

  if (loading || (showCardView && cardLoading)) {
    return (
      <div className="flex justify-center py-20 text-xl font-medium text-indigo-600">
        Loading Criterion 4.8...
      </div>
    );
  }

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
            title: "Criterion 4.8",
            statusField: "approval_status",
            userField: "other_staff_id",
            nameFields: ["firstname", "lastname"],
            idField: "cri48_placement_id",
            isCoordinatorField: "is_coordinator_entry",
          }}
        />
        {alert}
      </>
    );
  }

  return (
    <div>
      <GenericCriteriaForm4_8
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

export default Criterion4_8Form;