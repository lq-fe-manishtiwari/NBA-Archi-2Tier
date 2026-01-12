import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const AssignTeacherTable = () => {
  // Dummy data for programs
  const dummyGrades = [
    { grade_id: 1, name: "BS Computer Science" },
    { grade_id: 2, name: "BS Software Engineering" },
    { grade_id: 3, name: "BS Artificial Intelligence" },
  ];

  // Dummy semesters
  const dummySemesters = {
    1: [
      { semester_id: 1, semester_name: "Fall 2024" },
      { semester_id: 2, semester_name: "Spring 2025" },
    ],
    2: [
      { semester_id: 3, semester_name: "Fall 2024" },
      { semester_id: 4, semester_name: "Spring 2025" },
    ],
    3: [
      { semester_id: 5, semester_name: "Summer 2025" }
    ],
  };

  // Dummy assigned teachers
  const dummyAssignments = [
    {
      id: 1,
      teacher: { firstname: "Ali", lastname: "Khan" },
      grade_id: 1,
      grade_name: "BS Computer Science",
      semester_id: 1,
      semester_name: "Fall 2024",
      course: "Data Structures",
      task_type: "Assignment",
      start_date: "2024-02-10",
      end_date: "2024-03-01",
      status: "COMPLETED",
    },
    {
      id: 2,
      teacher: { firstname: "Sara", lastname: "Malik" },
      grade_id: 2,
      grade_name: "BS Software Engineering",
      semester_id: 3,
      semester_name: "Fall 2024",
      course: "Web Engineering",
      task_type: "Quiz",
      start_date: "2024-04-05",
      end_date: "2024-04-20",
      status: "PENDING",
    },
  ];

  const [grades] = useState(dummyGrades);
  const [semesters, setSemesters] = useState([]);
  const [assignedTeachers, setAssignedTeachers] = useState([]);

  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");

  const [loading, setLoading] = useState(false);

  // When grade changes → load semesters
  const handleGradeChange = (e) => {
    const gradeId = Number(e.target.value);
    setSelectedGrade(gradeId);
    setSelectedSemester("");
    setSemesters(dummySemesters[gradeId] || []);
  };

  // Filter assignments when semester changes
  useEffect(() => {
    setLoading(true);

    setTimeout(() => {
      let filtered = dummyAssignments;

      if (selectedGrade) {
        filtered = filtered.filter((a) => a.grade_id === selectedGrade);
      }
      if (selectedSemester) {
        filtered = filtered.filter((a) => a.semester_id === Number(selectedSemester));
      }

      setAssignedTeachers(filtered);
      setLoading(false);
    }, 500);

  }, [selectedGrade, selectedSemester]);

  return (
    <div className="p-4">
      <div>

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="pageheading text-xl font-semibold">Assigned Teachers</h2>
          <Link to="/obe/Assign-Teacher/AddAssignTeacher">
          <button className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700">
            + Assign Teacher
          </button>
          </Link>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Program</label>
            <select
              className="w-full p-2 border rounded"
              value={selectedGrade}
              onChange={handleGradeChange}
            >
              <option value="">All Programs</option>
              {grades.map((g) => (
                <option key={g.grade_id} value={g.grade_id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Semester</label>
            <select
              className="w-full p-2 border rounded"
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              disabled={!selectedGrade}
            >
              <option value="">All Semesters</option>
              {semesters.map((s) => (
                <option key={s.semester_id} value={s.semester_id}>
                  {s.semester_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="text-center py-6">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        )}

        {/* Data Table */}
        {!loading && assignedTeachers.length > 0 && (
          <table className="w-full border-collapse border rounded-lg overflow-hidden">
            <thead className="bg-primary-600 text-left">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-large text-gray-50 uppercase tracking-wider">Teacher</th>
                <th className="px-6 py-3 text-left text-xs font-large text-gray-50 uppercase tracking-wider">Program</th> 
                <th className="px-6 py-3 text-left text-xs font-large text-gray-50 uppercase tracking-wider">Semester</th>
                <th className="px-6 py-3 text-left text-xs font-large text-gray-50 uppercase tracking-wider">Course</th>
                <th className="px-6 py-3 text-left text-xs font-large text-gray-50 uppercase tracking-wider">Task Type</th>
                <th className="px-6 py-3 text-left text-xs font-large text-gray-50 uppercase tracking-wider">Start</th>
                <th className="px-6 py-3 text-left text-xs font-large text-gray-50 uppercase tracking-wider">End</th>
                <th className="px-6 py-3 text-left text-xs font-large text-gray-50 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {assignedTeachers.map((a) => (
                <tr key={a.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{a.teacher.firstname} {a.teacher.lastname}</td>
                  <td className="p-3">{a.grade_name}</td>
                  <td className="p-3">{a.semester_name}</td>
                  <td className="p-3">{a.course}</td>
                  <td className="p-3">{a.task_type}</td>
                  <td className="p-3">{a.start_date}</td>
                  <td className="p-3">{a.end_date}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 text-xs rounded 
                      ${a.status === "COMPLETED" ? "bg-green-200 text-green-800" : "bg-yellow-200 text-yellow-800"}`}>
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* No Data */}
        {!loading && assignedTeachers.length === 0 && (
          <div className="text-center py-6 text-gray-600">
            No assigned teachers found.
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignTeacherTable;
