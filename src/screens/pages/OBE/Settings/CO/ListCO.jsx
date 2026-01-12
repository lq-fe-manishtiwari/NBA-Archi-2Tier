import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collegeService } from "../../../Academics/Services/college.service";
import { classService } from '../../../Academics/Services/class.service.js'
import { courseService } from "../../../Courses/Services/courses.service.js";
import { COService } from "../Services/co.service.js";
import { Edit, Trash2 } from 'lucide-react';

const ListCO = () => {
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");

  const [programOptions, setProgramOptions] = useState([]);
  const [classOptions, setClassOptions] = useState([]);
  const [semesterOptions, setSemesterOptions] = useState([]);
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [coRows, setCoRows] = useState([]);

  const filteredRows = coRows.filter(row => {
    if (selectedSemester && row.semester_id !== parseInt(selectedSemester)) return false;
    if (selectedCourse && row.subject_id !== parseInt(selectedCourse)) return false;
    return true;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate current page data
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRows.slice(indexOfFirstItem, indexOfLastItem);

  // Total pages
  const totalPages = Math.ceil(filteredRows.length / itemsPerPage);

  // Page handlers
  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  useEffect(() => {
  setCurrentPage(1);
}, [selectedProgram, selectedClass, selectedSemester, selectedCourse]);

  useEffect(() => {
    const loadCOs = async () => {
      try {
        const res = await COService.getAllCO();
        const formatted = res.map(item => ({
          co_id: item.co_id,
          co_code: item.co_code,
          co_statement: item.co_statement,
          semester_id: item.semester?.semester_id,
          semester_name: item.semester?.name,
          subject_id: item.subject?.subject_id,
          subject_name: item.subject?.name,
        }));
        setCoRows(formatted);
      } catch (err) {
        console.error("Error loading COs", err);
      }
    };
    loadCOs();
  }, []);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const res = await collegeService.getAllprogram();
        const formatted = res.map(p => ({
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
      setSelectedProgram(storedProgram);
      console.log("Loaded saved program:", storedProgram);
    }
  }, [programOptions]);

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
      }
    };
    loadClasses();
  }, [selectedProgram]);

  useEffect(() => {
    if (!selectedClass) {
      setSemesterOptions([]);
      setSelectedSemester("");
      return;
    }
    const classObj = classOptions.find(c => String(c.value) === String(selectedClass));
    if (classObj && classObj.full?.semesters) {
      const formattedSemesters = classObj.full.semesters.map(s => ({
        label: s.name,
        value: s.semester_id,
      }));
      setSemesterOptions(formattedSemesters);
      setSelectedSemester("");
    } else {
      setSemesterOptions([]);
      setSelectedSemester("");
    }
  }, [selectedClass, classOptions]);

  useEffect(() => {
    if (!selectedSemester) {
      setPapers([]);
      return;
    }

    // Get unique courses from CO data that match selected semester
    const uniqueCourses = coRows
      .filter(co => co.semester_id === parseInt(selectedSemester))
      .reduce((acc, co) => {
        if (co.subject_id && !acc.find(c => c.subject_id === co.subject_id)) {
          acc.push({
            subject_id: co.subject_id,
            name: co.subject_name
          });
        }
        return acc;
      }, []);

    setPapers(uniqueCourses);
  }, [selectedSemester, coRows]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="pageheading text-xl font-semibold">CO List</h2>
        <Link
          to="/obe/settings/Add_CO"
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded text-sm"
        >
          Add CO
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
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

        <div>
          <label className="block mb-1 font-medium">Course</label>
          <select
            className="border p-2 rounded w-full"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
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

      <table className="w-full border">
        <thead className="bg-primary-600 text-white">
          <tr>
            <th className="p-3 border">CO Code</th>
            <th className="p-3 border">CO Statement</th>
            <th className="p-3 border">Action</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((row, index) => (
            <tr key={index} className="border hover:bg-gray-50">
              <td className="p-3 border text-center font-medium">
                {row.co_code}
              </td>
              <td className="p-3 border">
                {row.co_statement}
              </td>
              <td className="p-3 border text-center">
                <div className="flex items-center justify-center gap-2">
                  <Link
                    to="/obe/settings/Edit_CO"
                    state={{
                      isEdit: true,
                      poData: row
                    }}
                  >
                    <button className="p-2 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition">
                      <Edit className="w-4 h-4" />
                    </button>
                  </Link>
                  {/* <button 
                    className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button> */}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex items-center justify-between mt-4 w-full">
        {/* LEFT - Previous */}
        <button
          onClick={handlePrev}
          disabled={currentPage === 1}
          className={`px-4 py-2 bg-primary-600 text-white rounded disabled:bg-gray-300`}
        >
          Previous
        </button>
        {/* CENTER - Entries info */}
        <div className="text-gray-600 text-sm">
          Showing {indexOfFirstItem + 1}–
          {Math.min(indexOfLastItem, filteredRows.length)} of {filteredRows.length} entries
        </div>
        {/* RIGHT - Next */}
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 bg-primary-600 text-white rounded disabled:bg-gray-300`}
        >
          Next
        </button>
      </div>

    </div>
  );
};

export default ListCO;