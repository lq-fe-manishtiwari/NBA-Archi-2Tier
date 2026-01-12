import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const SafeDatePicker = ({ selected, ...props }) => {
  const safeDate = selected && !isNaN(new Date(selected).getTime()) ? new Date(selected) : null;
  return (
    <DatePicker
      {...props}
      selected={safeDate}
      onChange={props.onChange}
      dateFormat="dd/MM/yyyy"
      className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:border-blue-500 focus:ring-blue-300`}
      placeholderText={props.placeholderText || "Select date"}
      showYearDropdown
      scrollableYearDropdown
      yearDropdownItemNumber={15}
      isClearable
    />
  );
};

const TeacherOtherDetails = ({
  userRole,
  custom_fields = [],
  onCheckboxChangeCurr,
  handleCheckAssesmentEvent,
  handleCheckAcademicsEvent,
  handleCheckContentApprovalEvent,
  handleCheckOfflineEvent,
  handleCustomFieldChangeEvent,
  values,
  setFieldValue,
  addArrayItem,
  removeArrayItem,
  updateArrayItem,
}) => {
  // Generic Change Handler
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFieldValue(name, type === "checkbox" ? checked : value);
  };

  // === Qualification Helpers ===
  const addQualification = () => {
    addArrayItem("teacher_qualifications", {
      degree: "",
      passing_year: "",
      school_university: "",
      passing_percentage: "",
    });
  };

  const removeQualification = (index) => {
    removeArrayItem("teacher_qualifications", index);
  };

  const updateQualification = (index, field, value) => {
    updateArrayItem("teacher_qualifications", index, field, value);
  };

  // === Experience Helpers ===
  const addExperience = () => {
    if (values.teacher_employments.length >= 3) return;
    addArrayItem("teacher_employments", {
      organization: "",
      from_date: null,
      to_date: null,
      organization_hr_name: "",
      organization_hr_email: "",
      organization_hr_contact_number: "",
    });
  };

  const removeExperience = (index) => {
    removeArrayItem("teacher_employments", index);
  };

  const updateExperience = (index, field, value) => {
    updateArrayItem("teacher_employments", index, field, value);
  };

  // === Custom Field Helpers ===
  const addCustomField = () => {
    addArrayItem("custom_fields", { custom_field_id: "", field_value: "" });
  };

  const removeCustomField = (index) => {
    removeArrayItem("custom_fields", index);
  };

  const updateCustomField = (index, field, value) => {
    updateArrayItem("custom_fields", index, field, value);
  };

  // Get field type by custom_field_id
  const getFieldType = (custom_field_id) => {
    const field = custom_fields.find(f => f.custom_field_id === custom_field_id);
    return field?.field_type?.toLowerCase() || "text";
  };

  return (
    <div className="w-full min-h-screen bg-white sm:bg-white p-3 sm:p-6 flex justify-center">
      <div className="w-full sm:max-w-6xl sm:bg-white sm:rounded-2xl sm:shadow-md sm:border sm:border-gray-100 p-0 sm:p-6">
        <form className="space-y-6">

          {/* Content Access */}
          <div className="bg-white p-4 sm:p-6 rounded border border-gray-200">
            <label className="block font-medium mb-3 text-gray-800">Can add content?</label>
            <div className="flex gap-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="content_access"
                  value="true"
                  checked={values.content_access === "true"}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">Yes</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="content_access"
                  value="false"
                  checked={values.content_access === "false"}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">No</span>
              </label>
            </div>
          </div>

          {/* Superadmin Permissions */}
          {userRole === "SUPERADMIN" && (
            <div className="bg-white p-4 sm:p-6 rounded border border-gray-200">
              <label className="block font-medium mb-3 text-gray-800">Administrative Permissions</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded border border-gray-200">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={values.assessment_enabled}
                      onChange={(e) => {
                        handleChange(e);
                        handleCheckAssesmentEvent?.(e);
                      }}
                      name="assessment_enabled"
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-700 font-medium">Has full control on assessment?</span>
                  </label>
                </div>

                <div className="bg-gray-50 p-4 rounded border border-gray-200">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={values.content_approval}
                      onChange={(e) => {
                        handleChange(e);
                        handleCheckContentApprovalEvent?.(e);
                      }}
                      name="content_approval"
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-700 font-medium">Auto approval of uploaded content</span>
                  </label>
                </div>

                <div className="bg-gray-50 p-4 rounded border border-gray-200">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={values.chapter_topic_access}
                      onChange={(e) => {
                        handleChange(e);
                        handleCheckAcademicsEvent?.(e);
                      }}
                      name="chapter_topic_access"
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-700 font-medium">Has full control on academics?</span>
                  </label>
                </div>

                <div className="bg-gray-50 p-4 rounded border border-gray-200">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={values.offline_assessment_enabled}
                      onChange={(e) => {
                        handleChange(e);
                        handleCheckOfflineEvent?.(e);
                      }}
                      name="offline_assessment_enabled"
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-700 font-medium">Can add offline Assessment?</span>
                  </label>
                </div>

                <div className="bg-gray-50 p-4 rounded border border-gray-200">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={values.reports_access}
                      onChange={(e) => {
                        handleChange(e);
                        setFieldValue("reports_access", e.target.checked);
                      }}
                      name="reports_access"
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-700 font-medium">Can view reports?</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Content Visibility */}
          {(userRole === "SUPERADMIN" || userRole === "ADMIN") && (
            <div className="bg-white p-4 sm:p-6 rounded border border-gray-200">
              <label className="block font-medium mb-3 text-gray-800">
                Content Visibility <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { label: "Academics", field: "academic_enabled" },
                  { label: "Vertical 1 & 4", field: "vertical1_4_enabled" },
                  { label: "Vertical 2", field: "vertical2_enabled" },
                  { label: "Vertical 3", field: "vertical3_enabled" },
                  { label: "Vertical 5", field: "vertical5_enabled" },
                  { label: "Vertical 6", field: "vertical6_enabled" },
                ].map((item) => (
                  <div key={item.field} className="bg-gray-50 p-3 rounded border border-gray-200">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name={item.field}
                        checked={values[item.field]}
                        onChange={(e) => {
                          handleChange(e);
                          onCheckboxChangeCurr?.(e);
                        }}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{item.label}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Probation Details */}
          <div className="bg-white p-4 sm:p-6 rounded border border-gray-200">
            <label className="block font-medium mb-3 text-gray-800">Teacher Probation Details</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded border border-gray-200">
                <input
                  type="checkbox"
                  name="probation_completed"
                  checked={values.probation_completed}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700">Probation Completed</span>
              </div>
              <div>
                <label className="block font-medium mb-1 text-gray-700">Probation Completed Date</label>
                <SafeDatePicker
                  selected={values.probation_completed_date}
                  onChange={(date) => setFieldValue("probation_completed_date", date)}
                  isClearable
                  placeholderText="Select date"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block font-medium mb-1 text-gray-700">Probation Comment</label>
                <input
                  type="text"
                  name="probation_comment"
                  value={values.probation_comment || ""}
                  onChange={handleChange}
                  placeholder="Enter comment..."
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:border-blue-500 focus:ring-blue-300"
                />
              </div>
            </div>
          </div>

          {/* Qualification Details */}
          <div className="bg-white p-4 sm:p-6 rounded border border-gray-200">
            <div className="flex justify-between items-center border-b border-gray-300 pb-3 mb-4">
              <p className="font-bold text-lg text-gray-800">QUALIFICATION DETAILS</p>
              <button
                type="button"
                onClick={addQualification}
                className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition font-medium"
              >
                <span className="text-lg font-bold">+</span>
                Add Qualification
              </button>
            </div>
            <div className="space-y-4">
              {values.teacher_qualifications.map((qual, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded border border-gray-200 relative">
                  <button
                    type="button"
                    onClick={() => removeQualification(index)}
                    className="absolute top-3 right-3 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition"
                    aria-label="Remove Qualification"
                  >
                    <span className="text-sm font-bold">−</span>
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <label className="block font-medium mb-1 text-gray-700">
                        Qualification <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={qual.degree || ""}
                        onChange={(e) => updateQualification(index, "degree", e.target.value)}
                        placeholder="Enter degree"
                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:border-blue-500 focus:ring-blue-300"
                      />
                    </div>
                    <div>
                      <label className="block font-medium mb-1 text-gray-700">Passing Year</label>
                      <input
                        type="text"
                        value={qual.passing_year || ""}
                        onChange={(e) => updateQualification(index, "passing_year", e.target.value)}
                        placeholder="Enter year"
                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:border-blue-500 focus:ring-blue-300"
                      />
                    </div>
                    <div>
                      <label className="block font-medium mb-1 text-gray-700">School/University</label>
                      <input
                        type="text"
                        value={qual.school_university || ""}
                        onChange={(e) => updateQualification(index, "school_university", e.target.value)}
                        placeholder="Enter institution"
                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:border-blue-500 focus:ring-blue-300"
                      />
                    </div>
                    <div>
                      <label className="block font-medium mb-1 text-gray-700">Passing Percentage</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.001"
                        value={qual.passing_percentage || ""}
                        onChange={(e) => updateQualification(index, "passing_percentage", e.target.value)}
                        placeholder="Enter percentage"
                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:border-blue-500 focus:ring-blue-300"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Experience Details */}
          <div className="bg-white p-4 sm:p-6 rounded border border-gray-200">
            <div className="flex justify-between items-center border-b border-gray-300 pb-3 mb-4">
              <p className="font-bold text-lg text-gray-800">EXPERIENCE DETAILS</p>
              {values.teacher_employments.length < 3 && (
                <button
                  type="button"
                  onClick={addExperience}
                  className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition font-medium"
                >
                  <span className="text-lg font-bold">+</span>
                  Add Experience
                </button>
              )}
            </div>
            <div className="space-y-4">
              {values.teacher_employments.map((exp, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded border border-gray-200 relative">
                  <button
                    type="button"
                    onClick={() => removeExperience(index)}
                    className="absolute top-3 right-3 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition"
                    aria-label="Remove Experience"
                  >
                    <span className="text-sm font-bold">−</span>
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                    <div>
                      <label className="block font-medium mb-1 text-gray-700">
                        Organization <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={exp.organization || ""}
                        onChange={(e) => updateExperience(index, "organization", e.target.value)}
                        placeholder="Enter organization"
                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:border-blue-500 focus:ring-blue-300"
                      />
                    </div>
                    <div>
                      <label className="block font-medium mb-1 text-gray-700">
                        From Date <span className="text-red-500">*</span>
                      </label>
                      <SafeDatePicker
                        selected={exp.from_date}
                        onChange={(date) => updateExperience(index, "from_date", date)}
                        isClearable
                        placeholderText="Select date"
                      />
                    </div>
                    <div>
                      <label className="block font-medium mb-1 text-gray-700">
                        To Date <span className="text-red-500">*</span>
                      </label>
                      <SafeDatePicker
                        selected={exp.to_date}
                        onChange={(date) => updateExperience(index, "to_date", date)}
                        isClearable
                        placeholderText="Select date"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-medium mb-1 text-gray-700">HR Name</label>
                      <input
                        type="text"
                        value={exp.organization_hr_name || ""}
                        onChange={(e) => updateExperience(index, "organization_hr_name", e.target.value)}
                        placeholder="Enter HR name"
                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:border-blue-500 focus:ring-blue-300"
                      />
                    </div>
                    <div>
                      <label className="block font-medium mb-1 text-gray-700">HR Email</label>
                      <input
                        type="email"
                        value={exp.organization_hr_email || ""}
                        onChange={(e) => updateExperience(index, "organization_hr_email", e.target.value)}
                        placeholder="Enter email"
                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:border-blue-500 focus:ring-blue-300"
                      />
                    </div>
                    <div>
                      <label className="block font-medium mb-1 text-gray-700">HR Contact</label>
                      <input
                        type="text"
                        value={exp.organization_hr_contact_number || ""}
                        onChange={(e) => updateExperience(index, "organization_hr_contact_number", e.target.value)}
                        placeholder="Enter contact"
                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:border-blue-500 focus:ring-blue-300"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Fields (Superadmin Only) */}
          {userRole === "SUPERADMIN" && (
            <div className="bg-white p-4 sm:p-6 rounded border border-gray-200">
              <div className="flex justify-between items-center border-b border-gray-300 pb-3 mb-4">
                <p className="font-bold text-lg text-gray-800">CUSTOM FIELDS</p>
                <button
                  type="button"
                  onClick={addCustomField}
                  className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition font-medium"
                >
                  <span className="text-lg font-bold">+</span>
                  Add Custom Field
                </button>
              </div>
              <div className="space-y-4">
                {values.custom_fields.map((cf, index) => {
                  const fieldType = getFieldType(cf.custom_field_id);
                  return (
                    <div key={index} className="p-4 bg-gray-50 rounded border border-gray-200 relative">
                      <button
                        type="button"
                        onClick={() => removeCustomField(index)}
                        className="absolute top-3 right-3 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition"
                        aria-label="Remove Custom Field"
                      >
                        <span className="text-sm font-bold">−</span>
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-medium mb-1 text-gray-700">
                            Field <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={cf.custom_field_id}
                            onChange={(e) => {
                              updateCustomField(index, "custom_field_id", e.target.value);
                              updateCustomField(index, "field_value", ""); // Reset value on change
                              handleCustomFieldChangeEvent?.(e);
                            }}
                            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:border-blue-500 focus:ring-blue-300"
                          >
                            <option value="">Select a field</option>
                            {custom_fields.map((field) => (
                              <option key={field.custom_field_id} value={field.custom_field_id}>
                                {field.field_name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block font-medium mb-1 text-gray-700">
                            Field Value <span className="text-red-500">*</span>
                          </label>
                          {fieldType === "text" && (
                            <input
                              type="text"
                              value={cf.field_value || ""}
                              onChange={(e) => updateCustomField(index, "field_value", e.target.value)}
                              placeholder="Enter field value"
                              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:border-blue-500 focus:ring-blue-300"
                            />
                          )}
                          {fieldType === "file" && (
                            <input
                              type="file"
                              onChange={(e) => updateCustomField(index, "field_value", e.target.files[0])}
                              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:border-blue-500 focus:ring-blue-300"
                            />
                          )}
                          {fieldType === "date" && (
                            <SafeDatePicker
                              selected={cf.field_value}
                              onChange={(date) => updateCustomField(index, "field_value", date)}
                              isClearable
                              placeholderText="Select date"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default TeacherOtherDetails;