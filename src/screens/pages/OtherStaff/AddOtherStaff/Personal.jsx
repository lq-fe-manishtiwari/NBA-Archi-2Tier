import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";

const SafeDatePicker = ({ selected, error, ...props }) => {
  const isValidDate = (date) => date && !isNaN(new Date(date).getTime());
  const safeDate =
    typeof selected === "string"
      ? isValidDate(selected)
        ? new Date(selected)
        : null
      : isValidDate(selected)
      ? selected
      : null;

  return (
    <div className="w-full">
    <DatePicker
      {...props}
      selected={safeDate}
      onChange={props.onChange}
      dateFormat="dd/MM/yyyy"
      className={`w-full border rounded px-3 py-2 focus:outline-none transition-colors ${
        error ? "border-red-500" : "border-gray-300 focus:border-blue-500"
      }`}
      placeholderText={props.placeholderText || "Select date"}
    />
    </div>
  );
};

const personal = ({
  subjects,
  departments,
  handleMaritalStatusChangeEve,
  avatar,
  uploading_avatar,
  onFileChangeHandler,
  resetFileHandler,
  sizePError,
  fileError,
  values,
  handleChange,
  handleBlur,
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

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 flex justify-center">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">

        <form className="space-y-8">
          {/* Photo Upload */}
          <div className="flex justify-center w-full">
  <div className="max-w-xs w-full text-center">
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
      {sizePError && (
        <p className="mt-1 text-sm text-red-600">{fileError}</p>
      )}
      <p className="mt-1 text-xs text-gray-500 text-center">
        Supported: jpeg, png, jpg (Max 500KB)
      </p>
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
              Department <span className="text-red-500">*</span>
              </label>
              <select
      name="departmentId"
      value={values.departmentId || ""}
      onChange={handleChange}
      className={`w-full border rounded px-3 py-2 focus:outline-none transition-colors ${
        errors.departmentId && touched.departmentId
          ? "border-red-500"
          : "border-gray-300 focus:border-blue-500"
      }`}
    >
      <option value="">Select Department</option>
      {departments?.map((dept) => (
        <option key={dept.department_id} value={dept.department_id}>
          {dept.department_name}
        </option>
      ))}
    </select>
    {errors.departmentId && touched.departmentId && (
      <p className="mt-1 text-sm text-red-600">{errors.departmentId}</p>
    )}
  </div>

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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
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
          
             <div>
              <label className="block font-medium mb-1 text-gray-700">Date of Birth</label>
              <SafeDatePicker
                selected={values.date_of_birth}
                onChange={(date) => setFieldValue("date_of_birth", date)}
                filterDate={(date) => moment(date).isBefore(moment())}
                isClearable
                placeholderText="Select DOB"
                className="w-full border rounded px-3 py-2 focus:outline-none border-gray-300 focus:border-blue-500 transition-colors"
                error={errors.date_of_birth && touched.date_of_birth}
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
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
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

          {/* Family Info */}
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
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
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
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
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

          {/* Employment Info */}

           <div>
  <label className="block font-medium mb-1 text-gray-700">
    Employee ID <span className="text-red-500">*</span>
  </label>
  <input
    type="text"
    name="employee_id"
    value={values.employee_id || ""}
    onChange={handleChange}
    onBlur={handleBlur}
    placeholder="Enter Employee ID"
    className={`w-full border rounded px-3 py-2 focus:outline-none transition-colors ${
      errors.employee_id ? "border-red-500" : "border-gray-300 focus:border-blue-500"
    }`}              
  />
  {errors.employee_id && (
    <p className="mt-1 text-sm text-red-600">{errors.employee_id}</p>
  )}
</div>

            <div>
              <label className="block font-medium mb-1 text-gray-700">
                Date of Joining <span className="text-red-500">*</span>
              </label>
              <SafeDatePicker
                selected={values.date_of_joining}
                onChange={(date) => setFieldValue("date_of_joining", date)}
                filterDate={(date) => moment(date).isBefore(moment())}
                isClearable
                placeholderText="Select DOJ"
                error={errors.date_of_joining && touched.date_of_joining}
                className={`w-full border rounded px-3 py-2 focus:outline-none transition-colors ${
                  errors.date_of_joining && touched.date_of_joining
                    ? "border-red-500"
                    : "border-gray-300 focus:border-blue-500"
                }`}
              />
              {errors.date_of_joining && touched.date_of_joining && (
                <p className="mt-1 text-sm text-red-600">{errors.date_of_joining}</p>
              )}
            </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
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

          {/* Bank Info */}
          
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
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
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

export default personal;
