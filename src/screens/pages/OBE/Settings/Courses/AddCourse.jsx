import React, { useState, useEffect, useRef } from "react";
import { Formik, Form } from "formik";
import { Link } from "react-router-dom";

const AddCourse = ({ location }) => {
  const courseData = location?.state?.courseData || null;
  const selectedBatchId = location?.state?.selectedBatchId || "";
  const selectedSemesterId = location?.state?.selectedSemesterId || "";
  const subject_name = location?.state?.subject_name || "";
  const subject_code = location?.state?.subject_code || "";

  const [isEdit] = useState(!!courseData);
  const [batches, setBatches] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(selectedBatchId);
  const [selectedSemesters, setSelectedSemesters] = useState(
    selectedSemesterId ? [{ id: selectedSemesterId, name: "Loading..." }] : []
  );
  const [selectedSubjects, setSelectedSubjects] = useState(
    selectedSemesterId && courseData
      ? {
          [selectedSemesterId]: [
            {
              subject_code: subject_code,
              name: subject_name,
              id: courseData?.semester_subject_id || null,
            },
          ],
        }
      : {}
  );
  const [isLoading, setIsLoading] = useState(false);
  const [modal, setModal] = useState({ show: false, type: "", heading: "", content: "" });

  const restoreAttempted = useRef(false);

  useEffect(() => {
    setIsLoading(true);
    // Simulate loading batches
    setTimeout(() => {
      setBatches([
        { grade_id: "1", name: "Program 1" },
        { grade_id: "2", name: "Program 2" },
      ]);
      setIsLoading(false);
    }, 500);

    tryRestoreFromSettings();
  }, []);

  const tryRestoreFromSettings = () => {
    if (restoreAttempted.current) return;
    restoreAttempted.current = true;
    if (isEdit || selectedProgram) return;

    const savedGradeId = localStorage.getItem("nba_program") || "";
    const savedSemesterId = localStorage.getItem("nba_semester") || "";

    if (!savedGradeId) return;

    const gradeValid = batches.some((g) => String(g.grade_id) === savedGradeId);
    if (!gradeValid) return;

    setSelectedProgram(savedGradeId);

    const dummySemesters = [
      { id: "1", name: "Semester 1" },
      { id: "2", name: "Semester 2" },
    ];
    setSemesters(dummySemesters);

    if (savedSemesterId) {
      const found = dummySemesters.find((s) => String(s.id) === savedSemesterId);
      if (found) {
        setSelectedSemesters([found]);
        setSelectedSubjects((prev) => ({
          ...prev,
          [found.id]: prev[selectedSemesterId]?.length
            ? prev[selectedSemesterId]
            : [{ subject_code: "", name: "" }],
        }));
      }
    }
  };

  const handleSemesterSelect = (selectedList) => {
    setSelectedSemesters(selectedList);
    setSelectedSubjects((prev) => {
      const updated = { ...prev };
      selectedList.forEach((sem) => {
        if (!updated[sem.id]) updated[sem.id] = [{ subject_code: "", name: "" }];
      });
      return updated;
    });
  };

  const addCourseRow = (semesterId) => {
    setSelectedSubjects((prev) => ({
      ...prev,
      [semesterId]: [...(prev[semesterId] || []), { subject_code: "", name: "" }],
    }));
  };

  const removeCourseRow = (semesterId, index) => {
    setSelectedSubjects((prev) => {
      const updated = { ...prev };
      if (updated[semesterId].length > 1) {
        updated[semesterId].splice(index, 1);
      } else {
        updated[semesterId] = [{ subject_code: "", name: "" }];
      }
      return updated;
    });
  };

  const showModal = (type, heading, content) => {
    setModal({ show: true, type, heading, content });
  };

  const handleSubmit = (semesterId) => {
    const semesterCourses = selectedSubjects[semesterId] || [];
    const validCourses = semesterCourses.filter(
      (course) => course.subject_code?.trim() && course.name?.trim()
    );
    if (!validCourses.length) {
      showModal("warning", "Warning", "Please add at least one course with code and name.");
      return;
    }
    console.log("Submit payload:", { semesterId, subjects: validCourses });
    showModal("success", "Success", "Courses saved successfully!");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Loader */}
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-20 z-50">
          <div className="bg-white p-4 rounded shadow">Loading...</div>
        </div>
      )}

      {/* Modal */}
      {modal.show && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow w-96">
            <h2 className="text-lg font-bold mb-2">{modal.heading}</h2>
            <p className="mb-4">{modal.content}</p>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded"
              onClick={() => setModal({ ...modal, show: false })}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">{isEdit ? "Edit" : "Add"} Courses</h1>
          <Link to={{ pathname: "/obe-setting", state: { selectedTabIndex: 6 } }}>x</Link>
        </div>

        <Formik initialValues={{}} onSubmit={(e) => e.preventDefault()}>
          {() => (
            <Form>
              {/* Program & Semester */}
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-4">
                <div>
                  <label className="block font-medium mb-1">Program *</label>
                  <select
                    value={selectedProgram}
                    disabled={isEdit}
                    className="w-full border border-gray-300 rounded px-2 py-1"
                    onChange={(e) => {
                      setSelectedProgram(e.target.value);
                      setSemesters([
                        { id: "1", name: "Semester 1" },
                        { id: "2", name: "Semester 2" },
                      ]);
                      setSelectedSemesters([]);
                    }}
                  >
                    <option value="">Select Program</option>
                    {batches.map((g) => (
                      <option key={g.grade_id} value={g.grade_id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium mb-1">Select Semester *</label>
                  <select
                    multiple
                    value={selectedSemesters.map((s) => s.id)}
                    disabled={isEdit}
                    className="w-full border border-gray-300 rounded px-2 py-1 h-32"
                    onChange={(e) => {
                      const options = Array.from(e.target.selectedOptions);
                      const selected = options.map((opt) => ({
                        id: opt.value,
                        name: opt.text,
                      }));
                      handleSemesterSelect(selected);
                    }}
                  >
                    {semesters.map((sem) => (
                      <option key={sem.id} value={sem.id}>
                        {sem.name}
                      </option>
                    ))}
                  </select>
                  {semesters.length === 0 && selectedProgram && (
                    <p className="text-sm text-gray-500 mt-1">No semesters found for this program</p>
                  )}
                </div>
              </div>

              {/* Courses per Semester */}
              {selectedSemesters.map((sem) => (
                <div key={sem.id} className="mb-6 border rounded shadow bg-white">
                  <div className="bg-blue-600 text-white px-4 py-2 rounded-t">
                    <h6>{sem.name}</h6>
                  </div>
                  <div className="p-4 overflow-x-auto">
                    <table className="w-full table-auto border-collapse border border-gray-300 text-left">
                      <thead>
                        <tr className="bg-gray-700 text-white">
                          <th className="border px-2 py-1">Course Code</th>
                          <th className="border px-2 py-1">Course Name</th>
                          {!isEdit && <th className="border px-2 py-1">Action</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {(selectedSubjects[sem.id] || []).map((course, idx) => (
                          <tr key={idx}>
                            <td className="border px-2 py-1">
                              <input
                                type="text"
                                value={course.subject_code}
                                className="w-full border rounded px-2 py-1"
                                onChange={(e) =>
                                  setSelectedSubjects((prev) => {
                                    const updated = [...(prev[sem.id] || [])];
                                    updated[idx] = { ...updated[idx], subject_code: e.target.value };
                                    return { ...prev, [sem.id]: updated };
                                  })
                                }
                              />
                            </td>
                            <td className="border px-2 py-1">
                              <input
                                type="text"
                                value={course.name}
                                className="w-full border rounded px-2 py-1"
                                onChange={(e) =>
                                  setSelectedSubjects((prev) => {
                                    const updated = [...(prev[sem.id] || [])];
                                    updated[idx] = { ...updated[idx], name: e.target.value };
                                    return { ...prev, [sem.id]: updated };
                                  })
                                }
                              />
                            </td>
                            {!isEdit && (
                              <td className="border px-2 py-1 text-center">
                                <button
                                  type="button"
                                  className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded mr-2"
                                  onClick={() => addCourseRow(sem.id)}
                                >
                                  +
                                </button>
                                <button
                                  type="button"
                                  className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                                  onClick={() => removeCourseRow(sem.id, idx)}
                                  disabled={(selectedSubjects[sem.id] || []).length <= 1}
                                >
                                  -
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="mt-4 flex justify-center space-x-2">
                      <button
                        type="button"
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                        onClick={() => handleSubmit(sem.id)}
                      >
                        {isEdit ? "Update" : "Submit"}
                      </button>
                      <Link to={{ pathname: "/obe-setting", state: { selectedTabIndex: 6 } }}>
                        <button type="button" className="bg-gray-300 px-4 py-2 rounded">
                          Cancel
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default AddCourse;
