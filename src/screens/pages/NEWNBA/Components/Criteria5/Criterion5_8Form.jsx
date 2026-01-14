// src/screens/pages/NEWNBA/Components/Criteria1/Criterion5_8Form.jsx

import React, { useState, useEffect } from "react";
import GenericCriteriaForm1_2 from "../GenericCriteriaForm1_2";
import { newnbaCriteria1Service } from "../../Services/NewNBA-Criteria1.service";
import { toast } from "react-toastify";
import SweetAlert from 'react-bootstrap-sweetalert';

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
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initialData, setInitialData] = useState({
    content: {},
    tableData: {},
    files: [],
    fpads_id: null,
  });
  const [cardLoading, setCardLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  
  // System description and assessment years data
  const [systemDescription, setSystemDescription] = useState("");
  const [assessmentYears, setAssessmentYears] = useState([
    { year: "2023-2024", implemented: false, effectiveness: "", documents: [] },
    { year: "2022-2023", implemented: false, effectiveness: "", documents: [] },
    { year: "2021-2022", implemented: false, effectiveness: "", documents: [] },
  ]);

  const config = {
    title: "5.8 Faculty Performance Appraisal and Development System (FPADS) (15)",
    totalMarks: 15,
    fields: [
      {
        name: "system_description",
        label: "Description of FPADS System",
        marks: 5,
        type: "richText",
        placeholder: "Describe the well-defined Faculty Performance Appraisal and Development System...",
      },
      {
        name: "implementation_status",
        label: "Implementation Status",
        marks: 5,
        type: "textarea",
        placeholder: "Describe the implementation status across assessment years...",
      },
      {
        name: "effectiveness",
        label: "Effectiveness of the System",
        marks: 5,
        type: "richText",
        placeholder: "Describe the effectiveness and outcomes of FPADS...",
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

    if (!cycle_sub_category_id) {
      console.log("❌ Criterion5_8Form: cycle_sub_category_id is missing, exiting");
      setLoading(false);
      return;
    }

    let d = {};
    setLoading(true);

    try {
      // Replace with actual service call for 5.8
      const res = await newnbaCriteria1Service.getCriteria5_8_Data?.(cycle_sub_category_id, currentOtherStaffId) || { data: {} };
      const rawResponse = res?.data || res || {};
      d = rawResponse;
      console.log("🟢 Loaded Criterion 5.8 data:", d);
    } catch (err) {
      console.error("❌ Failed to load Criterion 5.8 data:", err);
      toast.error("Failed to load Criterion 5.8 data");
      d = {};
    }

    // Parse system description
    const desc = d.system_description || "The Faculty Performance Appraisal and Development System (FPADS) is a comprehensive framework designed to evaluate and enhance faculty performance across multiple dimensions including teaching, research, innovation, community service, and administrative responsibilities. The system aims to optimize individual faculty contributions to institutional performance through regular assessment, feedback, and professional development opportunities.";
    setSystemDescription(desc);

    // Parse assessment years data
    if (d.assessment_years && Array.isArray(d.assessment_years)) {
      setAssessmentYears(d.assessment_years);
    }

    setInitialData({
      content: {
        system_description: desc,
        implementation_status: d.implementation_status || "The FPADS has been implemented consistently across all assessment years with regular review cycles. The system includes self-assessment, peer review, student feedback, and head-of-department evaluation components.",
        effectiveness: d.effectiveness || "The FPADS has proven effective in identifying faculty strengths and development areas. It has led to targeted professional development programs, improved teaching methodologies, increased research output, and enhanced community engagement activities.",
      },
      tableData: {},
      fpads_id: d.fpads_id || null,
      filesByField: {
        "system_documents": (d.system_documents || []).length > 0 
          ? (d.system_documents || []).map((f, i) => ({
              id: `file-system-${i}`,
              name: f.document_name || f.name || "",
              filename: f.document_name || f.name || "",
              url: f.document_url || f.url || "",
              s3Url: f.document_url || f.url || "",
              description: f.description || "FPADS System Document",
              uploading: false
            }))
          : [{ id: `file-system-0`, description: "FPADS Policy Document", file: null, filename: "", s3Url: "", uploading: false }],
        "implementation_documents": (d.implementation_documents || []).length > 0 
          ? (d.implementation_documents || []).map((f, i) => ({
              id: `file-impl-${i}`,
              name: f.document_name || f.name || "",
              filename: f.document_name || f.name || "",
              url: f.document_url || f.url || "",
              s3Url: f.document_url || f.url || "",
              description: f.description || "Implementation Report",
              uploading: false
            }))
          : [{ id: `file-impl-0`, description: "Annual Implementation Report", file: null, filename: "", s3Url: "", uploading: false }],
        "effectiveness_documents": (d.effectiveness_documents || []).length > 0 
          ? (d.effectiveness_documents || []).map((f, i) => ({
              id: `file-eff-${i}`,
              name: f.document_name || f.name || "",
              filename: f.document_name || f.name || "",
              url: f.document_url || f.url || "",
              s3Url: f.document_url || f.url || "",
              description: f.description || "Effectiveness Analysis",
              uploading: false
            }))
          : [{ id: `file-eff-0`, description: "Effectiveness Assessment Report", file: null, filename: "", s3Url: "", uploading: false }],
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
      const contributorsResponse = await newnbaCriteria1Service.getAllCriteria5_8_Data?.(cycle_sub_category_id);
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
    if (!initialData?.fpads_id) {
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
            await newnbaCriteria1Service.deleteCriteria5_8_Data?.(initialData.fpads_id);
            
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
                Criterion 5.8 data has been deleted successfully.
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
        This will permanently delete all Criterion 5.8 data!
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
          if (fieldName === "system_documents") category = "System Documents";
          if (fieldName === "implementation_documents") category = "Implementation Documents";
          if (fieldName === "effectiveness_documents") category = "Effectiveness Documents";
          return { ...file, category };
        });
      });

      const payload = {
        cycle_sub_category_id,
        other_staff_id: currentOtherStaffId,
        program_id: programId,
        system_description: formData.content.system_description || systemDescription,
        implementation_status: formData.content.implementation_status || "",
        effectiveness: formData.content.effectiveness || "",
        assessment_years: assessmentYears,
        system_documents: filesWithCategory
          .filter(f => f.category === "System Documents" && (f.url || f.s3Url))
          .map(f => ({ 
            document_name: f.filename, 
            document_url: f.s3Url || f.url,
            description: f.description || ""
          })),
        implementation_documents: filesWithCategory
          .filter(f => f.category === "Implementation Documents" && (f.url || f.s3Url))
          .map(f => ({ 
            document_name: f.filename, 
            document_url: f.s3Url || f.url,
            description: f.description || ""
          })),
        effectiveness_documents: filesWithCategory
          .filter(f => f.category === "Effectiveness Documents" && (f.url || f.s3Url))
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
      if (initialData?.fpads_id) {
        await newnbaCriteria1Service.putCriteria5_8_Data?.(
          initialData.fpads_id,
          currentOtherStaffId,
          payload
        );
      } else {
        await newnbaCriteria1Service.saveCriteria5_8_Data?.(currentOtherStaffId, payload);
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
          Criterion 5.8 saved successfully!
        </SweetAlert>
      );
    } catch (err) {
      console.error("Save error:", err);
      toast.error(err.message || "Save failed");
    }

    setSaving(false);
  };

  // Handle assessment year changes
  const handleYearToggle = (index) => {
    const newYears = [...assessmentYears];
    newYears[index].implemented = !newYears[index].implemented;
    setAssessmentYears(newYears);
  };

  const handleYearEffectivenessChange = (index, value) => {
    const newYears = [...assessmentYears];
    newYears[index].effectiveness = value;
    setAssessmentYears(newYears);
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
                    <p className="text-sm text-gray-600">Submitted: {new Date(card.created_at).toLocaleDateString()}</p>
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
          "assessment_years": (
            <div className="space-y-6">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                <p className="text-sm text-gray-700">
                  <strong>Note:</strong> The assessment is based on:
                  <ul className="list-disc ml-5 mt-2">
                    <li>A well-defined system instituted for all the assessment years</li>
                    <li>Its implementation and effectiveness</li>
                  </ul>
                </p>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="bg-[#2163c1] text-white px-4 py-2">
                  <h5 className="font-semibold">FPADS Implementation Across Assessment Years</h5>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border text-sm">
                    <thead className="bg-blue-100">
                      <tr>
                        <th className="border px-3 py-2 w-40">Assessment Year</th>
                        <th className="border px-3 py-2">System Instituted</th>
                        <th className="border px-3 py-2">Implementation Status</th>
                        <th className="border px-3 py-2">Effectiveness Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assessmentYears.map((year, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="border px-3 py-2 text-center font-medium">
                            {year.year}
                          </td>
                          <td className="border px-3 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleYearToggle(idx)}
                              className={`px-3 py-1 rounded-full text-sm font-medium ${
                                year.implemented 
                                  ? 'bg-green-100 text-green-800 border border-green-300' 
                                  : 'bg-red-100 text-red-800 border border-red-300'
                              }`}
                            >
                              {year.implemented ? '✓ Implemented' : 'Not Implemented'}
                            </button>
                          </td>
                          <td className="border px-3 py-2">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <div className={`w-3 h-3 rounded-full ${year.implemented ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                <span className="text-sm">
                                  {year.implemented ? 'System fully implemented' : 'System not implemented'}
                                </span>
                              </div>
                              {year.implemented && (
                                <div className="text-xs text-gray-600 ml-5">
                                  • Regular faculty assessments conducted<br/>
                                  • Development plans created<br/>
                                  • Review meetings held
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="border px-3 py-2">
                            <textarea
                              value={year.effectiveness}
                              onChange={(e) => handleYearEffectivenessChange(idx, e.target.value)}
                              placeholder="Enter effectiveness remarks..."
                              className="w-full p-2 border rounded text-sm"
                              rows="3"
                              disabled={!isEditable}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h6 className="font-semibold text-gray-700 mb-2">Faculty Roles Considered in FPADS:</h6>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                    <span className="text-sm">Instruction and Teaching Excellence</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                    <span className="text-sm">Research and Innovation</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                    <span className="text-sm">Technology Adoption and Curriculum Development</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                    <span className="text-sm">Community/Professional Service</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                    <span className="text-sm">Administrative Responsibilities</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                    <span className="text-sm">Self-Renewal and Professional Growth</span>
                  </div>
                </div>
              </div>
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