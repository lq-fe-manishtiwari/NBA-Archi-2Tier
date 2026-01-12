// src/screens/pages/NEWNBA/Components/Criteria1/Criterion1_5Form.jsx

import React, { useState, useEffect, useMemo } from "react";
import GenericCriteriaForm1_4 from "./GenericCriteriaForm1_4";
import { newnbaCriteria1Service } from "../../Services/NewNBA-Criteria1.service";
import { toast } from "react-toastify";
import SweetAlert from 'react-bootstrap-sweetalert';
import { POService } from "../../../OBE/Settings/Services/po.service";
import { PSOService } from "../../../OBE/Settings/Services/pso.service";

const Criterion1_5Form = ({
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
  programArticulationId = null,
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initialData, setInitialData] = useState({
    content: {},
    tableData: {},
    files: [],
    program_articulation_id: null,
  });
  const [cardLoading, setCardLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  
  const [courseDataMap, setCourseDataMap] = useState({});
  const [poData, setPoData] = useState([]);
  const [psoData, setPsoData] = useState([]);

  const customContent = useMemo(() => ({
    "1.5.1": (
      <div className="space-y-6">
        {Object.keys(courseDataMap).length > 0 ? (
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-[#2163c1] text-white px-4 py-2">
              <h5 className="font-semibold">Program Articulation Matrix</h5>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full border text-sm">
                <thead className="bg-blue-100">
                  <tr>
                    <th className="border px-3 py-2">Course Code</th>
                    <th className="border px-3 py-2">Course Name</th>
                    {poData.map(po => (
                      <th key={po.po_id} className="border px-3 py-2">{po.po_code}</th>
                    ))}
                    {psoData.map(pso => (
                      <th key={pso.pso_id} className="border px-3 py-2">{pso.pso_code}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(courseDataMap).map(([courseId, courseData], idx) => (
                    <tr key={courseId} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="border px-3 py-2 text-center font-medium">{courseData.courseCode}</td>
                      <td className="border px-3 py-2">{courseData.courseName}</td>
                      {poData.map(po => {
                        const poMappings = (courseData.coPoMappingData || []).filter(m => m.po && String(m.po.poId) === String(po.po_id));
                        const avgLevel = poMappings.length > 0 
                          ? Math.round(poMappings.reduce((sum, m) => sum + parseInt(m.correlationLevel || 0), 0) / poMappings.length)
                          : '';
                        return (
                          <td key={po.po_id} className="border px-3 py-2 text-center font-semibold">
                            {avgLevel || '-'}
                          </td>
                        );
                      })}
                      {psoData.map(pso => {
                        const psoMappings = (courseData.coPoMappingData || []).filter(m => m.pso && String(m.pso.psoId) === String(pso.pso_id));
                        const avgLevel = psoMappings.length > 0 
                          ? Math.round(psoMappings.reduce((sum, m) => sum + parseInt(m.correlationLevel || 0), 0) / psoMappings.length)
                          : '';
                        return (
                          <td key={pso.pso_id} className="border px-3 py-2 text-center font-semibold">
                            {avgLevel || '-'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No program articulation matrix data available
          </div>
        )}
      </div>
    )
  }), [courseDataMap, poData, psoData]);

  const config = {
    title: "1.5. Program Articulation Matrix (PAM)",
    totalMarks: 10,
    fields: [
      {
        name: "1.5.1",
        label: "1.5.1. Program Articulation Matrix",
        marks: 10,
        type: "custom",
        hasFile: true,
      },
    ],
  };

  // Load data from API function
  const loadData = async () => {
    const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
    const userInfoo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const currentOtherStaffId = otherStaffId || userInfo?.rawData?.other_staff_id || userInfo.user_id || userInfoo?.other_staff_id;
    
    console.log("🟠 Criterion1_5Form - useEffect triggered:");
    console.log("  - cycle_sub_category_id:", cycle_sub_category_id);
    console.log("  - currentOtherStaffId:", currentOtherStaffId);

    if (!cycle_sub_category_id) {
      console.log("❌ Criterion1_5Form: cycle_sub_category_id is missing, exiting");
      setLoading(false);
      return;
    }

    let d = {};
    setLoading(true);

    try {
      const res = await newnbaCriteria1Service.getCriteria1_5_Data(
        cycle_sub_category_id,
        currentOtherStaffId
      );
      const rawResponse = res?.data || res || [];
      d = Array.isArray(rawResponse) && rawResponse.length > 0 ? rawResponse[0] : {};
      console.log("🟢 Loaded Criterion 1.5 data:", d);
    } catch (err) {
      console.error("❌ Failed to load Criterion 1.5 data:", err);
      toast.error("Failed to load Criterion 1.5 data");
      d = {};
    }

    setInitialData({
      content: {},
      tableData: {
        "1.5.1": (d.pam_table || []).map((r) => ({
          id: r.id,
          course_code: r.course_code,
          course_name: r.course_name,
          po1: r.po1,
          po2: r.po2,
          po3: r.po3,
          pso1: r.pso1,
          pso2: r.pso2,
        })) || [{ course_code: "", course_name: "", po1: "", po2: "", po3: "", pso1: "", pso2: "" }],
      },
      program_articulation_id: d.program_articulation_id || null,
      filesByField: {
        "1.5.1": (d.pam_documents || []).length > 0 
          ? (d.pam_documents || []).map((f, i) => ({
              id: `file-1.5.1-${i}`,
              name: f.file_name || f.name || "",
              filename: f.file_name || f.name || "",
              url: f.file_url || f.url || "",
              s3Url: f.file_url || f.url || "",
              description: f.description || "",
              uploading: false
            }))
          : [{ id: `file-1.5.1-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }],
      }
    });

    console.log("✅ Criterion1_5Form: Data loaded and set successfully");
    setLoading(false);
  };

  // Load contributors data for card view
  const loadContributorsData = async () => {
    if (!showCardView || !cycle_sub_category_id) return;
    
    setCardLoading(true);
    try {
      const contributorsResponse = await newnbaCriteria1Service.getAllCriteria1_5_Data?.(cycle_sub_category_id);
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
    if (!initialData?.program_articulation_id) {
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
            await newnbaCriteria1Service.deleteCriteria1_5_Data(initialData.program_articulation_id);
            
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
                Criterion 1.5 data has been deleted successfully.
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
        This will permanently delete all Criterion 1.5 data!
      </SweetAlert>
    );
  };

  useEffect(() => {
    loadData();
    if (showCardView) {
      loadContributorsData();
    }
  }, [cycle_sub_category_id, showCardView, otherStaffId]);

  useEffect(() => {
    if (programId) {
      fetchCourseDataMap(programId);
    }
  }, [programId]);

  const fetchCourseDataMap = async (progId) => {
    if (!progId) {
      console.log("❌ fetchCourseDataMap: No programId provided");
      return;
    }
    
    console.log("🟠 fetchCourseDataMap: Starting fetch for programId:", progId);
    
    try {
      const poResponse = await POService.getPObyProgramId(progId);
      const psoResponse = await PSOService.getPSOByProgramId(progId);
      console.log("✅ PO Data:", poResponse);
      console.log("✅ PSO Data:", psoResponse);
      setPoData(poResponse || []);
      setPsoData(psoResponse || []);
      
      const response = await newnbaCriteria1Service.getCoPoMappingsByProgram(progId);
      const mappings = response?.content || [];
      console.log("✅ CO-PO Mappings:", mappings);
      
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
          
          const coExists = courseMap[courseId].coData.some(co => co.coId === mapping.co.coId);
          if (!coExists) {
            courseMap[courseId].coData.push(mapping.co);
          }
          
          courseMap[courseId].coPoMappingData.push(mapping);
        }
      });
      
      console.log("✅ Course Data Map:", courseMap);
      setCourseDataMap(courseMap);
    } catch (err) {
      console.error("❌ Failed to fetch course data map:", err);
      setCourseDataMap({});
    }
  };

  const handleSave = async (formData) => {
    const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
    const userInfoo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const currentOtherStaffId = otherStaffId || userInfo?.rawData?.other_staff_id || userInfo.user_id || userInfoo?.other_staff_id;
    
    console.log("🟠 Criterion1_5Form handleSave called");
    setSaving(true);

    try {
      const filesWithCategory = Object.keys(formData.filesByField || {}).flatMap(fieldName => {
        return (formData.filesByField[fieldName] || []).map(file => {
          return { ...file, category: "PAM Documents" };
        });
      });

      const pamTable = [];
      Object.values(courseDataMap).forEach(course => {
        const row = {
          course_code: course.courseCode,
          course_name: course.courseName
        };
        
        poData.forEach((po, idx) => {
          const poMappings = course.coPoMappingData.filter(m => m.po && String(m.po.poId) === String(po.po_id));
          const avgLevel = poMappings.length > 0 
            ? Math.round(poMappings.reduce((sum, m) => sum + parseInt(m.correlationLevel || 0), 0) / poMappings.length)
            : '';
          row[`po${idx + 1}`] = avgLevel || '';
        });
        
        psoData.forEach((pso, idx) => {
          const psoMappings = course.coPoMappingData.filter(m => m.pso && String(m.pso.psoId) === String(pso.pso_id));
          const avgLevel = psoMappings.length > 0 
            ? Math.round(psoMappings.reduce((sum, m) => sum + parseInt(m.correlationLevel || 0), 0) / psoMappings.length)
            : '';
          row[`pso${idx + 1}`] = avgLevel || '';
        });
        
        pamTable.push(row);
      });

      const payload = {
        other_staff_id: currentOtherStaffId,
        cycle_sub_category_id,
        program_id: programId,
        pam_table: pamTable,
        pam_documents: filesWithCategory
          .filter(f => (f.url || f.s3Url))
          .map(f => ({ 
            file_name: f.filename, 
            file_url: f.s3Url || f.url,
            description: f.description || "",
            uploaded_by: "User",
            uploaded_at: new Date().toISOString().split('T')[0]
          })),
      };

      console.log("FINAL API CALL → payload:", payload);

      if (initialData?.program_articulation_id) {
        await newnbaCriteria1Service.putCriteria1_5_Data(
          initialData.program_articulation_id,
          payload
        );
      } else {
        await newnbaCriteria1Service.saveCriteria1_5_Data(payload);
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
          Criterion 1.5 saved successfully!
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
        Loading Criterion 1.5...
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
      <GenericCriteriaForm1_4
        title={config.title}
        marks={config.totalMarks}
        fields={config.fields}
        initialData={initialData}
        saving={saving}
        isContributorEditable={isEditable}
        onDelete={handleDelete}
        onSave={handleSave}
        customContent={customContent}
        courseDataMap={courseDataMap}
        poData={poData}
        psoData={psoData}
        programId={programId}
      />
      {alert}
    </>
  );
};

export default Criterion1_5Form;