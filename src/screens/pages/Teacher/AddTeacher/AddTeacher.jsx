import React, { useState, useEffect } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import SweetAlert from "react-bootstrap-sweetalert";
import {
  ChevronLeft,
  ChevronRight,
  User,
  Mail,
  Phone,
} from "lucide-react";
import TeacherPersonal from "./TeacherPersonal.jsx";
import TeacherCommunication from "./TeacherCommunication.jsx";
import TeacherOtherDetails from "./TeacherOtherDetails.jsx";
import { createTeacher, fetchTeacherById, updateTeacher } from "../Services/teacher.service.js";

// Dummy Data
const dummyCountries = [
  { id: "1", name: "India" },
  { id: "2", name: "USA" },
];
const dummyCustomFields = [
  { custom_field_id: "1", field_name: "Emergency Contact", field_type: "text" },
  { custom_field_id: "2", field_name: "Teacher Code", field_type: "text" },
  { custom_field_id: "3", field_name: "Joining Anniversary", field_type: "date" },
];

const AddTeacher = () => {
  const { teacher_id } = useParams();
  const location = useLocation();
  const isEditMode = !!teacher_id;

  const [activeTab, setActiveTab] = useState("1");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [fileError, setFileError] = useState("");
  const [sizePError, setSizePError] = useState(false);
  const [loading, setLoading] = useState(isEditMode);

  // ==================== INITIAL STATE ====================
  const [formData, setFormData] = useState({
    firstname: "",
    middlename: "",
    lastname: "",
    employee_id: "",
    email: "",
    mobile: "",
    gender: "",
    blood_group: "",
    date_of_birth: null,
    date_of_joining: null,
    marital_status: "Unmarried",
    spouse_name: "",
    father_name: "",
    aadhar_number: "",
    pan_number: "",
    uan_number: "",
    designation: "",
    financial_year: "",
    bank_name: "",
    bank_account_no: "",
    ifsc_code: "",
    cost_to_company: "",
    deduction: "",
    net_pay: "",
    address_line1: "",
    address_line2: "",
    country: "",
    state: "",
    city: "",
    pincode: "",
    teacher_qualifications: [],
    teacher_employments: [],
    custom_fields: [],
    content_access: "false",
    assessment_enabled: false,
    content_approval: false,
    chapter_topic_access: false,
    offline_assessment_enabled: false,
    reports_access: false,
    academic_enabled: false,
    vertical1_4_enabled: false,
    vertical2_enabled: false,
    vertical3_enabled: false,
    vertical5_enabled: false,
    vertical6_enabled: false,
    probation_completed: false,
    probation_completed_date: null,
    probation_comment: "",
  });

  // ==================== FETCH TEACHER ON EDIT ====================
  useEffect(() => {
    const isEdit = !!teacher_id;

    if (!isEdit) {
      console.log("AddTeacher: Running in ADD mode (no teacher_id)");
      return;
    }

    const loadTeacher = async () => {
      try {
        setLoading(true);

        const cleanId = teacher_id.includes("?") ? teacher_id.split("?")[0] : teacher_id;
        let decodedId;
        try {
          decodedId = atob(cleanId);
        } catch (e) {
          decodedId = cleanId;
        }

        const data = await fetchTeacherById(decodedId);
        if (!data) throw new Error("No data returned");

        // === Map teacherAccessAttributes ===
        const accessMap = {};
        if (Array.isArray(data.teacherAccessAttributes)) {
          data.teacherAccessAttributes.forEach(attr => {
            accessMap[attr.key] = attr.value;
          });
        }

        const mapped = {
          // Personal & Communication
          firstname: data.firstname || "",
          middlename: data.middlename || "",
          lastname: data.lastname || "",
          employee_id: data.employeeId || "",
          email: data.email || "",
          mobile: data.mobile || "",
          gender: data.gender === "MALE" ? "MALE" : "FEMALE",
          blood_group: data.bloodGroup || "",
          date_of_birth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
          date_of_joining: data.dateOfJoining ? new Date(data.dateOfJoining) : null,
          marital_status: data.maritalStatus || "Unmarried",
          spouse_name: data.spouseName || "",
          father_name: data.fatherName || "",
          aadhar_number: data.aadharNumber || "",
          pan_number: data.panNumber || "",
          uan_number: data.uanNumber || "",
          designation: data.designation || "",
          financial_year: data.financialYear || "",
          bank_name: data.bankName || "",
          bank_account_no: data.bankAccountNo || "",
          ifsc_code: data.ifscCode || "",
          cost_to_company: data.costToCompany || "",
          deduction: data.deduction || "",
          net_pay: data.netPay || "",
          address_line1: data.addressLine1 || "",
          address_line2: data.addressLine2 || "",
          country: "", // Will set later
          state: "",
          city: "",
          pincode: data.pincode || "",

          // === Permissions from teacherAccessAttributes ===
          content_access: accessMap["content_access"] || "false",
          assessment_enabled: accessMap["assessment_enabled"] === "true",
          content_approval: accessMap["content_approval"] === "true",
          chapter_topic_access: accessMap["chapter_topic_access"] === "true",
          offline_assessment_enabled: accessMap["offline_assessment_enabled"] === "true",
          reports_access: accessMap["reports_access"] === "true",
          academic_enabled: accessMap["is_academic_enabled"] === "true",
          vertical1_4_enabled: accessMap["vertical1_4_enabled"] === "true",
          vertical2_enabled: accessMap["vertical2_enabled"] === "true",
          vertical3_enabled: accessMap["vertical3_enabled"] === "true",
          vertical5_enabled: accessMap["vertical5_enabled"] === "true",
          vertical6_enabled: accessMap["vertical6_enabled"] === "true",

          // === Probation ===
          probation_completed: data.probationCompleted === true,
          probation_completed_date: data.probationCompletedDate ? new Date(data.probationCompletedDate) : null,
          probation_comment: data.probationComment || "",

          // === Arrays ===
          teacher_qualifications: Array.isArray(data.teacherQualifications)
            ? data.teacherQualifications.map(q => ({
                degree: q.degree || "",
                passing_year: q.passing_year || "",
                school_university: q.school_university || "",
                passing_percentage: q.passing_percentage || "",
              }))
            : [],

          teacher_employments: Array.isArray(data.teacherEmployments)
            ? data.teacherEmployments.map(e => ({
                organization: e.organization || "",
                from_date: e.from_date ? new Date(e.from_date) : null,
                to_date: e.to_date ? new Date(e.to_date) : null,
                organization_hr_name: e.organization_hr_name || "",
                organization_hr_email: e.organization_hr_email || "",
                organization_hr_contact_number: e.organization_hr_contact_number || "",
              }))
            : [],

          custom_fields: Array.isArray(data.customFields)
            ? data.customFields.map(cf => ({
                custom_field_id: cf.custom_field_id,
                field_value:
                  cf.field_value && !isNaN(Date.parse(cf.field_value))
                    ? new Date(cf.field_value)
                    : cf.field_value,
              }))
            : [],
        };

        setFormData(mapped);
        if (data.avatar) setAvatar(data.avatar);

        // Set country/state/city after render
        setTimeout(() => {
          const countryId = dummyCountries.find(c => c.name === data.country)?.id;
          if (countryId) {
            setFormData(prev => ({ ...prev, country: countryId }));

            // Simulate states/cities (based on country)
            const states = countryId === "1"
              ? [{ id: "1", name: "Maharashtra" }, { id: "2", name: "Karnataka" }]
              : [];

            const stateId = states.find(s => s.name === data.state)?.id;
            if (stateId) {
              setFormData(prev => ({ ...prev, state: stateId }));

              const cities = stateId === "1"
                ? [{ id: "1", name: "Mumbai" }, { id: "2", name: "Pune" }]
                : stateId === "2"
                ? [{ id: "3", name: "Bangalore" }]
                : [];

              const cityId = cities.find(c => c.name === data.city)?.id;
              if (cityId) {
                setFormData(prev => ({ ...prev, city: cityId }));
              }
            }
          }
        }, 0);

      } catch (error) {
        console.error("AddTeacher: Fetch failed:", error);
        alert("Failed to load teacher: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    loadTeacher();
  }, [teacher_id]);

  // ==================== Dynamic States & Cities (Dummy) ====================
  const states = formData.country === "1"
    ? [{ id: "1", name: "Maharashtra" }, { id: "2", name: "Karnataka" }]
    : [];

  const cities = formData.state === "1"
    ? [{ id: "1", name: "Mumbai" }, { id: "2", name: "Pune" }]
    : formData.state === "2"
    ? [{ id: "3", name: "Bangalore" }]
    : [];

  // ==================== Handlers ====================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleDateChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const setFieldValue = (field, value) => {
    if (field === "date_of_birth" || field === "date_of_joining") {
      handleDateChange(field, value);
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
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
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      marital_status: value,
      spouse_name: value === "Unmarried" ? "" : prev.spouse_name,
    }));
  };

  const handleCountryChange = (countryId) => {
    setFormData(prev => ({ ...prev, country: countryId, state: "", city: "" }));
  };

  const handleStateChange = (stateId) => {
    setFormData(prev => ({ ...prev, state: stateId, city: "" }));
  };

  const addArrayItem = (field, template) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], template],
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const updateArrayItem = (field, index, subfield, value) => {
    setFormData(prev => {
      const updated = [...prev[field]];
      updated[index][subfield] = value;
      return { ...prev, [field]: updated };
    });
  };

  const nextStep = () => {
    if (activeTab === "1") setActiveTab("2");
    else if (activeTab === "2") setActiveTab("3");
  };

  const prevStep = () => {
    if (activeTab === "2") setActiveTab("1");
    else if (activeTab === "3") setActiveTab("2");
  };

  // ==================== DATE FORMATTER ====================
  const formatDate = (date) => {
    if (!date || !(date instanceof Date) || isNaN(date)) return null;
    return date.toISOString().replace('Z', '');
  };

  // ==================== SUBMIT HANDLER ====================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (activeTab !== "3") {
      nextStep();
      return;
    }

    const teacherAccessAttributes = [
      { key: "reports_access", value: formData.reports_access ? "true" : "false" },
      { key: "content_access", value: formData.content_access },
      { key: "is_academic_enabled", value: formData.academic_enabled ? "true" : "false" },
      { key: "assessment_enabled", value: formData.assessment_enabled ? "true" : "false" },
      { key: "content_approval", value: formData.content_approval ? "true" : "false" },
      { key: "chapter_topic_access", value: formData.chapter_topic_access ? "true" : "false" },
      { key: "offline_assessment_enabled", value: formData.offline_assessment_enabled ? "true" : "false" },
      { key: "vertical1_4_enabled", value: formData.vertical1_4_enabled ? "true" : "false" },
      { key: "vertical2_enabled", value: formData.vertical2_enabled ? "true" : "false" },
      { key: "vertical3_enabled", value: formData.vertical3_enabled ? "true" : "false" },
      { key: "vertical5_enabled", value: formData.vertical5_enabled ? "true" : "false" },
      { key: "vertical6_enabled", value: formData.vertical6_enabled ? "true" : "false" }
    ].filter(attr => attr.value === "true");

    const getCountryName = (id) => dummyCountries.find(c => c.id === id)?.name || "";
    const getStateName = (id) => states.find(s => s.id === id)?.name || "";
    const getCityName = (id) => cities.find(c => c.id === id)?.name || "";

    const payload = {
      firstname: formData.firstname,
      middlename: formData.middlename,
      lastname: formData.lastname,
      employee_id: formData.employee_id,
      email: formData.email,
      mobile: formData.mobile,
      gender: formData.gender === "Male" ? "MALE" : "FEMALE",
      blood_group: formData.blood_group,
      date_of_birth: formatDate(formData.date_of_birth),
      date_of_joining: formatDate(formData.date_of_joining),
      marital_status: formData.marital_status?.toUpperCase() || "UNMARRIED",
      spouse_name: formData.spouse_name,
      father_name: formData.father_name,
      aadhaar_number: formData.aadhar_number,
      pan_number: formData.pan_number,
      uan_number: formData.uan_number,
      designation: formData.designation,
      address_line1: formData.address_line1,
      address_line2: formData.address_line2,
      city: getCityName(formData.city),
      state: getStateName(formData.state),
      country: getCountryName(formData.country),
      pincode: formData.pincode,
      financial_year: formData.financial_year,
      bank_name: formData.bank_name,
      bank_account_no: formData.bank_account_no ? parseInt(formData.bank_account_no) : null,
      ifsc_code: formData.ifsc_code,
      cost_to_company: formData.cost_to_company?.toString() || "",
      deduction: formData.deduction?.toString() || "",
      net_pay: formData.net_pay?.toString() || "",
      teacher_qualifications: formData.teacher_qualifications.map(q => ({
        degree: q.degree,
        passing_year: q.passing_year,
        school_university: q.school_university,
        passing_percentage: q.passing_percentage || "",
      })),
      teacher_employments: formData.teacher_employments.map(e => ({
        organization: e.organization,
        from_date: formatDate(e.from_date),
        to_date: formatDate(e.to_date),
        organization_hr_name: e.organization_hr_name || "",
        organization_hr_email: e.organization_hr_email || "",
        organization_hr_contact_number: e.organization_hr_contact_number || "",
      })),
      teacher_access_attributes: teacherAccessAttributes,
      avatar: avatar || "",
      connect_link: "",
      is_nba: false,
      proctoring_enabled: false,
      is_offline_assessment_enabled: formData.offline_assessment_enabled,
      probation_completed: formData.probation_completed,
      probation_completed_date: formatDate(formData.probation_completed_date),
      probation_comment: formData.probation_comment,
      custom_fields: formData.custom_fields.map(cf => ({
        custom_field_id: cf.custom_field_id,
        field_value: cf.field_value instanceof Date
          ? formatDate(cf.field_value)
          : cf.field_value
      }))
    };

    try {
      setUploadingAvatar(true);

      let response;
      if (isEditMode) {
        const id = atob(teacher_id.split("?")[0]);
        response = await updateTeacher(id, payload);
      } else {
        response = await createTeacher(payload);
      }

      console.log("Success:", response);
      setShowSuccessModal(true);
    } catch (error) {
      console.error("API Error:", error);
      alert(`Error ${isEditMode ? "updating" : "adding"} teacher: ${error.message || error}`);
    } finally {
      setUploadingAvatar(false);
    }
  };

  // ==================== Checkbox Handlers ====================
  const onCheckboxChangeCurr = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleCheckAssesmentEvent = (e) => setFormData(prev => ({ ...prev, assessment_enabled: e.target.checked }));
  const handleCheckContentApprovalEvent = (e) => setFormData(prev => ({ ...prev, content_approval: e.target.checked }));
  const handleCheckAcademicsEvent = (e) => setFormData(prev => ({ ...prev, chapter_topic_access: e.target.checked }));
  const handleCheckOfflineEvent = (e) => setFormData(prev => ({ ...prev, offline_assessment_enabled: e.target.checked }));
  const handleCustomFieldChangeEvent = () => {};

  // ==================== RENDER ====================
  if (loading) {
    return <div className="stdLayout">Loading teacher data...</div>;
  }

  return (
    <div className="stdLayout">
      {showSuccessModal && (
        <SweetAlert
          success
          title="Success!"
          onConfirm={() => {
            setShowSuccessModal(false);
            window.location.href = "/teacher-list";
          }}
          confirmBtnCssClass="btn-confirm"
        >
          Teacher {isEditMode ? "updated" : "added"} successfully!
        </SweetAlert>
      )}

      <div className="content-wrapper">
        <div className="student-form-container" id="addStudentForm">
          <div className="page-header flex items-center justify-between mb-6 relative">
            <h3 className="text-xl sm:text-2xl font-semibold mb-6 text-blue-700 text-center sm:text-left sm:ml-4">
              {isEditMode ? "Edit Teacher" : "Add Teacher"}
            </h3>
            <Link
              to="/teacher-list"
              className="absolute top-1 right-11 bg-blue-600 hover:bg-blue-700 text-white w-10 h-10 flex items-center justify-center rounded-full shadow-md transition-all"
            >
              <span className="text-xl font-bold leading-none">×</span>
            </Link>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <ul className="flex flex-wrap -mb-px text-sm font-medium text-center text-gray-500 justify-center">
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
                      className={`flex items-center gap-2 px-5 py-3 border-b-2 rounded-t-lg transition-all ${
                        isActive
                          ? "text-blue-600 border-blue-600"
                          : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <span
                        className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${
                          isActive ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {tab.id}
                      </span>
                      <Icon className={`w-4 h-4 ${isActive ? "text-blue-600" : "text-gray-400"}`} />
                      <span>{tab.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            {activeTab === "1" && (
              <TeacherPersonal
                handleMaritalStatusChangeEve={handleMaritalStatusChange}
                avatar={avatar}
                uploading_avatar={uploadingAvatar}
                onFileChangeHandler={handleFileChange}
                resetFileHandler={resetAvatar}
                sizePError={sizePError}
                fileError={fileError}
                isEditMode={isEditMode}
                values={formData}
                handleChange={handleChange}
                setFieldValue={setFieldValue}
                errors={{}}
                touched={{}}
              />
            )}

            {activeTab === "2" && (
              <TeacherCommunication
                countries={dummyCountries}
                states={states}
                cities={cities}
                getStates={() => {}}
                getCities={() => {}}
                isEditMode={isEditMode}
                handleCountryChange={handleCountryChange}
                handleStateChange={handleStateChange}
                values={formData}
                handleChange={handleChange}
                setFieldValue={setFieldValue}
              />
            )}

            {activeTab === "3" && (
              <TeacherOtherDetails
                userRole="SUPERADMIN"
                custom_fields={dummyCustomFields}
                selected_field_type="text"
                onCheckboxChangeCurr={onCheckboxChangeCurr}
                handleCheckAssesmentEvent={handleCheckAssesmentEvent}
                handleCheckAcademicsEvent={handleCheckAcademicsEvent}
                handleCheckContentApprovalEvent={handleCheckContentApprovalEvent}
                handleCheckOfflineEvent={handleCheckOfflineEvent}
                handleCustomFieldChangeEvent={handleCustomFieldChangeEvent}
                values={formData}
                setFieldValue={setFieldValue}
                addArrayItem={addArrayItem}
                removeArrayItem={removeArrayItem}
                updateArrayItem={updateArrayItem}
              />
            )}

            {/* Navigation */}
            <div className="flex justify-center gap-3 mt-6">
              {activeTab !== "1" && (
                <button type="button" onClick={prevStep} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium px-4 py-2 rounded-lg flex items-center">
                  <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                </button>
              )}
              <Link to="/teacher-list">
                <button type="button" className="btn-cancel">Cancel</button>
              </Link>
              {activeTab !== "3" ? (
                <button type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    nextStep();
                  }} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg flex items-center">
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              ) : (
                <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg">
                  {isEditMode ? "Update Teacher" : "Add Teacher"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export { AddTeacher };