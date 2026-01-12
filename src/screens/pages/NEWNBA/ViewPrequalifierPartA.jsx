import React, { useState, useEffect } from "react";
import { Formik, Form, Field, FieldArray } from "formik";
import { useLocation, useNavigate } from "react-router-dom";
import { Edit, Save, Trash2, X } from "lucide-react";
import { newnbaPrequalifierService } from "./Services/NewNBA-Prequalifier.service.js";
import SweetAlert from 'react-bootstrap-sweetalert';

const ViewPrequalifierPartA = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const cycleId = location.state?.cycleId;

  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  const [savedData, setSavedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allPrograms, setAllPrograms] = useState([]);

  // Step 1: Fetch all programs
  useEffect(() => {
    const fetchPrograms = async () => {
      console.log("Fetching all programs...");
      try {
        const response = await newnbaPrequalifierService.getAllprogram();
        console.log("All programs response:", response);

        const programs = response?.data || response || [];
        console.log("Processed programs array:", programs);

        setAllPrograms(Array.isArray(programs) ? programs : []);
      } catch (err) {
        console.error("Failed to fetch programs:", err);
        setAllPrograms([]);
      }
    };
    fetchPrograms();
  }, []);

  // Step 2: Fetch saved Part A data
  useEffect(() => {
    const fetchPartA = async () => {
      if (!cycleId) {
        console.log("No cycleId, skipping fetchPartA");
        setLoading(false);
        return;
      }

      console.log("Fetching Part A for cycleId:", cycleId);
      try {
        setLoading(true);
        const response = await newnbaPrequalifierService.getNBAPrequalifierPartA(cycleId);
        console.log("Saved Part A response:", response);

        if (response && response.id) {
          console.log("Saved data found, setting savedData");
          setSavedData(response);
        } else {
          console.log("No saved data found");
          setSavedData(null);
        }
      } catch (err) {
        console.log("Error fetching Part A:", err.response?.status, err.message);
        setSavedData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPartA();
  }, [cycleId]);

  // Step 3: Initial values with proper programId
  const getInitialValues = () => {
    console.log("getInitialValues called, savedData:", savedData);

    if (!savedData) {
      console.log("No savedData → returning empty form");
      return {
        programId: "",
        programName: "",
        instituteName: "",
        yearOfEstablishment: "",
        location: "",
        city: "",
        state: "",
        pinCode: "",
        website: "",
        email: "",
        phone: "",
        headName: "",
        headDesignation: "",
        headStatus: "",
        headMobile: "",
        headEmail: "",
        universityName: "",
        institution_types: "",
        institution_types_other: "",
        remarks: "",
        ownership_types: "",
        ownership_types_other: "",
        numUGPrograms: 0,
        numPGPrograms: 0,
        programs_offered: [],
        programs_applied: [],
        allied_departments: [{ cluster_id: "", departments: "" }],
      };
    }

    const instType = savedData.institution_types?.[0];
    const ownerType = savedData.ownership_types?.[0];

    console.log("Returning saved data with programId:", savedData.program_id);

    return {
      programId: savedData.program_id || "",
      programName: savedData.program_name || "",
      instituteName: savedData.name_of_institute?.find(n => n.label === "institute_name")?.value || "",
      yearOfEstablishment: savedData.name_of_institute?.find(n => n.label === "year_of_establishment")?.value || "",
      location: savedData.institute_address?.[0]?.address_line || "",
      city: savedData.institute_address?.[0]?.city || "",
      state: savedData.institute_address?.[0]?.state || "",
      pinCode: savedData.institute_address?.[0]?.pincode || "",
      website: savedData.institute_address?.[0]?.website || "",
      email: savedData.institute_address?.[0]?.email || "",
      phone: savedData.institute_address?.[0]?.phone || "",
      headName: savedData.institution_head_details?.[0]?.name || "",
      headDesignation: savedData.institution_head_details?.[0]?.designation || "",
      headStatus: savedData.institution_head_details?.[0]?.status || "",
      headMobile: savedData.institution_head_contact_details?.[0]?.phone || "",
      headEmail: savedData.institution_head_contact_details?.[0]?.email || "",
      universityName: savedData.affiliated_university_details?.[0]?.university || "",
      institution_types: instType?.type === "Any Other" ? "OTHER" : instType?.type || "",
      institution_types_other: instType?.type === "Any Other" ? instType?.other || "" : "",
      ownership_types: ownerType?.type === "Any Other" ? "OTHER" : ownerType?.type || "",
      ownership_types_other: ownerType?.type === "Any Other" ? ownerType?.other || "" : "",
      numUGPrograms: parseInt(savedData.no_ug_programs) || 0,
      numPGPrograms: parseInt(savedData.no_pg_programs) || 0,
      programs_offered: (savedData.programs_offered || []).map(p => ({
        level: p.level || "UG",
        programName: p.program_name || "",
        startYear: p.year_of_start || "",
        endYear: p.year_of_end || "",
        departmentName: p.department || "",
      })),
      programs_applied: (savedData.programs_applied || []).map(p => ({
        clusterId: p.cluster_id || "",
        departmentName: p.department || "",
        programName: p.program_name || "",
      })),
      allied_departments: savedData.allied_departments?.length > 0
        ? savedData.allied_departments.map(d => ({
          cluster_id: d.cluster_id || "",
          departments: d.departments || "",
        }))
        : [{ cluster_id: "", departments: "" }],
      remarks: savedData.remarks || "",
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-2xl font-bold text-blue-700">Loading Part A...</div>
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
                title="Edit Part A"
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
                PART A - Profile of the Institute
              </h4>
            </div>
            <Formik
              initialValues={getInitialValues()}
              enableReinitialize={true}
              onSubmit={async (values) => {
                console.log("Form submitting with values:", values);
                setIsSaving(true);
                try {
                  const payload = {
                    cycle_id: cycleId,
                    program_id: values.programId,
                    program_name: values.programName,
                    name_of_institute: [
                      { label: "institute_name", value: values.instituteName },
                      { label: "year_of_establishment", value: values.yearOfEstablishment }
                    ],
                    institute_address: [{
                      address_line: values.location,
                      city: values.city,
                      state: values.state,
                      pincode: values.pinCode,
                      website: values.website,
                      email: values.email,
                      phone: values.phone,
                    }],
                    institution_head_details: [
                      { name: values.headName, designation: values.headDesignation, status: values.headStatus }
                    ],
                    institution_head_contact_details: [{ phone: values.headMobile, email: values.headEmail }],
                    affiliated_university_details: [{ university: values.universityName }],
                    institution_types: [
                      {
                        type:
                          values.institution_types === "OTHER"
                            ? "Any Other"
                            : values.institution_types,
                        other:
                          values.institution_types === "OTHER"
                            ? values.institution_types_other
                            : ""
                      }
                    ],
                    ownership_types: [
                      {
                        type:
                          values.ownership_types === "OTHER"
                            ? "Any Other"
                            : values.ownership_types,
                        other:
                          values.ownership_types === "OTHER"
                            ? values.ownership_types_other
                            : ""
                      }
                    ],
                    no_ug_programs: values.numUGPrograms.toString(),
                    no_pg_programs: values.numPGPrograms.toString(),
                    programs_offered: values.programs_offered.map(p => ({
                      level: p.level,
                      program_name: p.programName,
                      year_of_start: p.startYear,
                      year_of_end: p.endYear || "",
                      department: p.departmentName || "",
                    })),
                    programs_applied: values.programs_applied.map(p => ({
                      program_name: p.programName,
                      cluster_id: p.clusterId,
                      department: p.departmentName || "",
                    })),
                    allied_departments: values.allied_departments
                      .filter(d => d.cluster_id?.trim() && d.departments?.trim())
                      .map(d => ({ cluster_id: d.cluster_id, departments: d.departments })),
                  };

                  console.log("Payload being sent:", payload);

                  let response;
                  if (savedData && savedData.id) {
                    response = await newnbaPrequalifierService.putNBAPrequalifierPartA(savedData.id, payload);
                  } else {
                    response = await newnbaPrequalifierService.saveNBAPrequalifierPartA(payload);
                  }

                  console.log("Save response:", response);
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
                      Part A saved successfully!
                    </SweetAlert>
                  );
                } catch (err) {
                  console.error("Save error:", err);

                  // Show SweetAlert error message
                  setAlert(
                    <SweetAlert
                      danger
                      title="Error!"
                      onConfirm={() => setAlert(null)}
                      confirmBtnCssClass="btn-confirm"
                    >
                      {err.response?.data?.message || err.message || "Failed to save Part A. Please try again."}
                    </SweetAlert>
                  );
                } finally {
                  setIsSaving(false);
                }
              }}
            >
              {({ values, setFieldValue }) => {
                // Step 4: Program change handler with full logging
                const handleProgramChange = (e) => {
                  const selectedId = e.target.value;
                  console.log("Program selected with ID:", selectedId);

                  if (!selectedId) {
                    setFieldValue("programId", "");
                    setFieldValue("programName", "");
                    setFieldValue("programs_offered", []);
                    setFieldValue("programs_applied", []);
                    return;
                  }

                  const selectedProgram = allPrograms.find(p =>
                    String(p.program_id || p.id) === String(selectedId)
                  );

                  if (!selectedProgram) return;

                  const college = selectedProgram.college || {};

                  // Basic Fields
                  setFieldValue("programId", selectedProgram.program_id || selectedProgram.id);
                  setFieldValue("programName", selectedProgram.program_name || "");
                  setFieldValue("instituteName", college.college_name || "");
                  setFieldValue("yearOfEstablishment", college.year_of_establishment || "");
                  setFieldValue("location", college.college_address || "");
                  setFieldValue("city", college.city || "");
                  setFieldValue("state", college.state || "");
                  setFieldValue("pinCode", college.pin_code || "");
                  setFieldValue("website", college.website || "");
                  setFieldValue("email", college.college_email || "");
                  setFieldValue("phone", college.college_phone || college.phone || "");
                  setFieldValue("headName", college.head_name || "");
                  setFieldValue("headDesignation", college.head_designation || "");
                  setFieldValue("headStatus", college.head_status || "");
                  setFieldValue("headMobile", college.head_mobile || "");
                  setFieldValue("headEmail", college.head_email || "");
                  setFieldValue("universityName", college.university_name || "");
                  setFieldValue("institution_types", college.institution_type || "");
                  setFieldValue("ownership_types", college.ownership_status || "");
                  setFieldValue("numUGPrograms", college.no_ug_programs || 0);
                  setFieldValue("numPGPrograms", college.no_pg_programs || 0);

                  // A6: All programs offered by the same college
                  const allOfferedPrograms = allPrograms
                    .filter(p => p.college?.college_name === college.college_name)
                    .map(p => ({
                      level: p.program_level === "Bachelor" ? "UG" : p.program_level === "Master" ? "PG" : "UG",
                      programName: p.program_name || "",
                      startYear: p.start_year || "",
                      endYear: p.end_year || "",
                      departmentName: p.department || "N/A",
                    }));

                  setFieldValue("programs_offered", allOfferedPrograms);

                  // A7: Only selected program applied
                  setFieldValue("programs_applied", [{
                    clusterId: selectedProgram.cluster_id || "101",
                    departmentName: selectedProgram.department || "Electrical Engineering",
                    programName: selectedProgram.program_name || "",
                  }]);

                  console.log("All auto-fill done!");
                };

                return (
                  <Form className="space-y-8">

                    {/* Program Selection */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-200">
                      <label className="block text-lg md:text-xl font-bold text-gray-800 mb-4 text-center">
                        Select Program Applied For Accreditation
                      </label>
                      <Field
                        as="select"
                        name="programId"
                        value={values.programId}
                        onChange={handleProgramChange}
                        className="w-full px-5 py-4 text-base md:text-lg font-medium text-blue-700 bg-white border-2 border-blue-400 rounded-xl focus:ring-4 focus:ring-blue-300"
                        disabled={!isEditMode}
                      >
                        <option value="">-- Select Program --</option>
                        {allPrograms.map((p) => {
                          const id = p.program_id || p.id;
                          const name = p.program_name || "Unknown";
                          const code = p.program_code || "";
                          return (
                            <option key={id} value={id}>
                              {name} {code ? `(${code})` : ""}
                            </option>
                          );
                        })}
                      </Field>
                      {console.log("Current programId in form:", values.programId)}
                    </div>

                    {/* A1 */}
                    <div className="bg-gray-50 rounded-2xl p-6">
                      <h3 className="text-xl font-bold text-blue-700 mb-6">A1. Name and address of the Institute</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div><label className="block font-bold text-gray-700 mb-2">Name of Institute</label><Field name="instituteName" className="w-full p-3 border rounded-lg" disabled={!isEditMode} /></div>
                        <div><label className="block font-bold text-gray-700 mb-2">Year of Establishment</label><Field name="yearOfEstablishment" className="w-full p-3 border rounded-lg" disabled={!isEditMode} /></div>
                        <div><label className="block font-bold text-gray-700 mb-2">Location</label><Field name="location" className="w-full p-3 border rounded-lg" disabled={!isEditMode} /></div>
                      </div>
                    </div>

                    {/* A2 */}
                    <div className="bg-gray-50 rounded-2xl p-6">
                      <h3 className="text-xl font-bold text-blue-700 mb-6">A2. Address of the Institute</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div><label className="block font-bold text-gray-700 mb-2">City</label><Field name="city" className="w-full p-3 border rounded-lg" disabled={!isEditMode} /></div>
                        <div><label className="block font-bold text-gray-700 mb-2">State</label><Field name="state" className="w-full p-3 border rounded-lg" disabled={!isEditMode} /></div>
                        <div><label className="block font-bold text-gray-700 mb-2">Pin Code</label><Field name="pinCode" className="w-full p-3 border rounded-lg" disabled={!isEditMode} /></div>
                        <div><label className="block font-bold text-gray-700 mb-2">Website</label><Field name="website" placeholder="https://college.edu.in" className="w-full p-3 border rounded-lg" disabled={!isEditMode} /></div>
                        <div><label className="block font-bold text-gray-700 mb-2">Email</label><Field name="email" type="email" className="w-full p-3 border rounded-lg" disabled={!isEditMode} /></div>
                        <div><label className="block font-bold text-gray-700 mb-2">Phone</label><Field name="phone" className="w-full p-3 border rounded-lg" disabled={!isEditMode} /></div>
                      </div>
                    </div>

                    {/* A3 */}
                    <div className="bg-gray-50 rounded-2xl p-6">
                      <h3 className="text-xl font-bold text-blue-700 mb-6">A3. Name and contact details of the Head of the Institution</h3>
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                          <div><label className="block font-bold mb-2">Head Name</label><Field name="headName" className="w-full p-3 border rounded-lg" disabled={!isEditMode} /></div>
                          <div><label className="block font-bold mb-2">Designation</label><Field name="headDesignation" className="w-full p-3 border rounded-lg" disabled={!isEditMode} /></div>
                          <div><label className="block font-bold mb-2">Status</label><Field name="headStatus" className="w-full p-3 border rounded-lg" disabled={!isEditMode} /></div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                          <div><label className="block font-bold mb-2">Mobile</label><Field name="headMobile" className="w-full p-3 border rounded-lg" disabled={!isEditMode} /></div>
                          <div><label className="block font-bold mb-2">Email</label><Field name="headEmail" className="w-full p-3 border rounded-lg" disabled={!isEditMode} /></div>
                          <div><label className="block font-bold mb-2">University Name</label><Field name="universityName" className="w-full p-3 border rounded-lg" disabled={!isEditMode} /></div>
                        </div>
                      </div>
                    </div>

                    {/* A4 */}
                    <div className="bg-gray-50 rounded-2xl p-6">
                      <h3 className="text-xl font-bold text-blue-700 mb-6">A4. Type of Institution & Ownership Status</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div>
                          <label className="block font-bold mb-2">Type of Institution</label>
                          <Field as="select" name="institution_types" className="w-full p-3 border rounded-lg" disabled={!isEditMode}>
                            <option value="">Select</option>
                            <option value="Institute of National Importance">Institute of National Importance</option>
                            <option value="Deemed to be University">Deemed to be University</option>
                            <option value="University">University</option>
                            <option value="Autonomous">Autonomous</option>
                            <option value="Non-Autonomous (Affiliated)">Non-Autonomous (Affiliated)</option>
                            <option value="OTHER">Any Other (Please specify*)</option>
                          </Field>
                          {values.institution_types === "OTHER" && (
                            <Field
                              name="institution_types_other"
                              placeholder="Please specify other institution type"
                              className="w-full mt-3 p-3 border rounded-lg"
                              disabled={!isEditMode}
                            />
                          )}
                        </div>
                        <div>
                          <label className="block font-bold mb-2">Ownership Status</label>
                          <Field as="select" name="ownership_types" className="w-full p-3 border rounded-lg" disabled={!isEditMode}>
                            <option value="">Select</option>
                            <option value="Central Government">Central Government</option>
                            <option value="State Government">State Government</option>
                            <option value="Grant-in-Aid">Grant-in-Aid</option>
                            <option value="Self-financing Trust">Self-financing Trust</option>
                            <option value="OTHER">Any Other (Please specify*)</option>
                          </Field>
                          {values.ownership_types === "OTHER" && (
                            <Field
                              name="ownership_types_other"
                              placeholder="Please specify ownership status"
                              className="w-full mt-3 p-3 border rounded-lg"
                              disabled={!isEditMode}
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* A5 */}
                    <div className="bg-gray-50 rounded-2xl p-6">
                      <h3 className="text-xl font-bold text-blue-700 mb-6">A5. Number of UG and PG Programs Offered</h3>
                      <div className="flex gap-10">
                        <div>
                          <label className="block font-bold">UG Programs</label>
                          <Field name="numUGPrograms" type="number" className="w-24 p-3 border rounded-lg mt-2" disabled={!isEditMode} />
                        </div>
                        <div>
                          <label className="block font-bold">PG Programs</label>
                          <Field name="numPGPrograms" type="number" className="w-24 p-3 border rounded-lg mt-2" disabled={!isEditMode} />
                        </div>
                      </div>
                    </div>


                    {/* A6 - Programs Offered (Auto-filled) */}
                    <div className="bg-gray-50 rounded-2xl p-6 overflow-x-auto">
                      <h3 className="text-xl font-bold text-blue-700 mb-6">A6. Programs Offered by the Institute</h3>
                      <FieldArray name="programs_offered">
                        {({ push, remove }) => (
                          <>
                            <table className="min-w-full border-collapse border border-gray-300 text-sm">
                              <thead>
                                <tr className="bg-blue-100">
                                  <th className="border px-4 py-2">S.No</th>
                                  <th className="border px-4 py-2">Level</th>
                                  <th className="border px-4 py-2">Program Name</th>
                                  <th className="border px-4 py-2">Start Year</th>
                                  <th className="border px-4 py-2">End Year</th>
                                  <th className="border px-4 py-2">Department</th>
                                  {isEditMode && <th className="border px-4 py-2">Action</th>}
                                </tr>
                              </thead>
                              <tbody>
                                {values.programs_offered.length === 0 ? (
                                  <tr><td colSpan={isEditMode ? 7 : 6} className="text-center py-4 text-gray-500 border">No programs offered</td></tr>
                                ) : (
                                  values.programs_offered.map((p, i) => (
                                    <tr key={i}>
                                      <td className="border px-4 py-2 text-center">{i + 1}</td>
                                      <td className="border px-4 py-2">
                                        <Field as="select" name={`programs_offered[${i}].level`} className="w-full p-1" disabled={!isEditMode}>
                                          <option>UG</option><option>PG</option>
                                        </Field>
                                      </td>
                                      <td className="border px-4 py-2"><Field name={`programs_offered[${i}].programName`} className="w-full p-1" disabled={!isEditMode} /></td>
                                      <td className="border px-4 py-2"><Field name={`programs_offered[${i}].startYear`} className="w-full p-1" disabled={!isEditMode} /></td>
                                      <td className="border px-4 py-2"><Field name={`programs_offered[${i}].endYear`} className="w-full p-1" disabled={!isEditMode} /></td>
                                      <td className="border px-4 py-2"><Field name={`programs_offered[${i}].departmentName`} className="w-full p-1" disabled={!isEditMode} /></td>
                                      {isEditMode && (
                                        <td className="border px-4 py-2 text-center">
                                          <button type="button" onClick={() => remove(i)} className="text-red-600 hover:text-red-800 inline-flex items-center">
                                            <Trash2 size={18} />
                                          </button>
                                        </td>
                                      )}
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                            {isEditMode && (
                              <button type="button" onClick={() => push({ level: "UG", programName: "", startYear: "", endYear: "", departmentName: "" })}
                                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                + Add Program
                              </button>
                            )}
                          </>
                        )}
                      </FieldArray>
                    </div>

                    {/* A7 - Programs Applied (Auto-filled with selected program) */}
                    <div className="bg-gray-50 rounded-2xl p-6 overflow-x-auto">
                      <h3 className="text-xl font-bold text-blue-700 mb-6">A7. Programs Applied for Accreditation</h3>
                      <FieldArray name="programs_applied">
                        {({ push, remove }) => (
                          <>
                            <table className="min-w-full border-collapse border border-gray-300 text-sm">
                              <thead>
                                <tr className="bg-blue-100">
                                  <th className="border px-4 py-2">Cluster ID</th>
                                  <th className="border px-4 py-2">Department</th>
                                  <th className="border px-4 py-2">Program Name</th>
                                  {isEditMode && <th className="border px-4 py-2">Action</th>}
                                </tr>
                              </thead>
                              <tbody>
                                {values.programs_applied.length === 0 ? (
                                  <tr><td colSpan={isEditMode ? 4 : 3} className="text-center py-4 text-gray-500 border">No programs applied</td></tr>
                                ) : (
                                  values.programs_applied.map((p, i) => (
                                    <tr key={i}>
                                      <td className="border px-4 py-2"><Field name={`programs_applied[${i}].clusterId`} className="w-full p-1" disabled={!isEditMode} /></td>
                                      <td className="border px-4 py-2"><Field name={`programs_applied[${i}].departmentName`} className="w-full p-1" disabled={!isEditMode} /></td>
                                      <td className="border px-4 py-2"><Field name={`programs_applied[${i}].programName`} className="w-full p-1" disabled={!isEditMode} /></td>
                                      {isEditMode && i > 0 && (
                                        <td className="border px-4 py-2 text-center">
                                          <button type="button" onClick={() => remove(i)} className="text-red-600 hover:text-red-800 inline-flex items-center">
                                            <Trash2 size={18} />
                                          </button>
                                        </td>
                                      )}
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                            {isEditMode && values.programs_applied.length && (
                              <button type="button" onClick={() => push({ clusterId: "", departmentName: "", programName: "" })}
                                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                + Add Applied Program
                              </button>
                            )}
                          </>
                        )}
                      </FieldArray>
                    </div>

                    {/* A8 - Allied Departments */}
                    <div className="bg-gray-50 rounded-2xl p-6">
                      <h3 className="text-xl font-bold text-blue-700 mb-6">A8. Allied Departments</h3>
                      <FieldArray name="allied_departments">
                        {({ push, remove }) => (
                          <div className="space-y-4">
                            {values.allied_departments.map((dept, index) => (
                              <div key={index} className="flex gap-4 items-end bg-white p-4 rounded-lg border">
                                <div className="flex-1">
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Cluster ID</label>
                                  <Field name={`allied_departments[${index}].cluster_id`} className="w-full px-4 py-2 border rounded-lg" disabled={!isEditMode} placeholder="101" />
                                </div>
                                <div className="flex-[2]">
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Departments (comma separated)</label>
                                  <Field name={`allied_departments[${index}].departments`} className="w-full px-4 py-2 border rounded-lg" disabled={!isEditMode} placeholder="CSE, IT, AIDS" />
                                </div>
                                {isEditMode && values.allied_departments.length > 1 && (
                                  <button type="button" onClick={() => remove(index)} className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 inline-flex items-center">
                                    <Trash2 size={20} />
                                  </button>
                                )}
                              </div>
                            ))}
                            {isEditMode && (
                              <button type="button" onClick={() => push({ cluster_id: "", departments: "" })} className="w-full mt-4 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                                + Add Allied Department
                              </button>
                            )}
                          </div>
                        )}
                      </FieldArray>
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

                    {/* Save Button */}
                    {isEditMode && (
                      <div className="text-center pt-10">
                        <button
                          type="submit"
                          disabled={isSaving}
                          className="px-16 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl rounded-xl shadow-xl transition disabled:opacity-70"
                        >
                          {isSaving ? "Saving..." : (savedData ? "Update" : "Save")}
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

export default ViewPrequalifierPartA;