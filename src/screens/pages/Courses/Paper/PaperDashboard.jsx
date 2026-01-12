import React, { useState, useMemo, useEffect } from "react";
import { Eye, Edit, Trash2, Plus, Search, Filter } from "lucide-react";
import SweetAlert from "react-bootstrap-sweetalert";
import { Link } from "react-router-dom";
import { courseService } from "../Services/courses.service"; // adjust path as per your structure
import { batchService } from "../../Academics/Services/batch.Service";

export default function PaperDashboard() {
  const [papers, setPapers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [error, setError] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    filterOpen: false,
    program: "",
    batch: "",
    classYear: "",
    semester: "",
    paperType: "",
    paperMode: "",
  });
  const [programs, setPrograms] = useState([]);
  const [batches, setBatches] = useState([]);
  const [classYears, setClassYears] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [paperTypes, setPaperTypes] = useState([]);
  const [paperModes, setPaperModes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;



  const [alert, setAlert] = useState(null);

  const isFetchedRef = React.useRef(false);

  // ✅ Fetch papers from API
  useEffect(() => {
    if (!isFetchedRef.current) {
      fetchPapers();
      isFetchedRef.current = true;
    }
  }, []);

  const fetchPrograms = () => {
    try {
      const storedPrograms = localStorage.getItem("college_programs");
      if (storedPrograms) {
        const parsedPrograms = JSON.parse(storedPrograms);
        setPrograms(parsedPrograms);
        setError("");
      } else {
        setPrograms([]);
        setError("No programs found. Please set an active college first.");
      }
    } catch (err) {
      console.error("Error reading college_programs from localStorage:", err);
      setError("Failed to load programs from local storage.");
    }
  };


  useEffect(() => {
    fetchPrograms(); // ✅ Load programs from localStorage
    const fetchBatches = async () => {
      try {
        const batchRes = await batchService.getBatch();
        setBatches(batchRes || []);
        const extractedYears = batchRes.flatMap(batch =>
          (batch.academic_years || []).map(ay => ({
            id: ay.academic_year_id,
            year: ay.name,
            classYearId: ay.program_class_year?.class_year?.class_year_id,
            className: ay.program_class_year?.class_year?.class_year_name,
          }))
        );
        setClassYears(extractedYears);
      } catch (err) {
        console.error("Error fetching batches:", err);
      }
    };
    fetchBatches();
  }, []);



  const fetchPapers = async () => {
    try {
      setLoading(true);
      const res = await courseService.getAllCourses();
      if (res) {
        setPapers(res);
      } else {
        setPapers([]);
      }
    } catch (err) {
      console.error("Error fetching papers:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete handler (API call via service) 
  const handleDelete = (id) => {
    setDeleteId(id);
    setShowAlert(true);
  };

  const handleConfirmDelete = async () => {
    console.log("selectedsubject", deleteId);
    try {
      await courseService.deleteCourse(deleteId);
      setPapers((prev) => prev.filter((p) => p.id !== deleteId));
      setShowAlert(false);
      setAlert(
        <SweetAlert
          success
          title="Deleted!"
          onConfirm={() => setAlert(null)}
          confirmBtnCssClass="btn-confirm"
        >
          Subject has been deleted successfully.
        </SweetAlert>
      );
    } catch (error) {
      console.error("Failed to delete subject:", error);
      setShowAlert(false);
    }
  };

  const handleCancelDelete = () => {
    setShowAlert(false);
  };

  const handleProgramChange = (e) => {
    setSelectedProgram(e.target.value);
    setSelectedBatch('');
    setSelectedClass('');
    setSelectedSemester('');
  };

  const handleBatchChange = (e) => {
    setSelectedBatch(e.target.value);
    setSelectedClass('');
    setSelectedSemester('');
  };

  const handleClassChange = (e) => {
    setSelectedClass(e.target.value);
    setSelectedSemester('');
  };

   // 🔍 Search filter
   const filteredPapers = useMemo(() => {
    if (!searchQuery) return papers;
    const q = searchQuery.toLowerCase();
    return papers.filter(
      (p) =>
        (p.verticalNumber || "").toLowerCase().includes(q) ||
        (p.verticalType || "").toLowerCase().includes(q) ||
        (p.name || "").toLowerCase().includes(q) ||
        (p.paper_code || "").toLowerCase().includes(q)
    );
  }, [searchQuery, papers]);

  // Pagination calculations
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredPapers.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalEntries = filteredPapers.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="search"
              placeholder="Search by name, code, or type..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-gray-900 bg-white shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* ✅ Buttons Group (Bulk Upload + Add New Paper) */}
          <div className="flex items-center gap-3">


            <Link to="/courses/add-paper">
              <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md shadow-md transition-all hover:shadow-lg">
                <Plus className="w-4 h-4" />
                Add New Paper
              </button>
            </Link>
            <Link to="/courses/bulk-upload">
              <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md shadow-md transition-all hover:shadow-lg">
                <Plus className="w-4 h-4" />
                Bulk Upload
              </button>
            </Link>
          </div>
        </div>

        {/* Filter Toggle Button */}
        <div className="mb-4">
          <button
            onClick={() => setFilters(prev => ({ ...prev, filterOpen: !prev.filterOpen }))}
            className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 px-4 py-3 rounded-xl shadow-sm transition-all"
          >
            <Filter className="w-5 h-5 text-blue-600" />
            <span className="text-blue-600 font-medium">Filter</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {filters.filterOpen && (
          <div className="bg-white rounded-xl shadow-md p-5 mb-6 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">

              {/* Program */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Program</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  value={filters.program}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      program: e.target.value,
                      batch: "",      // reset dependent filters
                      class: "",
                      semester: "",
                    }))
                  }
                >
                  <option value="">Select Program</option>
                  {programs.map((p) => (
                    <option key={p.program_id} value={p.program_id}>
                      {p.program_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Batch */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Batch</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  value={filters.batch}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      batch: e.target.value,
                      class: "",
                      semester: "",
                    }))
                  }
                  disabled={!filters.program}
                >
                  <option value="">Select Batch</option>
                  {batches.map((b) => (
                    <option key={b.batch_id} value={b.batch_id}>
                      {b.batch_name || b.batch_year}
                    </option>
                  ))}
                </select>
              </div>

              {/* Class Year */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Class Year</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  value={filters.classYear}
                  onChange={(e) => setFilters((prev) => ({ ...prev, classYear: e.target.value }))}
                  disabled={!filters.batch}
                >
                  <option value="">Select Academic Year / Class</option>
                  {console.log("classYears", classYears)}
                  {classYears.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Semester */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Semester</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  value={filters.semester}
                  onChange={(e) => setFilters((prev) => ({ ...prev, semester: e.target.value }))}
                  disabled={!filters.classYear}
                >
                  <option value="">Select Semester</option>
                  {semesters.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Paper Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Paper Type</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  value={filters.paperType}
                  onChange={(e) => setFilters((prev) => ({ ...prev, paperType: e.target.value }))}
                >
                  <option value="">Select Paper Type</option>
                  {paperTypes.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              {/* Paper Mode */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Paper Mode</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  value={filters.paperMode}
                  onChange={(e) => setFilters((prev) => ({ ...prev, paperMode: e.target.value }))}
                >
                  <option value="">Select Paper Mode</option>
                  {paperModes.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

            </div>
          </div>
        )}



        {/* Table */}
        <div className="ld:block bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="text-center py-10 text-gray-500">Loading papers...</div>
          ) : (
            <table className="w-full min-w-[900px]">
              <thead className="table-header">
                <tr>
                  <th className="table-th">Paper Name</th>
                  <th className="table-th">Paper Code</th>
                  <th className="table-th">Paper Type</th>
                  <th className="table-th">Vertical Number</th>
                  <th className="table-th">Paper Mode</th>
                  <th className="table-th">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {console.log("filteredPapers", filteredPapers)}
                {currentEntries.length > 0 ? (
                  currentEntries.map((paper) => (
                    <tr key={paper.subject_id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{paper.name}</td>
                      <td className="px-4 py-3">{paper.paper_code}</td>
                      <td className="px-4 py-3">{paper.types[0]?.name || "-"}</td>
                      <td className="px-4 py-3">{paper.verticals[0]?.name || "-"}</td>
                      <td className="px-4 py-3">
                        {paper?.modes?.length > 0
                          ? paper.modes.map((t) => t.name).join(", ")
                          : "-"}
                      </td>

                      <td className="px-4 py-3 text-center flex justify-center gap-2">
                        {/* <Link to={`/papers/view/${paper.id}`}>
                        <button className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition">
                          <Eye className="w-4 h-4" />
                        </button>
                      </Link> */}
                        <Link to={`/courses/edit-paper/${paper.subject_id}`}>
                          <button className="p-2 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition">
                            <Edit className="w-4 h-4" />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(paper.subject_id)}
                          className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-6 text-gray-500">
                      No papers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
          {/* Pagination */}
        {filteredPapers.length > 0 && (
          <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 text-sm text-gray-600">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-md text-white ${currentPage === 1
                  ? "bg-blue-200 text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
                }`}
            >
              Previous
            </button>

            <span className="text-gray-700 font-medium">
              Showing {indexOfFirstEntry + 1}–
              {Math.min(indexOfLastEntry, totalEntries)} of {totalEntries} entries
            </span>

            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-md text-white ${currentPage === totalPages
                  ? "bg-blue-200 text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
                }`}
            >
              Next
            </button>
          </div>
        )}
        </div>


        {/* Delete Confirmation */}
        {showAlert && (
          <SweetAlert
            warning
            showCancel
            title="Are you sure?"
            onConfirm={handleConfirmDelete}
            onCancel={handleCancelDelete}
            confirmBtnText="OK"
            cancelBtnText="Cancel"
            confirmBtnCssClass="btn-confirm"
            cancelBtnCssClass="btn-cancel"
          >
            Are you want to delete ?
          </SweetAlert>
        )}

      </div>
    </div>
  );
}
