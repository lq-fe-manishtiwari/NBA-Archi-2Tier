import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SweetAlert from "react-bootstrap-sweetalert";
import { Edit, Trash2, Building } from 'lucide-react';
import { DepartmentService } from "../Services/Department.service";
import SearchBar from "../../../../Components/SearchBar";
import ViewToggle from "../Components/ViewToggle";
import  {useViewMode}  from "../../../../contexts/ViewModeContext";

export default function DepartmentPage() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { globalViewMode } = useViewMode();
  const [viewMode, setViewMode] = useState(globalViewMode);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteAlert, setDeleteAlert] = useState({ show: false, id: null, name: '' });
  const [alert, setAlert] = useState(null);

  const isFetchedRef = React.useRef(false);

  useEffect(() => {
    if (!isFetchedRef.current) {
      fetchDepartments();
      isFetchedRef.current = true;
    }
  }, []);

  // Update local viewMode when global changes
  useEffect(() => {
    setViewMode(globalViewMode);
  }, [globalViewMode]);

  const fetchDepartments = () => {
    setLoading(true);
    DepartmentService.getDepartment()
      .then(response => {
        const deptData = response || [];
        setDepartments(deptData);
        setFilteredDepartments(deptData);
        setLoading(false);
      })
      .catch(err => {
        setError("Failed to fetch departments.");
        setLoading(false);
        console.error("Error fetching departments:", err);
      });
  };

  // Filter departments based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredDepartments(departments);
    } else {
      const filtered = departments.filter((dept) =>
        dept.department_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (dept.college?.college_name && dept.college.college_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredDepartments(filtered);
    }
  }, [searchTerm, departments]);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  const handleViewChange = (mode) => {
    setViewMode(mode);
  };

  const handleDeleteClick = (dept) => {
    setDeleteAlert({ show: true, id: dept.department_id, name: dept.department_name });
  };

  const handleConfirmDelete = () => {
    DepartmentService.deleteDepartment(deleteAlert.id)
      .then(() => {
        setDepartments(departments.filter((d) => d.department_id !== deleteAlert.id));
        setDeleteAlert({ show: false, id: null, name: '' });
        setAlert(
                <SweetAlert
                  success
                  title="Deleted!"
                  onConfirm={() => setAlert(null)}
                  confirmBtnCssClass="btn-confirm"
                >
                  {`Department has been deleted successfully.`}
                </SweetAlert>
                 );
      })
      .catch(err => {
        console.error("Error deleting department:", err);
        setDeleteAlert({ show: false, id: null, name: '' });
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
      });
  };

  const handleCancelDelete = () => {
    setDeleteAlert({ show: false, id: null, name: '' });
  };

  return (
    <div className="p-0">
      {alert}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
        {/* Search Bar */}
        <div>
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            placeholder="Search departments..."
            className="max-w-md"
          />
        </div>
        <button
          onClick={() => navigate("/academics/department/add")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition w-full sm:w-auto text-center"
        >
          + Add New Department
        </button>
      </div>



      {loading && <p>Loading departments...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDepartments.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">
                {searchTerm ? `No departments found matching "${searchTerm}"` : "No departments found. Please add a new one."}
              </p>
            </div>
          ) : (
            filteredDepartments.map((dept) => (
              <div
                key={dept.id}
                className="bg-white shadow-md rounded-lg p-4 border border-gray-200 hover:shadow-lg transition flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{dept.department_name}</h3>
                  <p className="flex items-center text-sm text-gray-500 mt-1">
                    <Building className="w-4 h-4 mr-2 text-gray-400" />
                    {dept.college?.college_name || 'N/A'}
                  </p>
                </div>

                <div className="mt-4 flex justify-end gap-2">
                  <button className="p-2.5 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition"
                    onClick={() => navigate(`/academics/department/edit/${dept.department_id}`)}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(dept)}
                    className="p-2.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {deleteAlert.show && (
        <SweetAlert warning showCancel confirmBtnCssClass="btn-confirm" cancelBtnCssClass="btn-cancel" title="Are you sure?" onConfirm={handleConfirmDelete} onCancel={handleCancelDelete}>
          Do you want to delete <strong>{deleteAlert.name}</strong>?
        </SweetAlert>
      )}
    </div>
  );
}