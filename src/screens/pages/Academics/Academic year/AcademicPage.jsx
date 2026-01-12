import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SweetAlert from "react-bootstrap-sweetalert";
import { Edit, Trash2 } from "lucide-react";
import SearchBar from "../../../../Components/SearchBar";
import { AcademicService } from "../Services/Academic.service";

export default function AcademicPage() {
  const navigate = useNavigate();
  const hasFetched = useRef(false); // API call को track करने के लिए

  const [academicYears, setAcademicYears] = useState([]);
  const [filteredYears, setFilteredYears] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState(null);

  const [deleteAlert, setDeleteAlert] = useState({
    show: false,
    id: null,
    name: "",
  });

  // Fetch academic years function
  const fetchAcademicYears = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await AcademicService.getAcademic();
      const sortedData = (response || []).slice().sort(
      (a, b) => b.id - a.id // ✅ latest first
    );
      setAcademicYears(sortedData);
      setFilteredYears(sortedData);
    } catch (err) {
      console.error("Failed to fetch academic years:", err);
      setError("Failed to load academic years. Please try again.");
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  fetchAcademicYears();
}, []);

useEffect(() => {
  let data = [...academicYears].sort((a, b) => b.id - a.id);

  if (!searchTerm.trim()) {
    setFilteredYears(data);
  } else {
    const filtered = data.filter((year) =>
      year.year.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredYears(filtered);
  }
}, [searchTerm, academicYears]);

  const handleSearchChange = (value) => setSearchTerm(value);

  const handleDeleteClick = (year) => {
    setDeleteAlert({ show: true, id: year.id, name: year.year });
  };

  const handleConfirmDelete = async () => {
    try {
      await AcademicService.deleteAcademic(deleteAlert.id);
      // Remove from local state
      setAcademicYears((prev) => prev.filter((y) => y.id !== deleteAlert.id));
      setDeleteAlert({ show: false, id: null, name: "" });
       setAlert(
              <SweetAlert
                success
                title="Deleted!"
                onConfirm={() => setAlert(null)}
                confirmBtnCssClass="btn-confirm"
              >
                {`Academic Year has been deleted successfully.`}
              </SweetAlert>
            );
    } catch (err) {
      console.error("Failed to delete academic year:", err);
      setError("Failed to delete academic year. Please try again.");
      setDeleteAlert({ show: false, id: null, name: "" });
      setAlert(
              <SweetAlert
                danger
                title="Error"
                onConfirm={() => setAlert(null)}
                confirmBtnCssClass="btn-confirm"
              >
                {"Failed to delete college. Please try again."}
              </SweetAlert>
            );
    }
  };

  const handleCancelDelete = () => {
    setDeleteAlert({ show: false, id: null, name: "" });
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-IN");
    } catch {
      return "Invalid Date";
    }
  };

  return (
    <div className="p-0">
      {alert}
      {/* Header with Search + Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
        <div>
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            placeholder="Search academic years..."
            className="max-w-md"
          />
        </div>

        <button
          onClick={() => navigate("/academics/academicyear/add")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition w-full sm:w-auto text-center"
        >
          + Add Academic Year
        </button>
      </div>

      {/* Loading & Error */}
      {loading && (
        <div className="text-center py-8">
          <div className="flex justify-center items-center">
            <svg className="animate-spin h-6 w-6 text-blue-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-gray-600">Loading academic years...</span>
          </div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-600 text-center">{error}</p>
          <button
            onClick={fetchAcademicYears}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition mx-auto block"
          >
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                    Academic Year
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                    Start Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                    End Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-50 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredYears.length > 0 ? (
                  filteredYears.map((year) => (
                    <tr key={year.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {year.year}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(year.start_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(year.end_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          year.active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {year.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => navigate(`/academics/academicyear/edit/${year.id}`)}
                            className="p-2 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(year)}
                            className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      {searchTerm
                        ? `No academic years found matching "${searchTerm}"`
                        : "No academic years found. Please add a new one."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteAlert.show && (
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
          Do you want to Delete <strong>{deleteAlert.name}</strong>?
        </SweetAlert>
      )}
    </div>
  );
}