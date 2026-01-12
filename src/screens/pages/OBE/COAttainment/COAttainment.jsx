import React, { useState, useEffect } from "react";
import { collegeService } from "../../Academics/Services/college.service.js";
import { classService } from "../../Academics/Services/class.service.js";
import { MarksEntryService } from "../Services/marks-entry.service.js";

export default function COAttainmentDropdown() {
  const [program, setProgram] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [semester, setSemester] = useState("");
  const [coAttainmentData, setCoAttainmentData] = useState({});
  const [loading, setLoading] = useState(false);

  const [programOptions, setProgramOptions] = useState([]);
  const [classOptions, setClassOptions] = useState([]);
  const [semesterOptions, setSemesterOptions] = useState([]);

  // Fetch Programs
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const res = await collegeService.getAllprogram();
        const formatted = res.map((p) => ({
          label: p.program_name,
          value: p.program_id,
        }));
        setProgramOptions(formatted);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPrograms();
  }, []);

  // Load stored program AFTER programs are fetched
    useEffect(() => {
    const storedProgram = localStorage.getItem("selectedOBEprogram");
  
    if (storedProgram && programOptions.length > 0) {
      setProgram(storedProgram); 
      console.log("Loaded saved program:", storedProgram);
    }
  }, [programOptions]);

  // Fetch Classes when program changes
  useEffect(() => {
    if (!program) {
      setClassOptions([]);
      setSemesterOptions([]);
      setSelectedClass("");
      setSemester("");
      setCoAttainmentData({});
      return;
  }    

    const loadClasses = async () => {
      try {
        const res = await classService.getAllClasses(program);
        const formattedClasses = (res || []).map((c) => ({
          label: c.name,
          value: c.class_year_id,
          full: c,
        }));
        setClassOptions(formattedClasses);
        setSelectedClass("");
        setSemesterOptions([]);
        setSemester("");
      } catch (err) {
        console.error(err);
        setClassOptions([]);
      }
    };
    loadClasses();
  }, [program]);

  // Fetch Semesters when class changes
  useEffect(() => {
    if (!selectedClass) {
      setSemesterOptions([]);
      setSemester("");
      return;
    }

    const classObj = classOptions.find(
      (c) => String(c.value) === String(selectedClass)
    );

    if (
      classObj &&
      Array.isArray(classObj.full?.semesters) &&
      classObj.full.semesters.length > 0
    ) {
      const formattedSemesters = classObj.full.semesters.map((s) => ({
        label: s.name,
        value: s.semester_id,
      }));
      setSemesterOptions(formattedSemesters);
      setSemester("");
    } else {
      setSemesterOptions([]);
      setSemester("");
    }
  }, [selectedClass, classOptions]);

  // Fetch CO Attainment data when semester changes
  useEffect(() => {
    const fetchCOAttainment = async () => {
      if (!semester) {
        setCoAttainmentData({});
        return;
      }
      
      setLoading(true);
      try {
        const data = await MarksEntryService.getCOAttainmentBySemester(semester);
        setCoAttainmentData(data || {});
      } catch (err) {
        console.error('Error fetching CO attainment data:', err);
        setCoAttainmentData({});
      }
      setLoading(false);
    };

    fetchCOAttainment();
  }, [semester]);

  return (
    // <div className="p-6 max-w-6xl mx-auto space-y-6">
    <div className="p-6">
      <h2 className="pageheading text-xl font-semibold">CO Attainment</h2>

      {/* Dropdowns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {/* Program */}
        <div>
          <label className="block mb-1 font-medium">Program</label>
          <select
            className="border p-2 rounded w-full"
            value={program}
            onChange={(e) => setProgram(e.target.value)}
          >
            <option value="">Select Program</option>
            {programOptions.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {/* Class */}
        <div>
          <label className="block mb-1 font-medium">Class</label>
          <select
            className="border p-2 rounded w-full"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            disabled={!program}
          >
            <option value="">Select Class</option>
            {classOptions.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Semester */}
        <div>
          <label className="block mb-1 font-medium">Semester</label>
          <select
            className="border p-2 rounded w-full"
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            disabled={!selectedClass || semesterOptions.length === 0}
          >
            <option value="">Select Semester</option>
            {semesterOptions.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Display CO Attainment Data */}
      {loading && <div className="text-center py-4 text-blue-600">Loading CO attainment data...</div>}

      {Object.keys(coAttainmentData).length > 0 && (
        <div className="space-y-6 mt-6">
          {Object.entries(coAttainmentData).map(([subjectId, subjectData]) => ( 
            <div key={subjectId} className="border rounded-lg shadow p-6 bg-white">
              <h3 className="text-lg font-semibold mb-4"> {subjectData.subject_name} </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-blue-50 p-3 rounded">
                  <span className="text-sm text-gray-600">Internal Tools Avg:</span>
                  <div className="text-lg font-semibold">{subjectData.internal_tools_avg}%</div>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <span className="text-sm text-gray-600">External Tools Avg:</span>
                  <div className="text-lg font-semibold">{subjectData.external_tools_avg}%</div>
                </div>
                <div className="bg-purple-50 p-3 rounded">
                  <span className="text-sm text-gray-600">Final Avg Attainment:</span>
                  <div className="text-lg font-semibold">{subjectData.final_avg_attainment}%</div>
                </div>
              </div>
              
              {subjectData.co_results && subjectData.co_results.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead className="bg-blue-50">
                      <tr>
                        <th className="border border-gray-300 px-4 py-2 text-left">CO Code</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Internal Total</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Tools Used</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Attainment %</th>
                        {/* <th className="border border-gray-300 px-4 py-2 text-left">Status</th> */}
                      </tr>
                    </thead>
                    <tbody>
                      {subjectData.co_results.map((co, index) => {
                        const attainment = parseFloat(co.avg_attainment_with_ext_and_int) || 0;
                        const getStatusColor = (percentage) => {
                          if (percentage >= 70) return 'bg-green-100 text-green-800';
                          if (percentage >= 50) return 'bg-yellow-100 text-yellow-800';
                          return 'bg-red-100 text-red-800';
                        };
                        const getStatusText = (percentage) => {
                          if (percentage >= 70) return 'Achieved';
                          if (percentage >= 50) return 'Partial';
                          return 'Not Achieved';
                        };
                        return (
                          <tr key={co.co_code || index} className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-4 py-2 font-medium">{co.co_code}</td>
                            <td className="border border-gray-300 px-4 py-2">{co.internal_total}</td>
                            <td className="border border-gray-300 px-4 py-2">{co.num_internal_tools_used}</td>
                            <td className="border border-gray-300 px-4 py-2">
                              <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(attainment)}`}>
                                {attainment.toFixed(1)}%
                              </span>
                            </td>
                            {/* <td className="border border-gray-300 px-4 py-2">
                              <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(attainment)}`}>
                                {getStatusText(attainment)}
                              </span>
                            </td> */}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && semester && Object.keys(coAttainmentData).length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No CO attainment data found for this semester.
        </div>
      )}
    </div>
  );
}