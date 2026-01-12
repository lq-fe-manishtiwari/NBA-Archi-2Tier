import React, { useState, useEffect } from "react";
import Select from "react-select";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { collegeService } from "../../../Academics/Services/college.service.js";
import { classService } from "../../../Academics/Services/class.service.js";
import { courseService } from "../../../Courses/Services/courses.service";
import { POService } from "../../Settings/Services/po.service";
import { PSOService } from "../../Settings/Services/pso.service";
import { AttainmentConfigService } from "../../Services/attainment-config.service.js";
import { AcademicService } from "../../../Academics/Services/Academic.service.js";
import { toast } from "react-toastify";
import SweetAlert from "react-bootstrap-sweetalert";

const SetTargetAttainment = () => {
  const [showModal, setShowModal] = useState(false);
  const [programs, setPrograms] = useState([]);
  const [selectedProgramId, setSelectedProgramId] = useState(
    localStorage.getItem("selectedOBEprogram") || ""
  );
  const [classOptions, setClassOptions] = useState([]);
  const [semesterOptions, setSemesterOptions] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [pos, setPos] = useState([]);
  const [psos, setPsos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const initialValues = {
    target: "",
    level1: "",
    level2: "",
    level3: "",
    maximum_marks: "",
    program_id: "",
    class_id: "",
    semester_id: "",
    course_id: "",
    batch_id: "",
    po_id: "",
    pso_id: "",
    mapping_type: "all",
  };

  // Fetch initial data
  useEffect(() => {
    fetchPrograms();
    fetchAcademicYears();
  }, []);

  const fetchPrograms = async () => {
    try {
      const data = await collegeService.getAllprogram();
      setPrograms(data || []);
    } catch (err) {
      console.error("Failed to fetch programs:", err);
    }
  };

  useEffect(() => {
    // Fetch classes for the program saved in localStorage once programs are loaded
    if (selectedProgramId && programs.length > 0) {
      fetchClasses(selectedProgramId);
    }
  }, [programs, selectedProgramId]);

  const fetchClasses = async (programId) => {
    try {
      const res = await classService.getAllClasses(programId);
      setClassOptions(Array.isArray(res) ? res : [res].filter(Boolean));
    } catch (err) {
      console.error(err);
      setClassOptions([]);
    }
  };

  const fetchPOsPSOs = async (programId) => {
    try {
      const [poData, psoData] = await Promise.all([
        POService.getPObyProgramId(programId),
        PSOService.getPSOByProgramId(programId)
      ]);
      setPos(poData || []);
      setPsos(psoData || []);
      fetchCourses();
    } catch (err) {
      console.error("Failed to fetch POs/PSOs:", err);
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

  const validationSchema = Yup.object().shape({
    program_id: Yup.string().required("Program is required"),
    class_id: Yup.string().required("Class is required"),
    semester_id: Yup.string().required("Semester is required"),
    course_id: Yup.string().required("Course is required"),
    mapping_type: Yup.string().required("Mapping type is required"),
    po_id: Yup.string().when("mapping_type", {
      is: "po",
      then: Yup.string().required("PO is required"),
    }),
    pso_id: Yup.string().when("mapping_type", {
      is: "pso",
      then: Yup.string().required("PSO is required"),
    }),
    target: Yup.number().required("Target is required").min(0),
    level1: Yup.number().required("Level 1 is required").min(0),
    level2: Yup.number().required("Level 2 is required").min(0),
    level3: Yup.number().required("Level 3 is required").min(0),
    maximum_marks: Yup.number().required("Total Marks is required").min(0),
  });

  const onSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setLoading(true);

      const payload = {
        obe_survey_attainment_id: null,
        level1: values.level1,
        level2: values.level2,
        level3: values.level3,
        target: values.target,
        maximum_marks: values.maximum_marks,
        program_id: values.program_id,
        academic_year_id: values.batch_id,
        po_id: values.mapping_type === "po" || values.mapping_type === "all" ? values.po_id || null : null,
        pso_id: values.mapping_type === "pso" || values.mapping_type === "all" ? values.pso_id || null : null,
      };

      await AttainmentConfigService.saveSurveyConfig(payload);
      setAlert(
        <SweetAlert
          success
          title="Saved!"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => {
            setAlert(null);
            resetForm();
            setShowModal(false);
          }}
        >
          Target attainment saved successfully!
        </SweetAlert>
      );
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to save target attainment");
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <div>
      <button
        className="bg-primary-600 text-white px-3 py-2 rounded hover:bg-primary-700"
        onClick={() => setShowModal(true)}
      >
        Set Target
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">

          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl">

            {/* BLUE HEADER */}
            <div className="bg-[#2563EB] h-14 flex justify-between items-center px-6 rounded-t-lg">
              <h2 className="text-xl font-semibold text-white">Set Target</h2>
              <button
                className="text-white text-xl font-bold"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>

            {/* FORM BLOCK */}
            <div className="p-6">
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={onSubmit}
              >
                {({ setFieldValue, values, isSubmitting }) => (
                  <Form className="space-y-4">

                    {/* Program / Class / Semester */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="font-medium text-sm">Program <span className="text-red-500">*</span></label>
                        <Select
                          options={programs.map(p => ({ value: p.program_id.toString(), label: p.program_name }))}
                          value={
                            programs
                              .map(p => ({ value: p.program_id.toString(), label: p.program_name }))
                              .find(opt => opt.value === selectedProgramId.toString()) || null
                          }
                          onChange={(opt) => {
                            setFieldValue("program_id", opt?.value);
                            setSelectedProgramId(opt?.value || "");
                            localStorage.setItem("selectedOBEprogram", opt?.value || "");
                            setFieldValue("class_id", "");
                            setFieldValue("semester_id", "");
                            if (opt?.value) {
                              fetchClasses(opt.value);
                              fetchPOsPSOs(opt.value);
                            }
                          }}
                        />
                        <ErrorMessage name="program_id" component="div" className="text-red-600 text-xs" />
                      </div>

                      <div>
                        <label className="font-medium text-sm">Class <span className="text-red-500">*</span></label>
                        <Select
                          options={classOptions.map(c => ({ value: c.class_year_id, label: c.name }))}
                          onChange={(opt) => {
                            setFieldValue("class_id", opt?.value);
                            setFieldValue("semester_id", "");
                            const classObj = classOptions.find(c => c.class_year_id === opt?.value);
                            setSemesterOptions(classObj?.semesters || []);
                          }}
                          value={classOptions.map(c => ({ value: c.class_year_id, label: c.name })).find(o => o.value === values.class_id) || null}
                          isDisabled={!values.program_id}
                        />
                        <ErrorMessage name="class_id" component="div" className="text-red-600 text-xs" />
                      </div>

                      <div>
                        <label className="font-medium text-sm">Semester <span className="text-red-500">*</span></label>
                        <Select
                          options={semesterOptions.map(s => ({ value: s.semester_id, label: s.name }))}
                          onChange={(opt) => setFieldValue("semester_id", opt?.value)}
                          value={semesterOptions.map(s => ({ value: s.semester_id, label: s.name })).find(o => o.value === values.semester_id) || null}
                          isDisabled={!values.class_id}
                        />
                        <ErrorMessage name="semester_id" component="div" className="text-red-600 text-xs" />
                      </div>
                    </div>

                    {/* Course / Batch / Mapping Type */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="font-medium text-sm">Course <span className="text-red-500">*</span></label>
                        <Select
                          options={courseOptions.map(c => ({ value: c.subject_id, label: c.name || c.subject_name }))}
                          onChange={(opt) => setFieldValue("course_id", opt?.value)}
                          value={courseOptions.map(c => ({ value: c.subject_id, label: c.name || c.subject_name })).find(o => o.value === values.course_id) || null}
                          isDisabled={!values.semester_id}
                        />
                        <ErrorMessage name="course_id" component="div" className="text-red-600 text-xs" />
                      </div>

                      <div>
                        <label className="font-medium text-sm">Academic Year</label>
                        <Select
                          options={academicYears.map(ay => ({ value: ay.id, label: ay.year }))}
                          onChange={(opt) => setFieldValue("batch_id", opt?.value)}
                          value={academicYears.map(ay => ({ value: ay.id, label: ay.year })).find(o => o.value === values.batch_id) || null}
                          placeholder="Select Academic Year"
                        />
                      </div>

                      <div>
                        <label className="font-medium text-sm">Mapping Type <span className="text-red-500">*</span></label>
                        <select
                          className="border w-full rounded px-2 py-1"
                          value={values.mapping_type}
                          onChange={(e) => {
                            setFieldValue("mapping_type", e.target.value);
                            setFieldValue("po_id", "");
                            setFieldValue("pso_id", "");
                          }}
                        >
                          <option value="po">PO</option>
                          <option value="pso">PSO</option>
                          <option value="all">All</option>
                        </select>
                      </div>
                    </div>

                    {/* PO / PSO Selection */}
                    {values.mapping_type !== "all" && (
                      <div>
                        <label className="font-medium text-sm">
                          {values.mapping_type === "po" ? "Select PO" : "Select PSO"}  <span className="text-red-500">*</span>
                        </label>

                        <Select
                          options={(values.mapping_type === "po" ? pos : psos).map(item => ({
                            value: values.mapping_type === "po" ? item.po_id : item.pso_id,
                            label: values.mapping_type === "po" ? item.po_code : item.pso_code
                          }))}
                          onChange={(opt) => {
                            values.mapping_type === "po"
                              ? setFieldValue("po_id", opt?.value)
                              : setFieldValue("pso_id", opt?.value);
                          }}
                          value={(values.mapping_type === "po"
                            ? pos.map(po => ({ value: po.po_id, label: po.po_code })).find(o => o.value === values.po_id)
                            : psos.map(pso => ({ value: pso.pso_id, label: pso.pso_code })).find(o => o.value === values.pso_id)
                          ) || null}
                        />

                        <ErrorMessage
                          name={values.mapping_type === "po" ? "po_id" : "pso_id"}
                          component="div"
                          className="text-red-600 text-xs"
                        />
                      </div>
                    )}

                    {/* Target / Total Marks */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="font-medium text-sm">Target <span className="text-red-500">*</span></label>
                        <Field type="number" name="target" className="w-full border rounded px-2 py-1" />
                        <ErrorMessage name="target" component="div" className="text-red-600 text-xs" />
                      </div>
                      <div>
                        <label className="font-medium text-sm">Total Marks <span className="text-red-500">*</span></label>
                        <Field type="number" name="maximum_marks" className="w-full border rounded px-2 py-1" />
                        <ErrorMessage name="maximum_marks" component="div" className="text-red-600 text-xs" />
                      </div>
                    </div>

                    {/* Levels 1–3 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="font-medium text-sm">Level 1 <span className="text-red-500">*</span></label>
                        <Field type="number" name="level1" className="w-full border rounded px-2 py-1" />
                        <ErrorMessage name="level1" component="div" className="text-red-600 text-xs" />
                      </div>
                      <div>
                        <label className="font-medium text-sm">Level 2 <span className="text-red-500">*</span></label>
                        <Field type="number" name="level2" className="w-full border rounded px-2 py-1" />
                        <ErrorMessage name="level2" component="div" className="text-red-600 text-xs" />
                      </div>
                      <div>
                        <label className="font-medium text-sm">Level 3 <span className="text-red-500">*</span></label>
                        <Field type="number" name="level3" className="w-full border rounded px-2 py-1" />
                        <ErrorMessage name="level3" component="div" className="text-red-600 text-xs" />
                      </div>
                    </div>

                    {/* Submit + Cancel */}
                    <div className="flex justify-center gap-4 pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                      >
                        Submit
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
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
      {alert}
    </div>
  );
};

export default SetTargetAttainment;
