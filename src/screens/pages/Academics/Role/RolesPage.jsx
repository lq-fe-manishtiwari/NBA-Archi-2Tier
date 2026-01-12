import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SweetAlert from "react-bootstrap-sweetalert";
import { Edit, Trash2 } from 'lucide-react';
import { RoleService } from "../Services/Role.service";
import SearchBar from "../../../../Components/SearchBar";
import ViewToggle from "../Components/ViewToggle";
import { useViewMode } from "../../../../contexts/ViewModeContext";

export default function RolesPage() {
  const navigate = useNavigate();
  const [divisions, setDivisions] = useState([]);
  const [filteredDivisions, setFilteredDivisions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { globalViewMode } = useViewMode();

  const [viewMode, setViewMode] = useState(globalViewMode); // Default to table view
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState(null);

  const [deleteAlert, setDeleteAlert] = useState({ show: false, id: null, name: '' });

  const isFetchedRef = React.useRef(false);

  useEffect(() => {
    if (!isFetchedRef.current) {
      fetchDivisions();
      isFetchedRef.current = true;
    }
  }, []);

  const fetchDivisions = () => {
    setLoading(true);
    RoleService.getRole()
      .then(response => {
        console.log("response", response);
        // const divisionData = response || [];
        const divisionData = (response || []).slice().sort(
          (a, b) => b.role_id - a.role_id // newest first
        );
        setDivisions(divisionData);
        setFilteredDivisions(divisionData);
        setLoading(false);
      })
      .catch(err => {
        setError("Failed to fetch divisions.");
        setLoading(false);
        console.error("Error fetching divisions:", err);
      });
  };

  // Filter divisions based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredDivisions(divisions);
    } else {
      const filtered = divisions.filter((role) =>
        role.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredDivisions(filtered);
    }
  }, [searchTerm, divisions]);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  const handleViewChange = (mode) => {
    setViewMode(mode);
  };

  const handleDeleteClick = (div) => {
    setDeleteAlert({ show: true, id: div.role_id, name: div.name });
  };

  const handleConfirmDelete = () => {
    RoleService.deleteRole(deleteAlert.id)
      .then(() => {
        setDivisions(divisions.filter((d) => d.role_id !== deleteAlert.id));
        setDeleteAlert({ show: false, id: null, name: '' });
        setAlert(
          <SweetAlert
            success
            title="Deleted!"
            onConfirm={() => setAlert(null)}
            confirmBtnCssClass="btn-confirm"
          >
            {`Role has been deleted successfully.`}
          </SweetAlert>
        );
      })
      .catch(err => {
        console.error("Error deleting division:", err);
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">

        {/* Search Bar */}
        <div>
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            placeholder="Search roles..."
            className="max-w-md"
          />
        </div>
        <button
          onClick={() => navigate("/academics/role/add")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition w-full sm:w-auto text-center"
        >
          + Add New Role
        </button>
      </div>



      {loading && <p>Loading roles...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Table View */}
      {!loading && !error && (
        <>
          {viewMode === "table" ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-primary-600">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                        Role Name
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-50 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredDivisions.length > 0 ? (
                      filteredDivisions.map((div) => (
                        <tr key={div.role_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {div.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex justify-center gap-2">
                              <button
                                className="p-2 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition"
                                onClick={() => navigate(`/academics/role/edit/${div.role_id}`)}
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(div)}
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
                        <td colSpan="2" className="px-6 py-8 text-center text-gray-500">
                          {searchTerm ? `No divisions found matching "${searchTerm}"` : "No divisions found. Please add a new one."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Card View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDivisions.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500">
                    {searchTerm ? `No divisions found matching "${searchTerm}"` : "No divisions found. Please add a new one."}
                  </p>
                </div>
              ) : (
                filteredDivisions.map((div) => (
                  <div
                    key={div.role_id}
                    className="bg-white shadow-md rounded-lg p-4 border border-gray-200 hover:shadow-lg transition flex flex-col justify-between"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{div.name}</h3>
                    </div>

                    <div className="mt-4 flex justify-end gap-2">
                      <button className="p-2.5 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition"
                        onClick={() => navigate(`/academics/role/edit/${div.role_id}`)}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(div)}
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
        </>
      )}

      {/* SweetAlert Confirmation */}
      {deleteAlert.show && (
        <SweetAlert
          warning
          showCancel
          confirmBtnCssClass="btn-confirm"
          cancelBtnCssClass="btn-cancel"
          title="Are you sure?"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        >
          Do you want to delete <strong>{deleteAlert.name}</strong>?
        </SweetAlert>
      )}
    </div>
  );
}