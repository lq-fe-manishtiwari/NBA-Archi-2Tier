// src/screens/pages/NEWNBA/Components/Criteria1/Criterion5_8Form.jsx

import React, { useState, useEffect } from "react";
import GenericCriteriaForm1_2 from "../GenericCriteriaForm1_2";
import { newnbaCriteria1Service } from "../../Services/NewNBA-Criteria1.service";
import { toast } from "react-toastify";
import SweetAlert from 'react-bootstrap-sweetalert';
import { POService } from "../../../OBE/Settings/Services/po.service";
import { PSOService } from "../../../OBE/Settings/Services/pso.service";

const Criterion5_8Form = ({
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
  poMappingId = null,
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initialData, setInitialData] = useState({
    content: {},
    tableData: {},
    files: [],
    po_pso_id: null,
  });
  const [cardLoading, setCardLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  
  // OBE Data states
  const [pos, setPos] = useState([]);
  const [psos, setPsos] = useState([]);
  const [poCourseMappingData, setPoCourseMappingData] = useState([]);

  const config = {
    title: "5.8 Faculty Performance Appraisal and Development System (FPADS) (15)",
    totalMarks: 15,
    fields: [
        {
        name: "5.8",
        label: "5.8 Faculty Performance Appraisal and Development System (FPADS) (15)",
        marks: 15,
        type: "textarea",
      },
    ]
  };

  // Load data from API function
  const loadData = async () => {
    const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
    const userInfoo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const currentOtherStaffId = otherStaffId || userInfo?.rawData?.other_staff_id || userInfo.user_id || userInfoo?.other_staff_id;
    
    console.log("🟠 Criterion5_8Form - useEffect triggered:");
    console.log("  - cycle_sub_category_id:", cycle_sub_category_id);
    console.log("  - currentOtherStaffId:", currentOtherStaffId);
    console.log("  - isEditable:", isEditable);

    if (!cycle_sub_category_id) {
      console.log("❌ Criterion5_8Form: cycle_sub_category_id is missing, exiting");
      setLoading(false);
      return;
    }

    let d = {};
    setLoading(true);

    try {
      const res = await newnbaCriteria1Service.getCriteria1_3_Data(
        cycle_sub_category_id,
        currentOtherStaffId
      );
      const rawResponse = res?.data || res || [];
      d = Array.isArray(rawResponse) && rawResponse.length > 0 ? rawResponse[0] : {};
      console.log("🟢 Loaded Criterion 1.3 data:", d);
    } catch (err) {
      console.error("❌ Failed to load Criterion 1.3 data:", err);
      toast.error("Failed to load Criterion 1.3 data");
      d = {};
    }

    setInitialData({
      content: {
        course_code: d.course_code || "",
        course_name: d.course_name || "",
      },
      tableData: {},
      po_pso_id: d.po_pso_id || null,
      filesByField: {
        "5.81": (d.course_documents || []).length > 0 
          ? (d.course_documents || []).map((f, i) => ({
              id: `file-5.81-${i}`,
              name: f.document_name || f.name || "",
              filename: f.document_name || f.name || "",
              url: f.document_url || f.url || "",
              s3Url: f.document_url || f.url || "",
              description: f.description || "",
              uploading: false
            }))
          : [{ id: `file-5.81-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }],
        "5.8": (d.mapping_documents || []).length > 0 
          ? (d.mapping_documents || []).map((f, i) => ({
              id: `file-5.8-${i}`,
              name: f.document_name || f.name || "",
              filename: f.document_name || f.name || "",
              url: f.document_url || f.url || "",
              s3Url: f.document_url || f.url || "",
              description: f.description || "",
              uploading: false
            }))
          : [{ id: `file-5.8-0`, description: "", file: null, filename: "", s3Url: "", uploading: false }],
      }
    });

    console.log("✅ Criterion5_8Form: Data loaded and set successfully");
    setLoading(false);
  };

  // Load contributors data for card view
  const loadContributorsData = async () => {
    if (!showCardView || !cycle_sub_category_id) return;
    
    setCardLoading(true);
    try {
      const contributorsResponse = await newnbaCriteria1Service.getAllCriteria1_3_Data?.(cycle_sub_category_id);
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
    if (!initialData?.po_pso_id) {
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
            await newnbaCriteria1Service.deleteCriteria1_3_Data(initialData.po_pso_id);
            
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
                Criterion 1.3 data has been deleted successfully.
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
        This will permanently delete all Criterion 1.3 data!
      </SweetAlert>
    );
  };

  // Load initial data
  useEffect(() => {
    loadData();
    if (showCardView) {
      loadContributorsData();
    }
  }, [cycle_sub_category_id, showCardView, otherStaffId]);

  // Fetch PO/PSO and PO-Course mapping when programId is available
  useEffect(() => {
    if (programId) {
      fetchPOsByProgram(programId);
      fetchPSOsByProgram(programId);
      fetchPOCourseMapping(programId);
    }
  }, [programId]);

  const fetchPOsByProgram = async (programId) => {
    try {
      const data = await POService.getPObyProgramId(programId);
      setPos(data || []);
    } catch (err) {
      console.error("Failed to fetch POs:", err);
      setPos([]);
    }
  };

  const fetchPSOsByProgram = async (programId) => {
    try {
      const data = await PSOService.getPSOByProgramId(programId);
      setPsos(data || []);
    } catch (err) {
      console.error("Failed to fetch PSOs:", err);
      setPsos([]);
    }
  };



  const fetchPOCourseMapping = async (progId) => {
    if (!progId) return;
    
    try {
      const response = await newnbaCriteria1Service.getCoPoMappingsByProgram(progId);
      const mappings = response?.content || [];

      const poMappingMap = {};
      
      mappings.forEach(mapping => {
        if (mapping.po) {
          const poId = mapping.po.poId;
          if (!poMappingMap[poId]) {
            poMappingMap[poId] = {
              po_id: poId,
              po_code: mapping.po.poCode,
              po_statement: mapping.po.poStatement,
              mapped_courses: []
            };
          }
          
          const courseExists = poMappingMap[poId].mapped_courses.some(
            c => c.subject_id === mapping.subject.subjectId
          );
          
          if (!courseExists) {
            poMappingMap[poId].mapped_courses.push({
              course_code: mapping.subject.subjectCode,
              course_name: mapping.subject.name,
              subject_id: mapping.subject.subjectId
            });
          }
        }
      });

      setPoCourseMappingData(Object.values(poMappingMap));
    } catch (err) {
      console.error("Error fetching PO-course mapping:", err);
      setPoCourseMappingData([]);
    }
  };

  const handleSave = async (formData) => {
    const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
    const userInfoo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const currentOtherStaffId = otherStaffId || userInfo?.rawData?.other_staff_id || userInfo.user_id || userInfoo?.other_staff_id;
    
    console.log("🟠 Criterion5_8Form handleSave called");
    setSaving(true);

    try {
      // Transform filesByField → flat files with correct category
      const filesWithCategory = Object.keys(formData.filesByField || {}).flatMap(fieldName => {
        return (formData.filesByField[fieldName] || []).map(file => {
          let category = "Other";
          if (fieldName === "5.8") category = "Course Information";
          if (fieldName === "5.8") category = "PO-PSO Mapping";
          return { ...file, category };
        });
      });

      const payload = {
        cycle_sub_category_id,
        other_staff_id: currentOtherStaffId,
        program_id: programId,
        po_data: pos.map(po => ({
          po_id: po.po_id,
          po_code: po.po_code,
          po_statement: po.po_statement
        })),
        pso_data: psos.map(pso => ({
          pso_id: pso.pso_id,
          pso_code: pso.pso_code,
          pso_statement: pso.pso_statement
        })),
        po_course_mapping: poCourseMappingData || [],
        course_documents: filesWithCategory
          .filter(f => f.category === "Course Information" && (f.url || f.s3Url))
          .map(f => ({ 
            document_name: f.filename, 
            document_url: f.s3Url || f.url,
            description: f.description || ""
          })),
        mapping_documents: filesWithCategory
          .filter(f => f.category === "PO-PSO Mapping" && (f.url || f.s3Url))
          .map(f => ({ 
            document_name: f.filename, 
            document_url: f.s3Url || f.url,
            description: f.description || ""
          })),
      };

      console.log("FINAL API CALL → payload:", payload);
      
      const newFiles = filesWithCategory.filter(f => f.file);
      console.log("New files to upload:", newFiles.length);

      // Use PUT for update if ID exists, otherwise POST for create
      if (initialData?.po_pso_id) {
        await newnbaCriteria1Service.putCriteria1_3_Data(
          initialData.po_pso_id,
          currentOtherStaffId,
          payload
        );
      } else {
        await newnbaCriteria1Service.saveCriteria1_3_Data(currentOtherStaffId, payload);
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
          Criterion 1.3 saved successfully!
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
        Loading Criterion 5.8..
      </div>
    );
  }

  console.log("🎯 Criterion5_8Form rendering with initialData:", initialData);

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
                    <p className="text-sm text-gray-600">Course: {card.course_code} - {card.course_name}</p>
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
        isCompleted={!isEditable}
        isContributorEditable={isEditable}
        onDelete={handleDelete}
        customContent={{
          "5.81": (
            <div className="space-y-6">
              <div className="space-y-8">
                  {/* Program Outcomes (POs) */}
                  <div>
                    <h4 className="text-lg font-semibold text-blue-600 mb-4">Program Outcomes (POs)</h4>
                    {pos.length > 0 ? (
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-blue-50">
                            <tr>
                              <th className="border px-3 py-2 text-center w-20">PO Code</th>
                              <th className="border px-3 py-2 text-left">PO Statement</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pos.map((po, idx) => (
                              <tr key={po.po_id} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                <td className="border px-3 py-2 text-center font-medium">{po.po_code}</td>
                                <td className="border px-3 py-2 text-sm">{po.po_statement}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500 border rounded-lg">
                        No POs found for selected program
                      </div>
                    )}
                  </div>

                  {/* Program Specific Outcomes (PSOs) */}
                  <div>
                    <h4 className="text-lg font-semibold text-green-600 mb-4">Program Specific Outcomes (PSOs)</h4>
                    {psos.length > 0 ? (
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-green-50">
                            <tr>
                              <th className="border px-3 py-2 text-center w-20">PSO Code</th>
                              <th className="border px-3 py-2 text-left">PSO Statement</th>
                            </tr>
                          </thead>
                          <tbody>
                            {psos.map((pso, idx) => (
                              <tr key={pso.pso_id} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                <td className="border px-3 py-2 text-center font-medium">{pso.pso_code}</td>
                                <td className="border px-3 py-2 text-sm">{pso.pso_statement}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500 border rounded-lg">
                        No PSOs found for selected program
                      </div>
                    )}
                  </div>
                </div>
            </div>
          ),
          "5.8": (
            <div className="space-y-6">
              {programId && poCourseMappingData.length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-[#2163c1] text-white px-4 py-2">
                    <h5 className="font-semibold">PO-Course Mapping</h5>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full border text-sm">
                      <thead className="bg-blue-100">
                        <tr>
                          <th className="border px-3 py-2 w-24">PO Code</th>
                          <th className="border px-3 py-2">PO Statement</th>
                          <th className="border px-3 py-2">Mapped Courses</th>
                        </tr>
                      </thead>
                      <tbody>
                        {poCourseMappingData.map((item, idx) => (
                          <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                            <td className="border px-3 py-2 text-center font-medium">
                              {item.po_code}
                            </td>
                            <td className="border px-3 py-2">
                              {item.po_statement}
                            </td>
                            <td className="border px-3 py-2">
                              {item.mapped_courses && item.mapped_courses.length > 0 ? (
                                <div className="space-y-1">
                                  {item.mapped_courses.map((course, courseIdx) => (
                                    <div key={courseIdx} className="text-sm p-2 bg-blue-50 rounded">
                                      <div className="font-medium text-blue-800">{course.course_code}</div>
                                      <div className="text-gray-700">{course.course_name}</div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-gray-500 italic">No courses mapped</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {programId && poCourseMappingData.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No PO-course mapping data found for this program.
                </div>
              )}
            </div>
          )
        }}
        onSave={(data) => {
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

export default Criterion5_8Form;