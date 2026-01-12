import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const ListSemester = () => {
  const [programs, setPrograms] = useState([]);
  const [selectedGradeId, setSelectedGradeId] = useState("");
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(false);

  // Dummy Programs (Grades)
  const dummyPrograms = [
    { grade_id: "1", name: "Computer Engineering" },
    { grade_id: "2", name: "IT Engineering" },
    { grade_id: "3", name: "Mechanical Engineering" },
  ];

  // Dummy Semesters by Program
  const dummySemesters = {
    "1": [
      { semester_id: "s1", semester_name: "Semester 1" },
      { semester_id: "s2", semester_name: "Semester 2" },
    ],
    "2": [
      { semester_id: "s3", semester_name: "Semester 1" },
    ],
    "3": [],
  };

  useEffect(() => {
    // Load programs
    setPrograms(dummyPrograms);

    // Check localStorage for selected program
    const storedProgram = localStorage.getItem("nba_program");
    if (storedProgram) {
      try {
        let gradeId = "";
        if (storedProgram.startsWith("{")) {
          const parsedProgram = JSON.parse(storedProgram);
          if (parsedProgram && parsedProgram.grade_id) gradeId = parsedProgram.grade_id;
        } else {
          gradeId = storedProgram;
        }
        if (gradeId) handleProgramChange(gradeId);
      } catch (e) {
        console.error("Invalid nba_program in localStorage", e);
      }
    }
  }, []);

  const handleProgramChange = (gradeId) => {
    setSelectedGradeId(gradeId);
    setLoading(true);
    setTimeout(() => {
      setSemesters(dummySemesters[gradeId] || []);
      setLoading(false);
    }, 500);
  };

  return (
    <div className="p-6">
        <div className="flex justify-between items-center mb-6">
                                                <h2 className="text-xl font-semibold">SEMESTER List</h2>
                                                <Link
                                                  to="/obe/settings/Add_SEMESTER"
                                                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
                                                >
                                                  Add SEMESTER
                                                </Link>
                                              </div>

        {/* Program Dropdown */}
        <div className="mb-6 w-64">
          <label className="block mb-1 font-medium">
            Select Program <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full border border-gray-300 rounded p-2"
            value={selectedGradeId}
            onChange={(e) => handleProgramChange(e.target.value)}
          >
            <option value="">Select Program</option>
            {programs.map((program) => (
              <option key={program.grade_id} value={program.grade_id}>
                {program.name}
              </option>
            ))}
          </select>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        ) : semesters.length > 0 ? (
          // Semester Table
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 rounded-lg">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="px-4 py-2 text-left">Sr. No</th>
                  <th className="px-4 py-2 text-left">Semester Name</th>
                  <th className="px-4 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {semesters.map((sem, index) => (
                  <tr key={sem.semester_id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">{index + 1}</td>
                    <td className="px-4 py-2">{sem.semester_name}</td>
                    <td className="px-4 py-2 text-center">
                      <Link
                        to={{
                          pathname: "/add-semester",
                          state: {
                            semester_id: sem.semester_id,
                            grade_id: selectedGradeId,
                            semester_name: sem.semester_name,
                          },
                        }}
                      >
                        <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm">
                          Edit
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : selectedGradeId ? (
          <div className="text-center py-6 text-gray-500">
            No semesters found for this program.
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            Please select a program to view semesters.
          </div>
        )}
      </div>
  );
};

export default ListSemester;
