'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Trash2, Edit, Upload, Filter, X, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SweetAlert from "react-bootstrap-sweetalert"; 
import { courseService } from "../Services/courses.service";

export default function ModuleDashboard() {
  const [modules, setModules] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [alert, setAlert] = useState(null); 
  const navigate = useNavigate();

  // New states for table functionality
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter State
  const [filters, setFilters] = useState({
    program: [],
    class: [],
    semester: [],
    subject: [],
    filterOpen: false
  });

  // Pagination
  const entriesPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = async () => {
    try {
      setLoading(true);
      const res = await courseService.getAllModules();
      setModules(res || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching modules:', error);
      setError('Failed to load modules. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter options derived from data
  const programOptions = [...new Set(modules.map(m => m.program?.program_name).filter(Boolean))];
  const classOptions = [...new Set(modules.map(m => m.class_year?.name).filter(Boolean))];
  const semesterOptions = [...new Set(modules.map(m => m.subject?.semester?.name).filter(Boolean))];
  const subjectOptions = [...new Set(modules.map(m => m.subject?.name).filter(Boolean))];

  // Filtered + Paginated Data
  const paginatedData = useMemo(() => {
    let list = modules;

    // Search
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(item => {
        const program = item.program?.program_name || '';
        const classYear = item.class_year?.name || '';
        const semester = item.subject?.semester?.name || '';
        const subject = item.subject?.name || '';
        const moduleName = item.name || '';

        return (
          program.toLowerCase().includes(q) ||
          classYear.toLowerCase().includes(q) ||
          semester.toLowerCase().includes(q) ||
          subject.toLowerCase().includes(q) ||
          moduleName.toLowerCase().includes(q)
        );
      });
    }

    // Program filter
    if (filters.program.length) {
      list = list.filter(m => filters.program.includes(m.program?.program_name));
    }

    // Class filter
    if (filters.class.length) {
      list = list.filter(m => filters.class.includes(m.class_year?.name));
    }

    // Semester filter
    if (filters.semester.length) {
      list = list.filter(m => filters.semester.includes(m.subject?.semester?.name));
    }

    // Subject filter
    if (filters.subject.length) {
      list = list.filter(m => filters.subject.includes(m.subject?.name));
    }

    // Reverse to show latest first
    list = list.reverse();

    // Pagination
    const totalEntries = list.length;
    const totalPages = Math.ceil(totalEntries / entriesPerPage);
    const start = (currentPage - 1) * entriesPerPage;
    const end = start + entriesPerPage;
    const currentEntries = list.slice(start, end);

    return { currentEntries, totalEntries, totalPages, start, end };
  }, [modules, searchTerm, filters, currentPage]);

  const { currentEntries, totalEntries, totalPages } = paginatedData;

  // Pagination handlers
  const handlePrev = () => currentPage > 1 && setCurrentPage(p => p - 1);
  const handleNext = () => currentPage < totalPages && setCurrentPage(p => p + 1);
  const resetPage = () => setCurrentPage(1);

  // Filter handlers
  const handleFilterChange = (filterType, value) => {
    if (value && !filters[filterType].includes(value)) {
      setFilters(prev => ({
        ...prev,
        [filterType]: [...prev[filterType], value]
      }));
    }
    resetPage();
  };

  const removeFilter = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].filter(item => item !== value)
    }));
    resetPage();
  };

  const clearAllFilters = () => {
    setFilters({
      program: [],
      class: [],
      semester: [],
      subject: [],
      filterOpen: false
    });
    resetPage();
  };

  // Delete functionality
  const handleDeleteConfirm = (id) => {
    setAlert(
      <SweetAlert
        warning
        showCancel
        confirmBtnText="Yes, delete it!"
        confirmBtnCssClass="btn-confirm"
        cancelBtnCssClass="btn-cancel"
        title="Are you sure?"
        onConfirm={() => confirmDelete(id)}
        onCancel={() => setAlert(null)}
        focusCancelBtn
      >
        You will not be able to recover this record!
      </SweetAlert>
    );
  };

  const confirmDelete = async (id) => {
    try {
      await courseService.softDeleteModule(id);
      setAlert(
        <SweetAlert
          success
          title="Deleted!"
          onConfirm={() => setAlert(null)}
        >
          Module deleted successfully.
        </SweetAlert>
      );
      loadModules();
    } catch (error) {
      console.error('Error deleting module:', error);
      setAlert(
        <SweetAlert
          danger
          title="Error!"
          onConfirm={() => setAlert(null)}
        >
          Failed to delete module.
        </SweetAlert>
      );
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-red-600 text-center">
          <p className="text-lg font-semibold">{error}</p>
          <button
            onClick={loadModules}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen font-sans">
      {alert}
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 mb-6">
        {/* Search */}
        <div className="relative w-full lg:w-80">
          <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by program, class, semester, paper, or module..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              resetPage();
            }}
            className="w-full pl-9 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white shadow-sm"
          />
        </div>

        {/* Filter Toggle + Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Filter Toggle */}
          <button
            onClick={() => setFilters(prev => ({ ...prev, filterOpen: !prev.filterOpen }))}
            className="flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 px-4 py-3 rounded-lg shadow-sm transition-all"
          >
            <Filter className="w-5 h-5 text-blue-600" />
            <span className="text-blue-600 font-medium">Filter</span>
          </button>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/courses/module/add-module')}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg shadow-md transition duration-200"
            >
              <Plus className="w-5 h-5" />
              Add New Module
            </button>

            <button
              onClick={() => navigate('/courses/module/bulk-upload')}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg shadow-md transition duration-200"
            >
              <Upload className="w-5 h-5" />
              Bulk Upload
            </button>
          </div>
        </div>
      </div>

      {/* FILTER PANEL */}
      {filters.filterOpen && (
        <div className="bg-white rounded-xl shadow-md p-5 mb-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            {/* Program Filter with Chips */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Program</label>
              <div className="relative">
                <div className="flex flex-wrap items-center gap-1 p-2 border border-gray-300 rounded-lg min-h-[40px] bg-white">
                  {filters.program.map(program => (
                    <span
                      key={program}
                      className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs"
                    >
                      {program}
                      <button
                        onClick={() => removeFilter('program', program)}
                        className="hover:bg-blue-200 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <select
                    className="flex-1 bg-transparent outline-none text-sm min-w-[120px] appearance-none"
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        handleFilterChange('program', e.target.value);
                        e.target.value = ''; // Reset select after selection
                      }
                    }}
                  >
                    <option value="" disabled hidden={filters.program.length > 0}>
                      {filters.program.length > 0 ? "Add more..." : "Select Program"}
                    </option>
                    {programOptions.map(program => (
                      <option 
                        key={program} 
                        value={program}
                        disabled={filters.program.includes(program)}
                      >
                        {program}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Class Filter with Chips */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Class</label>
              <div className="relative">
                <div className="flex flex-wrap items-center gap-1 p-2 border border-gray-300 rounded-lg min-h-[40px] bg-white">
                  {filters.class.map(cls => (
                    <span
                      key={cls}
                      className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs"
                    >
                      {cls}
                      <button
                        onClick={() => removeFilter('class', cls)}
                        className="hover:bg-green-200 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <select
                    className="flex-1 bg-transparent outline-none text-sm min-w-[120px] appearance-none"
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        handleFilterChange('class', e.target.value);
                        e.target.value = ''; // Reset select after selection
                      }
                    }}
                  >
                    <option value="" disabled hidden={filters.class.length > 0}>
                      {filters.class.length > 0 ? "Add more..." : "Select Class"}
                    </option>
                    {classOptions.map(cls => (
                      <option 
                        key={cls} 
                        value={cls}
                        disabled={filters.class.includes(cls)}
                      >
                        {cls}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Semester Filter with Chips */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Semester</label>
              <div className="relative">
                <div className="flex flex-wrap items-center gap-1 p-2 border border-gray-300 rounded-lg min-h-[40px] bg-white">
                  {filters.semester.map(semester => (
                    <span
                      key={semester}
                      className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs"
                    >
                      {semester}
                      <button
                        onClick={() => removeFilter('semester', semester)}
                        className="hover:bg-purple-200 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <select
                    className="flex-1 bg-transparent outline-none text-sm min-w-[120px] appearance-none"
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        handleFilterChange('semester', e.target.value);
                        e.target.value = ''; // Reset select after selection
                      }
                    }}
                  >
                    <option value="" disabled hidden={filters.semester.length > 0}>
                      {filters.semester.length > 0 ? "Add more..." : "Select Semester"}
                    </option>
                    {semesterOptions.map(semester => (
                      <option 
                        key={semester} 
                        value={semester}
                        disabled={filters.semester.includes(semester)}
                      >
                        {semester}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Subject Filter with Chips */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Paper</label>
              <div className="relative">
                <div className="flex flex-wrap items-center gap-1 p-2 border border-gray-300 rounded-lg min-h-[40px] bg-white">
                  {filters.subject.map(subject => (
                    <span
                      key={subject}
                      className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs"
                    >
                      {subject}
                      <button
                        onClick={() => removeFilter('subject', subject)}
                        className="hover:bg-orange-200 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <select
                    className="flex-1 bg-transparent outline-none text-sm min-w-[120px] appearance-none"
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        handleFilterChange('subject', e.target.value);
                        e.target.value = ''; // Reset select after selection
                      }
                    }}
                  >
                    <option value="" disabled hidden={filters.subject.length > 0}>
                      {filters.subject.length > 0 ? "Add more..." : "Select Paper"}
                    </option>
                    {subjectOptions.map(subject => (
                      <option 
                        key={subject} 
                        value={subject}
                        disabled={filters.subject.includes(subject)}
                      >
                        {subject}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rest of the component remains the same */}
      {/* Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-6 py-4 font-semibold text-left">Program</th>
                <th className="px-6 py-4 font-semibold text-left">Class</th>
                <th className="px-6 py-4 font-semibold text-left">Semester</th>
                <th className="px-6 py-4 font-semibold text-left">Paper</th>
                <th className="px-6 py-4 font-semibold text-left">Module</th>
                <th className="px-6 py-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentEntries.map((item) => (
                <tr
                  key={item.module_id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 text-gray-900">{item.program?.program_name || '-'}</td>
                  <td className="px-6 py-4 text-gray-900">{item.class_year?.name || '-'}</td>
                  <td className="px-6 py-4 text-gray-900">{item.subject?.semester?.name || '-'}</td>
                  <td className="px-6 py-4 text-gray-900">{item.subject?.name || '-'}</td>
                  <td className="px-6 py-4 text-gray-900">{item.name || '-'}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => navigate(`/courses/module/module-edit/${item.module_id}`)}
                        className="p-2 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition"
                        title="Edit" 
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteConfirm(item.module_id)}
                        className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalEntries > 0 && (
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
              Showing {paginatedData.start + 1}–{Math.min(paginatedData.end, totalEntries)} of {totalEntries} entries
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
        )}
      </div>

      {/* Empty State */}
      {totalEntries === 0 && !loading && (
        <div className="text-center py-12 bg-white rounded-xl shadow-md border border-gray-200">
          <div className="bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <Search className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-gray-600">No modules found matching your filters.</p>
          {(searchTerm || filters.program.length > 0 || filters.class.length > 0 || filters.semester.length > 0 || filters.subject.length > 0) && (
            <button
              onClick={() => {
                setSearchTerm('');
                clearAllFilters();
              }}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}