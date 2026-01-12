import React, { useState, useEffect } from "react";
import Select from "react-select";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { collegeService } from "../../../Academics/Services/college.service.js";
import { classService } from "../../../Academics/Services/class.service.js";
import { courseService } from "../../../Courses/Services/courses.service";
import { AttainmentConfigService } from "../../Services/attainment-config.service.js";
import { AcademicService } from "../../../Academics/Services/Academic.service.js";
import { toast } from "react-toastify";

const SetTarget = () => {
  const [showModal, setShowModal] = useState(false); 
  const [programs, setPrograms] = useState([]);
  const [selectedProgramId, setSelectedProgramId] = useState(
  localStorage.getItem("selectedOBEprogram") || ""
);

  const [classOptions, setClassOptions] = useState([]);
  const [semesterOptions, setSemesterOptions] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [tools, setTools] = useState([]);
  const [examType, setExamType] = useState(null);
  const [selectedTool, setSelectedTool] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPrograms();
    fetchCourses();
    fetchAcademicYears();
  }, []);

  useEffect(() => {
  if (selectedProgramId && programs.length > 0) {
    const matchedProgram = programs.find(
      p => String(p.program_id) === String(selectedProgramId)
    );

    if (matchedProgram) {
      fetchClasses(matchedProgram.program_id);
    }
  }
}, [selectedProgramId, programs]);


  const fetchPrograms = async () => {
    try {
      const data = await collegeService.getAllprogram();
      setPrograms(data || []);
    } catch (err) {
      console.error("Failed to fetch programs:", err);
    }
  };

  const fetchClasses = async (programId) => {
    try {
      const res = await classService.getAllClasses(programId);
      setClassOptions(Array.isArray(res) ? res : [res].filter(Boolean));
    } catch (err) {
      console.error(err);
      setClassOptions([]);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await courseService.getAllCourses();
      setCourseOptions(res?.data || res || []);
    } catch (err) {
      console.error("Failed to fetch courses:", err);
    }
  };

  const fetchAcademicYears = async () => {
    try {
      const response = await AcademicService.getAcademic();
      setAcademicYears(response || []);
    } catch (err) {
      console.error("Failed to fetch academic years:", err);
    }
  };

  const fetchToolsByExamType = async (examType, subjectId) => {
    if (!subjectId) {
      setTools([]);
      return;
    }
    
    try {
      let toolsData;
      if (examType === "external") {
        toolsData = await AttainmentConfigService.getExternalConfigBySubject(subjectId);
      } else if (examType === "internal") {
        toolsData = await AttainmentConfigService.getInternalConfigBySubject(subjectId);
      }
      setTools(toolsData || []);
    } catch (err) {
      console.error("Failed to fetch tools:", err);
      setTools([]);
    }
  };

  const generateOptions = (arr, labelKey, valueKey) =>
    arr.map((item) => ({ label: item[labelKey], value: item[valueKey] }));

  /* -----------------------------------------
     Formik Initial Values
  ------------------------------------------ */
  const initialValues = {
    program_id: selectedProgramId,
    class_id: "",
    semester_id: "",
    course_id: "",
    batch_id: "",
    tool_id: "",
    tool_name: "",
    assessment_type: "",
    target: "",
    maximum_marks: "",
    level1: "",
    level2: "",
    level3: "",
  };

  /* -----------------------------------------
     Validation Schema
  ------------------------------------------ */
  const validationSchema = Yup.object({
    program_id: Yup.string().required("Program is required"), 
    class_id: Yup.string().required("Class is required"),
    semester_id: Yup.string().required("Semester is required"),
    course_id: Yup.string().required("Course is required"),
    batch_id: Yup.string().required("Academic Year is required"),
    assessment_type: Yup.string().required("Exam Type is required"),
    tool_id: Yup.string().required("Tool is required"),
    target: Yup.number().required("Required").min(0),
    maximum_marks: Yup.number().required("Required").min(0),
    level1: Yup.number().required("Required").min(0),
    level2: Yup.number().required("Required").min(0),
    level3: Yup.number().required("Required").min(0),
  });

  /* -----------------------------------------
      Submit Handler
  ------------------------------------------ */
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setLoading(true);
      await AttainmentConfigService.saveConfig(values.course_id, {
        program_id: values.program_id,
        class_id: values.class_id,
        semester_id: values.semester_id,
        academic_year_id: values.batch_id,
        tool_id: values.tool_id,
        tool_name: values.tool_name,
        assessment_type: values.assessment_type,
        target: values.target,
        maximum_marks: values.maximum_marks,
        level1: values.level1,
        level2: values.level2,
        level3: values.level3,
      });
      toast.success("Target saved successfully!");
      resetForm();
      setShowModal(false);
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to save target");
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4">

      {/* OPEN MODAL BUTTON */}
      <button
        className="bg-primary-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700"
        onClick={() => setShowModal(true)}
      >
        Set Target
      </button>

      {/* MODAL */}
      {showModal && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">

    {/* OUTER — NO RADIUS HERE */}
    <div className="bg-white w-full max-w-4xl shadow-lg animate-fade">

      {/* HEADER — full-width BLUE, no rounded corners */}
      <div className="bg-blue-600 w-full flex justify-between items-center px-6 py-3">
        <h2 className="text-xl font-semibold text-white">Set Target</h2>
        <button
          className="text-white text-xl hover:text-gray-200"
          onClick={() => setShowModal(false)}
        >
          ✕
        </button>
      </div>

      {/* BODY — bottom rounded */}
      <div className="p-6 bg-white rounded-b-lg">

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ setFieldValue, values }) => (
            <Form className="mt-2">

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                {/* Program */}
                <div>
                  <label className="font-medium">Program <span className="text-red-500">*</span></label>
                  <Select
  options={programs.map(p => ({
    label: p.program_name,
    value: String(p.program_id),
  }))}

  value={
    programs
      .map(p => ({
        label: p.program_name,
        value: String(p.program_id),
      }))
      .find(opt => opt.value === String(selectedProgramId)) || null
  }

  onChange={(opt) => {
    const programId = opt?.value || "";

    setFieldValue("program_id", programId);
    setSelectedProgramId(programId);
    localStorage.setItem("selectedOBEprogram", programId);

    // Reset dependent fields
    setFieldValue("class_id", "");
    setFieldValue("semester_id", "");
    setSemesterOptions([]);
    setTools([]);
    setExamType(null);

    if (programId) fetchClasses(programId);
  }}

  isClearable
/>

                  <ErrorMessage name="program_id" component="div" className="text-red-500 text-sm" />
                </div>

                {/* Class */}
                <div>
                  <label className="font-medium">Class <span className="text-red-500">*</span></label>
                  <Select
                    options={classOptions.map(c => ({ label: c.name, value: c.class_year_id }))}
                    onChange={(opt) => {
                      setFieldValue("class_id", opt?.value || "");
                      setFieldValue("semester_id", "");
                      const classObj = classOptions.find(c => c.class_year_id === opt?.value);
                      setSemesterOptions(classObj?.semesters || []);
                    }}
                    isDisabled={!values.program_id}
                    isClearable
                  />
                  <ErrorMessage name="class_id" component="div" className="text-red-500 text-sm" />
                </div>

                {/* Semester */}
                <div>
                  <label className="font-medium">Semester <span className="text-red-500">*</span></label>
                  <Select
                    options={semesterOptions.map(s => ({ label: s.name, value: s.semester_id }))}
                    onChange={(opt) => {
                      setFieldValue("semester_id", opt?.value || "");
                      setTools([]);
                      setExamType(null);
                    }}
                    isDisabled={!values.class_id}
                    isClearable
                  />
                  <ErrorMessage name="semester_id" component="div" className="text-red-500 text-sm" />
                </div>

                {/* Course */}
                <div>
                  <label className="font-medium">Course <span className="text-red-500">*</span></label>
                  <Select
                    options={courseOptions.map(c => ({ label: c.name || c.subject_name, value: c.subject_id }))}
                    onChange={(opt) => {
                      setFieldValue("course_id", opt?.value || "");
                      setTools([]);
                      setExamType(null);
                      // If exam type is already selected, fetch tools for new course
                      if (examType?.value && opt?.value) {
                        fetchToolsByExamType(examType.value, opt.value);
                      }
                    }}
                    isDisabled={!values.semester_id}
                    isClearable
                  />
                  <ErrorMessage name="course_id" component="div" className="text-red-500 text-sm" />
                </div>

                {/* Academic Year */}
                <div>
                  <label className="font-medium">Academic Year <span className="text-red-500">*</span> </label>
                  <Select
                    options={academicYears.map(ay => ({ label: ay.year, value: ay.id }))}
                    onChange={(opt) => setFieldValue("batch_id", opt?.value || "")}
                    placeholder="Select Academic Year"
                    isClearable
                  />
                  <ErrorMessage name="batch_id" component="div" className="text-red-500 text-sm" />
                </div>

                {/* Exam Type */}
                <div>
                  <label className="font-medium">Exam Type <span className="text-red-500">*</span></label>
                  <Select
                    options={[
                      { label: "Internal", value: "internal" },
                      { label: "External", value: "external" },
                    ]}
                    value={examType}
                    onChange={(opt) => {
                      setExamType(opt);
                      setFieldValue("tool_id", "");
                      setFieldValue("tool_name", "");
                      setFieldValue("assessment_type", opt?.value || "");
                      setSelectedTool(null);
                      if (opt?.value && values.course_id) {
                        fetchToolsByExamType(opt.value, values.course_id);
                      } else {
                        setTools([]);
                      }
                    }}
                    isDisabled={!values.course_id}
                    isClearable
                  />
                  <ErrorMessage name="assessment_type" component="div" className="text-red-500 text-sm" />
                </div>

                {/* Tool */}
                <div>
                  <label className="font-medium">Tool <span className="text-red-500">*</span></label>
                  <Select
                    options={tools.map((t) => ({ 
                      label: t.name || t.tool_name || t.assessment_tool, 
                      value: t.nba_external_config_id || t.nba_internal_config_id || t.tool_id || t.id || t.config_id,
                      tool: t
                    }))}
                    onChange={(opt) => {
                      const tool = opt?.tool;
                      setFieldValue("tool_id", opt?.value || "");
                      setFieldValue("tool_name", tool?.name || tool?.tool_name || tool?.assessment_tool || "");
                      setSelectedTool(tool);
                    }}
                    isDisabled={!examType || !values.course_id}
                    isClearable
                  />
                  <ErrorMessage name="tool_id" component="div" className="text-red-500 text-sm" />
                </div>

                {/* Numeric Fields */}
                {["target", "maximum_marks", "level1", "level2", "level3"].map((field, i) => (
                  <div key={i}>
                    <label className="font-medium">{field.toUpperCase()} <span className="text-red-500">*</span></label>
                    <Field
                      type="number"
                      name={field}
                      min="0"
                      className="w-full border rounded p-2"
                    />
                    <ErrorMessage
                      name={field}
                      component="div"
                      className="text-red-500 text-sm"
                    />
                  </div>
                ))}
              </div>

              {/* Buttons */}
              <div className="flex justify-center gap-4 mt-6">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-300 px-6 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>

            </Form>
          )}
        </Formik>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default SetTarget;
