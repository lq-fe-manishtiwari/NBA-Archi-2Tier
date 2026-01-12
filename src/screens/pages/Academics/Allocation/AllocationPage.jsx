import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Edit, Trash2, PlusCircle } from "lucide-react";
import SweetAlert from "react-bootstrap-sweetalert";
import { AdminGradeAllocationService } from "../Services/AdminGradeAllocation.service";
import SearchBar from "../../../../Components/SearchBar";

export default function AllocationPage() {
  const navigate = useNavigate();
  const [allocations, setAllocations] = useState([]);
  const [filteredAllocations, setFilteredAllocations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllocations = async () => {
      try {
        setLoading(true);
        const data = await AdminGradeAllocationService.getAllProgramUserAllocation();

        const formattedData = data.map(item => ({
          id: item.user_id, // Assuming 'userId' is the unique identifier for deletion/editing
           name: item.full_name || `${item.firstname} ${item.middlename || ""} ${item.lastname}`.trim(),
          program: item.program.program_name
        }));
        console.log("formattedData", formattedData);
        setAllocations(formattedData);
        setFilteredAllocations(formattedData);
      } catch (err) {
        console.error("Failed to fetch allocations", err);
        setError("Failed to load allocations. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchAllocations();
  }, []);

  // Filter allocations based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredAllocations(allocations);
    } else {
      const filtered = allocations.filter((allocation) =>
        allocation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        allocation.program.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredAllocations(filtered);
    }
  }, [searchTerm, allocations]);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  const handleDelete = (userId) => {
    const item = filteredAllocations.find(a => a.id === userId);
    setAlert(
      <SweetAlert
        warning
        showCancel
        confirmBtnText="Yes, delete!"
        cancelBtnText="Cancel"
        title="Are you sure?"
        onConfirm={() => confirmDelete(userId)}
        onCancel={() => setAlert(null)}
        confirmBtnCssClass="btn-confirm"
        cancelBtnCssClass="btn-cancel"
      >
        Delete allocation for <strong>{item?.name}</strong>?
      </SweetAlert>
    );
  };

  const confirmDelete = async (userId) => {
    try {
      await AdminGradeAllocationService.deleteProgramUserAllocationByUserID(userId);
      setAllocations(prev => prev.filter(a => a.id !== userId));
      setAlert(
        <SweetAlert success title="Deleted!"
          confirmBtnCssClass="btn-confirm"
          cancelBtnCssClass="btn-cancel"
          onConfirm={() => setAlert(null)}>
          Allocation removed successfully.
        </SweetAlert>
      );
    } catch (err) {
      console.error("Failed to delete allocation", err);
      setAlert(
        <SweetAlert error title="Error!"
          confirmBtnCssClass="btn-confirm"
          cancelBtnCssClass="btn-cancel"
          onConfirm={() => setAlert(null)}>
          Failed to delete allocation. Please try again.
        </SweetAlert>
      );
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      
            {/* Search Bar */}
      <div className="mb-6">
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          placeholder="Search allocations by name or program..."
          className="max-w-md"
        />
      </div>
        <button
          onClick={() => navigate("/academics/allocation/add")}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-3 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
        >
          <PlusCircle className="w-5 h-5" />
          <span className="hidden sm:inline">Add New</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>



      {/* Mobile Cards + Desktop Table */}
      <div className="space-y-4 sm:hidden">
        {filteredAllocations.length > 0 ? (
          filteredAllocations.map((alloc) => (
          <div
            key={alloc.id}
            className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-lg text-gray-900">{alloc.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{alloc.program}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/academics/allocation/edit/${alloc.id}`)}
                  className="p-2.5 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(alloc.id)}
                  className="p-2.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {searchTerm ? `No allocations found matching "${searchTerm}"` : "No allocations found"}
            </p>
          </div>
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden sm:block bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-header">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                  User Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                  Program
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAllocations.length > 0 ? (
                filteredAllocations.map((alloc) => (
                <tr key={alloc.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {alloc.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {alloc.program}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => navigate(`/academics/allocation/edit/${alloc.id}`)}
                        className="p-2.5 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition active:scale-95"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(alloc.id)}
                        className="p-2.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition active:scale-95"
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
                  <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                    {searchTerm ? `No allocations found matching "${searchTerm}"` : "No allocations found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {!loading && !error && allocations.length === 0 && !searchTerm && (
        <div className="text-center py-16">
          <div className="bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <Trash2 className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-xl text-gray-600">No allocations yet.</p>
          <p className="text-gray-500 mt-2">Click "Add New" to get started!</p>
        </div>
      )}
      {loading && <div className="text-center py-10">Loading...</div>}
      {error && <div className="text-center py-10 text-red-600">{error}</div>}

      {alert}
    </div>
  );
}