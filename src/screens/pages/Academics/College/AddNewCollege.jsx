import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SweetAlert from "react-bootstrap-sweetalert";
import { collegeService } from "../Services/college.service";
import { useColleges } from "../../../../contexts/CollegeContext";

const AddNewCollege = () => {
  const navigate = useNavigate();
  const [animate, setAnimate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const { refreshColleges } = useColleges();

  const [formData, setFormData] = useState({
    name: "",
    logo: null,
    code: "",
    address: "",
    email: "",
    type: "",
    website: "",
    courses: [],
    courseInput: "",

    // === NEW FIELDS ===
    institutionType: "", // Main type (radio)
    institutionTypeOther: "",
    autonomousYear: "",
    autonomousDuration: "",
    establishmentYear: "",
    ownershipStatus: "",
    ownershipOther: "",
    affiliatingUniversityName: "",
    affiliatingUniversityAddress: "",
    otherInstitutions: "",

    head_name: "",
    head_email: "",
    head_mobile: "",
  });

  const [errors, setErrors] = useState({});
  const [showCancelAlert, setShowCancelAlert] = useState(false);

  useEffect(() => setAnimate(true), []);

  const normalizeWebsite = (url) => {
    if (!url) return "";
    return /^https?:\/\//i.test(url) ? url : `https://${url}`;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setIsDirty(true);

    // Update form data
    if (name === "logo") {
      setFormData((prev) => ({ ...prev, logo: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // ✅ Clear error for this field
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const { [name]: removed, ...rest } = prev;
      return rest;
    });
  };


  const handleCourseInputKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === ",") && formData.courseInput.trim()) {
      e.preventDefault();
      setIsDirty(true);
      const newCourse = formData.courseInput.trim();
      if (!formData.courses.includes(newCourse)) {
        setFormData({
          ...formData,
          courses: [...formData.courses, newCourse],
          courseInput: "",
        });
      } else {
        setFormData({ ...formData, courseInput: "" });
      }
    }
    if (e.key === "Backspace" && !formData.courseInput) {
      setIsDirty(true);
      setFormData({
        ...formData,
        courses: formData.courses.slice(0, -1),
      });
    }
  };

  const removeCourse = (course) =>
    setFormData({
      ...formData,
      courses: formData.courses.filter((c) => c !== course),
    });

  const validate = () => {
    const newErrors = {};
    const websiteRegex =
      /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/;

    // ===== BASIC DETAILS =====
    if (!formData.name.trim()) newErrors.name = "College name is required";

    if (!formData.code.trim())
      newErrors.code = "College code is required";

    if (!formData.logo)
      newErrors.logo = "College logo is required";

    if (!formData.email.trim())
      newErrors.email = "College email is required";
    else if (!/^[\w.-]+@[\w.-]+\.\w+$/.test(formData.email))
      newErrors.email = "Invalid email format";

    // Website (URL validation)
    if (!formData.website.trim()) {
      newErrors.website = "College website is required";
    } else if (!websiteRegex.test(formData.website.trim())) {
      newErrors.website = "Enter a valid website URL";
    }

    if (!formData.address.trim())
      newErrors.address = "College address is required";

    if (!formData.city?.trim())
      newErrors.city = "City is required";

    if (!formData.state?.trim())
      newErrors.state = "State is required";

    if (!formData.pin_code?.trim())
      newErrors.pin_code = "Pin code is required";

    // ===== INSTITUTION DETAILS =====
    if (!formData.institutionType)
      newErrors.institutionType = "Institution type is required";

    if (
      formData.institutionType === "Other" &&
      !formData.institutionTypeOther.trim()
    )
      newErrors.institutionTypeOther = "Please specify institution type";

    if (!formData.establishmentYear.trim())
      newErrors.establishmentYear = "Year of establishment is required";
    else if (!/^\d{4}$/.test(formData.establishmentYear))
      newErrors.establishmentYear = "Enter a valid 4-digit year";

    // ===== OWNERSHIP =====
    if (!formData.ownershipStatus)
      newErrors.ownershipStatus = "Ownership status is required";

    if (
      formData.ownershipStatus === "Other" &&
      !formData.ownershipOther.trim()
    )
      newErrors.ownershipOther = "Please specify ownership details";

    // ===== COURSES =====
    // if (formData.courses.length === 0)
    //   newErrors.courses = "At least one course is required";

    // ===== HEAD OF INSTITUTION =====
    if (!formData.head_name.trim())
      newErrors.head_name = "Head name is required";

    if (!formData.head_email.trim())
      newErrors.head_email = "Head email is required";
    else if (!/^[\w.-]+@[\w.-]+\.\w+$/.test(formData.head_email))
      newErrors.head_email = "Invalid email format";

    if (!formData.head_mobile.trim())
      newErrors.head_mobile = "Mobile number is required";
    else if (!/^\d{10}$/.test(formData.head_mobile))
      newErrors.head_mobile = "Enter valid 10-digit mobile number";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setAlert(null);

    try {
      const collegeData = {
        college_name: formData.name, //
        college_address: formData.address, //
        city: formData.city, //
        state: formData.state, //
        pin_code: formData.pin_code, //
        college_code: formData.code, //
        year_of_establishment: formData.establishmentYear,
        college_logo: formData.logo ? formData.logo.name : "", //
        college_type: formData.type,
        college_email: formData.email,  //
        website: normalizeWebsite(formData.website),  //
        ownership_status: formData.ownershipStatus === "Other" ? formData.ownershipOther : formData.ownershipStatus, //
        course_affiliated_with: formData.courses.join(", "), //
        institution_type: formData.institutionType === "Other" ? formData.institutionTypeOther : formData.institutionType, //

        autonomous_year: formData.autonomousYear || null,
        autonomous_duration: formData.autonomousDuration || null,

        affiliating_university_name: formData.affiliatingUniversityName || null, 
        affiliating_university_address: formData.affiliatingUniversityAddress || null,
        other_institutions: formData.otherInstitutions || null,

        // affiliating_university_name: formData.affiliatingUniversityName?.trim() || null,
        // affiliating_university_address: formData.affiliatingUniversityAddress?.trim() || null,
        // other_institutions: formData.otherInstitutions?.trim() || null,

        head_name: formData.head_name || null,
        head_email: formData.head_email || null,
        head_mobile: formData.head_mobile || null,
      };

      const result = await collegeService.submitCollegeRequest(collegeData);
      await refreshColleges();
      setLoading(false);

      setAlert(
        <SweetAlert
          success
          title="College Saved!"
          onConfirm={() => {
            setAlert(null);
            navigate("/academics/college");
          }}
          confirmBtnCssClass="btn-confirm"
        >
          {`${result.college_name} has been added successfully.`}
        </SweetAlert>
      );
    } catch (error) {
      setLoading(false);
      const backendMessage = error?.message || error || "Failed to save college.";

      if (backendMessage.includes("College code already exists")) {
        setErrors((prev) => ({ ...prev, code: "College code already exists" }));
        return;
      }

      setAlert(
        <SweetAlert
          danger
          title="Error"
          onConfirm={() => setAlert(null)}
          confirmBtnCssClass="btn-confirm"
        >
          {backendMessage}
        </SweetAlert>
      );
    }
  };

  const handleCancel = () => {
    if (isDirty) setShowCancelAlert(true);
    else navigate("/academics/college");
  };

  const handleConfirmCancel = () => {
    setShowCancelAlert(false);
    navigate("/academics/college");
  };

  return (
    <div className="w-full min-h-screen bg-white sm:bg-gray-50 p-3 sm:p-6 flex justify-center">
      <div
        className={`w-full sm:max-w-5xl bg-white rounded-2xl shadow-lg border border-gray-200 p-6 transform transition-all duration-500 ${animate
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-10"
          }`}
      >
        <button
          onClick={() => navigate("/academics/college")}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-3xl font-bold"
          aria-label="Close"
        >
          ×
        </button>

        <h2 className="text-2xl font-bold mb-8 text-center text-blue-700">
          Add New College - Institutional Details
        </h2>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* 1. Name and Address of Institution (Read-only) */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-3">1. Name and Address of the Institution</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><strong lawfully>Name:</strong> {formData.name || "Not entered yet"}</div>
              <div><strong>Address:</strong> {formData.address || "Not entered yet"}</div>
            </div>
          </div>

          {/* Existing Fields (Name, Logo, Code, etc.) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* College Name */}
            <div>
              <label className="block font-medium mb-1">College Name <span className="text-red-500">*</span></label>
              <input type="text" name="name" value={formData.name} onChange={handleChange}
                className={`w-full border rounded px-3 py-2 ${errors.name ? "border-red-500" : "border-gray-300"}`} />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* College Code */}
            <div>
              <label className="block font-medium mb-1">College Code <span className="text-red-500">*</span></label>
              <input type="text" name="code" value={formData.code} onChange={handleChange}
                className={`w-full border rounded px-3 py-2 ${errors.code ? "border-red-500" : "border-gray-300"}`} />
              {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
            </div>

            {/* Logo */}
            <div>
              <label className="block font-medium mb-1">College Logo <span className="text-red-500">*</span></label>
              <input type="file" name="logo" accept="image/*" onChange={handleChange}
                className={`w-full border rounded px-3 py-2 ${errors.logo ? "border-red-500" : "border-gray-300"}`} />
              {errors.logo && <p className="text-red-500 text-sm mt-1">{errors.logo}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block font-medium mb-1">College Email <span className="text-red-500">*</span></label>
              <input type="email" name="email" value={formData.email} onChange={handleChange}
                className={`w-full border rounded px-3 py-2 ${errors.email ? "border-red-500" : "border-gray-300"}`} />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block font-medium mb-1">College Website <span className="text-red-500">*</span></label>
              <input type="text" name="website" value={formData.website} onChange={handleChange} placeholder="https://www.example.edu"
                className={`w-full border rounded px-3 py-2 ${errors.website ? "border-red-500" : "border-gray-300"}`} />
              {errors.website && <p className="text-red-500 text-sm mt-1">{errors.website}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block font-medium mb-1">College Address <span className="text-red-500">*</span></label>
              <textarea name="address" value={formData.address} onChange={handleChange} rows="3"
                className={`w-full border rounded px-3 py-2 ${errors.address ? "border-red-500" : "border-gray-300"}`} />
              {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* City */}
            <div>
              <label className="block font-medium mb-1">City <span className="text-red-500">*</span></label>
              <input type="text" name="city" value={formData.city} onChange={handleChange}
                className={`w-full border rounded px-3 py-2 ${errors.city ? "border-red-500" : "border-gray-300"}`} />
              {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
            </div>

            {/* State  */}
            <div>
              <label className="block font-medium mb-1">State <span className="text-red-500">*</span></label>
              <input type="text" name="state" value={formData.state} onChange={handleChange}
                className={`w-full border rounded px-3 py-2 ${errors.state ? "border-red-500" : "border-gray-300"}`} />
              {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
            </div>

            {/* Pin Code */}
            <div>
              <label className="block font-medium mb-1">Pin Code <span className="text-red-500">*</span></label>
              <input type="text" name="pin_code" value={formData.pin_code} onChange={handleChange}
                className={`w-full border rounded px-3 py-2 ${errors.pin_code ? "border-red-500" : "border-gray-300"}`} />
              {errors.pin_code && <p className="text-red-500 text-sm mt-1">{errors.pin_code}</p>}
            </div>
          </div>

          {/* 2. Type of Institution */}
          <div className="bg-gray-50 p-5 rounded-lg border">
            <label className="block font-semibold mb-3">2. Type of the Institution <span className="text-red-500">*</span></label>
            <div className="space-y-2">
              {["Institute of National Importance", "Deemed to be University", "University", "Autonomous", "Non-Autonomous (Affiliated)", "Other"].map((type) => (
                <label key={type} className="flex items-center">
                  <input
                    type="radio"
                    name="institutionType"
                    value={type}
                    checked={formData.institutionType === type}
                    onChange={handleChange}
                    className="mr-3"
                  />
                  <span>{type}</span>
                </label>
              ))}
              {formData.institutionType === "Other" && (
                <input
                  type="text"
                  name="institutionTypeOther"
                  value={formData.institutionTypeOther}
                  onChange={handleChange}
                  placeholder="Please specify"
                  className="w-full mt-2 border rounded px-3 py-2"
                />
              )}
            </div>
            {errors.institutionType && <p className="text-red-500 text-sm mt-2">{errors.institutionType}</p>}
            {errors.institutionTypeOther && <p className="text-red-500 text-sm mt-2">{errors.institutionTypeOther}</p>}

            {/* Conditional Fields for Autonomous / Deemed */}
            {(formData.institutionType === "Autonomous" || formData.institutionType === "Deemed to be University") && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-300 rounded">
                <p className="text-sm font-medium text-amber-800 mb-3">
                  Note: Please provide year and duration of autonomous/deemed status
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="autonomousYear"
                    value={formData.autonomousYear}
                    onChange={handleChange}
                    placeholder="Year of Grant (e.g. 2020)"
                    className="border rounded px-3 py-2"
                  />
                  <input
                    type="text"
                    name="autonomousDuration"
                    value={formData.autonomousDuration}
                    onChange={handleChange}
                    placeholder="Duration (e.g. 5 years / Permanent)"
                    className="border rounded px-3 py-2"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 3. Year of Establishment */}
          <div>
            <label className="block font-medium mb-1">3. Year of Establishment of the Institution <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="establishmentYear"
              value={formData.establishmentYear}
              onChange={handleChange}
              placeholder="e.g. 1995"
              className={`w-full md:w-48 border rounded px-3 py-2 ${errors.establishmentYear ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.establishmentYear && <p className="text-red-500 text-sm mt-1">{errors.establishmentYear}</p>}
          </div>

          {/* 4. Ownership Status */}
          <div className="bg-gray-50 p-5 rounded-lg border">
            <label className="block font-semibold mb-3">4. Ownership Status <span className="text-red-500">*</span></label>
            <div className="space-y-2">
              {["Central Government", "State Government", "Grant-in-Aid", "Self-financing", "Trust", "Other"].map((opt) => (
                <label key={opt} className="flex items-center">
                  <input
                    type="radio"
                    name="ownershipStatus"
                    value={opt}
                    checked={formData.ownershipStatus === opt}
                    onChange={handleChange}
                    className="mr-3"
                  />
                  <span>{opt}</span>
                </label>
              ))}
              {formData.ownershipStatus === "Other" && (
                <input
                  type="text"
                  name="ownershipOther"
                  value={formData.ownershipOther}
                  onChange={handleChange}
                  placeholder="Please specify"
                  className="w-full mt-2 border rounded px-3 py-2"
                />
              )}
            </div>
            {errors.ownershipStatus && <p className="text-red-500 text-sm mt-2">{errors.ownershipStatus}</p>}
            {errors.ownershipOther && <p className="text-red-500 text-sm mt-2">{errors.ownershipOther}</p>}
          </div>

          {/* 5. Affiliating University */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-medium mb-1">5. Name of Affiliating University (if applicable)</label>
              <input
                type="text"
                name="affiliatingUniversityName"
                value={formData.affiliatingUniversityName}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 border-gray-300"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Address of Affiliating University</label>
              <input
                type="text"
                name="affiliatingUniversityAddress"
                value={formData.affiliatingUniversityAddress}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 border-gray-300"
              />
            </div>
          </div>

          {/* 6. Other Institutions */}
          <div>
            <label className="block font-medium mb-1">6. Other Academic Institutions Run by Trust/Society (if any)</label>
            <textarea
              name="otherInstitutions"
              value={formData.otherInstitutions}
              onChange={handleChange}
              rows="3"
              placeholder="List other institutions (if any)"
              className="w-full border rounded px-3 py-2 border-gray-300"
            />
          </div>
          {/* 7. Head of Institution Details */}
          <div className="bg-gray-50 p-5 rounded-lg border mt-6">
            <h3 className="font-semibold mb-3">7. Head of Institution Details</h3>

            {/* Head Name */}
            <div className="mb-4">
              <label className="block font-medium mb-1">
                Head Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="head_name"
                value={formData.head_name}
                onChange={handleChange}
                className={`w-full border rounded px-3 py-2 ${errors.head_name ? "border-red-500" : "border-gray-300"
                  }`}
              />
              {errors.head_name && (
                <p className="text-red-500 text-sm mt-1">{errors.head_name}</p>
              )}
            </div>

            {/* Head Email */}
            <div className="mb-4">
              <label className="block font-medium mb-1">
                Head Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="head_email"
                value={formData.head_email}
                onChange={handleChange}
                className={`w-full border rounded px-3 py-2 ${errors.head_email ? "border-red-500" : "border-gray-300"
                  }`}
              />
              {errors.head_email && (
                <p className="text-red-500 text-sm mt-1">{errors.head_email}</p>
              )}
            </div>

            {/* Head Mobile */}
            <div className="mb-4">
              <label className="block font-medium mb-1">
                Head Mobile <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="head_mobile"
                value={formData.head_mobile}
                onChange={handleChange}
                placeholder="10-digit number"
                className={`w-full border rounded px-3 py-2 ${errors.head_mobile ? "border-red-500" : "border-gray-300"
                  }`}
              />
              {errors.head_mobile && (
                <p className="text-red-500 text-sm mt-1">{errors.head_mobile}</p>
              )}
            </div>
          </div>


          {/* Courses & Submit */}
          <div className="col-span-1 sm:col-span-2">
            <label className="block font-medium mb-1">Courses Affiliated </label>
            <div className="flex flex-wrap gap-2 border rounded px-3 py-2 min-h-[40px] focus-within:ring-2 focus-within:ring-blue-300">
              {formData.courses.map((course) => (
                <span key={course} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  {course}
                  <button type="button" onClick={() => removeCourse(course)} className="ml-1 font-bold">×</button>
                </span>
              ))}
              <input
                type="text"
                value={formData.courseInput}
                onChange={(e) => {
                  setFormData({ ...formData, courseInput: e.target.value });
                  setErrors((prev) => {
                    const { courses, ...rest } = prev;
                    return rest;
                  });
                }}
                onKeyDown={handleCourseInputKeyDown}
                placeholder="Type course and press Enter"
                className="flex-1 outline-none min-w-[200px]"
              />
            </div>
            {/* {errors.courses && <p className="text-red-500 text-sm mt-1">{errors.courses}</p>} */}
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t">
            <button type="button" onClick={handleCancel}
              className="px-6 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-70">
              {loading ? "Saving..." : "Save College"}
            </button>
          </div>
        </form>
      </div>

      {/* Alerts */}
      {showCancelAlert && (
        <SweetAlert warning showCancel confirmBtnText="Yes, leave" cancelBtnText="Stay"
          onConfirm={handleConfirmCancel} onCancel={() => setShowCancelAlert(false)}>
          Your data will be lost if you leave this page.
        </SweetAlert>
      )}
      {alert}
    </div>
  );
};

export default AddNewCollege;