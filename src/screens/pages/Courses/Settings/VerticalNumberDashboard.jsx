import React, { useState, useEffect, useMemo } from "react";
import { Plus, Search, Trash2, Edit } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import SweetAlert from "react-bootstrap-sweetalert";
import { courseService } from "../Services/courses.service"; // API service

export default function VerticalNumberDashboard() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const navigate = useNavigate();

  const isFetchedRef = React.useRef(false);

  // ✅ Fetch all vertical numbers
  useEffect(() => {
    if (!isFetchedRef.current) {
      fetchVerticalNumbers();
      isFetchedRef.current = true;
    }
    
  }, []);

  const fetchVerticalNumbers = async () => {
    try {
      setLoading(true);
      const res = await courseService.getCoursesVerticalNumbers(); // example endpoint
      setData(res || []);
    } catch (err) {
      console.error("Error fetching vertical numbers:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Filter by search
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return data.filter(
      (d) =>
        d.code?.toLowerCase().includes(q) ||
        d.name?.toLowerCase().includes(q) ||
        d.description?.toLowerCase().includes(q)
    );
  }, [data, search]);

  // ✅ Delete confirmation
  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowDeleteAlert(true);
  };

  const confirmDelete = async () => {
    try {
      const res = await courseService.softDeleteVerticalNumber(deleteId);
      const text = await res.text(); // read raw response
      console.log("Delete Response:", text);

      if (res.ok) {
        // remove deleted record locally
        setData((prev) => prev.filter((d) => d.vertical_id !== deleteId));
        setShowSuccessAlert(true);
      } else {
        alert("Failed to delete. Server error.");
      }
    } catch (err) {
      console.error("Error deleting vertical number:", err);
      alert("Error deleting vertical number. Please try again.");
    } finally {
      setShowDeleteAlert(false);
      setDeleteId(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteAlert(false);
    setDeleteId(null);
  };

  // ✅ Edit handler
  const handleEdit = (id) => {
    navigate(`/courses/settings/edit/vertical-number/${id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* 🔍 Search + Add */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="search"
              placeholder="Search by code, name or description..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Link to="/courses/settings/add/vertical-number">
            <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md shadow-md">
              <Plus className="w-4 h-4" /> Add Vertical Number
            </button>
          </Link>
        </div>

        {/* 🧾 Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="text-center py-10 text-gray-500">Loading...</div>
          ) : (
            <table className="w-full min-w-[700px]">
              <thead className="table-header">
                <tr>
                  <th className="table-th">S.No</th>
                  <th className="table-th">Code</th>
                  <th className="table-th">Name</th>
                  <th className="table-th">Description</th>
                  <th className="table-th">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? (
                  filtered.map((item, index) => (
                    <tr key={item.vertical_id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-center">{index + 1}</td>
                      <td className="px-4 py-3">{item.code}</td>
                      <td className="px-4 py-3">{item.name}</td>
                      <td className="px-4 py-3">{item.description}</td>
                      <td className="px-4 py-3 flex justify-center gap-2">
                        {/* ✏️ Edit */}
                        <button
                          onClick={() => handleEdit(item.vertical_id)}
                          className="p-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition"
                        >
                          <Edit size={16} />
                        </button>

                        {/* 🗑 Delete */}
                        <button
                          onClick={() => handleDeleteClick(item.vertical_id)}
                          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-6 text-gray-500">
                      No records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* ⚠️ Delete Alert */}
        {showDeleteAlert && (
          <SweetAlert
            warning
            showCancel
            confirmBtnCssClass="btn-confirm"
            cancelBtnCssClass="btn-cancel"
            title="Are you sure?"
            onConfirm={confirmDelete}
            onCancel={cancelDelete}
          >
            Do you want to delete this vertical number?
          </SweetAlert>
        )}

        {/*  Success Alert */}
        {showSuccessAlert && (
          <SweetAlert
            success
            title="Deleted Successfully!"
            onConfirm={() => setShowSuccessAlert(false)}
            confirmBtnCssClass="btn-confirm"
          >
            Vertical number has been successfully deleted.
          </SweetAlert>
        )}
      </div>
    </div>
  );
}
