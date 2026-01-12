import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SweetAlert from "react-bootstrap-sweetalert";
import { Plus, Eye, Edit, Trash2, User, Mail, Phone, ToggleLeft, ToggleRight } from 'lucide-react';
import BulkUploadClass from "./BulkUploadClass";
import { classService } from "../Services/class.service";
import { useApiErrorHandler } from "../../../../_helpers/useApiErrorHandler";
import ErrorAlert from "../../../../Components/ErrorAlert";
import SearchBar from "../../../../Components/SearchBar";
import ViewToggle from "../Components/ViewToggle";
import  {useViewMode}  from "../../../../contexts/ViewModeContext";

export default function ClassPage() {
  const navigate = useNavigate();
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { globalViewMode } = useViewMode();
  const [viewMode, setViewMode] = useState(globalViewMode);
  const [loading, setLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [alert, setAlert] = useState(null);
  const [error, setError] = useState(null);


  const isFetchedRef = React.useRef(false);

  useEffect(() => {

    if (!isFetchedRef.current) {
      fetchClasses();
      isFetchedRef.current = true;
    }
  }, []); // ✅ ensures it runs only once

  // Update local viewMode when global changes
  useEffect(() => {
    setViewMode(globalViewMode);
  }, [globalViewMode]);

  const handleError = useApiErrorHandler();

  const fetchClasses = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await classService.getAllClasses();
      setClasses(data);
      setFilteredClasses(data);
    } catch (error) {
      setError(handleError(error));
    }
    finally {
      setLoading(false);
    }
  };

  // Filter classes based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredClasses(classes);
    } else {
      const filtered = classes.filter((cls) =>
        (cls.name || cls.class_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cls.year_number && cls.year_number.toString().includes(searchTerm)) ||
        (cls.semesters && cls.semesters.some(sem =>
          sem.name.toLowerCase().includes(searchTerm.toLowerCase())
        ))
      );
      setFilteredClasses(filtered);
    }
  }, [searchTerm, classes]);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  const handleViewChange = (mode) => {
    setViewMode(mode);
  };


  const handleDeleteClick = (cls) => {
    setSelectedClass(cls);
    setShowAlert(true);
  };

  const handleConfirmDelete = async () => {
    console.log("selectedClass", selectedClass);
    try {
      await classService.deleteClassbyID(selectedClass.class_year_id);
      setClasses((prev) => prev.filter((c) => c.class_year_id !== selectedClass.class_year_id));
      setShowAlert(false);
      setAlert(
        <SweetAlert
          success
          title="Deleted!"
          onConfirm={() => setAlert(null)}
          confirmBtnCssClass="btn-confirm"
        >
          Class has been deleted successfully.
        </SweetAlert>
      );
    } catch (error) {
      console.error("Failed to delete class:", error);
      setShowAlert(false);
    }
  };

  const handleBulkUploadSuccess = () => {
    setShowBulkModal(false);
    fetchClasses(); // Refresh the class list
    setAlert(
      <SweetAlert
        success
        title="Success!"
        onConfirm={() => setAlert(null)}
        confirmBtnCssClass="btn-confirm"
      >
        Classes have been uploaded successfully.
      </SweetAlert>
    );
  };


  const handleCancelDelete = () => {
    setShowAlert(false);
  };

  return (
    <div className="p-0">
      {error ? (
        <ErrorAlert message={error || "Server Down...please try again in sometime"} />
      ) : (
        <>
          {/* ✅ Normal page content if no error */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
            <p >
              <SearchBar
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
              placeholder="Search classes..."
              className="max-w-md"
            />
            </p>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <button
                onClick={() => navigate("/academics/class/add")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition w-full sm:w-auto text-center"
              >
                + Add New Class
              </button>

              <button
                onClick={() => setShowBulkModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition w-full sm:w-auto text-center"
              >
                + Bulk Upload
              </button>
            </div>
          </div>

          {loading ? (
            <p className="text-center text-gray-500">Loading classes...</p>
          ) : (
            <>
              {/* Table View */}
              {viewMode === "table" ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-primary-600">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                            Class Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                            Year
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                            Semesters
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-50 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredClasses.length > 0 ? (
                          filteredClasses.map((cls) => (
                            <tr key={cls.class_year_id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {cls.name || cls.class_name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {cls.year_number || "—"}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                <div className="flex flex-wrap gap-1">
                                  {cls.semesters && cls.semesters.length > 0 ? (
                                    cls.semesters.map((sem, i) => (
                                      <span
                                        key={i}
                                        className="inline-block px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full"
                                      >
                                        {sem.name}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-gray-400">No semesters</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                <div className="flex justify-center gap-2">
                                  <button
                                    className="p-2 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition"
                                    onClick={() =>
                                      navigate(`/academics/class/edit/${cls.class_year_id}`)
                                    }
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteClick(cls)}
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
                            <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                              {searchTerm ? `No classes found matching "${searchTerm}"` : "No classes found."}
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
                  {filteredClasses.length > 0 ? (
                    filteredClasses.map((cls) => (
                      <div
                        key={cls.class_year_id}
                        className="bg-white shadow-md rounded-lg p-4 border border-gray-200 hover:shadow-lg transition flex flex-col justify-between"
                      >
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            {cls.name || cls.class_name}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Year: {cls.year_number || "—"}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {cls.semesters && cls.semesters.length > 0 ? (
                              cls.semesters.map((sem, i) => (
                                <span
                                  key={i}
                                  className="inline-block px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full"
                                >
                                  {sem.name}
                                </span>
                              ))
                            ) : (
                              <span className="text-sm text-gray-500">
                                No semesters added
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 flex justify-end gap-2">
                          <button
                            className="p-2.5 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition"
                            onClick={() =>
                              navigate(`/academics/class/edit/${cls.class_year_id}`)
                            }
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteClick(cls)}
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
                        {searchTerm ? `No classes found matching "${searchTerm}"` : "No classes found."}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {showAlert && selectedClass && (
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
              Are you want to Delete {selectedClass.name}?
            </SweetAlert>
          )}

          {showBulkModal && (
            <BulkUploadClass
              onClose={() => setShowBulkModal(false)}
              onSuccess={handleBulkUploadSuccess}
            />
          )}
          {alert}
        </>
      )}
    </div>
  );

}
