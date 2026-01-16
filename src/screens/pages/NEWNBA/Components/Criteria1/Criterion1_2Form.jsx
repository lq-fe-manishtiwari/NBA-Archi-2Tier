// src/screens/pages/NEWNBA/Components/Criteria1/Criterion1_2Form.jsx

import React, { useState, useEffect } from "react";
import GenericCriteriaForm1_2 from "../GenericCriteriaForm1_2";
import { newnbaCriteria1Service } from "../../Services/NewNBA-Criteria1.service";
import { toast } from "react-toastify";
import SweetAlert from 'react-bootstrap-sweetalert';

const Criterion1_2Form = ({
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
    new_peo_id: null,
  });
  const [cardLoading, setCardLoading] = useState(false);

  const config = {
    title: "1.2. State the Program Educational Objectives (PEOs)",
    totalMarks: 30,
    fields: [
      // {
      //   name: "1.2.1",
      //   label: "1.2.1. Program Curriculum Structure (05)",
      //   marks: 5,
      //   hasTable: true,
      //   tableConfig: {
      //     type: "curriculum-structure",
      //     title: "Table No.1.2.1.1: Details of various courses",
      //     description: "Provide details of courses in terms of teaching scheme and credits.",
      //     addRowLabel: "Add Course",
      //     columns: [
      //       { field: "course_code", header: "Course Code", placeholder: "CSE301", width: "w-24" },
      //       { field: "course_title", header: "Course Title", placeholder: "Data Structures", width: "w-40" },
      //       { field: "L", header: "L", placeholder: "0", type: "number", width: "w-12" },
      //       { field: "T", header: "T", placeholder: "0", type: "number", width: "w-12" },
      //       { field: "P", header: "P", placeholder: "0", type: "number", width: "w-12" },
      //       { field: "SL", header: "SL", placeholder: "0", type: "number", width: "w-12" },
      //       { field: "total_hours", header: "Total Hours", placeholder: "0", width: "w-16" },
      //       { field: "credits", header: "Credits", placeholder: "0", width: "w-14" },
      //     ],
      //   },
      // },
      // {
      //   name: "1.2.2",
      //   label: "1.2.2 Components of Program Curriculum (05)",
      //   marks: 5,
      //   hasTable: true,
      //   addInlineRow:true,
      //   tableConfig: {
      //     type: "curriculum-components",
      //     title: "Table No.1.2.2.1: Curriculum Components",
      //     description: "Provide details of the program curriculum components.",
      //     columns: [
      //       { field: "component", header: "Curriculum Component", width: "w-48", editable: false },
      //       { field: "contact_hours", header: "Total Number of Contact Hours", width: "w-32", type: "number" },
      //       { field: "percentage", header: "Curriculum Content (% of Total Credits)", width: "w-32", type: "number" },
      //       { field: "credits", header: "Total Number of Credits", width: "w-24", type: "number" },
      //     ],
      //     presetRows: [
      //       { component: "1.1 Basic Sciences" },
      //       { component: "1.2 Basic Engineering" },
      //       { component: "1.3 Humanities and Social Sciences" },
      //       { component: "1.4 Program Core / Major / Minor" },
      //       { component: "1.5 Program Electives" },
      //       { component: "1.6 Open Electives / Multi-Disciplinary" },
      //       { component: "1.7 Project(s)" },
      //       { component: "1.8 Internships / Seminars" },
      //       { component: "1.9 Any other (please specify)" },
      //       { component: "2. Total number of credits" },
      //     ],
      //     autoCalculate: true,
      //   },
      // },

      {
        name: "1.2.1",
        label: "1.2.1 State the Program Educational Objectives (3 to 5) of the program seeking accreditation",
        marks: 10,
        type: "textarea",
      },

      // {
      //   name: "1.2.4",
      //   label: "1.2.4 State the Delivery Details of the Content beyond the Syllabus for the Attainment of Program Outcomes and Program Specific Outcomes",
      //   marks: 10,
      //   type: "heading",
      // },

      // {
      //   name: "1.2.4.1",
      //   label: "Table No.1.2.4.1: Details of events organized to cover content beyond the syllabus- CAYm1",
      //   marks: 10,
      //   hasTable: true,
      //   hasFile: true,
      //   addRow: true,
      //   tableConfig: {
      //     type: "caym1",
      //     title: "Table No.1.2.4.1: Details of Content Augmentation - CAYm1",
      //     description: "Provide details of events, guest lectures, and industry interactions.",
      //     addRowLabel: "Add Event",
      //     columns: [
      //       { field: "sn", header: "S.N.", placeholder: "1", type: "number", width: "w-12" },
      //        { field: "po_pso_gap_identified", header: "PO/PSO as gap Identified", placeholder: "PO/PSO as gap Identified", width: "w-48" },
      //       { field: "event_name", header: "Name of the Event", placeholder: "Guest Lecture / Industry Visit", width: "w-48" },
      //       { field: "event_date", header: "Date of Event", placeholder: "DD/MM/YYYY", type: "date", width: "w-32" },
      //       { field: "resource_person", header: "Resource Person / Organization", placeholder: "Dr. XYZ / ABC Company", width: "w-56" },
      //       { field: "relevance", header: "Relevance to POs, PSOs", placeholder: "PO1, PO2, PSO1", width: "w-48" },
      //     ],
      //   },
      // },

      // {
      //   name: "1.2.4.2",
      //   label: "Table No.1.2.4.2: Details of events organized to cover content beyond the syllabus- CAYm2",
      //   marks: 10,
      //   hasTable: true,
      //   hasFile: true,
      //   addRow: true,
      //   tableConfig: {
      //     type: "caym2",
      //     title: "Table No.1.2.4.2: Details of Content Augmentation - CAYm2",
      //     description: "Provide details of events, guest lectures, and industry interactions.",
      //     addRowLabel: "Add Event",
      //     columns: [
      //       { field: "sn", header: "S.N.", placeholder: "1", type: "number", width: "w-12" },
      //       { field: "po_pso_gap_identified", header: "PO/PSO as gap Identified", placeholder: "PO/PSO as gap Identified", width: "w-48" },
      //       { field: "event_name", header: "Name of the Event", placeholder: "Guest Lecture / Industry Visit", width: "w-48" },
      //       { field: "event_date", header: "Date of Event", placeholder: "DD/MM/YYYY", type: "date", width: "w-32" },
      //       { field: "resource_person", header: "Resource Person / Organization", placeholder: "Dr. XYZ / ABC Company", width: "w-56" },
      //       { field: "relevance", header: "Relevance to POs, PSOs", placeholder: "PO1, PO2, PSO1", width: "w-48" },
      //     ],
      //   },
      // },

      // {
      //   name: "1.2.4.3",
      //   label: "Table No.1.2.4.3: Details of events organized to cover content beyond the syllabus- CAYm3",
      //   marks: 10,
      //   hasTable: true,
      //   hasFile: true,
      //   addRow: true,
      //   tableConfig: {
      //     type: "caym3",
      //     title: "Table No.1.2.4.3: Details of Content Augmentation - CAYm3",
      //     description: "Provide details of events, guest lectures, and industry interactions.",
      //     addRowLabel: "Add Event",
      //     columns: [
      //       { field: "sn", header: "S.N.", placeholder: "1", type: "number", width: "w-12" },
      //       { field: "po_pso_gap_identified", header: "PO/PSO as gap Identified", placeholder: "PO/PSO as gap Identified", width: "w-48" },
      //       { field: "event_name", header: "Name of the Event", placeholder: "Guest Lecture / Industry Visit", width: "w-48" },
      //       { field: "event_date", header: "Date of Event", placeholder: "DD/MM/YYYY", type: "date", width: "w-32" },
      //       { field: "resource_person", header: "Resource Person / Organization", placeholder: "Dr. XYZ / ABC Company", width: "w-56" },
      //       { field: "relevance", header: "Relevance to POs, PSOs", placeholder: "PO1, PO2, PSO1", width: "w-48" },
      //     ],
      //   },
      // },
    ],
  };

  // Load data from API function
  const loadData = async () => {
    const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
    const userInfoo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const currentOtherStaffId = otherStaffId || userInfo?.rawData?.other_staff_id || userInfo.user_id || userInfoo?.other_staff_id;
    
    console.log("🟠 Criterion1_2Form - useEffect triggered:");
    console.log("  - cycle_sub_category_id:", cycle_sub_category_id);
    console.log("  - currentOtherStaffId:", currentOtherStaffId);
    console.log("  - isEditable:", isEditable);

    if (!cycle_sub_category_id) {
      console.log("❌ Criterion1_2Form: cycle_sub_category_id is missing, exiting");
      setLoading(false);
      return;
    }

    let d = {};
    setLoading(true);

    try {
      const res = await newnbaCriteria1Service.getCriteria1_2_Data(
        cycle_sub_category_id,
        currentOtherStaffId
      );
      const rawResponse = res?.data || res || [];
      d = Array.isArray(rawResponse) && rawResponse.length > 0 ? rawResponse[0] : {};
      console.log("🟢 Loaded Criterion 1.2 data:", d);
    } catch (err) {
      console.error("❌ Failed to load Criterion 1.2 data:", err);
      toast.error("Failed to load Criterion 1.2 data");
      d = {};
    }

    setInitialData({
      content: {
        "1.2.1": d.program_edu_objectives || "",
      },
      tableData: {
        "1.2.1": (d.curriculum_structure || []).map((r, i) => {
          const L = parseInt(r.L) || 0;
          const T = parseInt(r.T) || 0;
          const P = parseInt(r.P) || 0;
          const SL = parseInt(r.SL) || 0;
          const totalHours = L + T + P + SL;
          return {
            id: r.id || `curriculum-${i}-${Date.now()}`,
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
        "1.2.2": (d.curriculum_components && d.curriculum_components.length > 0) 
          ? d.curriculum_components.map((r, i) => ({
              id: r.id || `component-${i}-${Date.now()}`,
              component: r.component,
              contact_hours: r.contact_hours,
              percentage: r.percentage,
              credits: r.credits,
            }))
          : [],
        "1.2.4.1": (d.caym1_events || []).map((r, i) => ({
          id: r.id || `caym1-${i}-${Date.now()}`,
          sn: r.sn,
          event_name: r.event_name,
          po_pso_gap_identified:r.po_pso_gap_identified,
          event_date: r.event_date,
          resource_person: r.resource_person,
          relevance: r.relevance,
        })) || [{ id: `caym1-0-${Date.now()}`, sn: 1,po_pso_gap_identified: "", event_name: "", event_date: "", resource_person: "", relevance: "" }],
        "1.2.4.2": (d.caym2_events || []).map((r, i) => ({
          id: r.id || `caym2-${i}-${Date.now()}`,
          sn: r.sn,
          event_name: r.event_name,
          po_pso_gap_identified:r.po_pso_gap_identified,
          event_date: r.event_date,
          resource_person: r.resource_person,
          relevance: r.relevance,
        })) || [{ id: `caym2-0-${Date.now()}`, sn: 1, po_pso_gap_identified: "",event_name: "", event_date: "", resource_person: "", relevance: "" }],
        "1.2.4.3": (d.caym3_events || []).map((r, i) => ({
          id: r.id || `caym3-${i}-${Date.now()}`,
          sn: r.sn,
          event_name: r.event_name,
          po_pso_gap_identified:r.po_pso_gap_identified,
          event_date: r.event_date,
          resource_person: r.resource_person,
          relevance: r.relevance,
        })) || [{ id: `caym3-0-${Date.now()}`, sn: 1, po_pso_gap_identified: "",event_name: "", event_date: "", resource_person: "", relevance: "" }],
      },
      new_peo_id: d.new_peo_id || null,
      filesByField: {
        "1.2.1": (d.curriculum_documents || []).length > 0 
          ? (d.curriculum_documents || []).map((f, i) => ({
              id: `file-1.2.1-${i}`,
              name: f.name || f.file_name || "",
              filename: f.name || f.file_name || "",
              url: f.url || f.file_url || "",
              s3Url: f.url || f.file_url || "",
              description: f.description || "",
              uploading: false
            }))
          : [{ id: `file-1.2.1-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }],
        "1.2.2": (d.components_documents || []).length > 0
          ? (d.components_documents || []).map((f, i) => ({
              id: `file-1.2.2-${i}`,
              name: f.name || f.file_name || "",
              filename: f.name || f.file_name || "",
              url: f.url || f.file_url || "",
              s3Url: f.url || f.file_url || "",
              description: f.description || "",
              uploading: false
            }))
          : [{ id: `file-1.2.2-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }],
        "1.2.3": (d.process_documents || []).length > 0
          ? (d.process_documents || []).map((f, i) => ({
              id: `file-1.2.3-${i}`,
              name: f.name || f.file_name || "",
              filename: f.name || f.file_name || "",
              url: f.url || f.file_url || "",
              s3Url: f.url || f.file_url || "",
              description: f.description || "",
              uploading: false
            }))
          : [{ id: `file-1.2.3-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }],
        "1.2.4.1": (d.caym1_documents || []).length > 0
          ? (d.caym1_documents || []).map((f, i) => ({
              id: `file-1.2.4.1-${i}`,
              name: f.name || f.file_name || "",
              filename: f.name || f.file_name || "",
              url: f.url || f.file_url || "",
              s3Url: f.url || f.file_url || "",
              description: f.description || "",
              uploading: false
            }))
          : [{ id: `file-1.2.4.1-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }],
        "1.2.4.2": (d.caym2_documents || []).length > 0
          ? (d.caym2_documents || []).map((f, i) => ({
              id: `file-1.2.4.2-${i}`,
              name: f.name || f.file_name || "",
              filename: f.name || f.file_name || "",
              url: f.url || f.file_url || "",
              s3Url: f.url || f.file_url || "",
              description: f.description || "",
              uploading: false
            }))
          : [{ id: `file-1.2.4.2-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }],
        "1.2.4.3": (d.caym3_documents || []).length > 0
          ? (d.caym3_documents || []).map((f, i) => ({
              id: `file-1.2.4.3-${i}`,
              name: f.name || f.file_name || "",
              filename: f.name || f.file_name || "",
              url: f.url || f.file_url || "",
              s3Url: f.url || f.file_url || "",
              description: f.description || "",
              uploading: false
            }))
          : [{ id: `file-1.2.4.3-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }]
      }
    });

    console.log("✅ Criterion1_2Form: Data loaded and set successfully");
    setLoading(false);
  };

  // Load contributors data for card view
  const loadContributorsData = async () => {
    if (!showCardView || !cycle_sub_category_id) return;
    
    setCardLoading(true);
    try {
      const contributorsResponse = await newnbaCriteria1Service.getAllCriteria1_2_Data?.(cycle_sub_category_id);
      // Handle the response through parent component
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
    if (!initialData?.new_peo_id) {
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
            await newnbaCriteria1Service.deleteCriteria1_2_Data(initialData.new_peo_id);
            
            setAlert(
              <SweetAlert
                success
                title="Deleted!"
                confirmBtnCssClass="btn-confirm"
                onConfirm={async () => {
                  setAlert(null);
                  await loadData(); // Reload data after delete
                  onSaveSuccess?.();
                }}
              >
                Criterion 1.2 data has been deleted successfully.
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
        This will permanently delete all Criterion 1.2 data!
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
    
    console.log("🟠 Criterion1_2Form handleSave called");
    setSaving(true);

    try {
      // Transform filesByField → flat files with correct category
      const filesWithCategory = Object.keys(formData.filesByField || {}).flatMap(fieldName => {
        return (formData.filesByField[fieldName] || []).map(file => {
          let category = "Other";
          if (fieldName === "1.2.1") category = "Curriculum Structure";
          if (fieldName === "1.2.2") category = "Curriculum Components";
          if (fieldName === "1.2.3") category = "Process Compliance";
          if (fieldName === "1.2.4.1") category = "CAYm1 Events";
          if (fieldName === "1.2.4.2") category = "CAYm2 Events";
          if (fieldName === "1.2.4.3") category = "CAYm3 Events";

          return { ...file, category };
        });
      });

      const payload = {
        other_staff_id: currentOtherStaffId,
        cycle_sub_category_id,
        program_edu_objectives: formData.content["1.2.1"] || "",
        // program_edu_objectives: formData.tableData["1.2.1"] || [],
        // curriculum_components: formData.tableData["1.2.2"] || [],
        // caym1_events: formData.tableData["1.2.4.1"] || [],
        // caym2_events: formData.tableData["1.2.4.2"] || [],
        // caym3_events: formData.tableData["1.2.4.3"] || [],
        
        // Document arrays
        curriculum_documents: filesWithCategory
          .filter(f => f.category === "Curriculum Structure" && (f.url || f.s3Url) && f.filename)
          .map(f => ({ name: f.filename, url: f.s3Url || f.url, description: f.description || "" })),
        
        components_documents: filesWithCategory
          .filter(f => f.category === "Curriculum Components" && (f.url || f.s3Url) && f.filename)
          .map(f => ({ name: f.filename, url: f.s3Url || f.url, description: f.description || "" })),
        
        process_documents: filesWithCategory
          .filter(f => f.category === "Process Compliance" && (f.url || f.s3Url) && f.filename)
          .map(f => ({ name: f.filename, url: f.s3Url || f.url, description: f.description || "" })),
        
        caym1_documents: filesWithCategory
          .filter(f => f.category === "CAYm1 Events" && (f.url || f.s3Url) && f.filename)
          .map(f => ({ name: f.filename, url: f.s3Url || f.url, description: f.description || "" })),
        
        caym2_documents: filesWithCategory
          .filter(f => f.category === "CAYm2 Events" && (f.url || f.s3Url) && f.filename)
          .map(f => ({ name: f.filename, url: f.s3Url || f.url, description: f.description || "" })),
        
        caym3_documents: filesWithCategory
          .filter(f => f.category === "CAYm3 Events" && (f.url || f.s3Url) && f.filename)
          .map(f => ({ name: f.filename, url: f.s3Url || f.url, description: f.description || "" })),
      };

      console.log("FINAL API CALL → payload:", payload);
      console.log("Files with category:", filesWithCategory);
      
      const newFiles = filesWithCategory.filter(f => f.file);
      console.log("New files to upload:", newFiles.length);

      // Use PUT for update if ID exists, otherwise POST for create
      if (initialData?.new_peo_id) {
        await newnbaCriteria1Service.putCriteria1_2_Data(
          initialData.new_peo_id,
          currentOtherStaffId,
          payload
        );
      } else {
        await newnbaCriteria1Service.saveCriteria1_2_Data(currentOtherStaffId, payload);
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
          Criterion 1.2 saved successfully!
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
        Loading Criterion 1.2...
      </div>
    );
  }


  console.log("🎯 Criterion1_2Form rendering with initialData:", initialData);

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

export default Criterion1_2Form;
