import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Link } from "react-router-dom";
import SweetAlert from "react-bootstrap-sweetalert";
import { collegeService } from "../../../Academics/Services/college.service";
import { classService } from "../../../Academics/Services/class.service.js";
import { courseService } from "../../../Courses/Services/courses.service.js";
import { InternalService } from "../Services/internal.service.js";

const AddInternal = () => {
  const location = useLocation();
  const locationState = location.state || {};
  const [isUpdate] = useState(!!locationState.nba_internal_config_id);
  console.log("Received data from ListInternal:", locationState);

  const [selectedProgram, setSelectedProgram] = useState(locationState.program_id || "");
  const [selectedClass, setSelectedClass] = useState(locationState.class_year_id || "");
  const [selectedCourse, setSelectedCourse] = useState(locationState.subject_id || "");

  const [programOptions, setProgramOptions] = useState([]);
  const [classOptions, setClassOptions] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);

  const [toolName, setToolName] = useState(locationState.name || "");
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  // Fetch Programs
  useEffect(() => {
    const fetchPrograms = async () => {
      setIsLoading(true);
      try {
        const res = await collegeService.getAllprogram();
        const formatted = res.map(p => ({
          label: p.program_name,
          // value: p.program_id,
          value: String(p.program_id),
        }));
        setProgramOptions(formatted);
        if (locationState.program_id) {
          setSelectedProgram(locationState.program_id);
        }
      } catch (err) {
        console.error(err);
        setAlert(
          <SweetAlert
            error
            title="Error!"
            confirmBtnCssClass="btn-confirm"
            onConfirm={() => setAlert(null)}
          >
            Failed to load programs.
          </SweetAlert>
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchPrograms();
  }, []);

  useEffect(() => {
    const storedProgram = localStorage.getItem("selectedOBEprogram");

    if (storedProgram && programOptions.length > 0) {
      setSelectedProgram(String(storedProgram));
      console.log("Loaded saved program:", storedProgram);
    }
  }, [programOptions]);

  // Fetch Classes when Program is selected
  useEffect(() => {
    const loadClasses = async () => {
      if (!selectedProgram) {
        setClassOptions([]);
        setSelectedClass("");
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
        if (locationState.class_year_id) {
          setSelectedClass(locationState.class_year_id);
        }
      } catch (err) {
        console.error(err);
        setClassOptions([]);
        setAlert(
          <SweetAlert
            error
            title="Error!"
            confirmBtnCssClass="btn-confirm"
            onConfirm={() => setAlert(null)}
          >
            Failed to load classes.
          </SweetAlert>
        );
      }
    };
    loadClasses();
  }, [selectedProgram]);

  // Fetch Courses when Class is selected (Semester removed)
  useEffect(() => {
    if (!selectedClass) {
      setCourseOptions([]);
      setSelectedCourse("");
      return;
    }

    const fetchCourses = async () => {
      try {
        const res = await courseService.getAllCourses();
        setCourseOptions(res || []);
        if (locationState.subject_id) {
          setSelectedCourse(locationState.subject_id);
        }
      } catch (err) {
        console.error(err);
        setCourseOptions([]);
        setAlert(
          <SweetAlert
            error
            title="Error!"
            confirmBtnCssClass="btn-confirm"
            onConfirm={() => setAlert(null)}
          >
            Failed to load courses.
          </SweetAlert>
        );
      }
    };

    fetchCourses();
  }, [selectedClass]);

  const handleProgramChange = (e, setFieldValue) => {
    const value = e.target.value;
    setSelectedProgram(value);
    setFieldValue("program_id", value);
    setFieldValue("class_year_id", "");
    setFieldValue("subject_id", "");
    if (!isUpdate) {
      setFieldValue("name", "");
      setToolName("");
    }
  };

  const handleClassChange = (e, setFieldValue) => {
    const value = e.target.value;
    setSelectedClass(value);
    setFieldValue("class_year_id", value);
    setFieldValue("subject_id", "");
    if (!isUpdate) {
      setFieldValue("name", "");
      setToolName("");
    }
  };

  const handleCourseChange = (e, setFieldValue) => {
    const value = e.target.value;
    setSelectedCourse(value);
    setFieldValue("subject_id", value);
    if (!isUpdate) {
      setFieldValue("name", "");
      setToolName("");
    }
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

    if (isUpdate) {
      payload.id = locationState.nba_internal_config_id;
    }

    try {
      await InternalService.saveInternal(payload);
      setAlert(
        <SweetAlert
          success
          title={isUpdate ? "Updated!" : "Saved!"}
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => {
            setAlert(null);
            // Redirect after clicking OK
            window.location.href = `/obe/settings/INTERNAL_TOOLS`;
          }}
        >
          {isUpdate ? "updated" : "saved"} successfully.
        </SweetAlert>
      );
    } catch (err) {
      console.error(err);
      setAlert(
        <SweetAlert
          error
          title="Error!"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => setAlert(null)}
        >
          Failed to save internal tool configuration!
        </SweetAlert>
      );
    }

    setSubmitting(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="pageheading text-xl font-semibold">
          {isUpdate ? "Edit Internal Config" : "Add Internal Config"}
        </h1>
        <Link
          to="/obe/settings/INTERNAL_TOOLS"
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm"
        >
          Close
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : (
        <Formik
          enableReinitialize
          initialValues={{
            program_id: selectedProgram,
            class_year_id: selectedClass,
            subject_id: selectedCourse,
            name: toolName,
          }}
          validationSchema={Yup.object().shape({
            program_id: Yup.string().required("Program is required"),
            class_year_id: Yup.string().required("Class is required"),
            subject_id: Yup.string().required("Course is required"),
            name: Yup.string().required("Tool name is required"),
          })}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, setFieldValue, isSubmitting }) => (
            <Form>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Program */}
                <div>
                  <label className="block mb-1 font-medium">Program <span className="text-red-500">*</span></label>
                  <select
                    name="program_id"
                    value={values.program_id}
                    onChange={(e) => handleProgramChange(e, setFieldValue)}
                    className={`w-full border p-2 rounded ${errors.program_id && touched.program_id ? "border-red-500" : "border-gray-300"
                      }`}
                  >
                    <option value="">Select Program</option>
                    {programOptions.map(p => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                  <ErrorMessage name="program_id" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                {/* Class */}
                <div>
                  <label className="block mb-1 font-medium">Class <span className="text-red-500">*</span></label>
                  <select
                    name="class_year_id"
                    value={values.class_year_id}
                    onChange={(e) => handleClassChange(e, setFieldValue)}
                    disabled={!values.program_id}
                    className={`w-full border p-2 rounded ${errors.class_year_id && touched.class_year_id
                        ? "border-red-500"
                        : "border-gray-300"
                      }`}
                  >
                    <option value="">Select Class</option>
                    {classOptions.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                  <ErrorMessage name="class_year_id" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                {/* Course */}
                <div>
                  <label className="block mb-1 font-medium">Course <span className="text-red-500">*</span></label>
                  <select
                    name="subject_id"
                    value={values.subject_id}
                    onChange={(e) => handleCourseChange(e, setFieldValue)}
                    disabled={!values.class_year_id}
                    className={`w-full border p-2 rounded ${errors.subject_id && touched.subject_id
                        ? "border-red-500"
                        : "border-gray-300"
                      }`}
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
                  className={`w-full border p-2 rounded ${errors.name && touched.name ? "border-red-500" : "border-gray-300"
                    }`}
                  placeholder="Enter Tool Name"
                  onChange={(e) => handleToolNameChange(e, setFieldValue)}
                />
                <ErrorMessage name="name" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              <div className="flex justify-center gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
                >
                  {isSubmitting ? "Processing..." : (isUpdate ? "Update" : "Submit")}
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
      )}
      {alert}
    </div>
  );
};

export default AddInternal;