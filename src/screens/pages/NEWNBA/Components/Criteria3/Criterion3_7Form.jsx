// src/screens/pages/NEWNBA/Components/Criteria3/Criterion3_7Form.jsx

import React, { useState, useEffect, useCallback } from "react";
import GenericCriteriaForm from "../GenericCriteriaForm";
import { newnbaCriteria3Service } from "../../Services/NewNBA-Criteria3.service";
import SweetAlert from "react-bootstrap-sweetalert";
import { getAllProfileFlags } from "@/_services/adminProfileUtils";

const Criterion3_7Form = ({
  cycle_sub_category_id,
  isEditable = true,
  onSaveSuccess,
  otherStaffId = null,
  showCardView = false,
  onCardClick = null,
  onStatusChange = null,
  cardData = [],
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [attainmentCoId, setAttainmentCoId] = useState(null);
  const [cardLoading, setCardLoading] = useState(false);
  const [initialData, setInitialData] = useState({
    content: {},
    tableData: {},
    filesByField: {},
  });
  const [alert, setAlert] = useState(null);
  const [isContributor, setIsContributor] = useState(false);

  const config = {
    title: "3.7. Attainment of Course Outcomes",
    totalMarks: 25,
    fields: [
      {
        name: "3.7.1",
        label: "3.7.1  Describe the Assessment Tools and Processes Used to Gather the Data for the Evaluation of Course Outcome ",
        marks: 5,
        type: "textarea",
        hasFile: true,
      },
      {
        name: "3.7.2",
        label: "3.7.2 Record the Attainment of Course Outcomes of all Courses with Respect to Set Attainment Levels",
        marks: 20,
        hasTable: true,
        hasFile: true,
        tableConfig: {
          type: "course-outcome-attainment",
          title: "Table 3.7.2.1: Course Outcome Attainment Record",
          description: "Record the attainment of course outcomes for all courses with respect to set attainment levels.",
          addRowLabel: "Add Course Record",
          columns: [
            { field: "course_code", header: "Course Code", placeholder: "CS301", width: "w-32" },
            { field: "co1", header: "CO1 (%)", placeholder: "78", width: "w-20" },
            { field: "co2", header: "CO2 (%)", placeholder: "82", width: "w-20" },
            { field: "co3", header: "CO3 (%)", placeholder: "75", width: "w-20" },
            { field: "co4", header: "CO4 (%)", placeholder: "88", width: "w-20" },
            { field: "attainment_level", header: "Attainment Level", placeholder: "3", width: "w-24", type: "select", options: [
              { value: "1", label: "Level 1" },
              { value: "2", label: "Level 2" },
              { value: "3", label: "Level 3" },
            ]},
          ],
        },
      },
    ],
  };

  const loadData = useCallback(async () => {
    if (!cycle_sub_category_id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const profileFlags = getAllProfileFlags();
      const userIsContributor = profileFlags?.isContributor || false;
      setIsContributor(userIsContributor);
      
      const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
      const userInfoo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const currentOtherStaffId = otherStaffId || userInfo?.rawData?.other_staff_id || userInfo.user_id || userInfoo?.other_staff_id;
      
      console.log("🟠 Criterion3_7Form - Loading data:");
      console.log("  - cycle_sub_category_id:", cycle_sub_category_id);
      console.log("  - currentOtherStaffId:", currentOtherStaffId);
      
      const res = await newnbaCriteria3Service.getCriteria3_7_Data(cycle_sub_category_id, currentOtherStaffId);
      
      const rawResponse = res?.data || res || [];
      const d = Array.isArray(rawResponse) && rawResponse.length > 0 ? rawResponse[0] : rawResponse;
      
      console.log("🟢 Criterion3_7Form - Raw API Response:", rawResponse);
      console.log("🟢 Criterion3_7Form - Processed Data:", d);

      setAttainmentCoId(d.attainment_co_id || null);

      setInitialData({
        content: {
          "3.7.1": d.assessment_tools || ""
        },
        tableData: {
          "3.7.2": (d.record_attainment || []).map((r) => ({
            id: r.id,
            course_code: r.course_code,
            co1: r.co1,
            co2: r.co2,
            co3: r.co3,
            co4: r.co4,
            attainment_level: r.attainment_level,
          })) || [{ course_code: "", co1: "", co2: "", co3: "", co4: "", attainment_level: "" }],
        },
        filesByField: {
          "3.7.1": (d.assessment_tools_documents || []).length > 0
            ? (d.assessment_tools_documents || []).map((f, i) => ({
                id: `file-3.7.1-${i}`,
                filename: f.file_name || f.name || "",
                s3Url: f.file_url || f.url || "",
                url: f.file_url || f.url || "",
                description: f.description || "",
                uploading: false
              }))
            : [{ id: `file-3.7.1-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }],
          "3.7.2": (d.record_attainment_documents || []).length > 0
            ? (d.record_attainment_documents || []).map((f, i) => ({
                id: `file-3.7.2-${i}`,
                filename: f.file_name || f.name || "",
                s3Url: f.file_url || f.url || "",
                url: f.file_url || f.url || "",
                description: f.description || "",
                uploading: false
              }))
            : [{ id: `file-3.7.2-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }]
        }
      });

    } catch (err) {
      console.warn("❌ Criterion3_7Form - API failed or returned 404, showing blank form", err);
      setAttainmentCoId(null);
      setInitialData({
        content: { "3.7.1": "" },
        tableData: {
          "3.7.2": [{ course_code: "", co1: "", co2: "", co3: "", co4: "", attainment_level: "" }]
        },
        filesByField: {
          "3.7.1": [{ id: `file-3.7.1-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }],
          "3.7.2": [{ id: `file-3.7.2-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }]
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
      const contributorsResponse = await newnbaCriteria3Service.getAllCriteria3_7_Data?.(cycle_sub_category_id);
      if (onStatusChange) {
        onStatusChange(contributorsResponse || []);
      }
    } catch (err) {
      console.error("Failed to load contributors data:", err);
    } finally {
      setCardLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    if (showCardView) {
      loadContributorsData();
    }
  }, [loadData, showCardView]);

  const handleSave = async (formData) => {
    setSaving(true);
    console.log(formData);
    try {
      const filesWithCategory = Object.keys(formData.filesByField || {}).flatMap(fieldName => {
        return (formData.filesByField[fieldName] || []).map(file => {
          let category = "Other";
          if (fieldName === "3.7.1") category = "Assessment Tools";
          if (fieldName === "3.7.2") category = "Attainment Records";
          return { ...file, category };
        });
      });
      
      const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
      const userInfoo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const staffId = otherStaffId || userInfo?.rawData?.other_staff_id || userInfo.user_id || userInfoo?.other_staff_id;

      const payload = {
        other_staff_id: staffId,
        cycle_sub_category_id,
        assessment_tools: formData.content["3.7.1"] || "",
        assessment_tools_documents: filesWithCategory
          .filter(f => f.category === "Assessment Tools" && (f.url || f.s3Url))
          .map(f => ({
            file_name: f.filename,
            file_url: f.s3Url || f.url,
            description: f.description || "",

          })),
        record_attainment: formData.tableData["3.7.2"] || [],
        record_attainment_documents: filesWithCategory
          .filter(f => f.category === "Attainment Records" && (f.url || f.s3Url))
          .map(f => ({
            file_name: f.filename,
            file_url: f.s3Url || f.url,
            description: f.description || "",
          })),
      };
      
      console.log("🟠 Criterion3_7Form - Save payload:", payload);

      if (attainmentCoId) {
        console.log("🟠 Updating existing record with ID:", attainmentCoId);
        await newnbaCriteria3Service.putCriteria3_7_Data(attainmentCoId, payload);
      } else {
        console.log("🟠 Creating new record");
        await newnbaCriteria3Service.saveCriteria3_7_Data(payload);
      }

      setAlert(
        <SweetAlert
          success
          title="Saved!"
          confirmBtnText="OK"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => setAlert(null)}
        >
          Criterion 3.7 saved successfully
        </SweetAlert>
      );

      await loadData();
      onSaveSuccess?.();

    } catch (err) {
      console.error(err);
      setAlert(
        <SweetAlert
          danger
          title="Save Failed"
          confirmBtnText="OK"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => setAlert(null)}
        >
          An error occurred while saving
        </SweetAlert>
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!attainmentCoId) {
      setAlert(
        <SweetAlert
          info
          title="Nothing to Delete"
          confirmBtnText="OK"
          confirmBtnCssClass="btn-confirm"
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
            await newnbaCriteria3Service.deleteCriteria3_7_Data(attainmentCoId);

            setAlert(
              <SweetAlert
                success
                title="Deleted!"
                confirmBtnCssClass="btn-confirm"
                confirmBtnText="OK"
                onConfirm={() => setAlert(null)}
              >
                Course Outcome Attainment record deleted successfully.
              </SweetAlert>
            );

            await loadData();
            setAttainmentCoId(null);
            onSaveSuccess?.();

          } catch (err) {
            console.error(err);
            setAlert(
              <SweetAlert
                danger
                title="Delete Failed"
                confirmBtnCssClass="btn-confirm"
                confirmBtnText="OK"
                onConfirm={() => setAlert(null)}
              >
                An error occurred while deleting
              </SweetAlert>
            );
          }
        }}
        onCancel={() => setAlert(null)}
      >
        You won't be able to revert this deletion!
      </SweetAlert>
    );
  };

  if (loading || (showCardView && cardLoading)) {
    return (
      <div className="flex justify-center py-20 text-xl font-medium text-indigo-600">
        Loading Criterion 3.7...
      </div>
    );
  }

  if (showCardView) {
    return (
      <>
        <div className="space-y-4">
          {cardData && cardData.length > 0 ? (
            cardData.map((card, index) => (
              <div key={index} className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                   onClick={() => onCardClick?.(cycle_sub_category_id, card.other_staff_id, card)}>
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">{card.firstname} {card.lastname}</h4>
                    <p className="text-sm text-gray-600">Staff ID: {card.other_staff_id}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded text-xs ${
                      card.approval_status === 'APPROVED_BY_COORDINATOR' ? 'bg-green-100 text-green-800' :
                      card.approval_status === 'REJECTED_BY_COORDINATOR' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {card.approval_status || 'Pending'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No contributor submissions found
            </div>
          )}
        </div>
        {alert}
      </>
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
        showFileCategories={true}
        onSave={(data) => {
          handleSave({
            content: data.content,
            tableData: data.tableData,
            filesByField: data.filesByField,
          });
        }}
        onDelete={handleDelete}
      />
      {alert}
    </>
  );
};

export default Criterion3_7Form;
