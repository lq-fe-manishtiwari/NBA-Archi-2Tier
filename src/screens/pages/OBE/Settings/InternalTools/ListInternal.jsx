import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collegeService } from "../../../Academics/Services/college.service";
import { classService } from "../../../Academics/Services/class.service.js";
import { courseService } from "../../../Courses/Services/courses.service.js";
import { InternalService } from "../Services/internal.service.js";
import { Edit, Trash2 } from 'lucide-react';

const ListInternal = () => {
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");

  const [programOptions, setProgramOptions] = useState([]);
  const [classOptions, setClassOptions] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);

  // Internal Tools Rows (editable)
  const [toolRows, setToolRows] = useState([
    { toolName: "" }
  ]);

  const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
  
    // Calculate current page data
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = toolRows.slice(indexOfFirstItem, indexOfLastItem);
  
    // Total pages
    const totalPages = Math.ceil(toolRows.length / itemsPerPage);
  
    // Page handlers
    const handleNext = () => {
      if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
    };
  
    const handlePrev = () => {
      if (currentPage > 1) setCurrentPage(prev => prev - 1);
    };

    useEffect(() => {
  setCurrentPage(1);
}, [selectedCourse]);

  // Fetch Programs
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

  useEffect(() => {
    const storedProgram = localStorage.getItem("selectedOBEprogram");

    if (storedProgram && programOptions.length > 0) {
      setSelectedProgram(storedProgram);
      console.log("Loaded saved program:", storedProgram);
    }
  }, [programOptions]);

  // Fetch Classes
  useEffect(() => {
    const loadClasses = async () => {
      if (!selectedProgram) {
        setClassOptions([]);
        return;
      }
      try {
        const res = await classService.getAllClasses(selectedProgram);
        let formatted = [];
        if (Array.isArray(res)) {
          formatted = res.map(c => ({
            label: c.name,
            value: c.class_year_id,
            full: c,
          }));
        } else if (res && typeof res === "object") {
          formatted = [{ label: res.name, value: res.class_year_id, full: res }];
        }
        setClassOptions(formatted);
      } catch (err) {
        console.error(err);
        setClassOptions([]);
      }
    };
    loadClasses();
  }, [selectedProgram]);

  // Fetch All Courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await courseService.getAllCourses();
        setCourseOptions(res || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      getInternalBySubjectId(selectedCourse);
    } else {
      setToolRows([]);
    }
  }, [selectedCourse]);

  const getInternalBySubjectId = async (subject_id) => {
    try {
      const res = await InternalService.getInternalBySubjectId(subject_id);

      console.log("API Internal Response:", res);

      if (Array.isArray(res)) {
        setToolRows(
          res.map(item => ({
            toolName: item.name,
            nba_internal_config_id : item.nba_internal_config_id,
            program_id: item.program_id,
            class_year_id: item.class_year_id,
            subject_id: item.subject_id
          }))
        );

      }
    } catch (err) {
      console.error("Error fetching Internal tools:", err);
    }
  };

  return (
    <div className="p-6">

      <div className="flex justify-between items-center mb-6">
        <h2 className="pageheading text-xl font-semibold">Internal Tools Configuration</h2>
        <Link
          to="/obe/settings/Add_Internal_TOOLS"
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded text-sm"
        >
          Add Internal Tools
        </Link>
      </div>

      {/* Dropdowns: Program → Class → Semester → Course */}
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
            {programOptions.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
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
            disabled={!selectedProgram}
          >
            <option value="">Select Class</option>
            {classOptions.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Course */}
        <div>
          <label className="block mb-1 font-medium">Course</label>
          <select
            className="border p-2 rounded w-full"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            disabled={!selectedClass}
          >
            <option value="">Select Course</option>
            {courseOptions.map(c => (
              <option key={c.subject_id} value={c.subject_id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* Internal Tools Table */}
      {toolRows && toolRows.length > 0 && (
        <div>

          <table className="w-full border">
            <thead className="bg-primary-600 text-white">
              <tr>
                <th className="p-2 border">Sr. No</th>
                <th className="p-2 border">Tool Name</th>
                {/* <th className="p-2 border">Action</th> */}
              </tr>
            </thead>
            <tbody>
              {currentItems.map((row, index) => (
                <tr key={index} className="border">
                  <td className="p-2 border text-center">{indexOfFirstItem + index + 1}</td>

                  {/* 🔵 SHOW TEXT ONLY (NO INPUT) */}
                  <td className="p-2 border text-center">
                    {row.toolName || "—"}
                  </td>

                  {/* <td className="p-2 border text-center">
                    <Link
                      to="/obe/settings/Add_Internal_TOOLS"
                      state={{
                        program_id: selectedProgram,
                        class_year_id: selectedClass,
                        subject_id: selectedCourse,
                        name: row.toolName,
                        nba_internal_config_id: row.nba_internal_config_id,
                      }}
                    >
                      <button className="p-2 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition"
                        onClick={() => {
                          console.log("Clicked Edit for ID:", row.nba_internal_config_id);
                        }}>
                        <Edit className="w-4 h-4" />
                      </button>
                    </Link>
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 text-sm text-gray-600">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-md text-white ${
                currentPage === 1 
                  ? 'bg-blue-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              Previous
            </button>

            <span className="text-gray-700 font-medium">
              Showing {indexOfFirstItem + 1}–{Math.min(indexOfLastItem, toolRows.length)} of {toolRows.length} entries
            </span>

            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-md text-white ${
                currentPage === totalPages 
                  ? 'bg-blue-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              Next
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

export default ListInternal;