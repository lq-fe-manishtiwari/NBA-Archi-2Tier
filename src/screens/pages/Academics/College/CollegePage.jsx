import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SweetAlert from "react-bootstrap-sweetalert";
import { Edit, Trash2 } from "lucide-react";
import { collegeService } from "../Services/college.service";
import { useApiErrorHandler } from "../../../../_helpers/useApiErrorHandler";
import ErrorAlert from "../../../../Components/ErrorAlert";
import SearchBar from "../../../../Components/SearchBar";
import ViewToggle from "../Components/ViewToggle";
import  {useViewMode}  from "../../../../contexts/ViewModeContext";
import {useColleges} from "../../../../contexts/CollegeContext";


export default function CollegePage() {
  const navigate = useNavigate();
  const { globalViewMode } = useViewMode();
  const [viewMode, setViewMode] = useState(globalViewMode);

  // ✅ Use context instead of local API calls
  const { colleges, loading, error,refreshColleges  } = useColleges();

  const [filteredColleges, setFilteredColleges] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alert, setAlert] = useState(null);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [activeCollege, setActiveCollege] = useState(() => {
    const stored = localStorage.getItem("activeCollege");
    return stored ? JSON.parse(stored) : null;
  });

  const handleError = useApiErrorHandler();
  const isFetchedRef = useRef(false);

  // ✅ Fetch colleges via context once
 useEffect(() => {
  if (!isFetchedRef.current) {
    isFetchedRef.current = true;
    refreshColleges();
    console.log("🟢 CollegePage - Fetched colleges via context");
  }
}, []);


  // ✅ Update filtered list when colleges or search term changes
  useEffect(() => {
     let data = [...colleges];
      // ✅ Sort newest first
    data.sort((a, b) => b.id - a.id);

    if (!searchTerm.trim()) {
      setFilteredColleges(data);
    } else {
      const filtered = data.filter((college) =>
        [college.college_name, college.college_code, college.college_email, college.college_type]
          .some((field) => field?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredColleges(filtered);
    }
  }, [searchTerm, colleges]);

  // ✅ Keep local view mode synced with global
  useEffect(() => {
    setViewMode(globalViewMode);
  }, [globalViewMode]);

  const handleSearchChange = (value) => setSearchTerm(value);

  const handleViewChange = (mode) => setViewMode(mode);

  // ✅ Handle setting an active college
  const handleSetActiveCollege = async (college) => {
    const activeData = { id: college.id, name: college.college_name };
    setActiveCollege(activeData);
    localStorage.setItem("activeCollege", JSON.stringify(activeData));

    try {
      const programs = await collegeService.getAllProgramByCollegeId(college.id);
      localStorage.setItem("college_programs", JSON.stringify(programs));
    } catch (err) {
      console.error("Failed to fetch college programs:", err);
      setAlert(
        <SweetAlert
          danger
          title="Error"
          onConfirm={() => setAlert(null)}
          confirmBtnCssClass="btn-confirm"
        >
          Failed to load programs for {college.college_name}. Please try again.
        </SweetAlert>
      );
    }
  };

  // ✅ Delete logic (remains same)
  const handleDeleteClick = (college) => {
    setSelectedCollege(college);
    setShowAlert(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await collegeService.deleteCollege(selectedCollege.id);
      await refreshColleges(); // refresh list
      setShowAlert(false);

      setAlert(
        <SweetAlert
          success
          title="Deleted!"
          onConfirm={() => setAlert(null)}
          confirmBtnCssClass="btn-confirm"
        >
          {`${selectedCollege.college_name} has been deleted successfully.`}
        </SweetAlert>
      );
    } catch (error) {
      setAlert(
        <SweetAlert
          danger
          title="Error"
          onConfirm={() => setAlert(null)}
          confirmBtnCssClass="btn-confirm"
        >
          {error.message || "Failed to delete college. Please try again."}
        </SweetAlert>
      );
    }
  };

  const handleCancelDelete = () => setShowAlert(false);

  // ✅ UI Loading/Error states
  if (loading) {
    return <div className="text-center py-10 text-gray-600">Loading colleges...</div>;
  }

  if (error) {
    return <ErrorAlert message={error || "Server Down...please try again later"} />;
  }

  return (
    <div className="p-0 md:p-0">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          placeholder="Search colleges..."
          className="max-w-md"
        />

        <button
          onClick={() => navigate("/academics/college/add")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition w-full sm:w-auto text-center"
        >
          + Add New College
        </button>
      </div>

      {/* View Toggle */}
      <div className="mb-4">
        <ViewToggle viewMode={viewMode} onViewChange={handleViewChange} />
      </div>

      {/* Table View */}
      {viewMode === "table" ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">College Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-50 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredColleges.length > 0 ? (
                  filteredColleges.map((college) => (
                    <tr key={college.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{college.college_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{college.college_code}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{college.college_email}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {college.institution_type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleSetActiveCollege(college)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                            activeCollege?.id === college.id
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {activeCollege?.id === college.id ? "Active" : "Set Active"}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            className="p-2 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition"
                            onClick={() => navigate(`/academics/college/edit/${college.id}`)}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(college)}
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
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      {searchTerm ? `No colleges found matching "${searchTerm}"` : "No colleges found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // Card View
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredColleges.length > 0 ? (
            filteredColleges.map((college) => (
              <div
                key={college.id}
                className="bg-white shadow-md rounded-lg p-4 border border-gray-200 hover:shadow-lg transition flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{college.college_name}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    <strong>Code:</strong> {college.college_code}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Email:</strong> {college.college_email}
                  </p>
                  <span className="inline-block mt-2 px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded">
                    {college.college_type}
                  </span>
                </div>

                <div className="mt-4 flex justify-between items-center">
                  <button
                    onClick={() => handleSetActiveCollege(college)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                      activeCollege?.id === college.id
                        ? "bg-green-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {activeCollege?.id === college.id ? "Active" : "Set Active"}
                  </button>

                  <div className="flex gap-2">
                    <button
                      className="p-2.5 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition"
                      onClick={() => navigate(`/academics/college/edit/${college.id}`)}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(college)}
                      className="p-2.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">
                {searchTerm ? `No colleges found matching "${searchTerm}"` : "No colleges found"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* SweetAlert */}
      {showAlert && selectedCollege && (
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
          Are you sure you want to delete {selectedCollege.name}?
        </SweetAlert>
      )}
      {alert}
    </div>
  );
}
