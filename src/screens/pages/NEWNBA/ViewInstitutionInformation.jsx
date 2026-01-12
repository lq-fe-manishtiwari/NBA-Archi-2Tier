import React, { useState, useEffect } from "react";
import { Formik, Form, Field, FieldArray } from "formik";
import { Link, useLocation } from "react-router-dom";
import { Edit, Trash2, Plus } from "lucide-react";
import { newnbaPrequalifierService } from "./Services/NewNBA-Prequalifier.service.js";
import SweetAlert from "react-bootstrap-sweetalert";

const ViewInstitutionInformation = () => {
  const location = useLocation();
  const cycleId = location.state?.cycleId;

  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [alert, setAlert] = useState(null);
  const [savedData, setSavedData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!cycleId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await newnbaPrequalifierService.getNBAPartAInstitutional(cycleId);
        if (response && response.id) {
          setSavedData(response);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [cycleId]);

  const initialValues = {
    // 1. Name and Address
    instituteName: savedData?.instituteName || "",
    instituteAddress: savedData?.instituteAddress || "",
    city: savedData?.city || "",
    state: savedData?.state || "",
    pincode: savedData?.pincode || "",
    website: savedData?.website || "",
    phone: savedData?.phone || "",
    email: savedData?.email || "",

    // 2. Type of Institution
    institutionType: savedData?.institutionType || "",
    institutionTypeOther: savedData?.institutionTypeOther || "",
    autonomousYear: savedData?.autonomousYear || "",
    autonomousDuration: savedData?.autonomousDuration || "",

    // 3. Year of Establishment
    yearOfEstablishment: savedData?.yearOfEstablishment || "",

    // 4. Ownership Status
    ownershipStatus: savedData?.ownershipStatus || "",
    ownershipOther: savedData?.ownershipOther || "",

    // 5. Affiliating University
    affiliatingUniversity: savedData?.affiliatingUniversity || "",

    // 6. Other Institutions (Table A6)
    otherInstitutions: savedData?.otherInstitutions || [],

    // 7. All Programs Offered (Table A7)
    allPrograms: savedData?.allPrograms || [],

    // 8. Programs for Accreditation (A8.1)
    programsForAccreditation: savedData?.programsForAccreditation || [],

    // 8. Allied Departments (A8.2)
    alliedDepartments: savedData?.alliedDepartments || [],

    // 9. Faculty Strength (A9)
    facultyStrength: savedData?.facultyStrength || [],

    // 10. Student Strength (A10)
    studentStrength: savedData?.studentStrength || [],

    // 11. Vision & Mission
    vision: savedData?.vision || "",
    mission: savedData?.mission || "",

    // Head of Institution
    headName: savedData?.headName || "",
    headDesignation: savedData?.headDesignation || "",
    headMobile: savedData?.headMobile || "",
    headEmail: savedData?.headEmail || "",

    // NBA Coordinator
    nbaCoordinatorName: savedData?.nbaCoordinatorName || "",
    nbaCoordinatorDesignation: savedData?.nbaCoordinatorDesignation || "",
    nbaCoordinatorMobile: savedData?.nbaCoordinatorMobile || "",
    nbaCoordinatorEmail: savedData?.nbaCoordinatorEmail || "",
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-2xl font-bold text-indigo-700">Loading Institutional Information...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-10">
      <div className="container mx-auto px-4 max-w-7xl">
       <div className="mb-6 flex justify-end">
        <Link
            to="/view-nba"
            className="text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center gap-2"
        >
            ← Back
        </Link>
        </div>


        <div className="text-center mb-10">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">PART A: INSTITUTIONAL INFORMATION</h1>
          <p className="text-xl text-gray-600 mt-2">Self Assessment Report (SAR) - Tier I / Tier II</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden relative">
          {/* Edit Button */}
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            disabled={isEditMode}
            className={`absolute top-6 right-6 z-10 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white transition-all ${
              isEditMode ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            <Edit size={26} />
          </button>

          <div className="p-8 md:p-12">
            <Formik
              initialValues={initialValues}
              enableReinitialize={true}
              onSubmit={async (values) => {
                setIsSaving(true);
                try {
                  const payload = { cycle_id: cycleId, ...values };
                  if (savedData?.id) {
                    await newnbaPrequalifierService.updatePartAInstitutional(savedData.id, payload);
                  } else {
                    const res = await newnbaPrequalifierService.savePartAInstitutional(payload);
                    setSavedData(res);
                  }
                  setIsEditMode(false);
                  setAlert(
                    <SweetAlert success title="Success!" onConfirm={() => setAlert(null)}>
                      Institutional Information saved successfully!
                    </SweetAlert>
                  );
                } catch (err) {
                  setAlert(
                    <SweetAlert danger title="Error!" onConfirm={() => setAlert(null)}>
                      {err.response?.data?.message || "Failed to save. Please try again."}
                    </SweetAlert>
                  );
                } finally {
                  setIsSaving(false);
                }
              }}
            >
              {({ values }) => (
                <Form className="space-y-10">

                  {/* 1. Name and Address */}
                  <Section title="1. Name and Address of the Institution">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputField name="instituteName" label="Name of the Institution" disabled={!isEditMode} />
                      <InputField name="instituteAddress" label="Address" disabled={!isEditMode} />
                      <InputField name="city" label="City/Town" disabled={!isEditMode} />
                      <InputField name="state" label="State/UT" disabled={!isEditMode} />
                      <InputField name="pincode" label="Pin Code" disabled={!isEditMode} />
                      <InputField name="website" label="Website" type="url" disabled={!isEditMode} />
                      <InputField name="phone" label="Telephone" disabled={!isEditMode} />
                      <InputField name="email" label="Email" type="email" disabled={!isEditMode} />
                    </div>
                  </Section>

                  {/* 2. Type of Institution */}
                  <Section title="2. Type of the Institution">
                    <RadioGroup
                      name="institutionType"
                      options={[
                        "Institute of National Importance",
                        "Deemed to be University",
                        "University",
                        "Autonomous",
                        "Non-Autonomous (Affiliated)",
                        "Any Other (Please specify)",
                      ]}
                      disabled={!isEditMode}
                    />
                    {values.institutionType === "Any Other (Please specify)" && (
                      <InputField name="institutionTypeOther" placeholder="Specify here..." disabled={!isEditMode} className="mt-4" />
                    )}
                    {["Autonomous", "Deemed to be University"].includes(values.institutionType) && (
                      <div className="grid grid-cols-2 gap-6 mt-4">
                        <InputField name="autonomousYear" label="Year of Grant of Status" type="number" disabled={!isEditMode} />
                        <InputField name="autonomousDuration" label="Duration of Autonomy (if applicable)" disabled={!isEditMode} />
                      </div>
                    )}
                  </Section>

                  {/* 3. Year of Establishment */}
                  <Section title="3. Year of Establishment of the Institution">
                    <InputField name="yearOfEstablishment" type="number" disabled={!isEditMode} />
                  </Section>

                  {/* 4. Ownership Status */}
                  <Section title="4. Ownership Status">
                    <RadioGroup
                      name="ownershipStatus"
                      options={[
                        "Central Government",
                        "State Government",
                        "Grant-in-Aid",
                        "Self-financing",
                        "Trust",
                        "Any Other (Please specify)",
                      ]}
                      disabled={!isEditMode}
                    />
                    {values.ownershipStatus === "Any Other (Please specify)" && (
                      <InputField name="ownershipOther" placeholder="Specify here..." disabled={!isEditMode} className="mt-4" />
                    )}
                  </Section>

                  {/* 5. Affiliating University */}
                  <Section title="5. Name and Address of the Affiliating University">
                    <InputField name="affiliatingUniversity" disabled={!isEditMode} />
                  </Section>

                  {/* 6. Table A6 - Other Institutions */}
                  <Section title="6. Other Academic Institutions Run by the Same Trust/Society (Table A6)">
                    <DynamicTable
                      name="otherInstitutions"
                      columns={["Name of Institution", "Year of Establishment", "Programs of Study", "Location"]}
                      fields={["name", "year", "programs", "location"]}
                      isEditMode={isEditMode}
                    />
                  </Section>

                  {/* 7. Table A7 - All Programs */}
                  <Section title="7. Details of All Programs Offered by the Institution (Table A7)">
                    <FieldArray name="allPrograms">
                      {({ push, remove }) => (
                        <table className="w-full border-collapse border border-gray-300 text-sm">
                          <thead className="bg-indigo-100">
                            <tr>
                              <th className="border border-gray-300 p-3">Program Name</th>
                              <th className="border border-gray-300 p-3">Year of Start</th>
                              <th className="border border-gray-300 p-3">Sanctioned Intake</th>
                              <th className="border border-gray-300 p-3">Increase/Decrease</th>
                              <th className="border border-gray-300 p-3">Year of Change</th>
                              <th className="border border-gray-300 p-3">AICTE Approval</th>
                              <th className="border border-gray-300 p-3">Accreditation Status</th>
                              {isEditMode && <th className="border border-gray-300 p-3">Action</th>}
                            </tr>
                          </thead>
                          <tbody>
                            {values.allPrograms.length === 0 && (
                              <tr><td colSpan="8" className="text-center py-8 text-gray-500">No programs added yet.</td></tr>
                            )}
                            {values.allPrograms.map((prog, index) => (
                              <tr key={index}>
                                <td className="border"><Field name={`allPrograms.${index}.name`} className="w-full p-2" disabled={!isEditMode} /></td>
                                <td className="border"><Field name={`allPrograms.${index}.year_start`} className="w-full p-2" disabled={!isEditMode} /></td>
                                <td className="border"><Field name={`allPrograms.${index}.intake`} className="w-full p-2" disabled={!isEditMode} /></td>
                                <td className="border"><Field name={`allPrograms.${index}.change`} className="w-full p-2" disabled={!isEditMode} /></td>
                                <td className="border"><Field name={`allPrograms.${index}.change_year`} className="w-full p-2" disabled={!isEditMode} /></td>
                                <td className="border"><Field name={`allPrograms.${index}.aicte`} className="w-full p-2" disabled={!isEditMode} /></td>
                                <td className="border">
                                  <Field as="select" name={`allPrograms.${index}.accreditation`} disabled={!isEditMode} className="w-full p-2">
                                    <option>Applying first time</option>
                                    <option>Accredited (2/3 years)</option>
                                    <option>Accredited (5/6 years)</option>
                                    <option>Not accredited</option>
                                    <option>Withdrawn</option>
                                    <option>Not eligible</option>
                                    <option>Eligible but not applied</option>
                                  </Field>
                                </td>
                                {isEditMode && (
                                  <td className="border text-center">
                                    <button type="button" onClick={() => remove(index)} className="text-red-600 hover:text-red-800">
                                      <Trash2 size={18} />
                                    </button>
                                  </td>
                                )}
                              </tr>
                            ))}
                            {isEditMode && (
                              <tr>
                                <td colSpan="8" className="text-center py-4">
                                  <button
                                    type="button"
                                    onClick={() => push({ name: "", year_start: "", intake: "", change: "", change_year: "", aicte: "", accreditation: "Not accredited" })}
                                    className="text-indigo-600 hover:text-indigo-800 flex items-center gap-2 mx-auto"
                                  >
                                    <Plus size={20} /> Add Program
                                  </button>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      )}
                    </FieldArray>
                  </Section>

                  {/* 8. Table A8.1 & A8.2 */}
                  <Section title="8. Programs to be Considered for Accreditation (Table A8.1)">
                    <DynamicTable
                      name="programsForAccreditation"
                      columns={["Cluster ID", "Name of the Department", "Name of the Program"]}
                      fields={["clusterId", "department", "program"]}
                      isEditMode={isEditMode}
                      showIndex
                    />
                  </Section>

                  <Section title="Allied Departments (Table A8.2)">
                    <DynamicTable
                      name="alliedDepartments"
                      columns={["Cluster ID", "Main Department", "Allied Department(s)"]}
                      fields={["clusterId", "main", "allied"]}
                      isEditMode={isEditMode}
                      showIndex
                    />
                  </Section>

                  {/* Vision & Mission */}
                  <Section title="11. Vision of the Institution">
                    <textarea name="vision" rows="3" className="w-full p-4 border rounded-lg" disabled={!isEditMode} value={values.vision} onChange={(e) => values.vision = e.target.value} />
                  </Section>

                  <Section title="12. Mission of the Institution">
                    <textarea name="mission" rows="4" className="w-full p-4 border rounded-lg" disabled={!isEditMode} value={values.mission} onChange={(e) => values.mission = e.target.value} />
                  </Section>

                  {/* Contact Info */}
                  <Section title="13. Contact Information">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-xl font-bold text-indigo-700 mb-4">A. Head of the Institution</h3>
                        <InputField name="headName" label="Name" disabled={!isEditMode} />
                        <InputField name="headDesignation" label="Designation" disabled={!isEditMode} />
                        <InputField name="headMobile" label="Mobile" disabled={!isEditMode} />
                        <InputField name="headEmail" label="Email" type="email" disabled={!isEditMode} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-indigo-700 mb-4">B. NBA Coordinator</h3>
                        <InputField name="nbaCoordinatorName" label="Name" disabled={!isEditMode} />
                        <InputField name="nbaCoordinatorDesignation" label="Designation" disabled={!isEditMode} />
                        <InputField name="nbaCoordinatorMobile" label="Mobile" disabled={!isEditMode} />
                        <InputField name="nbaCoordinatorEmail" label="Email" type="email" disabled={!isEditMode} />
                      </div>
                    </div>
                  </Section>

                  {/* Save Button */}
                  {isEditMode && (
                    <div className="text-center pt-12">
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="px-20 py-5 bg-indigo-600 from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xl rounded-xl shadow-2xl transition-all disabled:opacity-70"
                      >
                        {isSaving ? "Saving..." : "Save"}
                      </button>
                    </div>
                  )}
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
      {alert}
    </div>
  );
};

// Reusable Components
const Section = ({ title, children }) => (
  <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200 shadow-sm">
    <h2 className="text-2xl font-bold text-indigo-800 mb-6">{title}</h2>
    {children}
  </div>
);

const InputField = ({ name, label, type = "text", disabled, placeholder, className = "" }) => (
  <div className={className}>
    <label className="block text-gray-700 font-semibold mb-2">{label}</label>
    <Field
      name={name}
      type={type}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${disabled ? "bg-gray-100" : "bg-white"}`}
    />
  </div>
);

const RadioGroup = ({ name, options, disabled }) => (
  <div className="space-y-3">
    {options.map((option) => (
      <label key={option} className="flex items-center gap-3 cursor-pointer">
        <Field type="radio" name={name} value={option} disabled={disabled} className="w-5 h-5 text-indigo-600" />
        <span className={disabled ? "text-gray-500" : "text-gray-800"}>{option}</span>
      </label>
    ))}
  </div>
);

const DynamicTable = ({ name, columns, fields, isEditMode, showIndex = false }) => (
  <FieldArray name={name}>
    {({ push, remove, form }) => {
      const items = form.values[name] || [];
      return (
        <table className="w-full border-collapse border border-gray-300 text-sm">
          <thead className="bg-indigo-100">
            <tr>
              {showIndex && <th className="border border-gray-300 p-3">S.No.</th>}
              {columns.map((col) => (
                <th key={col} className="border border-gray-300 p-3 text-left">{col}</th>
              ))}
              {isEditMode && <th className="border border-gray-300 p-3">Action</th>}
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr><td colSpan={columns.length + (isEditMode ? 1 : 0) + (showIndex ? 1 : 0)} className="text-center py-8 text-gray-500">No data added</td></tr>
            )}
            {items.map((item, index) => (
              <tr key={index}>
                {showIndex && <td className="border text-center font-medium">{index + 1}</td>}
                {fields.map((field) => (
                  <td key={field} className="border">
                    <Field name={`${name}.${index}.${field}`} disabled={!isEditMode} className="w-full p-2" />
                  </td>
                ))}
                {isEditMode && (
                  <td className="border text-center">
                    <button type="button" onClick={() => remove(index)} className="text-red-600 hover:text-red-800">
                      <Trash2 size={18} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {isEditMode && (
              <tr>
                <td colSpan={columns.length + (isEditMode ? 1 : 0) + (showIndex ? 1 : 0)} className="text-center py-4">
                  <button
                    type="button"
                    onClick={() => push(fields.reduce((obj, f) => ({ ...obj, [f]: "" }), {}))}
                    className="text-indigo-600 hover:text-indigo-800 flex items-center gap-2 mx-auto"
                  >
                    <Plus size={20} /> Add Row
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      );
    }}
  </FieldArray>
);

export default ViewInstitutionInformation;