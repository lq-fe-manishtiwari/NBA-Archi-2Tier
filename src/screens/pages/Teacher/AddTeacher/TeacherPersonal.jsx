import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { collegeService } from "../../Academics/Services/college.service";
import { useColleges } from "../../../../contexts/CollegeContext";

const SafeDatePicker = ({ selected, error, ...props }) => {
  const isValidDate = (date) => {
    if (!date) return false;
    const dateObj = new Date(date);
    return dateObj instanceof Date && !isNaN(dateObj.getTime());
  };

  const safeDate = isValidDate(selected) ? new Date(selected) : null;

  return (
    <div className="w-full">
      <DatePicker
        {...props}
        selected={safeDate}
        onChange={props.onChange}
        onSelect={props.onSelect}
        dateFormat="dd/MM/yyyy"
        className={`w-full border rounded px-3 py-2 focus:outline-none transition-colors ${
          error ? "border-red-500" : "border-gray-300 focus:border-blue-500"
        }`}
        placeholderText={props.placeholderText || "Select date"}
        showYearDropdown
        scrollableYearDropdown
        yearDropdownItemNumber={15}
        showMonthDropdown
        isClearable={true}
        autoComplete="off"
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

const TeacherPersonal = ({
  subjects,
  handleMaritalStatusChangeEve,
  avatar,
  uploading_avatar,
  onFileChangeHandler,
  resetFileHandler,
  sizePError,
  fileError,
  values,
  handleChange,
  errors = {},
  touched = {},
  setFieldValue,
}) => {
  const handleFileChange = (e) => {
    if (onFileChangeHandler && e.target.files?.[0]) {
      onFileChangeHandler(e);
    }
    if (e.target.files?.[0]) {
      setFieldValue("avatar_file", e.target.files[0]);
    }
  };

  const handleFileReset = (e) => {
    e.preventDefault();
    if (resetFileHandler) resetFileHandler(e);
    setFieldValue("avatar_file", null);
    setFieldValue("avatar", "");
  };

  // PASS DATE AS NATIVE Date INSTANCE (LocaleDate)
  const handleDateChange = (fieldName, date) => {
    setFieldValue(fieldName, date); // date is a real Date object
  };

  // ---------- New: College dropdown state & fetch ----------
  const { colleges } = useColleges();
  console.log(colleges);
  // const [loadingColleges, setLoadingColleges] = useState(true);
  const [collegeError, setCollegeError] = useState(null);
  const isFetchedRef = React.useRef(false);

  // useEffect(() => {
  //   if (isFetchedRef.current) return;
  //   isFetchedRef.current = true;

  //   const fetchColleges = async () => {
  //     setCollegeError(null);
  //     setLoadingColleges(true);
  //     try {
  //       const data = await collegeService.getAllColleges();
  //       setColleges(data || []);
  //     } catch (err) {
  //       console.error("Failed to fetch colleges:", err);
  //       setCollegeError("Failed to load colleges");
  //     } finally {
  //       setLoadingColleges(false);
  //     }
  //   };

  //   fetchColleges();
  // }, []);
  // ---------------------------------------------------------

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 flex justify-center">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
        <form className="space-y-8">
          {/* Photo Upload */}
          <div className="flex justify-center">
            <div className="w-full max-w-xs">
              <label className="block font-medium mb-2 text-gray-700">Photo</label>
              {avatar ? (
                <div className="text-center">
                  <img
                    src={avatar}
                    alt="Teacher"
                    className="w-32 h-32 rounded-xl object-cover mx-auto shadow-md border-2 border-gray-200"
                  />
                  <button
                    onClick={handleFileReset}
                    className="mt-3 text-orange-600 hover:text-orange-700 underline text-sm font-medium"
                  >
                    Change Image
                  </button>
                </div>
              ) : uploading_avatar ? (
                <div className="text-center py-6">
                  <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
                  <p className="mt-3 text-gray-600 font-medium">Uploading...</p>
                </div>
              ) : (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className={`w-full border rounded px-3 py-2 focus:outline-none transition-colors file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700 ${
                    sizePError ? "border-red-500" : "border-gray-300"
                  }`}
                />
              )}
              {sizePError && <p className="mt-1 text-sm text-red-600">{fileError}</p>}
              <p className="mt-1 text-xs text-gray-500">Supported: jpeg, png, jpg (Max 500KB)</p>
            </div>
          </div>

          {/* College Select (NEW) */}
          <div>
            <label className="block font-medium mb-1 text-gray-700">
              Select College <span className="text-red-500">*</span>
            </label>
            <div>
              {/* {loadingColleges ? (
                <div className="w-full border rounded px-3 py-2 bg-gray-50 text-gray-600">Loading colleges...</div>
              ) : collegeError ? (
                <div className="w-full border rounded px-3 py-2 bg-red-50 text-red-600">{collegeError}</div>
              ) : ( */}
                <select
                  name="college_id"
                  value={values.college_id || ""}
                  onChange={(e) => {
                    handleChange(e);
                    // also keep Formik aware explicitly
                    setFieldValue("college_id", e.target.value);
                  }}
                  className={`w-full border rounded px-3 py-2 focus:outline-none transition-colors ${
                    errors.college_id && touched.college_id
                      ? "border-red-500"
                      : "border-gray-300 focus:border-blue-500"
                  }`}
                >
                  <option value="">Select college</option>
                  {colleges.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.college_name}
                    </option>
                  ))}
                </select>
              {/* )} */}
              {errors.college_id && touched.college_id && (
                <p className="mt-1 text-sm text-red-600">{errors.college_id}</p>
              )}
            </div>
          </div>

          {/* Basic Info - 3 Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {["firstname", "middlename", "lastname"].map((field) => (
              <div key={field}>
                <label className="block font-medium mb-1 text-gray-700 capitalize">
                  {field.replace(/_/g, " ")}{" "}
                  {field !== "middlename" && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  name={field}
                  value={values[field] || ""}
                  onChange={handleChange}
                  placeholder={`Enter ${field}`}
                  className={`w-full border rounded px-3 py-2 focus:outline-none transition-colors ${
                    errors[field] && touched[field]
                      ? "border-red-500"
                      : "border-gray-300 focus:border-blue-500"
                  }`}
                />
                {errors[field] && touched[field] && (
                  <p className="mt-1 text-sm text-red-600">{errors[field]}</p>
                )}
              </div>
            ))}
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block font-medium mb-1 text-gray-700">
                Mobile <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="mobile"
                value={values.mobile || ""}
                onChange={handleChange}
                placeholder="Enter mobile"
                className={`w-full border rounded px-3 py-2 focus:outline-none transition-colors ${
                  errors.mobile && touched.mobile
                    ? "border-red-500"
                    : "border-gray-300 focus:border-blue-500"
                }`}
              />
              {errors.mobile && touched.mobile && (
                <p className="mt-1 text-sm text-red-600">{errors.mobile}</p>
              )}
            </div>

            <div>
              <label className="block font-medium mb-1 text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={values.email || ""}
                onChange={handleChange}
                placeholder="Enter email"
                className={`w-full border rounded px-3 py-2 focus:outline-none transition-colors ${
                  errors.email && touched.email
                    ? "border-red-500"
                    : "border-gray-300 focus:border-blue-500"
                }`}
              />
              {errors.email && touched.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block font-medium mb-1 text-gray-700">Blood Group</label>
              <input
                type="text"
                name="blood_group"
                value={values.blood_group || ""}
                onChange={handleChange}
                placeholder="e.g., O+"
                className="w-full border rounded px-3 py-2 focus:outline-none border-gray-300 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* DOB, Gender, Marital Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block font-medium mb-1 text-gray-700">Date of Birth</label>
              <SafeDatePicker
                selected={values.date_of_birth}
                onChange={(date) => handleDateChange("date_of_birth", date)}
                filterDate={(date) => new Date(date) < new Date()}
                isClearable
                placeholderText="Select DOB"
                error={errors.date_of_birth && touched.date_of_birth ? errors.date_of_birth : ""}
              />
            </div>

            <div>
              <label className="block font-medium mb-1 text-gray-700">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                name="gender"
                value={values.gender || ""}
                onChange={handleChange}
                className={`w-full border rounded px-3 py-2 focus:outline-none transition-colors ${
                  errors.gender && touched.gender
                    ? "border-red-500"
                    : "border-gray-300 focus:border-blue-500"
                }`}
              >
                <option value="">Select gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
              {errors.gender && touched.gender && (
                <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
              )}
            </div>

            <div>
              <label className="block font-medium mb-1 text-gray-700">Marital Status</label>
              <select
                name="marital_status"
                value={values.marital_status || ""}
                onChange={(e) => {
                  handleChange(e);
                  if (handleMaritalStatusChangeEve) handleMaritalStatusChangeEve(e);
                }}
                className="w-full border rounded px-3 py-2 focus:outline-none border-gray-300 focus:border-blue-500 transition-colors"
              >
                <option value="">Select</option>
                <option value="Married">Married</option>
                <option value="Unmarried">Unmarried</option>
              </select>
            </div>
          </div>

          {/* Family Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block font-medium mb-1 text-gray-700">Father Name</label>
              <input
                type="text"
                name="father_name"
                value={values.father_name || ""}
                onChange={handleChange}
                placeholder="Enter father name"
                className="w-full border rounded px-3 py-2 focus:outline-none border-gray-300 focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block font-medium mb-1 text-gray-700">Spouse Name</label>
              <input
                type="text"
                name="spouse_name"
                value={values.spouse_name || ""}
                onChange={handleChange}
                disabled={values.marital_status === "Unmarried"}
                placeholder="Enter spouse name"
                className={`w-full border rounded px-3 py-2 focus:outline-none transition-colors ${
                  values.marital_status === "Unmarried"
                    ? "bg-gray-50 cursor-not-allowed border-gray-300"
                    : "border-gray-300 focus:border-blue-500"
                }`}
              />
            </div>

            <div>
              <label className="block font-medium mb-1 text-gray-700">Designation</label>
              <input
                type="text"
                name="designation"
                value={values.designation || ""}
                onChange={handleChange}
                placeholder="Enter designation"
                className="w-full border rounded px-3 py-2 focus:outline-none border-gray-300 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* ID Numbers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block font-medium mb-1 text-gray-700">Aadhaar Number</label>
              <input
                type="text"
                name="aadhar_number"
                value={values.aadhar_number || ""}
                onChange={handleChange}
                placeholder="Enter Aadhaar"
                className="w-full border rounded px-3 py-2 focus:outline-none border-gray-300 focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block font-medium mb-1 text-gray-700">PAN Number</label>
              <input
                type="text"
                name="pan_number"
                value={values.pan_number || ""}
                onChange={handleChange}
                placeholder="Enter PAN"
                className="w-full border rounded px-3 py-2 focus:outline-none border-gray-300 focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block font-medium mb-1 text-gray-700">UAN Number</label>
              <input
                type="text"
                name="uan_number"
                value={values.uan_number || ""}
                onChange={handleChange}
                placeholder="Enter UAN"
                className="w-full border rounded px-3 py-2 focus:outline-none border-gray-300 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Employment Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block font-medium mb-1 text-gray-700">
                Employee ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="employee_id"
                value={values.employee_id || ""}
                onChange={handleChange}
                placeholder="Enter Employee ID"
                className={`w-full border rounded px-3 py-2 focus:outline-none transition-colors ${
                  errors.employee_id && touched.employee_id
                    ? "border-red-500"
                    : "border-gray-300 focus:border-blue-500"
                }`}
              />
              {errors.employee_id && touched.employee_id && (
                <p className="mt-1 text-sm text-red-600">{errors.employee_id}</p>
              )}
            </div>

            <div>
              <label className="block font-medium mb-1 text-gray-700">
                Date of Joining <span className="text-red-500">*</span>
              </label>
              <SafeDatePicker
                selected={values.date_of_joining}
                onChange={(date) => handleDateChange("date_of_joining", date)}
                filterDate={(date) => new Date(date) < new Date()}
                isClearable
                placeholderText="Select DOJ"
                error={errors.date_of_joining && touched.date_of_joining ? errors.date_of_joining : ""}
              />
            </div>

            <div>
              <label className="block font-medium mb-1 text-gray-700">Financial Year</label>
              <input
                type="text"
                name="financial_year"
                value={values.financial_year || ""}
                onChange={handleChange}
                placeholder="e.g., 2024-25"
                className="w-full border rounded px-3 py-2 focus:outline-none border-gray-300 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Bank Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block font-medium mb-1 text-gray-700">Bank Name</label>
              <input
                type="text"
                name="bank_name"
                value={values.bank_name || ""}
                onChange={handleChange}
                placeholder="Enter bank name"
                className="w-full border rounded px-3 py-2 focus:outline-none border-gray-300 focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block font-medium mb-1 text-gray-700">Bank Account No.</label>
              <input
                type="text"
                name="bank_account_no"
                value={values.bank_account_no || ""}
                onChange={handleChange}
                placeholder="Enter account number"
                className="w-full border rounded px-3 py-2 focus:outline-none border-gray-300 focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block font-medium mb-1 text-gray-700">IFSC Code</label>
              <input
                type="text"
                name="ifsc_code"
                value={values.ifsc_code || ""}
                onChange={handleChange}
                placeholder="Enter IFSC"
                className="w-full border rounded px-3 py-2 focus:outline-none border-gray-300 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Salary Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block font-medium mb-1 text-gray-700">Cost to Company</label>
              <input
                type="number"
                name="cost_to_company"
                value={values.cost_to_company || ""}
                onChange={handleChange}
                placeholder="Enter CTC"
                className="w-full border rounded px-3 py-2 focus:outline-none border-gray-300 focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block font-medium mb-1 text-gray-700">Deduction</label>
              <input
                type="number"
                name="deduction"
                value={values.deduction || ""}
                onChange={handleChange}
                placeholder="Enter deduction"
                className="w-full border rounded px-3 py-2 focus:outline-none border-gray-300 focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block font-medium mb-1 text-gray-700">Net Pay</label>
              <input
                type="number"
                name="net_pay"
                value={values.net_pay || ""}
                onChange={handleChange}
                placeholder="Enter net pay"
                className="w-full border rounded px-3 py-2 focus:outline-none border-gray-300 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherPersonal;
