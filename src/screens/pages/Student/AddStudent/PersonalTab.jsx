import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ChevronDown, Upload } from "lucide-react";

// Custom Select Component
const CustomSelect = ({ label, value, onChange, options, placeholder, disabled = false, required = false, error = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <label className="block font-medium mb-1 text-gray-700">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <div
        className={`w-full px-3 py-2 border ${
          disabled
            ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed'
            : error
            ? 'bg-white border-red-500 cursor-pointer hover:border-red-400'
            : 'bg-white border-gray-300 cursor-pointer hover:border-blue-400'
        } rounded min-h-[40px] flex items-center justify-between transition-all duration-150 focus:ring-2 focus:ring-blue-500`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={value ? 'text-gray-900' : 'text-gray-400'}>
          {value || placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`}
        />
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
          <div
            className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
            onClick={() => handleSelect('')}
          >
            {placeholder}
          </div>
          {options.map((option) => (
            <div
              key={option}
              className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors"
              onClick={() => handleSelect(option)}
            >
              {option}
            </div>
          ))}
        </div>
      )}
      {error && (
        <p className="mt-1 text-sm text-red-600">Required</p>
      )}
    </div>
  );
};

const PersonalTab = forwardRef(({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  setFieldValue,
}, ref) => {
  const [programs, setPrograms] = useState([]);
  const [imageName, setImageName] = useState("");
  const [requiredErrors, setRequiredErrors] = useState({});

  // Expose validation check to parent
  useImperativeHandle(ref, () => ({
    validateRequired: () => {
      const requiredFields = ['firstname', 'lastname', 'grade_id', 'mobile', 'email', 'date_of_admission', 'date_of_birth', 'gender', 'permanent_registration_number'];
      const newErrors = {};
      let hasErrors = false;
      
      requiredFields.forEach(field => {
        if (field === 'date_of_admission' || field === 'date_of_birth') {
          if (!values[field]) {
            newErrors[field] = true;
            hasErrors = true;
          }
        } else if (!values[field] || !values[field].toString().trim()) {
          newErrors[field] = true;
          hasErrors = true;
        }
      });
      
      setRequiredErrors(newErrors);
      return !hasErrors;
    }
  }), [values]);

  // Load programs from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("college_programs");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setPrograms(Array.isArray(parsed) ? parsed : []);
      } catch (e) {
        console.error("Failed to parse college_programs", e);
      }
    }
  }, []);

  // Handle blur for required fields
  const handleRequiredBlur = (e) => {
    const { name, value } = e.target;
    if (!value || !value.toString().trim()) {
      setRequiredErrors((prev) => ({ ...prev, [name]: true }));
    } else {
      setRequiredErrors((prev) => ({ ...prev, [name]: false }));
    }
    handleBlur(e);
  };

  // Handle change for required fields (clear error on typing)
  const handleRequiredChange = (e) => {
    const { name, value } = e.target;
    handleChange(e);
    if (value && value.toString().trim()) {
      setRequiredErrors((prev) => ({ ...prev, [name]: false }));
    }
  };

  // Handle DatePicker required
  const handleDateChange = (field, date) => {
    setFieldValue(field, date);
    setRequiredErrors((prev) => ({ ...prev, [field]: !date }));
  };

  const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 flex justify-center">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
        <div className="space-y-8">

          {/* Profile Photo */}
          <div className="flex justify-center">
            <div className="w-full max-w-xs">
              <label className="block font-medium mb-2 text-gray-700">
                Profile Photo
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={imageName || "No file chosen"}
                  readOnly
                  placeholder="No file chosen"
                  className="w-full border rounded px-3 py-2 bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  className="hidden"
                  id="profilePhoto"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      if (file.size > 500 * 1024) {
                        alert("File size must be less than 500KB");
                        return;
                      }
                      setImageName(file.name);
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFieldValue("avatar", reader.result);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <label
                  htmlFor="profilePhoto"
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                >
                  <Upload className="w-4 h-4" />
                  Upload
                </label>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                jpeg, png, jpg file less than 500kb
              </p>
            </div>
          </div>

          {/* Name Fields - 3 fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {["firstname", "middlename", "lastname"].map((field, index) => (
              <div
                key={field}
                className={
                  index === 2
                    ? "md:col-span-2 lg:col-span-1"
                    : "md:col-span-1 lg:col-span-1"
                }
              >
                <label className="block font-medium mb-1 text-gray-700 capitalize">
                  {field === "firstname" && "First Name"}
                  {field === "middlename" && "Middle Name"}
                  {field === "lastname" && "Last Name"}
                  {(field === "firstname" || field === "lastname") && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  name={field}
                  value={values[field] || ""}
                  onChange={handleRequiredChange}
                  onBlur={handleRequiredBlur}
                  placeholder={`Enter ${field.replace("name", " Name")}`}
                  className={`w-full border rounded px-3 py-2 focus:outline-none transition-colors ${
                    (requiredErrors[field] ||
                      (errors[field] && touched[field])) &&
                    (field === "firstname" || field === "lastname")
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 focus:border-blue-500"
                  }`}
                />
                {(requiredErrors[field] ||
                  (errors[field] && touched[field])) &&
                  (field === "firstname" || field === "lastname") && (
                    <p className="mt-1 text-sm text-red-600">Required</p>
                  )}
              </div>
            ))}
          </div>

          {/* Program, Phone, Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Program */}
            <div className="md:col-span-1 lg:col-span-1">
              <CustomSelect
                label="Program"
                value={programs.find(p => p.program_id === values.grade_id)?.program_name || ""}
                onChange={(selectedName) => {
                  const selectedProgram = programs.find(p => p.program_name === selectedName);
                  const event = {
                    target: {
                      name: "grade_id",
                      value: selectedProgram ? selectedProgram.program_id : ""
                    }
                  };
                  handleRequiredChange(event);
                }}
                options={programs.map(p => p.program_name)}
                placeholder="--Select Program--"
                required={true}
                error={requiredErrors.grade_id}
              />
            </div>

            {/* Phone */}
            <div className="md:col-span-1 lg:col-span-1">
              <label className="block font-medium mb-1 text-gray-700">
                Phone<span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="mobile"
                value={values.mobile || ""}
                onChange={handleRequiredChange}
                onBlur={handleRequiredBlur}
                placeholder="Enter Phone"
                className={`w-full border rounded px-3 py-2 focus:outline-none transition-colors ${
                  requiredErrors.mobile
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 focus:border-blue-500"
                }`}
              />
              {requiredErrors.mobile && (
                <p className="mt-1 text-sm text-red-600">Required</p>
              )}
            </div>

            {/* Email */}
            <div className="md:col-span-1 lg:col-span-1">
              <label className="block font-medium mb-1 text-gray-700">
                E-mail Id<span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={values.email || ""}
                onChange={handleRequiredChange}
                onBlur={handleRequiredBlur}
                placeholder="Enter Email"
                className={`w-full border rounded px-3 py-2 focus:outline-none transition-colors ${
                  requiredErrors.email
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 focus:border-blue-500"
                }`}
              />
              {requiredErrors.email && (
                <p className="mt-1 text-sm text-red-600">Required</p>
              )}
            </div>
          </div>

          {/* Date of Admission, DOB, Gender */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Date of Admission */}
            <div className="md:col-span-1 lg:col-span-1">
              <label className="block font-medium mb-1 text-gray-700">
                Date of Admission<span className="text-red-500">*</span>
              </label>
              <DatePicker
                selected={values.date_of_admission}
                onChange={(date) => handleDateChange("date_of_admission", date)}
                onBlur={() => {
                  if (!values.date_of_admission) {
                    setRequiredErrors((prev) => ({
                      ...prev,
                      date_of_admission: true,
                    }));
                  }
                }}
                placeholderText="dd/mm/yyyy"
                dateFormat="dd/MM/yyyy"
                showYearDropdown
                maxDate={new Date()}
                isClearable
                wrapperClassName="w-full"
                className={`w-full border rounded px-3 py-2 h-10 focus:outline-none transition-colors ${
                  requiredErrors.date_of_admission
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 focus:border-blue-500"
                }`}
              />
              {requiredErrors.date_of_admission && (
                <p className="mt-1 text-sm text-red-600">Required</p>
              )}
            </div>

            {/* Date of Birth */}
            <div className="md:col-span-1 lg:col-span-1">
              <label className="block font-medium mb-1 text-gray-700">
                Date of Birth<span className="text-red-500">*</span>
              </label>
              <DatePicker
                selected={values.date_of_birth}
                onChange={(date) => handleDateChange("date_of_birth", date)}
                onBlur={() => {
                  if (!values.date_of_birth) {
                    setRequiredErrors((prev) => ({
                      ...prev,
                      date_of_birth: true,
                    }));
                  }
                }}
                placeholderText="dd/mm/yyyy"
                dateFormat="dd/MM/yyyy"
                showYearDropdown
                maxDate={new Date()}
                isClearable
                wrapperClassName="w-full"
                className={`w-full border rounded px-3 py-2 h-10 focus:outline-none transition-colors ${
                  requiredErrors.date_of_birth
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 focus:border-blue-500"
                }`}
              />
              {requiredErrors.date_of_birth && (
                <p className="mt-1 text-sm text-red-600">Required</p>
              )}
            </div>

            {/* Gender */}
            <div className="md:col-span-1 lg:col-span-1">
              <CustomSelect
                label="Gender"
                value={values.gender || ""}
                onChange={(selectedGender) => {
                  const event = {
                    target: {
                      name: "gender",
                      value: selectedGender
                    }
                  };
                  handleRequiredChange(event);
                }}
                options={["MALE", "FEMALE", "TRANSGENDER", "OTHER"]}
                placeholder="--Select Gender--"
                required={true}
                error={requiredErrors.gender}
              />
            </div>
          </div>

          {/* Optional Fields + PRN Required - 15 fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { name: "blood_group", label: "Blood Group", type: "dropdown" },
              { name: "mother_tongue", label: "Mother Tongue", placeholder: "Enter Mother Tongue" },
              { name: "birthplace", label: "Birth Place", placeholder: "Enter Birth Place" },
              { name: "caste", label: "Caste", placeholder: "Enter Caste" },
              { name: "sub_cast", label: "Sub Caste", placeholder: "Enter Sub Caste" },
              { name: "cast_category", label: "Caste Category", placeholder: "Enter Category" },
              { name: "aadhar_number", label: "Aadhaar Card", placeholder: "Enter Aadhaar" },
              { name: "name_as_per_aadhaar_card", label: "Name As Per Aadhar Card", placeholder: "Enter Name" },
              { name: "religion", label: "Religion", placeholder: "Enter Religion" },
              { name: "school_house", label: "Class House", placeholder: "Enter House" },
              { name: "weight", label: "Weight (kg)", placeholder: "Enter Weight" },
              { name: "native_place", label: "Native Place", placeholder: "Enter Native Place" },
              { name: "permanent_registration_number", label: "Permanent Registration No", placeholder: "Enter PRN", required: true },
              { name: "admission_number", label: "Admission Number", placeholder: "Enter Admission No" },
              { name: "roll_number", label: "Roll Number", placeholder: "Enter Roll Number" },
              { name: "saral_id", label: "Saral ID", placeholder: "Enter Saral ID" },
            ].map((field) => (
              <div key={field.name}>
                <label className="block font-medium mb-1 text-gray-700">
                  {field.label}
                  {field.name === "permanent_registration_number" && <span className="text-red-500">*</span>}
                </label>

                {field.type === "dropdown" ? (
                  <CustomSelect
                    label=""
                    value={values.blood_group || ""}
                    onChange={(selectedGroup) => {
                      const event = {
                        target: {
                          name: "blood_group",
                          value: selectedGroup
                        }
                      };
                      handleChange(event);
                    }}
                    options={bloodGroups}
                    placeholder="--Select Blood Group--"
                  />
                ) : (
                  <input
                    type="text"
                    name={field.name}
                    value={values[field.name] || ""}
                    onChange={
                      field.name === "permanent_registration_number"
                        ? handleRequiredChange
                        : handleChange
                    }
                    onBlur={
                      field.name === "permanent_registration_number"
                        ? handleRequiredBlur
                        : handleBlur
                    }
                    placeholder={field.placeholder}
                    className={`w-full border rounded px-3 py-2 focus:outline-none transition-colors ${
                      (field.name === "permanent_registration_number" &&
                        requiredErrors[field.name]) ||
                      (errors[field.name] && touched[field.name])
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-300 focus:border-blue-500"
                    }`}
                  />
                )}

                {(field.name === "permanent_registration_number" &&
                  requiredErrors[field.name]) ||
                (errors[field.name] && touched[field.name]) ? (
                  <p className="mt-1 text-sm text-red-600">Required</p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

export default PersonalTab;