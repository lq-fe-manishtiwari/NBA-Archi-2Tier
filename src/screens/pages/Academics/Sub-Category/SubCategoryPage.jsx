import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SweetAlert from "react-bootstrap-sweetalert";
import { Edit, Trash2 } from "lucide-react";

// Service
import { SubCategoryService } from "../Services/SubCategory.service";

import SearchBar from "../../../../Components/SearchBar";
import { useViewMode } from "../../../../contexts/ViewModeContext";

export default function SubCategoryPage() {
  const navigate = useNavigate();
  const { globalViewMode } = useViewMode();

  const [types, setTypes] = useState([]);
  const [filteredTypes, setFilteredTypes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [viewMode] = useState(globalViewMode);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [deleteAlert, setDeleteAlert] = useState({
    show: false,
    id: null,
    name: "",
  });

  const isFetchedRef = React.useRef(false);

  useEffect(() => {
    if (!isFetchedRef.current) {
      fetchSubCategories();
      isFetchedRef.current = true;
    }
  }, []);

  /* ---------------- FETCH ALL SUB CATEGORY ---------------- */
  const fetchSubCategories = () => {
    setLoading(true);

    SubCategoryService.getAllCollegeTypes()
      .then((res) => {
        const data = res || [];
        setTypes(data);
        setFilteredTypes(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching Sub Categories:", err);
        setError("Failed to fetch Sub Categories.");
        setLoading(false);
      });
  };

  /* ---------------- SEARCH FILTER ---------------- */
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredTypes(types);
    } else {
      const filtered = types.filter((item) =>
        item.type_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTypes(filtered);
    }
  }, [searchTerm, types]);

  const handleSearchChange = (val) => setSearchTerm(val);

  /* ---------------- DELETE HANDLERS ---------------- */
  const handleDeleteClick = (item) => {
    setDeleteAlert({
      show: true,
      id: item.id,
      name: item.type_name,
    });
  };

  const handleConfirmDelete = () => {
    SubCategoryService.deleteCollegeType(deleteAlert.id)
      .then(() => {
        setTypes(types.filter((x) => x.id !== deleteAlert.id));
        setDeleteAlert({ show: false, id: null, name: "" });
      })
      .catch((err) => {
        console.error("Error deleting sub category:", err);
        setDeleteAlert({ show: false, id: null, name: "" });
      });
  };

  const handleCancelDelete = () => {
    setDeleteAlert({ show: false, id: null, name: "" });
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
        
        {/* Search */}
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          placeholder="Search Sub Category..."
          className="max-w-md"
        />

        {/* Add Button */}
        <button
          onClick={() => navigate("/academics/subcategory/add")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition w-full sm:w-auto text-center"
        >
          + Add Sub-Category
        </button>
      </div>

      {loading && <p>Loading Sub Categories...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Main List */}
      {!loading && !error && (
        <>
          {viewMode === "table" ? (
            /* ================= TABLE VIEW ================= */
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-primary-600">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                        Sub Category Name
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-50 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTypes.length > 0 ? (
                      filteredTypes.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.type_name}
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex justify-center gap-2">

                              {/* ================= EDIT BUTTON (TABLE VIEW) ================= */}
                              <button
                                className="p-2 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition"
                                onClick={() =>
                                  navigate(`/academics/subcategory/edit/${item.id}`)
                                }
                              >
                                <Edit className="w-4 h-4" />
                              </button>

                              {/* DELETE */}
                              <button
                                className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                                onClick={() => handleDeleteClick(item)}
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
                          {searchTerm
                            ? `No Sub Categories match "${searchTerm}"`
                            : "No Sub Categories found. Please add one."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* ================= CARD VIEW ================= */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTypes.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500">
                    {searchTerm
                      ? `No results for "${searchTerm}"`
                      : "No Sub Categories found."}
                  </p>
                </div>
              ) : (
                filteredTypes.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white shadow-md rounded-lg p-4 border border-gray-200 hover:shadow-lg transition flex flex-col justify-between"
                  >
                    <h3 className="text-lg font-semibold text-gray-800">
                      {item.type_name}
                    </h3>

                    <div className="mt-4 flex justify-end gap-2">

                      {/* ================= EDIT BUTTON (CARD VIEW) ================= */}
                      <button
                        className="p-2.5 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition"
                        onClick={() =>
                          navigate(`/academics/subcategory/edit/${item.id}`)
                        }
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      {/* DELETE */}
                      <button
                        className="p-2.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                        onClick={() => handleDeleteClick(item)}
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

      {/* DELETE CONFIRMATION */}
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
