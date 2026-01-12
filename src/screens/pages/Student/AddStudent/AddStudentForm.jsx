import React, { useState, useEffect, useRef } from "react";
import { Formik } from "formik";
import PersonalTab from "./PersonalTab";
import EducationTab from "./EducationTab";
import CommunicationTab from "./CommunicationTab";
import TransportTab from "./TransportTab";
import OtherTab from "./OtherTab";
import { useNavigate, useParams } from "react-router-dom";
import SweetAlert from "react-bootstrap-sweetalert";
import { X, User, GraduationCap, MessageCircle, Bus, MoreHorizontal, UserPlus } from "lucide-react";
import {
  saveStudent,
  updateStudent,
  fetchStudentById,
} from "../Services/student.service.js";

const AddStudentForm = () => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [avatar, setAvatar] = useState(null);
  const [driverAvatar, setDriverAvatar] = useState(null);
  const personalTabRef = useRef();

  const [alert, setAlert] = useState(null); // ✅ SweetAlert state

  // Checkbox States
  const [academicEnabled, setAcademicEnabled] = useState(true);
  const [vocationalEnabled, setVocationalEnabled] = useState(false);
  const [codingEnabled, setCodingEnabled] = useState(false);
  const [sportEnabled, setSportEnabled] = useState(false);
  const [vertical1_4_enabled, setVertical1_4Enabled] = useState(false);
  const [vertical2_enabled, setVertical2Enabled] = useState(false);
  const [vertical3_enabled, setVertical3Enabled] = useState(false);
  const [vertical5_enabled, setVertical5Enabled] = useState(false);
  const [vertical6_enabled, setVertical6Enabled] = useState(false);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const tabs = [
    { name: "Personal", icon: User },
    { name: "Education", icon: GraduationCap },
    { name: "Communication", icon: MessageCircle },
    { name: "Transport", icon: Bus },
    { name: "Other", icon: MoreHorizontal },
  ];

  const initialValues = {
    firstname: "", lastname: "", middlename: "", email: "", mobile: "",
    program_id: "", date_of_birth: null, date_of_admission: null, gender: "",

    abc_id: "", university_application_form: "", aadhaar_card: "",
    education_details: [],

    parents_mobile: "", primary_relation: "", father_first_name: "", father_last_name: "", father_contact: "",
    mother_first_name: "", mother_last_name: "", mother_contact: "", nationality: "", address_line1: "",
    country: "", state: "", city: "", pincode: "",

    mode_of_transport: "", bus_number: "", bus_stop: "", driver_name: "", driver_phone_number: "",

    coding_count: "", customFields: [], roll_number: "",

    is_academic_enabled: true, is_vocational_enabled: false, is_coding_enabled: false,
    is_sport_enabled: false, is_vertical1_4_enabled: false, is_vertical2_enabled: false,
    is_vertical3_enabled: false, is_vertical5_enabled: false, is_vertical6_enabled: false,
  };

  const [initialFormValues, setInitialFormValues] = useState(initialValues);

  /* --------------------------------------------------------------
     LOAD STUDENT ON EDIT
  -------------------------------------------------------------- */
  useEffect(() => {
    if (!isEdit) return;

    const loadStudent = async () => {
      try {
        const student = await fetchStudentById(Number(id));
        const formatted = {
          ...initialValues,
          ...student,
          education_details: Array.isArray(student.education_details)
            ? student.education_details
            : [],
        };
        setInitialFormValues(formatted);

        // Sync checkbox states on edit
        setAcademicEnabled(formatted.is_academic_enabled ?? true);
        setVocationalEnabled(formatted.is_vocational_enabled ?? false);
        setCodingEnabled(formatted.is_coding_enabled ?? false);
        setSportEnabled(formatted.is_sport_enabled ?? false);
        setVertical1_4Enabled(formatted.is_vertical1_4_enabled ?? false);
        setVertical2Enabled(formatted.is_vertical2_enabled ?? false);
        setVertical3Enabled(formatted.is_vertical3_enabled ?? false);
        setVertical5Enabled(formatted.is_vertical5_enabled ?? false);
        setVertical6Enabled(formatted.is_vertical6_enabled ?? false);
      } catch (err) {
        console.error("Failed to load student:", err);
      }
    };

    loadStudent();
  }, [id, isEdit]);

  /* --------------------------------------------------------------
     CHECKBOX HANDLER (Updates both state & Formik)
  -------------------------------------------------------------- */
  const handleCheckboxChange = (event, setFieldValue) => {
    const { name, checked } = event.target;

    switch (name) {
      case "is_academic_enabled": setAcademicEnabled(checked); break;
      case "is_vocational_enabled": setVocationalEnabled(checked); break;
      case "is_coding_enabled": setCodingEnabled(checked); break;
      case "is_sport_enabled": setSportEnabled(checked); break;
      case "is_vertical1_4_enabled": setVertical1_4Enabled(checked); break;
      case "is_vertical2_enabled": setVertical2Enabled(checked); break;
      case "is_vertical3_enabled": setVertical3Enabled(checked); break;
      case "is_vertical5_enabled": setVertical5Enabled(checked); break;
      case "is_vertical6_enabled": setVertical6Enabled(checked); break;
      default: break;
    }

    setFieldValue(name, checked);
  };

  const handleCancel = () => navigate("/student");

  const renderTabContent = (values, errors, touched, handleChange, handleBlur, setFieldValue) => {
    switch (tabs[activeTabIndex].name) {
      case "Personal":
        return <PersonalTab ref={personalTabRef} values={values} errors={errors} touched={touched}
              handleChange={handleChange} handleBlur={handleBlur}
              setFieldValue={setFieldValue} avatar={avatar} />;
      case "Education":
        return <EducationTab values={values} errors={errors} touched={touched}
              handleChange={handleChange} handleBlur={handleBlur}
              setFieldValue={setFieldValue} />;
      case "Communication":
        return <CommunicationTab values={values} errors={errors} touched={touched}
              handleChange={handleChange} handleBlur={handleBlur} countries={countries}
              states={states}
              cities={cities}  getStates={setStates}
              getCities={setCities}/>;
      case "Transport":
        // CORRECTED: Ensures 'touched' is used, not 'touulated'
        return <TransportTab values={values} errors={errors} touched={touched} 
              handleChange={handleChange} handleBlur={handleBlur}
              driverAvatar={driverAvatar} />;
      case "Other":
        return (
          <OtherTab
            values={values} errors={errors} touched={touched}
            handleChange={handleChange} handleBlur={handleBlur}
            setFieldValue={setFieldValue}
            academicEnabled={academicEnabled}
            vocationalEnabled={vocationalEnabled}
            codingEnabled={codingEnabled}
            sportEnabled={sportEnabled}
            vertical1_4_enabled={vertical1_4_enabled}
            vertical2_enabled={vertical2_enabled}
            vertical3_enabled={vertical3_enabled}
            vertical5_enabled={vertical5_enabled}
            vertical6_enabled={vertical6_enabled}
            handleCheckboxChange={(e) => handleCheckboxChange(e, setFieldValue)}
          />
        );
      default:
        return null;
    }
  };

  const handleNext = (validateForm, setTouched) => {
    validateForm().then((errors) => {
      let canProceed = Object.keys(errors).length === 0;
      
      // Check Personal tab validation if on Personal tab
      if (activeTabIndex === 0 && personalTabRef.current) {
        const isPersonalValid = personalTabRef.current.validateRequired();
        canProceed = canProceed && isPersonalValid;
      }
      
      if (canProceed && activeTabIndex < tabs.length - 1) {
        setActiveTabIndex(activeTabIndex + 1);
      } else {
        setTouched(
          Object.keys(errors).reduce((acc, key) => ({ ...acc, [key]: true }), {})
        );
      }
    });
  };

  const handlePrevious = () => {
    if (activeTabIndex > 0) setActiveTabIndex(activeTabIndex - 1);
  };

  /* --------------------------------------------------------------
     SUBMIT HANDLER (With SweetAlert)
  -------------------------------------------------------------- */
  const onSubmit = async (values, { setSubmitting }) => {
    try {
      const payload = {
        ...values,
        id: values.student_id,
      };
      if (isEdit) {
        await updateStudent(payload);
        setAlert(
          <SweetAlert
            success
            title="Success!"
            onConfirm={() => {
              setAlert(null);
              navigate("/student");
            }}
          >
            Student updated successfully!
          </SweetAlert>
        );
      } else {
        await saveStudent(payload);
        setAlert(
          <SweetAlert
            success
            title="Success!" 
            onConfirm={() => {
              setAlert(null);
              navigate("/student");
            }}
          >
            Student added successfully!
          </SweetAlert>
        );
      }
    } catch (err) {
      console.error("Submit error:", err);
      setAlert(
        <SweetAlert
          danger
          title="Error!"
          onConfirm={() => setAlert(null)}
        >
          Something went wrong while saving student data.
        </SweetAlert>
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-2 sm:p-4 md:p-6 bg-gray-50 min-h-screen">
      {alert}

      <div className="content-wrapper">
        <div className="student-form-container" id="addStudentForm">
          <div className="page-header flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <UserPlus className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-blue-700 m-0">
                {isEdit ? "Edit Student" : "Add Student"}
              </h3>
            </div>
            <button
              onClick={handleCancel}
              className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-white transition-all shadow-sm hover:shadow-md self-end sm:self-auto"
              style={{ backgroundColor: "rgb(33 98 193 / var(--tw-bg-opacity, 1))" }}
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Tabs with Step Numbers (FIXED for mobile view) */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-4 sm:mb-6">
            <ul className="flex flex-wrap -mb-px text-xs sm:text-sm font-medium text-center text-gray-500 dark:text-gray-400 justify-center overflow-x-auto">
              {tabs.map((tab, index) => {
                const Icon = tab.icon;
                const isActive = activeTabIndex === index;
                return (
                  <li key={tab.name} className="me-1 sm:me-4 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setActiveTabIndex(index)}
                      className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-5 py-2 sm:py-3 border-b-2 rounded-t-lg transition-all duration-200 ${
                        isActive
                          ? "text-blue-600 border-blue-600"
                          : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      {/* Step number circle */}
                      <span
                        className={`flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full text-xs font-semibold ${
                          isActive
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {index + 1}
                      </span>
                      {/* Icon */}
                      <Icon
                        className={`w-3 h-3 sm:w-4 sm:h-4 ${
                          isActive ? "text-blue-600" : "text-gray-400"
                        }`}
                      />
                      {/* Label - Shows full text on all screen sizes */}
                      <span className="text-xs sm:text-base">{tab.name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <Formik
            initialValues={initialFormValues}
            onSubmit={onSubmit}
            enableReinitialize
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              setFieldValue,
              validateForm,
              setTouched,
              isSubmitting,
              handleSubmit,
            }) => (
              <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-3 sm:p-6 border border-gray-200">

                {/* Tab Content */}
                {renderTabContent(values, errors, touched, handleChange, handleBlur, setFieldValue)}

                {/* Navigation Buttons */}
                <div className="flex flex-row justify-center items-center gap-2 sm:gap-3 mt-4 sm:mt-6">
                  {activeTabIndex > 0 && (
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); handlePrevious(); }}
                      // Removed justify-center to allow for text-size width
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium px-3 sm:px-4 py-2 rounded-lg flex items-center text-sm sm:text-base"
                    >
                      Previous
                    </button>
                  )}
                  
                  <button
                    type="button"
                    onClick={handleCancel}
                    // Applied clear red styling and removed full-width behavior
                    className="bg-red-500 hover:bg-red-600 text-white font-medium px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base"
                  >
                    Cancel
                  </button>

                  {activeTabIndex < tabs.length - 1 ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleNext(validateForm, setTouched);
                      }}
                      // Removed justify-center to allow for text-size width
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 sm:px-4 py-2 rounded-lg flex items-center text-sm sm:text-base"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      // Added disabled styling for submit button feedback
                      className="bg-green-600 hover:bg-green-700 text-white font-medium px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "Saving..." : isEdit ? "Update" : "Add"}
                    </button>
                  )}
                </div>
              </form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default AddStudentForm;