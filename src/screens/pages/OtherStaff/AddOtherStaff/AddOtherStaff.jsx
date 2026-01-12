import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { OtherStaffService } from "../Service/OtherStaff.service";
import { DepartmentService } from "../../Academics/Services/Department.service.js";
import SweetAlert from "react-bootstrap-sweetalert";
import {
  Plus,
  Upload,
  X,
  ChevronLeft,
  ChevronRight,
  User,
  Mail,
  Phone,
} from "lucide-react";
import Personal from "./Personal.jsx";
import Communication from "./Communication.jsx";
import OtherDetails from "./OtherDetails.jsx";
import { useNavigate } from "react-router-dom";


// Dummy Data (Expanded)
const dummyData = {
  subjects: [
    { id: "1", name: "Mathematics" },
    { id: "2", name: "Science" },
    { id: "3", name: "English" },
    { id: "4", name: "History" },
    { id: "5", name: "Geography" },
  ],
  // countries: [
  //   { id: "1", name: "India" },
  //   { id: "2", name: "USA" },
  //   { id: "3", name: "Canada" },
  //   { id: "4", name: "Australia" },
  //   { id: "5", name: "United Kingdom" },
  //   { id: "6", name: "Germany" },
  //   { id: "7", name: "France" },
  //   { id: "8", name: "Japan" },
  //   { id: "9", name: "Brazil" },
  //   { id: "10", name: "South Africa" },
  // ],
  // states: {
  //   "1": [ // India
  //     { id: "101", name: "Maharashtra" }, { id: "102", name: "Delhi" },
  //     { id: "103", name: "Karnataka" }, { id: "104", name: "Tamil Nadu" },
  //     { id: "105", name: "Uttar Pradesh" }, { id: "106", name: "Gujarat" },
  //     { id: "107", name: "West Bengal" }, { id: "108", name: "Rajasthan" },
  //     { id: "109", name: "Punjab" }, { id: "110", name: "Kerala" },
  //   ],
  //   "2": [ // USA
  //     { id: "201", name: "California" }, { id: "202", name: "New York" },
  //     { id: "203", name: "Texas" }, { id: "204", name: "Florida" },
  //     { id: "205", name: "Illinois" }, { id: "206", name: "Pennsylvania" },
  //     { id: "207", name: "Ohio" }, { id: "208", name: "Georgia" },
  //     { id: "209", name: "North Carolina" }, { id: "210", name: "Michigan" },
  //   ],
  //   // Add more states for other countries if needed
  // },
  // cities: {
  //   "101": [ // Maharashtra
  //     { id: "10101", name: "Mumbai" }, { id: "10102", name: "Pune" },
  //     { id: "10103", name: "Nagpur" }, { id: "10104", name: "Nashik" },
  //     { id: "10105", name: "Aurangabad" }, { id: "10106", name: "Solapur" },
  //     { id: "10107", name: "Amravati" }, { id: "10108", name: "Kolhapur" },
  //     { id: "10109", name: "Thane" }, { id: "10110", name: "Latur" },
  //   ],
  //   "102": [ // Delhi
  //     { id: "10201", name: "New Delhi" }, { id: "10202", name: "Old Delhi" },
  //   ],
  //   "201": [ // California
  //     { id: "20101", name: "Los Angeles" }, { id: "20102", name: "San Francisco" },
  //     { id: "20103", name: "San Diego" }, { id: "20104", name: "Sacramento" },
  //     { id: "20105", name: "San Jose" }, { id: "20106", name: "Fresno" },
  //     { id: "20107", name: "Long Beach" }, { id: "20108", name: "Oakland" },
  //     { id: "20109", name: "Bakersfield" }, { id: "20110", name: "Anaheim" },
  //   ],
  //   "202": [ // New York
  //     { id: "20201", name: "New York City" }, { id: "20202", name: "Buffalo" },
  //     { id: "20203", name: "Rochester" }, { id: "20204", name: "Yonkers" },
  //     { id: "20205", name: "Syracuse" }, { id: "20206", name: "Albany" },
  //   ],
  //   // Add more cities for other states if needed
  // },
  customFields: [
    { custom_field_id: "1", field_name: "Emergency Contact", field_type: "text" },
    { custom_field_id: "2", field_name: "Teacher Code", field_type: "text" },
  ]
};

