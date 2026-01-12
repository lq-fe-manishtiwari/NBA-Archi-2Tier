import React, { useState, useEffect } from "react";
import { collegeService } from "../../../Academics/Services/college.service";
import { classService } from "../../../Academics/Services/class.service";
import { courseService } from "../../../Courses/Services/courses.service";
import { MarksEntryService } from "../../Services/marks-entry.service";

const MarksEntryTable = () => {
  const [programs, setPrograms] = useState([]);
  const [classes, setClasses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [courses, setCourses] = useState([]);
  const [marksData, setMarksData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [values, setValues] = useState({
    program_id: "",
    class_id: "",
    semester_id: "",
    subject_id: "",
  });

  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentPageItems = marksData.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(marksData.length / itemsPerPage);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  useEffect(() => {
    loadPrograms();
    loadCourses();
  }, []);

  const loadPrograms = async () => {
    try {
      const res = await collegeService.getAllprogram();
      const formatted = res.map(p => ({
        // id: p.program_id,
        id: String(p.program_id),
        program_name: p.program_name,
      }));
      setPrograms(formatted);
    } catch (err) {
      console.error("Failed to load programs:", err);
    }
  };

  useEffect(() => {
  const storedProgram = localStorage.getItem("selectedOBEprogram");

  if (storedProgram && programs.length > 0) {
    setValues(prev => ({ ...prev, program_id: storedProgram }));
    loadClasses(storedProgram);
    console.log("Loaded saved program:", storedProgram);
  }
}, [programs]);

  const loadClasses = async (programId) => {
    try {
      const res = await classService.getAllClasses(programId);
      let formatted = [];

      if (Array.isArray(res)) {
        formatted = res.map(c => ({
          id: c.class_year_id,
          class_name: c.name,
          semesters: c.semesters || []
        }));
      } else if (res && typeof res === "object") {
        formatted = [{
          id: res.class_year_id,
          class_name: res.name,
          semesters: res.semesters || []
        }];
      }

      setClasses(formatted);
    } catch (err) {
      console.error("Failed to load classes:", err);
    }
  };

  const loadCourses = async () => {
    try {
      const res = await courseService.getAllCourses();
      setCourses(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error("Failed to load courses:", err);
    }
  };

  const onProgramChangeHandler = async (e) => {
    const program_id = e.target.value;

    setValues({ program_id, class_id: "", semester_id: "", subject_id: "" });

    setClasses([]);
    setSemesters([]);
    setMarksData([]);

    if (program_id) {
      await loadClasses(program_id);
    }
  };

  const onClassChangeHandler = async (e) => {
    const class_id = e.target.value;

    setValues(prev => ({ ...prev, class_id, semester_id: "", subject_id: "" }));

    setSemesters([]);
    setMarksData([]);

    if (class_id) {
      const classObj = classes.find(c => c.id == class_id);
      if (classObj && classObj.semesters) {
        setSemesters(classObj.semesters);
      }
    }
  };

  const onSemesterChangeHandler = (e) => {
    const semester_id = e.target.value;

    setValues(prev => ({ ...prev, semester_id, subject_id: "" }));
    setMarksData([]);
  };

  const onCourseChangeHandler = async (e) => {
    const subject_id = e.target.value;

    setValues(prev => ({ ...prev, subject_id }));

    if (subject_id && values.semester_id) {
      await loadMarksData(values.semester_id, subject_id);
    } else {
      setMarksData([]);
    }
  };

  const loadMarksData = async (semesterId, subjectId) => {
    setLoading(true);
    try {
      const response = await MarksEntryService.getMarksBySemesterSubject(
        semesterId,
        subjectId
      );
      setMarksData(response?.data || response || []);
      setCurrentPage(1);
    } catch (err) {
      console.error("Failed to load marks data:", err);
      setMarksData([]);
    } finally {
      setLoading(false);
    }
  };

  const tableColumns = [
    { label: "Student Name", field: "student_name" },
    { label: "Roll Number", field: "roll_number" },
    { label: "ERN Number", field: "ern_number" },
    { label: "Program Name", field: "program_name", responsiveClass: "hidden md:table-cell" },
    // { label: "Batch Name", field: "batch_name" },
    { label: "Subject Name", field: "subject_name" },
    // { label: "Course Code", field: "course_code" },
    { label: "Exam Type", field: "exam_type", responsiveClass: "hidden md:table-cell" },
    { label: "Exam Name", field: "exam_name" },
    { label: "Assessment Type", field: "assessment_type", responsiveClass: "hidden md:table-cell" },
    { label: "Total Marks", field: "total_marks" },
    { label: "Marks Obtained", field: "marks_obtained" },
    { label: "Status", field: "status" },
  ];

  return (
    <div className="p-6">
      <h2 className="pageheading text-xl font-semibold mb-4">Marks Entry Table</h2>

      {/* Filters */}
      <div className="w-full grid md:grid-cols-4 gap-6 mb-6">

        <div className="w-full">
          <label className="block font-semibold mb-1">Program</label>
          <select
            value={values.program_id}
            onChange={onProgramChangeHandler}
            className="border rounded px-3 py-2 w-full"
          >
            <option value="">Select Program</option>
            {programs.map(p => (
              <option key={p.id} value={p.id}>{p.program_name}</option>
            ))}
          </select>
        </div>

        <div className="w-full">
          <label className="block font-semibold mb-1">Class</label>
          <select
            value={values.class_id}
            onChange={onClassChangeHandler}
            className="border rounded px-3 py-2 w-full"
            disabled={!values.program_id}
          >
            <option value="">Select Class</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.class_name}</option>
            ))}
          </select>
        </div>

        <div className="w-full">
          <label className="block font-semibold mb-1">Semester</label>
          <select
            value={values.semester_id}
            onChange={onSemesterChangeHandler}
            className="border rounded px-3 py-2 w-full"
            disabled={!values.class_id}
          >
            <option value="">Select Semester</option>
            {semesters.map(s => (
              <option key={s.semester_id} value={s.semester_id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="w-full">
          <label className="block font-semibold mb-1">Course</label>
          <select
            value={values.subject_id}
            onChange={onCourseChangeHandler}
            className="border rounded px-3 py-2 w-full"
            disabled={!values.semester_id}
          >
            <option value="">Select Course</option>
            {courses.map(c => (
              <option key={c.subject_id} value={c.subject_id}>{c.name}</option>
            ))}
          </select>
        </div>

      </div>

      {/* TABLE UI SAME AS Peo_Mission */}
      {loading ? (
        <div className="text-center py-10">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading data...</p>
        </div>
      ) : marksData.length > 0 ? (

        <div className="overflow-x-auto w-full">

          <table className="min-w-full border border-gray-300 rounded-lg">
            <thead className="bg-primary-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-large text-gray-50 uppercase tracking-wider">Sr.No</th>

                {tableColumns.map(col => (
                  <th
                    key={col.field}
                    className={`px-6 py-3 text-left text-xs font-large text-gray-50 uppercase tracking-wider ${col.responsiveClass || ''}`}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {currentPageItems.map((row, index) => (
                <tr key={index} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{indexOfFirst + index + 1}</td>

                  {tableColumns.map(col => (
                    <td key={col.field} className={`px-4 py-2 ${col.responsiveClass || ''}`}>
                      {row[col.field]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 w-full">

            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-primary-600 text-white rounded disabled:bg-gray-300"
            >
              Previous
            </button>

            <div className="text-gray-600 text-sm">
              Showing {indexOfFirst + 1}–
              {Math.min(indexOfLast, marksData.length)} of {marksData.length} entries
            </div>

            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-primary-600 text-white rounded disabled:bg-gray-300"
            >
              Next
            </button>

          </div>

        </div>

      ) : (
        <p className="text-center py-6 text-gray-500">
          {values.subject_id
            ? "No data found for this course."
            : "Please select program, class, semester and course to view data."}
        </p>
      )}

    </div>
  );
};

export default MarksEntryTable;
