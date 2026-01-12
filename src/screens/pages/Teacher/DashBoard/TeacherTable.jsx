'use client';
import React from 'react';
import {
  Eye,
  Edit,
  Trash2,
  User,
  Mail,
  Phone,
  ToggleLeft,
  ToggleRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import studentActive from '@/_assets/images_new_design/sidebarIcon/studentActive.svg';

const TeacherTable = ({
  teachers,
  selectedTeacher,          // single ID (string | null)
  onTeacherSelect,          // (id: string) => void   (toggle)
  onToggleActive,
  onView,
  onEdit,
  onDelete,
  onShowIdCard,
  currentPage,
  entriesPerPage,
  onPageChange,
  loading = false,
  totalTeachers = 0,
  totalPages = 0,
  statusChanging = {},
}) => {
  // Convert 0-based API pagination to 1-based UI pagination
  const displayPage = currentPage + 1;
  const indexOfFirst = currentPage * entriesPerPage;
  const indexOfLast = Math.min(indexOfFirst + entriesPerPage, totalTeachers);

  const handlePrev = () => displayPage > 1 && onPageChange(displayPage - 1);
  const handleNext = () => displayPage < totalPages && onPageChange(displayPage + 1);

  return (
    <>
      {/* ────────────────────── Desktop Table ────────────────────── */}
      <div className="hidden lg:block bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="table-header">
              <tr>
                {/* Header checkbox REMOVED */}
                <th className="table-th w-12"></th>
                <th className="table-th">Teacher</th>
                <th className="table-th">Contact</th>
                <th className="table-th">Class</th>
                <th className="table-th table-cell-center">ID Card</th>
                <th className="table-th table-cell-center">Status</th>
                <th className="table-th table-cell-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="table-td text-center py-12">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                      <p className="text-gray-500">Loading teachers...</p>
                    </div>
                  </td>
                </tr>
              ) : teachers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="table-td text-center py-12">
                    <div className="text-gray-500">
                      <p className="text-lg font-medium mb-2">No teachers found</p>
                      <p className="text-sm">
                        No valid teachers found. Try adjusting the filters or contact support if the
                        issue persists.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                teachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-gray-50 transition-colors">
                    {/* Row checkbox – toggle single selection */}
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedTeacher === teacher.id}
                        onChange={() => onTeacherSelect(teacher.id)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                          {teacher.gender === 'FEMALE' ? (
                            <svg
                              className="w-6 h-6 text-pink-600"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ) : (
                            <User className="w-6 h-6 text-blue-600" />
                          )}
                        </div>
                        <div className="ml-3">
                          <p className="font-semibold text-gray-900">{teacher.name}</p>
                          <p className="text-xs text-gray-500">
                            {teacher.grade} Division {teacher.division}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center text-gray-700">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          {teacher.email}
                        </div>
                        <div className="flex items-center text-gray-700">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          {teacher.mobile}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-700">{teacher.className}</td>

                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => onShowIdCard(teacher)}
                        className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                        title="View ID Card"
                      >
                        <img src={studentActive} alt="ID Card" className="w-4 h-4" />
                      </button>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => onToggleActive(teacher.id)}
                        disabled={statusChanging[teacher.id]}
                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-all ${statusChanging[teacher.id]
                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                            : teacher.active
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                      >
                        {statusChanging[teacher.id] ? (
                          <>
                            <div className="w-4 h-4 mr-1 animate-spin border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
                            Updating...
                          </>
                        ) : (
                          <>
                            {teacher.active ? <ToggleRight className="w-4 h-4 mr-1" /> : <ToggleLeft className="w-4 h-4 mr-1" />}
                            {teacher.active ? 'Active' : 'Inactive'}
                          </>
                        )}
                      </button>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onView(teacher)}
                          className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEdit(teacher)}
                          className="p-2 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(teacher.id)}
                          className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ────────────────────── Pagination ────────────────────── */}
        {!loading && totalTeachers > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 border-t border-gray-200 gap-4">
            <div className="text-sm text-gray-600">
              Showing {indexOfFirst + 1}–{indexOfLast} of {totalTeachers} entries
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                disabled={displayPage === 1}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${displayPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
              >
                <ChevronLeft className="w-4 h-4" />
                &nbsp;Previous
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => onPageChange(page)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${displayPage === page
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                        }`}
                    >
                      {page}
                    </button>
                  );
                })}
                {totalPages > 5 && <span className="px-2 text-gray-400">...</span>}
              </div>

              <button
                onClick={handleNext}
                disabled={displayPage === totalPages}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${displayPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
              >
                Next&nbsp;
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ────────────────────── Mobile Cards ────────────────────── */}
      <div className="lg:hidden space-y-4">
        {loading ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-200">
            <div className="flex flex-col items-center justify-center">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500">Loading teachers...</p>
            </div>
          </div>
        ) : teachers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-200">
            <div className="text-gray-500">
              <p className="text-lg font-medium mb-2">No teachers found</p>
              <p className="text-sm">
                No valid teachers found. Try adjusting the filters or contact support if the issue
                persists.
              </p>
            </div>
          </div>
        ) : (
          teachers.map((teacher) => (
            <div
              key={teacher.id}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition-all"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center">
                  {/* Mobile checkbox – toggle single selection */}
                  <input
                    type="checkbox"
                    checked={selectedTeacher === teacher.id}
                    onChange={() => onTeacherSelect(teacher.id)}
                    className="w-4 h-4 mr-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    {teacher.gender === 'FEMALE' ? (
                      <svg
                        className="w-7 h-7 text-pink-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <User className="w-7 h-7 text-blue-600" />
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="font-semibold text-gray-900">{teacher.name}</p>
                    <p className="text-sm text-gray-600">
                      {teacher.grade} Division {teacher.division}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onToggleActive(teacher.id)}
                  disabled={statusChanging[teacher.id]}
                  className={`flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium transition-all ${statusChanging[teacher.id]
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : teacher.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                >
                  {statusChanging[teacher.id] ? (
                    <>
                      <div className="w-3.5 h-3.5 mr-1 animate-spin border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      {teacher.active ? <ToggleRight className="w-3.5 h-3.5 mr-1" /> : <ToggleLeft className="w-3.5 h-3.5 mr-1" />}
                      {teacher.active ? 'Active' : 'Inactive'}
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-2 text-sm text-gray-700 mb-4">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-gray-400" />
                  {teacher.email}
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-gray-400" />
                  {teacher.mobile}
                </div>
                <div className="text-gray-600">{teacher.className}</div>
              </div>

              <div className="flex justify-between items-center">
                <button
                  onClick={() => onShowIdCard(teacher)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-600 rounded-md text-xs font-medium hover:bg-blue-200 transition"
                >
                  <img src={studentActive} alt="ID Card" className="w-4 h-4" />
                  ID Card
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onView(teacher)}
                    className="p-2.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onEdit(teacher)}
                    className="p-2.5 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(teacher.id)}
                    className="p-2.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default TeacherTable;