// src/screens/pages/NEWNBA/Components/Criteria1/Criterion1_4Form.jsx

import React, { useState, useEffect } from "react";
import GenericCriteriaForm1_4 from "./GenericCriteriaForm1_4";
import { newnbaCriteria1Service } from "../../Services/NewNBA-Criteria1.service";
import { toast } from "react-toastify";
import SweetAlert from 'react-bootstrap-sweetalert';
import { POService } from "../../../OBE/Settings/Services/po.service";
import { PSOService } from "../../../OBE/Settings/Services/pso.service";

const Criterion1_4Form = ({
  cycle_sub_category_id,
  isEditable = true,
  onSaveSuccess,
  programId = null,
  otherStaffId = null,
  showCardView = false,
  onCardClick = null,
  onStatusChange = null,
  cardData = [],
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initialData, setInitialData] = useState({
    content: {},
    tableData: {},
    files: [],
    course_outcome_matrix_id: null,
  });
  const [cardLoading, setCardLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  
  // CO-PO Mapping states
  const [courseDataMap, setCourseDataMap] = useState({});
  const [poData, setPoData] = useState([]);
  const [psoData, setPsoData] = useState([]);
  const [courseOutcomes, setCourseOutcomes] = useState([]);

  const config = {
    title: "1.4. Course Outcome and Course Articulation Matrix",
    totalMarks: 25,
    fields: [
      {
        name: "1.4.1",
        label: "1.4.1. Course Outcomes (COs) - Semester Wise",
        marks: 10,
        type: "custom",
        hasFile: true,
      },
      {
        name: "1.4.2",
        label: "1.4.2. Course Articulation Matrix",
        marks: 15,
        type: "custom",
        hasFile: true,
      },
    ],
  };

  const loadData = async () => {
    const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
    const userInfoo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const currentOtherStaffId = otherStaffId || userInfo?.rawData?.other_staff_id || userInfo.user_id || userInfoo?.other_staff_id;

    if (!cycle_sub_category_id) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const res = await newnbaCriteria1Service.getCriteria1_4_Data(cycle_sub_category_id, currentOtherStaffId);
      const d = Array.isArray(res?.data || res) && (res?.data || res).length > 0 ? (res?.data || res)[0] : {};

      setInitialData({
        content: {},
        tableData: {
          "1.4.1": (d.course_outcomes || []).map((r) => ({
            id: r.id,
            co_number: r.co_number,
            description: r.description,
          })) || [{ co_number: "", description: "" }],
          "1.4.2": (d.course_articulation_matrix || []).map((r) => ({
            id: r.id,
            co_number: r.co_number,
            po_number: r.po_number,
            level: r.level,
          })) || [{ co_number: "", po_number: "", level: "" }],
        },
        course_outcome_matrix_id: d.course_outcome_matrix_id || null,
        filesByField: {
          "1.4.1": (d.course_outcome_documents || []).length > 0 
            ? (d.course_outcome_documents || []).map((f, i) => ({
                id: `file-1.4.1-${i}`,
                name: f.document_name || f.name || "",
                filename: f.document_name || f.name || "",
                url: f.document_url || f.url || "",
                s3Url: f.document_url || f.url || "",
                description: f.description || "",
                uploading: false
              }))
            : [{ id: `file-1.4.1-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }],
          "1.4.2": (d.course_articulation_matrix_documents || []).length > 0 
            ? (d.course_articulation_matrix_documents || []).map((f, i) => ({
                id: `file-1.4.2-${i}`,
                name: f.document_name || f.name || "",
                filename: f.document_name || f.name || "",
                url: f.document_url || f.url || "",
                s3Url: f.document_url || f.url || "",
                description: f.description || "",
                uploading: false
              }))
            : [{ id: `file-1.4.2-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }],
        }
      });
    } catch (err) {
      console.error("Failed to load Criterion 1.4 data:", err);
      toast.error("Failed to load Criterion 1.4 data");
    }

    setLoading(false);
  };

  const loadContributorsData = async () => {
    if (!showCardView || !cycle_sub_category_id) return;
    
    setCardLoading(true);
    try {
      const contributorsResponse = await newnbaCriteria1Service.getAllCriteria1_4_Data?.(cycle_sub_category_id);
      if (onStatusChange) {
        onStatusChange(contributorsResponse || []);
      }
    } catch (err) {
      console.error("Failed to load contributors data:", err);
    } finally {
      setCardLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData?.course_outcome_matrix_id) {
      setAlert(
        <SweetAlert warning title="No Data" confirmBtnCssClass="btn-confirm" onConfirm={() => setAlert(null)}>
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
            await newnbaCriteria1Service.deleteCriteria1_4_Data(initialData.course_outcome_matrix_id);
            setAlert(
              <SweetAlert success title="Deleted!" confirmBtnCssClass="btn-confirm" onConfirm={async () => {
                setAlert(null);
                await loadData();
                onSaveSuccess?.();
              }}>
                Criterion 1.4 data has been deleted successfully.
              </SweetAlert>
            );
          } catch (err) {
            setAlert(
              <SweetAlert danger title="Delete Failed" confirmBtnCssClass="btn-confirm" onConfirm={() => setAlert(null)}>
                {err.message || 'Failed to delete data'}
              </SweetAlert>
            );
          }
        }}
        onCancel={() => setAlert(null)}
      >
        This will permanently delete all Criterion 1.4 data!
      </SweetAlert>
    );
  };

  const handleSave = async (formData) => {
    const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
    const userInfoo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const currentOtherStaffId = otherStaffId || userInfo?.rawData?.other_staff_id || userInfo.user_id || userInfoo?.other_staff_id;
    
    setSaving(true);

    try {
      const filesWithCategory = Object.keys(formData.filesByField || {}).flatMap(fieldName => {
        return (formData.filesByField[fieldName] || []).map(file => {
          let category = "Other";
          if (fieldName === "1.4.1") category = "Course Outcomes";
          if (fieldName === "1.4.2") category = "Course Articulation Matrix";
          return { ...file, category };
        });
      });

      // Build course outcomes from courseDataMap
      const courseOutcomes = [];
      Object.values(courseDataMap).forEach(course => {
        (course.coData || []).forEach(co => {
          courseOutcomes.push({
            co_number: co.coCode,
            description: co.description || ''
          });
        });
      });

      // Build course articulation matrix from courseDataMap
      const articulationMatrix = [];
      Object.values(courseDataMap).forEach(course => {
        (course.coPoMappingData || []).forEach(mapping => {
          if (mapping.po) {
            articulationMatrix.push({
              co_number: mapping.co?.coCode || '',
              po_number: mapping.po?.poCode || '',
              level: mapping.correlationLevel || ''
            });
          }
          if (mapping.pso) {
            articulationMatrix.push({
              co_number: mapping.co?.coCode || '',
              po_number: mapping.pso?.psoCode || '',
              level: mapping.correlationLevel || ''
            });
          }
        });
      });

      const payload = {
        other_staff_id: currentOtherStaffId,
        cycle_sub_category_id,
        program_id: programId,
        course_outcomes: courseOutcomes,
        course_outcome_documents: filesWithCategory
          .filter(f => f.category === "Course Outcomes" && (f.url || f.s3Url))
          .map(f => ({ document_name: f.filename, document_url: f.s3Url || f.url, description: f.description || "" })),
        course_articulation_matrix: articulationMatrix,
        course_articulation_matrix_documents: filesWithCategory
          .filter(f => f.category === "Course Articulation Matrix" && (f.url || f.s3Url))
          .map(f => ({ document_name: f.filename, document_url: f.s3Url || f.url, description: f.description || "" })),
      };

      if (initialData?.course_outcome_matrix_id) {
        await newnbaCriteria1Service.putCriteria1_4_Data(initialData.course_outcome_matrix_id, payload);
      } else {
        await newnbaCriteria1Service.saveCriteria1_4_Data(payload);
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
          Criterion 1.4 saved successfully!
        </SweetAlert>
      );
    } catch (err) {
      console.error("Save error:", err);
      toast.error(err.message || "Save failed");
    }

    setSaving(false);
  };

  useEffect(() => {
    loadData();
    if (showCardView) {
      loadContributorsData();
    }
  }, [cycle_sub_category_id, showCardView, otherStaffId]);

  // Fetch CO-PO mapping data when programId is available
  useEffect(() => {
    if (programId) {
      fetchCourseDataMap(programId);
      fetchCourseOutcomes(programId);
    }
  }, [programId]);

  const fetchCourseOutcomes = async (programId) => {
    try {
      const data = await newnbaCriteria1Service.getCourseOutcomesByProgram(programId);
      setCourseOutcomes(data?.data || data || []);
    } catch (err) {
      console.error("Failed to fetch course outcomes:", err);
      toast.error("Failed to fetch Course Outcomes.");
      setCourseOutcomes([]);
    }
  };

  const fetchCourseDataMap = async (progId) => {
    if (!progId) return;
    
    try {
      // Fetch PO and PSO data
      const poResponse = await POService.getPObyProgramId(progId);
      const psoResponse = await PSOService.getPSOByProgramId(progId);
      setPoData(poResponse || []);
      setPsoData(psoResponse || []);
      
      // Fetch CO-PO mappings using GraphQL
      const response = await newnbaCriteria1Service.getCoPoMappingsByProgram(progId);
      const mappings = response?.content || [];
      
      // Group by subject/course
      const courseMap = {};
      mappings.forEach(mapping => {
        if (mapping.subject && mapping.co) {
          const courseId = mapping.subject.subjectId;
          if (!courseMap[courseId]) {
            courseMap[courseId] = {
              courseId,
              courseName: mapping.subject.name,
              courseCode: mapping.subject.subjectCode,
              coData: [],
              coPoMappingData: []
            };
          }
          
          // Add CO if not exists
          const coExists = courseMap[courseId].coData.some(co => co.coId === mapping.co.coId);
          if (!coExists) {
            courseMap[courseId].coData.push(mapping.co);
          }
          
          // Add CO-PO mapping
          courseMap[courseId].coPoMappingData.push(mapping);
        }
      });
      
      setCourseDataMap(courseMap);
    } catch (err) {
      console.error("Failed to fetch course data map:", err);
      setCourseDataMap({});
    }
  };

  if (loading || (showCardView && cardLoading)) {
    return (
      <div className="flex justify-center py-20 text-xl font-medium text-indigo-600">
        Loading Criterion 1.4...
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
            <div className="text-center py-8 text-gray-500">No contributor submissions found</div>
          )}
        </div>
        {alert}
      </>
    );
  }

  return (
    <>
      <GenericCriteriaForm1_4
        title={config.title}
        marks={config.totalMarks}
        fields={config.fields}
        initialData={initialData}
        saving={saving}
        isCompleted={!isEditable}
        isContributorEditable={isEditable}
        onDelete={handleDelete}
        onSave={handleSave}
        // CO-PO Mapping props
        courseDataMap={courseDataMap}
        poData={poData}
        psoData={psoData}
        programId={programId}
        courseOutcomes={courseOutcomes}
      />
      {alert}
    </>
  );
};

export default Criterion1_4Form;