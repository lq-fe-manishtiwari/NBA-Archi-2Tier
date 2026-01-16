// src/screens/pages/NEWNBA/Components/Criteria1/Criterion2_1Form.jsx

import React, { useState, useEffect } from "react";
import GenericCriteriaForm1_2 from "../GenericCriteriaForm1_2";
import { newnbaCriteria2Service } from "../../Services/NewNBA-Criteria2.service";
import { toast } from "react-toastify";
import SweetAlert from 'react-bootstrap-sweetalert';

const Criterion2_1Form = ({
  cycle_sub_category_id,
  isEditable = true,
  onSaveSuccess,
  programId = null,
  otherStaffId = null,
  showCardView = false,
  onCardClick = null,
  onStatusChange = null,
  cardData = [],
  editMode = false,
  teachingLearningQualityId = null,
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
    const [alert, setAlert] = useState(null);
  const [initialData, setInitialData] = useState({
    content: {},
    tableData: {},
    files: [],
    id: null,
  });
  const [cardLoading, setCardLoading] = useState(false);

 const config = {
  title: "2.1 Program Curriculum",
  totalMarks: 40,
  fields: [
    /* ---------------- 2.1.1 ---------------- */

    {
      name: "2.1.1",
      label: "2.1.1  State the Process for Designing the Program Curriculum (20)",
      marks: 20,
      type: "textarea",
      hasFile: true,
    },

    /* ---------------- 2.1.2 ---------------- */

    {
      name: "2.1.2",
      label: "2.1.2 State the Components of the Program Curriculum (05)",
      marks: 5,
      hasTable: true,
      hasFile: true,
      addInlineRow: true,
      tableConfig: {
        type: "curriculum-components-2-1",
        title: "Table No.2.1.2.1: Components of Program Curriculum",
        description:
          "Provide details of curriculum components in terms of content distribution, contact hours and credits.",
        columns: [
          {
            field: "component",
            header: "Course Component",
            width: "w-56",
            editable: false,
          },
          {
            field: "curriculum_content",
            header: "Curriculum Content (% of total number of credits of the program)",
            type: "number",
            width: "w-48",
          },
          {
            field: "contact_hours",
            header: "Total number of contact hours",
            type: "number",
            width: "w-40",
          },
          {
            field: "credits",
            header: "Total number of credits",
            type: "number",
            width: "w-32",
          },
        ],
        presetRows: [
          { component: "Program Core" },
          { component: "Program Electives" },
          { component: "Open Electives" },
          { component: "Seminar / Project work / Internships / Industrial training / Visits" },
          { component: "Any other (Specify)" },
          { component: "Total number of credits" },
        ],
        autoCalculate: true,
      },
    },

    /* ---------------- 2.1.3 ---------------- */

  {
  name: "2.1.3",
  label: "2.1.3 Transaction of the Program Curriculum (05)",
  marks: 5,
  hasTable: true,
  hasFile: true,
  tableConfig: {
    type: "curriculum-structure",
    title: "Table No.2.1.3.1: Details of Courses and Teaching Scheme",
    description:
      "Provide details of courses in terms of teaching scheme, contact hours and credits.",
    addRowLabel: "Add Course",
    columns: [
      {
        field: "course_code",
        header: "Course Code",
        placeholder: "CSE301",
        width: "w-24",
      },
      {
        field: "course_title",
        header: "Course Title",
        placeholder: "Data Structures",
        width: "w-40",
      },
      {
        field: "L",
        header: "L",
        placeholder: "0",
        type: "number",
        width: "w-12",
      },
      {
        field: "T",
        header: "T",
        placeholder: "0",
        type: "number",
        width: "w-12",
      },
      {
        field: "P",
        header: "P",
        placeholder: "0",
        type: "number",
        width: "w-12",
      },
      {
        field: "SL",
        header: "SL",
        placeholder: "0",
        type: "number",
        width: "w-12",
      },
      {
        field: "total_hours",
        header: "Total Hours",
        placeholder: "0",
        width: "w-16",
      },
      {
        field: "credits",
        header: "Credits",
        placeholder: "0",
        width: "w-14",
      },
    ],
  },
},

    /* ---------------- 2.1.4 ---------------- */

    {
      name: "2.1.4",
      label:
        "2.1.4 State the Process Used to Identify Extent of Compliance of the Program Curriculum for attaining the Program Outcomes (PSOs) (05)",
      marks: 5,
      type: "textarea",
      hasFile: true,
    },

    /* ---------------- 2.1.5 ---------------- */

    {
      name: "2.1.5",
      label:
        "2.1.5 Initiatives Towards the Education Policy at Program Level (05)",
      marks: 5,
      type: "textarea",
      hasFile: true,
    },
  ],
};


  // Load data from API function
  const loadData = async () => {
    const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
    const userInfoo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const currentOtherStaffId = otherStaffId || userInfo?.rawData?.other_staff_id || userInfo.user_id || userInfoo?.other_staff_id;
    
    console.log("🟠 Criterion2_1Form - useEffect triggered:");
    console.log("  - cycle_sub_category_id:", cycle_sub_category_id);
    console.log("  - currentOtherStaffId:", currentOtherStaffId);
    console.log("  - isEditable:", isEditable);

    if (!cycle_sub_category_id) {
      console.log("❌ Criterion2_1Form: cycle_sub_category_id is missing, exiting");
      setLoading(false);
      return;
    }

    let d = {};
    setLoading(true);

    try {
      const res = await newnbaCriteria2Service.getCriteria2_1_Data(
        cycle_sub_category_id,
        currentOtherStaffId
      );
      const rawResponse = res?.data || res || [];
      d = Array.isArray(rawResponse) && rawResponse.length > 0 ? rawResponse[0] : {};
      console.log("🟢 Loaded Criterion 2.1 data:", d);
    } catch (err) {
      console.error("❌ Failed to load Criterion 2.1 data:", err);
      toast.error("Failed to load Criterion 2.1 data");
      d = {};
    }

    setInitialData({
      content: {
        "2.1.1": d.process_designing_program_curriculum || "",
        "2.1.4": d.compliance_program_curriculum || "",
        "2.1.5": d.initiative_education_policy_autonomous || "",
      },
      tableData: {
        "2.1.2": (d.components_program_curriculum || []).map((r, i) => ({
          id: r.id || `component-${i}-${Date.now()}`,
          ...r
        })),
        "2.1.3": (d.transaction_program_curriculum || []).map((r, i) => {
          const L = parseInt(r.L) || 0;
          const T = parseInt(r.T) || 0;
          const P = parseInt(r.P) || 0;
          const SL = parseInt(r.SL) || 0;
          const totalHours = L + T + P + SL;
          return {
            id: r.id || `transaction-${i}-${Date.now()}`,
            course_code: r.course_code || "",
            course_title: r.course_title || "",
            L: L.toString(),
            T: T.toString(),
            P: P.toString(),
            SL: SL.toString(),
            total_hours: totalHours.toString(),
            credits: (Math.round((totalHours / 30) * 10) / 10).toString(),
          };
        }),
      },
      id: d.program_curriculum_id || null,
      filesByField: {}
    });

    console.log("✅ Criterion2_1Form: Data loaded and set successfully");
    setLoading(false);
  };

  // Load contributors data for card view
  const loadContributorsData = async () => {
    if (!showCardView || !cycle_sub_category_id) return;
    
    setCardLoading(true);
    try {
      const contributorsResponse = await newnbaCriteria2Service.getAllCriteria2_1_Data?.(cycle_sub_category_id);
      if (onStatusChange) {
        onStatusChange(contributorsResponse || []);
      }
    } catch (err) {
      console.error("Failed to load contributors data:", err);
    } finally {
      setCardLoading(false);
    }
  };

  // Delete function that calls API
  const handleDelete = async () => {
    if (!initialData?.id) {
      setAlert(
        <SweetAlert
          warning
          title="No Data"
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
        confirmBtnBsStyle="danger"
        confirmBtnCssClass="btn-confirm"
        cancelBtnCssClass="btn-cancel"
        title="Are you sure?"
        onConfirm={async () => {
          setAlert(null);
          try {
            await newnbaCriteria2Service.deleteCriteria2_1Data(initialData.id);
            
            setAlert(
              <SweetAlert
                success
                title="Deleted!"
                confirmBtnCssClass="btn-confirm"
                onConfirm={async () => {
                  setAlert(null);
                  await loadData();
                  onSaveSuccess?.();
                }}
              >
                Criterion 2.1 data has been deleted successfully.
              </SweetAlert>
            );
          } catch (err) {
            console.error("Delete Error:", err);
            setAlert(
              <SweetAlert
                danger
                title="Delete Failed"
                confirmBtnCssClass="btn-confirm"
                onConfirm={() => setAlert(null)}
              >
                {err.message || 'Failed to delete data'}
              </SweetAlert>
            );
          }
        }}
        onCancel={() => setAlert(null)}
      >
        This will permanently delete all Criterion 2.1 data!
      </SweetAlert>
    );
  };

  // Load data from API
  useEffect(() => {
    loadData();
    if (showCardView) {
      loadContributorsData();
    }
  }, [cycle_sub_category_id, showCardView, otherStaffId]);

  const handleSave = async (formData) => {
    const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
    const userInfoo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const currentOtherStaffId = otherStaffId || userInfo?.rawData?.other_staff_id || userInfo.user_id || userInfoo?.other_staff_id;
    
    console.log("🟠 Criterion2_1Form handleSave called");
    setSaving(true);

    try {
      const payload = {
        other_staff_id: currentOtherStaffId,
        cycle_sub_category_id,
        process_designing_program_curriculum: formData.content["2.1.1"] || "",
        components_program_curriculum: formData.tableData["2.1.2"] || [],
        transaction_program_curriculum: formData.tableData["2.1.3"] || [],
        compliance_program_curriculum: formData.content["2.1.4"] || "",
        initiative_education_policy_autonomous: formData.content["2.1.5"] || "",
      };

      console.log("FINAL API CALL → payload:", payload);

      if (initialData?.id) {
        await newnbaCriteria2Service.putCriteria2_1_Data(
          initialData.id,
          currentOtherStaffId,
          payload
        );
      } else {
        await newnbaCriteria2Service.saveCriteria2_1_Data(currentOtherStaffId, payload);
      }

      setAlert(
        <SweetAlert
          success
          title="Saved!"
          confirmBtnCssClass="btn-confirm"
          onConfirm={async () => {
            setAlert(null);
            await loadData();
            onSaveSuccess?.();
          }}
        >
          Criterion 2.1 saved successfully!
        </SweetAlert>
      );
    } catch (err) {
      console.error("Save error:", err);
      toast.error(err.message || "Save failed");
    }

    setSaving(false);
  };

  if (loading || (showCardView && cardLoading)) {
    return (
      <div className="flex justify-center py-20 text-xl font-medium text-indigo-600">
        Loading Criterion 2.1...
      </div>
    );
  }


  console.log("🎯 Criterion2_1Form rendering with initialData:", initialData);

  // Show card view for coordinators
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
    <GenericCriteriaForm1_2
      title={config.title}
      marks={config.totalMarks}
      fields={config.fields}
      initialData={initialData}
      saving={saving}
      isContributorEditable={isEditable}
      showFileCategories={true}
      onDelete={handleDelete}
      onSave={(data) => {
        console.log("GenericCriteriaForm1_2 → sending to API:", data);
        handleSave({
          content: data.content,
          tableData: data.tableData,
          filesByField: data.filesByField,
        });
      }}
    />
    {alert}
    </>
  );
};

export default Criterion2_1Form; 