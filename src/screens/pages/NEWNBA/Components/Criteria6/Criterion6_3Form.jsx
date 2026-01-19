import React, { useState, useEffect, useCallback } from "react";
import GenericCriteriaForm from "../GenericCriteriaForm";
import { newnbaCriteria6Service } from "../../Services/NewNBA-Criteria6.service";
import SweetAlert from "react-bootstrap-sweetalert";

const Criterion6_3Form = ({
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
  const [labsId, setLabsId] = useState(null);
  const [cardData, setCardData] = useState([]);
  const [cardLoading, setCardLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const [initialData, setInitialData] = useState({
    content: {},
    tableData: { labsTable: [] },
    filesByField: {
      labsTable: [
        {
          id: "file-labsTable-0",
          filename: "",
          file: null,
          s3Url: "",
          description: "",
          uploading: false,
        },
      ],
    },
  });

  const config = {
    title:
      "6.3 Laboratories/Studio/Computer Labs/Construction Yard along with Equipment and Relevant Facilities (35)",
    totalMarks: 35,
    fields: [
      {
        name: "labsTable",
        label:
          "List of Laboratories/Studio/Computer Labs/Construction Yard Details",
        marks: 0,
        hasTable: true,
        tableConfig: {
          title:
            "List of Laboratories / Studios / Computer Labs / Construction Yards",
          columns: [
            { field: "sno", header: "S.No", placeholder: "1" },
            {
              field: "labName",
              header: "Lab/Workshop",
              placeholder: "e.g. Physics Lab",
            },
            {
              field: "batchSize",
              header: "Batch Size",
              placeholder: "30",
            },
            {
              field: "manuals",
              header: "Availability of Manuals",
              placeholder: "Yes / No / Partial",
            },
            {
              field: "instrumentsQuality",
              header: "Quality of Instruments",
              placeholder: "Good / Average / Poor",
            },
            {
              field: "safety",
              header: "Safety Measures",
              placeholder: "Fire extinguisher, First-aid, etc.",
            },
            {
              field: "remarks",
              header: "Remarks",
              placeholder: "Additional comments...",
            },
          ],
          allowAddRemoveRows: true,
        },
      },
    ],
  };

  // ---------------- LOAD CONTRIBUTORS ----------------
  const loadContributorsData = async () => {
    if (!showCardView || !cycle_sub_category_id) return;
    setCardLoading(true);
    try {
      const res =
        await newnbaCriteria6Service.getAllCriteria6_3_Data(
          cycle_sub_category_id
        );
      setCardData(res?.data || res || []);
    } catch (err) {
      console.error(err);
      setCardData([]);
    } finally {
      setCardLoading(false);
    }
  };

  // ---------------- LOAD DATA ----------------
  const loadData = useCallback(async () => {
    if (!cycle_sub_category_id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const userProfile = JSON.parse(
        localStorage.getItem("userProfile") || "{}"
      );
      const userInfo = JSON.parse(
        localStorage.getItem("userInfo") || "{}"
      );

      const staffId =
        otherStaffId ||
        userInfo?.other_staff_id ||
        userProfile?.rawData?.other_staff_id ||
        userProfile?.user_id;

      const res =
        await newnbaCriteria6Service.getCriteria6_3_Data(
          cycle_sub_category_id,
          staffId
        );

      const raw = res?.data || res || [];
      const d = Array.isArray(raw) ? raw[0] : raw;

      setLabsId(d?.id || null);

      setInitialData({
        content: {},
        tableData: {
          labsTable: d?.laboratories_maintenance_data || [],
        },
        filesByField: {
          labsTable:
            d?.laboratories_maintenance_document?.length > 0
              ? d.laboratories_maintenance_document.map((f, i) => ({
                  id: `file-labsTable-${i}`,
                  filename: f.file_name || "",
                  s3Url: f.file_url || "",
                  description: f.description || "",
                  uploading: false,
                }))
              : [
                  {
                    id: "file-labsTable-0",
                    filename: "",
                    file: null,
                    s3Url: "",
                    description: "",
                    uploading: false,
                  },
                ],
        },
      });
    } catch (err) {
      console.error(err);
      setLabsId(null);
    } finally {
      setLoading(false);
    }
  }, [cycle_sub_category_id, otherStaffId]);

  useEffect(() => {
    loadData();
    if (showCardView) loadContributorsData();
  }, [loadData, showCardView]);

  // ---------------- SAVE ----------------
  const handleSave = async (formData) => {
    setSaving(true);
    try {
      const laboratories_maintenance_data =
        formData.tableData?.labsTable || [];

      const laboratories_maintenance_document = (
        formData.filesByField?.labsTable || []
      )
        .filter((f) => f.s3Url)
        .map((f) => ({
          file_name: f.filename,
          file_url: f.s3Url,
          description: f.description || "",
        }));

      const userProfile = JSON.parse(
        localStorage.getItem("userProfile") || "{}"
      );
      const userInfo = JSON.parse(
        localStorage.getItem("userInfo") || "{}"
      );

      const staffId =
        otherStaffId ||
        userInfo?.other_staff_id ||
        userProfile?.rawData?.other_staff_id ||
        userProfile?.user_id;

      const payload = {
        other_staff_id: Number(staffId),
        cycle_sub_category_id: Number(cycle_sub_category_id),
        laboratories_maintenance_data,
        laboratories_maintenance_document,
      };

      if (labsId) {
        await newnbaCriteria6Service.putCriteria6_3_Data(
          labsId,
          payload,
          staffId
        );
      } else {
        await newnbaCriteria6Service.saveCriteria6_3_Data(
          payload,
          staffId
        );
      }

      setAlert(
        <SweetAlert success title="Saved!" onConfirm={() => setAlert(null)}>
          Criterion 6.3 saved successfully!
        </SweetAlert>
      );

      onSaveSuccess?.();
      loadData();
    } catch (err) {
      setAlert(
        <SweetAlert danger title="Error" onConfirm={() => setAlert(null)}>
          Failed to save Criterion 6.3
        </SweetAlert>
      );
    } finally {
      setSaving(false);
    }
  };

  // ---------------- DELETE ----------------
  const handleDelete = async () => {
    if (!labsId) return;

    setAlert(
      <SweetAlert
        warning
        showCancel
        confirmBtnText="Yes, delete it!"
        onConfirm={async () => {
          setAlert(null);
          await newnbaCriteria6Service.deleteCriteria6_3_Data(labsId);
          setLabsId(null);
          loadData();
          onSaveSuccess?.();
        }}
        onCancel={() => setAlert(null)}
      >
        This action cannot be undone!
      </SweetAlert>
    );
  };

  if (loading || (showCardView && cardLoading)) {
    return (
      <div className="text-center py-20 text-xl text-indigo-600">
        Loading Criterion 6.3...
      </div>
    );
  }

  return (
    <>
      <GenericCriteriaForm
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
    </>
  );
};

export default Criterion6_3Form;
