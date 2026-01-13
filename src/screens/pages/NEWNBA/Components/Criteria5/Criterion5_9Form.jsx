// src/screens/pages/NEWNBA/Components/Criteria1/Criterion5_9Form.jsx

import React, { useState, useEffect } from "react";
import GenericCriteriaForm1_2 from "../GenericCriteriaForm1_2";
import { newnbaCriteria1Service } from "../../Services/NewNBA-Criteria1.service";
import { toast } from "react-toastify";
import SweetAlert from 'react-bootstrap-sweetalert';

const Criterion5_9Form = ({
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
    visiting_faculty_id: null,
  });
  const [cardLoading, setCardLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  
  // Visiting faculty data
  const [visitingFacultyList, setVisitingFacultyList] = useState([]);
  const [yearlyInteractions, setYearlyInteractions] = useState([
    { 
      year: "2023-2024", 
      hours: 0, 
      exceedsThreshold: false, 
      facultyCount: 0,
      details: "",
      documents: [] 
    },
    { 
      year: "2022-2023", 
      hours: 0, 
      exceedsThreshold: false, 
      facultyCount: 0,
      details: "",
      documents: [] 
    },
    { 
      year: "2021-2022", 
      hours: 0, 
      exceedsThreshold: false, 
      facultyCount: 0,
      details: "",
      documents: [] 
    },
    { 
      year: "2020-2021", 
      hours: 0, 
      exceedsThreshold: false, 
      facultyCount: 0,
      details: "",
      documents: [] 
    },
    { 
      year: "2019-2020", 
      hours: 0, 
      exceedsThreshold: false, 
      facultyCount: 0,
      details: "",
      documents: [] 
    },
  ]);

  const config = {
    title: "5.9 Visiting/Adjunct Faculty/Emeritus Faculty, etc. (25)",
    totalMarks: 25,
    fields: [
      {
        name: "provision_details",
        label: "Provision Details of Visiting/Adjunct Faculty",
        marks: 5,
        type: "richText",
        placeholder: "Describe the provisions and arrangements for visiting/adjunct/emeritus faculty...",
      },
      {
        name: "contribution_details",
        label: "Contribution Details in Teaching, Learning and Research",
        marks: 5,
        type: "richText",
        placeholder: "Describe the contributions made by visiting faculty in teaching, learning, and research...",
      },
    ]
  };

  // Calculate marks
  const calculateMarks = () => {
    let provisionMarks = 5; // Fixed for provision details
    
    // Calculate interaction marks (4 marks per year with >= 50 hours, max 20 marks)
    const interactionYears = yearlyInteractions.filter(year => year.hours >= 50).length;
    const interactionMarks = Math.min(interactionYears * 4, 20);
    
    return {
      provisionMarks,
      interactionMarks,
      totalMarks: provisionMarks + interactionMarks
    };
  };

  // Load data from API function
  const loadData = async () => {
    const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
    const userInfoo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const currentOtherStaffId = otherStaffId || userInfo?.rawData?.other_staff_id || userInfo.user_id || userInfoo?.other_staff_id;
    
    console.log("🟠 Criterion5_9Form - useEffect triggered:");
    console.log("  - cycle_sub_category_id:", cycle_sub_category_id);
    console.log("  - currentOtherStaffId:", currentOtherStaffId);

    if (!cycle_sub_category_id) {
      console.log("❌ Criterion5_9Form: cycle_sub_category_id is missing, exiting");
      setLoading(false);
      return;
    }

    let d = {};
    setLoading(true);

    try {
      // Replace with actual service call for 5.9
      const res = await newnbaCriteria1Service.getCriteria5_9_Data?.(cycle_sub_category_id, currentOtherStaffId) || { data: {} };
      const rawResponse = res?.data || res || {};
      d = rawResponse;
      console.log("🟢 Loaded Criterion 5.9 data:", d);
    } catch (err) {
      console.error("❌ Failed to load Criterion 5.9 data:", err);
      toast.error("Failed to load Criterion 5.9 data");
      d = {};
    }

    // Parse visiting faculty list
    if (d.visiting_faculty_list && Array.isArray(d.visiting_faculty_list)) {
      setVisitingFacultyList(d.visiting_faculty_list);
    } else {
      // Default sample data
      setVisitingFacultyList([
        {
          id: 1,
          name: "Dr. Rajesh Kumar",
          designation: "Visiting Professor",
          organization: "IIT Bombay",
          expertise: "Machine Learning & AI",
          years_involved: ["2023-2024", "2022-2023"],
          contribution_type: ["Teaching", "Research Guidance"],
          hours_per_year: 60
        },
        {
          id: 2,
          name: "Prof. Meena Sharma",
          designation: "Adjunct Faculty",
          organization: "TCS Research",
          expertise: "Cloud Computing",
          years_involved: ["2023-2024", "2021-2022"],
          contribution_type: ["Guest Lectures", "Project Evaluation"],
          hours_per_year: 45
        }
      ]);
    }

    // Parse yearly interactions
    if (d.yearly_interactions && Array.isArray(d.yearly_interactions)) {
      setYearlyInteractions(d.yearly_interactions.map(item => ({
        ...item,
        exceedsThreshold: item.hours >= 50
      })));
    }

    setInitialData({
      content: {
        provision_details: d.provision_details || "The institution has established comprehensive provisions for engaging visiting/adjunct/emeritus faculty from various sectors including industry, research organizations, and government bodies. The engagement framework includes formal MoUs, clear role definitions, and structured contribution plans aligned with academic objectives.",
        contribution_details: d.contribution_details || "Visiting faculty contribute significantly through guest lectures, specialized workshops, research collaborations, project guidance, and curriculum development. They bring real-world expertise, industry insights, and research experience that enrich the teaching-learning process and enhance research output.",
      },
      tableData: {},
      visiting_faculty_id: d.visiting_faculty_id || null,
      filesByField: {
        "provision_documents": (d.provision_documents || []).length > 0 
          ? (d.provision_documents || []).map((f, i) => ({
              id: `file-provision-${i}`,
              name: f.document_name || f.name || "",
              filename: f.document_name || f.name || "",
              url: f.document_url || f.url || "",
              s3Url: f.document_url || f.url || "",
              description: f.description || "Provision Policy Document",
              uploading: false
            }))
          : [{ id: `file-provision-0`, description: "Visiting Faculty Policy", file: null, filename: "", s3Url: "", uploading: false }],
        "contribution_documents": (d.contribution_documents || []).length > 0 
          ? (d.contribution_documents || []).map((f, i) => ({
              id: `file-contribution-${i}`,
              name: f.document_name || f.name || "",
              filename: f.document_name || f.name || "",
              url: f.document_url || f.url || "",
              s3Url: f.document_url || f.url || "",
              description: f.description || "Contribution Report",
              uploading: false
            }))
          : [{ id: `file-contribution-0`, description: "Annual Contribution Report", file: null, filename: "", s3Url: "", uploading: false }],
        "interaction_documents": (d.interaction_documents || []).length > 0 
          ? (d.interaction_documents || []).map((f, i) => ({
              id: `file-interaction-${i}`,
              name: f.document_name || f.name || "",
              filename: f.document_name || f.name || "",
              url: f.document_url || f.url || "",
              s3Url: f.document_url || f.url || "",
              description: f.description || "Interaction Records",
              uploading: false
            }))
          : [{ id: `file-interaction-0`, description: "Interaction Logs", file: null, filename: "", s3Url: "", uploading: false }],
      }
    });

    console.log("✅ Criterion5_9Form: Data loaded and set successfully");
    setLoading(false);
  };

  // Load contributors data for card view
  const loadContributorsData = async () => {
    if (!showCardView || !cycle_sub_category_id) return;
    
    setCardLoading(true);
    try {
      const contributorsResponse = await newnbaCriteria1Service.getAllCriteria5_9_Data?.(cycle_sub_category_id);
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
    if (!initialData?.visiting_faculty_id) {
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
            await newnbaCriteria1Service.deleteCriteria5_9_Data?.(initialData.visiting_faculty_id);
            
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
                Criterion 5.9 data has been deleted successfully.
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
        This will permanently delete all Criterion 5.9 data!
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

  // Handle yearly interaction changes
  const handleHoursChange = (index, hours) => {
    const newInteractions = [...yearlyInteractions];
    newInteractions[index].hours = parseInt(hours) || 0;
    newInteractions[index].exceedsThreshold = newInteractions[index].hours >= 50;
    setYearlyInteractions(newInteractions);
  };

  const handleDetailsChange = (index, details) => {
    const newInteractions = [...yearlyInteractions];
    newInteractions[index].details = details;
    setYearlyInteractions(newInteractions);
  };

  const handleFacultyCountChange = (index, count) => {
    const newInteractions = [...yearlyInteractions];
    newInteractions[index].facultyCount = parseInt(count) || 0;
    setYearlyInteractions(newInteractions);
  };

  // Add new visiting faculty
  const handleAddFaculty = () => {
    const newFaculty = {
      id: Date.now(),
      name: "",
      designation: "",
      organization: "",
      expertise: "",
      years_involved: [],
      contribution_type: [],
      hours_per_year: 0
    };
    setVisitingFacultyList([...visitingFacultyList, newFaculty]);
  };

  const handleFacultyChange = (index, field, value) => {
    const newList = [...visitingFacultyList];
    newList[index][field] = value;
    setVisitingFacultyList(newList);
  };

  const handleRemoveFaculty = (index) => {
    const newList = visitingFacultyList.filter((_, i) => i !== index);
    setVisitingFacultyList(newList);
  };

  const handleSave = async (formData) => {
    const userInfo = JSON.parse(localStorage.getItem("userProfile") || "{}");
    const userInfoo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const currentOtherStaffId = otherStaffId || userInfo?.rawData?.other_staff_id || userInfo.user_id || userInfoo?.other_staff_id;
    
    console.log("🟠 Criterion5_9Form handleSave called");
    setSaving(true);

    try {
      // Transform filesByField → flat files with correct category
      const filesWithCategory = Object.keys(formData.filesByField || {}).flatMap(fieldName => {
        return (formData.filesByField[fieldName] || []).map(file => {
          let category = "Other";
          if (fieldName === "provision_documents") category = "Provision Documents";
          if (fieldName === "contribution_documents") category = "Contribution Documents";
          if (fieldName === "interaction_documents") category = "Interaction Documents";
          return { ...file, category };
        });
      });

      const marks = calculateMarks();

      const payload = {
        cycle_sub_category_id,
        other_staff_id: currentOtherStaffId,
        program_id: programId,
        provision_details: formData.content.provision_details || "",
        contribution_details: formData.content.contribution_details || "",
        visiting_faculty_list: visitingFacultyList,
        yearly_interactions: yearlyInteractions,
        calculated_marks: marks,
        provision_documents: filesWithCategory
          .filter(f => f.category === "Provision Documents" && (f.url || f.s3Url))
          .map(f => ({ 
            document_name: f.filename, 
            document_url: f.s3Url || f.url,
            description: f.description || ""
          })),
        contribution_documents: filesWithCategory
          .filter(f => f.category === "Contribution Documents" && (f.url || f.s3Url))
          .map(f => ({ 
            document_name: f.filename, 
            document_url: f.s3Url || f.url,
            description: f.description || ""
          })),
        interaction_documents: filesWithCategory
          .filter(f => f.category === "Interaction Documents" && (f.url || f.s3Url))
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
      if (initialData?.visiting_faculty_id) {
        await newnbaCriteria1Service.putCriteria5_9_Data?.(
          initialData.visiting_faculty_id,
          currentOtherStaffId,
          payload
        );
      } else {
        await newnbaCriteria1Service.saveCriteria5_9_Data?.(currentOtherStaffId, payload);
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
          Criterion 5.9 saved successfully!
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
        Loading Criterion 5.9..
      </div>
    );
  }

  const marks = calculateMarks();

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
                    <p className="text-sm text-gray-600">Total Faculty: {card.total_faculty || 0}</p>
                    <p className="text-sm text-gray-600">Calculated Marks: {card.calculated_marks?.totalMarks || 0}/25</p>
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
          "visiting_faculty_table": (
            <div className="space-y-6">
              {/* Marks Calculation Summary */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h5 className="font-semibold text-blue-700">Marks Calculation</h5>
                    <p className="text-sm text-gray-700">
                      Provision Details: <span className="font-bold">{marks.provisionMarks}/5</span> | 
                      Interaction Hours: <span className="font-bold">{marks.interactionMarks}/20</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-700">Total: {marks.totalMarks}/25</p>
                    <p className="text-xs text-gray-600">
                      {marks.interactionMarks === 20 ? "✓ Maximum interaction marks achieved" : 
                       `${Math.floor((20 - marks.interactionMarks)/4)} more year(s) needed for full marks`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Yearly Interaction Table */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-[#2163c1] text-white px-4 py-2">
                  <div className="flex justify-between items-center">
                    <h5 className="font-semibold">Yearly Interaction Details</h5>
                    <div className="text-sm">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded mr-2">
                        ✓ 50+ hours = 4 marks/year
                      </span>
                      <span className="text-yellow-100">Maximum: 20 marks (5 years × 4 marks)</span>
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border text-sm">
                    <thead className="bg-blue-100">
                      <tr>
                        <th className="border px-3 py-2 w-32">Assessment Year</th>
                        <th className="border px-3 py-2 w-24">Hours of Interaction</th>
                        <th className="border px-3 py-2 w-20">Status</th>
                        <th className="border px-3 py-2 w-24">No. of Faculty</th>
                        <th className="border px-3 py-2">Contribution Details</th>
                        <th className="border px-3 py-2 w-20">Marks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {yearlyInteractions.map((year, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="border px-3 py-2 text-center font-medium">
                            {year.year}
                          </td>
                          <td className="border px-3 py-2">
                            <input
                              type="number"
                              value={year.hours}
                              onChange={(e) => handleHoursChange(idx, e.target.value)}
                              className="w-full p-1 border rounded text-center"
                              min="0"
                              disabled={!isEditable}
                            />
                          </td>
                          <td className="border px-3 py-2 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              year.hours >= 50 
                                ? 'bg-green-100 text-green-800' 
                                : year.hours > 0 
                                  ? 'bg-yellow-100 text-yellow-800' 
                                  : 'bg-red-100 text-red-800'
                            }`}>
                              {year.hours >= 50 ? '✓ Eligible' : year.hours > 0 ? 'In Progress' : 'No Data'}
                            </span>
                            <div className="text-xs text-gray-500 mt-1">
                              {year.hours}/50 hours
                            </div>
                          </td>
                          <td className="border px-3 py-2">
                            <input
                              type="number"
                              value={year.facultyCount}
                              onChange={(e) => handleFacultyCountChange(idx, e.target.value)}
                              className="w-full p-1 border rounded text-center"
                              min="0"
                              disabled={!isEditable}
                            />
                          </td>
                          <td className="border px-3 py-2">
                            <textarea
                              value={year.details}
                              onChange={(e) => handleDetailsChange(idx, e.target.value)}
                              placeholder="Enter contribution details..."
                              className="w-full p-2 border rounded text-sm"
                              rows="2"
                              disabled={!isEditable}
                            />
                          </td>
                          <td className="border px-3 py-2 text-center font-bold">
                            {year.hours >= 50 ? (
                              <span className="text-green-600">4</span>
                            ) : (
                              <span className="text-red-500">0</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-100">
                      <tr>
                        <td colSpan="5" className="border px-3 py-2 text-right font-medium">
                          Total Interaction Marks:
                        </td>
                        <td className="border px-3 py-2 text-center font-bold text-blue-600">
                          {marks.interactionMarks}/20
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Visiting Faculty List */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-[#2163c1] text-white px-4 py-2 flex justify-between items-center">
                  <h5 className="font-semibold">Visiting/Adjunct/Emeritus Faculty Details</h5>
                  {isEditable && (
                    <button
                      onClick={handleAddFaculty}
                      className="px-3 py-1 bg-white text-blue-600 rounded text-sm font-medium hover:bg-gray-100"
                    >
                      + Add Faculty
                    </button>
                  )}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border text-sm">
                    <thead className="bg-blue-50">
                      <tr>
                        <th className="border px-3 py-2">Name</th>
                        <th className="border px-3 py-2">Designation</th>
                        <th className="border px-3 py-2">Organization</th>
                        <th className="border px-3 py-2">Expertise</th>
                        <th className="border px-3 py-2">Years Involved</th>
                        <th className="border px-3 py-2">Contribution Type</th>
                        <th className="border px-3 py-2 w-24">Hours/Year</th>
                        {isEditable && <th className="border px-3 py-2 w-20">Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {visitingFacultyList.length > 0 ? (
                        visitingFacultyList.map((faculty, idx) => (
                          <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                            <td className="border px-3 py-2">
                              <input
                                type="text"
                                value={faculty.name}
                                onChange={(e) => handleFacultyChange(idx, 'name', e.target.value)}
                                className="w-full p-1 border rounded"
                                disabled={!isEditable}
                                placeholder="Faculty Name"
                              />
                            </td>
                            <td className="border px-3 py-2">
                              <select
                                value={faculty.designation}
                                onChange={(e) => handleFacultyChange(idx, 'designation', e.target.value)}
                                className="w-full p-1 border rounded"
                                disabled={!isEditable}
                              >
                                <option value="">Select Designation</option>
                                <option value="Visiting Professor">Visiting Professor</option>
                                <option value="Adjunct Faculty">Adjunct Faculty</option>
                                <option value="Emeritus Professor">Emeritus Professor</option>
                                <option value="Industry Expert">Industry Expert</option>
                                <option value="Research Scientist">Research Scientist</option>
                                <option value="Government Official">Government Official</option>
                              </select>
                            </td>
                            <td className="border px-3 py-2">
                              <input
                                type="text"
                                value={faculty.organization}
                                onChange={(e) => handleFacultyChange(idx, 'organization', e.target.value)}
                                className="w-full p-1 border rounded"
                                disabled={!isEditable}
                                placeholder="Organization"
                              />
                            </td>
                            <td className="border px-3 py-2">
                              <input
                                type="text"
                                value={faculty.expertise}
                                onChange={(e) => handleFacultyChange(idx, 'expertise', e.target.value)}
                                className="w-full p-1 border rounded"
                                disabled={!isEditable}
                                placeholder="Area of Expertise"
                              />
                            </td>
                            <td className="border px-3 py-2">
                              <select
                                multiple
                                value={faculty.years_involved}
                                onChange={(e) => {
                                  const selected = Array.from(e.target.selectedOptions, option => option.value);
                                  handleFacultyChange(idx, 'years_involved', selected);
                                }}
                                className="w-full p-1 border rounded h-24"
                                disabled={!isEditable}
                              >
                                <option value="2023-2024">2023-2024</option>
                                <option value="2022-2023">2022-2023</option>
                                <option value="2021-2022">2021-2022</option>
                                <option value="2020-2021">2020-2021</option>
                                <option value="2019-2020">2019-2020</option>
                              </select>
                              <div className="text-xs text-gray-500 mt-1">
                                {faculty.years_involved?.length || 0} year(s) selected
                              </div>
                            </td>
                            <td className="border px-3 py-2">
                              <select
                                multiple
                                value={faculty.contribution_type}
                                onChange={(e) => {
                                  const selected = Array.from(e.target.selectedOptions, option => option.value);
                                  handleFacultyChange(idx, 'contribution_type', selected);
                                }}
                                className="w-full p-1 border rounded h-24"
                                disabled={!isEditable}
                              >
                                <option value="Teaching">Teaching</option>
                                <option value="Guest Lectures">Guest Lectures</option>
                                <option value="Research Guidance">Research Guidance</option>
                                <option value="Project Evaluation">Project Evaluation</option>
                                <option value="Workshop/Seminar">Workshop/Seminar</option>
                                <option value="Curriculum Development">Curriculum Development</option>
                                <option value="Mentoring">Mentoring</option>
                                <option value="Industry Collaboration">Industry Collaboration</option>
                              </select>
                              <div className="text-xs text-gray-500 mt-1">
                                {faculty.contribution_type?.length || 0} contribution(s)
                              </div>
                            </td>
                            <td className="border px-3 py-2">
                              <input
                                type="number"
                                value={faculty.hours_per_year}
                                onChange={(e) => handleFacultyChange(idx, 'hours_per_year', e.target.value)}
                                className="w-full p-1 border rounded text-center"
                                min="0"
                                disabled={!isEditable}
                              />
                            </td>
                            {isEditable && (
                              <td className="border px-3 py-2 text-center">
                                <button
                                  onClick={() => handleRemoveFaculty(idx)}
                                  className="px-2 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                                >
                                  Remove
                                </button>
                              </td>
                            )}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={isEditable ? 8 : 7} className="border px-3 py-8 text-center text-gray-500">
                            No visiting faculty details added. Click "Add Faculty" to add details.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Source Categories */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h6 className="font-semibold text-gray-700 mb-3">Categories of Visiting/Adjunct Faculty Experts:</h6>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-white p-3 rounded border">
                    <h6 className="font-medium text-blue-600 mb-1">Industry Professionals</h6>
                    <p className="text-xs text-gray-600">Experts from corporate sector, tech companies, business organizations</p>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <h6 className="font-medium text-green-600 mb-1">Research Organizations</h6>
                    <p className="text-xs text-gray-600">Scientists from research labs, R&D centers, scientific institutions</p>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <h6 className="font-medium text-purple-600 mb-1">Universities/Institutes</h6>
                    <p className="text-xs text-gray-600">Faculty from other universities, eminent professors, academic experts</p>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <h6 className="font-medium text-orange-600 mb-1">Government Organizations</h6>
                    <p className="text-xs text-gray-600">Officials from government departments, regulatory bodies, PSUs</p>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <h6 className="font-medium text-teal-600 mb-1">Emeritus Faculty</h6>
                    <p className="text-xs text-gray-600">Retired professors continuing academic contributions</p>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <h6 className="font-medium text-pink-600 mb-1">International Experts</h6>
                    <p className="text-xs text-gray-600">Foreign faculty, NRI professionals, global consultants</p>
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

export default Criterion5_9Form;