const AddOtherStaff = () => {
  const [activeTab, setActiveTab] = useState("1");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [fileError, setFileError] = useState("");
  const [sizePError, setSizePError] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

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
  const navigate = useNavigate();


  const isFetchedRef = React.useRef(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [departmentsRes, countriesRes] = await Promise.all([
          DepartmentService.getDepartment(),
          OtherStaffService.getCountries(),
        ]);
        setDepartments(departmentsRes || []);
        setCountries(countriesRes || []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
  
    if (!isFetchedRef.current) {
      fetchData();
      isFetchedRef.current = true;
    }
  }, []);
  
  // const states = dummyData.states[formData.country] || [];
  // const cities = dummyData.cities[formData.state] || [];

  // Handlers
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCountryChange = async (countryId) => {
    setFormData((prev) => ({
      ...prev,
      country: countryId,
      state: "",
      city: ""
    }));

    if (!countryId) {
      setStates([]);
      setCities([]);
      return;
    }
    setLoadingStates(true);
    try {
      const res = await OtherStaffService.getStatesByCountry(countryId);
      setStates(res || []);
      setCities([]); // reset city when country changes
    } catch (err) {
      console.error("Failed to fetch states:", err);
    } finally {
      setLoadingStates(false);
    }
  };

  const handleStateChange = async (stateId) => {
    setFormData((prev) => ({
      ...prev,
      state: stateId,
      city: ""
    }));

    if (!stateId) {
      setCities([]);
      return;
    }
    setLoadingCities(true);
    try {
      const res = await OtherStaffService.getCitiesByState(stateId);
      setCities(res || []);
    } catch (err) {
      console.error("Failed to fetch cities:", err);
    } finally {
      setLoadingCities(false);
    }
  };


  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
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

  const handleCheckbox = (name) => (e) => {
    setFormData((prev) => ({ ...prev, [name]: e.target.checked }));
  };

  const addArrayItem = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [
        ...prev[field],
        field === "teacher_qualifications"
          ? { degree: "", institution: "", year: "" }
          : { organization: "", from_date: "", to_date: "" },
      ],
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const updateArrayItem = (field, index, subfield, value) => {
    setFormData((prev) => {
      const updated = [...prev[field]];
      updated[index][subfield] = value;
      return { ...prev, [field]: updated };
    });
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
      if (!formData.employee_id.trim()) newErrors.employee_id = "Employee Id is required.";
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

  const nextStep = (e) => {
    if (e) e.preventDefault();
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

  // Build access object once (to avoid mismatch)
  const access = {
    academics_access: !!formData.academics_access,
    syllabus_access: !!formData.syllabus_access,
    content_access: !!formData.content_access,
    attendance_access: !!formData.attendance_access,
    student_access: !!formData.student_access,
    teacher_access: !!formData.teacher_access,
    staff_access: !!formData.staff_access,
    assessment_access: !!formData.assessment_access,
    offline_assessment_enabled: !!formData.offline_assessment_enabled,
    class_update_access: !!formData.class_update_access,
    learning_plan_access: !!formData.learning_plan_access,
    in_sights_access: !!formData.in_sights_access,
    payment_access: !!formData.payment_access,
    expenses_access: !!formData.expenses_access,
    expenses_approved: !!formData.expenses_approved,
    enquiry_access: !!formData.enquiry_access,
    report_access: !!formData.report_access,
    leave_access: !!formData.leave_access,
    uniform_access: !!formData.uniform_access,
    library: !!formData.library,
    placement: !!formData.placement,
    event_access: !!formData.event_access,

    // 🔥 Role flags (source of truth)
    coordinator: !!formData.coordinator,
    subcoordinator: !!formData.subcoordinator,
    contributor: !!formData.contributor,
  };

  // Build final payload
  const payload = {
    employee_id: formData.employee_id || "",
    staff_code: "",
    avatar: avatar || null,
    firstname: formData.firstname,
    middlename: formData.middlename,
    lastname: formData.lastname,
    email: formData.email,
    phone: formData.mobile,
    mobile: formData.mobile,
    gender: formData.gender,
    date_of_birth: formData.date_of_birth,
    date_of_joining: formData.date_of_joining,
    address_line1: formData.address_line1,
    address_line2: formData.address_line2,
    country: countries.find(c => c.id === formData.country)?.name || "",
    state: states.find(s => s.id === formData.state)?.name || "",
    city: cities.find(c => c.id === formData.city)?.name || "",
    pincode: formData.pincode,
    aadhar_number: formData.aadhar_number,
    pan_number: formData.pan_number,
    blood_group: formData.blood_group,
    designation: formData.designation,
    father_name: formData.father_name,
    marital_status: formData.marital_status,
    spouse_name: formData.spouse_name,
    uan_number: formData.uan_number,
    bank_name: formData.bank_name,
    bank_account_no: formData.bank_account_no,
    ifsc_code: formData.ifsc_code,
    cost_to_company: formData.cost_to_company,
    deduction: formData.deduction,
    net_pay: formData.net_pay,
    financial_year: formData.financial_year,
    department_id: formData.departmentId ? parseInt(formData.departmentId, 10) : null,

    // 🟦 staff access attributes
    staff_access_attributes: [access],

    // 🟥 Top-level flags (guaranteed same as array)
    is_coordinator: access.coordinator,
    is_sub_coordinator: access.subcoordinator,
    is_contributor: access.contributor,
  };

  // 🔍 Debug: log payload to verify top-level flags
  console.log("Payload to send:", payload);
  console.log("Top-level flags:", {
    is_coordinator: payload.is_coordinator,
    is_sub_coordinator: payload.is_sub_coordinator,
    is_contributor: payload.is_contributor,
  });

  // --- API CALL ---
  try {
    const response = await OtherStaffService.submitOtherStaffRequest([payload]);
    
    if (response?.status === "success" || response?.status === 201 || response?.success) {
      setShowSuccessModal(true);
    } else {
      setShowErrorModal({
        show: true,
        message: response?.failed?.[0]?.errors || response?.error || "Failed to add other staff. Please check your data.",
      });
    }
  } catch (error) {
    setShowErrorModal({ show: true, message: error || "An unknown error occurred." });
  }
};



  // Handler functions for otherDetails
  const handleCheckAssesmentEvent = (e, setFieldValue) => {
    const checked = e.target.checked;
    setFormData(prev => ({ ...prev, student_access: checked }));
  };

  const handleCheckContentApprovalEvent = (e, setFieldValue) => {
    const checked = e.target.checked;
    setFormData(prev => ({ ...prev, teacher_access: checked }));
  };

  const handleCheckAcademicsEvent = (e, setFieldValue) => {
    const checked = e.target.checked;
    setFormData(prev => ({ ...prev, staff_access: checked }));
  };

  const handleCheckOfflineEvent = (e, setFieldValue) => {
    const checked = e.target.checked;
    setFormData(prev => ({ ...prev, assessment_access: checked }));
  };

  const handleCustomFieldChangeEvent = (e) => {
    // Handle custom field type change if needed
    console.log("Custom field changed:", e.target.value);
  };

  const onCheckboxChangeCurr = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

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
          Other Staff added successfully!
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
              Add Other Staff
            </h3>
            <Link
              to="/other-staff"
              className="absolute top-1 right-11 bg-blue-600 hover:bg-blue-700 text-white w-10 h-10 flex items-center justify-center rounded-full shadow-md transition-all"
            >
              <span className="text-xl font-bold leading-none">×</span>
            </Link>
          </div>

          {/* 🌟 Tabs with Step Numbers */}
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
                      className={`flex items-center gap-2 px-5 py-3 border-b-2 rounded-t-lg transition-all duration-200 ${isActive
                        ? "text-blue-600 border-blue-600"
                        : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                        }`}
                    >
                      {/* Step number circle */}
                      <span
                        className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${isActive
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-600"
                          }`}
                      >
                        {tab.id}
                      </span>

                      {/* Icon */}
                      <Icon
                        className={`w-4 h-4 ${isActive ? "text-blue-600" : "text-gray-400"
                          }`}
                      />

                      {/* Label */}
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
                isEditMode={false}
                values={formData}
                handleChange={handleChange}
                errors={errors}
                setFieldValue={setFieldValue}
                touched={errors} // Using errors to trigger touched-like state
                handleBlur={handleBlur}
              />
            )}

            {activeTab === "2" && (
              <Communication
                countries={countries}
                states={states}
                cities={cities}
                loadingStates={loadingStates}
                loadingCities={loadingCities}
                getStates={() => { }}
                getCities={() => { }}
                isEditMode={false}
                handleCountryChange={handleCountryChange}
                handleStateChange={handleStateChange}
                values={formData}
                handleChange={handleChange}
                errors={errors}
              />
            )}

            {activeTab === "3" && (
              <OtherDetails
                userRole="SUPERADMIN" // Changed to SUPERADMIN to show the checkboxes
                values={formData}
                custom_fields={dummyData.customFields}
                selected_field_type="text"
                onCheckboxChangeCurr={onCheckboxChangeCurr}
                handleCheckAssesmentEvent={handleCheckAssesmentEvent}
                handleCheckAcademicsEvent={handleCheckAcademicsEvent}
                handleCheckContentApprovalEvent={handleCheckContentApprovalEvent}
                handleCheckOfflineEvent={handleCheckOfflineEvent}
                handleCustomFieldChangeEvent={handleCustomFieldChangeEvent}
                
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
                  onClick={(e) => nextStep(e)}
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
                  Add
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddOtherStaff;