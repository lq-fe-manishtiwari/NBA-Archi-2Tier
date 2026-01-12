import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MDBDataTable } from "mdbreact";
import SweetAlert from "react-bootstrap-sweetalert";

const dummyBatches = [
  { grade_id: "1", name: "B.Tech" },
  { grade_id: "2", name: "M.Tech" },
];

const dummySemesters = {
  "1": [
    { semester_id: "1", semester_name: "Semester 1" },
    { semester_id: "2", semester_name: "Semester 2" },
  ],
  "2": [
    { semester_id: "3", semester_name: "Semester 1" },
    { semester_id: "4", semester_name: "Semester 2" },
  ],
};

const dummyCourses = {
  "1": [
    { subject_id: "101", subject_name: "Mathematics", subject_code: "MATH101" },
    { subject_id: "102", subject_name: "Physics", subject_code: "PHY101" },
  ],
  "2": [
    { subject_id: "201", subject_name: "Advanced Math", subject_code: "AMATH201" },
  ],
  "3": [
    { subject_id: "301", subject_name: "Algorithms", subject_code: "CS301" },
  ],
  "4": [
    { subject_id: "401", subject_name: "Machine Learning", subject_code: "ML401" },
  ],
};

const ListCourse = () => {
  const [batches, setBatches] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [selectedSemesterId, setSelectedSemesterId] = useState("");
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    // Load dummy batches
    setBatches(dummyBatches);

    // Optionally restore from localStorage
    const storedBatch = localStorage.getItem("nba_program");
    const storedSemester = localStorage.getItem("nba_semester");
    if (storedBatch) {
      setSelectedBatchId(storedBatch);
      setSemesters(dummySemesters[storedBatch] || []);
    }
    if (storedSemester) {
      setSelectedSemesterId(storedSemester);
      setCourses(dummyCourses[storedSemester] || []);
    }
  }, []);

  const onBatchChangeHandler = (batchId) => {
    setSelectedBatchId(batchId);
    setSelectedSemesterId("");
    setCourses([]);
    setSemesters(dummySemesters[batchId] || []);
  };

  const onSemesterChangeHandler = (semesterId) => {
    setSelectedSemesterId(semesterId);
    setCourses(dummyCourses[semesterId] || []);
  };

  const confirmAlert = (courseId) => {
    const getAlert = (
      <SweetAlert
        warning
        showCancel
        confirmBtnText="Yes, delete it!"
        cancelBtnText="No"
        confirmBtnBsStyle="danger"
        cancelBtnBsStyle="primary"
        title="Are you sure?"
        onConfirm={() => handleDeleteEvent(courseId)}
        onCancel={() => setAlert(null)}
        focusCancelBtn
      />
    );
    setAlert(getAlert);
  };

  const handleDeleteEvent = (courseId) => {
    setCourses(courses.filter((c) => c.subject_id !== courseId));
    setAlert(
      <SweetAlert success title="Success" onConfirm={() => setAlert(null)}>
        Course deleted successfully!
      </SweetAlert>
    );
  };

  const tableData = {
    columns: [
      { label: "Sr.No", field: "sno", sort: "disabled", width: 50 },
      { label: "Course Code", field: "course_code", sort: "disabled", width: 150 },
      { label: "Course Name", field: "course_name", sort: "disabled", width: 250 },
      { label: "Action", field: "action", sort: "disabled", width: 150 },
    ],
    rows: courses.map((item, index) => ({
      sno: index + 1,
      course_code: item.subject_code,
      course_name: item.subject_name,
      action: (
        <div className="flex justify-center">
          <Link
            to={{
              pathname: "/add-course",
              state: {
                courseData: item,
                selectedBatchId,
                selectedSemesterId,
              },
            }}
          >
            <button
              type="button"
              title="Edit Data!"
              className="btn-sm btn-info rounded-full p-2 mx-1"
            >
              <i className="fa fa-edit fa-2x"></i>
            </button>
          </Link>
          <button
            onClick={() => confirmAlert(item.subject_id)}
            className="btn-sm btn-red rounded-full p-2 mx-1"
          >
            <i className="fa fa-trash fa-2x"></i>
          </button>
        </div>
      ),
    })),
  };

  return (
    <div className="p-4">
      {alert}
      <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">COURSE List</h2>
                    <Link
                      to="/obe/settings/Add_COURSES"
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
                    >
                      Add COURSE
                    </Link>
                  </div>

        <div className="flex flex-wrap gap-4 mb-4">
          {/* Program Dropdown */}
          <div className="w-1/3">
            <label className="block mb-2 font-semibold">
              Program <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2"
              onChange={(e) => onBatchChangeHandler(e.target.value)}
              value={selectedBatchId}
            >
              <option value="">Select Program</option>
              {batches.map((batch) => (
                <option key={batch.grade_id} value={batch.grade_id}>
                  {batch.name}
                </option>
              ))}
            </select>
          </div>

          {/* Semester Dropdown */}
          <div className="w-1/3">
            <label className="block mb-2 font-semibold">
              Semester <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2"
              onChange={(e) => onSemesterChangeHandler(e.target.value)}
              value={selectedSemesterId}
              disabled={!selectedBatchId}
            >
              <option value="">Select Semester</option>
              {semesters.map((sem) => (
                <option key={sem.semester_id} value={sem.semester_id}>
                  {sem.semester_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <MDBDataTable striped bordered hover small responsive data={tableData} />
      </div>

  );
};

export default ListCourse;
