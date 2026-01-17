import React, { useState, useEffect, useCallback } from "react";
import GenericCriteriaForm4_1 from "./GenericCriteriaForm4_1";
import GenericCardWorkflow from "../GenericCardWorkflow";
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
    filesByField: {},
  });

  const [alert, setAlert] = useState(null);
  const [cardData, setCardData] = useState([]);
  const [cardLoading, setCardLoading] = useState(false);

  // CONFIG
  const config = {
    title: "4.1.1 Enrolment Ratio",
    totalMarks: 20,
    fields: [
      {
        name: "4.1.1",
        label: "4.1.1 Provide the enrolment ratio for the first year of the program during the last three years",
        marks: 20,
        hasTable: true,
        tableConfig: {
          title: "Enrolment Ratio Calculation",
          columns: [
            {
              field: "item",
              header: "Item (Students enrolled at the 1st year Level on average basis during the last three years starting from current academic years)",
              readOnly: true,
            },
            { field: "cay", header: "CAY" },
            { field: "caym1", header: "CAYm1" },
            { field: "caym2", header: "CAYm2" },
          ],
          predefinedRows: [
            { item: "Sanctioned intake of the program (N)" },
            { item: "Total number of students admitted in 1st year (N1)" },
            { item: "Enrolment Ratio" },
            { item: "Average Enrolment Ratio for 3 years." },
          ],
        },
      },
    ],
  };

  // TABLE HELPERS
  const enrolmentToTable = (enrolment = {}) => {
    console.log("enrolmentToTable INPUT:", enrolment);

    const tableRows = [
      {
        id: "row-1-sanctioned",
        item: "Sanctioned intake of the program (N)",
        cay: enrolment?.sanctioned_intake?.cay ?? "",
        caym1: enrolment?.sanctioned_intake?.caym1 ?? "",
        caym2: enrolment?.sanctioned_intake?.caym2 ?? "",
      },
      {
        id: "row-2-totaladmitted",
        item: "Total number of students admitted in 1st year (N1)",
        cay: enrolment?.total_admitted?.cay ?? "",
        caym1: enrolment?.total_admitted?.caym1 ?? "",
        caym2: enrolment?.total_admitted?.caym2 ?? "",
      },
      {
        id: "row-3-enrolmentratio",
        item: "Enrolment Ratio",
        cay: enrolment?.enrolment_ratio?.cay ?? "",
        caym1: enrolment?.enrolment_ratio?.caym1 ?? "",
        caym2: enrolment?.enrolment_ratio?.caym2 ?? "",
      },
      {
        id: "row-4-average",
        item: "Average Enrolment Ratio for 3 years.",
        averageValue: "", // Will be calculated client-side
      },
    ];

    console.log("Generated tableRows:", tableRows);
    return tableRows;
  };

  const tableToEnrolment = (tableData = []) => {
    const rowKeys = ["sanctioned_intake", "total_admitted", "enrolment_ratio"];
    return tableData.slice(0, 3).map((row, i) => ({
      row_type: rowKeys[i],
      cay: row.cay || "",
      caym1: row.caym1 || "",
      caym2: row.caym2 || "",
    }));
  };

  const mapFiles = (filesByField) => {
    const arr = filesByField["4.1.1"] || [];
    return arr
      .filter((f) => f.s3Url || f.file)
      .map((f) => ({
        filename: f.filename,
        url: f.s3Url || "",
        description: f.description || "",
      }));
  };

  // LOAD DATA - FINAL FIXED VERSION
  const loadData = useCallback(async () => {
    if (!cycle_sub_category_id) {
      console.log("No cycle_sub_category_id → empty form");
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
      const userInfoo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const userIsContributor = userInfo?.rawData?.is_contributor || false;
      setIsContributor(userIsContributor);

      const currentOtherStaffId =
        otherStaffId ||
        userInfo?.rawData?.other_staff_id ||
        userInfo.user_id ||
        userInfoo?.other_staff_id;

      const res = await newnbaCriteria4Service.getCriteria4_1_Data(
        cycle_sub_category_id,
        currentOtherStaffId
      );

      const d =  res[0] || res || {};
      console.log("API Response Data:", d);

      setEnrolmentRatioId(d.id || null);

      // FIXED: Robust row_type matching
      const tableArray = d.enrollment_ratio_data || [];
      console.log("tableArray",tableArray);
      const enrolment = {};

      tableArray.forEach((row) => {
        const rowType = (row.row_type || "").trim().toLowerCase().replace(/\s+/g, '_'); // normalize
        console.log("Normalized row_type:", rowType, "Raw:", row.row_type, "Values:", row.cay, row.caym1, row.caym2);

        if (rowType.includes("sanctioned_intake") || rowType.includes("sanctionedintake")) {
          enrolment.sanctioned_intake = {
            cay: row.cay || "",
            caym1: row.caym1 || "",
            caym2: row.caym2 || "",
          };
        } else if (rowType.includes("total_admitted") || rowType.includes("totaladmitted")) {
          enrolment.total_admitted = {
            cay: row.cay || "",
            caym1: row.caym1 || "",
            caym2: row.caym2 || "",
          };
        } else if (rowType.includes("enrolment_ratio") || rowType.includes("enrollment_ratio")) {
          enrolment.enrolment_ratio = {
            cay: row.cay || "",
            caym1: row.caym1 || "",
            caym2: row.caym2 || "",
          };
        }
      });

      console.log("Constructed enrolment object:", enrolment);

      const tableDataFromApi = enrolmentToTable(enrolment);

      console.log("Final tableData sent to form:", tableDataFromApi);

      const serverFiles = d.enrollment_ratio_document || [];
      const files = serverFiles.map((f, i) => ({
        id: f.id || `file-${i}`,
        filename: f.filename || f.file_name || f.name || "",
        s3Url: f.url || f.file_url || f.downloadPath || "",
        description: f.description || "",
        uploading: false,
      }));

      setInitialData({
        content: { "4.1.1": d.description || "" },
        tableData: tableDataFromApi,
        filesByField: {
          "4.1.1": files.length > 0 ? files : [{
            id: "file-default-4.1.1",
            description: "",
            file: null,
            filename: "",
            s3Url: "",
            uploading: false,
          }],
        },
      });

      console.log("setInitialData called with table rows:", tableDataFromApi.length);
    } catch (err) {
      console.error("Load failed:", err);
      toast.error("Failed to load data");
      setInitialData({
        content: { "4.1.1": "" },
        tableData: enrolmentToTable(),
        filesByField: {
          "4.1.1": [{
            id: "file-default-4.1.1",
            description: "",
            file: null,
            filename: "",
            s3Url: "",
            uploading: false,
          }],
        },
      });
    } finally {
      setLoading(false);
    }
  }, [cycle_sub_category_id, otherStaffId]);

  useEffect(() => {
    loadData();
    if (showCardView) {
      // Placeholder for loadContributorsData if needed
    }
  }, [loadData, showCardView]);

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

      const tableData = formData.tableData || [];
      const enrolment_ratio = tableToEnrolment(tableData);

      const documents = mapFiles(formData.filesByField);

      const payload = {
        other_staff_id: staffId,
        cycle_sub_category_id: cycle_sub_category_id,
        enrollment_ratio_data: enrolment_ratio,
        enrollment_ratio_document: documents,
        description: formData.content["4.1.1"] || "",
      };

      if (enrolmentRatioId) {
        await newnbaCriteria4Service.putCriteria4_1_Data(enrolmentRatioId, payload, staffId);
      } else {
        const response = await newnbaCriteria4Service.saveCriteria4_1_Data(payload, staffId);
        setEnrolmentRatioId(response?.data?.id || response?.id || null);
      }

      setAlert(
        <SweetAlert success title="Saved!" onConfirm={() => setAlert(null)}>
          Criterion 4.1.1 saved successfully
        </SweetAlert>
      );

      onSaveSuccess?.();
      await loadData();
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

  const handleDelete = async () => {
    if (!enrolmentRatioId) {
      setAlert(
        <SweetAlert info title="Nothing to Delete" onConfirm={() => setAlert(null)}>
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
        title="Are you sure?"
        onConfirm={async () => {
          setAlert(null);
          try {
            await newnbaCriteria4Service.deleteCriteria4_1Data(enrolmentRatioId);
            setAlert(
              <SweetAlert success title="Deleted!" onConfirm={() => setAlert(null)}>
                Criterion 4.1.1 deleted successfully.
              </SweetAlert>
            );
            setEnrolmentRatioId(null);
            await loadData();
            onSaveSuccess?.();
          } catch (err) {
            setAlert(
              <SweetAlert danger title="Delete Failed" onConfirm={() => setAlert(null)}>
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

  if (loading || (showCardView && cardLoading)) {
    return <div className="flex justify-center py-20 text-xl font-medium text-indigo-600">Loading Criterion 4.1.1...</div>;
  }

  if (showCardView) {
    return (
      <>
        <GenericCardWorkflow
          cycleSubCategoryId={cycle_sub_category_id}
          cardData={cardData}
          onCardClick={onCardClick}
          onStatusChange={() => {}}
          apiService={newnbaCriteria4Service}
          cardConfig={{
            title: "Criterion 4.1.1",
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
      <GenericCriteriaForm4_1
        title={config.title}
        marks={config.totalMarks}
        fields={config.fields}
        initialData={initialData}
        saving={saving}
        isContributorEditable={isEditable}
        onSave={handleSave}
        onDelete={handleDelete}
      />
      {alert}
    </div>
  );
};

export default Criterion4_1Form;