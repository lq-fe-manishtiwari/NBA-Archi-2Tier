import React, { useState, useEffect, useRef } from "react";

const EducationTab = ({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  setFieldValue,
}) => {
  // --- State Management ---
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedQual, setSelectedQual] = useState(""); // Stores the qualification type selected in the modal
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState(""); // For validation errors in the modal
  const dropdownRef = useRef(null);

  // --- Constants ---
  const qualificationOptions = [
    { value: "10th", label: "10th" },
    { value: "12th", label: "12th" },
    { value: "ug", label: "UG (Graduation)" },
    { value: "pg", label: "PG (Post Graduation)" },
  ];

  // --- Effects ---

  // 🧠 Ensure education details are mapped properly from API (initial loading)
  useEffect(() => {
    // This runs once if 'education_details' exists but the internal structure is from an older API format
    if (values.education_details && !values.education_details[0]?.qualification) {
      const mapped = values.education_details.map((edu) => ({
        ...edu,
        // Map old/alternative keys to the new structure
        qualification: edu.grade || edu.qualification || "10th",
        name_as_per_marksheet: edu.name_as_per_marksheet || "",
        college: edu.school || edu.college || "", // Prioritize 'school' for 10th/12th
        university: edu.board || edu.university || "", // Prioritize 'board' for 10th/12th
        passing_year: edu.year || "",
        percentage: edu.percentage || "",
      }));
      setFieldValue("education_details", mapped);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setFieldValue]); // Only run on mount and if setFieldValue changes (it typically doesn't)

  // 🧩 Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Handlers ---

  // ➕ Add new qualification (with duplicate validation)
  const handleAddQualification = () => {
    // 1. Validation check for selection
    if (!selectedQual) {
      setErrorMsg("Please select a qualification type.");
      return;
    }

    // 2. Validation check for duplicates
    const alreadyExists = values.education_details?.some(
      (edu) => edu.qualification === selectedQual
    );

    if (alreadyExists) {
      setErrorMsg("This qualification type has already been added.");
      return;
    }

    // 3. Create new entry object
    const newEntry = {
      qualification: selectedQual,
      name_as_per_marksheet: "",
      college: "",
      university: "",
      passing_year: "",
      percentage: "",
    };

    // 4. Update Formik state
    const updatedDetails = Array.isArray(values.education_details)
      ? [...values.education_details, newEntry]
      : [newEntry];

    setFieldValue("education_details", updatedDetails);
    
    // 5. Reset modal state
    setShowAddForm(false);
    setSelectedQual("");
    setErrorMsg("");
  };

  // 🗑 Remove qualification
  const handleRemoveQualification = (index) => {
    const updated = (values.education_details || []).filter((_, i) => i !== index);
    setFieldValue("education_details", updated);
  };

  // ✏️ Update input fields dynamically using the index
  const handleFieldChange = (index, field, value) => {
    const updated = [...(values.education_details || [])];
    if (updated[index]) {
      updated[index][field] = value;
      setFieldValue("education_details", updated);
    }
  };

  // Ensure education_details is an array for mapping
  const educationList = Array.isArray(values.education_details)
    ? values.education_details
    : [];

  // --- Render ---

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-2 sm:p-4 md:p-6 flex justify-center">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-lg border border-gray-100 p-3 sm:p-6 md:p-8">
        <div className="space-y-8">
          <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
            Education Details
          </h2>

          {/* ------------------------------------- */}
          {/* === Upper Section (ABC ID, App No) === */}
          {/* ------------------------------------- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-5 bg-blue-50 p-3 sm:p-5 rounded-xl border border-blue-200">
            <div>
              <label className="block font-medium mb-1 text-gray-700">ABC ID</label>
              <input
                type="text"
                name="abc_id"
                value={values.abc_id || ""}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full border rounded-md px-3 py-2 focus:outline-none border-gray-300 focus:border-blue-500"
                placeholder="Enter ABC ID"
              />
              {touched.abc_id && errors.abc_id && (
                <p className="text-red-500 text-xs mt-1">{errors.abc_id}</p>
              )}
            </div>

            <div>
              <label className="block font-medium mb-1 text-gray-700">
                University Application Number
              </label>
              <input
                type="text"
                name="university_application_form"
                value={values.university_application_form || ""}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full border rounded-md px-3 py-2 focus:outline-none border-gray-300 focus:border-blue-500"
                placeholder="Enter Application Number"
              />
              {touched.university_application_form &&
                errors.university_application_form && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.university_application_form}
                  </p>
                )}
            </div>
          </div>
          
          <hr className="border-gray-200" />

          {/* ----------------------------------- */}
          {/* === Dynamic Qualifications List === */}
          {/* ----------------------------------- */}
          <div className="pt-2">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 mb-6">
              <h3 className="text-lg font-semibold text-gray-700">
                Previous Qualifications
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(true);
                  setErrorMsg(""); // Clear previous errors when opening
                }}
                // Custom style for the primary button color
                className="flex items-center gap-2 px-3 sm:px-4 py-2 text-white rounded-md transition text-sm font-medium w-full lg:w-auto justify-center hover:opacity-90"
                style={{ backgroundColor: "rgb(33, 98, 193)" }} 
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span className="hidden sm:inline">Add Qualification</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>

            {/* ---------------------- */}
            {/* === Add Qual Modal === */}
            {/* ---------------------- */}
            {showAddForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
                <div className="bg-white rounded-xl shadow-2xl p-4 sm:p-6 w-full max-w-md mx-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-5">
                    Select Qualification
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Qualification Type
                      </label>
                      <div ref={dropdownRef} className="relative">
                        <div
                          className="w-full px-3 py-2 border bg-white border-gray-300 cursor-pointer hover:border-blue-400 rounded min-h-[40px] flex items-center justify-between transition-all duration-150"
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                          <span className={`text-gray-900 ${!selectedQual ? "text-gray-400" : ""}`}>
                            {selectedQual
                              ? qualificationOptions.find(
                                  (opt) => opt.value === selectedQual
                                )?.label
                              : "Select Qualification Type"}
                          </span>
                          <svg
                            className={`w-4 h-4 text-gray-400 transition-transform ${
                              isDropdownOpen ? "rotate-180" : "rotate-0"
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>

                        {isDropdownOpen && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
                            {qualificationOptions.map((opt) => (
                              <div
                                key={opt.value}
                                className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
                                onClick={() => {
                                  setSelectedQual(opt.value);
                                  setIsDropdownOpen(false);
                                  setErrorMsg("");
                                }}
                              >
                                {opt.label}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {/* Error message display */}
                      {errorMsg && (
                        <p className="text-red-500 text-sm mt-2">{errorMsg}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 border-t pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setErrorMsg(""); // Clear error message on cancel
                        setSelectedQual(""); // Reset selected value on cancel
                      }}
                      className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 text-sm font-medium text-gray-700 order-2 sm:order-1 transition duration-150"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddQualification}
                      className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium order-1 sm:order-2 transition duration-150"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ------------------------------------- */}
            {/* === Individual Qualification Forms === */}
            {/* ------------------------------------- */}
            <div className="space-y-6">
              {educationList.length > 0 ? (
                educationList.map((edu, index) => (
                  <div
                    key={index}
                    className="p-3 sm:p-5 border rounded-xl bg-gradient-to-r from-gray-50 to-blue-50 shadow-md transition duration-300 hover:shadow-lg"
                  >
                    <div className="flex justify-between items-start mb-4 border-b border-blue-200 pb-3">
                      <h4 className="text-lg font-bold text-blue-700">
                        {
                          // Find the readable label for the qualification value
                          qualificationOptions.find(
                            (o) => o.value === edu.qualification
                          )?.label || edu.qualification?.toUpperCase()
                        }
                      </h4>
                      <button
                        type="button"
                        onClick={() => handleRemoveQualification(index)}
                        className="text-red-500 hover:text-red-700 transition duration-150 text-sm font-medium"
                      >
                        <svg className="w-5 h-5 inline-block align-text-bottom mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        Delete
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                      {/* Name as per Marksheet */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Name as per Marksheet
                        </label>
                        <input
                          type="text"
                          value={edu.name_as_per_marksheet || ""}
                          onChange={(e) =>
                            handleFieldChange(index, "name_as_per_marksheet", e.target.value)
                          }
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-blue-500 transition duration-150"
                          placeholder="Name on marksheet"
                        />
                      </div>

                      {/* College / School */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          College / School
                        </label>
                        <input
                          type="text"
                          value={edu.college || ""}
                          onChange={(e) =>
                            handleFieldChange(index, "college", e.target.value)
                          }
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-blue-500 transition duration-150"
                          placeholder="College name"
                        />
                      </div>

                      {/* University / Board */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          University / Board
                        </label>
                        <input
                          type="text"
                          value={edu.university || ""}
                          onChange={(e) =>
                            handleFieldChange(index, "university", e.target.value)
                          }
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-blue-500 transition duration-150"
                          placeholder="University/Board"
                        />
                      </div>

                      {/* Passing Year */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Passing Year
                        </label>
                        <input
                          type="text"
                          value={edu.passing_year || ""}
                          onChange={(e) =>
                            handleFieldChange(index, "passing_year", e.target.value)
                          }
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-blue-500 transition duration-150"
                          placeholder="e.g. 2023"
                        />
                      </div>

                      {/* Percentage / CGPA */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Percentage / CGPA
                        </label>
                        <input
                          type="text"
                          value={edu.percentage || ""}
                          onChange={(e) =>
                            handleFieldChange(index, "percentage", e.target.value)
                          }
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-blue-500 transition duration-150"
                          placeholder="e.g. 85%"
                        />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-gray-500 bg-gray-50 border border-dashed rounded-xl">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5S19.832 5.477 21 6.253v13C19.832 18.477 18.246 18 16.5 18s-3.332.477-4.5 1.253" /></svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No education records</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by clicking{" "}
                    <span className="font-semibold text-blue-600">“Add Qualification”</span> above.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EducationTab;