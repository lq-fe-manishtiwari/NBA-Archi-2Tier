import React, { useState, useEffect } from "react";
import { collegeService } from "../../../Academics/Services/college.service.js";
import { classService } from "../../../Academics/Services/class.service.js";
import { MarksEntryService } from "../../Services/marks-entry.service.js";

// Progress Bar Component
const ProgressBar = ({ value }) => {
  const percent = (value / 3) * 100;
  let color = "bg-red-500";
  if (value >= 2.5) color = "bg-green-500";
  else if (value >= 1.5) color = "bg-yellow-500";

  return (
    <div className="w-full bg-gray-200 rounded h-4">
      <div className={`${color} h-4 rounded`} style={{ width: `${percent}%` }} />
    </div>
  );
};

const Direct = () => {
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [programs, setPrograms] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [directAttainment, setDirectAttainment] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const data = await collegeService.getAllprogram();
      setPrograms(data || []);
    } catch (err) {
      console.error("Failed to fetch programs:", err);
    }
  };

    // Load stored program AFTER programs are fetched
    useEffect(() => {
    const storedProgram = localStorage.getItem("selectedOBEprogram");
  
    if (storedProgram && programs.length > 0) {
      setSelectedGrade(storedProgram); 
      console.log("Loaded saved program:", storedProgram);
    }
  }, [programs]);

  const fetchSemesters = async (programId) => {
    try {
      const res = await classService.getAllClasses(programId);
      const classes = Array.isArray(res) ? res : [res].filter(Boolean);
      const allSemesters = classes.flatMap(c => c.semesters || []);
      setSemesters(allSemesters);
    } catch (err) {
      console.error("Failed to fetch semesters:", err);
      setSemesters([]);
    }
  };

  useEffect(() => {
    if (selectedGrade) {
      fetchSemesters(selectedGrade);
      setSelectedSemester("");
    }
  }, [selectedGrade]);

  useEffect(() => {
    const fetchDirectAttainment = async () => {
      if (!selectedGrade || !selectedSemester) {
        setDirectAttainment([]);
        return;
      }

      setLoading(true);
      try {
        const data = await MarksEntryService.getDirectAttainment(selectedSemester, selectedGrade);
        setDirectAttainment(data || []);
      } catch (err) {
        console.error('Error fetching direct attainment:', err);
        setDirectAttainment([]);
      }
      setLoading(false);
    };

    fetchDirectAttainment();
  }, [selectedGrade, selectedSemester]);

  // Dynamic PO and PSO keys
  const poKeys = Array.from(
    new Set(directAttainment.flatMap((d) => Object.keys(d.po_averages || {})))
  );
  const psoKeys = Array.from(
    new Set(directAttainment.flatMap((d) => Object.keys(d.pso_averages || {})))
  );

  return (
    <div className="p-6">
      <h2 className="pageheading text-xl font-semibold mb-4">Direct Attainment</h2>

      {/* Filters */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
  <div className="w-full">
    <label className="block font-semibold mb-1">Program</label>
    <select
      value={selectedGrade}
      onChange={(e) => setSelectedGrade(e.target.value)}
      className="border rounded px-3 py-2 w-full"
    >
      <option value="">Select Program</option>
      {programs.map((p) => (
        <option key={p.program_id} value={p.program_id}>
          {p.program_name}
        </option>
      ))}
    </select>
  </div>

  <div className="w-full">
    <label className="block font-semibold mb-1">Semester</label>
    <select
      value={selectedSemester}
      onChange={(e) => setSelectedSemester(e.target.value)}
      className="border rounded px-3 py-2 w-full"
      disabled={!selectedGrade}
    >
      <option value="">Select Semester</option>
      {semesters.map((s) => (
        <option key={s.semester_id} value={s.semester_id}>
          {s.name}
        </option>
      ))}
    </select>
  </div>
</div>


      {/* Loading */}
      {loading && <div className="text-center py-4 text-blue-600">Loading direct attainment data...</div>}

      {/* Table */}
      {!loading && directAttainment.length > 0 ? (
        <div className="overflow-auto">
          <table className="table-auto border-collapse border border-gray-300 w-full text-center">
            <thead className="bg-primary-600 text-white">
              <tr>
                <th className="border px-3 py-2">Course Code</th>
                <th className="border px-3 py-2">Course Name</th>
                <th className="border px-3 py-2">CO Attainment Avg</th>
                {poKeys.map((po) => (
                  <th key={po} className="border px-3 py-2">{po}</th>
                ))}
                {psoKeys.map((pso) => (
                  <th key={pso} className="border px-3 py-2">{pso}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {directAttainment.map((row, idx) => (
                <tr key={idx}>
                  <td className="border px-3 py-2">{row.course_code}</td>
                  <td className="border px-3 py-2">{row.course_name}</td>
                  <td className="border px-3 py-2">{row.co_attainment_avg}</td>
                  {poKeys.map((po) => (
                    <td key={po} className="border px-3 py-2">
                      {row.po_averages[po] ? (
                        <div>
                          <ProgressBar value={row.po_averages[po]} />
                          <div className="text-xs">{row.po_averages[po]}</div>
                        </div>
                      ) : (
                        ""
                      )}
                    </td>
                  ))}
                  {psoKeys.map((pso) => (
                    <td key={pso} className="border px-3 py-2">
                      {row.pso_averages[pso] ? (
                        <div>
                          <ProgressBar value={row.pso_averages[pso]} />
                          <div className="text-xs">{row.pso_averages[pso]}</div>
                        </div>
                      ) : (
                        ""
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !loading && selectedGrade && selectedSemester && (
          <p className="mt-4 text-center text-gray-500">No direct attainment data available for selection.</p>
        )
      )}
    </div>
  );
};

export default Direct;
