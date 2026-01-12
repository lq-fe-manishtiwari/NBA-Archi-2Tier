import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { OtherStaffService } from "../Service/OtherStaff.service.js";
import { DepartmentService } from "../../Academics/Services/Department.service.js";
import SweetAlert from "react-bootstrap-sweetalert";
import {
  User,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Personal from "./Personal.jsx";
import Communication from "./Communication.jsx";
import OtherDetails from "./OtherDetails.jsx";

// Dummy Data (Expanded)
const dummyData = {
  subjects: [
    { id: "1", name: "Mathematics" },
    { id: "2", name: "Science" },
    { id: "3", name: "English" },
    { id: "4", name: "History" },
    { id: "5", name: "Geography" },
  ],
  countries: [
    { id: "1", name: "India" },
    { id: "2", name: "USA" },
  ],
  states: {
    "1": [{ id: "101", name: "Maharashtra" }, { id: "102", name: "Delhi" }],
    "2": [{ id: "201", name: "California" }, { id: "202", name: "New York" }],
  },
  cities: {
    "101": [{ id: "10101", name: "Mumbai" }, { id: "10102", name: "Pune" }],
    "102": [{ id: "10201", name: "New Delhi" }],
    "201": [{ id: "20101", name: "Los Angeles" }],
    "202": [{ id: "20201", name: "New York City" }],
  },
  customFields: [
    { custom_field_id: "1", field_name: "Emergency Contact", field_type: "text" },
    { custom_field_id: "2", field_name: "Teacher Code", field_type: "text" },
  ]
};

const EditOtherStaff = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("1");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [fileError, setFileError] = useState("");
  const [sizePError, setSizePError] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  const [showErrorModal, setShowErrorModal] = useState({ show: false, message: "" });
  const [formData, setFormData] = useState({
    firstname: "",
    middlename: "",
    lastname: "",
    employee_id: "",
    email: "",
    mobile: "",
    gender: "Male",
    blood_group: "",
    date_of_birth: "",
    date_of_joining: "",
    marital_status: "Unmarried",
    spouse_name: "",
    father_name: "",
    aadhar_number: "",
    pan_number: "",
    uan_number: "",
    designation: "",
    address_line1: "",
    address_line2: "",
    country: "",
    state: "",
    city: "",
    pincode: "",
    departmentId: "",
    primary_subject: "",
    secondary_subject1: "",
    secondary_subject2: "",
    teacher_qualifications: [{ degree: "", institution: "", year: "" }],
    teacher_employments: [{ organization: "", from_date: "", to_date: "" }],
    teacher_custom_fields: [],
    academics_access: false,
    syllabus_access: false,
    content_access: false,
    attendance_access: false,
    student_access: false,
    teacher_access: false,
    staff_access: false,
    assessment_access: false,
    offline_assessment_enabled: false,
    class_update_access: false,
    learning_plan_access: false,
    in_sights_access: false,
    payment_access: false,
    expenses_access: false,
    expenses_approved: false,
    enquiry_access: false,
    report_access: false,
    leave_access: false,
    uniform_access: false,
    library: false,
    placement: false,
    event_access: false,
    coordinator:false,
    subcoordinator:false,
    contributor:false,
    probation_completed: false,
    probation_completed_date: null,
    probation_comment: "",
  });

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        const [staffRes, deptRes] = await Promise.all([
          OtherStaffService.getOtherStaffDetailsbyID(id),
          DepartmentService.getDepartment(),
        ]);
  
        console.log("API Response:", staffRes);
  
        setDepartments(deptRes || []);
  
        const staffData = staffRes;
        const staffAccess = staffData.staff_access_attributes?.[0] || {};
  
        const countryObj = dummyData.countries.find(
          (c) => c.name === staffData.country
        );
        const countryId = countryObj ? countryObj.id : "";
  
        const stateObj = dummyData.states[countryId]?.find(
          (s) => s.name === staffData.state
        );
        const stateId = stateObj ? stateObj.id : "";
  
        const cityObj = dummyData.cities[stateId]?.find(
          (c) => c.name === staffData.city
        );
        const cityId = cityObj ? cityObj.id : "";
  
        const newFormData = {
          ...formData,
          ...staffData,
          departmentId: staffData.department_id || "",
          country: countryId,
          state: stateId,
          city: cityId,
        };
  
        const checkboxFields = [
          "academics_access",
          "syllabus_access",
          "content_access",
          "attendance_access",
          "student_access",
          "teacher_access",
          "staff_access",
          "assessment_access",
          "offline_assessment_enabled",
          "class_update_access",
          "learning_plan_access",
          "in_sights_access",
          "payment_access",
          "expenses_access",
          "expenses_approved",
          "enquiry_access",
          "report_access",
          "leave_access",
          "uniform_access",
          "library",
          "placement",
          "event_access",
           "contributor",
      "subcoordinator",
      "coordinator",
          "probation_completed",
        ];
  
        checkboxFields.forEach((field) => {
          const value = staffAccess[field];
          if (value === "true" || value === true) {
            newFormData[field] = true;
          } else {
            newFormData[field] = false;
          }
        });
  
        console.log("✅ Final FormData after conversion:", newFormData);
  
        setFormData(newFormData);
        setAvatar(staffData.avatar);
      } catch (error) {
        console.error("Failed to fetch staff data:", error);
        setShowErrorModal({
          show: true,
          message: "Failed to load staff data.",
        });
      } finally {
        setLoading(false);
      }
    };
  
    fetchStaffData();
  }, [id]);
  

  const states = dummyData.states[formData.country] || [];
  const cities = dummyData.cities[formData.state] || [];

  // Handlers
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFileError("");
    setSizePError(false);

    if (file && file.size > 500000) {
      setFileError("Size should be less than 500KB");
      setSizePError(true);
      return;
    }

    if (file && ["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
      setUploadingAvatar(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
        setUploadingAvatar(false);
      };
      reader.readAsDataURL(file);
    } else {
      setFileError("Only JPG/PNG allowed");
      setSizePError(true);
    }
  };

  const resetAvatar = () => setAvatar(null);

  const handleMaritalStatusChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      marital_status: e.target.value,
      spouse_name: e.target.value === "Unmarried" ? "" : prev.spouse_name,
    }));
  };

  const handleCountryChange = (countryId) => {
    setFormData((prev) => ({ ...prev, country: countryId, state: "", city: "" }));
  };

  const handleStateChange = (stateId) => {
    setFormData((prev) => ({ ...prev, state: stateId, city: "" }));
  };

  const setFieldValue = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateTab = () => {
    const newErrors = {};
    if (activeTab === "1") {
      if (!formData.firstname.trim()) newErrors.firstname = "First name is required.";
      if (!formData.lastname.trim()) newErrors.lastname = "Last name is required.";
      if (!formData.email.trim()) newErrors.email = "Email is required.";
      if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid.";
      if (!formData.mobile.trim()) newErrors.mobile = "Mobile number is required.";
      if (!/^\d{10}$/.test(formData.mobile)) newErrors.mobile = "Mobile number must be 10 digits.";
      if (!formData.departmentId) newErrors.departmentId = "Department is required.";
    } else if (activeTab === "2") {
      if (!formData.address_line1.trim()) newErrors.address_line1 = "Address Line 1 is required.";
      if (!formData.country) newErrors.country = "Country is required.";
      if (!formData.state) newErrors.state = "State is required.";
      if (!formData.city) newErrors.city = "City is required.";
      if (!formData.pincode.trim()) newErrors.pincode = "Pincode is required.";
    }
    // No validation for tab 3 for now, but we can add if needed.
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (!validateTab()) {
      return;
    }
    if (activeTab === "1") setActiveTab("2");
    else if (activeTab === "2") setActiveTab("3");
  };

  const prevStep = () => {
    setErrors({}); // Clear errors when moving back
    if (activeTab === "2") setActiveTab("1");
    else if (activeTab === "3") setActiveTab("2");
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateTab()) return;

  const checkboxFields = [
    "academics_access",
    "syllabus_access",
    "content_access",
    "attendance_access",
    "student_access",
    "teacher_access",
    "staff_access",
    "assessment_access",
    "offline_assessment_enabled",
    "class_update_access",
    "learning_plan_access",
    "in_sights_access",
    "payment_access",
    "expenses_access",
    "expenses_approved",
    "enquiry_access",
    "report_access",
    "leave_access",
    "uniform_access",
    "library",
    "placement",
    "event_access",
    "contributor",
    "subcoordinator",
    "coordinator",
  ];

  // Build staff access object (keep booleans)
  const staffAccessPayload = {};
  checkboxFields.forEach((field) => {
    staffAccessPayload[field] = !!formData[field];
  });

  // Build payload
  const payload = {
    ...formData,
    country: dummyData.countries.find(c => c.id === formData.country)?.name || "",
    state: dummyData.states[formData.country]?.find(s => s.id === formData.state)?.name || "",
    city: dummyData.cities[formData.state]?.find(c => c.id === formData.city)?.name || "",
    department_id: formData.departmentId ? parseInt(formData.departmentId, 10) : null,
    avatar: avatar,
    staff_access_attributes: [staffAccessPayload],

    // ✅ Top-level flags
    is_coordinator: staffAccessPayload.coordinator,
    is_sub_coordinator: staffAccessPayload.subcoordinator,
    is_contributor: staffAccessPayload.contributor,
  };

  // 🔍 Debug: check payload
  console.log("Payload to send:", payload);
  console.log("Top-level flags:", {
    is_coordinator: payload.is_coordinator,
    is_sub_coordinator: payload.is_sub_coordinator,
    is_contributor: payload.is_contributor,
  });

  try {
    await OtherStaffService.updateOtherStaff(payload, id);
    setShowSuccessModal(true);
  } catch (error) {
    console.error("Failed to update other staff:", error);
    setShowErrorModal({ show: true, message: error.message || "An unknown error occurred." });
  }
};


  // Handler functions for otherDetails
  const onCheckboxChangeCurr = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><p>Loading staff details...</p></div>;
  }

  return (
    <div className="stdLayout">
      {/* Success Modal */}
      {showSuccessModal && (
        <SweetAlert
          success
          title="Success!"
          onConfirm={() => {
            setShowSuccessModal(false);
            navigate("/other-staff/dashboard");
          }}
          confirmBtnCssClass="btn-confirm"
        >
          Other Staff updated successfully!
        </SweetAlert>
      )}
      {/* Error Modal */}
      {showErrorModal.show && (
        <SweetAlert
          danger
          title="Error!"
          onConfirm={() => {
            setShowErrorModal({ show: false, message: "" });
          }}
          confirmBtnCssClass="btn-confirm"
        >
          {showErrorModal.message}
        </SweetAlert>
      )}

      <div className="content-wrapper">
        <div className="student-form-container" id="addStudentForm">
          <div className="page-header flex items-center justify-between mb-6 relative">
            <h3 className="text-[1.75rem] font-semibold text-[#2162c1] m-0 ml-4">
              Edit Other Staff
            </h3>
            <Link
              to="/other-staff/dashboard"
              className="absolute top-1 right-11 bg-blue-600 hover:bg-blue-700 text-white w-10 h-10 flex items-center justify-center rounded-full shadow-md transition-all"
            >
              <span className="text-xl font-bold leading-none">×</span>
            </Link>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <ul className="flex flex-wrap -mb-px text-sm font-medium text-center text-gray-500 dark:text-gray-400 justify-center">
              {[
                { id: "1", label: "Personal", icon: User },
                { id: "2", label: "Communication", icon: Mail },
                { id: "3", label: "Other", icon: Phone },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <li key={tab.id} className="me-4">
                    <button
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-5 py-3 border-b-2 rounded-t-lg transition-all duration-200 ${
                        isActive
                          ? "text-blue-600 border-blue-600"
                          : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <span
                        className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${
                          isActive
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {tab.id}
                      </span>
                      <Icon
                        className={`w-4 h-4 ${
                          isActive ? "text-blue-600" : "text-gray-400"
                        }`}
                      />
                      <span>{tab.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
          >
            {activeTab === "1" && (
              <Personal
                subjects={dummyData.subjects}
                departments={departments}
                handleMaritalStatusChangeEve={handleMaritalStatusChange}
                avatar={avatar}
                uploading_avatar={uploadingAvatar}
                onFileChangeHandler={handleFileChange}
                resetFileHandler={resetAvatar}
                sizePError={sizePError}
                fileError={fileError}
                isEditMode={true}
                values={formData}
                handleChange={handleChange}
                errors={errors}
                setFieldValue={setFieldValue}
                touched={errors}
              />
            )}

            {activeTab === "2" && (
              <Communication
                countries={dummyData.countries}
                states={states}
                cities={cities}
                getStates={() => {}}
                getCities={() => {}}
                isEditMode={true}
                handleCountryChange={handleCountryChange}
                handleStateChange={handleStateChange}
                values={formData}
                handleChange={handleChange}
                errors={errors}
              />
            )}

            {activeTab === "3" && (
              <OtherDetails
                values={formData}
                onCheckboxChangeCurr={onCheckboxChangeCurr}
              />
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-center gap-3 mt-6">
              {activeTab !== "1" && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium px-4 py-2 rounded-lg flex items-center"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </button>
              )}
              <Link to="/other-staff/dashboard">
                <button
                  type="button"
                  className="btn-cancel"
                >
                  Cancel
                </button>
              </Link>
              {activeTab !== "3" ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg flex items-center"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg"
                >
                  Update
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditOtherStaff;