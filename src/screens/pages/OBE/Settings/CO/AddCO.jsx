import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SweetAlert from "react-bootstrap-sweetalert";
import { collegeService } from "../../../Academics/Services/college.service";
import { classService } from '../../../Academics/Services/class.service.js'
import { courseService } from "../../../Courses/Services/courses.service.js";
import { COService } from "../Services/co.service.js";

import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const AddCO = () => {
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  
  const [programOptions, setProgramOptions] = useState([]);
  const [classOptions, setClassOptions] = useState([]);
  const [semesterOptions, setSemesterOptions] = useState([]);
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const [selectedCourses, setSelectedCourses] = useState([]);
  const [courseCoData, setCourseCoData] = useState({});
  const [coValidationErrors, setCoValidationErrors] = useState({});

  const initialValues = {
    grade_id: "",
    semester_id: "",
    subject_id: [],
  };

  useEffect(() => {
  if (selectedCourse && !courseCoData[selectedCourse]) {
    setCourseCoData((prev) => ({
      ...prev,
      [selectedCourse]: [{ coCode: "CO1", coStatement: "" }],
    }));
    if (!selectedCourses.includes(selectedCourse)) {
      setSelectedCourses((prev) => [...prev, selectedCourse]);
    }
  }
}, [selectedCourse]);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const res = await collegeService.getAllprogram();
        const formatted = res.map(p => ({
          label: p.program_name, 
          // value: p.program_id,
          value: String(p.program_id),

        }));
        setProgramOptions(formatted);
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
      }
    };
    fetchPrograms();
  }, []);

    useEffect(() => {
    const storedProgram = localStorage.getItem("selectedOBEprogram");
  
    if (storedProgram && programOptions.length > 0) {
      setSelectedProgram(storedProgram); 
      console.log("Loaded saved program:", storedProgram);
    }
  }, [programOptions]);
  
  // Fetch Classes when program changes
  useEffect(() => {
    const loadClasses = async () => {
      if (!selectedProgram) {
        setClassOptions([]);
        return;
      }
      try {
        const res = await classService.getAllClasses(selectedProgram);
        let formattedClasses = [];
        if (Array.isArray(res)) {
          formattedClasses = res.map(c => ({
            label: c.name,
            value: c.class_year_id,
            full: c,
          }));
        } else if (res && typeof res === "object") {
          formattedClasses = [{ label: res.name, value: res.class_year_id, full: res }];
        }
        setClassOptions(formattedClasses);
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
  
  // Fetch Semesters when class changes
  useEffect(() => {
    if (!selectedClass) {
      setSemesterOptions([]);
      setSelectedSemester("");
      return;
    }
  
    // Convert to string to avoid type mismatch
    const classObj = classOptions.find(c => String(c.value) === String(selectedClass));
  
    if (classObj && classObj.full?.semesters) {
      const formattedSemesters = classObj.full.semesters.map(s => ({
        label: s.name,        // "first sem", "third sem"
        value: s.semester_id,
      }));
      setSemesterOptions(formattedSemesters);
      setSelectedSemester("");  // reset semester when class changes
    } else {
      setSemesterOptions([]);
      setSelectedSemester("");
    }
  }, [selectedClass, classOptions]);
  
  
  useEffect(() => {
    const fetchPapers = async () => {
      try {
        setLoading(true);
        const res = await courseService.getAllCourses();
        setPapers(res || []);
      } catch (err) {
        console.error(err);
        setPapers([]);
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
      } finally {
        setLoading(false);
      }
    };
    fetchPapers();
  }, []);

  const validationSchema = Yup.object().shape({
    grade_id: Yup.string().required("Program is required"),
    semester_id: Yup.string().required("Semester is required"),
    subject_id: Yup.array().min(1, "At least one course is required"),
  });

  const validateCoFields = () => {
    const errors = {};
    let isValid = true;

    Object.keys(courseCoData).forEach((courseId) => {
      courseCoData[courseId].forEach((co, index) => {
        if (!co.coCode || co.coCode.trim() === "") {
          errors[`${courseId}-${index}-coCode`] = "CO Code is required";
          isValid = false;
        }
        if (!co.coStatement || co.coStatement.trim() === "") {
          errors[`${courseId}-${index}-coStatement`] = "CO Statement is required";
          isValid = false;
        }
      });
    });

    setCoValidationErrors(errors);
    return isValid;
  };

  const handleSingleCourseSelect = (courseId) => {
    setSelectedCourse(courseId);

    if (!courseCoData[courseId]) {
      setCourseCoData((prev) => ({
        ...prev,
        [courseId]: [{ coCode: "CO1", coStatement: "" }],
      }));
    }

    if (!selectedCourses.includes(courseId)) {
      setSelectedCourses((prev) => [...prev, courseId]);
    }
  };

  const addCoRow = (courseId) => {
  setCourseCoData((prev) => {
    const existing = prev[courseId] || [];
    const newCode = `CO${existing.length + 1}`; // AUTO GENERATE CO1, CO2, CO3...

    return {
      ...prev,
      [courseId]: [
        ...existing,
        { coCode: newCode, coStatement: "" }
      ],
    };
  });
};


  const removeCoRow = (courseId, rowIndex) => {
    setCourseCoData((prev) => {
      const updated = { ...prev };
      if (updated[courseId].length > 1) updated[courseId].splice(rowIndex, 1);
      return updated;
    });
  };

  const handleCoChange = (courseId, rowIndex, field, value) => {
    setCourseCoData((prev) => {
      const updated = { ...prev };
      updated[courseId][rowIndex][field] = value;
      return updated;
    });

    if (value.trim() !== "") {
      setCoValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`${courseId}-${rowIndex}-${field}`];
        return newErrors;
      });
    }
  };

  const handleCourseSubmit = async () => {
    if (!validateCoFields()) {
      setAlert(
        <SweetAlert
          warning
          title="Validation Error!"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => setAlert(null)}
        >
          Please fill all required CO fields.
        </SweetAlert>
      );
      return;
    }

    const outcomes = (courseCoData[selectedCourse] || []).map((co, index) => ({
      co_code: co.coCode,
      co_statement: co.coStatement
    }));

    const payload = {
      subject_id: Number(selectedCourse),
      semester_id: Number(selectedSemester),
      outcomes: outcomes
    };

    console.log("Payload Sent:", payload);

    try {
      const res = await COService.saveCO(payload);
      setAlert(
        <SweetAlert
          success
          title="Saved"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => {
            setAlert(null);
            window.location.href = "/obe/settings/CO"; // redirect after OK
          }}
        >
           Saved Successfully.
        </SweetAlert>
      );
    } catch (err) {
      console.error("Saving CO Failed:", err);
      setAlert(
        <SweetAlert
          error
          title="Error!"
          confirmBtnCssClass="btn-confirm"
          onConfirm={() => setAlert(null)}
        >
          Error saving CO. Please try again.
        </SweetAlert>
      );
    }
  };

  return (
    <div className="p-6">
      <h2 className="pageheading text-xl font-semibold mb-4">Add CO</h2>

      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={() => {}}>
        {({ setFieldValue }) => (
          <Form>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              {/* Program */}
              <div>
                <label className="block mb-1 font-medium">Program</label>
                <select
                  className="border p-2 rounded w-full"
                  value={selectedProgram}
                  onChange={(e) => setSelectedProgram(e.target.value)}
                >
                  <option value="">Select Program</option>
                  {programOptions.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 font-medium">Class</label>
                <select
                  className="border p-2 rounded w-full"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  disabled={!selectedProgram}
                >
                  <option value="">Select Class</option>
                  {classOptions.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* Semester */}
              <div>
                <label className="block mb-1 font-medium">Semester</label>
                <select
                  className="border p-2 rounded w-full"
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  disabled={!selectedClass}
                >
                  <option value="">Select Semester</option>
                  {semesterOptions.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              {/* Course */}
              <div>
                <label className="block mb-1 font-medium">Course</label>
                <select
                  className="border p-2 rounded w-full"
                  value={selectedCourse}
                  onChange={(e) => handleSingleCourseSelect(e.target.value)}
                  disabled={!selectedSemester}
                >
                  <option value="">Select Course</option>
                  {papers.map((c) => (
                    <option key={c.subject_id} value={c.subject_id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* CO Rows */}
            {selectedCourses.map((courseId) => {
              const course = papers.find((c) => String(c.subject_id) === String(courseId));
              const coRows = courseCoData[courseId] || [];

              return (
                <div key={courseId} className="mb-6 bg-white rounded shadow">
                  <div className="bg-primary-600 text-white px-4 py-2 rounded-t">
                    {course?.paper_code} - {course?.name}
                  </div>
                  <div className="p-4">
                    {coRows.map((row, rowIndex) => (
                      <div key={rowIndex} className="grid grid-cols-12 gap-4 mb-2 items-center">
                        <div className="col-span-3">
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded px-3 py-2"
                            placeholder="CO Code"
                            value={row.coCode}
                            onChange={(e) => handleCoChange(courseId, rowIndex, "coCode", e.target.value)}
                          />
                          {coValidationErrors[`${courseId}-${rowIndex}-coCode`] && (
                            <div className="text-red-500 text-sm mt-1">{coValidationErrors[`${courseId}-${rowIndex}-coCode`]}</div>
                          )}
                        </div>
                        <div className="col-span-8">
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded px-3 py-2"
                            placeholder="CO Statement"
                            value={row.coStatement}
                            onChange={(e) => handleCoChange(courseId, rowIndex, "coStatement", e.target.value)}
                          />
                          {coValidationErrors[`${courseId}-${rowIndex}-coStatement`] && (
                            <div className="text-red-500 text-sm mt-1">{coValidationErrors[`${courseId}-${rowIndex}-coStatement`]}</div>
                          )}
                        </div>
                        <div className="col-span-1 flex gap-2">
                          <button type="button" onClick={() => addCoRow(courseId)} className="bg-green-500 hover:bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center">
                            +
                          </button>
                          <button type="button" onClick={() => removeCoRow(courseId, rowIndex)} className="bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center" disabled={coRows.length <= 1}>
                            -
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Buttons */}
                  <div className="p-4 flex gap-4 justify-center">
                    <button type="button" onClick={handleCourseSubmit} className="bg-blue-600 text-white px-6 py-2 rounded">
                      Save
                    </button>
                    <Link to="/obe-setting">
                      <button type="button" className="bg-gray-400 text-white px-6 py-2 rounded">
                        Cancel
                      </button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </Form>
        )}
      </Formik>
      {alert}
    </div>
  );
};

export default AddCO;