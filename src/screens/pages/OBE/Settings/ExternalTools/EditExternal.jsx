import React, { useState, useEffect } from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Link } from "react-router-dom";
import { collegeService } from "../../../Academics/Services/college.service.js";
import { classService } from "../../../Academics/Services/class.service.js";
import { courseService } from "../../../Courses/Services/courses.service.js";
import { ExternalService } from "../Services/external.service.js";

const EditExternal = ({ location }) => {
  const locationState = location?.state || {};

  // State for dropdowns
  const [selectedProgram, setSelectedProgram] = useState(locationState.program_id || "");
  const [selectedClass, setSelectedClass] = useState(locationState.class_year_id || "");
  const [selectedSemester, setSelectedSemester] = useState(locationState.semester_id || "");
  const [selectedCourse, setSelectedCourse] = useState(locationState.subject_id || "");

  // Options for dropdowns
  const [programOptions, setProgramOptions] = useState([]);
  const [classOptions, setClassOptions] = useState([]);
  const [semesterOptions, setSemesterOptions] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);

  const [toolName, setToolName] = useState(locationState.name || "");
  const [isUpdate] = useState(!!locationState.nba_external_config_id);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch Programs
  useEffect(() => {
    const fetchPrograms = async () => {
      setIsLoading(true);
      try {
        const res = await collegeService.getAllprogram();
        const formatted = res.map(p => ({
          label: p.program_name,
          value: p.program_id,
        }));
        setProgramOptions(formatted);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPrograms();
  }, []);

  // Fetch Classes when program is selected
  useEffect(() => {
    const loadClasses = async () => {
      if (!selectedProgram) {
        setClassOptions([]);
        setSelectedClass("");
        setSemesterOptions([]);
        setSelectedSemester("");
        setCourseOptions([]);
        setSelectedCourse("");
        return;
      }
      try {
        const res = await classService.getAllClasses(selectedProgram);
        let formatted = [];
        if (Array.isArray(res)) {
          formatted = res.map(c => ({
            label: c.name,
            value: c.class_year_id,
            full: c,
          }));
        } else if (res && typeof res === "object") {
          formatted = [{ label: res.name, value: res.class_year_id, full: res }];
        }
        setClassOptions(formatted);
        
        // Reset dependent fields
        setSelectedClass("");
        setSemesterOptions([]);
        setSelectedSemester("");
        setCourseOptions([]);
        setSelectedCourse("");
      } catch (err) {
        console.error(err);
        setClassOptions([]);
      }
    };
    loadClasses();
  }, [selectedProgram]);

  // Fetch Semesters from selected Class
  useEffect(() => {
    if (!selectedClass) {
      setSemesterOptions([]);
      setSelectedSemester("");
      setCourseOptions([]);
      setSelectedCourse("");
      return;
    }

    const classObj = classOptions.find(c => String(c.value) === String(selectedClass));
    if (classObj && classObj.full?.semesters) {
      const formatted = classObj.full.semesters.map(s => ({
        label: s.name,
        value: s.semester_id,
      }));
      setSemesterOptions(formatted);
      
      // Reset dependent fields
      setSelectedSemester("");
      setCourseOptions([]);
      setSelectedCourse("");
    } else {
      setSemesterOptions([]);
    }
  }, [selectedClass, classOptions]);

  // Fetch Courses when semester is selected
  useEffect(() => {
    const fetchCoursesForSemester = async () => {
      if (!selectedSemester) {
        setCourseOptions([]);
        setSelectedCourse("");
        return;
      }
      
      try {
        // If you have a specific API for fetching courses by semester, use that
        // Otherwise, filter from all courses
        const res = await courseService.getAllCourses();
        
        // Filter courses by semester if needed, or use all
        // This depends on your API structure
        const filteredCourses = res || [];
        setCourseOptions(filteredCourses);
      } catch (err) {
        console.error(err);
        setCourseOptions([]);
      }
    };
    
    fetchCoursesForSemester();
  }, [selectedSemester]);

  // Handle editing mode - load data if editing
  useEffect(() => {
    if (isUpdate && locationState) {
      // If editing, set all values from locationState
      // You might need to fetch additional data based on IDs
      setToolName(locationState.name || "");
      
      // If you have the IDs, you can set them
      // You might need to fetch the corresponding options
      // For now, we'll set them directly
      setSelectedProgram(locationState.program_id || "");
      setSelectedClass(locationState.class_year_id || "");
      setSelectedSemester(locationState.semester_id || "");
      setSelectedCourse(locationState.subject_id || "");
    }
  }, [isUpdate, locationState]);

  const handleProgramChange = (e, setFieldValue) => {
    const value = e.target.value;
    setSelectedProgram(value);
    setFieldValue("program_id", value);
    
    // Clear dependent fields
    setFieldValue("class_year_id", "");
    setFieldValue("semester_id", "");
    setFieldValue("subject_id", "");
    setFieldValue("name", "");
    setToolName("");
  };

  const handleClassChange = (e, setFieldValue) => {
    const value = e.target.value;
    setSelectedClass(value);
    setFieldValue("class_year_id", value);
    
    // Clear dependent fields
    setFieldValue("semester_id", "");
    setFieldValue("subject_id", "");
    setFieldValue("name", "");
    setToolName("");
  };

  const handleSemesterChange = (e, setFieldValue) => {
    const value = e.target.value;
    setSelectedSemester(value);
    setFieldValue("semester_id", value);
    
    // Clear dependent fields
    setFieldValue("subject_id", "");
    setFieldValue("name", "");
    setToolName("");
  };

  const handleCourseChange = (e, setFieldValue) => {
    const value = e.target.value;
    setSelectedCourse(value);
    setFieldValue("subject_id", value);
    
    // Clear tool name when course changes
    setFieldValue("name", "");
    setToolName("");
  };

  const handleToolNameChange = (e, setFieldValue) => {
    const value = e.target.value;
    setToolName(value);
    setFieldValue("name", value);
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    const payload = {
      program_id: Number(values.program_id),
      subject_id: Number(values.subject_id),
      class_year_id: Number(values.class_year_id),
      name: values.name,
    };
  
    console.log("Payload sending to API:", payload);
  
    try {
      const res = await ExternalService.saveExternal(payload);
      alert(isUpdate ? "Internal Tool Updated Successfully!" : "Internal Tool Saved Successfully!");
    } catch (err) {
      console.error("Error saving internal config:", err);
      alert("Failed to save!");
    }
  
    setSubmitting(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="pageheading text-xl font-semibold">{isUpdate ? "Edit" : "Add"} External Config</h1>
        <Link
          to={{
            pathname: "/obe-setting",
            state: { selectedTabIndex: 10, selectedSubjectId: selectedCourse },
          }}
          className="text-2xl hover:text-red-600"
        >
          ×
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : (
        <div>
          <Formik
            enableReinitialize
            initialValues={{
              program_id: selectedProgram,
              class_year_id: selectedClass,
              semester_id: selectedSemester,
              subject_id: selectedCourse,
              name: toolName,
            }}
            validationSchema={Yup.object().shape({
              program_id: Yup.string().required("Program is required"),
              class_year_id: Yup.string().required("Class is required"),
              semester_id: Yup.string().required("Semester is required"),
              subject_id: Yup.string().required("Course is required"),
              name: Yup.string().required("Tool name is required"),
            })}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, handleChange, setFieldValue, isSubmitting }) => (
              <Form>
                {/* Dropdowns: Program → Class → Semester → Course */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                  {/* Program */}
                  {/* <div>
                    <label className="block mb-1 font-medium">Program <span className="text-red-500">*</span></label>
                    <select
                      name="program_id"
                      value={values.program_id}
                      onChange={(e) => handleProgramChange(e, setFieldValue)}
                      disabled={isUpdate}
                      className={`w-full border p-2 rounded ${errors.program_id && touched.program_id ? "border-red-500" : "border-gray-300"}`}
                    >
                      <option value="">Select Program</option>
                      {programOptions.map(p => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                    <ErrorMessage name="program_id" component="div" className="text-red-500 text-sm mt-1" />
                  </div> */}

                  {/* Class */}
                  {/* <div>
                    <label className="block mb-1 font-medium">Class <span className="text-red-500">*</span></label>
                    <select
                      name="class_year_id"
                      value={values.class_year_id}
                      onChange={(e) => handleClassChange(e, setFieldValue)}
                      disabled={isUpdate || !values.program_id}
                      className={`w-full border p-2 rounded ${errors.class_year_id && touched.class_year_id ? "border-red-500" : "border-gray-300"}`}
                    >
                      <option value="">Select Class</option>
                      {classOptions.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                    <ErrorMessage name="class_year_id" component="div" className="text-red-500 text-sm mt-1" />
                  </div> */}

                  {/* Semester */}
                  {/* <div>
                    <label className="block mb-1 font-medium">Semester <span className="text-red-500">*</span></label>
                    <select
                      name="semester_id"
                      value={values.semester_id}
                      onChange={(e) => handleSemesterChange(e, setFieldValue)}
                      disabled={isUpdate || !values.class_year_id}
                      className={`w-full border p-2 rounded ${errors.semester_id && touched.semester_id ? "border-red-500" : "border-gray-300"}`}
                    >
                      <option value="">Select Semester</option>
                      {semesterOptions.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                    <ErrorMessage name="semester_id" component="div" className="text-red-500 text-sm mt-1" />
                  </div> */}

                  {/* Course */}
                  <div>
                    <label className="block mb-1 font-medium">Course <span className="text-red-500">*</span></label>
                    <select
                      name="subject_id"
                      value={values.subject_id}
                      onChange={(e) => handleCourseChange(e, setFieldValue)}
                      disabled={isUpdate || !values.semester_id}
                      className={`w-full border p-2 rounded ${errors.subject_id && touched.subject_id ? "border-red-500" : "border-gray-300"}`}
                    >
                      <option value="">Select Course</option>
                      {courseOptions.map(c => (
                        <option key={c.subject_id} value={c.subject_id}>
                          {c.name || c.subject_name}
                        </option>
                      ))}
                    </select>
                    <ErrorMessage name="subject_id" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                </div>

                {/* Tool Name */}
                <div className="mb-6">
                  <label className="block mb-1 font-medium">Tool Name <span className="text-red-500">*</span></label>
                  <Field
                    name="name"
                    placeholder="Enter Tool Name"
                    value={values.name}
                    onChange={(e) => handleToolNameChange(e, setFieldValue)}
                    className={`w-full border p-2 rounded ${errors.name && touched.name ? "border-red-500" : "border-gray-300"}`}
                  />
                  <ErrorMessage name="name" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                <div className="flex justify-center gap-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                  >
                    {isUpdate ? "Update" : "Submit"}
                  </button>
                  <Link
                    to={{
                      pathname: "/obe-setting",
                      state: { selectedTabIndex: 10, selectedSubjectId: selectedCourse },
                    }}
                  >
                    <button type="button" className="bg-gray-300 px-6 py-2 rounded hover:bg-gray-400">
                      Cancel
                    </button>
                  </Link>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      )}
    </div>
  );
};

export default EditExternal;