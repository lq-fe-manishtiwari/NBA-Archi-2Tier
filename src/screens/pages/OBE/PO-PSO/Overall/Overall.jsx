import React, { useState, useEffect } from "react";
import { collegeService } from "../../../Academics/Services/college.service.js";
import { AcademicService } from "../../../Academics/Services/Academic.service.js";
import { AttainmentConfigService } from "../../Services/attainment-config.service.js";

const Overall = () => {
  const [programs, setPrograms] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [attainmentData, setAttainmentData] = useState(null);
  const [loading, setLoading] = useState(false);

  const [values, setValues] = useState({
    program_id: "",
    academic_year_id: "",
  });

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

    // Load stored program AFTER programs are fetched
    useEffect(() => {
    const storedProgram = localStorage.getItem("selectedOBEprogram");
  
    if (storedProgram && programs.length > 0) {
      setValues((prev) => ({ ...prev, program_id: storedProgram }));
      console.log("Loaded saved program:", storedProgram);
    }
  }, [programs]);

  const fetchAcademicYears = async () => {
    try {
      const response = await AcademicService.getAcademic();
      setAcademicYears(response || []);
    } catch (err) {
      console.error("Failed to fetch academic years:", err);
    }
  };

  useEffect(() => {
    const fetchAttainmentData = async () => {
      if (values.program_id && values.academic_year_id) {
        setLoading(true);
        try {
          const response = await AttainmentConfigService.getOverallAttainment(values.program_id, values.academic_year_id);
          setAttainmentData(response || null);
        } catch (err) {
          console.error("Failed to fetch attainment data:", err);
          setAttainmentData(null);
        } finally {
          setLoading(false);
        }
      } else {
        setAttainmentData(null);
      }
    };

    fetchAttainmentData();
  }, [values.program_id, values.academic_year_id]);

  return (
    <div className="p-6">
      <h2 className="pageheading text-xl font-semibold mb-4">Overall Attainment</h2>

      {/* Filters */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
  {/* Program */}
  <div className="w-full">
    <label className="block font-semibold mb-1">Program</label>
    <select
      value={values.program_id}
      onChange={(e) => setValues({ program_id: e.target.value, academic_year_id: "" })}
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

  {/* Academic Year */}
  <div className="w-full">
    <label className="block font-semibold mb-1">Academic Year</label>
    <select
      value={values.academic_year_id}
      onChange={(e) => setValues((prev) => ({ ...prev, academic_year_id: e.target.value }))}
      className="border rounded px-3 py-2 w-full"
    >
      <option value="">Select Academic Year</option>
      {academicYears.map((ay) => (
        <option key={ay.id} value={ay.id}>
          {ay.year}
        </option>
      ))}
    </select>
  </div>
</div>


      {/* Table */}
      {loading ? (
        <div className="text-center p-4">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p>Loading data...</p>
        </div>
      ) : attainmentData ? (
        <div className="overflow-auto">
          <table className="table-auto border-collapse border border-gray-300 w-full text-center">
            <thead className="bg-primary-600 text-white">
              <tr>
                <th className="border px-3 py-2">Attainment</th>
                {Object.keys(attainmentData.overall_attainments).map((key) => (
                  <th key={key} className="border px-3 py-2">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border px-3 py-2">Direct Attainments</td>
                {Object.values(attainmentData.direct_attainments).map((val, i) => (
                  <td key={`direct-${i}`} className="border px-3 py-2">
                    {val.toFixed(2)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border px-3 py-2">Indirect Attainments</td>
                {Object.values(attainmentData.indirect_attainments).map((val, i) => (
                  <td key={`indirect-${i}`} className="border px-3 py-2">
                    {val.toFixed(2)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border px-3 py-2">Overall Attainments</td>
                {Object.values(attainmentData.overall_attainments).map((val, i) => (
                  <td key={`overall-${i}`} className="border px-3 py-2">
                    {val.toFixed(2)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center p-4">
          {values.academic_year_id
            ? "No Data Found"
            : "Please select program and academic year to view data"}
        </div>
      )}
    </div>
  );
};

export default Overall;
