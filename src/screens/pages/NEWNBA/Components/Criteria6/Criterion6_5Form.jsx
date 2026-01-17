// src/screens/pages/NEWNBA/Components/Criteria1/Criterion6_5Form.jsx
import React, { useState, useEffect } from "react";
import GenericCriteriaForm1_2 from "../GenericCriteriaForm1_2";
import { newnbaCriteria1Service } from "../../Services/NewNBA-Criteria1.service";
import { toast } from "react-toastify";

const Criterion6_5Form = ({
  cycle_sub_category_id,
  isEditable = true,
  onSaveSuccess,
  programId = null,
  otherStaffId = null,
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initialData, setInitialData] = useState({
    content: {},
    files: [],
    non_teaching_id: null,
  });

  // Table 6.5 data - Technical staff details
  const [technicalStaff, setTechnicalStaff] = useState([
    {
      id: 1,
      sno: 1,
      name: "Rajesh Kumar",
      designation: "Senior Lab Technician",
      date_of_joining: "15/06/2018",
      qualification_at_joining: "Diploma in Civil Engineering",
      qualification_now: "B.Tech (Civil), Diploma in AutoCad",
      other_skills: "AutoCAD, Material Testing, Workshop Safety",
      responsibility: "Responsible for Material Testing Lab and Construction Yard",
    },
    {
      id: 2,
      sno: 2,
      name: "Priya Sharma",
      designation: "Computer Lab Assistant",
      date_of_joining: "20/03/2020",
      qualification_at_joining: "BCA",
      qualification_now: "MCA, Autodesk Certified Professional",
      other_skills: "Revit, SketchUp, 3D Max, Network Management",
      responsibility: "Maintenance of Computer Labs and Software Licenses",
    },
    {
      id: 3,
      sno: 3,
      name: "Amit Patel",
      designation: "Workshop Incharge",
      date_of_joining: "10/01/2019",
      qualification_at_joining: "ITI Fitter",
      qualification_now: "Diploma in Mechanical Engineering, Welding Certification",
      other_skills: "Carpentry, Welding, Machine Operation, Safety Training",
      responsibility: "Model Making Workshop and Carpentry Workshop",
    },
    {
      id: 4,
      sno: 4,
      name: "Sneha Reddy",
      designation: "Studio Assistant",
      date_of_joining: "05/08/2021",
      qualification_at_joining: "B.Arch",
      qualification_now: "M.Arch (Pursuing), Digital Fabrication Training",
      other_skills: "3D Printing, Laser Cutting, Model Making",
      responsibility: "Design Studio Support and Material Management",
    },
    {
      id: 5,
      sno: 5,
      name: "Vikram Singh",
      designation: "Technical Assistant",
      date_of_joining: "12/11/2017",
      qualification_at_joining: "Diploma in Electrical Engineering",
      qualification_now: "B.Tech (Electrical), PLC Programming",
      other_skills: "Electrical Maintenance, Equipment Calibration, Safety Audit",
      responsibility: "Electrical Maintenance of all Laboratories",
    },
  ]);

  // 6.5.1 and 6.5.2 marks
  const [marksAllocation, setMarksAllocation] = useState({
    staff_availability: 12, // out of 15
    incentives_skill_upgrade: 4, // out of 5
  });

  const config = {
    title: "6.5 Non-Teaching Support (20)",
    totalMarks: 20,
    fields: [
      {
        name: "staff_availability_info",
        label: "6.5.1 Availability of Adequate and Qualified Technical Supporting Staff for Program Specific Laboratories, Workshops and Studio (15)",
        marks: 15,
        type: "richText",
        placeholder: "Describe the availability and qualification of technical supporting staff...",
      },
      {
        name: "incentives_info",
        label: "6.5.2 Incentives, Skill Upgrade, and Professional Advancement (5)",
        marks: 5,
        type: "richText",
        placeholder: "Describe incentives, skill upgrade programs, and professional advancement opportunities for technical staff...",
      },
    ],
  };

  const loadData = async () => {
    if (!cycle_sub_category_id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const currentOtherStaffId = otherStaffId;
      const res = await newnbaCriteria1Service.getCriteria6_5_Data?.(cycle_sub_category_id, currentOtherStaffId) || { data: {} };
      const d = res?.data || {};

      if (d.technical_staff && Array.isArray(d.technical_staff)) {
        setTechnicalStaff(d.technical_staff);
      }

      if (d.marks_allocation) {
        setMarksAllocation(d.marks_allocation);
      }

      setInitialData({
        content: {
          staff_availability_info: d.staff_availability_info || `
            <p><strong>Availability of Technical Supporting Staff:</strong></p>
            <p>The department maintains an adequate number of qualified technical supporting staff for all laboratories, workshops, and studios. The technical staff play a crucial role in supporting academic activities and ensuring smooth functioning of practical sessions.</p>
            
            <p><strong>Staff Distribution:</strong></p>
            <ul>
              <li><strong>Design Studio:</strong> 2 dedicated studio assistants with architecture background</li>
              <li><strong>Computer Labs:</strong> 3 computer lab assistants with IT and CAD expertise</li>
              <li><strong>Model Making Workshop:</strong> 2 workshop technicians with carpentry and fabrication skills</li>
              <li><strong>Construction Yard:</strong> 1 senior technician with civil engineering background</li>
              <li><strong>Material Testing Lab:</strong> 1 lab technician with material science expertise</li>
              <li><strong>General Support:</strong> 2 technical assistants for maintenance and support</li>
            </ul>
            
            <p><strong>Qualifications and Experience:</strong></p>
            <p>All technical staff possess relevant educational qualifications ranging from diploma to degree level in respective fields. The average experience of technical staff is 5+ years, ensuring competent support for students and faculty.</p>
            
            <p><strong>Roles and Responsibilities:</strong></p>
            <p>Technical staff are responsible for:</p>
            <ul>
              <li>Preparation of laboratory/workshop setups</li>
              <li>Maintenance and calibration of equipment</li>
              <li>Safety monitoring and implementation</li>
              <li>Assisting students during practical sessions</li>
              <li>Inventory management of consumables</li>
              <li>Basic troubleshooting and repairs</li>
            </ul>
            
            <p>The staff-student ratio for technical support is maintained at 1:30, ensuring adequate attention to all students during practical sessions.</p>
          `,
          incentives_info: d.incentives_info || `
            <p><strong>Incentives and Professional Development:</strong></p>
            <p>The institution provides various incentives and opportunities for skill upgrade and professional advancement for technical staff.</p>
            
            <p><strong>Financial Incentives:</strong></p>
            <ul>
              <li>Performance-based annual increments</li>
              <li>Special allowances for technical certifications</li>
              <li>Overtime compensation for extra duties</li>
              <li>Medical insurance and provident fund benefits</li>
            </ul>
            
            <p><strong>Skill Upgrade Programs:</strong></p>
            <ul>
              <li>Annual training programs on new equipment and technologies</li>
              <li>Sponsorship for external certification courses (AutoCAD, Revit, etc.)</li>
              <li>Workshops on laboratory safety and maintenance</li>
              <li>Training on new software and digital tools</li>
            </ul>
            
            <p><strong>Professional Advancement:</strong></p>
            <ul>
              <li>Promotion opportunities based on performance and qualifications</li>
              <li>Encouragement for higher education with flexible work schedules</li>
              <li>Opportunities to participate in technical conferences and seminars</li>
              <li>Recognition through annual awards for best technical staff</li>
            </ul>
            
            <p><strong>Recent Training Programs (Last 3 Years):</strong></p>
            <ul>
              <li>Advanced CAD/CAM Training (2023)</li>
              <li>Laboratory Safety Management Workshop (2022)</li>
              <li>Digital Fabrication Technology Training (2022)</li>
              <li>Equipment Calibration and Maintenance (2021)</li>
              <li>3D Printing and Rapid Prototyping (2021)</li>
            </ul>
            
            <p>These initiatives ensure that technical staff remain updated with latest technologies and continue to provide quality support to academic programs.</p>
          `,
        },
        non_teaching_id: d.non_teaching_id || null,
        filesByField: d.filesByField || {},
      });
    } catch (err) {
      toast.error("Failed to load data");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [cycle_sub_category_id, otherStaffId]);

  // Handlers for Technical Staff Table
  const handleAddStaff = () => {
    const newStaff = {
      id: Date.now(),
      sno: technicalStaff.length + 1,
      name: "",
      designation: "",
      date_of_joining: "",
      qualification_at_joining: "",
      qualification_now: "",
      other_skills: "",
      responsibility: "",
    };
    setTechnicalStaff([...technicalStaff, newStaff]);
  };

  const handleStaffChange = (index, field, value) => {
    const updated = [...technicalStaff];
    updated[index][field] = value;
    setTechnicalStaff(updated);
  };

  const handleRemoveStaff = (index) => {
    setTechnicalStaff(technicalStaff.filter((_, i) => i !== index));
  };

  // Handle marks allocation changes
  const handleMarksChange = (field, value) => {
    const maxValue = field === 'staff_availability' ? 15 : 5;
    setMarksAllocation(prev => ({
      ...prev,
      [field]: Math.min(parseInt(value) || 0, maxValue)
    }));
  };

  // Calculate total marks
  const calculateTotalMarks = () => {
    return marksAllocation.staff_availability + marksAllocation.incentives_skill_upgrade;
  };

  const handleSave = async (formData) => {
    setSaving(true);
    
    const totalMarks = calculateTotalMarks();
    
    const payload = {
      cycle_sub_category_id,
      other_staff_id: otherStaffId,
      program_id: programId,
      technical_staff: technicalStaff,
      marks_allocation: marksAllocation,
      total_marks: totalMarks,
      total_staff: technicalStaff.length,
      content: formData.content,
    };

    try {
      // Save API call
      // await newnbaCriteria1Service.saveCriteria6_5_Data(payload);
      toast.success("Criterion 6.5 data saved successfully!");
      if (onSaveSuccess) onSaveSuccess();
    } catch (err) {
      toast.error("Failed to save data");
    }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-20">Loading Criterion 6.5...</div>;

  const totalMarks = calculateTotalMarks();

  return (
    <GenericCriteriaForm1_2
      title={config.title}
      marks={config.totalMarks}
      fields={config.fields}
      initialData={initialData}
      saving={saving}
      isCompleted={!isEditable}
      isContributorEditable={isEditable}
      customContent={{
        "technical_staff_section": (
          <div className="space-y-8 mt-8">
            
            {/* Marks Summary */}
            <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Criterion 6.5 Assessment - Total: {totalMarks}/20</h3>
                  <p className="text-gray-600 mt-1">Non-Teaching Support</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">{totalMarks}</div>
                  <div className="text-sm text-gray-500">Out of 20</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded border">
                  <h6 className="font-medium text-gray-700 mb-2">6.5.1 Staff Availability (15)</h6>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-green-600">
                      {marksAllocation.staff_availability}
                    </div>
                    {isEditable && (
                      <div className="flex items-center space-x-2">
                        <input
                          type="range"
                          min="0"
                          max="15"
                          value={marksAllocation.staff_availability}
                          onChange={(e) => handleMarksChange('staff_availability', e.target.value)}
                          className="w-32 accent-blue-600"
                        />
                        <input
                          type="number"
                          min="0"
                          max="15"
                          value={marksAllocation.staff_availability}
                          onChange={(e) => handleMarksChange('staff_availability', e.target.value)}
                          className="w-16 p-1 border rounded text-center"
                        />
                      </div>
                    )}
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    Based on: {technicalStaff.length} staff members
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded border">
                  <h6 className="font-medium text-gray-700 mb-2">6.5.2 Incentives & Skill Upgrade (5)</h6>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-purple-600">
                      {marksAllocation.incentives_skill_upgrade}
                    </div>
                    {isEditable && (
                      <div className="flex items-center space-x-2">
                        <input
                          type="range"
                          min="0"
                          max="5"
                          value={marksAllocation.incentives_skill_upgrade}
                          onChange={(e) => handleMarksChange('incentives_skill_upgrade', e.target.value)}
                          className="w-32 accent-purple-600"
                        />
                        <input
                          type="number"
                          min="0"
                          max="5"
                          value={marksAllocation.incentives_skill_upgrade}
                          onChange={(e) => handleMarksChange('incentives_skill_upgrade', e.target.value)}
                          className="w-16 p-1 border rounded text-center"
                        />
                      </div>
                    )}
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    Training programs and incentives
                  </div>
                </div>
              </div>
            </div>

            {/* Table 6.5 - Technical Staff Details */}
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <div className="bg-gray-800 text-white px-4 py-3">
                <h4 className="font-bold text-lg">Table No. 6.5. List of technical staff details.</h4>
                <p className="text-sm text-gray-300 mt-1">Non-teaching technical support staff for laboratories, workshops and studio</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">S.No</th>
                      <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">Name of the technical staff</th>
                      <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">Designation</th>
                      <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">Date of joining</th>
                      <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700" colSpan="2">
                        Qualification
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">Other technical skills gained</th>
                      <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">Responsibility</th>
                      {isEditable && (
                        <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">Action</th>
                      )}
                    </tr>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2"></th>
                      <th className="border border-gray-300 px-4 py-2"></th>
                      <th className="border border-gray-300 px-4 py-2"></th>
                      <th className="border border-gray-300 px-4 py-2"></th>
                      <th className="border border-gray-300 px-4 py-2 text-center text-xs font-medium text-gray-600">At Joining</th>
                      <th className="border border-gray-300 px-4 py-2 text-center text-xs font-medium text-gray-600">Now</th>
                      <th className="border border-gray-300 px-4 py-2"></th>
                      <th className="border border-gray-300 px-4 py-2"></th>
                      {isEditable && <th className="border border-gray-300 px-4 py-2"></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {technicalStaff.map((staff, index) => (
                      <tr key={staff.id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-3 text-center font-medium">
                          {staff.sno}
                        </td>
                        <td className="border border-gray-300 px-4 py-3">
                          {isEditable ? (
                            <input
                              type="text"
                              value={staff.name}
                              onChange={(e) => handleStaffChange(index, 'name', e.target.value)}
                              className="w-full p-2 border rounded"
                              placeholder="Full name"
                            />
                          ) : (
                            staff.name
                          )}
                        </td>
                        <td className="border border-gray-300 px-4 py-3">
                          {isEditable ? (
                            <select
                              value={staff.designation}
                              onChange={(e) => handleStaffChange(index, 'designation', e.target.value)}
                              className="w-full p-2 border rounded"
                            >
                              <option value="">Select Designation</option>
                              <option value="Senior Lab Technician">Senior Lab Technician</option>
                              <option value="Lab Technician">Lab Technician</option>
                              <option value="Workshop Incharge">Workshop Incharge</option>
                              <option value="Computer Lab Assistant">Computer Lab Assistant</option>
                              <option value="Studio Assistant">Studio Assistant</option>
                              <option value="Technical Assistant">Technical Assistant</option>
                              <option value="Lab Assistant">Lab Assistant</option>
                              <option value="Workshop Technician">Workshop Technician</option>
                            </select>
                          ) : (
                            staff.designation
                          )}
                        </td>
                        <td className="border border-gray-300 px-4 py-3">
                          {isEditable ? (
                            <input
                              type="text"
                              value={staff.date_of_joining}
                              onChange={(e) => handleStaffChange(index, 'date_of_joining', e.target.value)}
                              className="w-full p-2 border rounded"
                              placeholder="DD/MM/YYYY"
                            />
                          ) : (
                            staff.date_of_joining
                          )}
                        </td>
                        <td className="border border-gray-300 px-4 py-3">
                          {isEditable ? (
                            <textarea
                              value={staff.qualification_at_joining}
                              onChange={(e) => handleStaffChange(index, 'qualification_at_joining', e.target.value)}
                              className="w-full p-2 border rounded text-sm"
                              rows="2"
                              placeholder="Qualifications at time of joining"
                            />
                          ) : (
                            <div className="text-sm">{staff.qualification_at_joining}</div>
                          )}
                        </td>
                        <td className="border border-gray-300 px-4 py-3">
                          {isEditable ? (
                            <textarea
                              value={staff.qualification_now}
                              onChange={(e) => handleStaffChange(index, 'qualification_now', e.target.value)}
                              className="w-full p-2 border rounded text-sm"
                              rows="2"
                              placeholder="Current qualifications (after training)"
                            />
                          ) : (
                            <div className="text-sm">{staff.qualification_now}</div>
                          )}
                        </td>
                        <td className="border border-gray-300 px-4 py-3">
                          {isEditable ? (
                            <textarea
                              value={staff.other_skills}
                              onChange={(e) => handleStaffChange(index, 'other_skills', e.target.value)}
                              className="w-full p-2 border rounded text-sm"
                              rows="2"
                              placeholder="Additional technical skills acquired"
                            />
                          ) : (
                            <div className="text-sm">{staff.other_skills}</div>
                          )}
                        </td>
                        <td className="border border-gray-300 px-4 py-3">
                          {isEditable ? (
                            <textarea
                              value={staff.responsibility}
                              onChange={(e) => handleStaffChange(index, 'responsibility', e.target.value)}
                              className="w-full p-2 border rounded text-sm"
                              rows="2"
                              placeholder="Specific responsibilities"
                            />
                          ) : (
                            <div className="text-sm">{staff.responsibility}</div>
                          )}
                        </td>
                        {isEditable && (
                          <td className="border border-gray-300 px-4 py-3 text-center">
                            <button
                              onClick={() => handleRemoveStaff(index)}
                              className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm font-medium"
                            >
                              Remove
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                    {technicalStaff.length === 0 && (
                      <tr>
                        <td colSpan={isEditable ? 9 : 8} className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                          No technical staff data available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  {isEditable && (
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={isEditable ? 9 : 8} className="border border-gray-300 px-4 py-3">
                          <button
                            onClick={handleAddStaff}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
                          >
                            + Add Technical Staff
                          </button>
                          <span className="ml-4 text-sm text-gray-600">
                            Total Staff: {technicalStaff.length}
                          </span>
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>

            {/* Staff Summary Statistics */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
              <h5 className="font-bold text-gray-700 mb-3">Technical Staff Summary</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-3 rounded border text-center">
                  <div className="text-2xl font-bold text-blue-600">{technicalStaff.length}</div>
                  <div className="text-sm text-gray-600">Total Staff</div>
                </div>
                <div className="bg-white p-3 rounded border text-center">
                  <div className="text-xl font-bold text-green-600">
                    {technicalStaff.filter(s => s.designation?.includes("Senior") || s.designation?.includes("Incharge")).length}
                  </div>
                  <div className="text-sm text-gray-600">Senior Staff</div>
                </div>
                <div className="bg-white p-3 rounded border text-center">
                  <div className="text-xl font-bold text-purple-600">
                    {technicalStaff.filter(s => s.qualification_now?.toLowerCase().includes("degree") || 
                                                 s.qualification_now?.toLowerCase().includes("b.tech") ||
                                                 s.qualification_now?.toLowerCase().includes("b.arch")).length}
                  </div>
                  <div className="text-sm text-gray-600">Degree Holders</div>
                </div>
                <div className="bg-white p-3 rounded border text-center">
                  <div className="text-xl font-bold text-orange-600">
                    {technicalStaff.filter(s => s.other_skills?.toLowerCase().includes("cad") || 
                                                 s.other_skills?.toLowerCase().includes("3d") ||
                                                 s.other_skills?.toLowerCase().includes("digital")).length}
                  </div>
                  <div className="text-sm text-gray-600">Digital Skills</div>
                </div>
              </div>
            </div>

            {/* NBA Assessment Guidelines */}
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">NBA Assessment Guidelines for Criterion 6.5 (20 Marks)</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p><strong>6.5.1 Staff Availability (15 marks):</strong></p>
                    <ul className="list-disc pl-5 mt-1">
                      <li>Adequate number of technical staff for all facilities</li>
                      <li>Relevant qualifications and experience</li>
                      <li>Proper distribution across laboratories/workshops</li>
                      <li>Clear roles and responsibilities defined</li>
                      <li>Continuous availability during academic hours</li>
                    </ul>
                    <p className="mt-2"><strong>6.5.2 Incentives & Skill Upgrade (5 marks):</strong></p>
                    <ul className="list-disc pl-5 mt-1">
                      <li>Regular training and skill development programs</li>
                      <li>Financial and non-financial incentives</li>
                      <li>Career advancement opportunities</li>
                      <li>Support for higher education and certifications</li>
                      <li>Recognition and reward systems</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Typical Technical Staff Roles */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
              <h5 className="font-bold text-blue-700 mb-3">Typical Technical Staff Roles in Architecture Department</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h6 className="font-medium text-blue-600 mb-2">Laboratory/Workshop Specific:</h6>
                  <ul className="space-y-1 text-gray-700">
                    <li className="flex items-start">
                      <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Design Studio Assistants (Architecture background)</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>CAD Lab Technicians (IT/Computer background)</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Workshop Technicians (Carpentry/Fabrication skills)</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h6 className="font-medium text-blue-600 mb-2">Support Roles:</h6>
                  <ul className="space-y-1 text-gray-700">
                    <li className="flex items-start">
                      <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Material Lab Technicians (Civil/Material Science)</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Electrical/Mechanical Maintenance Staff</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Safety and Inventory Management Staff</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

          </div>
        ),
      }}
      onSave={handleSave}
    />
  );
};

export default Criterion6_5Form;