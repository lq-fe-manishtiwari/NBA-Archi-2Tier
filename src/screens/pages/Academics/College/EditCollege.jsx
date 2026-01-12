import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SweetAlert from "react-bootstrap-sweetalert";
import { collegeService } from "../Services/college.service";
import { useColleges } from "../../../../contexts/CollegeContext";

const EditCollege = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshColleges } = useColleges();

  const [animate, setAnimate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [showCancelAlert, setShowCancelAlert] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    logo: null,
    code: "",
    address: "",
    email: "",
    website: "",
    city: "",
    state: "",
    pin_code: "",
    type: "",
    courses: [],
    courseInput: "",

    // New Institutional Fields
    institutionType: "",
    institutionTypeOther: "",
    autonomousYear: "",
    autonomousDuration: "",
    establishmentYear: "",
    ownershipStatus: "",
    ownershipOther: "",
    affiliatingUniversityName: "",
    affiliatingUniversityAddress: "",
    otherInstitutions: "",

    // Head of Institution
    head_name: "",
    head_email: "",
    head_mobile: "",
  });

  const [errors, setErrors] = useState({});
  const isFetchedRef = React.useRef(false);

  useEffect(() => {
    setAnimate(true);
    if (!isFetchedRef.current) {
      fetchCollegeDetails();
      isFetchedRef.current = true;
    }
  }, []);

  const fetchCollegeDetails = async () => {
    try {
      const data = await collegeService.getCollegeDetails(id);

      // Handle "Other" in institution type
      let institutionType = data.institution_type || "";
      let institutionTypeOther = "";
      const validTypes = [
        "Institute of National Importance",
        "Deemed to be University",
        "University",
        "Autonomous",
        "Non-Autonomous (Affiliated)",
      ];
      if (institutionType && !validTypes.includes(institutionType)) {
        institutionTypeOther = institutionType;
        institutionType = "Other";
      }

      // Handle "Other" in ownership
      let ownershipStatus = data.ownership_status || "";
      let ownershipOther = "";
      const validOwnerships = ["Central Government", "State Government", "Grant-in-Aid", "Self-financing", "Trust"];
      if (ownershipStatus && !validOwnerships.includes(ownershipStatus)) {
        ownershipOther = ownershipStatus;
        ownershipStatus = "Other";
      }

      setFormData({
        name: data.college_name || "",
        logo: null, // Can't pre-fill file input
        code: data.college_code || "",
        address: data.college_address || "",
        email: data.college_email || "",
        website: data.website || "",
        city: data.city || "",
        state: data.state || "",
        pin_code: data.pin_code || "",
        type: data.college_type || "",
        courses: data.course_affiliated_with
          ? data.course_affiliated_with.split(",").map((c) => c.trim())
          : [],
        courseInput: "",

        institutionType,
        institutionTypeOther,
        autonomousYear: data.autonomous_year || "",
        autonomousDuration: data.autonomous_duration || "",
        establishmentYear: data.year_of_establishment || "",
        ownershipStatus,
        ownershipOther,
        affiliatingUniversityName: data.affiliating_university_name || "",
        affiliatingUniversityAddress: data.affiliating_university_address || "",
        otherInstitutions: data.other_institutions || "",

        head_name: data.head_name || "",
        head_email: data.head_email || "",
        head_mobile: data.head_mobile || "",
      });
    } catch (error) {
      console.error("Error fetching college:", error);
      setAlert(
        <SweetAlert danger title="Error" onConfirm={() => setAlert(null)}>
          Failed to load college details.
        </SweetAlert>
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setIsDirty(true);

    if (name === "logo") {
      setFormData({ ...formData, logo: files[0] || null });
    } else {
      setFormData({ ...formData, [name]: value });
    }
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

    if (e.key === "Backspace" && !formData.courseInput && formData.courses.length > 0) {
      setIsDirty(true);
      setFormData({
        ...formData,
        courses: formData.courses.slice(0, -1),
      });
    }
  };

  const removeCourse = (course) => {
    setIsDirty(true);
    setFormData({
      ...formData,
      courses: formData.courses.filter((c) => c !== course),
    });
  };

  const validate = () => {
    const newErrors = {};

    // Basic required fields (you can expand as needed)
    if (!formData.name.trim()) newErrors.name = "College name is required";
    if (!formData.code.trim()) newErrors.code = "College code is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[\w.-]+@[\w.-]+\.\w+$/.test(formData.email))
      newErrors.email = "Invalid email format";

    // Institution type
    if (!formData.institutionType) newErrors.institutionType = "Institution type is required";
    if (formData.institutionType === "Other" && !formData.institutionTypeOther.trim())
      newErrors.institutionTypeOther = "Please specify institution type";

    // Establishment year
    if (!formData.establishmentYear || !/^\d{4}$/.test(formData.establishmentYear))
      newErrors.establishmentYear = "Valid 4-digit year required";

    // Ownership
    if (!formData.ownershipStatus) newErrors.ownershipStatus = "Ownership status is required";
    if (formData.ownershipStatus === "Other" && !formData.ownershipOther.trim())
      newErrors.ownershipOther = "Please specify ownership";

    // Head of Institution
    if (!formData.head_name.trim()) newErrors.head_name = "Head name is required";
    if (!formData.head_email.trim()) newErrors.head_email = "Head email is required";
    else if (!/^[\w.-]+@[\w.-]+\.\w+$/.test(formData.head_email))
      newErrors.head_email = "Invalid head email";
    if (!formData.head_mobile.trim()) newErrors.head_mobile = "Mobile is required";
    else if (!/^\d{10}$/.test(formData.head_mobile.replace(/\D/g, "")))
      newErrors.head_mobile = "Valid 10-digit mobile required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setAlert(null);

    try {
      const updatedData = {
        college_name: formData.name,
        college_address: formData.address,
        city: formData.city,
        state: formData.state,
        pin_code: formData.pin_code,
        college_code: formData.code,
        year_of_establishment: formData.establishmentYear,
        college_logo: formData.logo ? formData.logo.name : undefined, // or send null if no change
        college_type: formData.type,
        college_email: formData.email,
        website: formData.website,
        ownership_status:
          formData.ownershipStatus === "Other" ? formData.ownershipOther : formData.ownershipStatus,
        course_affiliated_with: formData.courses.join(", "),
        affiliating_university_name: formData.affiliatingUniversityName || null,
        institution_type:
          formData.institutionType === "Other" ? formData.institutionTypeOther : formData.institutionType,
        autonomous_year: formData.autonomousYear || null,
        autonomous_duration: formData.autonomousDuration || null,
        affiliating_university_address: formData.affiliatingUniversityAddress || null,
        other_institutions: formData.otherInstitutions || null,

        // Head Details
        head_name: formData.head_name || null,
        head_email: formData.head_email || null,
        head_mobile: formData.head_mobile || null,
      };

      await collegeService.updateCollege(id, updatedData);
      await refreshColleges();

      setAlert(
        <SweetAlert
          success
          title="Success"
          onConfirm={() => {
            setAlert(null);
            navigate("/academics/college");
          }}
          confirmBtnCssClass="btn-confirm"
        >
          {formData.name} updated successfully!
        </SweetAlert>
      );
    } catch (error) {
      setLoading(false);
      const msg = error?.message || "Failed to update college";
      setAlert(
        <SweetAlert danger title="Error" onConfirm={() => setAlert(null)}>
          {msg}
        </SweetAlert>
      );
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      setShowCancelAlert(true);
    } else {
      navigate("/academics/college");
    }
  };

  const handleConfirmCancel = () => {
    setShowCancelAlert(false);
    navigate("/academics/college");
  };

  // if (loading) {
  //   return (
  //     <div className="flex justify-center items-center h-screen text-xl">
  //       Loading college details...
  //     </div>
  //   );
  // }

  return (
    <div className="w-full min-h-screen bg-white sm:bg-gray-50 p-3 sm:p-6 flex justify-center">
      <div
        className={`w-full sm:max-w-5xl bg-white rounded-2xl shadow-lg border border-gray-200 p-6 transform transition-all duration-500 ${
          animate ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"
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
          Edit College - Institutional Details
        </h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 1. Summary Box */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-3">
              1. Name and Address of the Institution
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Name:</strong> {formData.name || "Not entered"}
              </div>
              <div>
                <strong>Address:</strong> {formData.address || "Not entered"}
              </div>
            </div>
          </div>

          {/* Basic Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-medium mb-1">
                College Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full border rounded px-3 py-2 ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block font-medium mb-1">
                College Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                className={`w-full border rounded px-3 py-2 ${
                  errors.code ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
            </div>

            <div>
              <label className="block font-medium mb-1">College Logo</label>
              <input
                type="file"
                name="logo"
                accept="image/*"
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 border-gray-300"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">
                College Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full border rounded px-3 py-2 ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block font-medium mb-1">
                College Website <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className={`w-full border rounded px-3 py-2 ${
                  errors.website ? "border-red-500" : "border-gray-300"
                }`}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-medium mb-1">
                College Address <span className="text-red-500">*</span>
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="3"
                className={`w-full border rounded px-3 py-2 ${
                  errors.address ? "border-red-500" : "border-gray-300"
                }`}
              />
            </div>
          </div>

          {/* City, State, Pin */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-medium mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 border-gray-300"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">
                State <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 border-gray-300"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">
                Pin Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="pin_code"
                value={formData.pin_code}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 border-gray-300"
              />
            </div>
          </div>

          {/* 2. Type of Institution */}
          <div className="bg-gray-50 p-5 rounded-lg border">
            <label className="block font-semibold mb-3">
              2. Type of the Institution <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {[
                "Institute of National Importance",
                "Deemed to be University",
                "University",
                "Autonomous",
                "Non-Autonomous (Affiliated)",
                "Other",
              ].map((type) => (
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
                  className={`w-full mt-2 border rounded px-3 py-2 ${
                    errors.institutionTypeOther ? "border-red-500" : "border-gray-300"
                  }`}
                />
              )}
            </div>
            {errors.institutionType && (
              <p className="text-red-500 text-sm mt-2">{errors.institutionType}</p>
            )}
            {errors.institutionTypeOther && (
              <p className="text-red-500 text-sm mt-2">{errors.institutionTypeOther}</p>
            )}

            {/* Autonomous Fields */}
            {(formData.institutionType === "Autonomous" ||
              formData.institutionType === "Deemed to be University") && (
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
            <label className="block font-medium mb-1">
              3. Year of Establishment <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="establishmentYear"
              value={formData.establishmentYear}
              onChange={handleChange}
              placeholder="e.g. 1995"
              className={`w-full md:w-48 border rounded px-3 py-2 ${
                errors.establishmentYear ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.establishmentYear && (
              <p className="text-red-500 text-sm mt-1">{errors.establishmentYear}</p>
            )}
          </div>

          {/* 4. Ownership Status */}
          <div className="bg-gray-50 p-5 rounded-lg border">
            <label className="block font-semibold mb-3">
              4. Ownership Status <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {["Central Government", "State Government", "Grant-in-Aid", "Self-financing", "Trust", "Other"].map(
                (opt) => (
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
                )
              )}
              {formData.ownershipStatus === "Other" && (
                <input
                  type="text"
                  name="ownershipOther"
                  value={formData.ownershipOther}
                  onChange={handleChange}
                  placeholder="Please specify"
                  className={`w-full mt-2 border rounded px-3 py-2 ${
                    errors.ownershipOther ? "border-red-500" : "border-gray-300"
                  }`}
                />
              )}
            </div>
            {errors.ownershipStatus && (
              <p className="text-red-500 text-sm mt-2">{errors.ownershipStatus}</p>
            )}
            {errors.ownershipOther && (
              <p className="text-red-500 text-sm mt-2">{errors.ownershipOther}</p>
            )}
          </div>

          {/* 5. Affiliating University */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-medium mb-1">
                5. Name of Affiliating University (if applicable)
              </label>
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
            <label className="block font-medium mb-1">
              6. Other Academic Institutions Run by Trust/Society (if any)
            </label>
            <textarea
              name="otherInstitutions"
              value={formData.otherInstitutions}
              onChange={handleChange}
              rows="3"
              placeholder="List other institutions"
              className="w-full border rounded px-3 py-2 border-gray-300"
            />
          </div>

          {/* 7. Head of Institution Details */}
          <div className="bg-gray-50 p-5 rounded-lg border mt-6">
            <h3 className="font-semibold mb-4 text-lg">
              7. Head of Institution Details
            </h3>

            <div>
              <div className="mb-4">
                <label className="block font-medium mb-1">
                  Head Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="head_name"
                  value={formData.head_name}
                  onChange={handleChange}
                  className={`w-full border rounded px-3 py-2 ${
                    errors.head_name ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.head_name && <p className="text-red-500 text-sm mt-1">{errors.head_name}</p>}
              </div>

              <div className="mb-4">
                <label className="block font-medium mb-1">
                  Head Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="head_email"
                  value={formData.head_email}
                  onChange={handleChange}
                  className={`w-full border rounded px-3 py-2 ${
                    errors.head_email ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.head_email && <p className="text-red-500 text-sm mt-1">{errors.head_email}</p>}
              </div>

              <div className="mb-4">
                <label className="block font-medium mb-1">
                  Head Mobile <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="head_mobile"
                  value={formData.head_mobile}
                  onChange={handleChange}
                  placeholder="10-digit mobile"
                  className={`w-full border rounded px-3 py-2 ${
                    errors.head_mobile ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.head_mobile && <p className="text-red-500 text-sm mt-1">{errors.head_mobile}</p>}
              </div>
            </div>
          </div>

          {/* Courses */}
          <div>
            <label className="block font-medium mb-1">
              Courses Affiliated
            </label>
            <div className="flex flex-wrap gap-2 border rounded px-3 py-2 min-h-[40px] focus-within:ring-2 focus-within:ring-blue-300">
              {formData.courses.map((course) => (
                <span
                  key={course}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                >
                  {course}
                  <button
                    type="button"
                    onClick={() => removeCourse(course)}
                    className="ml-1 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={formData.courseInput}
                onChange={(e) =>
                  setFormData({ ...formData, courseInput: e.target.value })
                }
                onKeyDown={handleCourseInputKeyDown}
                className="flex-1 outline-none min-w-[200px]"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-70"
            >
              {loading ? "Updating..." : "Update College"}
            </button>
          </div>
        </form>
      </div>

      {/* Cancel Confirmation */}
      {showCancelAlert && (
        <SweetAlert
          warning
          showCancel
          confirmBtnText="Yes, leave"
          cancelBtnText="Stay"
          onConfirm={handleConfirmCancel}
          onCancel={() => setShowCancelAlert(false)}
        >
          Your changes will be lost if you leave.
        </SweetAlert>
      )}

      {alert}
    </div>
  );
};

export default EditCollege;