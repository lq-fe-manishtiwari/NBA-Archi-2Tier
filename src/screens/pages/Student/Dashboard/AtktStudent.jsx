'use client';

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, Mail, Phone, ToggleLeft, ToggleRight, Eye, Edit, Trash2,
  Filter, X, ChevronDown 
} from 'lucide-react';
import SweetAlert from 'react-bootstrap-sweetalert';

export default function AtktStudent() {
  const [students, setStudents] = useState([ 
    {
      id: 1, 
      name: 'Aarav Kumar',
      email: 'aarav@school.com',
      mobile: '+91 98765 43210',
      gender: 'MALE',
      grade: 'Grade 8',
      division: 'A',
      className: 'Class 8A',
      active: true,
    },
    {
      id: 2,
      name: 'Diya Sharma',
      email: 'diya@school.com',
      mobile: '+91 91234 56789',
      gender: 'FEMALE',
      grade: 'Grade 9',
      division: 'B',
      className: 'Class 9B',
      active: true,
    },
    {
      id: 3,
      name: 'Rohan Verma',
      email: 'rohan@school.com',
      mobile: '+91 99887 76655',
      gender: 'MALE',
      grade: 'Grade 7',
      division: 'C',
      className: 'Class 7C',
      active: false,
    },
    {
      id: 4,
      name: 'Sneha Patel',
      email: 'sneha@school.com',
      mobile: '+91 87654 32109',
      gender: 'FEMALE',
      grade: 'Grade 10',
      division: 'A',
      className: 'Class 10A',
      active: true,
    },
    {
      id: 5,
      name: 'Vikram Singh',
      email: 'vikram@school.com',
      mobile: '+91 76543 21098',
      gender: 'MALE',
      grade: 'Grade 8',
      division: 'B',
      className: 'Class 8B',
      active: false,
    },
    {
      id: 6,
      name: 'Neha Gupta',
      email: 'neha@school.com',
      mobile: '+91 65432 10987',
      gender: 'FEMALE',
      grade: 'Grade 9',
      division: 'B',
      className: 'Class 9B',
      active: true,
    },
    {
      id: 7,
      name: 'Rajesh Kumar',
      email: 'rajesh@school.com',
      mobile: '+91 54321 09876',
      gender: 'MALE',
      grade: 'Grade 7',
      division: 'A',
      className: 'Class 7A',
      active: true,
    },
    {
      id: 8,
      name: 'Anjali Desai',
      email: 'anjali@school.com',
      mobile: '+91 43210 98765',
      gender: 'FEMALE',
      grade: 'Grade 10',
      division: 'A',
      className: 'Class 10A',
      active: false,
    },
    {
      id: 9,
      name: 'Karan Malhotra',
      email: 'karan@school.com',
      mobile: '+91 32109 87654',
      gender: 'MALE',
      grade: 'Grade 8',
      division: 'A',
      className: 'Class 8A',
      active: true,
    },
    {
      id: 10,
      name: 'Pooja Reddy',
      email: 'pooja@school.com',
      mobile: '+91 21098 76543',
      gender: 'FEMALE',
      grade: 'Grade 9',
      division: 'B',
      className: 'Class 9B',
      active: true,
    },
    {
      id: 11,
      name: 'Suresh Yadav',
      email: 'suresh@school.com',
      mobile: '+91 10987 65432',
      gender: 'MALE',
      grade: 'Grade 7',
      division: 'C',
      className: 'Class 7C',
      active: false,
    },
    {
      id: 12,
      name: 'Meera Joshi',
      email: 'meera@school.com',
      mobile: '+91 98765 43210',
      gender: 'FEMALE',
      grade: 'Grade 8',
      division: 'A',
      className: 'Class 8A',
      active: true,
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  // Filter State
  const [filters, setFilters] = useState({
    program: [],
    classDataId: [],
    gradeDivisionId: [],
    activeInactiveStatus: 'all',
    filterOpen: false
  });

  // Pagination
  const entriesPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // Filter Options
  const programOptions = ['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'];
  const classOptions = ['Class 7A', 'Class 7C', 'Class 8A', 'Class 8B', 'Class 9B', 'Class 10A'];
  const divisionOptions = ['A', 'B', 'C'];

  // === FILTERED + PAGINATED DATA ===
  const paginatedData = useMemo(() => {
    let list = students;

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      list = list.filter(t =>
        t.name.toLowerCase().includes(query) ||
        t.email.toLowerCase().includes(query) ||
        t.mobile.includes(query)
      );
    }

    // Program (multi)
    if (filters.program.length > 0) {
      list = list.filter(t => filters.program.includes(t.grade));
    }

    // Class (single)
    if (filters.classDataId.length > 0) {
      list = list.filter(t => filters.classDataId.includes(t.className));
    }

    // Division (single)
    if (filters.gradeDivisionId.length > 0) {
      list = list.filter(t => filters.gradeDivisionId.includes(t.division));
    }

    // Status
    if (filters.activeInactiveStatus !== 'all') {
      const isActive = filters.activeInactiveStatus === 'active';
      list = list.filter(t => t.active === isActive);
    }

    // === Pagination ===
    const totalEntries = list.length;
    const totalPages = Math.ceil(totalEntries / entriesPerPage);
    const indexOfLast = currentPage * entriesPerPage;
    const indexOfFirst = indexOfLast - entriesPerPage;
    const currentEntries = list.slice(indexOfFirst, indexOfLast);

    return { currentEntries, totalEntries, totalPages, indexOfFirst, indexOfLast };
  }, [students, searchQuery, filters, currentPage]);

  const { currentEntries, totalEntries, totalPages, indexOfFirst, indexOfLast } = paginatedData;

  const handlePrev = () => currentPage > 1 && setCurrentPage(p => p - 1);
  const handleNext = () => currentPage < totalPages && setCurrentPage(p => p + 1);

  const resetPage = () => setCurrentPage(1);

  // === CRUD ===
  const toggleActive = (id) => {
    setStudents(prev => prev.map(t => t.id === id ? { ...t, active: !t.active } : t));
  };

  const handleDelete = (student) => {
    setStudentToDelete(student);
    setShowDeleteAlert(true);
  };

  const confirmDelete = () => {
    if (studentToDelete) {
      setStudents(prev => prev.filter(t => t.id !== studentToDelete.id));
      setShowDeleteAlert(false);
      setStudentToDelete(null);
      resetPage();
    }
  };

  // Program Chip Handlers
  const handleProgramChange = (e) => {
    const value = e.target.value;
    if (value && !filters.program.includes(value)) {
      setFilters(prev => ({ ...prev, program: [...prev.program, value] }));
    }
    e.target.value = '';
    resetPage();
  };

  const removeProgram = (prog) => {
    setFilters(prev => ({ ...prev, program: prev.program.filter(p => p !== prog) }));
    resetPage();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">

       {/* Search + Filter Row */}
<div className="flex items-center justify-between mb-6 flex-wrap gap-3">
  {/* Search Input */}
  <div className="relative w-full sm:w-80">
    <input
      type="search"
      placeholder="Search by name, email, or mobile..."
      className="w-full pl-3 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-gray-900 bg-white shadow-sm"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
    />
  </div>

  {/* Filter Button (right-aligned) */}
  <button
    onClick={() => setFilters(prev => ({ ...prev, filterOpen: !prev.filterOpen }))}
    className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 px-4 py-3 rounded-xl shadow-sm transition-all"
  >
    <Filter className="w-5 h-5 text-blue-600" />
    <span className="text-blue-600 font-medium">Filter</span>
  </button>
</div>

        {/* Filter Panel */}
        {filters.filterOpen && (
          <div className="bg-white rounded-xl shadow-md p-5 mb-6 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              {/* Program */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Program</label>
                <div className="relative">
                  <div className="flex flex-wrap items-center gap-1 p-2 border border-gray-300 rounded-lg min-h-[40px] bg-white">
                    {filters.program.map(prog => (
                      <span
                        key={prog}
                        className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs"
                      >
                        {prog}
                        <button
                          onClick={() => removeProgram(prog)}
                          className="hover:bg-blue-200 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    <select
                      className="flex-1 bg-transparent outline-none text-sm min-w-[120px] appearance-none"
                      value=""
                      onChange={handleProgramChange}
                    >
                      <option value="" disabled>Select Program</option>
                      {programOptions
                        .filter(p => !filters.program.includes(p))
                        .map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Class */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Class</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  value={filters.classDataId[0] || ''}
                  onChange={(e) => {
                    setFilters(prev => ({
                      ...prev,
                      classDataId: e.target.value ? [e.target.value] : [],
                      gradeDivisionId: []
                    }));
                    resetPage();
                  }}
                  disabled={filters.program.length === 0}
                >
                  <option value="">Select Class</option>
                  {classOptions.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Division */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Division</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  value={filters.gradeDivisionId[0] || ''}
                  onChange={(e) => {
                    setFilters(prev => ({
                      ...prev,
                      gradeDivisionId: e.target.value ? [e.target.value] : []
                    }));
                    resetPage();
                  }}
                  disabled={!filters.classDataId.length}
                >
                  <option value="">Select Division</option>
                  {divisionOptions.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  value={filters.activeInactiveStatus}
                  onChange={(e) => {
                    setFilters(prev => ({ ...prev, activeInactiveStatus: e.target.value }));
                    resetPage();
                  }}
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* === DESKTOP TABLE === */}
        <div className="hidden lg:block bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="table-header">
                <tr>
                  <th className="table-th">Name</th>
                  <th className="table-th">Contact</th>
                  <th className="table-th">Class</th>
                  <th className="table-th table-cell-center">Status</th>
                  <th className="table-th table-cell-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentEntries.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                          {student.gender === 'FEMALE' ? (
                            <svg className="w-6 h-6 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <User className="w-6 h-6 text-blue-600" />
                          )}
                        </div>
                        <div className="ml-3">
                          <p className="font-semibold text-gray-900">{student.name}</p>
                          <p className="text-xs text-gray-500">{student.grade} Division {student.division}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center text-gray-700">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          {student.email}
                        </div>
                        <div className="flex items-center text-gray-700">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          {student.mobile}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{student.className}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => toggleActive(student.id)}
                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-all ${student.active ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}
                      >
                        {student.active ? <ToggleRight className="w-4 h-4 mr-1" /> : <ToggleLeft className="w-4 h-4 mr-1" />}
                        {student.active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link to="/student/view-student">
                          <button className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition">
                            <Eye className="w-4 h-4" />
                          </button>
                        </Link>
                        <Link to="/student/edit-student">
                          <button className="p-2 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition">
                            <Edit className="w-4 h-4" />
                          </button>
                        </Link>
                        <button onClick={() => handleDelete(student)} className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION BAR */}
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
                Showing {indexOfFirst + 1}–{Math.min(indexOfLast, totalEntries)} of {totalEntries} entries
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

        {/* === MOBILE CARDS === */}
        <div className="lg:hidden space-y-4">
          {currentEntries.map((student) => (
            <div key={student.id} className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition-all">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    {student.gender === 'FEMALE' ? (
                      <svg className="w-7 h-7 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <User className="w-7 h-7 text-blue-600" />
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="font-semibold text-gray-900">{student.name}</p>
                    <p className="text-sm text-gray-600">{student.grade} Division {student.division}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleActive(student.id)}
                  className={`flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium transition-all ${student.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                >
                  {student.active ? <ToggleRight className="w-3.5 h-3.5 mr-1" /> : <ToggleLeft className="w-3.5 h-3.5 mr-1" />}
                  {student.active ? 'Active' : 'Inactive'}
                </button>
              </div>

              <div className="space-y-2 text-sm text-gray-700 mb-4">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-gray-400" />
                  {student.email}
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-gray-400" />
                  {student.mobile}
                </div>
                <div className="text-gray-600">{student.className}</div>
              </div>

              <div className="flex justify-end gap-2">
                <Link to="/student/view-student">
                  <button className="p-2.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition">
                    <Eye className="w-4 h-4" />
                  </button>
                </Link>
                <Link to="/student/edit-student">
                  <button className="p-2.5 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition">
                    <Edit className="w-4 h-4" />
                  </button>
                </Link>
                <button onClick={() => handleDelete(student)} className="p-2.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
            {/* Pagination (Mobile) */}
          {totalEntries > 0 && (
            <div className="flex justify-between items-center mt-6">
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
        {totalEntries === 0 && (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <User className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-600">No students found matching your filters.</p>
          </div>
        )}

        {/* Delete Confirmation */}
        {showDeleteAlert && (
          <SweetAlert
            warning
            showCancel
            confirmBtnText="Yes, delete it!"
            confirmBtnBsStyle="danger"
            cancelBtnBsStyle="default"
            title="Are you sure?"
            onConfirm={confirmDelete}
            onCancel={() => setShowDeleteAlert(false)}
          >
            Do you want to delete <strong>{studentToDelete?.name}</strong>?
          </SweetAlert>
        )}
      </div>
    </div>
  );
}