// src/screens/pages/PreQualifier/ViewPrequalifierPartBOptimized.jsx
import React, { useState, useEffect } from "react";
import { Formik, Form, Field, FieldArray } from "formik";
import { useLocation, useNavigate } from "react-router-dom";
import { newnbaPrequalifierService } from "./Services/NewNBA-Prequalifier.service.js";
import { Edit, Plus, Trash2, X } from "lucide-react";
import SweetAlert from 'react-bootstrap-sweetalert';

const ViewPrequalifierPartBOptimized = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    cycleId,
    program_name = "",
    academic_year = "",
    program_id,
    college_id,
  } = location.state || {};
  console.log("Location state:", location.state);

  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedData, setSavedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    if (cycleId) fetchPartBData();
    else setLoading(false);
  }, [cycleId]);

  const fetchPartBData = async () => {
    try {
      setLoading(true);
      const response = await newnbaPrequalifierService.getNBAPrequalifierPartB(cycleId);
      console.log("API Response from getNBAPrequalifierPartB:", response);
      if (response && response.id) {
        console.log("Setting savedData with ID:", response.id);
        setSavedData(response);
      } else if (response && Array.isArray(response) && response.length > 0) {
        console.log("Response is array, using first element:", response[0]);
        setSavedData(response[0]);
      } else {
        console.log("No data found in response");
        setSavedData(null);
      }
    } catch (err) {
      console.error("Error fetching Part B:", err);
      setSavedData(null);
    } finally {
      setLoading(false);
    }
  };

  const getDefaultValues = () => ({
  b1_program_information: {
    program_name: program_name,
    year_of_start: "",
    sanctioned_intake: "",
    increase_decrease: "",
    increase_decrease_year: "",
    aicte_approval_letter: "",
    program_accredited : "",
    accreditation_status: "Not accredited",
    accreditation_details: "",
  },

  b2a_faculty_details: [],

  b21_department_name: "",
  b21_no_of_allied_departments: "",
  b21_no_of_ug_programs: "",
  b21_no_of_pg_programs: "",

  // ✅ FIXED: Correct field names for the table
  b21_faculty_cadre_table: {
    cay: {
      professors_phd_regular: "",
      professors_phd_contract: "",
      assoc_prof_phd_regular: "",
      assoc_prof_phd_contract: "",
      assistant_professors_regular: "",
      assistant_professors_contract: "",
      total_phd_faculty: 0,
    },
    caym1: {
      professors_phd_regular: "",
      professors_phd_contract: "",
      assoc_prof_phd_regular: "",
      assoc_prof_phd_contract: "",
      assistant_professors_regular: "",
      assistant_professors_contract: "",
      total_phd_faculty: 0,
    },
  },

  b22_hod_name: "",
  b22_nature_of_appointment: "",
  b22_qualification: "",
  b22_hod_details: {
    name: "",
    nature_of_appointment: "",
    qualification: "",
    qualification_other: "",
  },

  // ---------------- SFR LIST ----------------
  b3_sfr_list: [
    {
      type: "UG",
      name: "",
      b: "",
      c: "",
      d: "",
    },
    {
      type: "PG",
      name: "",
      a: "",
      b: "",
    },
  ],

  // ---------------- SUMMARY ----------------
  sfr_summary: [
    { year: "cay", students: "", faculty: "", sfr: "" },
    { year: "caym1", students: "", faculty: "", sfr: "" },
    { year: "caym2", students: "", faculty: "", sfr: "" },
  ],

  pre_visit_qualifiers: [
    { sn: 1, description: "AICTE approval for last 5 years", status: "Complied" },
    { sn: 2, description: "Average SFR ≤ 25:1 over 3 years", status: "Not Complied" },
    { sn: 3, description: "Required Professor/Assoc Prof with Ph.D (Case 1/2)", status: "Not Complied" },
    { sn: 4, description: "≥10% faculty with Ph.D (avg over CAY & CAYm1)", status: "Not Complied" },
    { sn: 5, description: "At least two batches passed out", status: "Not Complied" },
  ],

  remarks: "",
});


 const getInitialValues = () => {
  if (!savedData) {
    console.log("No savedData, returning defaults");
    return getDefaultValues();
  }

  console.log("getInitialValues called with savedData:", savedData);
  
  // Transform API response snake_case to form field names
  const defaultValues = getDefaultValues();
  
  // Extract and transform faculty cadre table by year
  const facultyCadreByYear = {};
  if (Array.isArray(savedData.b21_faculty_cadre_table)) {
    savedData.b21_faculty_cadre_table.forEach(item => {
      facultyCadreByYear[item.year] = {
        professors_phd_regular: item.professors_phd_regular || "",
        professors_phd_contract: item.professors_phd_contract || "",
        assoc_prof_phd_regular: item.assoc_prof_phd_regular || "",
        assoc_prof_phd_contract: item.assoc_prof_phd_contract || "",
        assistant_professors_regular: item.assistant_professors_regular || "",
        assistant_professors_contract: item.assistant_professors_contract || "",
        total_phd_faculty: item.total_phd_faculty || 0,
      };
    });
  }

  const initialValues = {
    id: savedData.id,
    b1_program_information: {
      program_name: program_name,
      year_of_start: savedData.b1_program_table?.[0]?.year_of_start || "",
      sanctioned_intake: savedData.b1_program_table?.[0]?.sanctioned_intake || "",
      increase_decrease: savedData.b1_program_table?.[0]?.increase_decrease || "",
      increase_decrease_year: savedData.b1_program_table?.[0]?.increase_decrease_year || "",
      aicte_approval_letter: savedData.b1_program_table?.[0]?.aicte_approval_letter || "",
      program_accredited: savedData.b1_program_table?.[0]?.program_accredited || "",
      accreditation_status: savedData.b1_program_table?.[0]?.accreditation_status || "Not accredited",
      accreditation_details: savedData.b1_program_table?.[0]?.accreditation_details || "",
    },

    b2a_faculty_details: Array.isArray(savedData.b2_faculty_details_table)
      ? savedData.b2_faculty_details_table.map(f => ({
          name: f.name || "",
          pan: f.pan || "",
          apaar_id: f.apaar_id || "",
          degree: f.degree || "",
          university: f.university || "",
          specialization: f.specialization || "",
          doj: f.doj || "",
          designation_join: f.designation_join || "",
          current_designation: f.current_designation || "",
          promotion_date: f.promotion_date || "",
          nature: f.nature || "Regular",
          full_part: f.full_part || "Full Time",
          associated: f.associated || "Y",
          date_leaving: f.date_leaving || "",
          exp_institute: f.exp_institute || "",
        }))
      : [],

    b21_department_name: savedData.department_name || "",
    b21_no_of_allied_departments: savedData.no_allied_departments || "",
    b21_no_of_ug_programs: savedData.no_ug_programs || "",
    b21_no_of_pg_programs: savedData.no_pg_programs || "",

    b21_faculty_cadre_table: {
      cay: facultyCadreByYear.cay || defaultValues.b21_faculty_cadre_table.cay,
      caym1: facultyCadreByYear.caym1 || defaultValues.b21_faculty_cadre_table.caym1,
    },

    b22_hod_details: {
      name: savedData.hod_name || "",
      nature_of_appointment: savedData.hod_nature_of_appointment || "",
      qualification: savedData.hod_qualification || "",
      qualification_other: savedData.hod_qualification_other || "",
    },

    b3_sfr_list: Array.isArray(savedData.b3_sfr_table)
      ? savedData.b3_sfr_table.map(sfr => ({
          type: sfr.type || "",
          name: sfr.name || "",
          a: sfr.a || "",
          b: sfr.b || "",
          c: sfr.c || "",
          d: sfr.d || "",
        }))
      : defaultValues.b3_sfr_list,

    sfr_summary: Array.isArray(savedData.sfr_summary)
      ? savedData.sfr_summary.map(summary => ({
          year: summary.year,
          students: summary.students || "",
          faculty: summary.faculty || "",
          sfr: summary.sfr || "",
        }))
      : defaultValues.sfr_summary,

    pre_visit_qualifiers: Array.isArray(savedData.pre_visit_qualifiers)
      ? savedData.pre_visit_qualifiers.map(pv => ({
          sn: pv.sn,
          description: pv.description,
          status: pv.status,
        }))
      : defaultValues.pre_visit_qualifiers,

    remarks: savedData.remarks || "",
  };

  console.log("Final initialValues:", initialValues);
  return initialValues;
};


  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-3xl font-bold text-blue-700">Loading Part B...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-6 py-10">
        <div className="mb-6 flex justify-between items-center max-w-[1200px] mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-[#2163c1] text-white rounded-xl font-medium shadow-lg hover:bg-[#1a4f9a] transition flex items-center gap-2"
          >
            ← Back
          </button>
          
          {/* Action Buttons */}
          <div className="flex gap-3">
            {isEditMode ? (
              <button
                onClick={() => setIsEditMode(false)}
                className="w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white bg-gray-600 hover:bg-gray-700 transition-all"
                title="Cancel Editing"
              >
                <X size={22} strokeWidth={2.5} />
              </button>
            ) : (
              <button
                onClick={() => setIsEditMode(true)}
                className="w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white bg-blue-600 hover:bg-blue-700 transition-all"
                title="Edit Part B"
              >
                <Edit size={22} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>

        {/* Main Form Container */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden relative max-w-[1200px] mx-auto">
          <div className="p-6 md:p-12">
            <div className="text-center mb-10">
              <h6 className="text-3xl font-bold text-gray-800 mb-3">
                PRE-QUALIFIER REPORT
              </h6>
              <h4 className="text-2xl font-semibold text-blue-700">
                PART B - Program Information
              </h4>
              <p className="text-lg text-gray-600 mt-3">{program_name} • {academic_year}</p>
            </div>


            <Formik
              initialValues={getInitialValues()}
              enableReinitialize
            onSubmit={async (values) => {
  setIsSaving(true);
  try {
    // Helper function to calculate total PhD faculty
    const calculateTotalPhd = (yearData) => {
      const regProf = parseInt(yearData.professors_phd_regular) || 0;
      const conProf = parseInt(yearData.professors_phd_contract) || 0;
      const regAssoc = parseInt(yearData.assoc_prof_phd_regular) || 0;
      const conAssoc = parseInt(yearData.assoc_prof_phd_contract) || 0;
      return regProf + conProf + regAssoc + conAssoc;
    };

    // Transform b21_faculty_cadre_table object → array with calculated total_phd_faculty
    const facultyCadreArray = [
      {
        year: "cay",
        ...values.b21_faculty_cadre_table.cay,
        total_phd_faculty: calculateTotalPhd(values.b21_faculty_cadre_table.cay),
      },
      {
        year: "caym1",
        ...values.b21_faculty_cadre_table.caym1,
        total_phd_faculty: calculateTotalPhd(values.b21_faculty_cadre_table.caym1),
      },
    ];

    // Map frontend field names to backend request field names in SNAKE_CASE
    const payload = {
      id: savedData?.id || null,
      college_id: college_id,
      program_id: program_id,
      cycle_id: parseInt(cycleId),
      
      // B1 – Program Info Table (array of rows)
      b1_program_table: [
        {
          program_name: values.b1_program_information?.program_name || program_name,
          year_of_start: values.b1_program_information?.year_of_start,
          sanctioned_intake: values.b1_program_information?.sanctioned_intake,
          increase_decrease: values.b1_program_information?.increase_decrease,
          increase_decrease_year: values.b1_program_information?.increase_decrease_year,
          aicte_approval_letter: values.b1_program_information?.aicte_approval_letter,
          program_accredited: values.b1_program_information?.program_accredited,
          accreditation_status: values.b1_program_information?.accreditation_status,
          accreditation_details: values.b1_program_information?.accreditation_details,
        }
      ],
      
      // B2 – Faculty Details Table
      b2_faculty_details_table: (values.b2a_faculty_details || []).map(faculty => ({
        name: faculty.name,
        pan: faculty.pan,
        apaar_id: faculty.apaar_id,
        degree: faculty.degree,
        university: faculty.university,
        specialization: faculty.specialization,
        doj: faculty.doj,
        designation_join: faculty.designation_join,
        current_designation: faculty.current_designation,
        promotion_date: faculty.promotion_date,
        nature: faculty.nature,
        full_part: faculty.full_part,
        associated: faculty.associated,
        date_leaving: faculty.date_leaving,
        exp_institute: faculty.exp_institute,
      })),
      
      pre_visit_qualifiers: (values.pre_visit_qualifiers || []).map(pv => ({
        sn: pv.sn,
        description: pv.description,
        status: pv.status,
      })),
      
      sfr_summary: (values.sfr_summary || []).map(summary => ({
        year: summary.year,
        students: summary.students,
        faculty: summary.faculty,
        sfr: summary.sfr,
      })),
      
      // B2.1 – Strings
      department_name: values.b21_department_name,
      no_allied_departments: values.b21_no_of_allied_departments,
      no_ug_programs: values.b21_no_of_ug_programs,
      no_pg_programs: values.b21_no_of_pg_programs,
      
      // B2.1 – Faculty Cadre Table
      b21_faculty_cadre_table: facultyCadreArray,
      
      // HOD Details
      hod_name: values.b22_hod_details?.name,
      hod_nature_of_appointment: values.b22_hod_details?.nature_of_appointment,
      hod_qualification: values.b22_hod_details?.qualification,  
      hod_qualification_other: values.b22_hod_details?.qualification_other,
      // B3 – Student Faculty Ratio Table
      b3_sfr_table: (values.b3_sfr_list || []).map(sfr => ({
        type: sfr.type,
        name: sfr.name,
        b: sfr.b,
        c: sfr.c,
        d: sfr.d,
        a: sfr.a,
      })),
      
      remarks: values.remarks,
    };

    const response = savedData?.id
      ? await newnbaPrequalifierService.saveNBAPrequalifierPartB(
          // savedData.id,
          payload
        )
      : await newnbaPrequalifierService.saveNBAPrequalifierPartB(payload);

    setSavedData(response);
    setIsEditMode(false);
    
    // Show SweetAlert success message
    setAlert(
      <SweetAlert
        success
        title="Success!"
        onConfirm={() => setAlert(null)}
        confirmBtnCssClass="btn-confirm"
      >
        Part B saved successfully!
      </SweetAlert>
    );
  } catch (err) {
    console.error(err);
    
    // Show SweetAlert error message
    setAlert(
      <SweetAlert
        danger
        title="Error!"
        onConfirm={() => setAlert(null)}
        confirmBtnCssClass="btn-confirm"
      >
        Failed to save Part B. Please try again.
      </SweetAlert>
    );
  } finally {
    setIsSaving(false);
  }
}}
            >
              {({ values, setFieldValue }) => {
                // Auto-calculate Total PhD Faculty - recalculates on every field change
                const calculateTotalPhd = (year) => {
                  const data = values.b21_faculty_cadre_table?.[year];
                  if (!data) return 0;
                  
                  const regProf = parseInt(data.professors_phd_regular) || 0;
                  const conProf = parseInt(data.professors_phd_contract) || 0;
                  const regAssoc = parseInt(data.assoc_prof_phd_regular) || 0;
                  const conAssoc = parseInt(data.assoc_prof_phd_contract) || 0;
                  
                  const total = regProf + conProf + regAssoc + conAssoc;
                  return total;
                };

                const totalPhdCAY = calculateTotalPhd("cay");
                const totalPhdCAYm1 = calculateTotalPhd("caym1");

                // Auto SFR Calculation
                const calculateSFR = (students, faculty) => {
                  const s = parseFloat(students) || 0;
                  const f = parseFloat(faculty) || 0;
                  return f > 0 ? (s / f).toFixed(2) : "-";
                };

                return (
                  <Form className="space-y-12">

                    {/* B1: Program Details */}
                    <div className="bg-gray-50 rounded-2xl p-6">
                      <h3 className="text-xl font-bold text-blue-700 mb-6">B1. Program Details</h3>
                      <table className="w-full border-collapse border border-gray-300 text-sm">
                        <tbody>
                          <tr><td className="border p-4 font-semibold bg-gray-50 w-72">Program Name</td><td className="border p-4">{program_name}</td></tr>
                          <tr><td className="border p-4 font-semibold bg-gray-50">Year of Start</td><td className="border p-4"><Field name="b1_program_information.year_of_start" disabled={!isEditMode} className="w-full p-3 border rounded" /></td></tr>
                          <tr><td className="border p-4 font-semibold bg-gray-50">Sanctioned Intake</td><td className="border p-4"><Field name="b1_program_information.sanctioned_intake" type="number" disabled={!isEditMode} className="w-full p-3 border rounded" /></td></tr>
                          <tr><td className="border p-4 font-semibold bg-gray-50">Increase/Decrease in Intake</td><td className="border p-4"><Field name="b1_program_information.increase_decrease" disabled={!isEditMode} className="w-full p-3 border rounded" /></td></tr>
                          <tr><td className="border p-4 font-semibold bg-gray-50">Year of Increase/Decrease</td><td className="border p-4"><Field name="b1_program_information.increase_decrease_year" disabled={!isEditMode} className="w-full p-3 border rounded" /></td></tr>
                          <tr><td className="border p-4 font-semibold bg-gray-50">AICTE Approval Letter No. & Date</td><td className="border p-4"><Field name="b1_program_information.aicte_approval_letter" disabled={!isEditMode} className="w-full p-3 border rounded" /></td></tr>
                          <tr>
                            <td className="border p-4 font-semibold bg-gray-50">Accreditation Status</td>
                            <td className="border p-4">
                              <Field as="select" name="b1_program_information.accreditation_status" disabled={!isEditMode} className="w-full p-3 border rounded">
                                <option value="Applying first time">Applying first time</option>
                                <option value="Granted 2/3 years">Granted accreditation for 2/3 years</option>
                                <option value="Granted 5/6 years">Granted accreditation for 5/6 years</option>
                                <option value="Not accredited">Not accredited</option>
                                <option value="Withdrawn">Withdrawn</option>
                                <option value="Not eligible">Not eligible for accreditation</option>
                              </Field>
                              {values.b1_program_information?.accreditation_status?.includes("Granted") && (
                                <div className="mt-3">
                                  <Field name="b1_program_information.accreditation_details" placeholder="e.g., 2023-2026" disabled={!isEditMode} className="w-full p-3 border rounded" />
                                </div>
                              )}
                            </td>
                          </tr>
                           <tr><td className="border p-4 font-semibold bg-gray-50">No. of times program accredited</td><td className="border p-4"><Field type="number" name="b1_program_information.program_accredited" disabled={!isEditMode} className="w-full p-3 border rounded" /></td></tr>
                        </tbody>
                      </table>
                    </div>

                    {/* B2.A Faculty Details - Wider & Readable */}
               <div className="bg-gray-50 rounded-2xl p-6">
                 <h3 className="text-xl font-bold text-blue-700 mb-6">B2.A Faculty Details (Department + Allied Departments)</h3>
                <FieldArray name="b2a_faculty_details">
                  {({ push, remove }) => (
                    <div className="space-y-10">

                      {/* Empty State */}
                      {(values.b2a_faculty_details || []).length === 0 ? (
                        <div className="text-center py-24 bg-gray-50 rounded-3xl border-4 border-dashed border-gray-300 text-2xl font-medium text-gray-500">
                          No faculty members added yet
                        </div>
                      ) : (

                        /* Each Faculty = One Card */
                        values.b2a_faculty_details.map((faculty, index) => (
                          <div
                            key={index}
                            className="relative bg-white rounded-3xl shadow-xl border border-gray-300 p-8 md:p-10 hover:shadow-2xl transition-all"
                          >
                            {/* Serial Number Badge */}
                            <div className="absolute -top-5 left-8 bg-blue-600 text-white font-bold text-2xl w-14 h-14 rounded-full flex items-center justify-center shadow-lg">
                              {index + 1}
                            </div>

                            {/* Delete Button */}
                            {isEditMode && (
                              <button
                                type="button"
                                onClick={() => remove(index)}
                                className="absolute top-6 right-6 bg-red-100 hover:bg-red-200 text-red-700 p-4 rounded-full transition transform hover:scale-110"
                              >
                                <Trash2 size={28} />
                              </button>
                            )}

                            {/* Responsive Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-6">

                              {/* 1. Name */}
                              <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Name</label>
                                <Field
                                  name={`b2a_faculty_details[${index}].name`}
                                  disabled={!isEditMode}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                                  placeholder="Enter full name"
                                />
                              </div>

                              {/* 2. PAN */}
                              <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">PAN</label>
                                <Field
                                  name={`b2a_faculty_details[${index}].pan`}
                                  disabled={!isEditMode}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-xl uppercase focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                                  placeholder="ABCPD1234E"
                                />
                              </div>

                              {/* 3. APAAR ID */}
                              <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">APAAR ID</label>
                                <Field
                                  name={`b2a_faculty_details[${index}].apaar_id`}
                                  disabled={!isEditMode}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                                  placeholder="1234-5678-9012"
                                />
                              </div>

                              {/* 4. Degree */}
                              <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Highest Degree</label>
                                <Field
                                  name={`b2a_faculty_details[${index}].degree`}
                                  disabled={!isEditMode}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                                  placeholder="Ph.D / M.Tech / B.E"
                                />
                              </div>

                              {/* 5. University */}
                              <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">University</label>
                                <Field
                                  name={`b2a_faculty_details[${index}].university`}
                                  disabled={!isEditMode}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                                  placeholder="University name"
                                />
                              </div>

                              {/* 6. Specialization */}
                              <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Specialization</label>
                                <Field
                                  name={`b2a_faculty_details[${index}].specialization`}
                                  disabled={!isEditMode}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                                  placeholder="e.g., Data Science"
                                />
                              </div>

                              {/* 7. Date of Joining */}
                              <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Date of Joining</label>
                                <Field
                                  name={`b2a_faculty_details[${index}].doj`}
                                  type="date"
                                  disabled={!isEditMode}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                                />
                              </div>

                              {/* 8. Designation at Joining */}
                              <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Designation at Joining</label>
                                <Field
                                  name={`b2a_faculty_details[${index}].designation_join`}
                                  disabled={!isEditMode}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                                  placeholder="Asst. Professor"
                                />
                              </div>

                              {/* 9. Current Designation */}
                              <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Current Designation</label>
                                <Field
                                  name={`b2a_faculty_details[${index}].current_designation`}
                                  disabled={!isEditMode}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                                  placeholder="Professor"
                                />
                              </div>

                              {/* 10. Date of Promotion */}
                              <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Date of Promotion</label>
                                <Field
                                  name={`b2a_faculty_details[${index}].promotion_date`}
                                  type="date"
                                  disabled={!isEditMode}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                                />
                              </div>

                              {/* 11. Nature of Appointment */}
                              <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Nature</label>
                                <Field
                                  as="select"
                                  name={`b2a_faculty_details[${index}].nature`}
                                  disabled={!isEditMode}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                                >
                                  <option value="Regular">Regular</option>
                                  <option value="Contract">Contract</option>
                                  <option value="Ad-hoc">Ad-hoc</option>
                                </Field>
                              </div>

                              {/* 12. Full Time / Part Time */}
                              <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Full/Part Time</label>
                                <Field
                                  as="select"
                                  name={`b2a_faculty_details[${index}].full_part`}
                                  disabled={!isEditMode}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                                >
                                  <option value="Full Time">Full Time</option>
                                  <option value="Part Time">Part Time</option>
                                </Field>
                              </div>

                              {/* 13. Associated (Y/N) */}
                              <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Associated with Program?</label>
                                <Field
                                  as="select"
                                  name={`b2a_faculty_details[${index}].associated`}
                                  disabled={!isEditMode}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                                >
                                  <option value="Y">Yes</option>
                                  <option value="N">No</option>
                                </Field>
                              </div>

                              {/* 14. Date of Leaving */}
                              <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Date of Leaving (if any)</label>
                                <Field
                                  name={`b2a_faculty_details[${index}].date_leaving`}
                                  type="date"
                                  disabled={!isEditMode}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                                />
                              </div>

                              {/* 15. Experience in Institute (Years) */}
                              <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Experience in Institute (Years)</label>
                                <Field
                                  name={`b2a_faculty_details[${index}].exp_institute`}
                                  type="number"
                                  disabled={!isEditMode}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                                  placeholder="e.g. 8"
                                />
                              </div>

                            </div>
                          </div>
                        ))
                      )}

                      {/* Add New Faculty Button */}
                    {isEditMode && (
                <div className="flex justify-center mt-10">
                  <button
                    type="button"
                    onClick={() =>
                      push({
                        name: "",
                        pan: "",
                        apaar_id: "",
                        degree: "",
                        university: "",
                        specialization: "",
                        doj: "",
                        designation_join: "",
                        current_designation: "",
                        promotion_date: "",
                        nature: "Regular",
                        full_part: "Full Time",
                        associated: "Y",
                        date_leaving: "",
                        exp_institute: ""
                      })
                    }
                    className="inline-flex items-center gap-3 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl active:scale-95"
                  >
                    <Plus size={24} />
                    Add New Faculty Member
                  </button>
                </div>
              )}
                    </div>
                  )}
                </FieldArray>
              </div>

                    {/* B2.1 Department & Cadre with Auto Total */}
                    <div className="bg-gray-50 rounded-2xl p-6">
                      <h3 className="text-xl font-bold text-blue-700 mb-6">B2.1 Department and Allied Departments</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                        <div><label className="block font-bold mb-2">Department Name</label><Field name="b21_department_name" disabled={!isEditMode} className="w-full p-4 border rounded-xl" /></div>
                        <div><label className="block font-bold mb-2">No. of Allied Departments</label><Field name="b21_no_of_allied_departments" type="number" disabled={!isEditMode} className="w-full p-4 border rounded-xl" /></div>
                        <div><label className="block font-bold mb-2">No. of UG Programs</label><Field name="b21_no_of_ug_programs" type="number" disabled={!isEditMode} className="w-full p-4 border rounded-xl" /></div>
                        <div><label className="block font-bold mb-2">No. of PG Programs</label><Field name="b21_no_of_pg_programs" type="number" disabled={!isEditMode} className="w-full p-4 border rounded-xl" /></div>
                      </div>

                      <h4 className="text-2xl font-bold text-blue-700 mb-6">Faculty Cadre Proportion</h4>
                    <table className="min-w-full border-collapse border border-gray-300 text-sm">
  <thead className="bg-blue-100">
    <tr>
      <th rowSpan={2} className="border px-6 py-4">S.N.</th>
      <th rowSpan={2} className="border px-6 py-4">Designation</th>
      <th colSpan={2} className="border px-6 py-4">CAY</th>
      <th colSpan={2} className="border px-6 py-4">CAYm1</th>
    </tr>
    <tr>
      <th className="border px-6 py-4">Regular</th>
      <th className="border px-6 py-4">Contract/Ad-hoc</th>
      <th className="border px-6 py-4">Regular</th>
      <th className="border px-6 py-4">Contract/Ad-hoc</th>
    </tr>
  </thead>

  {/* ===================== BODY ========================== */}
  <tbody>

    {/* ---------------- Professors with PhD ---------------- */}
    <tr>
      <td className="border px-6 py-4">1</td>
      <td className="border px-6 py-4">Professors with Ph.D</td>

      {/* CAY Regular */}
      <td className="border px-6 py-4">
        <Field
          name="b21_faculty_cadre_table.cay.professors_phd_regular"
          type="number"
          disabled={!isEditMode}
          className="w-full px-3 py-2 text-center border border-gray-300 rounded bg-white disabled:bg-gray-100"
        />
      </td>

      {/* CAY Contract */}
      <td className="border px-6 py-4">
        <Field
          name="b21_faculty_cadre_table.cay.professors_phd_contract"
          type="number"
          disabled={!isEditMode}
          className="w-full px-3 py-2 text-center border border-gray-300 rounded bg-white disabled:bg-gray-100"
        />
      </td>

      {/* CAYm1 Regular */}
      <td className="border px-6 py-4">
        <Field
          name="b21_faculty_cadre_table.caym1.professors_phd_regular"
          type="number"
          disabled={!isEditMode}
          className="w-full px-3 py-2 text-center border border-gray-300 rounded bg-white disabled:bg-gray-100"
        />
      </td>

      {/* CAYm1 Contract */}
      <td className="border px-6 py-4">
        <Field
          name="b21_faculty_cadre_table.caym1.professors_phd_contract"
          type="number"
          disabled={!isEditMode}
          className="w-full px-3 py-2 text-center border border-gray-300 rounded bg-white disabled:bg-gray-100"
        />
      </td>
    </tr>

    {/* ---------------- Assoc Professors with PhD ---------------- */}
    <tr>
      <td className="border px-6 py-4">2</td>
      <td className="border px-6 py-4">Assoc Professors with Ph.D</td>

      {/* CAY Regular */}
      <td className="border px-6 py-4">
        <Field
          name="b21_faculty_cadre_table.cay.assoc_prof_phd_regular"
          type="number"
          disabled={!isEditMode}
          className="w-full px-3 py-2 text-center border border-gray-300 rounded bg-white disabled:bg-gray-100"
        />
      </td>

      {/* CAY Contract */}
      <td className="border px-6 py-4">
        <Field
          name="b21_faculty_cadre_table.cay.assoc_prof_phd_contract"
          type="number"
          disabled={!isEditMode}
          className="w-full px-3 py-2 text-center border border-gray-300 rounded bg-white disabled:bg-gray-100"
        />
      </td>

      {/* CAYm1 Regular */}
      <td className="border px-6 py-4">
        <Field
          name="b21_faculty_cadre_table.caym1.assoc_prof_phd_regular"
          type="number"
          disabled={!isEditMode}
          className="w-full px-3 py-2 text-center border border-gray-300 rounded bg-white disabled:bg-gray-100"
        />
      </td>

      {/* CAYm1 Contract */}
      <td className="border px-6 py-4">
        <Field
          name="b21_faculty_cadre_table.caym1.assoc_prof_phd_contract"
          type="number"
          disabled={!isEditMode}
          className="w-full px-3 py-2 text-center border border-gray-300 rounded bg-white disabled:bg-gray-100"
        />
      </td>
    </tr>

    {/* ---------------- Assistant Professors ---------------- */}
    <tr>
      <td className="border px-6 py-4">3</td>
      <td className="border px-6 py-4">Assistant Professors</td>

      {/* CAY Regular */}
      <td className="border px-6 py-4">
        <Field
          name="b21_faculty_cadre_table.cay.assistant_professors_regular"
          type="number"
          disabled={!isEditMode}
          className="w-full px-3 py-2 text-center border border-gray-300 rounded bg-white disabled:bg-gray-100"
        />
      </td>

      {/* CAY Contract */}
      <td className="border px-6 py-4">
        <Field
          name="b21_faculty_cadre_table.cay.assistant_professors_contract"
          type="number"
          disabled={!isEditMode}
          className="w-full px-3 py-2 text-center border border-gray-300 rounded bg-white disabled:bg-gray-100"
        />
      </td>

      {/* CAYm1 Regular */}
      <td className="border px-6 py-4">
        <Field
          name="b21_faculty_cadre_table.caym1.assistant_professors_regular"
          type="number"
          disabled={!isEditMode}
          className="w-full px-3 py-2 text-center border border-gray-300 rounded bg-white disabled:bg-gray-100"
        />
      </td>

      {/* CAYm1 Contract */}
      <td className="border px-6 py-4">
        <Field
          name="b21_faculty_cadre_table.caym1.assistant_professors_contract"
          type="number"
          disabled={!isEditMode}
          className="w-full px-3 py-2 text-center border border-gray-300 rounded bg-white disabled:bg-gray-100"
        />
      </td>
    </tr>

    {/* ---------------- TOTAL PhD Faculty ---------------- */}
    <tr className="bg-blue-50 font-bold text-lg">
      <td className="border px-6 py-4">4</td>
      <td className="border px-6 py-4">Total Ph.D Faculty</td>

      <td colSpan={2} className="border px-6 py-4 text-center text-2xl font-bold text-blue-700 bg-blue-50">
        {totalPhdCAY}
      </td>

      <td colSpan={2} className="border px-6 py-4 text-center text-2xl font-bold text-blue-700 bg-blue-50">
        {totalPhdCAYm1}
      </td>
    </tr>

  </tbody>
</table>

                    </div>

                    {/* B2.2 HOD */}
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-blue-700 mb-6">B2.2 Head of Department</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                    
                    {/* 1. Name */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Name of HOD</label>
                      <Field
                        name="b22_hod_details.name"
                        disabled={!isEditMode}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                        placeholder="Enter HOD name"
                      />
                    </div>

                    {/* 2. Nature of Appointment */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Nature of Appointment</label>
                      <Field
                        as="select"
                        name="b22_hod_details.nature_of_appointment"
                        disabled={!isEditMode}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                      >
                        <option value="Regular">Regular</option>
                        <option value="Contract">Contract</option>
                        <option value="Ad-hoc">Ad-hoc</option>
                      </Field>
                    </div>

                    {/* 3. Highest Qualification */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Highest Qualification</label>
                      <Field
                        as="select"
                        name="b22_hod_details.qualification"
                        disabled={!isEditMode}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                      >
                        <option value="Ph.D.">Ph.D.</option>
                        <option value="ME/M.Tech">ME/M.Tech</option>
                        <option value="Other">Any other</option>
                      </Field>
                    </div>

                    {/* 4. Specify Other (Only if "Other" selected) */}
                    <div>
                      {values.b22_hod_details?.qualification === "Other" ? (
                        <>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Specify Qualification</label>
                          <Field
                            name="b22_hod_details.qualification_other"
                            disabled={!isEditMode}
                            placeholder="e.g., M.Sc., MBA, etc."
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                          />
                        </>
                      ) : (
                        // Placeholder to keep alignment when "Other" is not selected
                        <div className="h-[60px]"></div>
                      )}
                    </div>

                  </div>
                </div>

                    {/* B3 SFR with Auto Calculation */}
                  {/* B3. Student-Faculty Ratio - Clean, Professional, NBA-Style */}
{/* ----------------------- B3. Student-Faculty Ratio Section ----------------------- */}
<div className="bg-gray-50 rounded-2xl p-6">
  <h3 className="text-xl font-bold text-blue-700 mb-6">B3. Student-Faculty Ratio (SFR)</h3>
  <div className="space-y-12">

    <FieldArray name="b3_sfr_list">
      {({ push, remove }) => (
        <>

          {/* ================== UG PROGRAMS ================== */}
          <div className="bg-gray-50 rounded-2xl p-8 border">
            <h4 className="text-xl font-bold text-gray-800 mb-6 border-b pb-3">
              UG Programs – Student Details
            </h4>

            <div className="space-y-4">
              {values.b3_sfr_list
                ?.filter((item) => item.type === "UG")
                .map((item, idx) => {
                  const i = values.b3_sfr_list.indexOf(item); // actual index

                  return (
                    <div
                      key={i}
                      className="grid grid-cols-1 sm:grid-cols-6 gap-4 bg-white p-4 rounded-xl border shadow-sm"
                    >
                      {/* Program Name */}
                      <Field
                        name={`b3_sfr_list[${i}].name`}
                        placeholder="Program Name"
                        disabled={!isEditMode}
                        className="col-span-2 px-4 py-3 border rounded-lg"
                      />

                      {/* UG Year Fields */}
                      <Field
                        name={`b3_sfr_list[${i}].b`}
                        type="number"
                        placeholder="2nd Yr"
                        disabled={!isEditMode}
                        className="text-center px-4 py-3 border rounded-lg"
                      />
                      <Field
                        name={`b3_sfr_list[${i}].c`}
                        type="number"
                        placeholder="3rd Yr"
                        disabled={!isEditMode}
                        className="text-center px-4 py-3 border rounded-lg"
                      />
                      <Field
                        name={`b3_sfr_list[${i}].d`}
                        type="number"
                        placeholder="4th Yr"
                        disabled={!isEditMode}
                        className="text-center px-4 py-3 border rounded-lg"
                      />

                      {/* Remove */}
                      {isEditMode && (
                        <button
                          type="button"
                          onClick={() => remove(i)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={20} />
                        </button>
                      )}
                    </div>
                  );
                })}

              {/* Add UG Program */}
              {isEditMode && (
                <button
                  type="button"
                  onClick={() => push({ type: "UG", name: "", b: "", c: "", d: "" })}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  + Add UG Program
                </button>
              )}
            </div>
          </div>

          {/* ================== PG PROGRAMS ================== */}
          <div className="bg-gray-50 rounded-2xl p-8 border">
            <h4 className="text-xl font-bold text-gray-800 mb-6 border-b pb-3">
              PG Programs – Student Details
            </h4>

            <div className="space-y-4">
              {values.b3_sfr_list
                ?.filter((item) => item.type === "PG")
                .map((item, idx) => {
                  const i = values.b3_sfr_list.indexOf(item); // actual index

                  return (
                    <div
                      key={i}
                      className="grid grid-cols-1 sm:grid-cols-5 gap-4 bg-white p-4 rounded-xl border shadow-sm"
                    >
                      {/* Program Name */}
                      <Field
                        name={`b3_sfr_list[${i}].name`}
                        placeholder="Program Name"
                        disabled={!isEditMode}
                        className="col-span-2 px-4 py-3 border rounded-lg"
                      />

                      {/* PG Fields */}
                      <Field
                        name={`b3_sfr_list[${i}].a`}
                        type="number"
                        placeholder="1st Yr"
                        disabled={!isEditMode}
                        className="text-center px-4 py-3 border rounded-lg"
                      />
                      <Field
                        name={`b3_sfr_list[${i}].b`}
                        type="number"
                        placeholder="2nd Yr"
                        disabled={!isEditMode}
                        className="text-center px-4 py-3 border rounded-lg"
                      />

                      {/* Remove */}
                      {isEditMode && (
                        <button
                          type="button"
                          onClick={() => remove(i)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={20} />
                        </button>
                      )}
                    </div>
                  );
                })}

              {/* Add PG Program */}
              {isEditMode && (
                <button
                  type="button"
                  onClick={() => push({ type: "PG", name: "", a: "", b: "" })}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-teal-700"
                >
                  + Add PG Program
                </button>
              )}
            </div>
          </div>

        </>
      )}
    </FieldArray>

    {/* ================== SFR SUMMARY TABLE ================== */}
    <div className="bg-white rounded-2xl border shadow-lg overflow-hidden">
      <h4 className="text-2xl font-bold text-center text-blue-800 py-6 bg-blue-50 border-b">
        Student-Faculty Ratio (SFR) – Summary
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-3">
        {values.sfr_summary.map((item, index) => {
          const sfr =
            item.faculty > 0 ? (item.students / item.faculty).toFixed(2) : "-";

          return (
            <div key={index} className="border-r last:border-r-0 border-b md:border-b-0">
              <div className="p-8 text-center">

                <h5 className="text-lg font-bold text-gray-700 uppercase tracking-wider">
                  {item.year === "cay"
                    ? "Current Year (CAY)"
                    : item.year === "caym1"
                    ? "CAY − 1"
                    : "CAY − 2"}
                </h5>

                <div className="mt-6 space-y-5">

                  {/* Students */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Total Students</label>
                    <Field
                      name={`sfr_summary[${index}].students`}
                      type="number"
                      disabled={!isEditMode}
                      className="mt-2 w-full max-w-xs mx-auto px-5 py-3 text-xl font-semibold text-center border-2 rounded-lg"
                    />
                  </div>

                  {/* Faculty */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Total Faculty</label>
                    <Field
                      name={`sfr_summary[${index}].faculty`}
                      type="number"
                      disabled={!isEditMode}
                      className="mt-2 w-full max-w-xs mx-auto px-5 py-3 text-xl font-semibold text-center border-2 rounded-lg"
                    />
                  </div>

                  {/* SFR */}
                  <div className="pt-4 border-t-2 border-gray-200">
                    <div className="text-sm text-gray-600">SFR</div>
                    <div className="text-4xl font-bold text-blue-700 mt-2">
                      {sfr}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>

  </div>
</div>



                    {/* Pre-Visit Qualifiers */}
                    <div className="bg-gray-50 rounded-2xl p-6">
                      <h3 className="text-xl font-bold text-blue-700 mb-6">Compliance Status to Pre-Visit Qualifiers</h3>
                      <table className="min-w-full border-collapse border border-gray-300">
                        <thead className="bg-blue-100">
                          <tr>
                            <th className="border px-6 py-5 w-20">S.N.</th>
                            <th className="border px-6 py-5">Pre-Visit Qualifier</th>
                            <th className="border px-6 py-5 w-64">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(values.pre_visit_qualifiers || []).map((item, i) => (
                            <tr key={i}>
                              <td className="border px-6 py-5 text-center font-bold">{item.sn}</td>
                              <td className="border px-6 py-5">{item.description}</td>
                              <td className="border px-6 py-5">
                                <Field as="select" name={`pre_visit_qualifiers[${i}].status`} disabled={!isEditMode} className="w-full p-3 border rounded-lg">
                                  <option>Complied</option>
                                  <option>Not Complied</option>
                                </Field>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Remarks Section */}
                    <div className="bg-gray-50 rounded-2xl p-6">
                      <h3 className="text-xl font-bold text-blue-700 mb-6">Remarks</h3>
                      <div>
                        <label className="block font-bold text-gray-700 mb-2">Additional Remarks</label>
                        <Field
                          as="textarea"
                          name="remarks"
                          disabled={!isEditMode}
                          rows="6"
                          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-300 disabled:bg-gray-50 resize-none"
                          placeholder="Enter any additional remarks or observations..."
                        />
                      </div>
                    </div>


                    {isEditMode && (
                      <div className="text-center pt-10">
                        <button type="submit" disabled={isSaving} className="px-16 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl rounded-xl shadow-xl transition disabled:opacity-70">
                          {isSaving ? "Saving..." : "Save"}
                        </button>
                      </div>
                    )}
                  </Form>
                );
              }}
            </Formik>
          </div>
        </div>
      </div>
      {alert}
    </div>
  );
};


<style jsx>{`
  .table-sm { font-size: 0.775rem; line-height: 1.4; }
  .table-sm th { font-size: 0.70rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
  .table-sm td { padding: 0.5rem 0.75rem; }
  .table-sm input, .table-sm select { 
    font-size: 0.775rem !important; 
    padding: 0.4rem 0.5rem !important; 
  }
`}</style>

export default ViewPrequalifierPartBOptimized;