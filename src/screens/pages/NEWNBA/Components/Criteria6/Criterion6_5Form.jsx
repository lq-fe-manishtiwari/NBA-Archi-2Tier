import React, { useState, useEffect, useCallback } from "react";
import GenericCriteriaForm from "../GenericCriteriaForm";
import { newnbaCriteria6Service } from "../../Services/NewNBA-Criteria6.service";
import SweetAlert from "react-bootstrap-sweetalert";

const Criterion6_5Form = ({
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
  const [criterionId, setCriterionId] = useState(null);
  const [cardData, setCardData] = useState([]);
  const [cardLoading, setCardLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const [initialData, setInitialData] = useState({
    content: {
      staff_availability_info: "",
      incentives_info: "",
    },
    tableData: {
      technicalStaffTable: [],
    },
    filesByField: {
      technicalStaffTable: [],
      staff_availability_info: [],
      incentives_info: [],
    },
  });

  const config = {
    title: "6.5 Non-Teaching Support (20)",
    totalMarks: 20,
    fields: [
      {
        name: "technicalStaffTable",
        label: "List of Technical / Non-Teaching Supporting Staff",
        marks: 0,
        hasTable: true,
        tableConfig: {
          title: "Details of Technical Supporting Staff (Laboratories / Workshops / Studios)",
          columns: [
            { field: "sno", header: "S.No", placeholder: "1", readOnly: true },
            { field: "name", header: "Name", placeholder: "Full Name" },
            {
              field: "designation",
              header: "Designation",
              placeholder: "Lab Technician / Asst. / Instructor etc.",
            },
            {
              field: "date_of_joining",
              header: "Date of Joining",
              placeholder: "DD/MM/YYYY",
            },
            {
              field: "qualification_at_joining",
              header: "Qualification at Joining",
              placeholder: "Diploma / ITI / Degree...",
            },
            {
              field: "qualification_now",
              header: "Present Qualification",
              placeholder: "Current highest qualification",
            },
            {
              field: "other_skills",
              header: "Other Skills / Certifications",
              placeholder: "AutoCAD, PLC, Safety, etc.",
            },
            {
              field: "responsibility",
              header: "Responsibility / Lab Assigned",
              placeholder: "Physics Lab, CAD Lab, Workshop...",
            },
            {
              field: "nature_of_employment",
              header: "Nature of Employment",
              placeholder: "Regular / Contract / Outsourced",
            },
            { field: "remarks", header: "Remarks", placeholder: "Any special note..." },
          ],
          allowAddRemoveRows: true,
        },
      },
      {
        name: "staff_availability_info",
        label:
          "6.5.1 Availability of Adequate and Qualified Technical Supporting Staff (15)",
        marks: 15,
        type: "richText",
        placeholder:
          "Describe adequacy, qualifications, student:staff ratio, workload distribution, experience, etc. (refer to table above)...",
        hasFileUpload: true,
      },
      {
        name: "incentives_info",
        label:
          "6.5.2 Incentives, Skill Upgrade, and Professional Advancement (5)",
        marks: 5,
        type: "richText",
        placeholder:
          "Describe incentives, skill upgradation programs, training attended, professional advancement opportunities...",
        hasFileUpload: true,
      },
    ],
  };

  // Load contributors data (card/list view)
  const loadContributorsData = async () => {
    if (!showCardView || !cycle_sub_category_id) return;
    setCardLoading(true);
    try {
      const res = await newnbaCriteria6Service.getAllCriteria6_5_Data(cycle_sub_category_id);
      setCardData(res?.data || res || []);
    } catch (err) {
      console.error("Error loading contributors:", err);
      setCardData([]);
    } finally {
      setCardLoading(false);
    }
  };

  // Main data loading with ALWAYS at least one empty file upload slot
  const loadData = useCallback(async () => {
    if (!cycle_sub_category_id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}");
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");

      const staffId =
        otherStaffId ||
        userInfo?.other_staff_id ||
        userProfile?.rawData?.other_staff_id ||
        userProfile?.user_id;

      const res = await newnbaCriteria6Service.getCriteria6_5_Data(cycle_sub_category_id, staffId);

      const raw = res?.data || res || [];
      const d = Array.isArray(raw) ? raw[0] : raw;

      setCriterionId(d?.id || null);

      // Table - at least one empty row
      const staffList =
        d?.technical_staff?.length > 0
          ? d.technical_staff.map((item, idx) => ({ ...item, sno: idx + 1 }))
          : [
              {
                sno: 1,
                name: "",
                designation: "",
                date_of_joining: "",
                qualification_at_joining: "",
                qualification_now: "",
                other_skills: "",
                responsibility: "",
                nature_of_employment: "",
                remarks: "",
              },
            ];

      // Helper: always return at least one empty file upload entry
      const getFileUploads = (files = []) => {
        if (files.length > 0) {
          return files.map((f, i) => ({
            id: `file-${Date.now()}-${i}`,
            filename: f.file_name || "",
            file: null,
            s3Url: f.file_url || "",
            description: f.description || "",
            uploading: false,
          }));
        }
        return [
          {
            id: `file-empty-${Date.now()}`,
            filename: "",
            file: null,
            s3Url: "",
            description: "",
            uploading: false,
          },
        ];
      };

      setInitialData({
        content: {
          staff_availability_info: d?.staff_availability_info || "",
          incentives_info: d?.incentives_info || "",
        },
        tableData: {
          technicalStaffTable: staffList,
        },
        filesByField: {
          technicalStaffTable: getFileUploads(d?.technical_staff_documents),
          staff_availability_info: getFileUploads(d?.staff_availability_documents),
          incentives_info: getFileUploads(d?.incentives_documents),
        },
      });
    } catch (err) {
      console.error("Error loading Criterion 6.5:", err);
    } finally {
      setLoading(false);
    }
  }, [cycle_sub_category_id, otherStaffId]);

  useEffect(() => {
    loadData();
    if (showCardView) loadContributorsData();
  }, [loadData, showCardView]);

  const handleSave = async (formData) => {
    setSaving(true);
    try {
      const technical_staff_table = (formData.tableData?.technicalStaffTable || []).map((row, idx) => ({
        ...row,
        sno: idx + 1,
      }));

      const table_documents = (formData.filesByField?.technicalStaffTable || [])
        .filter((f) => f.s3Url)
        .map((f) => ({
          file_name: f.filename,
          file_url: f.s3Url,
          description: f.description || "",
        }));

      const availability_documents = (formData.filesByField?.staff_availability_info || [])
        .filter((f) => f.s3Url)
        .map((f) => ({
          file_name: f.filename,
          file_url: f.s3Url,
          description: f.description || "",
        }));

      const incentives_documents = (formData.filesByField?.incentives_info || [])
        .filter((f) => f.s3Url)
        .map((f) => ({
          file_name: f.filename,
          file_url: f.s3Url,
          description: f.description || "",
        }));

      const staffId =
        otherStaffId ||
        JSON.parse(localStorage.getItem("userInfo") || "{}")?.other_staff_id ||
        JSON.parse(localStorage.getItem("userProfile") || "{}")?.user_id;

      const payload = {
        other_staff_id: Number(staffId),
        cycle_sub_category_id: Number(cycle_sub_category_id),
        program_id: programId ? Number(programId) : null,

        incentives_skill_upgrade: formData.content?.staff_availability_info || "",
        technical_staff_details: formData.content?.incentives_info || "",

        "6_5table": technical_staff_table,
        "6_5table_document": table_documents,

        technical_supporting_staff_availability: availability_documents,
        non_teaching_staff_document: incentives_documents,
      };

      if (criterionId) {
        await newnbaCriteria6Service.putCriteria6_5_Data(criterionId, payload, staffId);
      } else {
        await newnbaCriteria6Service.saveCriteria6_5_Data(payload, staffId);
      }

      setAlert(
        <SweetAlert success title="Success!" onConfirm={() => setAlert(null)}>
          Criterion 6.5 saved successfully!
        </SweetAlert>
      );

      onSaveSuccess?.();
      loadData();
    } catch (err) {
      console.error("Save error:", err);
      setAlert(
        <SweetAlert danger title="Error" onConfirm={() => setAlert(null)}>
          Failed to save Criterion 6.5 data
        </SweetAlert>
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading || (showCardView && cardLoading)) {
    return (
      <div className="text-center py-20 text-xl text-indigo-600">
        Loading Criterion 6.5...
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
      />
      {alert}
    </>
  );
};

export default Criterion6_5Form;