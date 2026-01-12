import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SweetAlert from "react-bootstrap-sweetalert";
import { Plus, Eye, Edit, Trash2, User, Mail, Phone, ToggleLeft, ToggleRight } from 'lucide-react';
import SearchBar from "../../../../Components/SearchBar";
import ViewToggle from "../Components/ViewToggle";
import  {useViewMode}  from "../../../../contexts/ViewModeContext";

export default function CoursePage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([
    {
      id: 1,
      name: "Business Analytics",
      type: "Core",
      vertical: "Management",
      code: "BA101",
      credits: 4,
      color: "#1D4ED8",
      mode: "Theory",
      specialization: "Data Science",
    },
    {
      id: 2,
      name: "Financial Accounting",
      type: "Elective",
      vertical: "Commerce",
      code: "FA202",
      credits: 3,
      color: "#047857",
      mode: "Practical",
      specialization: "",
    },
  ]);

  const [filteredCourses, setFilteredCourses] = useState(courses);
  const [searchTerm, setSearchTerm] = useState("");
  const { globalViewMode } = useViewMode();
  const [viewMode, setViewMode] = useState(globalViewMode);
  const [showAlert, setShowAlert] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Initialize filtered courses
  useEffect(() => {
    setFilteredCourses(courses);
  }, [courses]);

  // Update local viewMode when global changes
  useEffect(() => {
    setViewMode(globalViewMode);
  }, [globalViewMode]);

  // Filter courses based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCourses(courses);
    } else {
      const filtered = courses.filter((course) =>
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.vertical.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.mode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (course.specialization && course.specialization.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredCourses(filtered);
    }
  }, [searchTerm, courses]);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  const handleViewChange = (mode) => {
    setViewMode(mode);
  };

  const handleDeleteClick = (course) => {
    setSelectedCourse(course);
    setShowAlert(true);
  };

  const handleConfirmDelete = () => {
    setCourses(courses.filter((c) => c.id !== selectedCourse.id));
    setShowAlert(false);
  };

  const handleCancelDelete = () => setShowAlert(false);

  return (
    <div className="p-0 md:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">

      {/* Search Bar */}
      <div>
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          placeholder="Search courses..."
          className="max-w-md"
        />
      </div>
        <button
          onClick={() => navigate("/academics/course/add")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition w-full sm:w-auto text-center"
        >
          + Add New Course
        </button>
      </div>



      {/* Table View */}
      {viewMode === "table" ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                    Course Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                    Vertical
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                    Credits
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                    Mode
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-50 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCourses.length > 0 ? (
                  filteredCourses.map((course) => (
                    <tr key={course.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <div className="flex items-center">
                          <span
                            className="inline-block w-3 h-3 rounded-full mr-3"
                            style={{ backgroundColor: course.color }}
                          ></span>
                          {course.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {course.code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {course.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {course.vertical}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {course.credits}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {course.mode}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            className="p-2 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition"
                            onClick={() => navigate(`/academics/course/edit/${course.id}`)}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(course)}
                            className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      {searchTerm ? `No courses found matching "${searchTerm}"` : "No courses found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Card View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white shadow-md rounded-lg p-4 border border-gray-200 hover:shadow-lg transition flex flex-col justify-between"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{course.name}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  <strong>Code:</strong> {course.code}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Type:</strong> {course.type}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Vertical:</strong> {course.vertical}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Credits:</strong> {course.credits}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Mode:</strong> {course.mode}
                </p>
                {course.specialization && (
                  <p className="text-sm text-gray-600">
                    <strong>Specialization:</strong> {course.specialization}
                  </p>
                )}
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className="inline-block w-4 h-4 rounded-full border"
                    style={{ backgroundColor: course.color }}
                  ></span>
                  <span className="text-xs text-gray-600">Color Code</span>
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button className="p-2.5 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition"
                  onClick={() => navigate(`/academics/course/edit/${course.id}`)}
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteClick(course)}
                  className="p-2.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">
                {searchTerm ? `No courses found matching "${searchTerm}"` : "No courses found"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* SweetAlert */}
      {showAlert && selectedCourse && (
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
          Are you sure you want to delete {selectedCourse.name}?
        </SweetAlert>
      )}
    </div>
  );
}
