import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collegeService } from "../../../Academics/Services/college.service";
import { classService } from "../../../Academics/Services/class.service.js";
import { courseService } from "../../../Courses/Services/courses.service";
import { BloomService } from "../Services/bloom.service.js";

const ListBloomsLevel = () => {
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");

  const [programOptions, setProgramOptions] = useState([]);
  const [classOptions, setClassOptions] = useState([]);
  const [semesterOptions, setSemesterOptions] = useState([]);
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Table rows for Bloom Levels
  const [bloomRows, setBloomRows] = useState([]);

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

  useEffect(() => {
    const storedProgram = localStorage.getItem("selectedOBEprogram");

    if (storedProgram && programOptions.length > 0) {
      setSelectedProgram(storedProgram);
      console.log("Loaded saved program:", storedProgram);
    }
  }, [programOptions]);

  // Fetch Classes when program changes
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
          formattedClasses = res.map((c) => ({
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

  // Fetch Semesters when class changes
  useEffect(() => {
    if (!selectedClass) {
      setSemesterOptions([]);
      setSelectedSemester("");
      return;
    }

    const classObj = classOptions.find((c) => String(c.value) === String(selectedClass));

    if (classObj && classObj.full?.semesters) {
      const formattedSemesters = classObj.full.semesters.map((s) => ({
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

  // Fetch all courses (subjects/papers)
  useEffect(() => {
    const fetchPapers = async () => {
      try {
        setLoading(true);
        const res = await courseService.getAllCourses();
        setPapers(res || []);
      } catch (err) {
        console.error(err);
        setPapers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPapers();
  }, []);

  // Fetch mapped blooms when course changes
  useEffect(() => {
    const fetchMappedBlooms = async () => {
      if (!selectedCourse) {
        setBloomRows([]);
        return;
      }
      try {
        setLoading(true);
        const res = await BloomService.getMappedDataOfBlooms(selectedCourse);
        // Expected response: [{id, blooms_level, blooms_level_no}]
        const formattedRows = res.map((b) => ({
          bloomCode: b.blooms_level_no,
          bloomStatement: b.blooms_level,
          id: b.id,
        }));
        setBloomRows(formattedRows);
      } catch (err) {
        console.error(err);
        setBloomRows([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMappedBlooms();
  }, [selectedCourse]);

  // Table handlers
  const handleAddRow = () => {
    setBloomRows([...bloomRows, { bloomCode: "", bloomStatement: "" }]);
  };

  const handleRemoveRow = (index) => {
    if (bloomRows.length > 1) {
      const newRows = bloomRows.filter((_, i) => i !== index);
      setBloomRows(newRows);
    }
  };

  const handleRowChange = (index, field, value) => {
    const updated = [...bloomRows];
    updated[index][field] = value;
    setBloomRows(updated);
  };

  const handleSave = () => {
    console.log("Saving Bloom Levels:", {
      program: selectedProgram,
      class: selectedClass,
      semester: selectedSemester,
      course: selectedCourse,
      blooms: bloomRows,
    });
    alert("Bloom Levels Saved (Dummy)");
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="pageheading text-xl font-semibold">
          Blooms Level List
        </h2>
        <Link
          to="/obe/settings/Add_BLOOM_LEVEL"
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded text-sm"
        >
          Add Bloom Level
        </Link>
      </div>

      {/* Dropdowns */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {/* Program */}
        {/* <div>
          <label className="block mb-1 font-medium">Program</label>
          <select
            className="border p-2 rounded w-full"
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
          >
            <option value="">Select Program</option>
            {programOptions.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div> */}

        {/* Class */}
        {/* <div>
          <label className="block mb-1 font-medium">Class</label>
          <select
            className="border p-2 rounded w-full"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            disabled={!selectedProgram}
          >
            <option value="">Select Class</option>
            {classOptions.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div> */}

        {/* Semester */}
        {/* <div>
          <label className="block mb-1 font-medium">Semester</label>
          <select
            className="border p-2 rounded w-full"
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            disabled={!selectedClass}
          >
            <option value="">Select Semester</option>
            {semesterOptions.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div> */}

        {/* Course */}
        <div>
          <label className="block mb-1 font-medium">Course</label>
          <select
            className="border p-2 rounded w-full"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          // disabled={!selectedSemester}
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

      {/* Bloom Levels Table */}
      {selectedCourse && (
        <div>

          <table className="w-full border">
            <thead className="bg-primary-600 text-white">
              <tr>
                <th className="p-2 border">Bloom Code</th>
                <th className="p-2 border">Bloom Statement</th>
                {/* <th className="p-2 border">Action</th> */}
              </tr>
            </thead>
            <tbody>
              {bloomRows.map((row, index) => (
                <tr key={index} className="border">
                  <td className="p-2 border text-center">{row.bloomCode}</td>
                  <td className="p-2 border">{row.bloomStatement}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ListBloomsLevel;
